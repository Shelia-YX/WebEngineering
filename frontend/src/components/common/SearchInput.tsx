import React from 'react';
import { Input } from 'antd';
import type { InputRef } from 'antd/lib/input';
import type { SearchProps } from 'antd/lib/input/Search';
import { SearchOutlined } from '@ant-design/icons';
import { useSearch } from '../../hooks';

interface SearchInputProps extends Omit<SearchProps, 'onChange'> {
  onSearch: (value: string) => void;
  initialValue?: string;
  debounceTime?: number;
  allowClear?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  initialValue = '',
  debounceTime = 500,
  allowClear = true,
  placeholder = '搜索...',
  ...props
}) => {
  const { searchValue, setSearchValue, isSearching } = useSearch({
    initialValue,
    onSearch,
    debounceTime,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleClear = () => {
    setSearchValue('');
  };

  return (
    <Input.Search
      prefix={<SearchOutlined />}
      placeholder={placeholder}
      value={searchValue}
      onChange={handleChange}
      onSearch={() => onSearch(searchValue)}
      allowClear={allowClear}
      loading={isSearching}
      {...props}
    />
  );
};

export default SearchInput;