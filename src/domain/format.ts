const nf1 = new Intl.NumberFormat('zh-TW', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nf0 = new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 0 });

/** 公噸，小數 1 位；長尾中的小工地（< 0.1 公噸）顯示為「<0.1」而非 0.0 */
export const tons = (x: number) => (x > 0 && x < 0.1 ? '<0.1' : nf1.format(x));
/** 百分比，小數 1 位 */
export const pct = (x: number) => `${nf1.format(x)}%`;
export const int = (x: number) => nf0.format(x);
