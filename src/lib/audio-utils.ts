export const pcmEncode = (float32Array: Float32Array): string => {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

export const pcmDecode = (base64: string): Float32Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const view = new DataView(bytes.buffer);
  const float32Array = new Float32Array(len / 2);
  for (let i = 0; i < len / 2; i++) {
    float32Array[i] = view.getInt16(i * 2, true) / 0x8000;
  }
  return float32Array;
};
