import { Module } from '@nestjs/common';
import { CrawlerController } from '../../interface/crawler.controller';
import { SupabaseRepository } from '../../infrastructure/repository/supabase.repository';
import { RecruitJobsRepository } from '../../infrastructure/repository/recruit_jobs.repository';
import { CrawlerService } from '@/artinfo/application/service/crawler/crawler.service';
import { NationalChorusCrawlerService } from '@/artinfo/application/service/crawler/national_chorus_crawler.service';

@Module({
  imports: [],
  controllers: [CrawlerController],
  providers: [CrawlerService, NationalChorusCrawlerService, SupabaseRepository, RecruitJobsRepository],
})
export class CrawlerModule {}
