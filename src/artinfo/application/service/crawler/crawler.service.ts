import { Injectable } from '@nestjs/common';
import { NationalChorusCrawlerService } from '@/artinfo/application/service/crawler/recruit/national_chorus_crawler.service';
import { GangnamCrawlerService } from '@/artinfo/application/service/crawler/recruit/gangnam_crawler.service';
import { GangneungCrawlerService } from '@/artinfo/application/service/crawler/recruit/gangneung_crawler.service';
import { GyeonggiCrawlerService } from '@/artinfo/application/service/crawler/recruit/gyeonggi_crawler.service';
import { GyeongsangbukCrawlerService } from '@/artinfo/application/service/crawler/recruit/gyeongsangbuk_crawler.service';
import { GoyangCivicChoirCrawlerService } from '@/artinfo/application/service/crawler/recruit/goyang_civic_choir_crawler.service';
import { GongjuCrawlerService } from '@/artinfo/application/service/crawler/recruit/gongju_crawler.service';
import { ChungnamPhilharmonicCrawlerService } from '@/artinfo/application/service/crawler/recruit/chungnam_philharmonic_crawler.service';
import { GwacheonCrawlerService } from '@/artinfo/application/service/crawler/recruit/gwacheon_crawler.service';
import { GwangmyeongCrawlerService } from '@/artinfo/application/service/crawler/recruit/gwangmyeong_crawler.service';
import { JangshinCrawlerService } from '@/artinfo/application/service/crawler/recruit/jangshin_crawler.service';
import { ChongshinCrawlerService } from '@/artinfo/application/service/crawler/recruit/chongshin_crawler.service';
import { NationalSymphonyCrawlerService } from '@/artinfo/application/service/crawler/recruit/national_symphony_crawler.service';
import { NationalOperaCrawlerService } from '@/artinfo/application/service/crawler/recruit/national_opera_crawler.service';
import { ArtCenterCrawlerService } from '@/artinfo/application/service/crawler/concert/art_center_crawler.service';
import { GunpoPrimeCrawlerService } from '@/artinfo/application/service/crawler/recruit/gunpo_prime_crawler.service';
import { LotteConcertHallCrawlerService } from '@/artinfo/application/service/crawler/concert/lotte_concert_hall_crawler.service';
import { SejongCrawlerService } from '@/artinfo/application/service/crawler/concert/sejong_crawler.service';
import { GimcheonCrawlerService } from '@/artinfo/application/service/crawler/recruit/gimcheon_crawler.service';
import { NonsanCrawlerService } from '@/artinfo/application/service/crawler/recruit/nonsan_crawler.service';
import { DaejeonPhilCrawlerService } from '@/artinfo/application/service/crawler/recruit/daejeon_phil_crawler.service';
import { DaejeonChorusCrawlerService } from '@/artinfo/application/service/crawler/recruit/daejeon_chorus_crawler.service';
import {
  ArtCenterIncheonService
} from "@/artinfo/application/service/crawler/concert/art_center_incheon_crawler.service";

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
    private readonly jangshinCrawlerService: JangshinCrawlerService,
    private readonly chongshinCrawlerService: ChongshinCrawlerService,
    private readonly nationalSymphonyCrawlerService: NationalSymphonyCrawlerService,
    private readonly nationalOperaCrawlerService: NationalOperaCrawlerService,
    private readonly artCenterCrawlerService: ArtCenterCrawlerService,
    private readonly gunpoPrimeCrawlerService: GunpoPrimeCrawlerService,
    private readonly lotteConcertHallCrawlerService: LotteConcertHallCrawlerService,
    private readonly sejongCrawlerService: SejongCrawlerService,
    private readonly gimcheonCrawlerService: GimcheonCrawlerService,
    private readonly nonsanCrawlerService: NonsanCrawlerService,
    private readonly daejeonPhilCrawlerService: DaejeonPhilCrawlerService,
    private readonly daejeonChorusCrawlerService: DaejeonChorusCrawlerService,
    private readonly artiCenterIncheonService: ArtCenterIncheonService,
  ) {}

  async crawlRecruitJobs(): Promise<boolean> {
    await Promise.allSettled([
      // ART_ORGANIZATION
      await this.nationalChorusCrawlerService.crawlNationalChorus(), //
      await this.gangnamCrawlerService.crawlGangnam(),
      await this.gangneungCrawlerService.crawlGangneung(),
      await this.gyeonggiCrawlerService.crawlGyeonggi(),
      await this.gyeongsangbukCrawlerService.crawlGyeongsangbuk(),
      await this.goyangCivicChoirCrawlerService.crawlGoyangCivicChoir(),
      await this.gongjuCrawlerService.crawlGongju(),
      await this.chungnamPhilharmonicCrawlerService.crawlChungnamPhilharmonic(),
      await this.gwacheonCrawlerService.crawlGwacheon(),
      await this.nationalSymphonyCrawlerService.crawlNationalSymphony(),
      await this.nationalOperaCrawlerService.crawlNationalOpera(),
      await this.gunpoPrimeCrawlerService.crawlGunpoPrime(),
      await this.gimcheonCrawlerService.crawlGimcheon(),
      await this.nonsanCrawlerService.crawlNonsan(),
      await this.daejeonPhilCrawlerService.crawlDaejeonPhil(),
      await this.daejeonChorusCrawlerService.crawlDaejeonChorus(),
      // RELIGION
      await this.jangshinCrawlerService.crawlJangshin(),
      // TODO 추가 작업 필요
      // await this.gwangmyeongCrawlerService.crawlGwangmyeong(),
      // await this.chongshinCrawlerService.crawlChongshin(),
    ]);
    return true;
  }

  async crawlConcerts(): Promise<boolean> {
    await this.artiCenterIncheonService.crawlArtCenterIncheon()
    await this.sejongCrawlerService.crawlSejong();
    await this.lotteConcertHallCrawlerService.crawlLotteConcertHall();
    await this.artCenterCrawlerService.crawlArtCenter();
    return true;
  }
}
