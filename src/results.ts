import type { ResultItem } from './types';

export function winningOptions(results: ResultItem[]) {
  const options = results.flatMap(item => [
    { date: item.date, meal: 'lunch' as const, votes: item.lunch },
    { date: item.date, meal: 'dinner' as const, votes: item.dinner },
  ]);
  const highest = Math.max(0, ...options.map(option => option.votes));
  return highest > 0 ? options.filter(option => option.votes === highest) : [];
}
