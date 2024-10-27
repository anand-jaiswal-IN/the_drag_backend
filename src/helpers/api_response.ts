import { Response } from "express";

function api_success_response(
  res: Response,
  status: number,
  message: string,
  data?: object
) {
  if (!data) {
    return res.status(status).json({
      message: message,
    });
  }
  return res.status(status).json({
    message: message,
    data: data,
  });
}

function api_response_error(res: Response, status: number, message: string) {
  return res.status(status).json({
    message: message,
  });
}

export { api_success_response, api_response_error };
