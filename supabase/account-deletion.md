# Account Deletion

현재 앱의 회원탈퇴는 Supabase Edge Function `delete-account`를 통해 처리한다.

앱 동작:

- `내 정보` 화면에서 `회원탈퇴` 버튼 노출
- 사용자가 확인 후 탈퇴 실행
- 앱이 `delete-account` Edge Function 호출
- 함수가 분석 기록, 업로드 이미지, Auth 계정을 순서대로 삭제

## 함수 위치

- `supabase/functions/delete-account/index.ts`

## 함수가 삭제하는 리소스

- `public.analysis_history` 에서 현재 사용자 `user_id`의 모든 행
- `analysis-images` 버킷에서 현재 사용자 기록에 연결된 `image_path`
- `auth.users` 의 현재 사용자 계정

## 필요한 Supabase secrets

Edge Function 에서 아래 값이 필요하다.

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 배포 예시

```bash
supabase functions deploy delete-account --no-verify-jwt
```

필요하면 secrets 설정:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

## 앱 코드 기대 사항

- 앱은 `supabase.functions.invoke('delete-account')` 를 호출한다.
- 함수가 `{ "success": true }` 를 반환하면 앱은 로컬 세션을 정리한다.
- 함수가 배포되지 않았거나 secret 이 없으면 회원탈퇴는 실패한다.

## 왜 `--no-verify-jwt`가 필요한가

- 현재 앱은 Supabase `publishable key` 를 사용한다.
- Supabase 공식 문서 기준으로 Edge Functions의 게이트웨이 JWT 검증은 `anon` / `service_role` JWT 기반 키와의 호환성이 중심이고, `publishable key` 사용 시에는 `--no-verify-jwt` 배포가 필요할 수 있다.
- 이 함수는 게이트웨이에서 검증하지 않는 대신, 함수 내부에서 `Authorization` 헤더를 사용해 `userClient.auth.getUser()` 로 현재 사용자를 다시 검증한다.

## 주의

- `auth.users` 삭제는 클라이언트 공개 키만으로 직접 처리하지 않는다.
- 서비스 롤 권한은 Edge Function 내부에서만 사용한다.
- `analysis_history.user_id` 는 이미 `references auth.users(id) on delete cascade` 로 잡혀 있지만, 스토리지 파일은 자동 삭제되지 않으므로 함수에서 직접 지운다.
