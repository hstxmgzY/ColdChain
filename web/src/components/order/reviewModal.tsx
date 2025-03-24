import React from "react"
import {
    Modal,
    Descriptions,
    Form,
    Input,
    Button,
    Steps,
    theme,
    Divider,
} from "antd"
import {
    IdcardOutlined,
    ShopOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
    ArrowRightOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons"
import { ReviewOrderType } from "../../interface/order/review"

interface ReviewModalProps {
    visible: boolean
    order: ReviewOrderType | null
    type: "approve" | "reject"
    rejectReason: string
    onCancel: () => void
    onReasonChange: (value: string) => void
    onSubmit: () => void
}

const ReviewModal: React.FC<ReviewModalProps> = ({
    visible,
    order,
    type,
    rejectReason,
    onCancel,
    onReasonChange,
    onSubmit,
}) => {
    const { token } = theme.useToken()
    const [form] = Form.useForm()

    const isValid = type === "approve" || rejectReason.length >= 15

    const titleContent = (
        <div className="flex items-center gap-2">
            {type === "approve" ? (
                <CheckCircleOutlined
                    style={{ color: token.colorSuccess, fontSize: 20 }}
                />
            ) : (
                <CloseCircleOutlined
                    style={{ color: token.colorError, fontSize: 20 }}
                />
            )}
            <span>
                订单审核 -
                <span className="ml-1 font-medium text-gray-800">
                    {order?.order_number}
                </span>
            </span>
        </div>
    )

    return (
        <Modal
            title={titleContent}
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button
                    key="cancel"
                    onClick={onCancel}
                    className="px-6 hover:scale-105 transition-transform"
                >
                    关闭
                </Button>,
                <Button
                    key="submit"
                    type={type === "approve" ? "primary" : "default"}
                    danger={type === "reject"}
                    onClick={onSubmit}
                    className="px-6 hover:scale-105 transition-transform"
                    disabled={!isValid}
                    icon={
                        type === "approve" ? (
                            <CheckCircleOutlined />
                        ) : (
                            <CloseCircleOutlined />
                        )
                    }
                >
                    {type === "approve" ? "确认通过" : "提交驳回"}
                </Button>,
            ]}
            width={800}
            destroyOnClose
            bodyStyle={{ padding: "24px 32px" }}
        >
            {order && (
                <div className="space-y-12">
                    {/* 用户信息区块 */}
                    <div className="p-4 rounded-lg mb-14">
                        <div className="flex items-center gap-3">
                            {order.userType === "merchant" ? (
                                <>
                                    <ShopOutlined className="text-xl text-primary" />
                                    <span className="text-base font-medium">
                                        企业用户
                                    </span>
                                </>
                            ) : (
                                <>
                                    <IdcardOutlined className="text-xl text-primary" />
                                    <span className="text-base font-medium">
                                        个人用户
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="h-3"> </div>
                        <Descriptions
                            bordered
                            size="small"
                            column={2}
                            labelStyle={{
                                width: 100,
                                background: token.colorFillAlter,
                            }}
                        >
                            {order.userType === "merchant" ? (
                                <>
                                    <Descriptions.Item label="企业名称">
                                        <span className="text-gray-800">
                                            {order.companyName}
                                        </span>
                                    </Descriptions.Item>
                                </>
                            ) : (
                                <Descriptions.Item label="用户姓名">
                                    <span className="text-gray-800">
                                        {order.userName}
                                    </span>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </div>

                    <div className="h-4"> </div>

                    {/* 配送路线区块 */}
                    <div className="p-4 rounded-lg">
                        <Steps
                            progressDot
                            current={0}
                            items={order.route.map((point, index) => ({
                                title: (
                                    <div className="flex items-center flex-col gap-2">
                                        <div className="w-5 flex justify-center">
                                            <EnvironmentOutlined className="text-sm" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">
                                                {point}
                                            </div>
                                        </div>
                                    </div>
                                ),
                                description:
                                    index === 0
                                        ? "始发地"
                                        : index === order.route.length - 1
                                          ? "终点地"
                                          : "",
                            }))}
                        />
                    </div>

                    {/* 驳回原因输入 */}

                    {type === "reject" && (
                        <>
                            <Divider />
                            <Form form={form} layout="vertical">
                                <Form.Item
                                    label={
                                        <span className="font-medium">
                                            驳回原因
                                            <span className="text-gray-500 text-sm ml-2">
                                                （至少15字）
                                            </span>
                                        </span>
                                    }
                                    required
                                    validateStatus={
                                        rejectReason.length < 15 ? "error" : ""
                                    }
                                    help={
                                        rejectReason.length < 15 &&
                                        "请填写详细驳回原因（15字以上）"
                                    }
                                >
                                    <Input.TextArea
                                        rows={3}
                                        value={rejectReason}
                                        onChange={(e) =>
                                            onReasonChange(e.target.value)
                                        }
                                        placeholder="请输入详细驳回理由，例如：证件信息不清晰、缺少必要材料等..."
                                        showCount
                                        maxLength={200}
                                        style={{ resize: "none" }}
                                        className={`hover:border-blue-300 focus:border-blue-400 ${
                                            rejectReason.length < 15
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />
                                </Form.Item>
                            </Form>
                        </>
                    )}
                </div>
            )}
        </Modal>
    )
}

export default ReviewModal
