import axios from 'axios';

export const verifyEmail = async (token: string, userID: number) => {
  return axios.get('http://localhost:8080/api/v1/auth/verify-email', {
    params: { token, user_id: userID },
  });
};
