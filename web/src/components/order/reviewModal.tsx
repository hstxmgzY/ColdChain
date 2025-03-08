import React from "react"
import { Modal, Descriptions, Form, Input, Button} from "antd"
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
    return (
        <Modal
            title={`订单审核 - ${order?.order_number}`}
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    关闭
                </Button>,
                <Button
                    key="submit"
                    type={type === "approve" ? "primary" : "default"}
                    danger={type === "reject"}
                    onClick={onSubmit}
                >
                    {type === "approve" ? "确认通过" : "提交驳回"}
                </Button>,
            ]}
            width={800}
            destroyOnClose
        >
            {order && (
                <div className="space-y-4">
                    <Descriptions bordered size="small">
                        <Descriptions.Item label="用户身份" span={3}>
                            {order.userType === "merchant" ? (
                                <>
                                    <div>企业名称：{order.companyName}</div>
                                    {/* 营业执照预览 */}
                                </>
                            ) : (
                                `个人用户（${order.userName}）`
                            )}
                        </Descriptions.Item>
                    </Descriptions>

                    <Descriptions bordered>
                        <Descriptions.Item label="配送路线" span={2}>
                            {order.route.join(" → ")}
                        </Descriptions.Item>
                    </Descriptions>

                    {type === "reject" && (
                        <Form.Item label="驳回原因" required>
                            <Input.TextArea
                                rows={3}
                                value={rejectReason}
                                onChange={(e) => onReasonChange(e.target.value)}
                                placeholder="请输入详细驳回理由（至少15字）"
                                showCount
                                maxLength={200}
                            />
                        </Form.Item>
                    )}
                </div>
            )}
        </Modal>
    )
}

export default ReviewModal
