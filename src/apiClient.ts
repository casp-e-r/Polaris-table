import axios, { AxiosResponse } from "axios";

const apiClient = () => {
  const defaultOptions = {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fakestoreapi.com/',
    timeout: 150000,
  };

  const instance = axios.create(defaultOptions);

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error:any) => {
        throw new Error(error.message);
    },
  );

  return instance;
};

export default apiClient();