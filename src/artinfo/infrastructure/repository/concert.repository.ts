import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '@/artinfo/infrastructure/repository/supabase.repository';
import { Concert } from '@/artinfo/domain/entities/concerts.entity';

@Injectable()
export class ConcertRepository extends SupabaseRepository {
  async saveConcert(fields: Concert) {
    const { data, error } = await this.supabase.from('concerts').insert(fields).select();

    if (error || data?.length == 0) console.log(error);

    return data![0].id;
  }
  async getConcert(uniqueKey: string): Promise<Concert | null> {
    const { data, error } = await this.supabase.from('concerts').select('*').eq('unique_key', uniqueKey);

    if (error) console.log(error);

    return data![0];
  }
}
