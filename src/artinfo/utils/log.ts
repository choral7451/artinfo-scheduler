import { UtilDate } from '@/artinfo/utils/date';
import { LogPayload } from '@/artinfo/domain/entities/server_log.entity';

export class UtilLog {
  static getLogMessage(logPayload: LogPayload) {
    return `[ ${logPayload.level} ] - ${UtilDate.logFormattedTime()}        ClassName: ${logPayload.className} | FunctionName: ${
      logPayload.functionName
    } | Message: ${logPayload.message} `;
  }
}
