import React, { useEffect } from 'react';
import { Select, Spin } from 'antd';
import type { SelectProps } from 'antd';
import { useCategories } from '../../hooks';

interface CategorySelectProps extends Omit<SelectProps, 'options'> {
  showAll?: boolean;
  allCategoryText?: string;
  allCategoryValue?: string | number;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  showAll = false,
  allCategoryText = '全部类别',
  allCategoryValue = 'all',
  placeholder = '选择类别',
  style,
  ...props
}) => {
  const { categories, loading, fetchCategories } = useCategories();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 构建选项
  const options = React.useMemo(() => {
    const categoryOptions = categories.map(category => ({
      label: category.name,
      value: category._id,
    }));

    if (showAll) {
      return [
        { label: allCategoryText, value: allCategoryValue },
        ...categoryOptions,
      ];
    }

    return categoryOptions;
  }, [categories, showAll, allCategoryText, allCategoryValue]);

  return (
    <Select
      placeholder={placeholder}
      style={{ width: 200, ...style }}
      options={options}
      loading={loading}
      notFoundContent={loading ? <Spin size="small" /> : null}
      {...props}
    />
  );
};

export default CategorySelect;