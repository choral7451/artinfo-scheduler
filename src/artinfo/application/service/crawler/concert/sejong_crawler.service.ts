import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
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
import * as md5 from 'md5';

@Injectable()
export class SejongCrawlerService {
  constructor(
    private readonly concertRepository: ConcertRepository,
    private readonly systemRepository: SystemRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async crawlSejong(): Promise<void> {
    try {
      const recruitUrl = `https://www.sejongpac.or.kr/portal/performance/performance/performList.do?menuNo=200004`;
      const listBrowser = await puppeteer.launch({
        headless: true,
      });

      const page = await listBrowser.newPage();
      await page.goto(recruitUrl);
      await page.waitForSelector('#performList > ul > li:nth-child(10)');

      const liElements = await page.$$('div#performList > ul > li');
      for (let i = 5; i <= 9; i++) {
        const li = liElements[i];

        const category = await page.evaluate(li => {
          const span = li.querySelector('div.cont > div.etc.clearfix > span.place');
          return span!.textContent!.trim();
        }, li);

        const title = await page.evaluate(li => {
          const span = li.querySelector('div.cont > strong');
          return span!.textContent!.trim();
        }, li);

        const period = await page.evaluate(li => {
          const span = li.querySelector('div.cont > div.etc.clearfix > span.date');
          return span!.textContent!.trim();
        }, li);

        if (this.categoryValidator(category) && period.length === 10) {
          const hash = md5(title);
          const fetchedConcert = await this.concertRepository.getConcert(hash);
          if (!fetchedConcert) {
            let posterUrl = await page.evaluate(li => {
              const a = li.querySelector('div.img > img');
              return a?.getAttribute('src');
            }, li);

            let filename = String(Date.now());
            filename = await this.urlToFile(posterUrl!, filename);
            const buffer = fs.readFileSync('temp_images/' + filename);
            const file = new File([buffer], filename, { type: 'image/webp' });

            posterUrl = await this.systemRepository.uploadImage('concert/' + filename, file);
            fs.unlinkSync('temp_images/' + filename);

            const location = await page.evaluate(li => {
              const div = li.querySelector('div.cont > div.add');
              return div!.textContent!.trim();
            }, li);

            const url = await page.evaluate(li => {
              const a = li.querySelector('div.hover > div > div > a.d');
              return 'https://www.sejongpac.or.kr' + a?.getAttribute('href');
            }, li);

            const detailHtml = await axios.get(url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
              },
            });

            const detail$ = cheerio.load(detailHtml.data);

            let performanceTime = detail$('#sub_page > div.sub_page > article > div.inner > div.sv_top > div > div.txt > ul > li:nth-child(3)').text().trim();

            performanceTime = performanceTime
              .slice(performanceTime.indexOf('오후'), performanceTime.indexOf('오후') + 12)
              .trim()
              .split(' ')[1];

            const minute = performanceTime.split('시')[1].replace('분', ':00');
            performanceTime =
              period.replaceAll('.', '-') + 'T' + String(Number(performanceTime.split('시')[0]) + 12) + ':' + (minute.length ? minute : '00:00');

            const performanceDateAndTime = new Date(performanceTime);

            const contents =
              `<img src='${posterUrl}'/><br/>` +
              detail$('#sub_page > div.sub_page > article > div.inner > div.schedule_cont.new > ul.tab_cont2.w > li.tab_detail.on').html();

            const concert: ConcertPayload = {
              title: title,
              contents: contents!,
              posterUrl: posterUrl,
              location: location,
              performanceTime: performanceDateAndTime!,
              profileId: process.env.ARTINFO_ADMIN_ID!,
              category: this.classifyCategory(title),
              uniqueKey: hash,
            };

            await this.concertRepository.saveConcert(Concert.from(concert));
          }
        }
      }

      await listBrowser.close();
    } catch (e) {
      const logPayload: LogPayload = {
        level: LOG_LEVEL.ERROR,
        className: 'SejongCrawlerService',
        functionName: 'crawlSejong',
        message: e.message,
      };

      this.eventEmitter.emit('log.created', logPayload);
      console.log(UtilLog.getLogMessage(logPayload));
    }
  }

  private async urlToFile(url: string, filename: string): Promise<string> {
    filename = filename + '.webp';
    const response = await axios.get(url, { responseType: 'stream' });

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

  private classifyCategory(title: string) {
    if (title.includes('오케스트라') || title.includes('교향') || title.includes('필하모닉')) return CONCERT_CATEGORY.ORCHESTRA;
    if (title.includes('합창')) return CONCERT_CATEGORY.CHORUS;
    if (title.includes('앙상블') || title.includes('트리오')) return CONCERT_CATEGORY.ENSEMBLE;
    if (title.includes('독주') || title.includes('리사이틀') || title.includes('데뷔')) return CONCERT_CATEGORY.SOLO;
    return CONCERT_CATEGORY.ETC;
  }

  private categoryValidator(category: string): boolean {
    const categories: string[] = ['기악', '국악', '성악', '합창'];
    return categories.includes(category);
  }
}
