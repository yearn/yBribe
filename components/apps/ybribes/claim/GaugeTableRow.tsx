import React, {ReactElement, useMemo, useState} from 'react';
import Image from 'next/image';
import {BigNumber} from 'ethers';
import {Button} from '@yearn-finance/web-lib/components';
import {useWeb3} from '@yearn-finance/web-lib/contexts';
import {defaultTxStatus, format, toAddress, Transaction} from '@yearn-finance/web-lib/utils';
import {useBribes} from 'contexts/useBribes';
import {useYearn} from 'contexts/useYearn';
import {claimReward} from 'utils/actions/claimReward';

import type {TCurveGauges, TKeyStringBN} from 'types/curves.d';

function	GaugeRowItemWithExtraData({address, value, isV2}: {address: string, value: BigNumber, isV2?: boolean}): ReactElement {
	const	{tokens, prices} = useYearn();

	const	tokenInfo = tokens?.[address];
	const	tokenPrice = prices?.[address];
	const	decimals = tokenInfo?.decimals || 18;
	const	symbol = tokenInfo?.symbol || '???';
	const	bribeAmount = format.toNormalizedValue(format.BN(value), decimals);
	const	bribeValue = bribeAmount * (Number(tokenPrice || 0) / 1000000);

	return (
		<div className={'flex h-auto flex-col items-end pt-0 md:h-16 md:pt-6'}>
			<p className={`${isV2 ? 'tooltip' : ''} inline-flex items-baseline text-base tabular-nums text-neutral-900`}>
				{`$ ${format.amount(bribeValue, 2, 2)}`}
				<span className={'absolute -right-2 text-sm text-neutral-400'}>
					{`${isV2 ? '*' : ''}`}
				</span>
				{isV2 ? (
					<span className={'tooltiptext text-xs'}>
						<p>{'This number may be off!'}</p>
						<p>{'Because of a vulnerability in the BribeV2 contract, the amount of reward may be incorrect'}</p>
					</span>
				) : null}

			</p>
			<p className={'inline-flex items-baseline text-right text-xs tabular-nums text-neutral-400'}>
				{format.amount(bribeAmount, 2, 2)}
				&nbsp;
				<span>{`${symbol}`}</span>
			</p>
		</div>
	);
}

function	GaugeRowItemAPR({address, value, isV2}: {address: string, value: BigNumber, isV2?: boolean}): ReactElement {
	const	{tokens, prices} = useYearn();

	const	crvPrice = useMemo((): number => {
		const	tokenPrice = Number(prices?.[toAddress(process.env.CRV_TOKEN_ADDRESS)] || 0);
		return tokenPrice;
	}, [prices]);

	const	tokenPrice = useMemo((): number => {
		const	tokenPrice = Number(prices?.[address] || 0);
		return tokenPrice;
	}, [address, prices]);

	const	APR = useMemo((): number => {
		const	tokenInfo = tokens?.[address];
		const	decimals = tokenInfo?.decimals || 18;
		console.log({
			pending: format.toNormalizedValue(value, decimals),
			crvPrice: crvPrice / 1000000,
			tokenPrice: tokenPrice / 1000000
		});

		if (tokenPrice === 0 || crvPrice === 0) {
			return 0;
		}
		if (isV2) {
			return format.toNormalizedValue(value, decimals) / 126144000 * tokenPrice / crvPrice * 52 * 100;
		}
		return format.toNormalizedValue(value, decimals) * tokenPrice / crvPrice * 52 * 100;
	}, [address, crvPrice, isV2, tokenPrice, tokens, value]);

	return (
		<div className={'flex h-auto flex-col items-end pt-0 md:h-16 md:pt-6'}>
			<b className={'inline-flex items-baseline whitespace-nowrap text-base tabular-nums text-neutral-900'}>
				{`${format.amount(APR, 2, 2)} %`}
			</b>
		</div>
	);
}


function	GaugeTableRow({currentGauge, category}: {currentGauge: TCurveGauges, category: string}): ReactElement {
	const	{isActive, address, provider} = useWeb3();
	const	{currentRewards, nextRewards, claimable, refresh} = useBribes();
	const	[txStatusClaim, set_txStatusClaim] = useState(defaultTxStatus);

	const	currentRewardsForCurrentGauge = useMemo((): TKeyStringBN => {
		if (category === 'v2') {
			return currentRewards?.v2?.[toAddress(currentGauge.gauge)] || {};
		}
		return currentRewards?.v3?.[toAddress(currentGauge.gauge)] || {};
	}, [currentGauge.gauge, currentRewards, category]);
	
	const	nextRewardsForCurrentGauge = useMemo((): TKeyStringBN => {
		if (category === 'v2') {
			return {};
		}
		return nextRewards?.v3?.[toAddress(currentGauge.gauge)] || {};
	}, [currentGauge.gauge, nextRewards, category]);

	const	claimableForCurrentGauge = useMemo((): TKeyStringBN => {
		if (category === 'v2') {
			return claimable?.v2?.[toAddress(currentGauge.gauge)] || {};
		}
		return claimable?.v3?.[toAddress(currentGauge.gauge)] || {};
	}, [currentGauge.gauge, claimable, category]);

	const	claimableForCurrentGaugeMap = Object.entries(claimableForCurrentGauge || {}) || [];
	const	currentRewardsForCurrentGaugeMap = Object.entries(currentRewardsForCurrentGauge || {}) || [];
	const	nextRewardsForCurrentGaugeMap = Object.entries(nextRewardsForCurrentGauge || {}) || [];
	const	hasSomethingToClaim = claimableForCurrentGaugeMap.some(([, value]: [string, BigNumber]): boolean => value.gt(0));

	function	onClaimReward(token: string): void {
		new Transaction(provider, claimReward, set_txStatusClaim).populate(
			category === 'v2' ? process.env.CURVE_BRIBE_V2_ADDRESS as string : process.env.CURVE_BRIBE_V3_ADDRESS as string,
			address,
			currentGauge.gauge,
			token
		).onSuccess(async (): Promise<void> => {
			await refresh();
		}).perform();
	}

	return (
		<div className={'grid w-full grid-cols-2 border-t border-neutral-200 px-4 pb-4 md:grid-cols-7 md:px-10'}>
			<div className={'col-span-2 mb-2 flex h-16 flex-row items-center justify-between pt-6 md:col-span-2 md:mb-0'}>
				<div className={'flex flex-row items-center space-x-2 md:space-x-6'}>
					<div className={'flex h-6 w-6 rounded-full md:flex md:h-10 md:w-10'}>
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
				<div className={'flex md:hidden'}>
					{
						currentRewardsForCurrentGaugeMap.map(([key]: [string, BigNumber]): ReactElement => (
							<div key={`claim-${key}`} className={'h-16 pt-4 md:pt-7'}>
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

			<div className={'col-span-2 grid grid-cols-10 gap-10 md:col-span-5'}>
				<div className={'col-span-2'}>
					<div
						aria-label={'current rewards'}
						className={'col-span-8 flex flex-row justify-end pt-4 md:col-span-3 md:flex-col md:justify-start md:pt-0'}>
						<div className={'flex h-auto flex-col justify-center pt-0 md:h-16 md:pt-6'}>
							<p className={'items-baseline text-end text-sm tabular-nums text-neutral-400'}>
								{'Current Period'}
							</p>
						</div>
					</div>
					<div
						aria-label={'pending rewards'}
						className={'col-span-8 flex flex-row justify-end pt-4 md:col-span-3 md:flex-col md:justify-start md:pt-0'}>
						<div className={'flex h-auto flex-col justify-center pt-0 md:h-16 md:pt-6'}>
							<p className={'items-baseline text-end text-sm tabular-nums text-neutral-400'}>
								{'Pending Period'}
							</p>
						</div>
					</div>
				</div>

				<div className={'col-span-2'}>
					<div
						aria-label={'current rewards'}
						className={'col-span-8 flex flex-row justify-between pt-4 md:col-span-3 md:flex-col md:justify-start md:pt-0'}>
						<label className={'block text-sm leading-6 text-neutral-400 md:hidden'}>{'Current Rewards'}</label>
						{
							!currentRewardsForCurrentGaugeMap || currentRewardsForCurrentGaugeMap.length === 0 ? (
								<div className={'flex h-auto flex-col items-end pt-0 md:h-16 md:pt-6'}>
									<p className={'inline-flex items-baseline text-base tabular-nums text-neutral-900'}>
										{'$ 0.00'}
									</p>
									<p className={'inline-flex items-baseline text-right text-xs tabular-nums text-neutral-400'}>
										{'-'}
									</p>
								</div>
							) : currentRewardsForCurrentGaugeMap.map(([key, value]: [string, BigNumber]): ReactElement => (
								<GaugeRowItemWithExtraData
									isV2={category === 'v2'}
									key={`rewards-${currentGauge.gauge}-${key}`}
									address={toAddress(key)}
									value={category === 'v2' ? value.div(126144000) : value} />
							))
						}
					</div>
					<div
						aria-label={'pending rewards'}
						className={'col-span-8 flex flex-row justify-between pt-4 md:col-span-3 md:flex-col md:justify-start md:pt-0'}>
						<label className={'block text-sm leading-6 text-neutral-400 md:hidden'}>{'Pending Rewards'}</label>
						{
							!nextRewardsForCurrentGaugeMap || nextRewardsForCurrentGaugeMap.length === 0 ? (
								<div className={'flex h-auto flex-col items-end pt-0 md:h-16 md:pt-6'}>
									<p className={'inline-flex items-baseline text-base tabular-nums text-neutral-900'}>
										{'$ 0.00'}
									</p>
									<p className={'inline-flex items-baseline text-right text-xs tabular-nums text-neutral-400'}>
										{'-'}
									</p>
								</div>
							) : nextRewardsForCurrentGaugeMap.map(([key, value]: [string, BigNumber]): ReactElement => (
								<GaugeRowItemWithExtraData
									isV2={category === 'v2'}
									key={`rewards-${currentGauge.gauge}-${key}`}
									address={toAddress(key)}
									value={category === 'v2' ? value.div(126144000) : value} />
							))
						}
					</div>
				</div>

				<div className={'col-span-2'}>
					<div
						aria-label={'current APR'}
						className={'col-span-8 flex flex-row justify-between pt-4 md:col-span-1 md:flex-col md:justify-start md:pt-0'}>
						<label className={'block text-sm leading-6 text-neutral-400 md:hidden'}>{'APR'}</label>
						{
							!currentRewardsForCurrentGaugeMap || currentRewardsForCurrentGaugeMap.length === 0 ? (
								<div className={'flex h-auto flex-col items-end pt-0 md:h-16 md:pt-6'}>
									<p className={'inline-flex items-baseline whitespace-nowrap text-base tabular-nums text-neutral-900'}>
										{'0.00 %'}
									</p>
								</div>
							) : currentRewardsForCurrentGaugeMap.map(([key, value]: [string, BigNumber]): ReactElement => (
								<GaugeRowItemAPR
									isV2={category === 'v2'}
									key={`apr-${currentGauge.gauge}-${key}`}
									address={toAddress(key)}
									value={value} />
							))
						}
					</div>
					<div
						aria-label={'pending APR'}
						className={'col-span-8 flex flex-row justify-between pt-4 md:col-span-1 md:flex-col md:justify-start md:pt-0'}>
						<label className={'block text-sm leading-6 text-neutral-400 md:hidden'}>{'APR'}</label>
						{
							!nextRewardsForCurrentGaugeMap || nextRewardsForCurrentGaugeMap.length === 0 ? (
								<div className={'flex h-auto flex-col items-end pt-0 md:h-16 md:pt-6'}>
									<p className={'inline-flex items-baseline whitespace-nowrap text-base tabular-nums text-neutral-900'}>
										{'0.00 %'}
									</p>
								</div>
							) : nextRewardsForCurrentGaugeMap.map(([key, value]: [string, BigNumber]): ReactElement => (
								<GaugeRowItemAPR
									key={`apr-${currentGauge.gauge}-${key}`}
									address={toAddress(key)}
									value={value} />
							))
						}
					</div>
				</div>

				<div className={'col-span-2'}>
					<div className={'col-span-8 flex flex-row justify-between md:col-span-2 md:flex-col md:justify-start'}>
						<label className={'block text-sm leading-6 text-neutral-400 md:hidden'}>{'Claimable'}</label>
						{
							!claimableForCurrentGaugeMap || claimableForCurrentGaugeMap.length === 0 ? (
								<div className={'flex h-auto flex-col items-end pt-0 md:h-16 md:pt-6'}>
									<p className={'inline-flex items-baseline text-base tabular-nums text-neutral-900'}>
										{'$ 0.00'}
									</p>
									<p className={'inline-flex items-baseline text-right text-xs tabular-nums text-neutral-400'}>
										{'-'}
									</p>
								</div>
							) : claimableForCurrentGaugeMap.map(([key, value]: [string, BigNumber]): ReactElement => (
								<GaugeRowItemWithExtraData
									key={`claimable-${currentGauge.gauge}-${key}`}
									address={toAddress(key)}
									value={value} />
							))
						}
					</div>
					<div />
				</div>

				<div className={'col-span-2'}>
					<div className={'col-span-2 hidden flex-col items-end md:flex'}>
						{
							!currentRewardsForCurrentGaugeMap || currentRewardsForCurrentGaugeMap.length === 0 ? (
								<div className={'h-16 pt-7'}>
									<Button
										className={'yearn--button-smaller w-full'}
										isBusy={txStatusClaim.pending}
										isDisabled>
										{'Claim'}
									</Button>
								</div>
							) : currentRewardsForCurrentGaugeMap.map(([key]: [string, BigNumber]): ReactElement => (
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
					<div />
				</div>
			</div>
		</div>
	);
}

export {GaugeTableRow};