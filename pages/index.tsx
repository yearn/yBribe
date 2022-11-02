import React, {ReactElement, ReactNode, useMemo, useState} from 'react';
import Link from 'next/link';
import {BigNumber} from 'ethers';
import {Button} from '@yearn-finance/web-lib/components';
import {toAddress} from '@yearn-finance/web-lib/utils';
import {GaugeTableEmpty} from 'components/apps/ybribes/claim/GaugeTableEmpty';
import {GaugeTableHead} from 'components/apps/ybribes/claim/GaugeTableHead';
import {GaugeTableRow} from 'components/apps/ybribes/claim/GaugeTableRow';
import {HeroTimer} from 'components/apps/ybribes/HeroTimer';
import {useBribes} from 'contexts/useBribes';
import {useCurve} from 'contexts/useCurve';
import {TCurveGauges} from 'types/curves.d';

function	GaugeList(): ReactElement {
	const	{currentRewards, claimable} = useBribes();
	const	{gauges} = useCurve();
	const	[category, set_category] = useState('all');

	const	filteredGauges = useMemo((): TCurveGauges[] => {
		if (category === 'claimable') {
			return gauges.filter((gauge): boolean => {
				const currentClaimableMap = Object.values(claimable[toAddress(gauge.gauge)] || {});
				return currentClaimableMap.some((value: BigNumber): boolean => value.gt(0));
			});
		}
		return gauges.filter((gauge): boolean => currentRewards[toAddress(gauge.gauge)] !== undefined);
	}, [category, gauges, currentRewards, claimable]);

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
					<GaugeTableHead />
					{sortedGauges.length === 0 ? (
						<GaugeTableEmpty category={category} />
					) : sortedGauges.map((gauge): ReactNode => {
						if (!gauge) {
							return (null);
						}
						return <GaugeTableRow key={gauge.name} currentGauge={gauge} />;
					})}
				</div>
			</div>
		</section>
	);
}

function	Index(): ReactElement {
	return (
		<>
			<div className={'mx-auto mb-10 flex w-full max-w-6xl flex-col items-center justify-center md:mb-20'}>
				<div className={'mt-10 w-[300px] md:w-full'}>
					<div className={'flex w-full items-center justify-center text-center text-4xl font-bold uppercase text-neutral-900 md:text-8xl'}>
						<HeroTimer />
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