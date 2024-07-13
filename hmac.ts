export async function hmacSha1(url: string, key: string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw", // raw format of the key - should be Uint8Array,
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-1" }, // algorithm details,
    false, // export = false
    ["sign", "verify"] // what this key can do
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(url)
  );

  return signature;
}
