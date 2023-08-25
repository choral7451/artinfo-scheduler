import { Injectable } from '@nestjs/common';
import { NationalChorusCrawlerService } from '@/artinfo/application/service/crawler/national_chorus_crawler.service';

@Injectable()
export class CrawlerService {
  constructor(private readonly as: NationalChorusCrawlerService) {}

  getHello() {
    return this.as.crawlNationalChorus();
  }
}
