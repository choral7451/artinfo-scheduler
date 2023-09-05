import { Module } from '@nestjs/common';
import { CrawlerController } from '../../interface/controller/crawler.controller';
import { SupabaseRepository } from '../../infrastructure/repository/supabase.repository';
import { CrawlerService } from '@/artinfo/application/service/crawler/crawler.service';
import { NationalChorusCrawlerService } from '@/artinfo/application/service/crawler/recruit/national_chorus_crawler.service';
import { RecruitJobRepository } from '@/artinfo/infrastructure/repository/recruit_job.repository';
import { CrawlerEventHandler } from '@/artinfo/interface/event-handler/crawler-event-handler';
import { LogRepository } from '@/artinfo/infrastructure/repository/log.repository';
import { GangnamCrawlerService } from '@/artinfo/application/service/crawler/recruit/gangnam_crawler.service';
import { GangneungCrawlerService } from '@/artinfo/application/service/crawler/recruit/gangneung_crawler.service';
import { LogService } from '@/artinfo/application/service/log.service';
import { GyeonggiCrawlerService } from '@/artinfo/application/service/crawler/recruit/gyeonggi_crawler.service';
import { GyeongsangbukCrawlerService } from '@/artinfo/application/service/crawler/recruit/gyeongsangbuk_crawler.service';
import { GoyangCivicChoirCrawlerService } from '@/artinfo/application/service/crawler/recruit/goyang_civic_choir_crawler.service';
import { GongjuCrawlerService } from '@/artinfo/application/service/crawler/recruit/gongju_crawler.service';
import { ChungnamPhilharmonicCrawlerService } from '@/artinfo/application/service/crawler/recruit/chungnam_philharmonic_crawler.service';
import { GwacheonCrawlerService } from '@/artinfo/application/service/crawler/recruit/gwacheon_crawler.service';
import { GwangmyeongCrawlerService } from '@/artinfo/application/service/crawler/recruit/gwangmyeong_crawler.service';
import { JobRecruitsScheduler } from '@/artinfo/application/scheduler/job-recruits.scheduler';
import { ScheduleModule } from '@nestjs/schedule';
import { JangshinCrawlerService } from '@/artinfo/application/service/crawler/recruit/jangshin_crawler.service';
import { ChongshinCrawlerService } from '@/artinfo/application/service/crawler/recruit/chongshin_crawler.service';
import { NationalSymphonyCrawlerService } from '@/artinfo/application/service/crawler/recruit/national_symphony_crawler.service';
import { NationalOperaCrawlerService } from '@/artinfo/application/service/crawler/recruit/national_opera_crawler.service';
import { ArtCenterCrawlerService } from '@/artinfo/application/service/crawler/concert/art_center_crawler.service';
import { ConcertRepository } from '@/artinfo/infrastructure/repository/concert.repository';
import { ConcertsScheduler } from '@/artinfo/application/scheduler/concerts.scheduler';

@Module({
  controllers: [CrawlerController, CrawlerEventHandler],
  imports: [ScheduleModule.forRoot()],
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
    JangshinCrawlerService,
    ChongshinCrawlerService,
    NationalSymphonyCrawlerService,
    NationalOperaCrawlerService,
    ArtCenterCrawlerService,
    LogService,

    // Scheduler
    JobRecruitsScheduler,
    ConcertsScheduler,

    // Repository
    SupabaseRepository,
    RecruitJobRepository,
    ConcertRepository,
    LogRepository,
  ],
})
export class CrawlerModule {}
