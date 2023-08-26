export const RECRUIT_JOBS_CATEGORY = {
  RELIGION: 'RELIGION',
  LECTURER: 'LECTURER',
  ETC: 'ETC',
  ART_ORGANIZATION: 'ART_ORGANIZATION',
} as const;
export type RECRUIT_JOBS_CATEGORY = (typeof RECRUIT_JOBS_CATEGORY)[keyof typeof RECRUIT_JOBS_CATEGORY];

export const LOG_LEVEL = {
  LOG: 'LOG',
  WARN: 'WARN',
  ERROR: 'ERROR',
} as const;
export type LOG_LEVEL = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];
