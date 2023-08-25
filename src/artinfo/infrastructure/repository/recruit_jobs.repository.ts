import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from './supabase.repository';
import { RECRUIT_JOBS_CATEGORY } from '@/artinfo/interface/type/type';

@Injectable()
export class RecruitJobsRepository extends SupabaseRepository {
  async saveRecruitJob(fields: any) {
    const { data, error } = await this.supabase.from('recruit_jobs').insert(fields).select();

    if (error || data?.length == 0) console.log(error);

    return data![0].id;
  }
}
