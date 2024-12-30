import React, { useState } from "react";
import { Table, Button, Space, notification, Modal, Form, Input } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: {
    id: number;
    name: string;
    image: string;
  };
  images: string[];
};

const fetchProducts = async (filters: { title?: string; categoryId?: number; price_min?: number; price_max?: number }, offset: number): Promise<{ products: Product[]; total: number }> => {
  const params = new URLSearchParams({ offset: offset.toString(), limit: "10" });
  if (filters.title) params.append("title", filters.title);
  if (filters.categoryId) params.append("categoryId", filters.categoryId.toString());
  if (filters.price_min) params.append("price_min", filters.price_min.toString());
  if (filters.price_max) params.append("price_max", filters.price_max.toString());

  const response = await axios.get(`https://api.escuelajs.co/api/v1/products?${params.toString()}`);
  return { products: response.data, total: 200 };
};

const Products: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<{ title?: string; categoryId?: number; price_min?: number; price_max?: number }>({});
  const { data, isLoading } = useQuery({
    queryKey: ["products", currentPage, filters],
    queryFn: () => fetchProducts(filters, (currentPage - 1) * 10),
  });

  const updateMutation = useMutation({
    mutationFn: (updatedProduct: Partial<Product> & { id: number }) =>
      axios.put(
        `https://api.escuelajs.co/api/v1/products/${updatedProduct.id}`,
        updatedProduct
      ),
    onSuccess: () => {
      notification.success({ message: "Product updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsModalOpen(false);
      form.resetFields();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      axios.delete(`https://api.escuelajs.co/api/v1/products/${id}`),
    onSuccess: () => {
      notification.success({ message: "Product deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const addMutation = useMutation({
    mutationFn: (newProduct: Omit<Product, "id" | "category"> & { categoryId: number }) =>
      axios.post("https://api.escuelajs.co/api/v1/products/", {
        ...newProduct,
        images: [newProduct.images[0]], 
      }),
    onSuccess: () => {
      notification.success({ message: "Product added successfully" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      notification.error({
        message: "Failed to add product",
        description: (error as any).response?.data?.message || "An unexpected error occurred",
      });
    },
  });

  const handleSubmit = (values: Omit<Product, "id" | "category"> & { categoryId: number }) => {
   
    if (editingProduct) {
      updateMutation.mutate({ ...values, id: editingProduct.id });
    } else {
      const formattedValues = {
        ...values,
        images: Array.isArray(values.images) ? values.images : [values.images], 
      };
      addMutation.mutate(formattedValues);
    }
  };

  // const openModal = (product?: Product) => {
  //   setEditingProduct(product || null);
  //   setIsModalOpen(true);
  //   console.log(product?.images)
    
  //   form.setFieldsValue({
  //     title: product?.title || "",
  //     price: product?.price || "",
  //     description: product?.description || "",
  //     categoryId: product?.category.id || "",
  //     images: product?.images 
  //   });
  // };

  const openModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsModalOpen(true);
  
    // Kiểm tra nếu images chứa '['
    if (product?.images?.some((img) => typeof img === "string" && img.includes("["))) {
      console.log("Dữ liệu img bị lỗi:", product.images);
      notification.error({
        message: "Dữ liệu img bị lỗi",
        description: "Vui lòng kiểm tra lại dữ liệu hình ảnh.",
      });
      // return; // Dừng nếu phát hiện lỗi
    }
    
      form.setFieldsValue({
        title: product?.title || "",
        price: product?.price || "",
        description: product?.description || "",
        categoryId: product?.category.id || "",
        images: product?.images,
      });
    };
  

  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Category", dataIndex: ["category", "name"], key: "category" },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Product) => (
        <Space>
          <Button onClick={() => openModal(record)}>Edit</Button>
          <Button danger onClick={() => deleteMutation.mutate(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  const handleFilterChange = (changedFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...changedFilters }));
    setCurrentPage(1);
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Input
          placeholder="Search by title"
          onChange={(e) => handleFilterChange({ title: e.target.value })}
          style={{ width: 200, marginRight: 10 }}
        />
        <Input
          placeholder="Category ID"
          type="number"
          onChange={(e) => handleFilterChange({ categoryId: Number(e.target.value) })}
          style={{ width: 200, marginRight: 10 }}
        />
        <Input
          placeholder="Min Price"
          type="number"
          onChange={(e) => handleFilterChange({ price_min: Number(e.target.value) })}
          style={{ width: 200, marginRight: 10 }}
        />
        <Input
          placeholder="Max Price"
          type="number"
          onChange={(e) => handleFilterChange({ price_max: Number(e.target.value) })}
          style={{ width: 200 }}
        />
      </div>

      <Button
        type="primary"
        onClick={() => openModal()}
        style={{ marginBottom: 20 }}
      >
        Add Product
      </Button>
      <Table
        columns={columns}
        dataSource={data?.products || []}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: 10,
          total: data?.total || 0,
          onChange: (page) => setCurrentPage(page),
        }}
        loading={isLoading}
      />

      <Modal
        title="Add Product"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter the product title" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: "Please enter the product price" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter the product description" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Category ID"
            name="categoryId"
            rules={[{ required: true, message: "Please enter the category ID" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Image URL"
            name="images"
            rules={[{ required: true, message: "Please enter an image URL" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;
