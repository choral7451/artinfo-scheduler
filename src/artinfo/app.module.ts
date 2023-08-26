import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CrawlerModule } from './application/module/crawler.module';
import { LogModule } from '@/artinfo/application/module/log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
    }),
    LogModule,
    CrawlerModule,
  ],
})
export class AppModule {}
