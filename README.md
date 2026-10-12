# 프렙 카페 운영 기록

현재 구현: EPIC 1(S01~S04), 기초 정보·판매 기록 관리·메뉴 수익성. EPIC 2·3은 미구현이다.

## 로컬 실행

Node.js 22.12 이상과 package.json에 고정된 pnpm을 사용한다.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run build
pnpm exec vite preview --host 127.0.0.1 --port 4173 --strictPort
```

`http://127.0.0.1:4173/`에서 사용한다. 초기 사용 기준을 한 항목씩 직접 선택한 뒤 기초 정보와 판매를 기록한다. 선택되지 않은 기준은 임의 기본값으로 적용하지 않는다. 새 사용 주소에는 기초 정보와 판매가 비어 있다. 제공된 매장 JSON·엑셀은 자동으로 가져오지 않는다.

기록은 IndexedDB에 저장한다. 주소·포트·브라우저 프로필이 달라지면 다른 저장소다. 같은 주소의 새로고침에는 유지되지만 브라우저 데이터 삭제나 기기 변경에는 유지되지 않는다. 서버 공유와 백업·복원은 현재 구현 범위에 없다.

## 검사와 배포

계산·저장 자동 검사는 `tests/`에 있다. 사용자 확인과 자동 검사 결과는 `docs/05_테스트결과.md`를 따른다. EPIC은 사용자 확인 전 완료로 표시하지 않는다.

GitHub 저장소는 [vudghkdhffla-cpu/kwangcheol](https://github.com/vudghkdhffla-cpu/kwangcheol)이며 코드·문서·시안을 main에 업로드했다. `.github/workflows/check.yml`에 자동 검사를 준비했고 Vercel 설정은 `vercel.json`에 있다. Vercel 외부 배포는 아직 수행하지 않았다. 운영 주소 변경은 브라우저 자료의 자동 이전을 의미하지 않는다. 실제 매장 자료·백업·비밀키를 GitHub나 정적 배포 파일에 포함하지 않는다.
