import { LOG_LEVEL } from '@/artinfo/interface/type/type';

export type LogPayload = {
  className: string;
  functionName: string;
  message: string;
  level: LOG_LEVEL;
};

export class Log {
  id: string;
  class_name: string;
  function_name: string;
  message: string;
  level: LOG_LEVEL;
  created_at: Date;

  static from(payload: LogPayload): Log {
    const entity = new Log();

    entity.class_name = payload.className;
    entity.function_name = payload.functionName;
    entity.level = payload.level;
    entity.message = payload.message;

    return entity;
  }
}
