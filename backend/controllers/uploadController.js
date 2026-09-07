const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { uploadImage } = require('../utils/media');

const uploadImages = asyncHandler(async (req, res) => {
  const files = Array.isArray(req.body?.images) ? req.body.images : [];
  if (!files.length || files.length > 8) throw new AppError('Upload between 1 and 8 images.', 422);
  const uploaded = [];
  for (const dataUrl of files) uploaded.push(await uploadImage({ dataUrl, folder: `messmate/${req.user._id}` }));
  res.status(201).json({ success: true, images: uploaded });
});
module.exports = { uploadImages };
