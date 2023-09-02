import { Injectable } from '@nestjs/common';
import { NationalChorusCrawlerService } from '@/artinfo/application/service/crawler/national_chorus_crawler.service';
import { GangnamCrawlerService } from '@/artinfo/application/service/crawler/gangnam_crawler.service';
import { GangneungCrawlerService } from '@/artinfo/application/service/crawler/gangneung_crawler.service';
import { GyeonggiCrawlerService } from '@/artinfo/application/service/crawler/gyeonggi_crawler.service';
import { GyeongsangbukCrawlerService } from '@/artinfo/application/service/crawler/gyeongsangbuk_crawler.service';
import { GoyangCivicChoirCrawlerService } from '@/artinfo/application/service/crawler/goyang_civic_choir_crawler.service';
import { GongjuCrawlerService } from '@/artinfo/application/service/crawler/gongju_crawler.service';
import { ChungnamPhilharmonicCrawlerService } from '@/artinfo/application/service/crawler/chungnam_philharmonic_crawler.service';
import { GwacheonCrawlerService } from '@/artinfo/application/service/crawler/gwacheon_crawler.service';
import { GwangmyeongCrawlerService } from '@/artinfo/application/service/crawler/gwangmyeong_crawler.service';

@Injectable()
export class CrawlerService {
  constructor(
    private readonly nationalChorusCrawlerService: NationalChorusCrawlerService,
    private readonly gangnamCrawlerService: GangnamCrawlerService,
    private readonly gangneungCrawlerService: GangneungCrawlerService,
    private readonly gyeonggiCrawlerService: GyeonggiCrawlerService,
    private readonly gyeongsangbukCrawlerService: GyeongsangbukCrawlerService,
    private readonly goyangCivicChoirCrawlerService: GoyangCivicChoirCrawlerService,
    private readonly gongjuCrawlerService: GongjuCrawlerService,
    private readonly chungnamPhilharmonicCrawlerService: ChungnamPhilharmonicCrawlerService,
    private readonly gwacheonCrawlerService: GwacheonCrawlerService,
    private readonly gwangmyeongCrawlerService: GwangmyeongCrawlerService,
  ) {}

  async crawlRecruitJobs(): Promise<boolean> {
    await Promise.any([
      await this.nationalChorusCrawlerService.crawlNationalChorus(), //
      await this.gangnamCrawlerService.crawlGangnam(),
      await this.gangneungCrawlerService.crawlGangneung(),
      await this.gyeonggiCrawlerService.crawlGyeonggi(),
      await this.gyeongsangbukCrawlerService.crawlGyeongsangbuk(),
      await this.goyangCivicChoirCrawlerService.crawlGoyangCivicChoir(),
      await this.gongjuCrawlerService.crawlGongju(),
      await this.chungnamPhilharmonicCrawlerService.crawlChungnamPhilharmonic(),
      await this.gwacheonCrawlerService.crawlGwacheon(),
      // TODO 추가 작업 필요
      // await this.gwangmyeongCrawlerService.crawlGwangmyeong(),
    ]);
    return true;
  }
}
