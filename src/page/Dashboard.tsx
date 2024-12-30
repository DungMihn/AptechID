import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
  ContainerOutlined,
  DesktopOutlined,
  PieChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import Products from "../component/Products"; // Nhập component Products
import type { MenuProps } from "antd"; 

const { Sider, Header, Content } = Layout;

type MenuItem = Required<MenuProps>["items"][number]; 

const items: MenuItem[] = [
  { key: "1", icon: <PieChartOutlined />, label: "Dashboard" },
  { key: "2", icon: <DesktopOutlined />, label: "Products" },
  { key: "3", icon: <ContainerOutlined />, label: "Orders" },
];

const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false); 
  const [selectedMenu, setSelectedMenu] = useState("1"); // State để quản lý menu đã chọn

  const toggleCollapsed = () => {
    setCollapsed(!collapsed); 
  };

  const handleMenuClick = (key: string) => {
    setSelectedMenu(key); // Cập nhật menu đã chọn
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={toggleCollapsed}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedMenu]}
          onClick={(e) => handleMenuClick(e.key)} // Thay đổi menu khi người dùng chọn
          inlineCollapsed={collapsed}
          items={items}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            backgroundColor: "#fff",
            textAlign: "left",
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between", 
            alignItems: "center",
          }}
        >
          <Button
            type="primary"
            onClick={toggleCollapsed}
            style={{ marginBottom: 16 }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
          <span> <strong>dungminh2505@gmail.com</strong> | <a href="/">Đăng xuất</a></span>
        </Header>

        <Content
          style={{
            margin: 20,
            minHeight: 80,
          }}
        >
          <h1>Dashboard Login - Dũng Mihn</h1>

          {/* Điều kiện hiển thị phần nội dung */}
          {selectedMenu === "1" && <div>Welcome to the Dashboard!</div>}
          {selectedMenu === "2" && <Products />} {/* Hiển thị Products nếu chọn mục này */}
          {selectedMenu === "3" && <div>Orders</div>}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
