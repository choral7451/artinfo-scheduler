import { Module } from '@nestjs/common';
import { CrawlerController } from '../../interface/crawler.controller';
import { SupabaseRepository } from '../../infrastructure/repository/supabase.repository';
import { CrawlerService } from '../service/crawler.service';
import { RecruitJobsRepository } from '../../infrastructure/repository/recruit_jobs.repository';

@Module({
  imports: [],
  controllers: [CrawlerController],
  providers: [CrawlerService, SupabaseRepository, RecruitJobsRepository],
})
export class CrawlerModule {}
