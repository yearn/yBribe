import React, {ReactElement, useCallback, useEffect, useRef, useState} from 'react';
import dayjs, {extend} from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration.js';

extend(dayjsDuration);

function	getLastThursday(): number {
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

function	computeTimeLeft(): number {
	const	nextPeriod = getLastThursday() + (86400 * 7);
	const currentTime = dayjs();
	const diffTime = nextPeriod - currentTime.unix();
	const duration = dayjs.duration(diffTime * 1000, 'milliseconds');
	return duration.asMilliseconds();
}

function	HeroTimer(): ReactElement {
	// const	{nextPeriod} = useBribes();
	const	nextPeriod = getLastThursday() + (86400 * 7);
	const	interval = useRef<NodeJS.Timeout | null>(null);
	const	[time, set_time] = useState<number>(computeTimeLeft());

	useEffect((): VoidFunction => {
		set_time(computeTimeLeft());

		interval.current = setInterval((): void => {
			set_time(computeTimeLeft());
		}, 1000);

		return (): void => {
			if (interval.current) {
				clearInterval(interval.current);
			}
		};
	}, [nextPeriod]);

	const formatTimestamp = useCallback((n: number): string => {
		const	twoDP = (n: number): string | number => (n > 9 ? n : '0' + n);
		const	duration = dayjs.duration(n - 1000, 'milliseconds');
		const	days = duration.days();
		const	hours = duration.hours();
		const	minutes = duration.minutes();
		const	seconds = duration.seconds();
		return `${days ? `${days}d ` : ''}${twoDP(hours)}h ${twoDP(minutes)}m ${twoDP(seconds)}s`;
	}, []);

	return (
		<b className={'tabular-nums'}>
			{time ? formatTimestamp(time) : '00H 00M 00S'}
		</b>
	);
}

export {HeroTimer};