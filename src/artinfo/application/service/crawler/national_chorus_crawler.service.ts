import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { RecruitJobPayload } from '@/artinfo/domain/entities/recruit_jobs.entity';
import { RECRUIT_JOBS_CATEGORY } from '@/artinfo/interface/type/type';

@Injectable()
export class NationalChorusCrawlerService {
  async crawlNationalChorus() {
    const result: any[] = [];

    await Promise.all(
      [
        'http://nationalchorus.or.kr/notice-2/?mode=list&board_name=notice_new&order_by=fn_pid&order_type=desc&category1=&category2=&category3=&search_field=fn_title&search_text=%EB%8B%A8%EC%9B%90',
        'http://nationalchorus.or.kr/notice-2/?mode=list&board_name=notice_new&order_by=fn_pid&order_type=desc&category1=&category2=&category3=&search_field=fn_title&search_text=%EC%B1%84%EC%9A%A9',
      ].map(async el => {
        const html = await axios.get(el, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
          },
        });

        const today = Number(String(new Date().getMonth() + 1) + String(new Date().getDate()));

        const $ = cheerio.load(html.data);
        const lists = $('tbody#notice_new_board_body');

        const currentUtcTime = new Date();
        const koreaTime = new Date(currentUtcTime.getTime() + 9 * 60 * 60 * 1000);
        console.log(koreaTime);
        console.log(String(koreaTime.getMonth()) + String(koreaTime.getDate()));

        for (let i = 1; i <= 5; i++) {
          const recruitCreatedAt = lists.find(`tr:nth-child(${i})`).find('td:nth-child(4)').text();
          const createdMonthAndDate = Number(String(new Date(recruitCreatedAt).getMonth() + 1) + String(new Date(recruitCreatedAt).getDate()));

          const url = lists.find(`tr:nth-child(${i})`).find('td:nth-child(2)').find('a').attr('href');
          if (today === createdMonthAndDate && url) {
            const detailHtml = await axios.get(url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
              },
            });

            const detail$ = cheerio.load(detailHtml.data);

            const title = detail$('tr#mb_notice_new_tr_title').find('td:nth-child(2)').find('span:nth-child(1)').text();
            const contents = detail$('tr#mb_notice_new_tr_content').html();

            if (process.env.ARTINFO_ADMIN_ID && contents) {
              const recruitJob: RecruitJobPayload = {
                profile_id: process.env.ARTINFO_ADMIN_ID,
                category: RECRUIT_JOBS_CATEGORY.ART_ORGANIZATION,
                title: title,
                contents: contents,
                company_name: '국립합창단',
                company_image_url: 'https://ycuajmirzlqpgzuonzca.supabase.co/storage/v1/object/public/artinfo/company_images/national_chorus.jpeg',
              };

              result.push(recruitJob);
            }
          }
        }
      }),
    );

    return result;
  }
}
