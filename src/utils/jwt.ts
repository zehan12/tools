// Base64URL encoding/decoding helpers
export const b64uEncode = (str: string) => {
  try {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  } catch(e) { return "" }
}

export const b64uDecode = (str: string) => {
  try {
    let padded = str.replace(/-/g, '+').replace(/_/g, '/');
    while (padded.length % 4) padded += '=';
    return decodeURIComponent(escape(atob(padded)));
  } catch (e) {
    return ""
  }
}

export async function signHS256(message: string, secret: string) {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(message));
    const bytes = new Uint8Array(signatureBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (e) {
    return "";
  }
}
