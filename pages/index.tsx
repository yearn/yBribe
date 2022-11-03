import React, {ChangeEvent, ReactElement, ReactNode, useMemo, useState} from 'react';
import Link from 'next/link';
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
	const	[searchValue, set_searchValue] = useState('');

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

	const	searchedGauges = useMemo((): TCurveGauges[] => {
		const	gaugesToSearch = [...filteredGauges];
	
		if (searchValue === '') {
			return gaugesToSearch;
		}
		return gaugesToSearch.filter((gauge): boolean => {
			const	searchString = `${gauge.name} ${gauge.gauge}`;
			return searchString.toLowerCase().includes(searchValue.toLowerCase());
		});
	}, [filteredGauges, searchValue]);
	
	return (
		<section className={'mt-4 mb-20 grid w-full grid-cols-12 pb-10 md:mb-40 md:mt-20'}>
			<div className={'col-span-12 flex w-full flex-col bg-neutral-100'}>
				<div className={'flex flex-row items-center justify-between space-x-6 px-4 pt-4 pb-2 md:space-x-0 md:px-10 md:pt-10 md:pb-8'}>
					<div className={'w-1/2 md:w-auto'}>
						<h2 className={'text-lg font-bold md:text-3xl'}>{'Claim Bribe'}</h2>
					</div>
					<div className={'hidden flex-row space-x-4 md:flex'}>
						<div className={'flex h-8 items-center border border-neutral-0 bg-neutral-0 p-2'}>
							<div className={'flex h-8 w-full flex-row items-center justify-between py-2 px-0'}>
								<input
									className={'w-full overflow-x-scroll border-none bg-transparent py-2 px-0 text-xs outline-none scrollbar-none'}
									type={'text'}
									placeholder={'Search'}
									value={searchValue}
									onChange={(e: ChangeEvent<HTMLInputElement>): void => {
										set_searchValue(e.target.value);
									}} />
							</div>
						</div>
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
						<Button
							onClick={(): void => set_category('v2')}
							variant={category === 'v2' ? 'filled' : 'outlined'}
							className={'yearn--button-smaller'}>
							{'Legacy'}
						</Button>
					</div>
					<div className={'flex w-2/3 flex-row space-x-2 md:hidden'}>
						<div className={'flex h-8 items-center border border-neutral-0 bg-neutral-0 p-2'}>
							<div className={'flex h-8 w-full flex-row items-center justify-between py-2 px-0'}>
								<input
									className={'w-full overflow-x-scroll border-none bg-transparent py-2 px-0 text-xs outline-none scrollbar-none'}
									type={'text'}
									placeholder={'Search'}
									value={searchValue}
									onChange={(e: ChangeEvent<HTMLInputElement>): void => {
										set_searchValue(e.target.value);
									}} />
							</div>
						</div>
						<select
							className={'yearn--button-smaller !w-[120%] border-none bg-neutral-900 text-neutral-0'}
							onChange={(e): void => set_category(e.target.value)}>
							<option value={'claimable'}>{'Claimable'}</option>
							<option value={'all'}>{'All'}</option>
							<option value={'v2'}>{'Legacy'}</option>
						</select>
					</div>
				</div>
				<div className={'grid w-full grid-cols-1 pb-2 md:pb-4'}>
					<GaugeTableHead />
					{searchedGauges.length === 0 ? (
						<GaugeTableEmpty category={category} />
					) : searchedGauges.map((gauge): ReactNode => {
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
				<b className={'text-center text-lg md:text-2xl'}>{'Get more for your votes.'}</b>
				<p className={'mt-8 whitespace-pre-line text-center text-base text-neutral-600'}>
					{'Sell your vote to the highest bidder by voting on the briber\'s gauge and claiming a reward.\nIt\'s like DC lobbying, but without the long lunches.'}
				</p>
			</div>
			<div className={'mb-10 flex flex-row items-center justify-center space-x-4 md:mb-0 md:space-x-10'}>
				<Link
					href={'https://dao.curve.fi/gaugeweight'}
					target={'_blank'}
					className={'w-full md:w-auto'}>
					<Button className={'w-full'}>
						{'Vote for Gauge'}
					</Button>
				</Link>
				<Link href={'/offer-bribe'} className={'w-full md:w-auto'}>
					<Button className={'w-full'}>
						{'Offer Bribe'}
					</Button>
				</Link>
			</div>
			<GaugeList />
		</>
	);
}

Index.getLayout = function getLayout(page: ReactElement): ReactElement {
	return <Wrapper>{page}</Wrapper>;
};

export default Index;