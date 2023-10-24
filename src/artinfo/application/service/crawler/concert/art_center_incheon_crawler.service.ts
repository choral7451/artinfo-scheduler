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
import { LogPayload } from '@/artinfo/domain/entities/server_log.entity';
import { Agent } from 'https';
import * as md5 from 'md5';

@Injectable()
export class ArtCenterIncheonService {
  constructor(
    private readonly concertRepository: ConcertRepository,
    private readonly systemRepository: SystemRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async crawlArtCenterIncheon(): Promise<void> {
    try {
      const recruitUrl = 'https://www.aci.or.kr/PageLink.do?menuNo=010000&subMenuNo=010100&thirdMenuNo=&link=forward%3A%2Fshow%2Flist.do%3Fshow_type%3Dall%26viewType%3Dimg&conText=%2Fmain&tempParam1=&spring-security-redirect=%2Fmain%2FmainPage.do';

      const html = await axios.get(recruitUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
        },
        httpsAgent: new Agent({
          rejectUnauthorized: false,
        }),
      });

      const $ = cheerio.load(html.data);
      const detailBtn = $('#subpage > div.sub-page-container.wrap.float-wrap > div > div.sub-page-container > div > section > div > div.con_event_list > ul > li:nth-child(6) > div.text_wrap > div > a.och_btn.type1');
      const concertIndex = detailBtn.attr('onclick')?.replaceAll(`goAction('`,"").slice(0,5);
      const url = `https://www.aci.or.kr/main/show/view.do?show_type=all&viewType=img&SHOW_IDX=${concertIndex}&menuNo=010000&subMenuNo=010100`

      const detailHtml = await axios.get(url, {
          headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
          },
          httpsAgent: new Agent({
              rejectUnauthorized: false,
          }),
      });
      const detail$ = cheerio.load(detailHtml.data);
      const title = detail$('#subpage > div.sub-page-container.wrap.float-wrap > div > div.sub-page-container > div > section > div > div.con_event_list.event_view > ul > li > div.text_wrap > h2').text().trim();

      const uniqueKey = md5(title);

      const fetchedConcert = await this.concertRepository.getConcert(uniqueKey);
      if (!fetchedConcert) {
          const posterSrc = detail$(`#subpage > div.sub-page-container.wrap.float-wrap > div > div.sub-page-container > div > section > div > div.con_event_list.event_view > ul > li > div.envent_img > img`).attr('src');

          if (!posterSrc) return;
          let posterUrl = 'https://www.aci.or.kr' + posterSrc;

          let filename = String(Date.now());
          filename = await this.urlToFile(posterUrl, filename);
          const buffer = fs.readFileSync('temp_images/' + filename);
          const file = new File([buffer], filename, { type: 'image/webp' });

          posterUrl = await this.systemRepository.uploadImage('concert/' + filename, file);
          fs.unlinkSync('temp_images/' + filename);

          let fetchedPerformTime = detail$(`#subpage > div.sub-page-container.wrap.float-wrap > div > div.sub-page-container > div > section > div > div.con_event_list.event_view > ul > li > div.text_wrap > ul > li:nth-child(1)`).text().trim().replaceAll("공연일정 ","").replaceAll(" ", "")

          const year = fetchedPerformTime.split("년")[0]
          const month = fetchedPerformTime.split("년")[1].split("월")[0].padStart(2, "0")
          const day = fetchedPerformTime.split("년")[1].split("월")[1].split("일")[0].padStart(2, "0")
          const time = fetchedPerformTime.split("년")[1].split("월")[1].split("일")[1].split(")")[1].split("시")[0]

          const performanceTime = new Date(`${year}-${month}-${day}T${time}:00:00`)
          let contents = detail$(`#outLine > div.tab_box.selected`).html()
          if(contents!.includes("src")) {
              contents = contents!.replaceAll('src="','src="https://www.aci.or.kr')
          }
          contents = `<img src="${posterUrl}"><br />`+ contents


          const concert: ConcertPayload = {
            title: title,
            contents: contents!,
            posterUrl: posterUrl,
            location: '아트센터인천',
            performanceTime: performanceTime,
            profileId: process.env.ARTINFO_ADMIN_ID!,
            category: this.classifyCategory(title),
            uniqueKey: uniqueKey,
          };

          await this.concertRepository.saveConcert(Concert.from(concert));
      }
          } catch (e) {
        const logPayload: LogPayload = {
            level: LOG_LEVEL.ERROR,
            className: 'ArtCenterIncheonService',
            functionName: 'crawlArtCenterIncheon',
            message: e.message,
        };

        this.eventEmitter.emit('log.created', logPayload);
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
