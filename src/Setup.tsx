import { useState } from 'react';
import { Check, ArrowRight, Database } from 'lucide-react';
import type { Policies } from './domain';

export function ready(p: Policies) { return p.storage === 'browser' && p.missingCost !== null && p.includeFee !== null && p.historicalCost !== null && p.entryRules === 'v1'; }
export default function Setup({ policies: p, save }: { policies: Policies; save: (patch: Partial<Policies>) => Promise<void> }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [alternative, setAlternative] = useState(false);
  const pick = async (patch: Partial<Policies>) => {
    if (busy) return;
    setBusy(true); setError('');
    try { await save({ ...patch, approvalNote: `화면에서 기준 선택 · ${new Date().toISOString()}` }); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };
  const step = p.storage === null ? 1 : p.missingCost === null ? 2 : p.includeFee === null ? 3 : p.historicalCost === null ? 4 : 5;
  if (ready(p)) return <div className="policy-summary"><Check size={17}/><span>선택한 기준: 이 브라우저 저장 · 원가 누락 {p.missingCost === 'allow' ? '판매 허용' : '저장 보류'} · 수수료 {p.includeFee ? '차감' : '별도 표시'} · 과거 원가 {p.historicalCost === 'snapshot' ? '보존' : '기초 정보 변경 시 재계산'}</span></div>;
  return <section className="panel setup-panel" aria-label="처음 사용 기준 확인"><div className="panel-heading"><div><span className="eyebrow">시작하기 전에 · 한 항목씩 확인</span><h2>{step === 1 ? '기록을 어디에 저장할까요?' : step === 2 ? '원가가 없는 메뉴도 판매를 기록할까요?' : step === 3 ? '메뉴 이익에서 결제수수료를 뺄까요?' : step === 4 ? '기초 정보를 고치면 과거 원가도 바꿀까요?' : '판매 입력·계산 기준을 확인해 주세요.'}</h2></div><span className="tag">{step} / 5</span></div><div className="setup-body">
    {error && <p role="alert" className="message error">{error}</p>}
    {step === 1 && <><p>기록을 이 컴퓨터의 이 브라우저에 보관하는 방식을 추천합니다. 새로고침 후에도 유지되지만 다른 기기·브라우저와 자동 공유되지 않습니다. 브라우저 데이터 삭제 시 기록이 사라질 수 있습니다.</p><p>이번 EPIC은 로컬 테스트입니다. 서버 저장은 추가 설계가 필요하며, 백업·복원은 EPIC 3에서 제공합니다.</p><div className="setup-choices"><button className="primary" disabled={busy} onClick={() => pick({storage:'browser'})}><Database size={17}/>이 브라우저에 저장하기</button><button disabled={busy} onClick={() => setAlternative(true)}>서버 저장이 필요해요</button></div>{alternative && <p className="message error" role="status">서버 저장은 아직 구현된 기능이 아닙니다. 이 선택으로 기록을 저장하지 않았습니다. 서버 저장을 원하시면 채팅으로 알려 주세요.</p>}</>}
    {step === 2 && <><p>예: 새 메뉴를 5잔 팔았지만 아직 레시피가 없는 경우입니다. 판매를 먼저 기록하면 매출을 놓치지 않고, 이익은 ‘계산 미완료’로 구분할 수 있습니다.</p><div className="setup-choices"><button className="primary" disabled={busy} onClick={() => pick({missingCost:'allow'})}>판매 저장, 이익은 계산 미완료 (추천)</button><button disabled={busy} onClick={() => pick({missingCost:'block'})}>원가를 준비한 뒤 판매 저장</button></div></>}
    {step === 3 && <><p>예: 매출 4,000원, 재료비 460원, 결제수수료 60원이면 수수료 차감 시 메뉴 이익은 3,480원입니다. 차감하지 않으면 3,540원이며 수수료는 별도로 확인합니다.</p><div className="setup-choices"><button className="primary" disabled={busy} onClick={() => pick({includeFee:true})}>수수료도 차감 (추천)</button><button disabled={busy} onClick={() => pick({includeFee:false})}>재료·포장 원가만 차감</button></div></>}
    {step === 4 && <><p>예: 원두 가격이나 레시피를 수정한 경우입니다. ‘보존’은 이미 기록한 판매 당시 원가를 유지합니다. ‘재계산’은 현재 등록된 레시피와 판매일에 적용되는 가격으로 과거 원가와 이익도 갱신합니다.</p><p>선택한 기준은 기록과 함께 보관합니다. 실제 입고·폐기·실사에 따른 재고 관리는 다음 EPIC에서 연결합니다.</p><div className="setup-choices"><button className="primary" disabled={busy} onClick={() => pick({historicalCost:'snapshot'})}>판매 당시 원가 보존 (추천)</button><button disabled={busy} onClick={() => pick({historicalCost:'recalculate'})}>기초 정보 변경 시 과거 원가 재계산</button></div></>}
    {step === 5 && <><p>날짜·메뉴·채널별 합계를 입력합니다. 순매출은 ‘수량 × 판매단가 − 할인총액’, 개당 재료비는 ‘구매가격 ÷ 구매용량 × 사용량’의 합입니다. 가격은 판매일에 적용되는 이력을 사용합니다.</p><ul><li>금액은 부가세 제외, 할인·수수료는 해당 판매 합계의 총액입니다.</li><li>판매수량은 1 이상의 정수, 금액은 0 이상입니다. 미래 판매는 입력하지 않습니다.</li><li>할인은 할인 전 판매액, 수수료는 순매출을 초과하지 않게 확인합니다.</li><li>같은 날짜·메뉴·채널을 다시 입력하면 별도 기록입니다. 오류 수정은 ‘수정’을 사용하세요.</li><li>기간은 선택한 시작일부터 종료일까지 포함합니다. 메뉴 검색은 목록만 좁히고 상단 합계는 기간 전체 기록 기준입니다.</li><li>메뉴 이익률은 메뉴 이익 ÷ 순매출입니다. 전체 비율은 판매 규모를 반영합니다. 매출 0은 비율 산출 불가로 구분합니다.</li><li>계산값을 보존하고 화면의 금액은 원 단위, 비율은 소수 첫째 자리로 표시합니다.</li></ul><div className="setup-choices"><button className="primary" disabled={busy} onClick={() => pick({entryRules:'v1'})}>이 입력·계산 기준으로 사용하기<ArrowRight size={17}/></button></div><p className="muted">다른 기준이 필요하면 지금 선택하지 않고 채팅으로 알려 주세요. 선택 전에는 판매를 저장하지 않습니다.</p></>}
    {busy && <p role="status">선택한 기준을 저장하고 있습니다…</p>}
  </div></section>;
}
