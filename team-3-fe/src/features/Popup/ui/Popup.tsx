import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { StyledButton } from '@/shared/components/StyledButton';
import { RoleSelect } from '@/shared/components/RoleSelect';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userAddFormSchema, type UserAddFormData } from '../model/schema';
import { useAdminGridStore } from '@/entities/DataGridAdmin';
import { useRegister } from '@/shared/queries';

export const Popup = () => {
  const { popupOpen, setPopupOpen, addUser } = useAdminGridStore();
  const isSmall = useMediaQuery('(max-width:1350px)');
  const { mutate: registerUser, isPending } = useRegister();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isValid, dirtyFields },
  } = useForm<UserAddFormData>({
    resolver: zodResolver(userAddFormSchema),
    defaultValues: { first_name: '', last_name: '', email: '', role_id: 0 },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const isChanged = Object.keys(dirtyFields).length > 0;

  const handleClose = () => {
    reset();
    setPopupOpen(false);
  };

  const onFormSubmit = (values: UserAddFormData) => {
    if (!isValid || isPending) return;

    registerUser(
      {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        role_id: Number(values.role_id),
      },
      {
        onSuccess: () => {
          addUser({
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            role_id: Number(values.role_id),
          });
          handleClose();
        },
        onError: (err: any) => {
          if (err?.response?.status === 409) {
            setError('email', {
              type: 'manual',
              message: 'Данный email уже зарегистрирован в системе',
            });
          }
          console.group('%c❌ REGISTER ERROR', 'color:#e74c3c;font-weight:bold');
          console.log('status:', err?.response?.status);
          console.log('data:', err?.response?.data);
          console.log('headers:', err?.response?.headers);
          console.groupEnd();
        },
      },
    );
  };

  return (
    <Dialog
      open={popupOpen}
      onClose={handleClose}
      BackdropProps={{ sx: { backgroundColor: 'rgba(34, 30, 28, 0.3)' } }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 500 }}>
        <Typography variant="h3" component="h2">
          Добавление пользователя
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ marginBottom: '8px' }}>
        <form onSubmit={handleSubmit(onFormSubmit)} id="addUser-form">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '26px',
              m: '8px',
              width: 'auto',
              minWidth: !isSmall ? '336px' : '157px',
              height: '240px',
            }}
          >
            {/* Имя */}
            <Controller
              name="first_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Имя"
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled={isPending}
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                  onChange={(e) => field.onChange(e.target.value.replace(/\s+/g, ''))}
                />
              )}
            />

            {/* Фамилия */}
            <Controller
              name="last_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Фамилия"
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled={isPending}
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                  onChange={(e) => field.onChange(e.target.value.replace(/\s+/g, ''))}
                />
              )}
            />

            {/* Роль */}
            <Controller
              name="role_id"
              control={control}
              render={({ field }) => (
                <RoleSelect
                  required
                  id="popup-role-select"
                  value={field.value || undefined}
                  fontSize="14px"
                  onChange={(roleId: number) => field.onChange(roleId)}
                  disabled={isPending}
                  helperText={errors.role_id?.message}
                  FormHelperTextProps={{
                    sx: { position: 'absolute', transform: 'translateY(175%)' },
                  }}
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

            {/* Email */}
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled={isPending}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  FormHelperTextProps={{
                    sx: { position: 'absolute', transform: 'translateY(175%)' },
                  }}
                  sx={{ position: 'relative' }}
                  onChange={(e) => field.onChange(e.target.value.replace(/\s+/g, ''))}
                />
              )}
            />
          </Box>
        </form>
      </DialogContent>

      <DialogActions>
        <StyledButton
          sx={{ height: '40px' }}
          variantStyle="outlined"
          text="Отмена"
          onClick={handleClose}
          disabled={isPending}
        />
        <StyledButton
          sx={{ height: '40px' }}
          variantStyle="filled"
          text={isPending ? 'Добавляем…' : 'Добавить'}
          type="submit"
          form="addUser-form"
          disabled={!isValid || !isChanged || isPending}
        />
      </DialogActions>
    </Dialog>
  );
};
