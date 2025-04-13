# MTVRP: Multi-task VRP environment

<a href="https://colab.research.google.com/github/ai4co/rl4co/blob/main/examples/other/1-mtvrp.ipynb"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"></a>


This environment can handle _any_ of the following variants:


| VRP Variant | Capacity (C) | Open Route (O) | Backhaul (B) | Duration Limit (L) | Time Window (TW) |
|-------------|--------------|----------------|--------------|--------------------|------------------|
| CVRP        | ✔            |                |              |                    |                  |
| OVRP        | ✔            | ✔              |              |                    |                  |
| VRPB        | ✔            |                | ✔            |                    |                  |
| VRPL        | ✔            |                |              | ✔                  |                  |
| VRPTW       | ✔            |                |              |                    | ✔                |
| OVRPTW      | ✔            | ✔              |              |                    | ✔                |
| OVRPB       | ✔            | ✔              | ✔            |                    |                  |
| OVRPL       | ✔            | ✔              |              | ✔                  |                  |
| VRPBL       | ✔            |                | ✔            | ✔                  |                  |
| VRPBTW      | ✔            |                | ✔            |                    | ✔                |
| VRPLTW      | ✔            |                |              | ✔                  | ✔                |
| OVRPBL      | ✔            | ✔              | ✔            | ✔                  |                  |
| OVRPBTW     | ✔            | ✔              | ✔            |                    | ✔                |
| OVRPLTW     | ✔            | ✔              |              | ✔                  | ✔                |
| VRPBLTW     | ✔            |                | ✔            | ✔                  | ✔                |
| OVRPBLTW    | ✔            | ✔              | ✔            | ✔                  | ✔                |


It is fully batched, meaning that _different variants can be in the same batch_ too!

%load_ext autoreload
%autoreload 2

from rl4co.envs.routing.mtvrp.env import MTVRPEnv
from rl4co.envs.routing.mtvrp.generator import MTVRPGenerator
Let's now generate some variants! By default, we can generate all variants with the `variants_preset` variable
# Single feat: generate a distribution of single-featured environments
generator = MTVRPGenerator(num_loc=50, variant_preset="all")
env = MTVRPEnv(generator, check_solution=False)

td_data = env.generator(8)
env.get_variant_names(td_data)
# Here is the list of presets and their probabilities of being generated (fully customizable)
env.print_presets()
We can change the preset to generate some specific variant, for instance the VRPB
# Change generator
generator = MTVRPGenerator(num_loc=50, variant_preset="vrpb")
env.generator = generator
td_data = env.generator(8)
env.get_variant_names(td_data)
## Greedy rollout and plot
import torch
from rl4co.utils.ops import gather_by_index


# Simple heuristics (nearest neighbor + capacity check)
def greedy_policy(td):
    """Select closest available action"""
    available_actions = td["action_mask"]
    # distances
    curr_node = td["current_node"]
    loc_cur = gather_by_index(td["locs"], curr_node)
    distances_next = torch.cdist(loc_cur[:, None, :], td["locs"], p=2.0).squeeze(1)

    distances_next[~available_actions.bool()] = float("inf")
    # do not select depot if some capacity is left
    distances_next[:, 0] = float("inf") * (
        td["used_capacity_linehaul"] < td["vehicle_capacity"]
    ).float().squeeze(-1)

    # # if sum of available actions is 0, select depot
    # distances_next[available_actions.sum(-1) == 0, 0] = 0
    action = torch.argmin(distances_next, dim=-1)
    td.set("action", action)
    return td


def rollout(env, td, policy=greedy_policy, max_steps: int = None):
    """Helper function to rollout a policy. Currently, TorchRL does not allow to step
    over envs when done with `env.rollout()`. We need this because for environments that complete at different steps.
    """

    max_steps = float("inf") if max_steps is None else max_steps
    actions = []
    steps = 0

    while not td["done"].all():
        td = policy(td)
        actions.append(td["action"])
        td = env.step(td)["next"]
        steps += 1
        if steps > max_steps:
            print("Max steps reached")
            break
    return torch.stack(actions, dim=1)
# NOTE: if we don't select ovrpbltw, the below does not work and there is still some
# minor bug in either masking or variant subselection

generator = MTVRPGenerator(num_loc=50, variant_preset="all")
env.generator = generator
td_data = env.generator(3)
variant_names = env.get_variant_names(td_data)

td = env.reset(td_data)

actions = rollout(env, td.clone(), greedy_policy)
rewards = env.get_reward(td, actions)

for idx in [0, 1, 2]:
    env.render(td[idx], actions[idx])
    print("Cost: ", - rewards[idx].item())
    print("Problem: ", variant_names[idx])

## Train MVMoE on Multiple Problems
from rl4co.utils.trainer import RL4COTrainer
from rl4co.models.zoo import MVMoE_POMO

device_id = 0
device = torch.device(f"cuda:{device_id}" if torch.cuda.is_available() else "cpu")
generator = MTVRPGenerator(num_loc=50, variant_preset="single_feat")
env = MTVRPEnv(generator, check_solution=False)
moe_kwargs = {"encoder": {"hidden_act": "ReLU", "num_experts": 4, "k": 2, "noisy_gating": True},
              "decoder": {"light_version": False, "num_experts": 4, "k": 2, "noisy_gating": True}}
model = MVMoE_POMO(
    env,
    moe_kwargs=moe_kwargs,
    batch_size=128,
    train_data_size=10000,  # each epoch,
    val_batch_size=100,
    val_data_size=1000,
    optimizer="Adam",
    optimizer_kwargs={"lr": 1e-4, "weight_decay": 1e-6},
    lr_scheduler="MultiStepLR",
    lr_scheduler_kwargs={"milestones": [451, ], "gamma": 0.1},
)

trainer = RL4COTrainer(
        max_epochs=3,
        accelerator="gpu",
        devices=[device_id],
        logger=None
    )

trainer.fit(model)
# Greedy rollouts over trained model (same states as previous plot)
policy = model.policy.to(device)
out = policy(td.to(device).clone(), env, phase="test", decode_type="greedy")
actions_mvmoe = out['actions'].cpu().detach()
rewards_mvmoe = out['reward'].cpu().detach()

for idx in [0, 1, 2]:
    env.render(td[idx], actions_mvmoe[idx])
    print("Cost: ", -rewards_mvmoe[idx].item())
    print("Problem: ", variant_names[idx])
## Getting gaps to classical solvers


We additionally offer an optional `solve` API to get solutions from classical solvers. We can use this to get the gaps to the optimal solutions.
# PyVRP - HGS
pyvrp_actions, pyvrp_costs = env.solve(td, max_runtime=5, num_procs=10, solver="pyvrp")
rewards_pyvrp = env.get_reward(td, pyvrp_actions)
def calculate_gap(cost, bks):   
    gaps = (cost - bks) / bks
    return gaps.mean() * 100

# Nearest insertion
actions = rollout(env, td.clone(), greedy_policy)
rewards_ni = env.get_reward(td, actions)

print(rewards_mvmoe, rewards_ni, rewards_pyvrp)   
print(f"Gap to HGS (NI): {calculate_gap(-rewards_ni, -rewards_pyvrp):.2f}%")
print(f"Gap to HGS (MVMoE): {calculate_gap(-rewards_mvmoe, -rewards_pyvrp):.2f}%")

With only two short epochs, we can already get better than NI!