import React from 'react';
import { List, Avatar, Tooltip, Button, Popconfirm } from 'antd';
import { Comment } from '@ant-design/compatible';
import { DeleteOutlined } from '@ant-design/icons';
import { formatRelativeTime } from '../../utils';
import { useAuth } from '../../hooks';
import EmptyState from './EmptyState';

interface CommentItem {
  _id: string;
  content: string;
  createdAt: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
}

interface CommentListProps {
  comments: CommentItem[];
  loading?: boolean;
  onDelete?: (commentId: string) => void;
}

const CommentList: React.FC<CommentListProps> = ({ 
  comments, 
  loading = false,
  onDelete 
}) => {
  const { user, isAuthenticated } = useAuth();

  // 检查当前用户是否可以删除评论
  const canDeleteComment = (comment: CommentItem) => {
    if (!isAuthenticated || !user) return false;
    return user._id === comment.user._id || user.role === 'admin';
  };

  return (
    <List
      loading={loading}
      dataSource={comments}
      locale={{
        emptyText: <EmptyState description="暂无评论" />
      }}
      renderItem={(comment) => (
        <List.Item>
          <Comment
            author={<a>{comment.user.username}</a>}
            avatar={<Avatar src={comment.user.avatar} alt={comment.user.username}>{comment.user.username.charAt(0).toUpperCase()}</Avatar>}
            content={<p>{comment.content}</p>}
            datetime={
              <Tooltip title={new Date(comment.createdAt).toLocaleString()}>
                <span>{formatRelativeTime(comment.createdAt)}</span>
              </Tooltip>
            }
            actions={[
              canDeleteComment(comment) && onDelete && (
                <Popconfirm
                  key="delete"
                  title="确定要删除这条评论吗？"
                  onConfirm={() => onDelete(comment._id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />}
                    size="small"
                  >
                    删除
                  </Button>
                </Popconfirm>
              ),
            ].filter(Boolean)}
          />
        </List.Item>
      )}
    />
  );
};

export default CommentList;