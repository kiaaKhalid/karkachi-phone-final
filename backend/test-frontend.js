const crypto = require('node:crypto');
const { webcrypto } = crypto;

async function run() {
  const fetch = (await import('node-fetch')).default;
  
  // 1. Get public key
  const res = await fetch('http://localhost:3001/auth/public-key');
  const pubKeyData = await res.json();
  
  // 2. Encrypt
  const pemContents = pubKeyData.publicKey
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s/g, '');
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
    encoder.encode("admin123")
  );
  
  const encryptedBase64 = Buffer.from(encryptedBuffer).toString('base64');
  
  // 3. Login
  const loginRes = await fetch('http://localhost:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: "admin@shop.com", password: encryptedBase64 })
  });
  
  const loginData = await loginRes.text();
  console.log("Login status:", loginRes.status);
  console.log("Login response:", loginData);
}
run();
