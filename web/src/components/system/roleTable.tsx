import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Row,
  Col,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";

interface RoleType {
  id: number;
  name: string;
  description: string;
}

const { Text } = Typography;

const RoleTable: React.FC = () => {
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleType | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    // mock 数据初始化
    setRoles([
      { id: 1, name: "admin", description: "系统管理员" },
      { id: 2, name: "manager", description: "冷链业务管理员" },
      { id: 3, name: "individual", description: "个人用户角色" },
      { id: 4, name: "merchant", description: "商户用户角色" },
    ]);
  }, []);

  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (role: RoleType) => {
    setEditingRole(role);
    form.setFieldsValue(role);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "确认删除该角色？",
      onOk: () => {
        setRoles((prev) => prev.filter((r) => r.id !== id));
        message.success("角色已删除");
      },
    });
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editingRole) {
      // 更新
      setRoles((prev) =>
        prev.map((r) => (r.id === editingRole.id ? { ...r, ...values } : r))
      );
      message.success("角色已更新");
    } else {
      // 新增
      setRoles((prev) => [...prev, { ...values, id: Date.now() }]);
      message.success("角色已添加");
    }
    setModalVisible(false);
  };

  const columns: ColumnsType<RoleType> = [
    { title: "角色名称", dataIndex: "name" },
    { title: "角色描述", dataIndex: "description" },
    {
      title: "操作",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Text strong>角色管理</Text>
        </Col>
        <Col>
          <Button type="primary" onClick={handleAdd}>
            新增角色
          </Button>
        </Col>
      </Row>
      <Table rowKey="id" columns={columns} dataSource={roles} />

      <Modal
        title={editingRole ? "编辑角色" : "新增角色"}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: "请输入角色名" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="角色描述"
            rules={[{ required: true, message: "请输入角色描述" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleTable;
