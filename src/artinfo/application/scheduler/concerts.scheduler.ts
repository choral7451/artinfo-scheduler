import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CrawlerService } from '@/artinfo/application/service/crawler/crawler.service';
import { LogPayload } from '@/artinfo/domain/entities/server_log.entity';
import { LOG_LEVEL } from '@/artinfo/interface/type/type';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ConcertsScheduler {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron('0 1 1 * * *')
  async crawlConcerts(): Promise<void> {
    const startTime = new Date();
    const logPayload: LogPayload = {
      level: LOG_LEVEL.LOG,
      className: 'JobRecruitsScheduler',
      functionName: 'crawlJobRecruits',
      message: `ConcertsScheduler 실행 : ${startTime}`,
    };
    this.eventEmitter.emit('log.created', logPayload);

    await this.crawlerService.crawlConcerts();

    const endTime = new Date();
    logPayload.message = `ConcertsScheduler 종료 : ${endTime} - 소요 시간 : ${this.elapsedTime(endTime.getTime() - startTime.getTime())}`;
    this.eventEmitter.emit('log.created', logPayload);
  }

  private elapsedTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;

    return `${hours}시간 ${remainingMinutes}분 ${remainingSeconds}초`;
  }
}
