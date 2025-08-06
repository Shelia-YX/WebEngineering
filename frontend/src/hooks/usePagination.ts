import { useState, useEffect, useCallback } from 'react';

interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  total?: number;
  onChange?: (page: number, pageSize: number) => void;
}

// 分页Hook
export const usePagination = (options: PaginationOptions = {}) => {
  const {
    initialPage = 1,
    initialPageSize = 10,
    total = 0,
    onChange,
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(total);

  // 计算总页数
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // 更新总数
  const updateTotal = useCallback((newTotal: number) => {
    setTotalItems(newTotal);
  }, []);

  // 处理页码变化
  const handlePageChange = useCallback(
    (page: number) => {
      // 确保页码在有效范围内
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);

      if (onChange) {
        onChange(validPage, pageSize);
      }
    },
    [pageSize, totalPages, onChange]
  );

  // 处理每页条数变化
  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize);
      
      // 调整当前页码，确保不超出新的总页数
      const newTotalPages = Math.ceil(totalItems / newPageSize) || 1;
      const validPage = Math.min(currentPage, newTotalPages);
      setCurrentPage(validPage);

      if (onChange) {
        onChange(validPage, newPageSize);
      }
    },
    [currentPage, totalItems, onChange]
  );

  // 跳转到第一页
  const goToFirstPage = useCallback(() => {
    handlePageChange(1);
  }, [handlePageChange]);

  // 跳转到最后一页
  const goToLastPage = useCallback(() => {
    handlePageChange(totalPages);
  }, [handlePageChange, totalPages]);

  // 跳转到上一页
  const goToPreviousPage = useCallback(() => {
    handlePageChange(currentPage - 1);
  }, [currentPage, handlePageChange]);

  // 跳转到下一页
  const goToNextPage = useCallback(() => {
    handlePageChange(currentPage + 1);
  }, [currentPage, handlePageChange]);

  // 当总数变化时，确保当前页码有效
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalItems, pageSize, totalPages, currentPage]);

  // 计算当前页的数据范围
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

  // 分页数据
  const paginationProps = {
    current: currentPage,
    pageSize,
    total: totalItems,
    onChange: handlePageChange,
    onShowSizeChange: handlePageSizeChange,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条记录`,
  };

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    updateTotal,
    handlePageChange,
    handlePageSizeChange,
    goToFirstPage,
    goToLastPage,
    goToPreviousPage,
    goToNextPage,
    paginationProps, // 可直接用于Ant Design的Pagination组件
  };
};

export default usePagination;