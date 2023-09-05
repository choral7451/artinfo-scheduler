import { CONCERT_CATEGORY } from '@/artinfo/interface/type/type';

export type ConcertPayload = {
  title: string;
  contents: string;
  posterUrl: string;
  location: string;
  performanceTime: Date;
  profileId: string;
  category: CONCERT_CATEGORY;
};

export class Concert {
  id: number;
  title: string;
  contents: string;
  poster_url: string;
  count_of_views: number;
  location: string;
  performance_time: Date;
  created_at: Date;
  profile_id: string;
  category: CONCERT_CATEGORY;

  static from(payload: ConcertPayload): Concert {
    const entity = new Concert();

    entity.title = payload.title;
    entity.contents = payload.contents;
    entity.poster_url = payload.posterUrl;
    entity.location = payload.location;
    entity.performance_time = payload.performanceTime;
    entity.profile_id = payload.profileId;
    entity.category = payload.category;

    return entity;
  }
}
