# 배포 가이드

이 문서는 현재 프로젝트 설정을 기준으로 Android와 iOS 배포 절차를 정리한 문서다.

현재 앱 식별자:

- 앱 이름: `푸드렌즈`
- Android package: `com.anonymous.foodlens`
- iOS bundle identifier: `com.anonymous.food-lens`
- EAS project ID: `cba955db-1c87-498f-8142-37ec51498dff`

현재 [`eas.json`](/Users/lee/Desktop/expo/food-lens/eas.json) 기준:

- `development`: 개발용 APK
- `preview`: 내부 테스트용 APK
- `production`: 배포용 AAB
- `submit.production.android.track`: `internal`

## 1. 사전 준비

### 필수 설치

전역 설치:

```bash
npm install -g eas-cli
```

전역 설치를 원하지 않으면 `npx eas-cli`를 사용해도 된다.

### 로그인

```bash
eas login
```

또는:

```bash
npx eas-cli login
```

### 프로젝트 연결 확인

```bash
eas whoami
eas project:info
```

## 2. Android 배포

### 내부 테스트용 APK 빌드

```bash
eas build --platform android --profile preview
```

또는:

```bash
npx eas-cli build --platform android --profile preview
```

이 빌드는 설치용 APK를 만든다. QA나 직접 테스트할 때 적합하다.

### Play Store 제출용 AAB 빌드

```bash
eas build --platform android --profile production
```

또는:

```bash
npx eas-cli build --platform android --profile production
```

이 빌드는 Google Play 제출용 `AAB`를 만든다.

### Google Play 내부 테스트 트랙 제출

현재 [`eas.json`](/Users/lee/Desktop/expo/food-lens/eas.json) 은 Android 제출 기본 트랙이 `internal`로 설정돼 있다.

```bash
eas submit --platform android --profile production
```

또는:

```bash
npx eas-cli submit --platform android --profile production
```

### 한 번에 빌드 + 제출

```bash
eas build --platform android --profile production --auto-submit
```

첫 Play Console 등록 상태에 따라 초기에 수동 작업이 한 번 필요할 수 있다.

## 3. iOS 배포

### iOS 배포 전 준비

다음이 먼저 준비돼 있어야 한다.

- Apple Developer Program 가입
- App Store Connect 앱 생성
- iOS bundle identifier 확인
- 필요한 인증서/프로비저닝 권한 연결

### App Store Connect 제출용 iOS 빌드

```bash
eas build --platform ios --profile production
```

또는:

```bash
npx eas-cli build --platform ios --profile production
```

이 빌드는 App Store Connect 또는 TestFlight 업로드용 아카이브를 만든다.

### iOS 제출

```bash
eas submit --platform ios --profile production
```

또는:

```bash
npx eas-cli submit --platform ios --profile production
```

주의:

- 현재 [`eas.json`](/Users/lee/Desktop/expo/food-lens/eas.json) 에는 Android 제출 설정만 있다.
- iOS는 첫 제출 시 `ascAppId` 등 추가 입력이 필요할 수 있다.
- 업로드 후 App Store Connect에서 TestFlight 확인과 심사 제출을 별도로 진행해야 한다.

### 한 번에 빌드 + 제출

```bash
eas build --platform ios --profile production --auto-submit
```

## 4. 추천 실행 순서

### Android

1. `eas login`
2. `eas build --platform android --profile preview`
3. 내부 테스트 확인
4. `eas build --platform android --profile production`
5. `eas submit --platform android --profile production`

### iOS

1. `eas login`
2. `eas build --platform ios --profile production`
3. `eas submit --platform ios --profile production`
4. App Store Connect에서 TestFlight 확인
5. App Store Connect에서 심사 제출

## 5. 자주 쓰는 확인 명령

```bash
eas whoami
eas build:list
eas submission:list
```

특정 플랫폼만 보고 싶으면:

```bash
eas build:list --platform android
eas build:list --platform ios
```

## 6. 자주 만나는 문제

### `eas: command not found`

```bash
npm install -g eas-cli
```

또는:

```bash
npx eas-cli build --platform android --profile production
```

### Android는 되는데 iOS 제출이 막힘

보통 아래 중 하나다.

- Apple Developer 계정 미연결
- App Store Connect 앱 미생성
- `ascAppId` 미설정
- 인증서 또는 권한 문제

### Android는 로컬 실행되는데 스토어 제출이 안 됨

보통 아래를 확인한다.

- Play Console 앱 생성 여부
- 패키지명 일치 여부
- 서명 설정
- 내부 테스트 트랙 권한

## 7. 이 프로젝트에서 바로 쓰는 명령

Android 내부 테스트:

```bash
npx eas-cli build --platform android --profile preview
```

Android 배포:

```bash
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --profile production
```

iOS 배포:

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --profile production
```
