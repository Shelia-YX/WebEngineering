import React from 'react';
import { Alert } from 'antd';
import type { AlertProps } from 'antd';

interface ErrorAlertProps extends Omit<AlertProps, 'type'> {
  error: string | Error | null | unknown;
  fullWidth?: boolean;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  error, 
  fullWidth = true,
  ...props 
}) => {
  if (!error) return null;

  let errorMessage = '';
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String((error as { message: string }).message);
  } else {
    errorMessage = '发生未知错误';
  }

  return (
    <Alert
      type="error"
      message="错误"
      description={errorMessage}
      showIcon
      style={fullWidth ? { width: '100%' } : undefined}
      {...props}
    />
  );
};

export default ErrorAlert;