function decrypt(data) {
  const key = 0x61;
  for (let i = 0; i < data.length; i++)
  {
    data[i] ^= key;
  }
  return data;
}

async function load_enc_audio(file_name) {
  const res = await fetch(file_name);
  const buffer = await res.arrayBuffer();
  const data = new Uint8Array(buffer);

  decrypt(data);

  let mime = 'audio/mpeg';
  if (file_name.endsWith('.ogg.enc')) mime = 'audio/ogg';
  else if (file_name.endsWith('.wav.enc')) mime = 'audio/wav';
  else if (file_name.endsWith('.flac.enc')) mime = 'audio/flac';

  const blob = new Blob([data], { type: mime });
  return URL.createObjectURL(blob);
}