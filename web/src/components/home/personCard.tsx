import React from "react";
import {
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Avatar, Card, Divider, Typography } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { UserOutlined } from "@ant-design/icons";

const { Meta } = Card;
const { Text } = Typography;

const PersonCard: React.FC = () => {
  // 从 Redux store 获取用户信息
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  // 角色类型映射
  const roleMap: { [key: string]: string } = {
    admin: "超级管理员",
    individual: "个人用户",
    manager: "冷链业务管理员",
    merchant: "商户",
  };

  const getAvatarContent = () => {
    // 存在有效用户名时处理首字母
    if (userInfo?.username?.trim()) {
      // 过滤特殊符号，获取第一个有效字符
      const cleanName = userInfo.username.replace(
        /[^a-zA-Z0-9\u4e00-\u9fa5]/g,
        ""
      );
      if (cleanName.length > 0) {
        // 取第一个字符（支持中文）
        const firstChar = cleanName.charAt(0);
        // 中文直接返回，英文返回大写
        return /[\u4e00-\u9fa5]/.test(firstChar)
          ? firstChar
          : firstChar.toUpperCase();
      }
    }
    // 无有效用户名时返回 null 显示默认图标
    return null;
  };

  // 获取头像显示内容
  const avatarContent = getAvatarContent();

  return (
    <Card
      style={{ width: "100%" }}
      actions={[
        <SettingOutlined key="setting" />,
        <EditOutlined key="edit" />,
        <EllipsisOutlined key="ellipsis" />,
      ]}
    >
      <Meta
        avatar={
          <Avatar
            size={36}
            style={{
              backgroundColor: "#1890ff",
              fontSize: "16px",
              fontWeight: "bold",
            }}
            icon={!avatarContent && <UserOutlined />} // 无内容时显示默认图标
          >
            {avatarContent}
          </Avatar>
        }
        title={userInfo?.username || "未登录用户"} // 显示用户名
        description={userInfo?.role ? roleMap[userInfo.role] : "未定义角色"} // 显示本地化角色
      />
      <Divider style={{ margin: "15px 0" }} />
      <div>
        <div>
          <Text type="secondary">上次登录时间：</Text>
          <Text type="secondary">
            {userInfo?.lastLogin || "2025-05-01"} {/* 根据实际字段调整 */}
          </Text>
        </div>

        <div>
          <div>
            <Text type="secondary">上次登录地点：</Text>
            <Text type="secondary">
              {userInfo?.lastLocation || "浙江"} {/* 根据实际字段调整 */}
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonCard;
