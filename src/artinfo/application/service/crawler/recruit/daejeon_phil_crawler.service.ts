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
export class DaejeonPhilCrawlerService {
  constructor(
    private readonly recruitJobRepository: RecruitJobRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async crawlDaejeonPhil(): Promise<void> {
    try {
      const recruitUrl = 'https://dpo.artdj.kr/dpo/?a_idx=06_01&kf=sub&kw=&bo=dpo_news&p=1';

      const html = await axios.get(recruitUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
        },
      });

      const today = Number(String(new Date().getMonth() + 1) + String(new Date().getDate()));

      const decodedData = iconv.decode(html.data, 'EUC-KR').toString();
      const $ = cheerio.load(decodedData);

      const lists = $(' #content > div > table > tbody');

      for (let i = 1; i <= 3; i++) {
        const recruitCreatedAt = '20' + lists.find(`tr:nth-child(${i}) > td:nth-child(3)`).text().trim().replaceAll('.', '-');
        const title = lists.find(`tr:nth-child(${i}) > td.text-align--left`).text().trim();
        const createdMonthAndDate = Number(String(new Date(recruitCreatedAt).getMonth() + 1) + String(new Date(recruitCreatedAt).getDate()));

        const url = lists.find(`tr:nth-child(${i}) > td.text-align--left > a`).attr('href')?.replace('.', 'https://dpo.artdj.kr/dpo');
        if (today === createdMonthAndDate && url && (title.includes('모집') || title.includes('채용')) && !title.includes('합격')) {
          const detailHtml = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
            },
          });

          const detail$ = cheerio.load(detailHtml.data);
          const contents = detail$('#content > div > table.bd_view > tbody > tr > td').html()?.replaceAll('src="', `src="https://dpo.artdj.kr`);

          if (process.env.ARTINFO_ADMIN_ID && contents) {
            const recruitJob: RecruitJobPayload = {
              profileId: process.env.ARTINFO_ADMIN_ID,
              category: RECRUIT_JOBS_CATEGORY.ART_ORGANIZATION,
              title: title,
              contents: contents,
              companyName: '대전시립교향악단',
              companyImageUrl: 'https://ycuajmirzlqpgzuonzca.supabase.co/storage/v1/object/public/artinfo/system/art_organization/daejeon_logo.jpeg',
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
        className: 'DaejeonPhilCrawlerService',
        functionName: 'crawlDaejeonPhil',
        message: e.message,
      };

      this.eventEmitter.emit('log.created', logPayload);
      console.log(UtilLog.getLogMessage(logPayload));
    }
  }
}
