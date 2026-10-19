import { v2 as cloudinary } from 'cloudinary';

// Konfigurasi Cloudinary menggunakan environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Helper untuk mengunggah buffer gambar ke Cloudinary
 * @param {Buffer} buffer - Buffer file dari request FormData
 * @returns {Promise<Object>} - Hasil upload dari Cloudinary (berisi secure_url, dll)
 */
export const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'suara-rakyat', // Folder penyimpanan di Cloudinary (opsional)
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};