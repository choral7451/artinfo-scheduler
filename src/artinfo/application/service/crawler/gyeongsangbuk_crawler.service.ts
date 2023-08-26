import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { RecruitJob, RecruitJobPayload } from '@/artinfo/domain/entities/recruit_job.entity';
import { LOG_LEVEL, RECRUIT_JOBS_CATEGORY } from '@/artinfo/interface/type/type';
import { RecruitJobRepository } from '@/artinfo/infrastructure/repository/recruit_job.repository';
import { UtilDate } from '@/artinfo/utils/date';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UtilLog } from '@/artinfo/utils/log';
import { LogPayload } from '@/artinfo/domain/entities/server_log.entity';
import https from 'https';

@Injectable()
export class GyeongsangbukCrawlerService {
  constructor(
    private readonly recruitJobRepository: RecruitJobRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async crawlGyeongsangbuk(): Promise<void> {
    try {
      const recruitUrl =
        'https://www.gb.go.kr/Main/open_contents/section/culture/page.do?bdName=%EB%8F%84%EB%A6%BD%EC%98%88%EC%88%A0%EB%8B%A8+%EA%B3%B5%EC%A7%80%EC%82%AC%ED%95%AD&mnu_uid=6522&p1=0&p2=0&dept_name=&dept_code=&BD_CODE=art_notice_new&B_START=2023-06-26&B_END=20230826&key=2&word=%EB%AA%A8%EC%A7%91';

      const html = await axios.get(recruitUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
        },
      });

      const today = Number(String(new Date().getMonth() + 1) + String(new Date().getDate()));

      const $ = cheerio.load(html.data);
      const lists = $('tbody');

      for (let i = 1; i <= 3; i++) {
        const recruitCreatedAt = '20' + lists.find(`tr:nth-child(${i})`).find(`td:nth-child(6)`).text();
        const createdMonthAndDate = Number(String(new Date(recruitCreatedAt).getMonth() + 1) + String(new Date(recruitCreatedAt).getDate()));

        const url =
          'https://www.gb.go.kr/Main/open_contents/section/culture' + lists.find(`tr:nth-child(${i})`).find('td:nth-child(2)').find('a').attr('href')?.slice(1);

        if (today === createdMonthAndDate && url) {
          const detailHtml = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
            },
          });

          const detail$ = cheerio.load(detailHtml.data);

          const title = detail$('dl.title').find(`dd`).text().trim();
          const contents = detail$('dl.content').find(`dd`).html();

          if (process.env.ARTINFO_ADMIN_ID && contents) {
            const recruitJob: RecruitJobPayload = {
              profileId: process.env.ARTINFO_ADMIN_ID,
              category: RECRUIT_JOBS_CATEGORY.ART_ORGANIZATION,
              title: title,
              contents: contents,
              companyName: '경북도립예술단',
              companyImageUrl: 'https://ycuajmirzlqpgzuonzca.supabase.co/storage/v1/object/public/artinfo/system/gyeongsangbuk_logo.png',
              linkUrl: url,
              isActive: false,
            };

            await this.recruitJobRepository.saveRecruitJob(RecruitJob.from(recruitJob));
          }
        }
      }
    } catch (e) {
      const logPayload: LogPayload = {
        level: LOG_LEVEL.ERROR,
        className: 'GyeongsangbukCrawlerService',
        functionName: 'crawlGyeongsangbuk',
        message: e.message,
      };

      this.eventEmitter.emit('log.created', logPayload);
      console.log(UtilLog.getLogMessage(logPayload));
    }
  }
}
