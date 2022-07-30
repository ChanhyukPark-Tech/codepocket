import {
  DeleteCodeRequest,
  GetCodeNamesRequest,
  PullCodeRequest,
  PushCodeRequest,
} from '@pocket/schema';
import { to } from 'await-to-js';
import axios, { AxiosResponse } from 'axios';

import { BASE_DEV_URL, BASE_PROD_URL } from './env';

// Response
interface ResponseType<T> extends AxiosResponse {
  data: T;
}
export type DefaultResponseData = { message: string };
export type PullCodeAPIResponseData = { code: string };
export type ListCodeAPIResponseData = { fileNames: string[]; authors: string[] };

// Error
interface ErrorType<T> extends AxiosResponse {
  response: {
    data: T;
  };
}

export type ServerResponseData = { message: string };
export type NetworkResponseData = string;
export type ServerError = ErrorType<ServerResponseData>;
export type NetworkError = ErrorType<NetworkResponseData>;
type ResponseError = ServerError | NetworkError;

const isNetworkError = (err: ResponseError): err is NetworkError =>
  typeof err.response.data === 'string';

const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? BASE_DEV_URL : BASE_PROD_URL,
});

export const pushCodeAPI = async (body: PushCodeRequest['body']) => {
  const [err, res] = await to<ResponseType<DefaultResponseData>, ResponseError>(
    axiosInstance.post('/code', body),
  );
  if (err) throw new Error(isNetworkError(err) ? err.response.data : err.response.data.message);
  return res.data.message;
};

export const pullCodeAPI = async (query: PullCodeRequest['query']) => {
  const [err, res] = await to<ResponseType<PullCodeAPIResponseData>, ResponseError>(
    axiosInstance.get(`/code?codeName=${query.codeName}&codeAuthor=${query.codeAuthor}`),
  );
  if (err) throw new Error(isNetworkError(err) ? err.response.data : err.response.data.message);
  return res.data.code;
};

export const listCodeAPI = async (body: GetCodeNamesRequest['query']) => {
  const [err, res] = await to<ResponseType<ListCodeAPIResponseData>, ResponseError>(
    axiosInstance.get(`/code/list?codeAuthor=${body.codeAuthor}&codeName=${body.codeName}`),
  );
  if (err) throw new Error(isNetworkError(err) ? err.response.data : err.response.data.message);
  return res.data;
};

export const deleteCodeAPI = async (body: DeleteCodeRequest['body']) => {
  const [err, res] = await to<ResponseType<DefaultResponseData>, ResponseError>(
    axiosInstance.post('/code/delete', body),
  );
  if (err) throw new Error(isNetworkError(err) ? err.response.data : err.response.data.message);
  return res.data;
};
