import { useState, useCallback } from 'react';
import { Box, TextField, Avatar, IconButton, Typography, CircularProgress } from '@mui/material';
import { PhotoIcon } from '@/shared/icons/PhotoIcon';
import DeleteIcon from '@/shared/icons/DeleteIcon';
import { EditIcon } from '@/shared/icons/EditIcon';
import { ConfirmDeleteModal } from '@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal';
import { notify } from '@/app/providers/NotificationProvider/notificationService';
import { StyledButton } from '@/shared/components/StyledButton';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileFormSchema, type ProfileFormData } from '@/features/edit-profile/model/schema.ts';
import { useAuthStore } from '@/entities/user/model/store.ts';
import { useUpdateProfile, useUploadPhoto } from '@/shared/queries';
 

export const EditProfileForm = () => {
  const { user, setUser } = useAuthStore();
  const [photo, setPhoto] = useState<string | undefined>(user?.photoPath || undefined);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [errorBorder, setErrorBorder] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
    },
    mode: 'onChange',
  });

  const isChanged =
    photo !== (user?.photoPath || undefined) ||
    watch('firstName') !== (user?.first_name || '') ||
    watch('lastName') !== (user?.last_name || '');

  const { mutateAsync: uploadPhoto, isPending: uploading } = useUploadPhoto();

  const { mutateAsync: updateProfile, isPending: saving } = useUpdateProfile();

  /** Общая функция загрузки фото */
  const handleFileLoad = useCallback((file: File) => {
    if (!file) return;

    const allowedExtensions = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedExtensions.includes(file.type)) {
      setErrorBorder(true);
      notify({ message: 'Недопустимый файл', severity: 'warning' });
      return;
    }

    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorBorder(true);
      notify({ message: 'Недопустимый файл', severity: 'warning' });
      return;
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;

      img.onload = () => {
        if (img.width < 640 || img.height < 640) {
          setLoading(false);
          setErrorBorder(true);
          notify({ message: 'Недопустимый файл', severity: 'warning' });
          return;
        }

        // Сохраняем и сам файл для бэка, и data URL для превью (если нужно)
        setFile(file); // <-- здесь сохраняем именно File
        setPhoto(reader.result as string); // <-- если нужен превью
        setErrorBorder(false);
        setLoading(false);
        notify({ message: 'Фото успешно загружено', severity: 'success' });
      };

      img.onerror = () => {
        setLoading(false);
        setErrorBorder(true);
        notify({ message: 'Ошибка загрузки фото', severity: 'error' });
      };
    };

    reader.onerror = () => {
      setLoading(false);
      setErrorBorder(true);
      notify({ message: 'Ошибка загрузки фото', severity: 'error' });
    };

    reader.readAsDataURL(file);
  }, []);

  /** Обработка выбора файла */
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileLoad(file);
  };

  /** Drag & Drop обработка */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFileLoad(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleRemovePhoto = () => setOpenConfirm(true);

  const handleConfirmRemove = () => {
    setPhoto(undefined);
    setOpenConfirm(false);
    notify({ message: 'Фото удалено', severity: 'info' });
  };

  /** Сохранение профиля */
  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    let photo_path: string | null | undefined;

    // если выбрали новый файл — сначала грузим, берём URL
    if (file) {
      const { photo_path: uploadedPath } = await uploadPhoto({ id: user.id, file });
      photo_path = uploadedPath; // присвоим новое фото
    } else {
      photo_path = photo;
    }

    const payload = {
      user_id: user.id,
      first_name: data.firstName,
      last_name: data.lastName,
      photo_path,
    } as const;
    console.log('updateProfile payload:', JSON.stringify(payload));

    await updateProfile(payload);

    setUser({
      ...user,
      first_name: data.firstName,
      last_name: data.lastName,
      photoPath: photo,
    });

    notify({ message: 'Профиль сохранён', severity: 'success' });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
    >
      {/* Фото */}
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          borderRadius: '16px',
          bgcolor: 'var(--divider-default)',
          border: isDragOver
            ? '2px dashed var(--primary-100)'
            : errorBorder
              ? '2px solid #FF4D4F'
              : '2px solid transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          width: 200,
          height: 200,
          alignSelf: 'center',
          position: 'relative',
          transition: 'border 0.2s ease',
          outline: 'none',
        }}
      >
        {loading || uploading || saving ? (
          <CircularProgress />
        ) : photo ? (
          <>
            <Avatar
              src={photo}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '16px',
              }}
              variant="square"
            />
            <Box sx={{ position: 'absolute', bottom: 8, display: 'flex', gap: 1 }}>
              <IconButton
                component="label"
                size="small"
                sx={{ bgcolor: 'var(--secondary-100)', '&:hover': { bgcolor: 'var(--bg-disabled-dark)' }, borderRadius: '8px' }}
              >
                <EditIcon />
                <input
                  type="file"
                  hidden
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handlePhotoChange}
                />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleRemovePhoto}
                sx={{
                  bgcolor: 'var(--secondary-100)',
                  '&:hover': { bgcolor: 'var(--bg-disabled-dark)' },
                  borderRadius: '8px',
                  '& svg': { color: 'var(--bg-dark)' },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </>
        ) : (
          <IconButton
            component="label"
            sx={{
              borderRadius: '16px',
              bgcolor: 'var(bg-surface-3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              color: 'var(--primary-100)',
              '&:hover': { bgcolor: 'var(--tertiary-active)' },
            }}
          >
            <PhotoIcon />
            <Typography variant="body2" sx={{ fontSize: 14, color: 'var(--text-dark)', mt: 1 }}>
              Добавить фото
            </Typography>
            <input type="file" hidden accept=".jpg,.jpeg,.png,.webp" onChange={handlePhotoChange} />
          </IconButton>
        )}
      </Box>

      {/* Имя */}
      <Controller
        name="firstName"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Имя"
            size="small"
            fullWidth
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            onChange={(e) => field.onChange(e.target.value.replace(/\s+/g, ''))}
          />
        )}
      />

      {/* Фамилия */}
      <Controller
        name="lastName"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Фамилия"
            size="small"
            fullWidth
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            onChange={(e) => field.onChange(e.target.value.replace(/\s+/g, ''))}
          />
        )}
      />

      <StyledButton
        disabled={!isValid || !isChanged}
        variantStyle="filled"
        text="Сохранить"
        type="submit"
      />

      <ConfirmDeleteModal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmRemove}
      />
    </Box>
  );
};
