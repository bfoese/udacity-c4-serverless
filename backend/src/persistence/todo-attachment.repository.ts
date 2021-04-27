import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { AppConfig } from '../config/app.config';

const XAWS = AWSXRay.captureAWS(AWS);

export default class TodoAttachmentRepository {
  constructor(
    private readonly bucketName = AppConfig.awsBucket,
    private readonly signedUrlExpiry = AppConfig.awsBucketSignedUrlExpiry,
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' })
  ) { }

  public getAttachmentUrl(todoItemId: string) {
    return `https://${this.bucketName}.s3.amazonaws.com/${todoItemId}`;
  }

  public generateAttachmentUploadUrl(todoItemId: string): string {
    const signedUrlData = {
      Bucket: this.bucketName,
      Expires: this.signedUrlExpiry,
      Key: todoItemId,
    }
    return this.s3.getSignedUrl('putObject', signedUrlData);
  }
}
