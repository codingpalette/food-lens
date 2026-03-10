
# 프로젝트 요약: 클린픽 (food-lens) - AI 식품 성분 분석기

## 1. 앱 개요
* **목적:** 스마트폰 카메라로 식품 뒷면의 '원재료명'을 촬영하면, AI(Vision)가 텍스트를 추출하고 분석하여 사용자에게 건강한 선택을 돕는 React Native (Expo) 기반 모바일 앱.
* **주요 타겟:** 다이어터, 아이 부모님, 건강에 관심이 많은 현대인.

## 2. 기술 스택
* **프레임워크:** React Native (Expo Managed Workflow)
* **언어:** TypeScript (Strict 모드 권장)
* **네비게이션:** React Navigation (Native Stack, Bottom Tabs)
* **상태 관리:** Zustand (필요시)
* **주요 패키지:** `expo-camera`, `expo-image-picker`, `lucide-react-native` (아이콘)
* **AI API 연동:** OpenAI API Vision 모델 사용

## 3. UI/UX 디자인 가이드 (테마: 프레시 & 트러스트)
* **메인 컬러:** 에메랄드 그린 (`#10B981`) - 건강, 통과, 긍정의 의미
* **경고 컬러:** 소프트 레드 (`#EF4444`) - 주의가 필요한 성분 강조
* **배경 / 텍스트:** 깔끔한 화이트 (`#FFFFFF`) 배경 / 차콜 그레이 (`#374151`) 텍스트
* **UI 컴포넌트 스타일:** * 둥근 모서리 (border-radius: 12px ~ 16px)
  * 부드러운 그림자 효과를 넣은 Card 형태의 UI
  * 직관적이고 큼직한 버튼

## 4. 핵심 기능 및 화면 구성 (Screens)

### A. 홈 화면 (HomeScreen)
* 앱의 메인 화면. 카메라 촬영 버튼 또는 갤러리에서 사진 불러오기 버튼 배치.
* "단일 제품 분석" 모드와 "A vs B 대결" 모드 선택 가능.

### B. 카메라 촬영 화면 (CameraScreen)
* `expo-camera`를 활용한 바코드/텍스트 촬영 화면.
* 가이드라인(원재료명 텍스트를 이 박스 안에 맞춰주세요) 오버레이 제공.

### C. 분석 결과 화면 (ResultScreen)
* AI가 반환한 결과를 보기 쉽게 렌더링.
* **단일 분석:** 전체 평점, 좋은 성분(그린), 주의 성분(레드) 리스트 및 한 줄 평.
* **비교 분석(배틀):** 화면을 반으로 나누어 A와 B의 스펙(당류, 나트륨, 첨가물 등)을 비교하고, 최종 승자 제품을 크게 하이라이트.

## 5. Claude Code 개발 진행 단계 (로드맵)
Claude, 아래 단계별로 하나씩 구현해 줘. 한 단계를 마칠 때마다 나에게 확인을 받고 다음으로 넘어가자.

* **Step 1:** 폴더 구조 셋업 (`src/screens`, `src/components`, `src/services` 등) 및 React Navigation 초기 설정. 홈 화면(HomeScreen) UI 기본 뼈대 만들기.
* **Step 2:** `expo-camera`와 `expo-image-picker`를 설치하고 권한 설정하기. 카메라 화면(CameraScreen) 구현하여 사진 찍기 및 갤러리 불러오기 기능 완성하기.
* **Step 3:** 사진을 찍으면 AI API에 전송할 수 있도록 서비스 로직(`src/services/aiApi.ts`) 구성하기. (우선은 실제 API 대신 Mock Data를 반환하도록 임시 구현할 것).
* **Step 4:** Mock Data를 받아서 분석 결과 화면(ResultScreen)의 UI를 예쁘게(Card 스타일, 에메랄드 그린 컬러 적용) 구현하기. 단일 분석과 비교 분석 UI 모두 만들기.
* **Step 5:** Mock Data를 걷어내고 실제 AI Vision API를 연결하여 테스트 및 에러 핸들링(로딩 스피너, 네트워크 에러 등) 고도화하기.
