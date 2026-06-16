import { Injectable, OnModuleInit } from '@nestjs/common';
import * as crypto from 'node:crypto';

@Injectable()
export class CryptoService implements OnModuleInit {
  private publicKey: string;
  private privateKey: string;

  onModuleInit() {
    this.generateKeys();
  }

  private generateKeys() {
    // Generate RSA key pair (2048 bits)
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  public getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Decrypts a base64 encoded string that was encrypted with the public key on the frontend.
   */
  public decrypt(encryptedBase64: string): string {
    try {
      const buffer = Buffer.from(encryptedBase64, 'base64');
      const decrypted = crypto.privateDecrypt(
        {
          key: this.privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        buffer,
      );
      return decrypted.toString('utf8');
    } catch (e) {
      console.error('Crypto error:', e);
      throw new Error('Failed to decrypt data. Invalid payload or wrong key.');
    }
  }
}
