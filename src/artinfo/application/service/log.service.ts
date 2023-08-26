import { Injectable } from '@nestjs/common';
import { LogRepository } from '@/artinfo/infrastructure/repository/log.repository';
import { Log, LogPayload } from '@/artinfo/domain/entities/server_log.entity';

@Injectable()
export class LogService {
  constructor(private readonly logRepository: LogRepository) {}

  saveLog(payload: LogPayload) {
    return this.logRepository.saveLog(Log.from(payload));
  }
}
