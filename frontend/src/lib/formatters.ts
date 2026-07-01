const mznCurrencyFormatter = new Intl.NumberFormat('pt-MZ', {
  style: 'currency',
  currency: 'MZN',
});

const ptBrFullDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'full',
});

const ptBrLongDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const ptPtDateFormatter = new Intl.DateTimeFormat('pt-PT');

const ptPtMonthFormatter = new Intl.DateTimeFormat('pt-PT', {
  month: 'long',
});

export const financeMonthOptions = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: ptPtMonthFormatter.format(new Date(2000, index)),
}));

export function formatCurrency(value: number) {
  return mznCurrencyFormatter.format(value);
}

export function formatFullDate(value: Date) {
  return ptBrFullDateFormatter.format(value);
}

export function formatLongDate(value: Date) {
  return ptBrLongDateFormatter.format(value);
}

export function formatShortDate(value: Date | string) {
  return ptPtDateFormatter.format(new Date(value));
}

export function formatMonthLabel(month: number) {
  return ptPtMonthFormatter.format(new Date(2000, month - 1));
}
