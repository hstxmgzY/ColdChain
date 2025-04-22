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
  Tooltip,
  DatePicker,
} from "antd";
import type { TableProps } from "antd";
import dayjs from "dayjs";

// 从实际的 API 模块导入报警相关接口
import {
  getMonitorAlarmList,
  //   updateAlarmInfo,
  //   deleteAlarmInfo,
  //   addAlarmInfo,
  //   processAlarm,
} from "../../api/modules/monitor";

export interface AlarmInfoType {
  id: number;
  cold_chain_id: string;
  cold_chain_name: string;
  machine_id: string;
  alarm_time: string;
  alarm_type: string;
  alarm_description: string;
  alarm_level: string;
  alarm_status: string;
  remark: string;
}

const { Search } = Input;
const { Text } = Typography;

const AlarmLevelOptions = [
  { label: "高", value: "HIGH" },
  { label: "中", value: "MEDIUM" },
  { label: "低", value: "LOW" },
];

const AlarmStatusOptions = [
  { label: "已读", value: "已读" },
  { label: "暂不处理", value: "暂不处理" },
  { label: "未读", value: "未读" },
];

const AlarmTypeOptions = [
  { label: "温度异常", value: "温度异常" },
  { label: "设备离线", value: "设备离线" },
  { label: "设备故障", value: "设备故障" },
  { label: "传感器异常", value: "传感器异常" },
  { label: "网络异常", value: "网络异常" },
  { label: "温控系统故障", value: "温控系统故障" },
  { label: "电量不足", value: "电量不足" },
  { label: "其他", value: "其他" },
];

const AlarmInfoTable: React.FC = () => {
  const [data, setData] = useState<AlarmInfoType[]>([]);
  const [filteredData, setFilteredData] = useState<AlarmInfoType[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [processModalVisible, setProcessModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [currentAlarm, setCurrentAlarm] = useState<AlarmInfoType | null>(null);
  const [editForm] = Form.useForm();
  const [processForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const fetchAlarmInfo = async () => {
    setLoading(true);
    try {
      const response = await getMonitorAlarmList();
      const safeData = Array.isArray(response) ? response : [];
      setData(safeData);
      setFilteredData(safeData);
    } catch {
      message.error("获取报警列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlarmInfo();
  }, []);

  const onSearch = (value: string) => {
    if (!value.trim()) {
      setFilteredData(data);
    } else {
      setFilteredData(
        data.filter((alarmInfo) => alarmInfo.cold_chain_id.includes(value))
      );
    }
  };

  //   // 删除报警
  //   const handleDelete = async (id: number) => {
  //     try {
  //       await deleteAlarmInfo(id);
  //       message.success("报警已删除");
  //       fetchAlarmInfo();
  //     } catch {
  //       message.error("删除失败");
  //     }
  //   };

  //   // 打开编辑弹窗
  //   const handleEdit = (record: AlarmInfoType) => {
  //     setCurrentAlarm(record);
  //     editForm.setFieldsValue({
  //       ...record,
  //       alarm_time: dayjs(record.alarm_time),
  //     });
  //     setEditModalVisible(true);
  //   };

  //   // 提交编辑
  //   const handleEditSubmit = async () => {
  //     try {
  //       const values = await editForm.validateFields();
  //       await updateAlarmInfo(currentAlarm!.id, {
  //         ...values,
  //         alarm_time: values.alarm_time.format("YYYY-MM-DD HH:mm:ss"),
  //       });
  //       message.success("报警信息已更新");
  //       setEditModalVisible(false);
  //       fetchAlarmInfo();
  //     } catch {
  //       message.error("更新失败");
  //     }
  //   };

  // 打开处理弹窗
  const handleProcess = (record: AlarmInfoType) => {
    setCurrentAlarm(record);
    processForm.setFieldsValue({
      alarm_status: record.alarm_status,
      remark: record.remark,
    });
    setProcessModalVisible(true);
  };

  // 提交处理
  const handleProcessSubmit = async () => {
    try {
      const values = await processForm.validateFields();
      await processAlarm(currentAlarm!.id, values);
      message.success("处理状态已更新");
      setProcessModalVisible(false);
      fetchAlarmInfo();
    } catch {
      message.error("处理失败");
    }
  };

  //   // 打开新增弹窗
  //   const handleCreate = () => {
  //     setCurrentAlarm(null);
  //     createForm.resetFields();
  //     setCreateModalVisible(true);
  //   };

  //   // 提交新增
  //   const handleCreateSubmit = async () => {
  //     try {
  //       const values = await createForm.validateFields();
  //       await addAlarmInfo({
  //         ...values,
  //         alarm_time: values.alarm_time.format("YYYY-MM-DD HH:mm:ss"),
  //         // 默认设置报警状态和备注
  //         alarm_status: "未读",
  //         remark: "",
  //       });
  //       message.success("报警信息已创建");
  //       setCreateModalVisible(false);
  //       fetchAlarmInfo();
  //       createForm.resetFields();
  //     } catch {
  //       message.error("创建失败");
  //     }
  //   };
  const columns: TableProps<AlarmInfoType>["columns"] = [
    {
      title: "设备ID",
      dataIndex: "device_id",
      key: "device_id",
    },
    {
      title: "报警时间",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: "报警级别",
      dataIndex: "alarm_level",
      key: "alarm_level",
      render: (level) => {
        const levelColors: Record<string, string> = {
          HIGH: "red",
          MEDIUM: "orange",
          LOW: "blue",
        };
        return <Tag color={levelColors[level] || "blue"}>{level}</Tag>;
      },
    },
    {
      title: "报警描述",
      dataIndex: "alarm_description",
      key: "alarm_description",
      ellipsis: true,
      render: (desc) => (
        <Tooltip title={desc}>
          <span>{desc}</span>
        </Tooltip>
      ),
    },
    {
      title: "处理状态",
      dataIndex: "alarm_status",
      key: "alarm_status",
      render: (status) => {
        const statusColors: Record<string, string> = {
          未读: "red",
          已读: "green",
          暂不处理: "gray",
        };
        return <Tag color={statusColors[status] || "gray"}>{status}</Tag>;
      },
    },
    {
      title: "备注",
      dataIndex: "remark",
      key: "remark",
      ellipsis: true,
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleProcess(record)}>
            处理报警
          </Button>
          {/* <Button size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleDelete(record.device_id)}
          >
            删除
          </Button> */}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row
        justify="space-between"
        align="middle"
        gutter={[16, 16]}
        style={{ marginBottom: 16 }}
      >
        <Col>
          <Space>
            <Text>冷链模块ID：</Text>
            <Search
              placeholder="输入冷链模块ID"
              onSearch={onSearch}
              style={{ width: 200 }}
            />
          </Space>
        </Col>
        {/* <Col>
          <Button type="primary" onClick={handleCreate}>
            新增警报
          </Button>
        </Col> */}
      </Row>

      <Table<AlarmInfoType>
        bordered
        size="small"
        loading={loading}
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
      />

      {/* 编辑弹窗 */}
      {/* <Modal
        title="编辑报警信息"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="cold_chain_id"
            label="冷链模块ID"
            rules={[{ required: true }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="alarm_time"
            label="报警时间"
            rules={[{ required: true }]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            name="alarm_type"
            label="报警类型"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="alarm_level"
            label="报警级别"
            rules={[{ required: true }]}
          >
            <Select options={AlarmLevelOptions} />
          </Form.Item>
          <Form.Item
            name="alarm_description"
            label="报警描述"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal> */}

      {/* 处理弹窗 */}
      <Modal
        title="处理报警"
        open={processModalVisible}
        onOk={handleProcessSubmit}
        onCancel={() => setProcessModalVisible(false)}
      >
        <Form form={processForm} layout="vertical">
          <Form.Item
            name="alarm_status"
            label="处理状态"
            rules={[{ required: true }]}
          >
            <Select options={AlarmStatusOptions} />
          </Form.Item>
          <Form.Item name="remark" label="处理备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增报警弹窗 */}
      {/* <Modal
        title="新建报警信息"
        open={createModalVisible}
        onOk={handleCreateSubmit}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        width={600}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="cold_chain_id"
            label="冷链模块ID"
            rules={[{ required: true, message: "请输入冷链模块ID" }]}
          >
            <Input placeholder="请输入冷链模块ID" />
          </Form.Item>
          <Form.Item
            name="machine_id"
            label="设备物理ID"
            rules={[{ required: true, message: "请输入设备ID" }]}
          >
            <Input placeholder="请输入设备ID" />
          </Form.Item>
          <Form.Item
            name="alarm_time"
            label="报警时间"
            initialValue={dayjs()}
            rules={[{ required: true, message: "请选择报警时间" }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item
            name="alarm_type"
            label="报警类型"
            rules={[{ required: true, message: "请选择报警类型" }]}
          >
            <Select options={AlarmTypeOptions} />
          </Form.Item>
          <Form.Item
            name="alarm_level"
            label="报警级别"
            initialValue="一般"
            rules={[{ required: true, message: "请选择报警级别" }]}
          >
            <Select options={AlarmLevelOptions} />
          </Form.Item>
          <Form.Item
            name="alarm_description"
            label="报警描述"
            rules={[{ required: true, message: "请输入报警描述" }]}
          >
            <Input.TextArea rows={3} placeholder="请输入详细报警描述..." />
          </Form.Item>
        </Form>
      </Modal> */}
    </div>
  );
};

export default AlarmInfoTable;
