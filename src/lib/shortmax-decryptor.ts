import CryptoJS from "crypto-js";

const AES_IV_WORD = CryptoJS.enc.Utf8.parse("shortmax00000000");

function wordArrayToUint8Array(wa: CryptoJS.lib.WordArray): Uint8Array {
  const len = wa.sigBytes;
  const words = wa.words;
  const result = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    result[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return result;
}

export function decryptShortMaxSegment(buffer: ArrayBuffer): ArrayBuffer {
  const view = new Uint8Array(buffer);

  if (view[0] === 0x47) return buffer;
  if (buffer.byteLength < 1040) return buffer;

  const magic = new TextDecoder().decode(view.slice(0, 8));
  if (magic !== "shortmax") return buffer;

  try {
    const keyPos = parseInt(new TextDecoder().decode(view.slice(16, 20)), 10);
    const keyOffset = keyPos - 24;
    const aesKey = CryptoJS.lib.WordArray.create(
      view.slice(24 + keyOffset, 24 + keyOffset + 16)
    );

    const tail16 = view.slice(1024, 1040);
    const payload = view.slice(1040);
    const ciphertext = new Uint8Array(16 + Math.min(1024, payload.length));
    ciphertext.set(tail16, 0);
    ciphertext.set(payload.slice(0, 1024), 16);

    const cipherWA = CryptoJS.lib.WordArray.create(ciphertext);

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: cipherWA } as never,
      aesKey,
      { iv: AES_IV_WORD, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.NoPadding }
    );

    const decBytes = wordArrayToUint8Array(decrypted);

    if (decBytes[0] !== 0x47) {
      return payload.buffer.slice(0);
    }

    const result = new Uint8Array(decBytes.length + payload.length - 1024);
    result.set(decBytes, 0);
    result.set(payload.slice(1024), decBytes.length);
    return result.buffer;
  } catch {
    return view.slice(1040).buffer;
  }
}

export function decryptShortMaxBuffer(buffer: ArrayBuffer): ArrayBuffer {
  return decryptShortMaxSegment(buffer);
}
