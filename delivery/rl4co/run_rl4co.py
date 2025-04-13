import torch
from pdp_generator_rl4co import PDPGenerator
from pdp_env_rl4co import PDPEnv
from rl4co.utils.trainer import RL4COTrainer
from rl4co.models.zoo import MVMoE_POMO

def main():
    num_orders = 5
    batch_size = 128

    generator = PDPGenerator(num_orders=num_orders, coord_range=((0, 1), (0, 1)))
    data = generator(batch_size)

    # 初始化 PDPEnv 时传入生成器
    env = PDPEnv(vehicle_capacity=10, generator=generator)
    state = env.reset(data)

    moe_kwargs = {
        "encoder": {"hidden_act": "ReLU", "num_experts": 4, "k": 2, "noisy_gating": True},
        "decoder": {"light_version": False, "num_experts": 4, "k": 2, "noisy_gating": True}
    }
    model = MVMoE_POMO(
        env,
        moe_kwargs=moe_kwargs,
        batch_size=batch_size,
        train_data_size=10000,
        val_batch_size=100,
        val_data_size=1000,
        optimizer="Adam",
        optimizer_kwargs={"lr": 1e-4, "weight_decay": 1e-6},
        lr_scheduler="MultiStepLR",
        lr_scheduler_kwargs={"milestones": [9000], "gamma": 0.1},
        num_starts=2 
    )

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    trainer = RL4COTrainer(
        max_epochs=10,
        accelerator="cpu",  # 根据需要调整，如使用 gpu 则设置 accelerator="gpu"
        devices=1,
        precision="32",
        num_sanity_val_steps=0
    )

    print("Starting training...")
    trainer.fit(model)

    policy = model.policy.to(device)
    out = policy(state.to(device).clone(), env, phase="test", decode_type="greedy")
    actions = out["actions"].cpu().detach()
    rewards = out["reward"].cpu().detach()

    print("Evaluation results:")
    env.render(state)
    print("Greedy rollout average reward (negative total distance):", -rewards.mean().item())

if __name__ == "__main__":
    main()
