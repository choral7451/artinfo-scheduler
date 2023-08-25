import { Controller, Get } from '@nestjs/common';
import { RecruitJobsRepository } from '../infrastructure/repository/recruit_jobs.repository';
import { CrawlerService } from '@/artinfo/application/service/crawler/crawler.service';

@Controller('/crawler')
export class CrawlerController {
  constructor(
    private readonly crawlerService: CrawlerService,
    protected readonly recruitJobRepository: RecruitJobsRepository,
  ) {}

  @Get()
  async getHello() {
    const result = await this.crawlerService.getHello();
    // this.recruitJobRepository.saveRecruitJob(result[0]);
    return result;
  }
}
