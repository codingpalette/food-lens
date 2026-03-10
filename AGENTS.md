# Project Instructions

## Supabase

- Supabase 관련 로컬 문서와 SQL은 반드시 `supabase/` 디렉토리 아래에 둔다.
- 에이전트는 `supabase/` 디렉토리의 문서를 Supabase 원격 설정의 기준 문서로 해석한다.
- 사용자가 Supabase Dashboard 또는 SQL Editor에서 직접 반영한 내용도 `supabase/` 아래 문서에 적혀 있어야 확정된 상태로 본다.
- SQL 마이그레이션은 `supabase/migrations/*.sql`에 둔다.
- 버킷, RLS, 수동 설정 메모는 `supabase/*.md`에 둔다.
- 앱 코드가 요구하는 Supabase 리소스가 바뀌면 `supabase/` 문서도 함께 갱신한다.
