import React, { useState, useEffect } from "react";
import { Table, Button, Space, notification, Modal, Form, Input, Select } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Filter from "./Filter"; // Tách riêng bộ lọc

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<{ title?: string; categoryId?: number; price_min?: number; price_max?: number }>({});
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const { data, isLoading } = useQuery({
    queryKey: ["products", currentPage, filters],
    queryFn: () => fetchProducts(filters, (currentPage - 1) * 10),
  });

  // Hàm lấy danh mục
  const fetchCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      const response = await axios.get("https://api.escuelajs.co/api/v1/categories");
      setCategories(response.data);
    } catch (error) {
      notification.error({ message: "Lỗi khi lấy danh mục" });
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addMutation = useMutation({
    //xử lý lỗi từ API khi thêm sản phẩm
    onError: (error) => {
      notification.error({ message: "Failed to add product", description: error.message });
    },
    
    mutationFn: (newProduct: Omit<Product, "id" | "category"> & { categoryId: number }) =>
      axios.post("https://api.escuelajs.co/api/v1/products", {
        ...newProduct,
        images: [newProduct.images[0]],
      }),
    onSuccess: () => {
      notification.success({ message: "Product added successfully" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsAddModalOpen(false);
      addForm.resetFields();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedProduct: { id: number; title: string; price: number }) =>
      axios.put(`https://api.escuelajs.co/api/v1/products/${updatedProduct.id}`, updatedProduct),
    onSuccess: () => {
      notification.success({ message: "Product updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsEditModalOpen(false);
      editForm.resetFields();
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

  // const handleAddSubmit = (values: any) => {
  //   addMutation.mutate({
  //     ...values,
  //     description: values.description,
  //     categoryId: values.categoryId,
  //     images: [values.images],
  //   });
  // };

  const handleAddSubmit = (values: any) => {
    // Kiểm tra giá trị images ban đầu
    console.log('Raw images input:', values.images);
  
    // Tách chuỗi images thành mảng các URL
    const imageArray = values.images
      .split(",")  // Tách chuỗi thành các phần tử
      .map((url: string) => url.trim()) // Loại bỏ khoảng trắng thừa
      .map((url: string) => url.replace(/["[\]]/g, '')) // Loại bỏ dấu ngoặc kép và dấu ngoặc vuông
  
    // In giá trị mảng images sau khi xử lý
    console.log('Processed image URLs array:', imageArray);
  
    // Truyền images dưới dạng mảng URL
    addMutation.mutate({
      ...values,
      description: values.description,
      categoryId: values.categoryId,
      images: imageArray,  // Truyền mảng URL thực tế
    });
  };  

  const handleEditSubmit = (values: { title: string; price: number }) => {
    if (editingProduct) {
      updateMutation.mutate({
        id: editingProduct.id,
        title: values.title,
        price: values.price,
      });
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    console.log(product?.images)
    editForm.setFieldsValue({
      title: product.title,
      price: product.price,
      description: product?.description || "",
      categoryId: product?.category.id || "",
      images: product?.images,
    });
    setIsEditModalOpen(true);
  };

  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Price", dataIndex: "price", key: "price",
      // Hiển thị đơn vị tiền tệ
    render: (price: number) => `${price.toLocaleString()} USD`,
    align: "right" as const, // Sử dụng kiểu cụ thể của antd và căn phải tiền để dễ so sánh
     },
    { title: "Category", dataIndex: ["category", "name"], key: "category"},
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Product) => (
        <Space>
          <Button onClick={() => openEditModal(record)}>Edit</Button>
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
      <Filter onFilterChange={handleFilterChange} />
      
      <Button type="primary" onClick={() => setIsAddModalOpen(true)} style={{ marginBottom: 20 }}>
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

      {/* Add Modal */}
      <Modal
        title="Add Product"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={() => addForm.submit()}
      >
        <Form form={addForm} onFinish={handleAddSubmit} layout="vertical">
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
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select
              placeholder="Chọn danh mục"
              loading={isCategoriesLoading}
              options={categories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
            />
          </Form.Item>
          {/* <Form.Item
            label="Image URL"
            name="images"
            rules={[{ required: true, message: "Please enter an image URL" }]}
          >
            <Input />
          </Form.Item> */}
          <Form.Item
            label="Image URLs"
            name="images"
            rules={[
              { required: true, message: "Please enter at least one image URL" },
              {
                validator: (_, value) => {
                  if (!value || typeof value !== "string") {
                    return Promise.reject(new Error("Please enter valid URLs"));
                  }

                  // Tách danh sách URL từ chuỗi và kiểm tra từng URL
                  const urls = value.split(",").map((url: string) => url.trim());

                  // Kiểm tra định dạng URL hợp lệ (chỉ hỗ trợ các định dạng ảnh phổ biến)
                  const isValid = urls.every((url: string) =>
                    /^https?:\/\/.*\.(jpeg|jpg|gif|png)$/i.test(url)
                  );

                  return isValid
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("Each URL must be a valid image link (e.g., https://example.com/image.png)")
                      );
                },
              },
            ]}
          >
            <Input.TextArea placeholder="Enter image URLs, separated by commas" />
          </Form.Item>
        </Form>
      </Modal>
      {/* Edit Modal */}
      <Modal
        title="Edit Product"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => editForm.submit()}
      >
        <Form form={editForm} onFinish={handleEditSubmit} layout="vertical">
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
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select
              placeholder="Chọn danh mục"
              loading={isCategoriesLoading}
              options={categories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
            />
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