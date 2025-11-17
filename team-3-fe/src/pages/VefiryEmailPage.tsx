// VerifyEmailPage.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const userId = params.get('user_id');

    if (!token || !userId) {
      navigate('/error');
      return;
    }
    axios
      .post('http://localhost:8080/api/v1/auth/verify-email', {
        token,
        user_id: Number(userId),
      })
      .then(() => {
        navigate(`/confirm-password?user_id=${userId}&token=${token}`);
      })
      .catch(() => {
        navigate('/error');
      });
  }, [params, navigate]);

  return <>Проверяем ссылку...</>;
};
