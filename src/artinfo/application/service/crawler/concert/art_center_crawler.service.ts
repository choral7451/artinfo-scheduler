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

@Injectable()
export class ArtCenterCrawlerService {
  constructor(
    private readonly concertRepository: ConcertRepository,
    private readonly systemRepository: SystemRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async crawlArtCenter(): Promise<void> {
    try {
      const recruitUrl = `https://www.sac.or.kr/site/main/show/todayShow?searchDay=${this.getAfterTwentyDays()}#tb_list`;
      const listBrowser = await puppeteer.launch({
        headless: true,
      });

      const page = await listBrowser.newPage();
      await page.goto(recruitUrl);
      await page.waitForSelector('#tb_list tr');

      const trElements = await page.$$('tbody tr');
      for (let i = 0; i < trElements.length; i++) {
        const tr = trElements[i];

        const location = await page.evaluate(tr => {
          const td = tr.querySelector('td:nth-child(3)');
          return td!.textContent!.trim();
        }, tr);

        const linkHref = await page.evaluate(tr => {
          const a = tr.querySelector('td:nth-child(1) a');
          return 'https://www.sac.or.kr' + a?.getAttribute('href');
        }, tr);

        if (this.locationValidator(location)) {
          const title = await page.evaluate(tr => {
            const a = tr.querySelector('td:nth-child(1) a');
            return a!.textContent!.trim();
          }, tr);

          let posterUrl = await page.evaluate(tr => {
            const a = tr.querySelector('td:nth-child(1) a i img');
            return 'https://www.sac.or.kr' + a?.getAttribute('src');
          }, tr);

          if (posterUrl !== 'https://www.sac.or.kr/design/common/images/asset/noImage300x300.png') {
            let filename = String(Date.now());
            filename = await this.urlToFile(posterUrl, filename);
            const buffer = fs.readFileSync('temp_images/' + filename);
            const file = new File([buffer], filename, { type: 'image/webp' });

            posterUrl = await this.systemRepository.uploadImage('concert/' + filename, file);
            fs.unlinkSync('temp_images/' + filename);

            let performanceTime: any = await page.evaluate(tr => {
              const td = tr.querySelector('td:nth-child(2)');
              return td!.textContent!.trim();
            }, tr);

            performanceTime = this.parseDateString(performanceTime);

            const detailHtml = await axios.get(linkHref, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
              },
            });

            const detail$ = cheerio.load(detailHtml.data);

            const nav = detail$('#contents > div.cwa-con > div.cwa-content.area > ul');
            const countOfNav = nav.find('li').length;
            let indexOfContents = 1;

            for (let j = 1; j < countOfNav; j++) {
              if (nav.find(`li:nth-child(${j})`).text().trim() === '작품소개') {
                indexOfContents = j;
                break;
              }
            }

            const contents =
              `<img src=${posterUrl}>` +
              detail$('#contents > div.cwa-con > div.cwa-content.area > div.cwa-tab-list')
                .find(`div:nth-child(${indexOfContents === 1 ? indexOfContents : indexOfContents + 1}) > div`)
                .html();

            const concert: ConcertPayload = {
              title: title,
              contents: contents!,
              posterUrl: posterUrl,
              location: '예술의전당 ' + location,
              performanceTime: performanceTime!,
              profileId: process.env.ARTINFO_ADMIN_ID!,
              category: this.classifyCategory(title),
            };

            await this.concertRepository.saveConcert(Concert.from(concert));
          }
        }
      }

      await listBrowser.close();
    } catch (e) {
      const logPayload: LogPayload = {
        level: LOG_LEVEL.ERROR,
        className: 'ArtCenterCrawlerService',
        functionName: 'crawlArtCenter',
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
    if (title.includes('합창') || title.includes('콰이어')) return CONCERT_CATEGORY.CHORUS;
    if (title.includes('앙상블') || title.includes('트리오')) return CONCERT_CATEGORY.ENSEMBLE;
    if (title.includes('독주') || title.includes('리사이틀') || title.includes('데뷔') || title.includes('독창')) return CONCERT_CATEGORY.SOLO;
    return CONCERT_CATEGORY.ETC;
  }

  private parseDateString(dateString: string) {
    const date = '2023-' + dateString.split('2023.')[1].slice(0, 14).replaceAll('.', '-');
    return new Date(`${date.split('(')[0]}T${date.split(' ')[1]}:00`);
  }

  private locationValidator(location: string) {
    const validation = ['콘서트홀', 'IBK챔버홀', '리사이틀홀', '인춘아트홀'];
    return validation.indexOf(location) !== -1;
  }

  private getAfterTwentyDays(): string {
    const today = new Date();

    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 20);

    const year = futureDate.getFullYear();
    const month = (futureDate.getMonth() + 1).toString().padStart(2, '0');
    const day = futureDate.getDate().toString().padStart(2, '0');

    return year + '-' + month + '-' + day;
  }
}
