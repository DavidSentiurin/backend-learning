import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class HashUtil {
  async hash(value: string) {
    return argon2.hash(value);
  }

  async verify(value: string, hash: string) {
    return argon2.verify(hash, value);
  }
}
