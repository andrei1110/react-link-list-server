declare module 'backblaze-b2' {
  export default class B2 {
    constructor(options: { applicationKeyId: string; applicationKey: string });

    authorize(): Promise<any>;

    getUploadUrl(options: { bucketId: string }): Promise<{
      data: { uploadUrl: string; authorizationToken: string };
    }>;

    uploadFile(options: {
      uploadUrl: string;
      uploadAuthToken: string;
      fileName: string;
      data: Buffer;
      contentType: string;
    }): Promise<any>;
  }
}
