import { readFile } from 'fs/promises';
import path from 'path';
import MediaConvertHandler from './media-convert.mjs';

export const handler = async (event) => {
  const {
    Records: [record],
  } = event;

  const { s3, awsRegion } = record;
  if (!s3) {
    console.error('No S3 event found');
    return;
  }

  const { bucket, object } = s3;
  const bucketName = bucket.name;
  const fileName = decodeURIComponent(object.key.replace(/\+/g, ' '));
  const inputS3UrlFile = `s3://${bucketName}/${fileName}`;
  const outputS3Base = `s3://leo-video-output2`;

  // Tên file không có đuôi mở rộng (basename)
  const baseName = path.parse(fileName).name;

  // Load job.json
  let jobSettings;
  try {
    const jobJsonPath = path.resolve('./job.json');
    const fileContent = await readFile(jobJsonPath, 'utf-8');
    jobSettings = JSON.parse(fileContent);
  } catch (err) {
    console.error('Failed to read or parse job.json:', err);
    return;
  }

  // Gán input và output
  jobSettings.Inputs[0].FileInput = inputS3UrlFile;

  // Tạo đường dẫn có chứa thư mục theo tên file gốc
  jobSettings.OutputGroups[0].OutputGroupSettings.HlsGroupSettings.Destination = `${outputS3Base}/360p/${baseName}/`;
  jobSettings.OutputGroups[1].OutputGroupSettings.HlsGroupSettings.Destination = `${outputS3Base}/1080p/${baseName}/`;

  const mediaConvertHandler = new MediaConvertHandler(awsRegion);
  try {
    const data = await mediaConvertHandler.createJob({
      Role: process.env.MEDIA_CONVERT_ROLE,
      Queue: process.env.MEDIA_CONVERT_QUEUE,
      Settings: jobSettings,
    });
    console.log('Job created successfully:', data);
  } catch (error) {
    console.error('Error creating job:', error);
  }
};
