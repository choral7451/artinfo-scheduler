import { RECRUIT_JOBS_CATEGORY } from '@/artinfo/interface/type/type';

export type RecruitJobPayload = {
  profile_id: string;
  category: RECRUIT_JOBS_CATEGORY;
  title: string;
  contents: string;
  company_name: string;
  company_image_url?: string;
};
//
// export class RecruitJob {
//   id: string;
//   profileId: string;
//   category: RECRUIT_JOBS_CATEGORY;
//   title: string;
//   contents: string;
//   companyName: string;
//   companyImageUrl?: string;
//
// static from(payload: RecruitJobPayload): RecruitJob {
//   const entity = new RecruitJob();
//
//   entity.profileId = payload.profileId;
//   entity.category = payload.category;
//   entity.title = payload.title;
//   entity.contents = payload.contents;
//   entity.companyName = payload.companyName;
//   entity.companyImageUrl = payload.companyImageUrl;
//
//   return entity;
// }
// }
