export class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function badRequest(message, code = 'BAD_REQUEST') {
  return new HttpError(400, message, code);
}

export function unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
  return new HttpError(401, message, code);
}

export function forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
  return new HttpError(403, message, code);
}

export function notFoundError(message = 'Not found', code = 'NOT_FOUND') {
  return new HttpError(404, message, code);
}
