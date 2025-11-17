// src/entities/Comments/ui/Comments.tsx
import { Box, Avatar, Typography, IconButton, CircularProgress } from '@mui/material';
import DeleteIcon from '@/shared/icons/DeleteIcon';
import { useComments } from '@/shared/queries/useComments';
import { useAuthStore } from '@/entities/user/model/store';
import { useDocumentsGridStore } from '@/entities/DataGridDocuments';
import { isAdminOrStaff } from '@/features/admin-staff/AdminStaff.tsx';
import { useDeleteComment } from '@/shared/queries/useDeleteComment.ts';

export const Comments = () => {
  const { user } = useAuthStore();
  const { selectedRow, deleteComm } = useDocumentsGridStore();
  const { data: comments, isLoading } = useComments(selectedRow?.id);
  const { mutate: deleteComment } = useDeleteComment();

  const handleDelete = (commentId: number) => {
    if (!selectedRow?.id) return;

    deleteComment(
      {
        documentId: selectedRow.id,
        commentId,
      },
      {
        onSuccess: () => {
          deleteComm();
        },
      },
    );
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          mt: 4.2,
          overflowY: 'auto',
          pr: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          ml: 0.8,
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!comments?.length) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          mt: 1,
          overflowY: 'auto',
          pr: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <Typography
          sx={{
            color: 'var(--text-dark)',
            textAlign: 'center',
            fontSize: '14px',
            mt: 2,
          }}
        >
          Пока нет комментариев
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: 1,
        overflowY: 'auto',
        pr: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          mt: 1,
          overflowY: 'auto',
          pr: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {comments.map((comment) => (
          <Box
            key={comment.id}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: '8px',
              width: '100%',
            }}
          >
            <Avatar
              src={comment.photo_path || undefined}
              alt={`commentUserImage${comment.first_name}${comment.last_name}`}
              variant="rounded"
              sx={{
                width: 38,
                height: 38,
                background: '#E8E8FF',
                borderRadius: '8px',
                color: 'var(--text-dark)',
                fontSize: '16px',
                lineHeight: '18px',
                marginTop: '8px',
                fontWeight: 400,
              }}
            />

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                p: '4px',
                width: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Typography
                  sx={{
                    lineHeight: '1.2',
                    fontWeight: 500,
                    minHeight: 'auto',
                  }}
                >
                  {comment.first_name + ' ' + comment.last_name}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '9px',
                  }}
                >
                  <Typography
                    sx={{
                      color: 'var(--text-dark)66',
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {new Date(comment.created_at).toLocaleString('ru-RU')}
                  </Typography>

                  {(isAdminOrStaff(user) || user?.id === comment.user_id) && (
                    <IconButton
                      sx={{ padding: 0, mt: '-2px', '&:hover': { backgroundColor: 'transparent' } }}
                      onClick={() => handleDelete(comment.id)}
                    >
                      <DeleteIcon color="#221E1C" />
                    </IconButton>
                  )}
                </Box>
              </Box>

              <Typography sx={{ lineHeight: '1.2' }}>{comment.text}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
