import {
  MediaConvertClient,
  CreateJobCommand,
} from '@aws-sdk/client-mediaconvert';

class MediaConvertHandler {
  constructor(region) {
    this.client = new MediaConvertClient({ region });
  }

  async createJob(params) {
    try {
      const command = new CreateJobCommand(params);
      const data = await this.client.send(command);
      return data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }
}

export default MediaConvertHandler;
