import { Module } from '@nestjs/common';
import { LogService } from '@/artinfo/application/service/log.service';
import { LogRepository } from '@/artinfo/infrastructure/repository/log.repository';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [LogService, LogRepository],
})
export class LogModule {}
