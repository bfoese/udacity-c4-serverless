/**
 * Fields in a request to get a Pre-signed URL
 */
export interface BucketSignedUrlRequest {
  Bucket: string,
  Key: string,
  Expires: string
}
