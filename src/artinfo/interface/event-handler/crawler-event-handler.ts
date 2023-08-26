import { Controller } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LogService } from '@/artinfo/application/service/log.service';
import { LogPayload } from '@/artinfo/domain/entities/server_log.entity';

@Controller()
export class CrawlerEventHandler {
  constructor(private readonly logService: LogService) {}

  @OnEvent('log.created')
  handleCrawlerLogSaved(payload: LogPayload): void {
    this.logService.saveLog(payload);
  }
}
