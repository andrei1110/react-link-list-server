/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import B2 from 'backblaze-b2';
import { requireEnv } from '../config/env';

@Injectable()
export class UploadService {
  private b2: B2;

  constructor() {
    this.b2 = new B2({
      applicationKeyId: requireEnv('B2_KEY_ID'),
      applicationKey: requireEnv('B2_APPLICATION_KEY'),
    });
  }

  async uploadAvatar(
    file: Express.Multer.File,
    folder: 'users' | 'pages',
  ): Promise<string> {
    const resized = (await sharp(file.buffer)
      .resize(256, 256, { fit: 'cover' })
      .jpeg()
      .toBuffer()) as Buffer;

    await this.b2.authorize();

    const uploadUrl = await this.b2.getUploadUrl({
      bucketId: requireEnv('B2_BUCKET_ID'),
    });

    const filename = `${folder}/${Date.now()}-${file.originalname.replace(/ /g, '_')}`;

    await this.b2.uploadFile({
      uploadUrl: uploadUrl.data.uploadUrl,
      uploadAuthToken: uploadUrl.data.authorizationToken,
      fileName: filename,
      data: resized,
      contentType: 'image/jpeg',
    });

    return `${requireEnv('B2_BUCKET_PUBLIC_URL')}/${filename}`;
  }
}
