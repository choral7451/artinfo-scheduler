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

@Injectable()
export class GangnamCrawlerService {
  constructor(
    private readonly recruitJobRepository: RecruitJobRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async crawlGangnam(): Promise<void> {
    try {
      const recruitUrl = 'https://www.gangnam.go.kr/office/gfac/board/gfac_staffrec/list.do?mid=gfac_staffRec';

      const html = await axios.get(recruitUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
        },
      });

      const today = Number(String(new Date().getMonth() + 1) + String(new Date().getDate()));

      const $ = cheerio.load(html.data);
      const lists = $('tbody');

      for (let i = 1; i <= 5; i++) {
        const recruitCreatedAt = lists.find(`tr:nth-child(${i})`).find(`td:nth-child(5)`).text();
        const title = lists.find(`tr:nth-child(${i})`).find(`td:nth-child(2)`).text().trim();
        const createdMonthAndDate = Number(String(new Date(recruitCreatedAt).getMonth() + 1) + String(new Date(recruitCreatedAt).getDate()));

        const url = 'https://www.gangnam.go.kr/' + lists.find(`tr:nth-child(${i})`).find('td:nth-child(2)').find('a').attr('href');

        if (today === createdMonthAndDate && url && (title.includes('교향악단') || title.includes('합창'))) {
          const detailHtml = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
            },
          });

          const detail$ = cheerio.load(detailHtml.data);
          const contents = detail$('div.post-content').html();

          if (process.env.ARTINFO_ADMIN_ID && contents) {
            const recruitJob: RecruitJobPayload = {
              profileId: process.env.ARTINFO_ADMIN_ID,
              category: RECRUIT_JOBS_CATEGORY.ART_ORGANIZATION,
              title: title,
              contents: contents,
              companyName: '강남예술단',
              companyImageUrl: 'https://ycuajmirzlqpgzuonzca.supabase.co/storage/v1/object/public/artinfo/system/gangnam_log.jpg',
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
        className: 'GangnamCrawlerService',
        functionName: 'crawlGangnam',
        message: e.message,
      };

      this.eventEmitter.emit('log.created', logPayload);
      console.log(UtilLog.getLogMessage(logPayload));
    }
  }
}
