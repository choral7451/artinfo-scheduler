import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { RecruitJob, RecruitJobPayload } from '@/artinfo/domain/entities/recruit_job.entity';
import { LOG_LEVEL, RECRUIT_JOBS_CATEGORY } from '@/artinfo/interface/type/type';
import { RecruitJobRepository } from '@/artinfo/infrastructure/repository/recruit_job.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UtilLog } from '@/artinfo/utils/log';
import { LogPayload } from '@/artinfo/domain/entities/server_log.entity';

@Injectable()
export class NationalSymphonyCrawlerService {
  constructor(
    private readonly recruitJobRepository: RecruitJobRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async crawlNationalSymphony(): Promise<void> {
    try {
      const recruitUrl = 'https://www.knso.or.kr/front/M0000034/article/list.do';

      const html = await axios.get(recruitUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
        },
      });

      const today = Number(String(new Date().getMonth() + 1) + String(new Date().getDate()));

      const $ = cheerio.load(html.data);
      const lists = $('tbody');

      for (let i = 1; i <= 5; i++) {
        const recruitCreatedAt = lists.find(`tr:nth-child(${i})`).find('td:nth-child(5)').text().trim();
        const title = lists.find(`tr:nth-child(${i})`).find('td:nth-child(3)').text().trim();
        const createdMonthAndDate = Number(String(new Date(recruitCreatedAt).getMonth() + 1) + String(new Date(recruitCreatedAt).getDate()));

        const idx = lists.find(`tr:nth-child(${i})`).find('td:nth-child(3)').find('a').attr('onclick')?.split("'")[1];
        const url = `https://www.knso.or.kr/front/M0000034/article/view.do?pageIndex=1&cateId=&atcId=${idx}&searchType=title&searchKeyword=`;

        if (today === createdMonthAndDate && url && title.includes('채용')) {
          const detailHtml = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
            },
          });

          const detail$ = cheerio.load(detailHtml.data);
          const contents = detail$('div.viewContent').html();

          if (process.env.ARTINFO_ADMIN_ID && contents) {
            const modifiedContents = contents.replace(/<img\s+src="([^"]+)"/g, (match, src) => {
              return `<img src="https://www.knso.or.kr${src}"`;
            });

            const recruitJob: RecruitJobPayload = {
              profileId: process.env.ARTINFO_ADMIN_ID,
              category: RECRUIT_JOBS_CATEGORY.ART_ORGANIZATION,
              title: title,
              contents: modifiedContents,
              companyName: '국립심포니오케스트라',
              companyImageUrl: 'https://ycuajmirzlqpgzuonzca.supabase.co/storage/v1/object/public/artinfo/system/national_symphony_logo.png',
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
        className: 'GwacheonCrawlerService',
        functionName: 'crawlGwacheon',
        message: e.message,
      };

      this.eventEmitter.emit('log.created', logPayload);
      console.log(UtilLog.getLogMessage(logPayload));
    }
  }
}
