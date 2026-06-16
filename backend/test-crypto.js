const crypto = require('crypto');
const { webcrypto } = crypto;

async function test() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = publicKey.substring(pemHeader.length, publicKey.length - pemFooter.length).trim().replace(/\s/g, '');
  const binaryDerString = Buffer.from(pemContents, 'base64');
  
  const cryptoKey = await webcrypto.subtle.importKey(
    "spki",
    binaryDerString,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );

  const encoder = new TextEncoder();
  const encryptedBuffer = await webcrypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    cryptoKey,
    encoder.encode("mysecretpassword")
  );
  
  const encryptedBase64 = Buffer.from(encryptedBuffer).toString('base64');
  
  try {
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(encryptedBase64, 'base64')
    );
    console.log("Decrypted successfully:", decrypted.toString('utf8'));
  } catch (e) {
    console.error("Decryption failed:", e.message);
  }
}
test();
