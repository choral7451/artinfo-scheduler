import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CrawlerService } from '@/artinfo/application/service/crawler/crawler.service';
import { LogPayload } from '@/artinfo/domain/entities/server_log.entity';
import { LOG_LEVEL } from '@/artinfo/interface/type/type';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class JobRecruitsScheduler {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // cicd test testtt
  @Cron('0 0 23 * * *')
  async crawlJobRecruits(): Promise<void> {
    const startTime = new Date();
    const logPayload: LogPayload = {
      level: LOG_LEVEL.ERROR,
      className: 'JobRecruitsScheduler',
      functionName: 'crawlJobRecruits',
      message: `크롤링 실행 : ${startTime}`,
    };
    this.eventEmitter.emit('log.created', logPayload);

    await this.crawlerService.crawlRecruitJobs();

    const endTime = new Date();
    logPayload.message = `크롤링 종료 : ${endTime} - 소요 시간 : ${this.elapsedTime(endTime.getTime() - startTime.getTime())}`;
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
