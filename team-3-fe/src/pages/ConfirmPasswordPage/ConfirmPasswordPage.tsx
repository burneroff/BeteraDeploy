import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, TextField, Typography, Paper, IconButton, InputAdornment } from '@mui/material';
import { StyledButton } from '@/shared/components/StyledButton';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Visibility } from '@/shared/icons/Visibility';
import { VisibilityOff } from '@/shared/icons/VisibilityOff';
import { CircleIcon } from '@/shared/icons/CircleIcon';
import SuccessIcon from '@/shared/icons/SuccessIcon';
import { notify } from '@/app/providers/NotificationProvider/notificationService';
import { type PasswordFormData, passwordSchema } from '@/pages/ConfirmPasswordPage/model/schema';
import { useConfirmPassword } from '@/shared/queries';

export const ConfirmPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const userId = Number(searchParams.get('user_id'));

  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const { mutateAsync: confirmPassword, isPending } = useConfirmPassword();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: { password: '' },
  });

  const isChanged = Object.keys(dirtyFields).length > 0;

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const checks = useMemo(() => {
    const lengthValid = passwordValue.length >= 6 && passwordValue.length <= 30;
    const patternValid = /^(?=.*[A-Za-z])(?=.*\d)/.test(passwordValue);
    return { lengthValid, patternValid, strong: lengthValid && patternValid };
  }, [passwordValue]);

  const onSubmit = async ({ password }: PasswordFormData) => {
    if (!token || !userId) return;

    try {
      await confirmPassword({ user_id: userId, token, password });
      notify({ message: 'Пароль успешно установлен', severity: 'success' });
      navigate('/', { replace: true });
    } catch (err: any) {
      notify({
        message: err?.response?.data?.message || 'Ошибка при подтверждении пароля',
        severity: 'error',
      });
    }
  };

  // если нет нужных параметров → редирект через 5 сек
  const isLinkValid = Boolean(token && userId);
  useEffect(() => {
    if (!isLinkValid) {
      const timer = setTimeout(() => navigate('/login', { replace: true }), 5000);
      return () => clearTimeout(timer);
    }
  }, [isLinkValid, navigate]);

  if (!isLinkValid) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'var(--bg-surface-3)',
        }}
      >
        <Paper
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 500,
            boxShadow: 'none',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="h3" textAlign="center" sx={{ fontWeight: 500, color: '#CF2E20' }}>
            Неверная или устаревшая ссылка подтверждения.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
            Вы будете перенаправлены на страницу входа…
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Основной экран
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'var(--bg-surface-3)',
      }}
    >
      <Paper
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 500,
          boxShadow: 'none',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h2" textAlign="center" sx={{ fontWeight: 500, mb: '28px' }}>
          Подтверждение пароля
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: isValid ? '20px' : '28px',
            width: '100%',
          }}
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                size="small"
                required
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message || null}
                onChange={(e) => {
                  field.onChange(e);
                  setPasswordValue(e.target.value);
                }}
                inputProps={{ style: { fontFamily: 'monospace' } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {passwordValue && (
            <Box sx={{ ml: '14px', height: isValid ? '96px' : '80px' }}>
              {!checks.strong ? (
                <>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Ваш пароль должен содержать:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    {checks.lengthValid ? <SuccessIcon /> : <CircleIcon />}
                    <Typography variant="body2">От 6 до 30 символов</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {checks.patternValid ? <SuccessIcon /> : <CircleIcon />}
                    <Typography variant="body2">Цифры, латинские буквы и спецсимволы</Typography>
                  </Box>
                </>
              ) : (
                isValid && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SuccessIcon />
                    <Typography variant="body2">Пароль надёжный</Typography>
                  </Box>
                )
              )}
            </Box>
          )}

          <StyledButton
            type="submit"
            variantStyle="filled"
            fullWidth
            text={isPending ? 'Сохраняем пароль...' : 'Сохранить пароль'}
            disabled={!isValid || !isChanged || isPending}
          />
        </Box>
      </Paper>
    </Box>
  );
};
