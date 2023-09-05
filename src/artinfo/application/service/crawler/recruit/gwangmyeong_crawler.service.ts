import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { RecruitJobPayload } from '@/artinfo/domain/entities/recruit_job.entity';
import { LOG_LEVEL, RECRUIT_JOBS_CATEGORY } from '@/artinfo/interface/type/type';
import { RecruitJobRepository } from '@/artinfo/infrastructure/repository/recruit_job.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UtilLog } from '@/artinfo/utils/log';
import { LogPayload } from '@/artinfo/domain/entities/server_log.entity';

@Injectable()
export class GwangmyeongCrawlerService {
  constructor(
    private readonly recruitJobRepository: RecruitJobRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async crawlGwangmyeong(): Promise<void> {
    try {
      const recruitUrl = 'https://www.gm.go.kr/pt/search/search.do?query=%EC%8B%9C%EB%A6%BD%ED%95%A9%EC%B0%BD%EB%8B%A8';

      const html = await axios.get(recruitUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
        },
      });

      const today = Number(String(new Date().getMonth() + 1) + String(new Date().getDate()));

      const $ = cheerio.load(html.data);
      const lists = $('div.srch_contents');

      for (let i = 1; i <= 7; i++) {
        const recruitCreatedAt = lists.find(`div:nth-child(${i})`).text();
        const createdMonthAndDate = Number(String(Number(recruitCreatedAt[1])) + String(Number(recruitCreatedAt[2])));

        const url = 'https://www.gcart.or.kr/' + lists.find(`li:nth-child(${i})`).find('p:nth-child(2)').find('a').attr('href')?.slice(1);

        if (today === createdMonthAndDate && url) {
          const detailHtml = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
            },
          });

          const detail$ = cheerio.load(detailHtml.data);

          const title = detail$('div.view_top').find(`p.tit`).text().trim();
          const contents = detail$('div.view_cont').html();

          if (process.env.ARTINFO_ADMIN_ID && contents) {
            const recruitJob: RecruitJobPayload = {
              profileId: process.env.ARTINFO_ADMIN_ID,
              category: RECRUIT_JOBS_CATEGORY.ART_ORGANIZATION,
              title: title,
              contents: contents,
              companyName: '광명시립합창단',
              companyImageUrl: 'https://ycuajmirzlqpgzuonzca.supabase.co/storage/v1/object/public/artinfo/system/gwacheon.png',
              linkUrl: url,
              isActive: false,
            };

            // await this.recruitJobRepository.saveRecruitJob(RecruitJob.from(recruitJob));
          }
        }
      }
    } catch (e) {
      const logPayload: LogPayload = {
        level: LOG_LEVEL.ERROR,
        className: 'GwangmyeongCrawlerService',
        functionName: 'crawlGwangmyeong',
        message: e.message,
      };

      this.eventEmitter.emit('log.created', logPayload);
      console.log(UtilLog.getLogMessage(logPayload));
    }
  }
}
