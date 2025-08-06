import React from 'react';
import { Empty, Button } from 'antd';
import type { EmptyProps } from 'antd';

interface EmptyStateProps extends EmptyProps {
  description?: React.ReactNode;
  buttonText?: string;
  onButtonClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  description = '暂无数据',
  buttonText,
  onButtonClick,
  ...props
}) => {
  return (
    <Empty
      description={description}
      {...props}
    >
      {buttonText && onButtonClick && (
        <Button type="primary" onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </Empty>
  );
};

export default EmptyState;