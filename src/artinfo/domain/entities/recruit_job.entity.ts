import { RECRUIT_JOBS_CATEGORY } from '@/artinfo/interface/type/type';

export type RecruitJobPayload = {
  profileId: string;
  category: RECRUIT_JOBS_CATEGORY;
  title: string;
  contents: string;
  companyName: string;
  linkUrl: string;
  isActive: boolean;
  companyImageUrl?: string;
};

export class RecruitJob {
  id: string;
  profile_id: string;
  category: RECRUIT_JOBS_CATEGORY;
  title: string;
  contents: string;
  company_name: string;
  company_image_url?: string;
  is_active: boolean;
  link_url: string;
  created_at: Date;

  static from(payload: RecruitJobPayload): RecruitJob {
    const entity = new RecruitJob();

    entity.profile_id = payload.profileId;
    entity.category = payload.category;
    entity.title = payload.title;
    entity.contents = payload.contents;
    entity.company_name = payload.companyName;
    entity.is_active = payload.isActive;
    entity.link_url = payload.linkUrl;
    entity.company_image_url = payload.companyImageUrl;

    return entity;
  }
}
