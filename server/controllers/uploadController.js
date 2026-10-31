const {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
} = require('../middleware/upload');

// @desc    Upload multiple property images
// @route   POST /api/upload
// @access  Private (Host)
const uploadImages = async (req, res, next) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided for upload.',
      });
    }

    const uploadedUrls = [];

    if (isCloudinaryConfigured) {
      // Upload each file buffer to Cloudinary in parallel
      const uploadPromises = files.map((file) =>
        uploadBufferToCloudinary(file.buffer, 'staynest/properties')
      );
      const urls = await Promise.all(uploadPromises);
      uploadedUrls.push(...urls);
    } else {
      // Local storage fallback: build URLs relative to server origin
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      files.forEach((file) => {
        uploadedUrls.push(`${baseUrl}/uploads/${file.filename}`);
      });
    }

    res.status(200).json({
      success: true,
      message: `${uploadedUrls.length} image(s) uploaded successfully.`,
      urls: uploadedUrls,
      storageType: isCloudinaryConfigured ? 'cloudinary' : 'local-disk-fallback',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadImages,
};
