const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const allowed = new Map([
  ['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp'], ['image/gif', 'gif'],
]);

const uploadImage = async ({ dataUrl, folder = 'messmate' }) => {
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=\r\n]+)$/.exec(dataUrl || '');
  if (!match || !allowed.has(match[1])) throw new Error('Only JPG, PNG, WEBP and GIF images are supported.');
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 8 * 1024 * 1024) throw new Error('Each image must be 8MB or smaller.');

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto.createHash('sha1')
      .update(`folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
      .digest('hex');
    const form = new FormData();
    form.append('file', new Blob([buffer], { type: match[1] }), `messmate.${allowed.get(match[1])}`);
    form.append('api_key', process.env.CLOUDINARY_API_KEY);
    form.append('timestamp', String(timestamp));
    form.append('folder', folder);
    form.append('signature', signature);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Image storage provider rejected the upload.');
    const data = await res.json();
    return { url: data.secure_url, publicId: data.public_id };
  }

  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${allowed.get(match[1])}`;
  fs.writeFileSync(path.join(uploadDir, filename), buffer);
  const base = process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 5000}`;
  return { url: `${base.replace(/\/$/, '')}/uploads/${filename}`, publicId: filename };
};

module.exports = { uploadImage };
