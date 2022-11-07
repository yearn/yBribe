import {ethers} from 'ethers';
import {format, toAddress} from '@yearn-finance/web-lib/utils';
import dayjs, {extend} from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration.js';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import {TNormalizedBN} from 'types/types.d';

extend(dayjsDuration);
extend(weekday);
extend(utc);

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
	const	today = dayjs().utc();
	let		lastThursday = today.weekday(4);
	lastThursday = lastThursday.set('hour', 0);
	lastThursday = lastThursday.set('minute', 0);
	lastThursday = lastThursday.set('second', 0);
	if (today.isBefore(lastThursday)) {
		return (lastThursday.subtract(1, 'week').unix());
	}
	return (lastThursday.unix());
}

export function	getNextThursday(): number {
	const	today = dayjs().utc();
	let		nextThursday = today.weekday(4);
	nextThursday = nextThursday.set('hour', 0);
	nextThursday = nextThursday.set('minute', 0);
	nextThursday = nextThursday.set('second', 0);
	if (today.isAfter(nextThursday)) {
		return (nextThursday.add(1, 'week').unix());
	}
	return (nextThursday.unix());
}