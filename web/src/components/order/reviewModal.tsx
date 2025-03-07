import React, { useState, useEffect } from "react"
import {
    Table,
    Button,
    Tag,
    Modal,
    Descriptions,
    Form,
    Input,
    message,
    Alert,
} from "antd"
import type { TableProps } from "antd"
import {
    getAuditList,
    approveOrder,
    rejectOrder,
} from "../../api/modules/order/review.ts"
import { ReviewOrderType } from "../../interface/order/review"
import { createStyles } from "antd-style"
import { ColdModuleType } from "../../interface/resource/coldModule.ts"
import LeaseDetailTable from "./leaseDetailTable.tsx"

const reviewModal: React.FC = () => {
    return (
        <>
            <Modal
                title={`订单审核 - ${selectedOrder?.order_number}`}
                open={!!selectedOrder}
                onCancel={() => setSelectedOrder(null)}
                footer={[
                    <Button key="cancel" onClick={() => setSelectedOrder(null)}>
                        关闭
                    </Button>,
                    <Button
                        key="submit"
                        type={modalType === "approve" ? "primary" : "default"}
                        danger={modalType === "reject"}
                        onClick={handleAudit}
                    >
                        {modalType === "approve" ? "确认通过" : "提交驳回"}
                    </Button>,
                ]}
                width={800}
            >
                {selectedOrder && (
                    <div className="space-y-4">
                        {/* 用户资质区块 */}
                        <Descriptions bordered size="small">
                            <Descriptions.Item label="用户身份" span={3}>
                                {selectedOrder.userType === "merchant" ? (
                                    <>
                                        <div>
                                            企业名称：
                                            {selectedOrder.companyName}
                                        </div>
                                        {/* <div className="mt-2">
                                            <span className="mr-2">
                                                营业执照：
                                            </span>
                                            <Image
                                                width={120}
                                                src={selectedOrder.licenseUrl}
                                                className={
                                                    styles.licensePreview
                                                }
                                                preview={{
                                                    src: selectedOrder.licenseUrl,
                                                }}
                                            />
                                        </div> */}
                                    </>
                                ) : (
                                    `个人用户（${selectedOrder.userName}）`
                                )}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* 订单详情区块 */}
                        <Descriptions bordered>
                            <Descriptions.Item label="配送路线" span={2}>
                                {selectedOrder.route.join(" → ")}
                            </Descriptions.Item>
                            {/* <Descriptions.Item label="温控要求">
                                <Tag color="#87d068">
                                    {selectedOrder.temperatureRange}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="产品类型" span={3}>
                                {selectedOrder.}（
                                {selectedOrder.productWeight}kg）
                            </Descriptions.Item> */}
                        </Descriptions>

                        {/* 驳回原因输入 */}
                        {modalType === "reject" && (
                            <Form.Item label="驳回原因" required>
                                <Input.TextArea
                                    rows={3}
                                    value={rejectReason}
                                    onChange={(e) =>
                                        setRejectReason(e.target.value)
                                    }
                                    placeholder="请输入详细驳回理由（至少15字）"
                                    showCount
                                    maxLength={200}
                                />
                            </Form.Item>
                        )}
                    </div>
                )}
            </Modal>
        </>
    )
}

export default reviewModal
