import React, { useEffect, useState } from "react";
import { List, NavBar, Tag, Toast } from "antd-mobile";
import { LeftOutline } from "antd-mobile-icons";
import { useNavigate } from "react-router-dom";

// 示例通知类型
type NoticeType = "order_rejected" | "temp_alert" | "battery_alert";

interface Notice {
  id: number;
  type: NoticeType;
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
}

const mockNotices: Notice[] = [
  {
    id: 1,
    type: "order_rejected",
    title: "订单已被驳回",
    content:
      "您的订单 #ORD-1746458413975988174 因信息不完整被驳回，请重新提交。",
    timestamp: "2025-05-05 20:30",
    read: false,
  },
  {
    id: 2,
    type: "temp_alert",
    title: "冷链箱温度预警",
    content: "冷链箱 DEV-001 当前温度超过设定范围，请立即处理。",
    timestamp: "2025-05-05 21:12",
    read: true,
  },
  {
    id: 3,
    type: "battery_alert",
    title: "电量不足预警",
    content: "冷链箱 DEV-001 电量低于 15%，请尽快充电。",
    timestamp: "2025-05-06 22:48",
    read: false,
  },
];

const NoticeList = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    // 预留 API 调用
    // fetchNotices().then(setNotices).catch(() => Toast.show({ content: '加载失败' }))
    setTimeout(() => {
      setNotices(mockNotices);
    }, 300);
  }, []);

  const getTagColor = (type: NoticeType) => {
    switch (type) {
      case "order_rejected":
        return "danger";
      case "temp_alert":
        return "warning";
      case "battery_alert":
        return "primary";
      default:
        return "default";
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <NavBar backArrow={<LeftOutline />} onBack={() => navigate(-1)}>
        通知中心
      </NavBar>

      <List>
        {notices.map((notice) => (
          <List.Item
            key={notice.id}
            title={
              <span style={{ fontWeight: notice.read ? "normal" : "bold" }}>
                {notice.title}
              </span>
            }
            description={
              <span style={{ color: "#888", fontSize: 13 }}>
                {notice.timestamp}
              </span>
            }
            prefix={
              <Tag color={getTagColor(notice.type)}>
                {getNoticeLabel(notice.type)}
              </Tag>
            }
            onClick={() => {
              Toast.show({ content: notice.content });
              // 可扩展为点击进入详情页等
            }}
          />
        ))}
      </List>
    </div>
  );
};

const getNoticeLabel = (type: NoticeType): string => {
  switch (type) {
    case "order_rejected":
      return "订单驳回";
    case "temp_alert":
      return "温度预警";
    case "battery_alert":
      return "电量预警";
    default:
      return "通知";
  }
};

export default NoticeList;
