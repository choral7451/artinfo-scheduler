import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class ArtCenterCrawlerService {
  constructor() {}

  async crawlArtCenter(): Promise<void> {
    try {
      const recruitUrl = `https://www.sac.or.kr/site/main/show/todayShow?searchDay=${this.getAfterTwentyDays()}#tb_list`;
      const browser = await puppeteer.launch({
        headless: false,
      });

      const page = await browser.newPage();
      await page.goto(recruitUrl);
      await page.waitForSelector('#tb_list tr');

      // 이 부분을 수정하여 tr 태그의 수를 얻을 수 있습니다.
      const trElements = await page.$$('tbody tr');
      for (let i = 0; i < trElements.length; i++) {
        const tr = trElements[i];

        // 현재 tr 요소에서 두 번째 td 요소의 값을 가져옵니다.
        const location = await page.evaluate(tr => {
          const td = tr.querySelector('td:nth-child(3)');
          return td!.textContent!.trim();
        }, tr);

        if (this.locationValidator(location)) {
          console.log(location);
        }
      }

      await browser.close();
    } catch (error) {
      console.error('Error:', error);
    }
  }
  private locationValidator(location: string) {
    const validation = ['콘서트홀', 'IBK챔버홀', '리사이틀홀', '인춘아트홀'];
    return validation.indexOf(location) !== -1;
  }

  private getAfterTwentyDays(): string {
    const today = new Date();

    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 21);

    const year = futureDate.getFullYear();
    const month = (futureDate.getMonth() + 1).toString().padStart(2, '0');
    const day = futureDate.getDate().toString().padStart(2, '0');

    return year + '-' + month + '-' + day;
  }
}
