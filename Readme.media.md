# Script lambda for AWS MediaConvert

- AWS Elemental MediaConvert is a file-based video processing service that provides scalable video processing for content owners and distributors with media libraries of any size
- This repository provides a script lambda that receives events from S3 and creates jobs on AWS MediaConvert for converting videos to HLS format with multiple resolutions

## Table of Contents

- [Script lambda for AWS MediaConvert](#script-lambda-for-aws-mediaconvert)

  - [Workflow](#workflow)
  - [MediaConvert Basic](#mediaconvert-basic)
  - [Requirements](#requirements)
  - [Settings](#settings)
  - [Configuration](#configuration)

## Workflow

## MediaConvert Basic

- For information about basic concepts like Jobs, Presets, Job templates, and Queues, refer to this link: <a href="https://docs.aws.amazon.com/mediaconvert/latest/ug/what-is.html">What is AWS Elemental MediaConvert?</a>

## Requirements

- Node.js 18.x or higher
- AWS Account with S3 configured to trigger a Lambda function on PUT object events
- IAM role for Lambda with permissions to create jobs on AWS MediaConvert service
- IAM role for AWS MediaConvert to create transcoding jobs

## Configuration

The service uses a `job.json` file to configure AWS MediaConvert jobs. This file contains the template for conversion jobs with the following key sections:

### AWS MediaConvert Job Configuration

The configuration contains the following main sections:

1. **Role ARN**: The AWS IAM role that MediaConvert will assume to process your job

   ```json
   "Role": "arn:aws:iam::123456789012:role/MediaConvert_Role"
   ```

2. **Input Configuration**: Specifies the source video location

   ```json
   "Inputs": [
       {
           "FileInput": "s3://input-bucket/input-file.mp4",
           "AudioSelectors": {...},
           "VideoSelector": {...}
       }
   ]
   ```

3. **Output Groups**: Defines the output formats, most importantly the HLS streaming package

   ```json
   "OutputGroups": [
     {
       "Name": "Apple HLS",
       "Outputs": [],
       "OutputGroupSettings": {
         "Type": "HLS_GROUP_SETTINGS",
         "HlsGroupSettings": {
           "SegmentLength": 6,
           "MinSegmentLength": 0,
           "Destination": "s3://output-bucket/output-folder/",
           {...}
         }
       }
     }
   ]
   ```

4. **Queue**: Specifies which MediaConvert queue to use for processing

   ```json
   "Queue": "arn:aws:mediaconvert:region-name:account-id:queues/queue-name"
   ```

   You can use the default queue or create a custom queue with specific priority and pricing settings:

   - Default queue: Uses on-demand pricing

5. **Video Variants**: Configures multiple resolution variants (360p, 540p, 720p, 1080p)

   ```json
   "Outputs": [
     {
       "VideoDescription": {
         "Width": 1920,
         "Height": 1080,
         "CodecSettings": {
           "Codec": "H_264",
           "H264Settings": {
             "RateControlMode": "QVBR",
             "SceneChangeDetect": "TRANSITION_DETECTION",
             "MaxBitrate": 2000000,
           }
         }
       },
       "AudioDescriptions": [...]
     },
     // Other resolution variants...
   ]
   ```

6. **Codec Settings**: Defines video and audio codec parameters for optimal streaming
   ```json
   "H264Settings": {
     "FramerateControl": "INITIALIZE_FROM_SOURCE",
     "RateControlMode": "QVBR",
     "QvbrSettings": {
       "QvbrQualityLevel": 8
     }
   }
   ```
