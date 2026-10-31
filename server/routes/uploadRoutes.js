const express = require('express');
const router = express.Router();
const { uploadImages } = require('../controllers/uploadController');
const { upload } = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// Upload up to 10 images at once
router.post('/', protect, upload.array('images', 10), uploadImages);

module.exports = router;
