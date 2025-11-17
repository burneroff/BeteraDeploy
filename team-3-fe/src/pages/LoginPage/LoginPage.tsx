import { useState } from 'react';
import { Box, TextField, Typography, Paper, IconButton, InputAdornment } from '@mui/material';
import { StyledButton } from '@/shared/components/StyledButton';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Visibility } from '@/shared/icons/Visibility.tsx';
import { VisibilityOff } from '@/shared/icons/VisibilityOff.tsx';
import { type LoginFormData, loginSchema } from '@/pages/LoginPage/model/schema.ts';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '@/shared/queries/auth/useLogin';

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { mutateAsync: login, isPending } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const isChanged = Object.keys(dirtyFields).length > 0;

  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  const onSubmit = async (data: LoginFormData) => {
    const { verified } = await login({ email: data.email.trim(), password: data.password });
    navigate(verified ? '/' : '/confirm-password');
  };

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
        <Typography variant="h2" textAlign="center" mb={2} sx={{ fontWeight: 500 }}>
          Авторизация
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: '26px', width: '100%' }}
        >
          {/* Email */}
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                size="small"
                fullWidth
                required
                onChange={(e) => field.onChange(e.target.value.replace(/\s+/g, ''))}
                onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isPending}
              />
            )}
          />

          {/* Пароль */}
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
                onChange={(e) => field.onChange(e.target.value.replace(/\s+/g, ''))}
                onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isPending}
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

          <StyledButton
            type="submit"
            variantStyle="filled"
            fullWidth
            text={isPending ? 'Входим…' : 'Войти'}
            disabled={!isValid || !isChanged || isPending}
          />
        </Box>
      </Paper>
    </Box>
  );
};
