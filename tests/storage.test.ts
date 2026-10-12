import 'fake-indexeddb/auto';
import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { LedgerRepository } from '../src/storage';
import { aggregate, makeSale, validateMaterial, validateMenu, type Material, type Menu, type State } from '../src/domain';

const bean: Material = { id:'bean',name:'원두',unit:'g',packaging:false,prices:[{date:'2026-01-01',amount:'23000',capacity:'1000'}],openingDate:'2026-01-01',opening:'6000' };
const menu: Menu = {id:'coffee',name:'아메리카노',category:'음료',price:'4000',version:1,recipe:[{materialId:'bean',unit:'g',quantity:'20',channel:'전체'}]};
const input = {date:'2026-09-01',menuId:'coffee',channel:'매장' as const,quantity:'10',unitPrice:'4000',discount:'2000',fee:'570'};
let repository: LedgerRepository;
beforeEach(()=>{repository=new LedgerRepository(`test-only-${crypto.randomUUID()}`);});
afterEach(async()=>{await repository.db.delete();});
async function prepare(): Promise<State> {
  return repository.commit(0,s=>({...s,materials:[bean],menus:[menu],policies:{storage:'browser',missingCost:'allow',includeFee:true,historicalCost:'snapshot',entryRules:'v1',approvalNote:'disposable test fixture'}}));
}
describe('record persistence, integrity and failure recovery',()=>{
  it('starts without selecting policies, and refuses unapproved storage',async()=>{
    const s=await repository.load();expect(s.policies.storage).toBeNull();
    await expect(repository.commit(0,s=>({...s,materials:[bean]}))).rejects.toThrow('먼저');expect((await repository.load()).materials).toEqual([]);
  });
  it('persists one setup choice at a time across repository reopen',async()=>{
    await repository.commit(0,s=>({...s,policies:{...s.policies,storage:'browser'}}));
    const reopened=new LedgerRepository(repository.db.name);const s=await reopened.load();expect(s.policies.storage).toBe('browser');expect(s.policies.missingCost).toBeNull();reopened.db.close();
  });
  it('preserves material, recipe and sales after closing the connection',async()=>{
    const s=await prepare();const sale=makeSale(input,s);await repository.commit(s.revision,s=>({...s,sales:[sale]}));repository.db.close();
    const reopened=new LedgerRepository(repository.db.name);const reloaded=await reopened.load();expect(reloaded.materials[0].opening).toBe('6000');expect(reloaded.menus[0].recipe[0].quantity).toBe('20');expect(aggregate(reloaded.sales,true).profit).toBe('32830');reopened.db.close();
  });
  it('replaces an edited sale and removes its effects on confirmed delete',async()=>{
    let s=await prepare();const sale=makeSale(input,s);s=await repository.commit(s.revision,s=>({...s,sales:[sale]}));
    const modified=makeSale({...input,quantity:'8'},s,s.sales[0]);s=await repository.commit(s.revision,s=>({...s,sales:[modified]}));expect(s.sales).toHaveLength(1);expect(aggregate(s.sales,true).profit).toBe('25750');
    s=await repository.commit(s.revision,s=>({...s,sales:[]}));expect(aggregate(s.sales,true).net).toBe('0');expect((await repository.load()).sales).toHaveLength(0);
  });
  it('prevents two concurrent saves from adding duplicate records',async()=>{
    const s=await prepare();const sale=makeSale(input,s);const results=await Promise.allSettled([repository.commit(s.revision,s=>({...s,sales:[sale]})),repository.commit(s.revision,s=>({...s,sales:[sale]}))]);expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect((await repository.load()).sales).toHaveLength(1);
  });
  it('rejects stale edits from a second tab and keeps the winning value',async()=>{
    const s=await prepare();await repository.commit(s.revision,s=>({...s,materials:[{...bean,opening:'5000'}]}));
    await expect(repository.commit(s.revision,s=>({...s,materials:[{...bean,opening:'3000'}]}))).rejects.toThrow('다른 창');expect((await repository.load()).materials[0].opening).toBe('5000');
  });
  it('rolls back material writes if a later table write fails',async()=>{
    let s=await prepare();const fail=()=>{throw new Error('injected storage failure');};repository.db.menus.hook('creating',fail);
    await expect(repository.commit(s.revision,s=>({...s,materials:[{...bean,opening:'1'}],menus:[...s.menus,{...menu,id:'new-menu',name:'새메뉴'}]}))).rejects.toThrow();
    repository.db.menus.hook('creating').unsubscribe(fail);s=await repository.load();expect(s.materials[0].opening).toBe('6000');expect(s.revision).toBe(1);expect(s.menus).toHaveLength(1);
  });
  it('does not erase corrupted or future-version storage on read',async()=>{
    await prepare();await repository.db.meta.update('state',{schemaVersion:99});await expect(repository.load()).rejects.toThrow('자료 버전');expect(await repository.db.materials.count()).toBe(1);
  });
  it('validates relationships again at the storage boundary',async()=>{
    const s=await prepare();await expect(repository.commit(s.revision,s=>({...s,materials:[]}))).rejects.toThrow();expect((await repository.load()).materials).toHaveLength(1);
  });
  it('keeps historical costs under preserve policy after price and recipe edits',async()=>{
    let s=await prepare();const sale=makeSale(input,s);s=await repository.commit(s.revision,s=>({...s,sales:[sale]}));
    s=await repository.commit(s.revision,s=>({...s,materials:[{...bean,prices:[{date:'2026-01-01',amount:'30000',capacity:'1000'}]}],menus:[{...menu,version:2,recipe:[{...menu.recipe[0],quantity:'25'}]}]}));expect(s.sales[0].snapshot.food).toBe('460');expect(aggregate(s.sales,true).profit).toBe('32830');
  });
  it('recalculates all historic rows only when recalculation was explicitly selected',async()=>{
    let s=await repository.commit(0,s=>({...s,materials:[bean],menus:[menu],policies:{storage:'browser',missingCost:'allow',includeFee:true,historicalCost:'recalculate',entryRules:'v1',approvalNote:'test choice'}}));const sale=makeSale(input,s);s=await repository.commit(s.revision,s=>({...s,sales:[sale]}));s=await repository.commit(s.revision,s=>({...s,materials:[{...bean,prices:[{date:'2026-01-01',amount:'30000',capacity:'1000'}]}]}));expect(s.sales[0].snapshot.food).toBe('600');expect(aggregate(s.sales,true).profit).toBe('31430');
  });
  it('repairs an incomplete snapshot through an explicit sale edit after adding a recipe',async()=>{
    let s=await repository.commit(0,s=>({...s,materials:[bean],menus:[{...menu,recipe:[]}],policies:{storage:'browser',missingCost:'allow',includeFee:true,historicalCost:'snapshot',entryRules:'v1',approvalNote:'test choice'}}));const sale=makeSale(input,s);s=await repository.commit(s.revision,s=>({...s,sales:[sale]}));expect(aggregate(s.sales,true).profit).toBeNull();s=await repository.commit(s.revision,s=>({...s,menus:[menu]}));const repaired=makeSale(input,s,s.sales[0]);s=await repository.commit(s.revision,s=>({...s,sales:[repaired]}));expect(aggregate(s.sales,true).profit).toBe('32830');
  });
  it('round trips fractional decimal results without truncating stored precision',async()=>{
    let s=await prepare();s=await repository.commit(s.revision,s=>({...s,materials:[{...bean,prices:[{date:'2026-01-01',amount:'1',capacity:'3'}]}]}));const sale=makeSale(input,s);await repository.commit(s.revision,s=>({...s,sales:[sale]}));expect((await repository.load()).sales[0].snapshot.food).toBe(sale.snapshot.food);
  });
  it('prevents silent changes to already selected policies',async()=>{const s=await prepare();await expect(repository.commit(s.revision,s=>({...s,policies:{...s.policies,includeFee:false}}))).rejects.toThrow('이미 선택');});
});

describe('basic information validation',()=>{
  it('validates blank vs zero, and does not forbid same names when IDs differ',()=>{expect(()=>validateMaterial({...bean,opening:''},[])).toThrow();expect(validateMaterial({...bean,id:'another'},[bean]).id).toBe('another');expect(validateMenu({...menu,id:'another'}, {...({materials:[bean],menus:[menu]} as State)}).id).toBe('another');});
});
