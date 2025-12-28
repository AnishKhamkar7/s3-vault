import crypto from 'node:crypto';
import { env } from './env';

const ALGO = 'aes-256-gcm';
const KEY = Buffer.from(env.S3_ENC_KEY, 'hex');

export function encrypt(text: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);

  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

  const tag = cipher.getAuthTag();
    
  return {
    value: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

export function decrypt(hash: string) {
  const [ivHex, tagHex, encryptedHex] = hash.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGO, Buffer.from(KEY), iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString('utf8');
}
