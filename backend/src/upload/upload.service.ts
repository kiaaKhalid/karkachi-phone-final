import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import sharp from 'sharp';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor() {
    // Cloudinary is configured via process.env.CLOUDINARY_URL or explicit keys
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      // Optimize and convert to WebP using sharp
      const optimizedBuffer = await sharp(file.buffer)
        .webp({ quality: 80 })
        .toBuffer();

      // Upload to Cloudinary using streams (since we have a buffer)
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'karkachi-phone',
            resource_type: 'image',
            format: 'webp',
          },
          (error, result: UploadApiResponse) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          },
        );

        // Pipe the buffer to the upload stream
        const readable = new Readable();
        readable._read = () => {};
        readable.push(optimizedBuffer);
        readable.push(null);
        readable.pipe(uploadStream);
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new BadRequestException('Failed to process and upload image');
    }
  }

  async deleteImage(url: string): Promise<void> {
    if (!url || !url.includes('res.cloudinary.com')) return;

    try {
      // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/karkachi-phone/filename.webp
      const parts = url.split('/');
      const fileWithExt = parts.pop(); // filename.webp
      if (!fileWithExt) return;
      
      const file = fileWithExt.split('.')[0]; // filename
      const folder = parts.pop(); // karkachi-phone
      
      const publicId = `${folder}/${file}`;
      await cloudinary.uploader.destroy(publicId);
      console.log(`Deleted image from Cloudinary: ${publicId}`);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
    }
  }
}
