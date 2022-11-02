import React, {ReactElement, ReactNode, useMemo, useState} from 'react';
import {BigNumber} from 'ethers';
import {Button} from '@yearn-finance/web-lib/components';
import {toAddress} from '@yearn-finance/web-lib/utils';
import {GaugeTableEmpty} from 'components/apps/ybribes/claim/GaugeTableEmpty';
import {GaugeTableHead} from 'components/apps/ybribes/claim/GaugeTableHead';
import {GaugeTableRow} from 'components/apps/ybribes/claim/GaugeTableRow';
import Wrapper from 'components/apps/ybribes/Wrapper';
import {useBribes} from 'contexts/useBribes';
import {useCurve} from 'contexts/useCurve';
import {TCurveGauges} from 'types/curves.d';

function	GaugeList(): ReactElement {
	const	{currentRewards, nextRewards, claimable} = useBribes();
	const	{gauges} = useCurve();
	const	[category, set_category] = useState('all');

	const	filteredGauges = useMemo((): TCurveGauges[] => {
		if (category === 'claimable') {
			return gauges.filter((gauge): boolean => {
				const currentClaimableMapV2 = Object.values(claimable?.v2?.[toAddress(gauge.gauge)] || {});
				const currentClaimableMapV3 = Object.values(claimable?.v3?.[toAddress(gauge.gauge)] || {});
				return [...currentClaimableMapV2, ...currentClaimableMapV3].some((value: BigNumber): boolean => value.gt(0));
			});
		}
		if (category === 'v2') {
			return gauges.filter((gauge): boolean => {
				const hasCurrentRewardsV2 = currentRewards?.v2?.[toAddress(gauge.gauge)] !== undefined;
				return hasCurrentRewardsV2;
			});
		}
		return gauges.filter((gauge): boolean => {
			const hasCurrentRewardsV3 = currentRewards?.v3?.[toAddress(gauge.gauge)] !== undefined;
			const hasNextRewardsV3 = nextRewards?.v3?.[toAddress(gauge.gauge)] !== undefined;
			return hasCurrentRewardsV3 || hasNextRewardsV3;
		});
	}, [category, gauges, currentRewards, nextRewards, claimable]);

	const	sortedGauges = useMemo((): TCurveGauges[] => {
		const	gaugesToSort = [...filteredGauges];
		return gaugesToSort;
	}, [filteredGauges]);
	
	return (
		<section className={'mt-4 mb-20 grid w-full grid-cols-12 pb-10 md:mb-40 md:mt-20'}>
			<div className={'col-span-12 flex w-full flex-col bg-neutral-100'}>
				<div className={'flex flex-row items-center justify-between px-4 pt-4 pb-2 md:px-10 md:pt-10 md:pb-8'}>
					<div>
						<h2 className={'text-lg font-bold md:text-3xl'}>{'Claim Bribe'}</h2>
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
							{'V3'}
						</Button>
						<Button
							onClick={(): void => set_category('v2')}
							variant={category === 'v2' ? 'filled' : 'outlined'}
							className={'yearn--button-smaller'}>
							{'Legacy'}
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
						return <GaugeTableRow
							key={gauge.name}
							currentGauge={gauge}
							category={category} />;
					})}
				</div>
			</div>
		</section>
	);
}

function	Index(): ReactElement {
	return (
		<>
			<div className={'mt-8 mb-10 w-full max-w-6xl text-center'}>
				<b className={'text-center text-lg md:text-2xl'}>{'Get more for your votes'}</b>
				<p className={'mt-8 whitespace-pre-line text-center text-base text-neutral-600'}>
					{'Sell your vote to the highest bidder by voting on briber\'s gauge and claiming a reward.\nIt\'s like DC lobbying, but without the long lunch.'}
				</p>
			</div>
			<GaugeList />
		</>
	);
}

Index.getLayout = function getLayout(page: ReactElement): ReactElement {
	return <Wrapper>{page}</Wrapper>;
};

export default Index;