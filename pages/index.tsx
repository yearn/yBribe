import React, {ReactElement, ReactNode, useCallback, useMemo, useState} from 'react';
import CountUp from 'react-countup';
import Link from 'next/link';
import {BigNumber, ethers} from 'ethers';
import {Button} from '@yearn-finance/web-lib/components';
import {format, performBatchedUpdates, toAddress} from '@yearn-finance/web-lib/utils';
import {GaugeRow, GaugeRowHead} from 'components/apps/ybribes/GaugeRow';
import {useCurve} from 'contexts/useCurve';
import dayjs, {extend} from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration.js';
import {TCurveGauges} from 'types/curves.d';

extend(dayjsDuration);

function	GaugeList(): ReactElement {
	const	{gauges, rewards, claimable} = useCurve();
	const	[category, set_category] = useState('withBribe');
	const	[sortBy, set_sortBy] = useState('relativeWeigth');
	const	[sortDirection, set_sortDirection] = useState('desc');

	const	filteredGauges = useMemo((): TCurveGauges[] => {
		if (category === 'claimable') {
			return gauges.filter((gauge): boolean => {
				const currentClaimableMap = Object.values(claimable[toAddress(gauge.gauge)] || {});
				return currentClaimableMap.some((value: BigNumber): boolean => value.gt(0));
			});
		}
		if (category === 'withBribe') {
			return gauges.filter((gauge): boolean => rewards[toAddress(gauge.gauge)] !== undefined);
		}
		return gauges;
	}, [category, gauges, rewards, claimable]);

	const	sortedGauges = useMemo((): TCurveGauges[] => {
		const	gaugesToSort = [...filteredGauges];
		if (sortBy === 'relativeWeigth') {
			return gaugesToSort.sort((a, b): number => {
				const	aWeight = format.toNormalizedValue(format.BN(String(a?.gauge_controller?.gauge_relative_weight) || ethers.constants.Zero), 18);
				const	bWeight = format.toNormalizedValue(format.BN(String(b?.gauge_controller?.gauge_relative_weight) || ethers.constants.Zero), 18);

				if (sortDirection === 'asc') {
					return (aWeight) - (bWeight);
				}
				return (bWeight) - (aWeight);
			});
		}

		if (sortBy === 'rewards') {
			//
		}

		return gaugesToSort;
	}, [sortBy, filteredGauges, sortDirection]);
	
	return (
		<section className={'mt-4 mb-40 grid w-full grid-cols-12 gap-y-10 pb-10 md:mt-20 md:gap-x-10 md:gap-y-20'}>
			<div className={'col-span-12 flex w-full flex-col bg-neutral-100'}>
				<div className={'flex flex-row items-center justify-between px-10 pt-10 pb-8'}>
					<div>
						<h2 className={'text-3xl font-bold'}>{'Gauges'}</h2>
					</div>
					<div className={'flex flex-row space-x-4'}>
						<Button
							onClick={(): void => set_category('claimable')}
							variant={category === 'claimable' ? 'filled' : 'outlined'}
							className={'yearn--button-smaller'}>
							{'Claimable'}
						</Button>
						<Button
							onClick={(): void => set_category('withBribe')}
							variant={category === 'withBribe' ? 'filled' : 'outlined'}
							className={'yearn--button-smaller'}>
							{'With Bribe'}
						</Button>
						<Button
							onClick={(): void => set_category('all')}
							variant={category === 'all' ? 'filled' : 'outlined'}
							className={'yearn--button-smaller'}>
							{'All'}
						</Button>
					</div>
				</div>
				<div className={'grid w-full grid-cols-1 pb-4'}>
					<GaugeRowHead
						sortBy={sortBy}
						sortDirection={sortDirection}
						onSort={(_sortBy: string, _sortDirection: string): void => {
							performBatchedUpdates((): void => {
								set_sortBy(_sortBy);
								set_sortDirection(_sortDirection);
							});
						}} />
					{sortedGauges.length === 0 ? (
						<div className={'flex h-96 w-full flex-col items-center justify-center py-2 px-10'}>
							<b className={'text-lg'}>{'No Gauges'}</b>
							<p className={'text-neutral-600'}>{'No Gauges available. What a shame. What are the dev doing. Bouuuuuh.'}</p>

						</div>
					) : sortedGauges.map((gauge): ReactNode => {
						if (!gauge) {
							return (null);
						}
						return <GaugeRow key={gauge.name} currentGauge={gauge} />;
					})}

				</div>
			</div>

		</section>
	);
}

function	Period(): ReactElement {
	const[time, set_time] = useState<number>(0);
	const	nextThursdayTimestamp = useMemo((): number => {
		const	now = new Date();
		const	weekDay = now.getDay();
		const	weekDayDiff = 4 - weekDay;
		const	nextThursday = new Date(now.getTime() + (weekDayDiff * 24 * 60 * 60 * 1000));
		nextThursday.setHours(0, 0, 0, 0);
		return nextThursday.getTime() / 1000;
	}, []);

	useMemo((): void => {
		setInterval((): void => {
			const currentTime = dayjs();
			const diffTime = nextThursdayTimestamp - currentTime.unix();
			const duration = dayjs.duration(diffTime * 1000, 'milliseconds');
			set_time(duration.asMilliseconds());
		}, 1000);
	}, [nextThursdayTimestamp]);

	const formatTimestamp = useCallback((n: number): string => {
		const	twoDP = (n: number): string | number => (n > 9 ? n : '0' + n);
		const	duration = dayjs.duration(n - 1000, 'milliseconds');
		const	timestamp = `${
			duration.days() && duration.days() + 'd '
		}${duration.hours()}h ${twoDP(duration.minutes())}m ${twoDP(
			duration.seconds()
		)}s`;
		return timestamp;
	}, []);

	return (
		<CountUp
			preserveValue
			decimals={0}
			duration={0.5}
			formattingFn={formatTimestamp}
			end={time} />
	);
}

function	Index(): ReactElement {
	return (
		<>
			<div className={'mx-auto mb-10 flex w-full max-w-6xl flex-col items-center justify-center md:mb-20'}>
				<div className={'mt-10 w-[300px] md:w-full'}>
					<div className={'flex w-full items-center justify-center text-center text-5xl font-bold uppercase text-neutral-900 md:text-8xl'}>
						<Period />
					</div>
				</div>
				<div className={'mt-8 mb-10 w-full max-w-6xl text-center'}>
					<b className={'text-center text-lg md:text-2xl'}>{'Get more for your votes!'}</b>
					<p className={'mt-8 whitespace-pre-line text-center text-base text-neutral-600'}>
						{'Add a reward to a pool which will be distributed proportionally to everyone who votes for it.'}
					</p>
				</div>
				<div className={'flex flex-row items-center justify-center space-x-10'}>
					<Link href={'/'}>
						<Button className={'w-full'}>
							{'Claim Bribe'}
						</Button>
					</Link>
					<Link href={'/offer-bribe'}>
						<Button className={'w-full'}>
							{'Offer Bribe'}
						</Button>
					</Link>
				</div>
			</div>
			<GaugeList />
		</>
	);
}

export default Index;