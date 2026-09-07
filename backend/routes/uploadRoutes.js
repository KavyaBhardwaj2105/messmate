const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadImages } = require('../controllers/uploadController');
router.post('/images', protect, uploadImages);
module.exports = router;
