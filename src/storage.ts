import Dexie, { type Table } from 'dexie';
import { emptyState, refreshHistoricalCosts, validateState, type Material, type Menu, type Policies, type Sale, type State } from './domain';

interface Meta { id: 'state'; schemaVersion: number; revision: number; policies: Policies }
export class LedgerDB extends Dexie {
  materials!: Table<Material, string>;
  menus!: Table<Menu, string>;
  sales!: Table<Sale, string>;
  meta!: Table<Meta, string>;
  constructor(name = 'prep-cafe-ledger') {
    super(name);
    this.version(1).stores({ materials: 'id,name', menus: 'id,name', sales: 'id,date,menuId,channel,[date+menuId+channel]', meta: 'id' });
  }
}
function storageError(e: unknown): Error {
  const message = e instanceof Error ? e.message : '';
  if (message.includes('다른 창') || message.includes('먼저') || message.includes('자료') || message.includes('연결') || message.includes('순매출') || message.includes('이미')) return new Error(message);
  if ((e as Error)?.name === 'QuotaExceededError') return new Error('저장 공간이 부족합니다. 입력은 유지됩니다. 브라우저 저장 공간을 확인해 주세요.');
  return new Error('브라우저 기록 저장소에 접근하지 못했습니다. 기존 자료를 지우지 않았습니다. 입력을 유지한 채 다시 시도해 주세요.');
}
export class LedgerRepository {
  db: LedgerDB;
  constructor(name?: string) { this.db = new LedgerDB(name); }
  private async read(): Promise<State> {
    const [meta, materials, menus, sales] = await Promise.all([this.db.meta.get('state'), this.db.materials.toArray(), this.db.menus.toArray(), this.db.sales.toArray()]);
    if (!meta) {
      if (materials.length || menus.length || sales.length) throw new Error('저장 자료의 버전 정보가 없습니다. 기존 자료를 유지합니다.');
      return emptyState();
    }
    if (meta.schemaVersion !== 1) throw new Error('지원하지 않는 자료 버전입니다. 기존 자료를 유지합니다.');
    return validateState({ schemaVersion: meta.schemaVersion, revision: meta.revision, policies: meta.policies, materials, menus, sales });
  }
  async load(): Promise<State> {
    try { return await this.db.transaction('r', this.db.tables, () => this.read()); }
    catch (e) { throw storageError(e); }
  }
  async commit(revision: number, change: (state: State) => State): Promise<State> {
    try {
      return await this.db.transaction('rw', this.db.tables, async () => {
        const before = await this.read();
        if (before.revision !== revision) throw new Error('다른 창에서 기록이 변경되었습니다. 최신 기록을 불러왔습니다. 입력값을 확인하고 다시 저장해 주세요.');
        let next = change(structuredClone(before));
        if (next.policies.storage !== 'browser') throw new Error('기록을 저장할 위치를 먼저 선택해 주세요.');
        for (const key of ['storage','missingCost','includeFee','historicalCost','entryRules'] as const) {
          if (before.policies[key] !== null && before.policies[key] !== undefined && before.policies[key] !== next.policies[key]) throw new Error('이미 선택한 계산 기준은 이 버전에서 변경하지 않습니다.');
        }
        next = validateState({ ...refreshHistoricalCosts(before, next), revision: before.revision + 1 });
        await this.writeDiff(this.db.materials, before.materials, next.materials);
        await this.writeDiff(this.db.menus, before.menus, next.menus);
        await this.writeDiff(this.db.sales, before.sales, next.sales);
        await this.db.meta.put({ id: 'state', schemaVersion: next.schemaVersion, revision: next.revision, policies: next.policies });
        return next;
      });
    } catch (e) { throw storageError(e); }
  }
  private async writeDiff<T extends { id: string }>(table: Table<T, string>, before: T[], after: T[]) {
    const old = new Map(before.map(v => [v.id, JSON.stringify(v)]));
    const ids = new Set(after.map(v => v.id));
    await table.bulkDelete(before.filter(v => !ids.has(v.id)).map(v => v.id));
    await table.bulkPut(after.filter(v => old.get(v.id) !== JSON.stringify(v)));
  }
}
const repository = new LedgerRepository();
export const load = () => repository.load();
export const commit = (revision: number, change: (state: State) => State) => repository.commit(revision, change);
