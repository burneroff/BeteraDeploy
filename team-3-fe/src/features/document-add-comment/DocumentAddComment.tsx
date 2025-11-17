import { Box, TextField, IconButton } from '@mui/material';
import { SendIcon } from '@/shared/icons/SendIcon.tsx';

import { useDocumentsGridStore } from '@/entities/DataGridDocuments';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  type FormCommentsData,
  schemaComments,
} from '@/features/document-add-comment/model/schema.ts';
import { useAddComment } from '@/shared/queries/useAddComment';

export const DocumentAddComment = () => {
  const { selectedRow, addComm } = useDocumentsGridStore();
  const { mutate: addComment, isPending } = useAddComment(selectedRow?.id!);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid },
  } = useForm<FormCommentsData>({
    resolver: zodResolver(schemaComments),
    mode: 'onChange', // валидация при каждом изменении
    defaultValues: { comment: '' },
  });

  const onSubmit = (data: FormCommentsData) => {
    addComment(data.comment, {
      onSuccess: () => {
        addComm();
        reset();
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isValid && !isPending) handleSubmit(onSubmit)();
    }
  };

  const isButtonDisabled = !isValid || isPending;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        mt: 2,
        mb: 2,
        flexShrink: 0,
      }}
    >
      <TextField
        autoFocus
        variant="outlined"
        size="small"
        margin="dense"
        id="comment"
        label="Комментарий"
        type="text"
        fullWidth
        disabled={isPending}
        {...register('comment')}
        error={!!errors.comment && !!getValues('comment')}
        helperText={!!getValues('comment') ? errors.comment?.message : ''}
        onKeyDown={handleKeyDown}
      />

      <IconButton
        onClick={handleSubmit(onSubmit)}
        disabled={isButtonDisabled}
        sx={{
          '&:hover': { backgroundColor: 'transparent' }, // убираем hover эффект
        }}
      >
        <SendIcon
          style={{ transition: 'color 0.2s ease-in' }}
          color={isButtonDisabled ? '#B0B0B0' : '#221E1C'}
        />
      </IconButton>
    </Box>
  );
};
