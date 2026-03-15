import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

export async function uploadResumeToR2(
  file: File,
  organizationId: string
): Promise<string> {
  const fileExt = file.name.split(".").pop() ?? "pdf";
  const key = `${organizationId}/${crypto.randomUUID()}.${fileExt}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/pdf",
      ContentLength: buffer.byteLength,
    })
  );

  return key;
}

export async function deleteResumeFromR2(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

/** Generates a presigned download URL valid for 1 hour */
export function getResumeDownloadUrl(key: string): Promise<string> {
  return getSignedUrl(r2, new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
    expiresIn: 3600,
  });
}

/** Returns a Date 10 days from now — used for free plan resume expiry */
export function freeResumeExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 10);
  return d;
}
