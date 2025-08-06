import React from 'react';
import { Spin } from 'antd';
import type { SpinProps } from 'antd';

interface LoadingSpinnerProps extends SpinProps {
  fullPage?: boolean;
  height?: number | string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  fullPage = false, 
  height = 'auto',
  ...props 
}) => {
  if (fullPage) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.65)',
          zIndex: 1000,
        }}
      >
        <Spin size="large" {...props} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: height,
        padding: '20px 0',
      }}
    >
      <Spin {...props} />
    </div>
  );
};

export default LoadingSpinner;