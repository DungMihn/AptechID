import React from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
  try {
      const response = await axios.post(
        "https://api.escuelajs.co/api/v1/auth/login",
        {
          email: values.email,
          password: values.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      // Lưu token vào localStorage
      localStorage.setItem("token", response.data.access_token);
  
      message.success("Đăng nhập thành công!");
      navigate("/dashboard");
    } catch (error: any) {
      if (error.response) {
        console.error("Server error:", error.response.data);
        message.error(error.response.data.message || "Thông tin đăng nhập không đúng!");
      } else if (error.request) {
        console.error("No response received:", error.request);
        message.error("Không có phản hồi từ server!");
      } else {
        console.error("Request error:", error.message);
        message.error("Đã có lỗi khi gửi yêu cầu!");
      }
    }
  };
  

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Login</h2>
      <Form name="login" onFinish={onFinish}>
        <Form.Item
          name="email"
          rules={[{ required: true, message: "Vui lòng nhập Email!" }]}
        >
          <Input type="email" placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>Remember me</Checkbox>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
