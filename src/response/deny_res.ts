import { Response } from './Response';

class DenyResponse implements Response {
  private code: number;

  private message: string;

  constructor(code: number, message: string) {
    this.code = code;
    this.message = message;
  }

  getCode(): number {
    return this.code;
  }

  getMessage(): string {
    return this.message;
  }
}

export default DenyResponse;
