import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

interface SearchOptions {
  initialValue?: string;
  debounceTime?: number;
  minLength?: number;
  onSearch?: (value: string) => void;
}

// 搜索Hook
export const useSearch = (options: SearchOptions = {}) => {
  const {
    initialValue = '',
    debounceTime = 500,
    minLength = 0,
    onSearch,
  } = options;

  const [searchValue, setSearchValue] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  
  // 使用防抖处理搜索值
  const debouncedSearchValue = useDebounce(searchValue, debounceTime);

  // 处理搜索值变化
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  // 清空搜索
  const clearSearch = useCallback(() => {
    setSearchValue('');
  }, []);

  // 执行搜索
  const executeSearch = useCallback(() => {
    if (searchValue.length >= minLength && onSearch) {
      setIsSearching(true);
      onSearch(searchValue);
    }
  }, [searchValue, minLength, onSearch]);

  // 当防抖后的搜索值变化时执行搜索
  useEffect(() => {
    if (debouncedSearchValue.length >= minLength && onSearch) {
      setIsSearching(true);
      onSearch(debouncedSearchValue);
    } else {
      setIsSearching(false);
    }
  }, [debouncedSearchValue, minLength, onSearch]);

  return {
    searchValue,
    setSearchValue,
    debouncedSearchValue,
    isSearching,
    handleSearchChange,
    clearSearch,
    executeSearch,
  };
};

export default useSearch;

// 使用外部的useDebounce钩子