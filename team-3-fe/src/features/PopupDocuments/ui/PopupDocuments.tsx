import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  Typography,
  Button,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CloseIcon from '@/shared/icons/CloseIcon.tsx';
import { UploadIcon } from '@/shared/icons/UploadIcon.tsx';
import { RoleSelect } from '@/shared/components/RoleSelect';
import { StyledButton } from '@/shared/components/StyledButton';
import { useEffect, useRef, useState } from 'react';
import { useDocumentsGridStore } from '@/entities/DataGridDocuments';
import { useAuthStore } from '@/entities/user/model/store.ts';
import { type DocumentsFormData, schemaDocuments } from '@/features/PopupDocuments/model/schema.ts';

import { useCategoriesStore } from '@/features/document-categories/model/store.ts';
import { useCreateDocument } from '@/shared/queries';
import { useRolesStore } from '@/entities/user/role-label/model/store';

const VisuallyHiddenInput = styled('input')({
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export const PopupDocuments = () => {
  const { popupOpen, setPopupOpen, addDocument } = useDocumentsGridStore();
  const { user } = useAuthStore();
  const { categories, getCategoryById, selectedCategory } = useCategoriesStore();
  const { getRoleById } = useRolesStore();

  const { mutateAsync: createDocument, isPending } = useCreateDocument();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const isSmall = useMediaQuery('(max-width:1350px)');
  const [isDragActive, setIsDragActive] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<DocumentsFormData>({
    resolver: zodResolver(schemaDocuments),
    mode: 'onChange',
    defaultValues: {
      category_id: selectedCategory?.id ?? 0,
      accessible_role: 5,
      title: '',
      pdf_path: undefined,
    },
  });

  useEffect(() => {
    reset({
      category_id: selectedCategory?.id ?? 0,
      accessible_role: 5,
      title: '',
      pdf_path: undefined,
    });
  }, [selectedCategory, reset]);

  const file = watch('pdf_path');

  const openFileDialog = () => inputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setValue('pdf_path', selectedFile);
    await trigger('pdf_path');
  };

  const removeFile = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue('pdf_path', undefined);
    if (inputRef.current) inputRef.current.value = '';
    await trigger('pdf_path');
  };

  const handleClose = () => {
    setPopupOpen(false);
    reset();
  };

  const submitForm = async (data: DocumentsFormData) => {
    if (!data.pdf_path) return;

    if (data.pdf_path) {
      const { photo_path: uploadedPath } = await createDocument({
        ...data,
        category_id: Number(data.category_id),
        accessible_role: Number(data.accessible_role),
        file: data.pdf_path,
      });
      addDocument({
        ...data,
        user_id: user?.id!,
        first_name: user?.first_name!,
        last_name: user?.last_name!,
        photo_path: user?.photoPath!,
        pdf_path: uploadedPath,
        role_id: user?.role_id!,
        category: getCategoryById(data.category_id)!,
        accessible_role: getRoleById(data.accessible_role)!,
        likes_count: 0,
        comments_count: 0,
        is_liked: false,
        is_viewed: false,
        created_at: new Date().toISOString(),
      });
    }
    setPopupOpen(false);
    reset();
    if (inputRef.current) inputRef.current.value = '';
  };

  // Drag and Drop logic
  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    preventDefaults(e);
    setIsDragActive(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    preventDefaults(e);
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    preventDefaults(e);
    setIsDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    preventDefaults(e);
    setIsDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const selectedFile = droppedFiles[0];
      setValue('pdf_path', selectedFile);
      await trigger('pdf_path');
    }
  };
  const truncateMiddle = (str: string, maxLength: number) => {
    if (str.length <= maxLength) return str;
    const keep = Math.floor(maxLength / 2);
    return str.slice(0, keep) + '...' + str.slice(str.length - keep);
  };
  return (
    <Dialog
      open={popupOpen}
      onClose={handleClose}
      BackdropProps={{ sx: { backgroundColor: 'rgba(34, 30, 28, 0.3)' } }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 500 }}>
        <Typography variant="h3">Добавление документа</Typography>
      </DialogTitle>

      <DialogContent>
        <Box
          component="form"
          id="document-form"
          onSubmit={handleSubmit(submitForm)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
            pt: '10px',
            minWidth: !isSmall ? '336px' : '157px',
          }}
        >
          {/* Категория */}
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <RoleSelect
                required
                label="Категория документа"
                id="popup-category-id-select"
                value={field.value}
                fontSize="14px"
                options={categories}
                onChange={(category_id: number) => field.onChange(category_id)}
                disabled={isPending}
                helperText={errors.category_id?.message}
                sx={{
                  position: 'relative',
                  '& .MuiSelect-icon': {
                    width: '20px',
                    height: '20px',
                    top: '24%',
                    left: '90%',
                  },
                }}
              />
            )}
          />

          {/* Доступ */}
          <Controller
            name="accessible_role"
            control={control}
            render={({ field }) => (
              <RoleSelect
                label="Кому доступен документ"
                required
                options={[
                  { id: 1, name: 'Администратор' },
                  { id: 2, name: 'HR-специалист' },
                  { id: 3, name: 'Менеджер' },
                  { id: 4, name: 'Специалист' },
                  { id: 5, name: 'Все сотрудники' },
                ]}
                sx={{
                  '& .MuiSelect-icon': {
                    width: '20px',
                    height: '20px',
                    top: '24%',
                    left: '90%',
                  },
                }}
                onChange={field.onChange}
                disabled={isPending}
                error={!!errors.accessible_role}
                FormHelperTextProps={{
                  sx: { position: 'absolute', transform: 'translateY(175%)' },
                }}
                helperText={errors.accessible_role?.message}
              />
            )}
          />

          {/* Название документа */}
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                label="Название документа"
                variant="outlined"
                size="small"
                fullWidth
                disabled={isPending}
                onChange={(e) => field.onChange(e.target.value.replace(/\s{2,}/g, ' '))}
                error={!!errors.title}
                helperText={errors.title?.message}
                FormHelperTextProps={{
                  sx: { position: 'absolute', transform: 'translateY(175%)' },
                }}
              />
            )}
          />

          {/* Загрузка файла с Drag & Drop */}
          <Box
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            <Button
              variant="outlined"
              color="secondary"
              sx={{
                justifyContent: 'space-between',
                color: errors.pdf_path ? 'rgb(255, 93, 82)' : 'var(--text-dark)',
                height: '36px',
                flexGrow: 1,
                textTransform: 'none',
                padding: '6px 10px',
                // если ошибка — красная рамка
                borderColor: isDragActive
                  ? '#4C4DD6'
                  : errors.pdf_path
                    ? 'rgb(255, 93, 82)'
                    : '#E8E8FF',
                borderWidth: errors.pdf_path ? '1px' : undefined,
                borderStyle: isDragActive ? 'dashed' : errors.pdf_path ? 'solid' : undefined,
                // если активный drag — визуально подсвечиваем (как focus)
                transition: 'outline 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
              }}
              disabled={isPending}
              onClick={openFileDialog}
            >
              <VisuallyHiddenInput
                ref={inputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              {file ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                    <span>Добавлен файл</span>
                    <span
                      style={{
                        marginLeft: '10px',
                        color: 'var(--text-dark)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '150px',
                      }}
                    >
                      {truncateMiddle(file.name, 20)}
                    </span>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={removeFile}
                    sx={{ color: 'var(--text-dark)' }}
                    disabled={isPending}
                  >
                    <CloseIcon width="20px" height="20px" />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <span>Добавить файл</span>
                  <IconButton size="small" sx={{ color: 'var(--text-dark)' }} disabled={isPending}>
                    <UploadIcon />
                  </IconButton>
                </Box>
              )}
            </Button>
            {errors.pdf_path?.message && (
              <Typography
                color="error"
                variant="caption"
                sx={{
                  ml: '12px',
                  position: 'absolute',
                  transform: 'translateY(175%)',
                }}
              >
                {String(errors.pdf_path.message)}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <StyledButton
          sx={{ height: '40px' }}
          variantStyle="outlined"
          text="Отмена"
          disabled={isPending}
          onClick={handleClose}
        />
        <StyledButton
          sx={{ height: '40px' }}
          text={isPending ? 'Добавляем...' : 'Добавить'}
          type="submit"
          form="document-form"
          disabled={!isValid || isPending}
        />
      </DialogActions>
    </Dialog>
  );
};
