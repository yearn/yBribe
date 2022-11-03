import {ethers} from 'ethers';
import {format, toAddress} from '@yearn-finance/web-lib/utils';
import {TNormalizedBN} from 'types/types.d';

export function allowanceKey(token: unknown, spender: unknown): string {
	return `${toAddress(token as string)}_${toAddress(spender as string)}`;
}

export function handleInputChange(
	e: React.ChangeEvent<HTMLInputElement>,
	decimals: number
): TNormalizedBN {
	let		amount = e.target.value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
	const	amountParts = amount.split('.');
	if (amountParts.length === 2) {
		amount = amountParts[0] + '.' + amountParts[1].slice(0, decimals);
	}
	const	raw = ethers.utils.parseUnits(amount || '0', decimals);
	return ({raw: raw, normalized: amount});
}

export function	getCounterValue(amount: number | string, price: number): string {
	if (!amount || !price) {
		return ('$0.00');
	}
	const value = (Number(amount) || 0) * (price || 0);
	if (value > 10000) {
		return (`$${format.amount(value, 0, 0)}`);
	}
	return (`$${format.amount(value, 2, 2)}`);
}

export function	getLastThursday(): number {
	// Retrieve the timestamp of the last Thursday at 00:00:00 UTC.
	// If today is Thursday, return the timestamp of today at 00:00:00 UTC.
	const	oneDay = 86400;
	const	today = new Date();
	const	day = today.getDay();
	const	utc = today.getTime() - (today.getTimezoneOffset() * 60000);
	const	lastThursday = new Date(utc + (oneDay * (day === 4 ? 0 : 4 - day)));
	lastThursday.setUTCHours(0, 0, 0, 0);
	return Math.floor(lastThursday.getTime() / 1000);
}

export function	getNextThursday(): number {
	return getLastThursday() + (86400 * 7);
}