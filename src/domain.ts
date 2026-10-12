import Decimal from 'decimal.js';
import { z } from 'zod';

Decimal.set({ precision: 40 });
export type Unit = 'g' | 'ml' | '개';
export type Channel = '매장' | '포장';
export interface Price { date: string; amount: string; capacity: string }
export interface Material { id: string; name: string; unit: Unit; packaging: boolean; prices: Price[]; openingDate: string; opening: string }
export interface Ingredient { materialId: string; quantity: string; unit: Unit; channel: '전체' | Channel }
export interface Menu { id: string; name: string; category: string; price: string; recipe: Ingredient[]; version: number }
export interface CostLine { materialId: string; name: string; unit: Unit; quantity: string; unitCost: string; cost: string; packaging: boolean }
export interface CostResult { food: string | null; packaging: string | null; lines: CostLine[]; reasons: string[] }
export interface Sale { id: string; date: string; menuId: string; channel: Channel; quantity: string; unitPrice: string; discount: string; fee: string; net: string; recipeVersion: number; snapshot: CostResult }
export interface Policies { storage: 'browser' | null; missingCost: 'allow' | 'block' | null; includeFee: boolean | null; historicalCost: 'snapshot' | 'recalculate' | null; entryRules?: 'v1' | null; approvalNote: string }
export interface State { schemaVersion: 1; revision: number; materials: Material[]; menus: Menu[]; sales: Sale[]; policies: Policies }
export const emptyState = (): State => ({ schemaVersion: 1, revision: 0, materials: [], menus: [], sales: [], policies: { storage: null, missingCost: null, includeFee: null, historicalCost: null, approvalNote: '' } });
export const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value && value.slice(0, 4) !== '0000';
}
const numeric = z.string().regex(/^\d+(\.\d+)?$/, '0 이상의 숫자를 입력해 주세요.').refine(s => s.length <= 30 && new Decimal(s).lte('1000000000000'), '숫자가 너무 큽니다.');
const positive = numeric.refine(s => new Decimal(s).gt(0), '0보다 큰 수를 입력해 주세요.');
const date = z.string().refine(validDate, '올바른 날짜를 입력해 주세요.');
const name = z.string().trim().min(1, '이름을 입력해 주세요.').max(80, '이름은 80자 이내로 입력해 주세요.');
const priceSchema = z.object({ date, amount: numeric, capacity: positive });
const materialSchema = z.object({ id: z.string(), name, unit: z.enum(['g', 'ml', '개']), packaging: z.boolean(), prices: z.array(priceSchema).min(1, '가격 정보가 필요합니다.'), openingDate: date, opening: numeric });
const ingredientSchema = z.object({ materialId: z.string().min(1, '재료를 선택해 주세요.'), quantity: positive, unit: z.enum(['g', 'ml', '개']), channel: z.enum(['전체', '매장', '포장']) });
const menuSchema = z.object({ id: z.string(), name, category: name, price: numeric, recipe: z.array(ingredientSchema), version: z.number().int().positive() });
const saleInputSchema = z.object({ date, menuId: z.string().min(1, '메뉴를 선택해 주세요.'), channel: z.enum(['매장', '포장']), quantity: positive.refine(s => new Decimal(s).isInteger(), '판매 수량은 정수로 입력해 주세요.'), unitPrice: numeric, discount: numeric, fee: numeric });
export type SaleInput = z.infer<typeof saleInputSchema>;
function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new Error(result.error.issues.map(i => i.message).join(' '));
  return result.data;
}
export function validateMaterial(value: Material, others: Material[]): Material {
  const m = parse(materialSchema, value);
  if (new Set(m.prices.map(p => p.date)).size !== m.prices.length) throw new Error('가격 적용일이 중복됩니다. 같은 날짜의 가격은 수정해 주세요.');
  const used = others.find(o => o.id === m.id);
  if (used && used.unit !== m.unit) throw new Error('등록된 재료의 기준단위는 바꿀 수 없습니다.');
  return m;
}
export function validateMenu(value: Menu, state: State): Menu {
  const m = parse(menuSchema, value);
  for (const i of m.recipe) {
    const material = state.materials.find(r => r.id === i.materialId);
    if (!material) throw new Error('등록되지 않은 재료입니다.');
    if (material.unit !== i.unit) throw new Error(`${material.name}의 단위가 일치하지 않습니다.`);
  }
  const keys = m.recipe.map(i => `${i.materialId}/${i.channel}`);
  if (new Set(keys).size !== keys.length) throw new Error('같은 재료·적용채널이 중복됩니다.');
  return m;
}
export function costFor(menu: Menu, materials: Material[], saleDate: string, channel: Channel): CostResult {
  const relevant = menu.recipe.filter(i => i.channel === '전체' || i.channel === channel);
  const reasons: string[] = [], lines: CostLine[] = [];
  if (!relevant.length) reasons.push('해당 판매채널의 레시피가 없습니다.');
  for (const i of relevant) {
    const m = materials.find(m => m.id === i.materialId);
    if (!m) { reasons.push('연결한 재료를 찾을 수 없습니다.'); continue; }
    if (m.unit !== i.unit) { reasons.push(`${m.name}: 단위가 일치하지 않습니다.`); continue; }
    const p = [...m.prices].filter(p => p.date <= saleDate).sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!p) { reasons.push(`${m.name}: 판매일 이전 가격이 없습니다.`); continue; }
    if (!new Decimal(p.capacity).gt(0)) { reasons.push(`${m.name}: 구매용량이 올바르지 않습니다.`); continue; }
    const unitCost = new Decimal(p.amount).div(p.capacity);
    lines.push({ materialId: m.id, name: m.name, unit: m.unit, quantity: i.quantity, unitCost: unitCost.toString(), cost: unitCost.mul(i.quantity).toString(), packaging: m.packaging });
  }
  if (reasons.length) return { food: null, packaging: null, lines, reasons };
  const sum = (packaging: boolean) => lines.filter(l => l.packaging === packaging).reduce((s, l) => s.add(l.cost), new Decimal(0)).toString();
  return { food: sum(false), packaging: sum(true), lines, reasons };
}
export function makeSale(value: SaleInput, state: State, existing?: Sale): Sale {
  const input = parse(saleInputSchema, value);
  const menu = state.menus.find(m => m.id === input.menuId);
  if (!menu) throw new Error('등록된 메뉴를 선택해 주세요.');
  if (state.policies.missingCost === null || state.policies.includeFee === null || state.policies.historicalCost === null || state.policies.entryRules !== 'v1') throw new Error('판매 계산 기준을 먼저 확인해 주세요.');
  if (input.date > today()) throw new Error('미래 날짜의 판매는 입력할 수 없습니다.');
  const gross = new Decimal(input.quantity).mul(input.unitPrice);
  if (new Decimal(input.discount).gt(gross)) throw new Error('할인총액이 할인 전 판매액보다 큽니다.');
  const net = gross.minus(input.discount);
  if (new Decimal(input.fee).gt(net)) throw new Error('결제수수료가 순매출보다 큽니다. 입력값을 확인해 주세요.');
  const basisChanged = !existing || existing.date !== input.date || existing.menuId !== input.menuId || existing.channel !== input.channel;
  const refresh = basisChanged || existing?.snapshot.reasons.length || state.policies.historicalCost === 'recalculate';
  const snapshot = refresh ? costFor(menu, state.materials, input.date, input.channel) : existing!.snapshot;
  if (snapshot.reasons.length && state.policies.missingCost === 'block') throw new Error(snapshot.reasons.join(' ') + ' 기초 정보를 보완한 후 저장해 주세요.');
  return { ...input, net: net.toString(), id: existing?.id ?? crypto.randomUUID(), recipeVersion: refresh ? menu.version : existing!.recipeVersion, snapshot };
}
export function aggregate(sales: Sale[], includeFee: boolean | null) {
  const net = sales.reduce((s, r) => s.add(r.net), new Decimal(0));
  const complete = sales.every(r => r.snapshot.food !== null && r.snapshot.packaging !== null) && includeFee !== null;
  const known = sales.filter(r => r.snapshot.food !== null && r.snapshot.packaging !== null);
  const cost = known.reduce((s, r) => s.add(new Decimal(r.snapshot.food!).add(r.snapshot.packaging!).mul(r.quantity)), new Decimal(0));
  const fee = sales.reduce((s, r) => s.add(r.fee), new Decimal(0));
  const profit = complete ? net.sub(cost).sub(includeFee ? fee : 0) : null;
  return { quantity: sales.reduce((s, r) => s.add(r.quantity), new Decimal(0)).toString(), net: net.toString(), cost: complete ? cost.toString() : null, fee: fee.toString(), profit: profit?.toString() ?? null, margin: profit && net.gt(0) ? profit.div(net).mul(100).toString() : null, missing: sales.length - known.length };
}
export function materialUse(sales: Sale[]) {
  const quantities = new Map<string, Decimal>();
  for (const s of sales) for (const l of s.snapshot.lines) quantities.set(l.materialId, (quantities.get(l.materialId) ?? new Decimal(0)).add(new Decimal(l.quantity).mul(s.quantity)));
  return Object.fromEntries([...quantities].map(([id, amount]) => [id, amount.toString()]));
}
export function displayNumber(value: string | null, digits = 0) {
  if (value === null) return '계산 미완료';
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: digits }).format(Number(new Decimal(value).toFixed(digits)));
}

const calculated = z.string().max(150).refine(s => {
  try { const value = new Decimal(s); return value.isFinite() && value.gte(0); } catch { return false; }
}, '계산된 금액이 올바르지 않습니다.');
const costLineSchema = z.object({ materialId: z.string(), name, unit: z.enum(['g','ml','개']), quantity: positive, unitCost: calculated, cost: calculated, packaging: z.boolean() });
const costSchema = z.object({ food: calculated.nullable(), packaging: calculated.nullable(), lines: z.array(costLineSchema), reasons: z.array(z.string()) });
const saleSchema = saleInputSchema.extend({ id: z.string(), net: calculated, recipeVersion: z.number().int().positive(), snapshot: costSchema });
const policiesSchema = z.object({ storage: z.literal('browser').nullable(), missingCost: z.enum(['allow','block']).nullable(), includeFee: z.boolean().nullable(), historicalCost: z.enum(['snapshot','recalculate']).nullable(), entryRules: z.literal('v1').nullable().optional(), approvalNote: z.string() });
const stateSchema = z.object({ schemaVersion: z.literal(1), revision: z.number().int().nonnegative(), materials: z.array(materialSchema), menus: z.array(menuSchema), sales: z.array(saleSchema), policies: policiesSchema });
export function validateState(value: unknown): State {
  const state = parse(stateSchema, value);
  for (const collection of [state.materials, state.menus, state.sales]) {
    if (new Set(collection.map(r => r.id)).size !== collection.length) throw new Error('기록 ID가 중복됩니다.');
  }
  for (const material of state.materials) validateMaterial(material, state.materials);
  for (const menu of state.menus) validateMenu(menu, state);
  for (const sale of state.sales) {
    if (!state.menus.some(m => m.id === sale.menuId)) throw new Error('판매의 메뉴 연결이 올바르지 않습니다.');
    if (!new Decimal(sale.quantity).mul(sale.unitPrice).sub(sale.discount).eq(sale.net)) throw new Error('순매출과 입력 기록이 일치하지 않습니다.');
    if (!sale.snapshot.reasons.length && (sale.snapshot.food === null || sale.snapshot.packaging === null)) throw new Error('원가 확인 상태가 올바르지 않습니다.');
  }
  return state;
}
export function refreshHistoricalCosts(previous: State, next: State): State {
  if (next.policies.historicalCost !== 'recalculate') return next;
  if (JSON.stringify(previous.materials) === JSON.stringify(next.materials) && JSON.stringify(previous.menus) === JSON.stringify(next.menus)) return next;
  return { ...next, sales: next.sales.map(s => {
    const menu = next.menus.find(m => m.id === s.menuId);
    if (!menu) throw new Error('과거 판매의 메뉴를 찾을 수 없습니다.');
    return { ...s, snapshot: costFor(menu, next.materials, s.date, s.channel), recipeVersion: menu.version };
  }) };
}
