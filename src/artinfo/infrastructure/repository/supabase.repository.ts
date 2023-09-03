import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseRepository {
  protected readonly supabase: SupabaseClient | undefined;

  constructor() {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
        auth: {
          persistSession: false,
        },
      });
    }
  }
}
