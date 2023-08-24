import { Controller, Get } from '@nestjs/common';
import { CrawlerService } from '../application/service/crawler.service';
import { RecruitJobsRepository } from '../infrastructure/repository/recruit_jobs.repository';

@Controller('/crawler')
export class CrawlerController {
  constructor(
    private readonly appService: CrawlerService,
    protected readonly recruitJobRepository: RecruitJobsRepository,
  ) {}

  @Get()
  getHello() {
    return this.recruitJobRepository.saveRecruitJob();
  }
}
