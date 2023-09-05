import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { LOG_LEVEL, RECRUIT_JOBS_CATEGORY } from '@/artinfo/interface/type/type';
import { RecruitJobRepository } from '@/artinfo/infrastructure/repository/recruit_job.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UtilLog } from '@/artinfo/utils/log';
import { LogPayload } from '@/artinfo/domain/entities/server_log.entity';
import * as iconv from 'iconv-lite';
import { RecruitJob, RecruitJobPayload } from '@/artinfo/domain/entities/recruit_job.entity';

@Injectable()
export class JangshinCrawlerService {
  constructor(
    private readonly recruitJobRepository: RecruitJobRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async crawlJangshin(): Promise<void> {
    try {
      const recruitUrl = 'https://www.puts.ac.kr/www/board/list.general.asp?design=lounge&m1=4&m2=4&m3=1&bd_name=jangshin_jboard04';

      const html = await axios.get(recruitUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
        },
      });

      const today = Number(String(new Date().getMonth() + 1) + String(new Date().getDate()));

      const decodedData = iconv.decode(html.data, 'EUC-KR').toString();
      const $ = cheerio.load(decodedData);
      const lists = $('tbody');

      for (let i = 4; i <= 23; i++) {
        const recruitCreatedAt = lists.find(`tr:nth-child(${i})`).find(`td:nth-child(2)`).find('span:nth-child(3)').text().trim();
        const splitRecruitCreatedAt = recruitCreatedAt.split('.');
        const createdMonthAndDate = Number(String(Number(splitRecruitCreatedAt[1])) + String(Number(splitRecruitCreatedAt[2])));

        const listTitle = lists.find(`tr:nth-child(${i})`).find(`td:nth-child(2)`).find('div').find('a').text().trim();
        const url = 'https://www.puts.ac.kr/www/board/' + lists.find(`tr:nth-child(${i})`).find(`td:nth-child(2)`).find('div').find('a').attr('href');

        if (today === createdMonthAndDate && url && (listTitle.includes('반주') || listTitle.includes('지휘'))) {
          const detailHtml = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
            },
          });

          const decodedDetailData = iconv.decode(detailHtml.data, 'EUC-KR').toString();
          const detail$ = cheerio.load(decodedDetailData);

          const title = detail$('div.headinfo').find('h4').text().trim();
          const companyName = detail$('div.tx1').find('h4').text().trim();
          const contents = detail$('div.cont').html();

          if (process.env.ARTINFO_ADMIN_ID && contents) {
            const recruitJob: RecruitJobPayload = {
              profileId: process.env.ARTINFO_ADMIN_ID,
              category: RECRUIT_JOBS_CATEGORY.RELIGION,
              title: title,
              contents: contents,
              companyName: companyName,
              companyImageUrl: 'https://ycuajmirzlqpgzuonzca.supabase.co/storage/v1/object/public/artinfo/system/recruit-jobs-church.png',
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
        className: 'JangshinCrawlerService',
        functionName: 'crawlJangshin',
        message: e.message,
      };

      this.eventEmitter.emit('log.created', logPayload);
      console.log(UtilLog.getLogMessage(logPayload));
    }
  }
}
