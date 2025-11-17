import { Typography, Box, IconButton, Avatar } from '@mui/material';
import { StyledButton } from '@/shared/components/StyledButton';
import CloseIcon from '@/shared/icons/CloseIcon.tsx';
import { useDocumentsGridStore } from '@/entities/DataGridDocuments';
import { type Dispatch, type SetStateAction } from 'react';
import { Title } from '@/shared/components/Title';
import { LikeButton } from '@/features/document-like/LikeButton.tsx';
import { Comments } from '@/features/document-comments/Comments.tsx';
import { DocumentAddComment } from '@/features/document-add-comment/DocumentAddComment.tsx';
import { DocumentViewButton } from '@/features/document-add-view/DocumentViewButton.tsx';
import DocumentViewers from '@/features/document-viewers/DocumentViewers.tsx';

interface DocumentSectionProps {
  setShowRight: Dispatch<SetStateAction<boolean>>;
  isSmall: boolean;
}

export const DocumentSection: React.FC<DocumentSectionProps> = ({ setShowRight, isSmall }) => {
  const { selectedRow, setOpenPdf } = useDocumentsGridStore();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 1,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Верхняя часть документа */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', flexShrink: 0 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '10px',
          }}
        >
          <Title
            sx={{ fontSize: '18px !important', height: '24px', lineHeight: '20px' }}
            text={selectedRow?.title}
          />
          <IconButton
            onClick={() => {
              setOpenPdf(false);
            }}
            sx={{ padding: 0 }}
          >
            <CloseIcon color={'var(--bg-dark)'} />
          </IconButton>
        </Box>
        <Box display="flex" alignItems="center">
          <Typography
            variant="body2"
            sx={{ marginRight: '10px', fontSize: '16px', color: 'var(--text-soft)' }}
          >
            Добавил:
          </Typography>
          <Avatar
            src={selectedRow?.photo_path || undefined}
            alt={'userImage'}
            variant="rounded"
            sx={{
              width: 24,
              height: 24,
              background: '#E8E8FF',
              borderRadius: '6px',
              color: 'var(--text-dark)',
              fontSize: '12px',
              lineHeight: '18px',
              fontWeight: 400,
            }}
          />
          <Typography
            variant="body2"
            sx={{ marginLeft: '4px', fontSize: '14px', color: 'var(--text-dark)' }}
          >
            {selectedRow?.first_name + ' ' + selectedRow?.last_name}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: isSmall ? 'column' : 'row', gap: '16px' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <LikeButton />
              <Typography>{selectedRow?.likes_count}</Typography>
            </Box>
            <DocumentViewers />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
            <DocumentViewButton />
            {isSmall && (
              <StyledButton
                text={'Открыть PDF'}
                variantStyle="delete"
                size="small"
                onClick={() => setShowRight(false)}
                sx={{ maxWidth: '157px' }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Раздел комментариев */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          overflow: 'hidden',
          mt: '10px',
        }}
      >
        <Title sx={{ fontSize: '16px !important', height: '24px' }} text={'Комментарии'} />

        {/* Список комментариев с прокруткой */}
        <Comments />

        {/* Поле ввода нового комментария */}
        <DocumentAddComment />
      </Box>
    </Box>
  );
};
