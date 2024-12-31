import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import { Link, Outlet } from "react-router-dom";
import {
  ContainerOutlined,
  DesktopOutlined,
  PieChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

const { Sider, Header, Content } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  { key: "1", icon: <PieChartOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
  { key: "2", icon: <DesktopOutlined />, label: <Link to="/dashboard/products">Products</Link> },
  { key: "3", icon: <ContainerOutlined />, label: <Link to="/dashboard/orders">Orders</Link> },
];

const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapsed = () => setCollapsed(!collapsed);

  return (
    <Layout style={{ height: "150vh" }}>
      {/* Sidebar Trang */}
      <Sider collapsible collapsed={collapsed} onCollapse={toggleCollapsed}>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          inlineCollapsed={collapsed}
          items={items}
        />
      </Sider>

      {/* Main Layout Trang */}
      <Layout>
        {/* Header Trang */}
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
          <span>
            <strong>dungminh2505@gmail.com</strong> |{" "}
            <a
              href="/"
              onClick={() => {
                localStorage.removeItem("token");
              }}
            >
              Đăng xuất
            </a>
          </span>
        </Header>

        {/* Nội dung chính của Page */}
        <Content style={{ margin: 20, minHeight: 80 }}>
          <Outlet /> 
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
