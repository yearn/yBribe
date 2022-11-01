import {toAddress} from '@yearn-finance/web-lib/utils';

export function allowanceKey(token: unknown, spender: unknown): string {
	return `${toAddress(token as string)}_${toAddress(spender as string)}`;
}
