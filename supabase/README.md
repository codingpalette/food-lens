# Supabase Workspace Notes

이 디렉토리는 이 프로젝트의 Supabase 원격 설정을 문서화하는 용도다.

## 운영 원칙

- 실제 Supabase 변경은 사용자가 직접 Supabase Dashboard 또는 SQL Editor에서 수행한다.
- 이 디렉토리 안의 문서는 원격 상태를 설명하는 로컬 기준 문서다.
- 앞으로 스키마, 정책, 버킷, 함수 관련 변경이 생기면 먼저 이 디렉토리의 문서를 보고 판단한다.
- 원격에서 이미 반영된 변경이라도 이 디렉토리에 적혀 있지 않으면 에이전트는 보장된 상태로 간주하지 않는다.
- 앱 코드가 Supabase 자원을 새로 요구하면, 그 기대 사항을 이 디렉토리 문서에도 함께 반영한다.

## 디렉토리 구조

- `supabase/migrations/*.sql`: 실제로 적용할 SQL 초안
- `supabase/*.md`: 버킷, 정책, 수동 작업, 운영 메모

현재 준비된 마이그레이션:

- `supabase/migrations/202603090001_create_analysis_history.sql`
- `supabase/migrations/202603090002_analysis_history_policies.sql`
- `supabase/migrations/202603090003_storage_policies.sql`

현재 준비된 함수/문서:

- `supabase/functions/delete-account/index.ts`
- `supabase/account-deletion.md`

## 현재 앱이 기대하는 리소스

### Environment variables

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_KEY`

### Storage

- 버킷 이름: `analysis-images`
- 용도: 분석에 사용한 원본 이미지 업로드
- 현재 앱 경로 규칙: `{user_id}/{mode}-{timestamp}.{ext}`

### Database

- 테이블 이름: `public.analysis_history`
- 현재 앱이 insert 하는 컬럼:
  - `user_id`
  - `device_id`
  - `image_path`
  - `mode`
  - `result`

### Auth

- 앱은 비회원 상태로도 분석 가능하다.
- 로그인 기능은 Supabase Auth 이메일/비밀번호 기준이다.
- 로그인 사용자만 서버에 분석 기록을 저장한다.
- 기록 조회는 현재 로그인한 `auth.users.id` 기준으로 `analysis_history.user_id`를 조회한다.
- 회원탈퇴는 Edge Function `delete-account`를 통해 처리한다.

권장 예시:

```sql
create table if not exists public.analysis_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  image_path text,
  mode text not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);
```

## 필요한 권한 상태

현재 앱은 비회원 분석 + 로그인 사용자 저장 구조다. 그래서 아래 권한이 필요하다.

- 비회원은 분석만 가능하고 서버 저장은 하지 않는다.
- 로그인 사용자는 자신의 `user_id`로 `analysis_history`에 `insert/select`
- 로그인 사용자는 `analysis-images` 버킷에 업로드 권한
- 가능하면 RLS는 `auth.uid() = user_id` 기준으로 제한한다

정책을 어떻게 작성했는지는 이 디렉토리 안의 문서나 migration SQL 파일에 기록한다.

## 문서 규칙

- SQL 초안은 `supabase/migrations/` 아래의 `.sql` 파일로 남긴다.
- 버킷 생성, RLS 정책, 수동 콘솔 작업은 이 디렉토리의 `.md` 파일에 기록한다.
- 파일 이름은 목적이 드러나게 쓴다.
  - 예시: `migrations/202603090001_create_analysis_history.sql`, `storage.md`

## 에이전트용 해석 규칙

- 이 디렉토리에 있는 최신 문서를 Supabase 구성의 소스 오브 트루스로 본다.
- 앱 코드와 문서가 충돌하면, 먼저 문서 기준으로 왜 차이가 났는지 확인한다.
- 원격 상태를 직접 조회하지 못한 경우, 이 디렉토리에 적힌 내용을 기준으로 다음 작업을 제안한다.
