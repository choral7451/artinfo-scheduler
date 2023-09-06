import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '@/artinfo/infrastructure/repository/supabase.repository';

@Injectable()
export class SystemRepository extends SupabaseRepository {
  async uploadImage(path: string, Image: File): Promise<string> {
    const { error: uploadError, data } = await this.supabase.storage.from('artinfo').upload(path, Image, {
      cacheControl: '36000',
    });

    if (uploadError || !data?.path) console.log(uploadError);
    return 'https://ycuajmirzlqpgzuonzca.supabase.co/storage/v1/object/public/artinfo/' + data!.path;
  }
}
