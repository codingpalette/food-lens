# 배포 가이드

이 문서는 현재 프로젝트 설정을 기준으로 Android와 iOS 배포 절차를 정리한 문서다.

## 앱 식별자

| 항목 | 값 |
|------|-----|
| 앱 이름 | 푸드렌즈 |
| Android package | `com.anonymous.foodlens` |
| iOS bundle identifier | `com.anonymous.food-lens` |
| EAS project ID | `cba955db-1c87-498f-8142-37ec51498dff` |

## EAS 빌드 프로필 (`eas.json`)

| 프로필 | 용도 | 출력 |
|--------|------|------|
| `development` | 개발용 | APK (dev client) |
| `preview` | 내부 테스트용 | APK |
| `production` | 배포용 | AAB (Android) / Archive (iOS) |

제출 설정: `submit.production.android.track` = `internal`

## 1. 사전 준비

### EAS CLI 설치

```bash
npm install -g eas-cli
```

전역 설치를 원하지 않으면 `npx eas-cli`를 사용해도 된다.

### 로그인 및 프로젝트 확인

```bash
eas login
eas whoami
eas project:info
```

## 2. Android 배포

### 내부 테스트용 APK

```bash
npx eas-cli build --platform android --profile preview
```

QA나 직접 테스트할 때 적합하다.

### Play Store 제출용 AAB

```bash
npx eas-cli build --platform android --profile production
```

### Google Play 내부 테스트 트랙 제출

```bash
npx eas-cli submit --platform android --profile production
```

### 빌드 + 제출 한 번에

```bash
npx eas-cli build --platform android --profile production --auto-submit
```

첫 Play Console 등록 상태에 따라 초기에 수동 작업이 한 번 필요할 수 있다.

## 3. iOS 배포

### 사전 준비

- Apple Developer Program 가입
- App Store Connect 앱 생성
- iOS bundle identifier 확인
- 인증서/프로비저닝 권한 연결

### App Store Connect 제출용 빌드

```bash
npx eas-cli build --platform ios --profile production
```

### App Store 제출

```bash
npx eas-cli submit --platform ios --profile production
```

### 빌드 + 제출 한 번에

```bash
npx eas-cli build --platform ios --profile production --auto-submit
```

> 현재 `eas.json`에는 Android 제출 설정만 있다.
> iOS는 첫 제출 시 `ascAppId` 등 추가 입력이 필요할 수 있다.
> 업로드 후 App Store Connect에서 TestFlight 확인과 심사 제출을 별도로 진행해야 한다.

## 4. 업데이트 배포 (버전 관리)

업데이트 배포 시 앱 버전과 빌드 번호를 함께 올려야 한다. `app.json`에서 관리한다.

### 버전 필드

```json
{
  "expo": {
    "version": "1.0.1",
    "ios": {
      "buildNumber": "2"
    },
    "android": {
      "versionCode": 2
    }
  }
}
```

| 필드 | 설명 |
|------|------|
| `version` | 사용자에게 보이는 앱 버전 |
| `android.versionCode` | Play Store 업로드용 내부 버전. 업데이트마다 반드시 증가 |
| `ios.buildNumber` | App Store 업로드용 내부 버전. 업데이트마다 반드시 증가 |

### 버전 올리기 규칙

| 변경 유형 | 버전 예시 |
|-----------|-----------|
| 작은 수정 (버그 픽스) | 1.0.0 → 1.0.1 |
| 기능 추가 | 1.0.0 → 1.1.0 |
| 큰 변경 (메이저) | 1.0.0 → 2.0.0 |

`versionCode`와 `buildNumber`는 무조건 1, 2, 3 순서로 계속 올린다.

### 업데이트 배포 명령

Android:

```bash
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --profile production
```

iOS:

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --profile production
```

### 주의사항

- `npm run android:release`는 로컬 설치용이다. 스토어 업데이트 업로드는 EAS Build를 사용한다.
- Android는 `versionCode`를 안 올리면 같은 앱 업데이트로 업로드가 거절된다.
- iOS는 `buildNumber`를 안 올리면 새 빌드 업로드가 안 된다.

## 5. 추천 실행 순서

### Android

1. `eas login`
2. `npx eas-cli build --platform android --profile preview` (내부 테스트)
3. 테스트 확인
4. `app.json`에서 `version`, `versionCode` 업데이트
5. `npx eas-cli build --platform android --profile production`
6. `npx eas-cli submit --platform android --profile production`

### iOS

1. `eas login`
2. `app.json`에서 `version`, `buildNumber` 업데이트
3. `npx eas-cli build --platform ios --profile production`
4. `npx eas-cli submit --platform ios --profile production`
5. App Store Connect에서 TestFlight 확인
6. App Store Connect에서 심사 제출

## 6. 자주 쓰는 확인 명령

```bash
eas whoami
eas build:list
eas build:list --platform android
eas build:list --platform ios
eas submission:list
```

## 7. 자주 만나는 문제

### `eas: command not found`

```bash
npm install -g eas-cli
```

또는 `npx eas-cli`를 사용한다.

### Android 스토어 제출이 안 됨

- Play Console 앱 생성 여부 확인
- 패키지명 일치 여부 확인
- 서명 설정 확인
- 내부 테스트 트랙 권한 확인
- `versionCode`가 이전 빌드보다 높은지 확인

### iOS 제출이 막힘

- Apple Developer 계정 미연결
- App Store Connect 앱 미생성
- `ascAppId` 미설정
- 인증서 또는 권한 문제
- `buildNumber`가 이전 빌드보다 높은지 확인
