# FSD (Feature-Sliced Design) 아키텍처

이 프로젝트는 FSD 아키텍처를 따릅니다.

## 레이어 구조

```
src/
├── app/          # 애플리케이션 초기화 레이어
│   ├── providers/  # 프로바이더 (라우터, 상태 관리 등)
│   ├── styles/     # 전역 스타일
│   └── index.tsx   # 앱 진입점
│
├── pages/        # 페이지 레이어
│   └── home/       # 홈 페이지
│       ├── ui/      # UI 컴포넌트
│       └── index.ts # Public API
│
├── widgets/      # 복합 UI 블록 레이어
│   └── (Header, Footer, Sidebar 등)
│
├── features/     # 사용자 기능 레이어
│   └── (AddToCart, UserProfile, Search 등)
│
├── entities/     # 비즈니스 엔티티 레이어
│   └── (User, Product, Order 등)
│
└── shared/       # 재사용 가능한 코드 레이어
    ├── ui/        # 공통 UI 컴포넌트
    ├── lib/       # 유틸리티 함수
    ├── config/    # 설정
    └── assets/    # 정적 자원
```

## 레이어 규칙

### 의존성 규칙

- 각 레이어는 **하위 레이어만** 의존할 수 있습니다
- 의존성 방향: `app` → `pages` → `widgets` → `features` → `entities` → `shared`
- 같은 레이어 내에서는 서로 의존할 수 없습니다

### 레이어별 역할

#### `app/`

- 애플리케이션 초기화
- 전역 프로바이더 설정
- 라우팅 설정

#### `pages/`

- 라우트별 페이지 컴포넌트
- 페이지 레벨의 레이아웃

#### `widgets/`

- 여러 features/entities를 조합한 복합 UI 블록
- 예: Header, Footer, ProductCard

#### `features/`

- 사용자 기능 단위
- 예: AddToCart, UserProfile, Search

#### `entities/`

- 비즈니스 엔티티
- 예: User, Product, Order
- 각 엔티티는 `ui/`, `model/`, `api/` 세그먼트를 가질 수 있음

#### `shared/`

- 재사용 가능한 코드
- UI 컴포넌트, 유틸리티, 설정 등

## 세그먼트 구조

각 레이어의 슬라이스는 다음과 같은 세그먼트를 가질 수 있습니다:

- `ui/` - UI 컴포넌트
- `model/` - 비즈니스 로직, 상태 관리
- `api/` - API 호출
- `lib/` - 유틸리티 함수
- `config/` - 설정

## 경로 별칭

`@/` 별칭이 `src/` 디렉토리를 가리킵니다.

```typescript
import { Button } from "@/shared/ui";
import { HomePage } from "@/pages/home";
```

## 참고 자료

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [FSD Best Practices](https://feature-sliced.design/docs/get-started/overview)
