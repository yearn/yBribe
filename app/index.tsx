import dayjs, {extend} from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration.js';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';

export const YBRIBE_SUPPORTED_NETWORK = 1;
export const DEFAULT_SLIPPAGE = 0.5;
export const DEFAULT_MAX_LOSS = 1n;

extend(dayjsDuration);
extend(weekday);
extend(utc);

export function getLastThursday(): number {
	const today = dayjs().utc();
	let lastThursday = today.weekday(4);
	lastThursday = lastThursday.set('hour', 0);
	lastThursday = lastThursday.set('minute', 0);
	lastThursday = lastThursday.set('second', 0);
	if (today.isBefore(lastThursday)) {
		return lastThursday.subtract(1, 'week').unix();
	}
	return lastThursday.unix();
}

export function getNextThursday(): number {
	const today = dayjs().utc();
	let nextThursday = today.weekday(4);
	nextThursday = nextThursday.set('hour', 0);
	nextThursday = nextThursday.set('minute', 0);
	nextThursday = nextThursday.set('second', 0);
	if (today.isAfter(nextThursday)) {
		return nextThursday.add(1, 'week').unix();
	}
	return nextThursday.unix();
}

const BRIBE_CATEGORIES = ['claimable', 'all'] as const;
export type TBribeListHeroCategory = (typeof BRIBE_CATEGORIES)[number];

const BRIBE_OFFER_CATEGORIES = ['standard', 'factory', 'all'] as const;
export type TBribeOfferListHeroCategory = (typeof BRIBE_OFFER_CATEGORIES)[number];

export function isValidCategory<T extends string>(input: string): input is T {
	return (
		BRIBE_CATEGORIES.includes(input as TBribeListHeroCategory) ||
		BRIBE_OFFER_CATEGORIES.includes(input as TBribeOfferListHeroCategory)
	);
}
