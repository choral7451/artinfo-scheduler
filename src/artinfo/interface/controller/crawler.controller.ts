import { Controller, Get } from '@nestjs/common';
import { CrawlerService } from '@/artinfo/application/service/crawler/crawler.service';

@Controller('/crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Get('/jobs')
  async crawlRecruitJobs() {
    return this.crawlerService.crawlRecruitJobs();
  }

  @Get('/concerts')
  async crawlConcerts() {
    return this.crawlerService.crawlConcerts();
  }
}
