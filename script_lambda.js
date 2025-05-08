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
  const fileName = object.key;
  const inputS3UrlFile = `s3://${bucketName}/${fileName}`;
  const outputS3Url = process.env.OUTPUT_S3_URL;

  // Load MediaConvert job settings from job.json
  let jobSettings;
  try {
    const jobJsonPath = path.resolve('./job.json');
    const fileContent = await readFile(jobJsonPath, 'utf-8');
    jobSettings = JSON.parse(fileContent);
  } catch (err) {
    console.error('Failed to read or parse job.json:', err);
    return;
  }

  // Set input/output values dynamically
  jobSettings.Inputs[0].FileInput = inputS3UrlFile;
  jobSettings.OutputGroups[0].OutputGroupSettings.HlsGroupSettings.Destination =
    outputS3Url;

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
