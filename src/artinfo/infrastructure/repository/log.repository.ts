import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '@/artinfo/infrastructure/repository/supabase.repository';
import { Log } from '@/artinfo/domain/entities/server_log.entity';

@Injectable()
export class LogRepository extends SupabaseRepository {
  async saveLog(entity: Log) {
    const { data, error } = await this.supabase.from('server_logs').insert(entity).select();

    if (error || data?.length == 0) console.log(error);

    return data![0].id;
  }
}
