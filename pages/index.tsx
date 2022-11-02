import React, {ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Link from 'next/link';
import {BigNumber} from 'ethers';
import {Button} from '@yearn-finance/web-lib/components';
import {useWeb3} from '@yearn-finance/web-lib/contexts';
import {performBatchedUpdates, toAddress} from '@yearn-finance/web-lib/utils';
import {GaugeRow, GaugeRowHead} from 'components/apps/ybribes/GaugeRow';
import {useBribes} from 'contexts/useBribes';
import {useCurve} from 'contexts/useCurve';
import dayjs, {extend} from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration.js';
import {TCurveGauges} from 'types/curves.d';

extend(dayjsDuration);

function	EmptyGaugeList({category}: {category: string}): ReactElement {
	const	{isLoading} = useBribes();
	const	{isActive} = useWeb3();

	if (!isActive) {
		return (
			<div className={'flex h-96 w-full flex-col items-center justify-center py-2 px-10'}>
				<b className={'text-lg'}>{'Connect your wallet'}</b>
				<p className={'text-neutral-600'}>{'Please connect your wallet to load the gauges.'}</p>
			</div>
		);	
	}
	if (isLoading) {
		return (
			<div className={'flex h-96 w-full flex-col items-center justify-center py-2 px-10'}>
				<b className={'text-lg'}>{'Fetching gauge data'}</b>
				<p className={'text-neutral-600'}>{'We are retrieving the gauge. Please wait.'}</p>
			</div>
		);	
	}
	if (category === 'claimable') {
		return (
			<div className={'flex h-96 w-full flex-col items-center justify-center py-2 px-10'}>
				<b className={'text-lg'}>{'No reward'}</b>
				<p className={'text-neutral-600'}>{'You have nothing to claim.'}</p>
			</div>
		);	
	}
	return (
		<div className={'flex h-96 w-full flex-col items-center justify-center py-2 px-10'}>
			<b className={'text-lg'}>{'No Gauges'}</b>
			<p className={'text-neutral-600'}>
				{'No Gauges available.'}
			</p>
		</div>
	);	
}

function	GaugeList(): ReactElement {
	const	{rewards, claimable} = useBribes();
	const	{gauges} = useCurve();
	const	[category, set_category] = useState('all');
	const	[sortBy, set_sortBy] = useState('relativeWeigth');
	const	[sortDirection, set_sortDirection] = useState('desc');

	const	filteredGauges = useMemo((): TCurveGauges[] => {
		if (category === 'claimable') {
			return gauges.filter((gauge): boolean => {
				const currentClaimableMap = Object.values(claimable[toAddress(gauge.gauge)] || {});
				return currentClaimableMap.some((value: BigNumber): boolean => value.gt(0));
			});
		}
		return gauges.filter((gauge): boolean => rewards[toAddress(gauge.gauge)] !== undefined);
	}, [category, gauges, rewards, claimable]);

	const	sortedGauges = useMemo((): TCurveGauges[] => {
		const	gaugesToSort = [...filteredGauges];
		return gaugesToSort;
	}, [filteredGauges]);
	
	return (
		<section className={'mt-4 mb-20 grid w-full grid-cols-12 pb-10 md:mb-40 md:mt-20'}>
			<div className={'col-span-12 flex w-full flex-col bg-neutral-100'}>
				<div className={'flex flex-row items-center justify-between px-4 pt-4 pb-2 md:px-10 md:pt-10 md:pb-8'}>
					<div>
						<h2 className={'text-lg font-bold md:text-3xl'}>{'Gauges'}</h2>
					</div>
					<div className={'flex flex-row space-x-4'}>
						<Button
							onClick={(): void => set_category('claimable')}
							variant={category === 'claimable' ? 'filled' : 'outlined'}
							className={'yearn--button-smaller'}>
							{'Claimable'}
						</Button>
						<Button
							onClick={(): void => set_category('all')}
							variant={category === 'all' ? 'filled' : 'outlined'}
							className={'yearn--button-smaller'}>
							{'All'}
						</Button>
					</div>
				</div>
				<div className={'grid w-full grid-cols-1 pb-2 md:pb-4'}>
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
						<EmptyGaugeList category={category} />
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
	const	{nextPeriod} = useBribes();
	const	interval = useRef<NodeJS.Timeout | null>(null);
	const	[time, set_time] = useState<number>(0);

	useEffect((): VoidFunction => {
		interval.current = setInterval((): void => {
			const currentTime = dayjs();
			const diffTime = nextPeriod - currentTime.unix();
			const duration = dayjs.duration(diffTime * 1000, 'milliseconds');
			set_time(duration.asMilliseconds());
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

function	Index(): ReactElement {
	return (
		<>
			<div className={'mx-auto mb-10 flex w-full max-w-6xl flex-col items-center justify-center md:mb-20'}>
				<div className={'mt-10 w-[300px] md:w-full'}>
					<div className={'flex w-full items-center justify-center text-center text-4xl font-bold uppercase text-neutral-900 md:text-8xl'}>
						<Period />
					</div>
				</div>
				<div className={'mt-8 mb-10 w-full max-w-6xl text-center'}>
					<b className={'text-center text-lg md:text-2xl'}>{'Get more for your votes!'}</b>
					<p className={'mt-8 whitespace-pre-line text-center text-base text-neutral-600'}>
						{'Sell your vote to the highest bidder, or offer a bribe to increase CRV emissions to your favorite Curve pool.\nJust like democracy, but you don\'t need to wear a suit.'}
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