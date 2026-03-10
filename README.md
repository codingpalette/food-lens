# 푸드렌즈 (CleanPick)

식품 뒷면의 원재료명을 카메라로 촬영하면 AI가 성분을 분석해 건강한 선택을 도와주는 모바일 앱입니다.

## 주요 기능

- **단일 분석** - 식품 원재료명을 촬영하면 AI가 성분별 평가(좋은 성분/주의 성분)와 10점 만점 점수를 제공
- **A vs B 대결** - 두 제품의 원재료명을 비교 분석하여 더 나은 제품을 추천
- **분석 기록** - 로그인 사용자는 분석 결과가 자동 저장되어 언제든 다시 확인 가능
- **비회원 지원** - 로그인 없이도 분석 기능 사용 가능

## 기술 스택

- **프레임워크** - React Native (Expo SDK 55, Managed Workflow)
- **언어** - TypeScript
- **네비게이션** - Expo Router (파일 기반 라우팅)
- **인증/DB/스토리지** - Supabase
- **AI 분석** - OpenAI API (gpt-4.1-mini Vision)
- **아이콘** - lucide-react-native

## 시작하기

### 설치 및 실행

```bash
npm install
npx expo start
```

### 환경변수 설정

`.env.example`을 참고하여 프로젝트 루트에 `.env` 파일을 생성합니다.

```bash
# AI 분석 (필수)
EXPO_PUBLIC_OPENAI_API_KEY=

# Supabase (선택 - 없으면 기록 저장만 비활성화)
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_KEY=
```

## 화면 구성

| 화면 | 경로 | 설명 |
|------|------|------|
| 홈 | `(tabs)/index` | 분석 모드 선택, 카메라 촬영 및 갤러리 불러오기 |
| 기록 | `(tabs)/history` | 분석 이력 목록 (로그인 사용자) |
| 내 정보 | `(tabs)/my` | 사용자 정보 및 설정 |
| 카메라 | `camera` | 원재료명 촬영 |
| 분석 결과 | `result` | AI 분석 결과 표시 (단일/비교) |
| 기록 상세 | `history/[id]` | 개별 분석 기록 상세 |
| 로그인 | `auth/sign-in` | 이메일/비밀번호 로그인 |
| 회원가입 | `auth/sign-up` | 이메일/비밀번호 회원가입 |

## 프로젝트 구조

```
src/
├── app/                    # Expo Router 페이지
│   ├── (tabs)/             # 하단 탭 (홈, 기록, 내 정보)
│   ├── auth/               # 로그인/회원가입
│   ├── history/            # 기록 상세
│   ├── camera.tsx          # 카메라 촬영
│   └── result.tsx          # 분석 결과
├── components/             # 공통 컴포넌트
├── constants/              # 테마, 색상
├── providers/              # Context Provider (인증)
├── services/               # 외부 서비스 연동
│   ├── aiApi.ts            # OpenAI Vision API
│   └── supabase/           # Supabase 클라이언트 및 서비스
└── types/                  # TypeScript 타입 정의
```

## Supabase 설정

Supabase는 선택사항입니다. 설정하지 않아도 AI 분석 기능은 정상 동작합니다.

설정이 필요한 경우 [`supabase/README.md`](supabase/README.md)를 참고하세요.

### 필요한 리소스

1. **Storage** - `analysis-images` 버킷 생성
2. **Database** - `analysis_history` 테이블 생성 (SQL은 `supabase/migrations/` 참고)
3. **RLS** - 로그인 사용자 본인 데이터 접근 정책 설정
4. **Auth** - 이메일/비밀번호 인증 활성화

## 배포

EAS Build를 사용합니다. 자세한 내용은 [`DEPLOY.md`](DEPLOY.md)를 참고하세요.

```bash
# Android 내부 테스트 APK
npx eas-cli build --platform android --profile preview

# Android 프로덕션 빌드 + 제출
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --profile production

# iOS 프로덕션 빌드 + 제출
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --profile production
```
