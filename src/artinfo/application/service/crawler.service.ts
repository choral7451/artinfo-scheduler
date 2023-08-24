import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class CrawlerService {
  getHello() {
    return this.crawlNationalChorus();
  }

  async getRecruitsFromCrawling() {}

  async crawlNationalChorus() {
    let result;

    const html = await axios.get(`http://nationalchorus.or.kr/notice-2/?board_name=notice_new&mode=list&order_by=fn_pid&order_type=desc`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
      },
    });

    const today = Number(String(new Date().getMonth() + 1) + String(new Date().getDate()));

    const $ = cheerio.load(html.data);
    const lists = $('tbody#notice_new_board_body');

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

        result = detail$('tr#mb_notice_new_tr_content').html();
      }
    }

    return result;
  }
}
