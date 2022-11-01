import React, {ReactElement, useMemo, useState} from 'react';
import Image from 'next/image';
import {BigNumber, ethers} from 'ethers';
import {Button} from '@yearn-finance/web-lib/components';
import {useWeb3} from '@yearn-finance/web-lib/contexts';
import {defaultTxStatus, format, toAddress, Transaction} from '@yearn-finance/web-lib/utils';
import IconChevronPlain from 'components/icons/IconChevronPlain';
import {useCurve} from 'contexts/useCurve';
import {useYearn} from 'contexts/useYearn';
import {claimReward} from 'utils/actions/claimReward';

import type {TCurveGauges, TKeyStringBN} from 'types/curves.d';

function	GaugeRowHead({
	sortBy,
	sortDirection,
	onSort
}: {
	sortBy: string,
	sortDirection: string,
	onSort: (sortBy: string, sortDirection: string) => void
}): ReactElement {

	function	renderChevron(shouldSortBy: boolean, _sortDirection: string): ReactElement {
		if (shouldSortBy && _sortDirection === 'desc') {
			return <IconChevronPlain className={'h-4 w-4 min-w-[16px] cursor-pointer text-neutral-500'} />;
		}
		if (shouldSortBy && _sortDirection === 'asc') {
			return <IconChevronPlain className={'h-4 w-4 min-w-[16px] rotate-180 cursor-pointer text-neutral-500'} />;
		}
		return <IconChevronPlain className={'h-4 w-4 min-w-[16px] cursor-pointer text-neutral-200/40 transition-colors group-hover:text-neutral-500'} />;
	}

	return (
		<div className={'mb-2 hidden w-full grid-cols-6 px-10 md:grid'}>
			<p className={'col-span-2 text-start text-base text-neutral-400'}>{'Token'}</p>
			<div className={'col-span-4 grid grid-cols-8'}>
				<button
					onClick={(): void => onSort('apr', sortBy === 'apr' ? (sortDirection === 'desc' ? 'asc' : 'desc') : 'desc')}
					className={'group col-span-2 flex flex-row items-center justify-end space-x-1'}>
					<p className={'text-end text-base text-neutral-400'}>
						{'APR'}
					</p>
					{renderChevron(sortBy === 'apr', sortDirection)}
				</button>

				<button
					onClick={(): void => onSort('claimable', sortBy === 'claimable' ? (sortDirection === 'desc' ? 'asc' : 'desc') : 'desc')}
					className={'group col-span-2 flex flex-row items-center justify-end space-x-1'}>
					<p className={'text-end text-base text-neutral-400'}>
						{'Claimable'}
					</p>
					{renderChevron(sortBy === 'claimable', sortDirection)}
				</button>

				<button
					onClick={(): void => onSort('rewards', sortBy === 'rewards' ? (sortDirection === 'desc' ? 'asc' : 'desc') : 'desc')}
					className={'group col-span-3 flex flex-row items-center justify-end space-x-1 pr-14'}>
					<p className={'text-end text-base text-neutral-400'}>
						{'Rewards'}
					</p>
					{renderChevron(sortBy === 'rewards', sortDirection)}
				</button>

				<p className={'col-span-1 text-end text-base text-neutral-400'}>&nbsp;</p>
			</div>
		</div>
	);
}

function	GaugeRowItemWithExtraData({address, value}: {address: string, value: BigNumber}): ReactElement {
	const	{tokens, prices} = useYearn();

	const	tokenInfo = tokens?.[address];
	const	tokenPrice = prices?.[address];
	const	decimals = tokenInfo?.decimals || 18;
	const	symbol = tokenInfo?.symbol || '???';
	const	bribeAmount = format.toNormalizedValue(format.BN(value), decimals);
	const	bribeValue = bribeAmount * (Number(tokenPrice || 0) / 1000000);

	return (
		<div className={'flex h-16 flex-col items-end pt-6'}>
			<p className={'inline-flex items-baseline text-base tabular-nums text-neutral-900'}>
				{`$ ${format.amount(bribeValue, 2, 2)}`}
			</p>
			<p className={'inline-flex items-baseline text-right text-xs tabular-nums text-neutral-400'}>
				{format.amount(bribeAmount, 2, 2)}
				&nbsp;
				<span>{`${symbol}`}</span>
			</p>
		</div>
	);
}

function	GaugeRow({currentGauge}: {currentGauge: TCurveGauges}): ReactElement {
	const	{isActive, address, provider} = useWeb3();
	const	{rewards, claimable, refresh} = useCurve();
	const	[txStatusClaim, set_txStatusClaim] = useState(defaultTxStatus);

	const	rewardsForCurrentGauge = useMemo((): TKeyStringBN => {
		return rewards[toAddress(currentGauge.gauge)];
	}, [currentGauge.gauge, rewards]);

	const	claimableForCurrentGauge = useMemo((): TKeyStringBN => {
		return claimable[toAddress(currentGauge.gauge)];
	}, [currentGauge.gauge, claimable]);

	const	gaugeRelativeWeight = useMemo((): number => {
		return format.toNormalizedValue(format.BN(String(currentGauge?.gauge_controller?.gauge_relative_weight) || ethers.constants.Zero), 18);
	}, [currentGauge]);

	const	claimableForCurrentGaugeMap = Object.entries(claimableForCurrentGauge || {}) || [];
	const	rewardsForCurrentGaugeMap = Object.entries(rewardsForCurrentGauge || {}) || [];
	const	hasSomethingToClaim = claimableForCurrentGaugeMap.some(([, value]: [string, BigNumber]): boolean => value.gt(0));

	function	onClaimReward(token: string): void {
		new Transaction(provider, claimReward, set_txStatusClaim).populate(
			'0xd63042a93525f33500c3a5c0387856d5a69bd1ec' || address,
			currentGauge.gauge,
			token
		).onSuccess(async (): Promise<void> => {
			await refresh();
		}).perform();
	}

	return (
		<div className={'grid w-full grid-cols-1 border-t border-neutral-200 px-10 md:grid-cols-6 md:border-none'}>
			<div className={'col-span-2 mb-2 flex h-16 flex-row items-center justify-between pt-6 md:mb-0'}>
				<div className={'flex flex-row items-center space-x-0 md:space-x-6'}>
					<div className={'hidden h-8 w-8 rounded-full md:flex md:h-10 md:w-10'}>
						<Image
							alt={''}
							width={40}
							height={40}
							quality={90}
							src={`${process.env.BASE_YEARN_ASSETS_URI}/1/${toAddress(currentGauge.swap_token)}/logo-128.png`}
							loading={'eager'} />
					</div>
					<p>{currentGauge.name}</p>
				</div>
			</div>

			<div className={'col-span-4 grid grid-cols-8'}>
				<div className={'col-span-2 flex h-16 flex-row justify-end pt-6'}>
					<b className={'text-end text-base tabular-nums text-neutral-900'}>
						{`${format.amount(gaugeRelativeWeight * 100, 2, 2)}%`}
					</b>
				</div>

				<div className={'col-span-2 flex flex-col'}>
					{
						claimableForCurrentGaugeMap.map(([key, value]: [string, BigNumber]): ReactElement => (
							<GaugeRowItemWithExtraData
								key={`claimable-${currentGauge.gauge}-${key}`}
								address={toAddress(key)}
								value={value} />
						))
					}
				</div>

				<div className={'col-span-3 hidden flex-col items-end pr-16 md:flex'}>
					{
						rewardsForCurrentGaugeMap.map(([key, value]: [string, BigNumber]): ReactElement => (
							<GaugeRowItemWithExtraData
								key={`rewards-${currentGauge.gauge}-${key}`}
								address={toAddress(key)}
								value={value} />
						))
					}
				</div>

				<div className={'col-span-1 flex flex-col items-end'}>
					{
						rewardsForCurrentGaugeMap.map(([key]: [string, BigNumber]): ReactElement => (
							<div key={`claim-${key}`} className={'h-16 pt-7'}>
								<Button
									className={'yearn--button-smaller w-full'}
									onClick={(): void => onClaimReward(key)}
									isBusy={txStatusClaim.pending}
									isDisabled={
										!isActive
									|| !hasSomethingToClaim
									}>
									{'Claim'}
								</Button>
							</div>
						))
					}
				</div>
			</div>
		</div>
	);
}

export {GaugeRow, GaugeRowHead};
