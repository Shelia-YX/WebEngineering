import React, { useState } from 'react';
import { Upload, Button, Modal } from 'antd';
import { UploadOutlined, PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps, RcFile } from 'antd/es/upload/interface';
import { useUpload } from '../../hooks';
import { UPLOAD_FILE_SIZE_LIMIT, UPLOAD_IMAGE_TYPES } from '../../constants';
import { message } from '../../utils/messageUtils';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  maxCount?: number;
  showUploadList?: boolean;
  listType?: 'text' | 'picture' | 'picture-card';
  buttonText?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  maxCount = 1,
  showUploadList = true,
  listType = 'picture-card',
  buttonText = '上传图片',
  disabled = false,
}) => {
  const { uploadImage, fileToBase64 } = useUpload();
  const [fileList, setFileList] = useState<UploadFile[]>(() => {
    if (value) {
      return [{
        uid: '-1',
        name: 'image.png',
        status: 'done',
        url: value,
      }];
    }
    return [];
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  // 预览图片
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      if (file.originFileObj) {
        file.preview = await fileToBase64(file.originFileObj);
      }
    }

    setPreviewImage(file.url || (file.preview as string) || '');
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  // 关闭预览
  const handleCancel = () => setPreviewOpen(false);

  // 上传前检查
  const beforeUpload = (file: RcFile) => {
    // 检查文件类型
    const isValidType = UPLOAD_IMAGE_TYPES.includes(file.type);
    if (!isValidType) {
      message.error('只能上传JPG/PNG/JPEG/GIF格式的图片!');
      return Upload.LIST_IGNORE;
    }

    // 检查文件大小
    const isLessThan2M = file.size / 1024 / 1024 < UPLOAD_FILE_SIZE_LIMIT;
    if (!isLessThan2M) {
      message.error(`图片必须小于${UPLOAD_FILE_SIZE_LIMIT}MB!`);
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  // 自定义上传
  const customUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    
    if (!(file instanceof File)) {
      onError?.(new Error('文件格式错误'));
      return;
    }

    try {
      setUploading(true);
      const url = await uploadImage(file);
      
      if (url && onChange) {
        onChange(url);
      }
      
      onSuccess?.(url, new XMLHttpRequest());
      message.success('上传成功');
    } catch (error) {
      console.error('上传失败:', error);
      onError?.(error as Error);
      message.error('上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 处理文件列表变化
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    
    // 如果删除了所有图片，清空值
    if (newFileList.length === 0 && onChange) {
      onChange('');
    }
  };

  // 上传按钮
  const uploadButton = (
    <div>
      {listType === 'picture-card' ? <PlusOutlined /> : <UploadOutlined />}
      <div style={{ marginTop: 8 }}>{buttonText}</div>
    </div>
  );

  return (
    <>
      <Upload
        listType={listType}
        fileList={fileList}
        beforeUpload={beforeUpload}
        onPreview={handlePreview}
        onChange={handleChange}
        customRequest={customUpload}
        maxCount={maxCount}
        showUploadList={showUploadList}
        disabled={disabled || uploading}
      >
        {fileList.length >= maxCount ? null : (
          listType === 'picture-card' ? (
            uploadButton
          ) : (
            <Button 
              icon={<UploadOutlined />} 
              loading={uploading}
              disabled={disabled}
            >
              {buttonText}
            </Button>
          )
        )}
      </Upload>

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="预览图片" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default ImageUpload;