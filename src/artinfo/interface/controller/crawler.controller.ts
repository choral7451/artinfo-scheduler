import { Controller, Get } from '@nestjs/common';
import { CrawlerService } from '@/artinfo/application/service/crawler/crawler.service';

@Controller('/crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Get()
  async getHello() {
    return this.crawlerService.crawlRecruitJobs();
  }
}
