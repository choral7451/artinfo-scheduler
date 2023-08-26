import { Module } from '@nestjs/common';
import { CrawlerController } from '../../interface/controller/crawler.controller';
import { SupabaseRepository } from '../../infrastructure/repository/supabase.repository';
import { CrawlerService } from '@/artinfo/application/service/crawler/crawler.service';
import { NationalChorusCrawlerService } from '@/artinfo/application/service/crawler/national_chorus_crawler.service';
import { RecruitJobRepository } from '@/artinfo/infrastructure/repository/recruit_job.repository';
import { CrawlerEventHandler } from '@/artinfo/interface/event-handler/crawler-event-handler';
import { LogRepository } from '@/artinfo/infrastructure/repository/log.repository';
import { GangnamCrawlerService } from '@/artinfo/application/service/crawler/gangnam_crawler.service';
import { GangneungCrawlerService } from '@/artinfo/application/service/crawler/gangneung_crawler.service';
import { LogService } from '@/artinfo/application/service/log.service';
import { GyeonggiCrawlerService } from '@/artinfo/application/service/crawler/gyeonggi_crawler.service';
import { GyeongsangbukCrawlerService } from '@/artinfo/application/service/crawler/gyeongsangbuk_crawler.service';
import { GoyangCivicChoirCrawlerService } from '@/artinfo/application/service/crawler/goyang_civic_choir_crawler.service';
import { GongjuCrawlerService } from '@/artinfo/application/service/crawler/gongju_crawler.service';
import { ChungnamPhilharmonicCrawlerService } from '@/artinfo/application/service/crawler/chungnam_philharmonic_crawler.service';
import { GwacheonCrawlerService } from '@/artinfo/application/service/crawler/gwacheon_crawler.service';
import { GwangmyeongCrawlerService } from '@/artinfo/application/service/crawler/gwangmyeong_crawler.service';

@Module({
  controllers: [CrawlerController, CrawlerEventHandler],
  providers: [
    // Service
    CrawlerService,
    NationalChorusCrawlerService,
    GangnamCrawlerService,
    GangneungCrawlerService,
    GyeonggiCrawlerService,
    GyeongsangbukCrawlerService,
    GoyangCivicChoirCrawlerService,
    GongjuCrawlerService,
    ChungnamPhilharmonicCrawlerService,
    GwacheonCrawlerService,
    GwangmyeongCrawlerService,
    LogService,

    // Repository
    SupabaseRepository,
    RecruitJobRepository,
    LogRepository,
  ],
})
export class CrawlerModule {}
