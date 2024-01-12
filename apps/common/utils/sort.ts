import type {TSortDirection} from '@yearn-finance/web-lib/types';

export const stringSort = ({a, b, sortDirection}: {a: string; b: string; sortDirection: TSortDirection}): number =>
	sortDirection === 'desc' ? a.localeCompare(b) : b.localeCompare(a);
