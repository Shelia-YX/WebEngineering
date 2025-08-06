import React from 'react';
import { Modal, Button } from 'antd';
import type { ModalProps, ModalFuncProps } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ConfirmModalProps extends Omit<ModalProps, 'onOk'> {
  title?: string;
  content: React.ReactNode;
  onOk: () => void | Promise<void>;
  okText?: string;
  cancelText?: string;
  okButtonProps?: React.ComponentProps<typeof Button>;
  cancelButtonProps?: React.ComponentProps<typeof Button>;
  icon?: React.ReactNode;
}

type ConfirmModalType = React.FC<ConfirmModalProps> & {
  confirm: (props: Omit<ConfirmModalProps, keyof ModalProps> & ModalFuncProps) => void;
};

type ConfirmModalParams = Omit<ConfirmModalProps, keyof ModalProps> & ModalFuncProps;

const ConfirmModal: React.FC<ConfirmModalProps> = ({

  title = '确认操作',
  content,
  onOk,
  okText = '确认',
  cancelText = '取消',
  okButtonProps,
  cancelButtonProps,
  icon = <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
  ...modalProps
}) => {
  return (
    <Modal
      title={
        <span>
          {icon} {title}
        </span>
      }
      okText={okText}
      cancelText={cancelText}
      onOk={onOk}
      okButtonProps={{
        danger: true,
        ...okButtonProps,
      }}
      cancelButtonProps={cancelButtonProps}
      {...modalProps}
    >
      {content}
    </Modal>
  );
};

// 静态方法，用于快速创建确认对话框
(ConfirmModal as ConfirmModalType).confirm = (props: ConfirmModalParams) => {
  const { content, onOk, title, okText, cancelText, okButtonProps, cancelButtonProps, icon, ...modalProps } = props;
  
  return Modal.confirm({
    title: title || '确认操作',
    icon: icon || <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
    content,
    onOk,
    okText: okText || '确认',
    cancelText: cancelText || '取消',
    okButtonProps: {
      danger: true,
      ...okButtonProps,
    },
    cancelButtonProps,
    ...modalProps,
  });
};

export default ConfirmModal;