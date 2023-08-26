import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '@/artinfo/infrastructure/repository/supabase.repository';
import { RecruitJob } from '@/artinfo/domain/entities/recruit_job.entity';

@Injectable()
export class RecruitJobRepository extends SupabaseRepository {
  async saveRecruitJob(fields: RecruitJob) {
    const { data, error } = await this.supabase.from('recruit_jobs').insert(fields).select();

    if (error || data?.length == 0) console.log(error);

    return data![0].id;
  }
}
