import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import cloudinary from "cloudinary";

export type SaveResult = { url: string; width?: number; height?: number };

export interface StorageProvider {
  saveImage(buf: Buffer, contentType: string, keyHint?: string): Promise<SaveResult>;
  deleteImage(url: string): Promise<void>;
}

class LocalStorage implements StorageProvider {
  constructor(private baseDir: string = path.join(process.cwd(), 'public', 'uploads')) {}
  async saveImage(buf: Buffer, _contentType: string, keyHint?: string): Promise<SaveResult> {
    const dir = this.baseDir;
    await fs.mkdir(dir, { recursive: true });
    // Resize + WebP
    const img = sharp(buf).rotate();
    const meta = await img.metadata();
  const width = meta.width ?? 0;
    const maxW = 1600;
    const pipeline = width > maxW ? img.resize({ width: maxW }) : img;
    const resized = await pipeline.webp({ quality: 80 }).toBuffer();
    const finfo = await sharp(resized).metadata();
    const name = `${Date.now()}${keyHint ? '-' + keyHint : ''}.webp`;
    const filePath = path.join(dir, name);
    await fs.writeFile(filePath, resized);
    const rel = `/uploads/${name}`;
    return { url: rel, width: finfo.width, height: finfo.height };
  }
  async deleteImage(url: string): Promise<void> {
    if (!url.startsWith('/uploads/')) return;
    const p = path.join(process.cwd(), 'public', url);
    try { await fs.unlink(p); } catch {}
  }
}

let provider: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (provider) return provider;
  const backend = process.env.STORAGE_BACKEND || 'local';
  if (backend === 'local') {
    provider = new LocalStorage();
  } else if (backend === 's3') {
    const bucket = process.env.S3_BUCKET!;
    const region = process.env.S3_REGION!;
    const publicBase = process.env.S3_PUBLIC_BASE!; // z. B. https://<bucket>.s3.<region>.amazonaws.com
    const client = new S3Client({ region });
    provider = {
      async saveImage(buf, _ct, keyHint) {
        const key = `${Date.now()}${keyHint ? '-' + keyHint : ''}.webp`;
        const img = await sharp(buf).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  const cmd: PutObjectCommand = new PutObjectCommand({ Bucket: bucket, Key: key, Body: img, ContentType: 'image/webp' });
  await client.send(cmd);
        return { url: `${publicBase}/${key}` };
      },
      async deleteImage(url) {
        try {
          const key = url.split('/').pop() as string;
          await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        } catch {}
      }
    } satisfies StorageProvider;
  } else if (backend === 'cloudinary') {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
      secure: true,
    });
    provider = {
      async saveImage(buf, _ct, keyHint) {
        const img = await sharp(buf).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
        const res = await new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
          cloudinary.v2.uploader.upload_stream({ folder: 'tours', resource_type: 'image', public_id: keyHint?.slice(0, 80), overwrite: true, format: 'webp' }, (err, result) => {
            if (err || !result) return reject(err);
            resolve(result);
          }).end(img);
        });
        return { url: res.secure_url };
      },
      async deleteImage(url) {
        try {
          const parts = url.split('/');
          const publicId = parts.slice(parts.indexOf('upload') + 2).join('/').replace(/\.webp$/, '');
          await cloudinary.v2.uploader.destroy(publicId, { resource_type: 'image' });
        } catch {}
      }
    } satisfies StorageProvider;
  } else {
    provider = new LocalStorage();
  }
  return provider;
}
