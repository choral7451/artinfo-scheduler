import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { RecruitJob, RecruitJobPayload } from '@/artinfo/domain/entities/recruit_job.entity';
import { LOG_LEVEL, RECRUIT_JOBS_CATEGORY } from '@/artinfo/interface/type/type';
import { RecruitJobRepository } from '@/artinfo/infrastructure/repository/recruit_job.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UtilLog } from '@/artinfo/utils/log';
import { LogPayload } from '@/artinfo/domain/entities/server_log.entity';
import * as iconv from 'iconv-lite';

@Injectable()
export class GoyangCivicChoirCrawlerService {
  constructor(
    private readonly recruitJobRepository: RecruitJobRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async crawlGoyangCivicChoir(): Promise<void> {
    try {
      const recruitUrl = 'http://www.choralegoyang.or.kr/city/notice.asp';

      const html = await axios.get(recruitUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
        },
      });

      const today = Number(String(new Date().getMonth() + 1) + String(new Date().getDate()));

      const $ = cheerio.load(html.data);
      const lists = $('tbody');

      for (let i = 1; i <= 3; i++) {
        const recruitCreatedAt = lists.find(`tr:nth-child(${i})`).find(`td:nth-child(3)`).text();
        const createdMonthAndDate = Number(String(new Date(recruitCreatedAt).getMonth() + 1) + String(new Date(recruitCreatedAt).getDate()));

        const idx = lists.find(`tr:nth-child(${i})`).find('td:nth-child(2)').find('a').attr('href')?.split('idx=')[1].split('&')[0];
        const url = `http://www.choralegoyang.or.kr/city/notice_view.asp?idx=${idx}&page=&L_url=&R_url=&T_name=`;

        if (today === createdMonthAndDate && url) {
          const detailHtml = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
            },
          });

          const decodedData = iconv.decode(detailHtml.data, 'EUC-KR').toString();
          const detail$ = cheerio.load(decodedData);

          const title = detail$('table.board_view').find(`th`).text().trim();
          const contents = detail$('table.board_view_con').find(`tr`).html();

          if (process.env.ARTINFO_ADMIN_ID && contents) {
            const recruitJob: RecruitJobPayload = {
              profileId: process.env.ARTINFO_ADMIN_ID,
              category: RECRUIT_JOBS_CATEGORY.ART_ORGANIZATION,
              title: title,
              contents: contents,
              companyName: '고양시립합창단',
              companyImageUrl: 'https://ycuajmirzlqpgzuonzca.supabase.co/storage/v1/object/public/artinfo/system/goyang_civic_choir.png',
              linkUrl: url,
              isActive: true,
            };

            await this.recruitJobRepository.saveRecruitJob(RecruitJob.from(recruitJob));
          }
        }
      }
    } catch (e) {
      const logPayload: LogPayload = {
        level: LOG_LEVEL.ERROR,
        className: 'GoyangCivicChoirCrawlerService',
        functionName: 'crawlGoyangCivicChoir',
        message: e.message,
      };

      this.eventEmitter.emit('log.created', logPayload);
      console.log(UtilLog.getLogMessage(logPayload));
    }
  }
}
