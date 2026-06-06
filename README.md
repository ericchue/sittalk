# SITTALK — 배포 가이드

같은 공간, 같은 감정 — 한 문장씩 이어가는 릴레이 스토리 플랫폼

---

## 1단계 — Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 회원가입 → 새 프로젝트 생성
2. 프로젝트 이름: `sittalk` (자유)
3. 생성 후 **Project Settings → API** 에서 복사:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

## 2단계 — 환경변수 설정

```bash
cp .env.example .env
# .env 파일을 열어 Supabase URL과 키를 입력
```

## 3단계 — DB 마이그레이션 실행

Supabase Dashboard → **SQL Editor** 에서 아래 두 파일을 순서대로 실행:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_triggers.sql`

또는 Supabase CLI 사용 시:

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-id>
supabase db push
```

## 4단계 — 의존성 설치 & 개발 서버

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 5단계 — Edge Function 배포 (AI 첫 문장 기능)

AI 첫 문장 생성 기능을 사용하려면 Lovable AI Gateway 키 필요.

키가 없으면 첫 문장 생성이 실패하더라도 기본 문장으로 fallback 처리됩니다.

```bash
supabase functions deploy generate-story-starter
supabase secrets set LOVABLE_AI_KEY=your-key-here
```

## 6단계 — 프로덕션 빌드 & 배포

**Vercel (추천):**
```bash
npm install -g vercel
npm run build
vercel --prod
```

환경변수를 Vercel 대시보드에서도 설정해주세요:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Netlify:**
```bash
npm run build
# dist 폴더를 Netlify에 드래그앤드롭
```

`netlify.toml` 파일 추가 필요:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 앱 구조

```
QR 스캔 → /enter?loc=장소명
    ↓ 로그인
/home → /emotions → /story-list
    ├─ 기존 스토리 → /story/:id → /write/:id → /result/:id
    └─ 새 스토리 시작 → AI 첫 문장 → /write/:id

하단 탭: /home | /ranking | /archive | /mypage
운영자: /qr-generator
```

## 주요 규칙

- 문장 최대 300자
- 5문장이 모이면 이야기 자동 완성 + 🎉 confetti
- 같은 사용자가 연속으로 이어쓰기 불가 (DB 트리거)
- entries는 수정/삭제 불가 (영구 기록)

## 다음에 할 일 (TODO)

- [ ] Realtime 구독 (`supabase.channel`)
- [ ] 운영자 권한 분리 (`user_roles` 테이블)
- [ ] 신고/차단 기능
- [ ] PWA 지원 (서비스워커)
- [ ] 푸시 알림
