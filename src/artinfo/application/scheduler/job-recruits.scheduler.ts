import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CrawlerService } from '@/artinfo/application/service/crawler/crawler.service';

@Injectable()
export class JobRecruitsScheduler {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Cron('0 30 23 * * *')
  async crawlJobRecruits(): Promise<void> {
    const startTime = new Date();
    console.log(`크롤링 실행 : ${startTime}`);

    await this.crawlerService.crawlRecruitJobs();

    const endTime = new Date();
    console.log(`크롤링 종료 : ${endTime} - 소요 시간 : ${this.elapsedTime(endTime.getTime() - startTime.getTime())}`);
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
