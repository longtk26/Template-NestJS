import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { JobsOptions, Queue } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import { QueueName } from 'src/constants/queue.constants';

@Injectable()
export class QueueProvider implements OnModuleInit, OnModuleDestroy {
  private queues: Map<string, Queue> = new Map<string, Queue>();

  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(QueueProvider.name);
  }

  onModuleInit() {
    this.logger.info('Initializing QueueProvider...');
    this.initializeQueues();
  }

  onModuleDestroy() {
    this.logger.info('Destroying QueueProvider...');
    this.closeQueues();
  }

  private initializeQueues() {
    Object.values(QueueName).forEach((queueName) => {
      const queue = new Queue(queueName);
      this.queues.set(queueName, queue);
    });
  }

  getQueue(queueName: `${QueueName}`): Queue {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }
    return queue;
  }

  async addJob<T>({
    queueName,
    data,
    options,
  }: {
    queueName: `${QueueName}`;
    data: T;
    options?: JobsOptions;
  }): Promise<string> {
    const queue = this.getQueue(queueName);
    const job = await queue.add(queueName, data, options);
    return job.id;
  }

  async removeJob({
    queueName,
    jobId,
  }: {
    queueName: `${QueueName}`;
    jobId: string;
  }): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.remove(jobId);
  }

  async pauseQueue(queueName: `${QueueName}`): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.pause();
  }

  async resumeQueue(queueName: `${QueueName}`): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.resume();
  }

  async getJobStatusCounts({
    queueName,
    statuses,
  }: {
    queueName: `${QueueName}`;
    statuses: ('waiting' | 'active' | 'completed' | 'failed' | 'delayed')[];
  }): Promise<{ [key: string]: number }> {
    const queue = this.getQueue(queueName);
    const queueStatus = await queue.getJobCounts(...statuses);
    return queueStatus;
  }

  private async closeQueues(): Promise<void> {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    this.queues.clear();
  }
}
