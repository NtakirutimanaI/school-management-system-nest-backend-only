import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;

@Injectable()
export class CloudinaryService {
    /**
     * Upload a file to Cloudinary
     * @param file - The file buffer from multer
     * @param folder - Optional folder path in Cloudinary (e.g., 'students', 'teachers', 'documents')
     * @param resourceType - Type of resource: 'image', 'video', 'raw' (for documents)
     * @returns Promise with Cloudinary upload response
     */
    async uploadFile(
        file: Express.Multer.File,
        folder?: string,
        resourceType: 'image' | 'video' | 'raw' = 'image',
    ): Promise<CloudinaryResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder || 'school-management',
                    resource_type: resourceType,
                    // Automatically detect and set appropriate format
                    ...(resourceType === 'raw' && { format: this.getFileExtension(file.originalname) }),
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error('Upload failed: no result returned'));
                    resolve(result);
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    /**
     * Upload multiple files to Cloudinary
     * @param files - Array of file buffers from multer
     * @param folder - Optional folder path in Cloudinary
     * @param resourceType - Type of resource
     * @returns Promise with array of Cloudinary upload responses
     */
    async uploadMultipleFiles(
        files: Express.Multer.File[],
        folder?: string,
        resourceType: 'image' | 'video' | 'raw' = 'image',
    ): Promise<CloudinaryResponse[]> {
        const uploadPromises = files.map((file) =>
            this.uploadFile(file, folder, resourceType),
        );
        return Promise.all(uploadPromises);
    }

    /**
     * Delete a file from Cloudinary
     * @param publicId - The public ID of the file in Cloudinary
     * @param resourceType - Type of resource
     * @returns Promise with deletion result
     */
    async deleteFile(
        publicId: string,
        resourceType: 'image' | 'video' | 'raw' = 'image',
    ): Promise<any> {
        return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    }

    /**
     * Delete multiple files from Cloudinary
     * @param publicIds - Array of public IDs
     * @param resourceType - Type of resource
     * @returns Promise with deletion results
     */
    async deleteMultipleFiles(
        publicIds: string[],
        resourceType: 'image' | 'video' | 'raw' = 'image',
    ): Promise<any> {
        return cloudinary.api.delete_resources(publicIds, { resource_type: resourceType });
    }

    /**
     * Get file extension from filename
     * @param filename - The original filename
     * @returns File extension without dot
     */
    private getFileExtension(filename: string): string {
        return filename.split('.').pop() || '';
    }
}
