import React, { useState, useEffect } from "react";
import { Input, Select } from "antd";
import axios from "axios";

const { Option } = Select;

interface FilterProps {
  onFilterChange: (changedFilters: Partial<{ title: string; categoryId: number; price_min: number; price_max: number }>) => void;
}

const Filter: React.FC<FilterProps> = ({ onFilterChange }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get("https://api.escuelajs.co/api/v1/categories")
      .then((response) => {
        setCategories(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Có lỗi khi lấy danh mục:", error);
        setLoading(false);
      });
  }, []);

  // Hàm xử lý thay đổi giá trị trong dropdown, tách riêng bộ lọc
  const handleCategoryChange = (value: number) => {
    onFilterChange({ categoryId: value });
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <Input
        placeholder="Search by title"
        onChange={(e) => onFilterChange({ title: e.target.value })}
        style={{ width: 200, marginRight: 10 }}
      />
      <Select
        placeholder="Select Category"
        onChange={handleCategoryChange}
        style={{ width: 200, marginRight: 10 }}
        loading={loading} 
      >
        {categories.map((category) => (
          <Option key={category.id} value={category.id}>
            {category.name}
          </Option>
        ))}
      </Select>
      <Input
        placeholder="Min Price"
        type="number"
        onChange={(e) => onFilterChange({ price_min: Number(e.target.value) })}
        style={{ width: 200, marginRight: 10 }}
      />
      <Input
        placeholder="Max Price"
        type="number"
        onChange={(e) => onFilterChange({ price_max: Number(e.target.value) })}
        style={{ width: 200 }}
      />
    </div>
  );
};

export default Filter;
