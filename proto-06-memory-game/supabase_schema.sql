-- rankings 테이블 생성
create table if not exists rankings (
  id uuid default gen_random_uuid() primary key,
  nickname text not null,
  stage integer not null,
  achieved_at timestamptz default now()
);

-- 조회 성능을 위한 인덱스 (높은 단계 + 선착순)
create index if not exists idx_rankings_stage_date
  on rankings(stage desc, achieved_at asc);

-- 오늘 랭킹 조회용 인덱스
create index if not exists idx_rankings_achieved_at
  on rankings(achieved_at desc);

-- 닉네임별 기록 조회용 인덱스
create index if not exists idx_rankings_nickname
  on rankings(nickname);

-- Row Level Security (공개 읽기 / 익명 쓰기 허용)
alter table rankings enable row level security;

create policy "Anyone can read rankings"
  on rankings for select using (true);

create policy "Anyone can insert rankings"
  on rankings for insert with check (true);
