import React, { useState, useEffect } from "react";
import {
  Space,
  Table,
  Tag,
  Button,
  Row,
  Col,
  Input,
  Typography,
  Modal,
  Form,
  message,
  Select,
  Tabs,
  Image,
} from "antd";
import type { TableProps, TabsProps } from "antd";
import {
  getVehicleList,
  updateVehicle,
  deleteVehicle,
  addVehicle,
} from "../../api/modules/resources/vehicle";
import { createStyles } from "antd-style";
import VehicleType from "../../interface/resource/vehicle";

const useStyle = createStyles(({ css }) => ({
  customTable: css`
    .ant-table {
      .ant-table-container {
        .ant-table-body,
        .ant-table-content {
          scrollbar-width: thin;
          scrollbar-color: #eaeaea transparent;
        }
      }
    }
  `,
}));

const { Search } = Input;
const { Text } = Typography;

const VehicleDetailTable: React.FC = () => {
  const [data, setData] = useState<VehicleType[]>([]);
  const [filteredData, setFilteredData] = useState<VehicleType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleType | null>(
    null
  );
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    plateNumber: "",
    status: "",
  });

  useEffect(() => {
    if (modalVisible && editingVehicle) {
      form.setFieldsValue(editingVehicle);
    } else if (modalVisible) {
      form.resetFields();
    }
  }, [modalVisible, editingVehicle, form]);

  useEffect(() => {
    if (!data) return; // 防止 data 为空时报错

    setFilteredData(
      data.filter((item) => {
        return (
          (!searchParams.plateNumber ||
            item.plateNumber.includes(searchParams.plateNumber)) &&
          (!searchParams.status || item.status === searchParams.status)
        );
      })
    );
  }, [data, searchParams]);

  // 所有搜索处理函数
  const handleSearch = (field: keyof typeof searchParams, value: string) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value ? value.trim() : "",
    }));
  };

  const onChangeTabs = (key: string) => {
    setSearchParams((prev) => ({
      ...prev,
      status: key,
    }));
  };

  const tabsItems: TabsProps["items"] = [
    {
      key: "空闲",
      label: "空闲",
    },
    {
      key: "使用中",
      label: "使用中",
    },
    {
      key: "维修中",
      label: "维修中",
    },
    {
      key: "停用",
      label: "停用",
    },
  ];

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response: VehicleType[] = await getVehicleList();
      console.log("获取车辆列表：", response);
      setData(response);
      setFilteredData(response);
    } catch {
      message.error("获取车辆列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteVehicle(id);
      message.success("订单已删除");
      fetchVehicles();
    } catch {
      message.error("删除失败，请重试");
    }
  };

  const handleEdit = (vehicle: VehicleType) => {
    setEditingVehicle(vehicle);
    setModalVisible(true);
    // form.setFieldsValue(vehicle)
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const processedValues = {
        ...values,
        MaxCapacity: Number(values.MaxCapacity), // 转换为数字
      };
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, processedValues);
        message.success("车辆信息已更新");
      } else {
        await addVehicle(processedValues);
        message.success("车辆已添加");
      }
      fetchVehicles();
      setModalVisible(false);
      setEditingVehicle(null);
    } catch {
      message.error("操作失败，请重试");
    }
  };

  const columns: TableProps<VehicleType>["columns"] = [
    {
      title: "编号",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "车牌号码",
      dataIndex: "plateNumber",
      key: "plateNumber",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      fixed: "left",
      render: (status) => {
        const statusColors: Record<string, string> = {
          空闲: "green",
          使用中: "gold",
          维修中: "red",
          停用: "gray",
        };
        return <Tag color={statusColors[status]}>{status}</Tag>;
      },
      filters: Object.entries({
        空闲: "green",
        使用中: "gold",
        维修中: "red",
        停用: "gray",
      }).map(([status]) => ({
        text: status,
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "最大可承载冷链箱个数",
      dataIndex: "MaxCapacity",
      key: "MaxCapacity",
    },
    {
      title: "车辆图片",
      dataIndex: "imgUrl",
      key: "imgUrl",
      render: (imgUrl) => (
        <Image src={imgUrl} alt="车辆图片" style={{ width: 50, height: 50 }} />
      ),
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record as VehicleType)}>
            更新
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const { styles } = useStyle();

  return (
    <div>
      <Row
        justify="space-between"
        align="middle"
        gutter={[16, 16]}
        style={{ marginBottom: 16 }}
      >
        <Col>
          <Button
            type="primary"
            onClick={() => {
              setEditingVehicle(null);
              setModalVisible(true);
            }}
          >
            添加车辆
          </Button>
        </Col>
        <Col>
          <Space>
            <Text>车牌号码：</Text>
            <Search
              placeholder="输入车牌号码"
              allowClear
              onSearch={(v) => handleSearch("plateNumber", v)}
              style={{ width: 250, marginRight: 30 }}
            />
          </Space>
        </Col>
      </Row>
      <Tabs defaultActiveKey="空闲" items={tabsItems} onChange={onChangeTabs} />
      <Table<VehicleType>
        className={styles.customTable}
        scroll={{ x: "max-content" }}
        loading={loading}
        size="middle"
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 7 }}
      />
      <Modal
        title={editingVehicle ? "编辑车辆" : "添加车辆"}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false);
          setEditingVehicle(null);
        }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="plateNumber"
            label="车牌号码"
            rules={[{ required: true, message: "请输入车牌号码" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: "请选择状态" }]}
          >
            <Select>
              <Select.Option value="空闲">空闲</Select.Option>
              <Select.Option value="使用中">使用中</Select.Option>
              <Select.Option value="维修中">维修中</Select.Option>
              <Select.Option value="停用">停用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="MaxCapacity"
            label="最多可承载冷链箱个数"
            rules={[{ required: true, message: "请输入承载数量" }]}
          >
            <Input type="number" />
          </Form.Item>
          {/* 之后改为图片上传！！ */}
          <Form.Item
            name="imgUrl"
            label="车辆图片"
            rules={[{ required: true, message: "请输入图片链接" }]}
          >
            <Input placeholder="请输入图片链接" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VehicleDetailTable;
