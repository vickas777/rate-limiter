import { Response } from './Response';

class RedirectResponse implements Response {
  private code: number;

  constructor(code: number) {
    this.code = code;
  }

  getCode() {
    return this.code;
  }
}

export default RedirectResponse;
