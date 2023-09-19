import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ConcertRepository } from '@/artinfo/infrastructure/repository/concert.repository';
import { Concert, ConcertPayload } from '@/artinfo/domain/entities/concerts.entity';
import { CONCERT_CATEGORY, LOG_LEVEL } from '@/artinfo/interface/type/type';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemRepository } from '@/artinfo/infrastructure/repository/system.repository';
import * as fs from 'fs';
import { File } from '@web-std/file';
import { UtilLog } from '@/artinfo/utils/log';
import { LogPayload } from '@/artinfo/domain/entities/server_log.entity';
import { Agent } from 'https';
import * as md5 from 'md5';

@Injectable()
export class LotteConcertHallCrawlerService {
  constructor(
    private readonly concertRepository: ConcertRepository,
    private readonly systemRepository: SystemRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async crawlLotteConcertHall(): Promise<void> {
    try {
      const recruitUrl = 'https://www.lotteconcerthall.com/kor/performance';

      const html = await axios.get(recruitUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
        },
        httpsAgent: new Agent({
          rejectUnauthorized: false,
        }),
      });

      const $ = cheerio.load(html.data);
      const ulElement = $('ul#concerts-list-wrap');
      const liElements = ulElement.find('li');

      for (let i = liElements.length - 1; i <= liElements.length; i++) {
        const performanceDate = ulElement.find(`li:nth-child(${i}) > div > div.information > dl > dd:nth-child(2)`).text().trim();
        let performanceTime = ulElement.find(`li:nth-child(${i}) > div > div.information > dl > dd:nth-child(4)`).text().trim();

        if (performanceTime.includes(',')) {
          performanceTime = performanceTime.split(',')[1].trim();
        }
        //TODO 개선 필요
        if (performanceTime.includes('ㅣ')) {
          performanceTime = performanceTime.split('ㅣ')[0].split(' ')[1].trim();
        }

        const performanceDateAndTime = new Date(performanceDate.split(' ')[0] + 'T' + performanceTime + ':00');

        const idx = ulElement.find(`li:nth-child(${i}) > div > div.information > div > div > p > a`).attr('data-url');
        const url = 'https://www.lotteconcerthall.com/kor/Performance/ConcertDetails/' + idx;

        const title = ulElement.find(`li:nth-child(${i}) > div > div.information > div > div > p > a`).text().trim();

        const uniqueKey = md5(title);
        const fetchedConcert = await this.concertRepository.getConcert(uniqueKey);
        if (!fetchedConcert) {
          const posterSrc = ulElement.find(`li:nth-child(${i}) > div > div.poster > a > img`).attr('src');

          if (!posterSrc) break;
          let posterUrl = 'https://www.lotteconcerthall.com' + posterSrc;

          let filename = String(Date.now());
          filename = await this.urlToFile(posterUrl, filename);
          const buffer = fs.readFileSync('temp_images/' + filename);
          const file = new File([buffer], filename, { type: 'image/webp' });

          posterUrl = await this.systemRepository.uploadImage('concert/' + filename, file);
          fs.unlinkSync('temp_images/' + filename);

          const detailHtml = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
            },
            httpsAgent: new Agent({
              rejectUnauthorized: false,
            }),
          });

          const detail$ = cheerio.load(detailHtml.data);
          const fetchedContents = detail$('#info-tab-details > div:nth-child(1) > div.guide_read.c_concert_readme').html();
          let contents = `<img src="${posterUrl}" /><br/>`;
          if (fetchedContents) {
            contents += fetchedContents;
          }

          const concert: ConcertPayload = {
            title: title,
            contents: contents!,
            posterUrl: posterUrl,
            location: '롯데콘서트홀',
            performanceTime: performanceDateAndTime,
            profileId: process.env.ARTINFO_ADMIN_ID!,
            category: this.classifyCategory(title),
            uniqueKey: uniqueKey,
          };

          await this.concertRepository.saveConcert(Concert.from(concert));
        }
      }
    } catch (e) {
      const logPayload: LogPayload = {
        level: LOG_LEVEL.ERROR,
        className: 'LotteConcertHallCrawlerService',
        functionName: 'crawlLotteConcertHall',
        message: e.message,
      };

      this.eventEmitter.emit('log.created', logPayload);
      console.log(UtilLog.getLogMessage(logPayload));
    }
  }

  private classifyCategory(title: string) {
    if (title.includes('오케스트라') || title.includes('교향') || title.includes('필하모닉')) return CONCERT_CATEGORY.ORCHESTRA;
    if (title.includes('합창')) return CONCERT_CATEGORY.CHORUS;
    if (title.includes('앙상블') || title.includes('트리오')) return CONCERT_CATEGORY.ENSEMBLE;
    if (title.includes('독주') || title.includes('리사이틀') || title.includes('데뷔')) return CONCERT_CATEGORY.SOLO;
    return CONCERT_CATEGORY.ETC;
  }

  private async urlToFile(url: string, filename: string): Promise<string> {
    filename = filename + '.webp';
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
      },
      httpsAgent: new Agent({
        rejectUnauthorized: false,
      }),
    });

    const writeStream = fs.createWriteStream('temp_images/' + filename);

    response.data.pipe(writeStream);

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => {
        resolve();
      });

      writeStream.on('error', error => {
        reject(error);
      });
    });

    return filename;
  }
}
