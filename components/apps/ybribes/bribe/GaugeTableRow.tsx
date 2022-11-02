import React, {ReactElement, useMemo, useState} from 'react';
import Image from 'next/image';
import {BigNumber, ethers} from 'ethers';
import {Button, Modal} from '@yearn-finance/web-lib/components';
import {format, toAddress} from '@yearn-finance/web-lib/utils';
import {GaugeBribeModal} from 'components/apps/ybribes/bribe/GaugeBribeModal';
import {useBribes} from 'contexts/useBribes';
import {useYearn} from 'contexts/useYearn';

import type {TCurveGauges, TKeyStringBN} from 'types/curves.d';

function	GaugeRowItemWithExtraData({address, value}: {address: string, value: BigNumber}): ReactElement {
	const	{tokens, prices} = useYearn();

	const	tokenInfo = tokens?.[address];
	const	tokenPrice = prices?.[address];
	const	decimals = tokenInfo?.decimals || 18;
	const	symbol = tokenInfo?.symbol || '???';
	const	bribeAmount = format.toNormalizedValue(format.BN(value), decimals);
	const	bribeValue = bribeAmount * (Number(tokenPrice || 0) / 1000000);

	return (
		<div className={'flex h-auto flex-col items-end pt-0 md:h-16 md:pt-6'}>
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

function	GaugeTableRow({currentGauge}: {currentGauge: TCurveGauges}): ReactElement {
	const	{currentRewards, nextRewards} = useBribes();
	const	[hasModal, set_hasModal] = useState(false);

	const	currentRewardsForCurrentGauge = useMemo((): TKeyStringBN => {
		return currentRewards?.v3?.[toAddress(currentGauge.gauge)] || {};
	}, [currentGauge.gauge, currentRewards]);
	
	const	nextRewardsForCurrentGauge = useMemo((): TKeyStringBN => {
		return nextRewards?.v3?.[toAddress(currentGauge.gauge)] || {};
	}, [currentGauge.gauge, nextRewards]);

	const	gaugeRelativeWeight = useMemo((): number => {
		return format.toNormalizedValue(format.BN(String(currentGauge?.gauge_controller?.gauge_relative_weight) || ethers.constants.Zero), 18);
	}, [currentGauge]);

	const	currentRewardsForCurrentGaugeMap = Object.entries(currentRewardsForCurrentGauge || {}) || [];
	const	nextRewardsForCurrentGaugeMap = Object.entries(nextRewardsForCurrentGauge || {}) || [];

	return (
		<div className={'grid w-full grid-cols-2 border-t border-neutral-200 px-4 pb-6 md:grid-cols-7 md:border-none md:px-10'}>
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
					<div className={'h-16 pt-4 md:pt-7'}>
						<Button
							className={'yearn--button-smaller w-full'}
							onClick={(): void => set_hasModal(true)}>
							{'Bribe'}
						</Button>
					</div>
				</div>
			</div>

			<div className={'col-span-2 grid grid-cols-10 gap-10 md:col-span-5'}>

				<div className={'col-span-8 flex h-16 flex-row justify-between pt-6 md:col-span-2 md:justify-end'}>
					<label className={'block text-sm leading-6 text-neutral-400 md:hidden'}>{'Weight'}</label>
					<p className={'text-end text-base tabular-nums text-neutral-900'}>
						{`${format.amount(gaugeRelativeWeight * 100, 2, 2)}%`}
					</p>
				</div>

				<div className={'col-span-8 flex flex-row justify-between pr-0 pt-4 md:col-span-3 md:flex-col md:justify-start md:pt-0 md:pr-0'}>
					<label className={'block text-sm leading-6 text-neutral-400 md:hidden'}>{'Current Bribes'}</label>
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
								key={`rewards-${currentGauge.gauge}-${key}`}
								address={toAddress(key)}
								value={value} />
						))
					}
				</div>

				<div className={'col-span-8 flex flex-row justify-between pr-0 pt-4 md:col-span-3 md:flex-col md:justify-start md:pt-0 md:pr-0'}>
					<label className={'block text-sm leading-6 text-neutral-400 md:hidden'}>{'Current Bribes'}</label>
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
								key={`rewards-${currentGauge.gauge}-${key}`}
								address={toAddress(key)}
								value={value} />
						))
					}
				</div>

				<div className={'col-span-2 hidden flex-col items-end md:flex'}>
					<div className={'h-16 pt-7'}>
						<Button
							className={'yearn--button-smaller w-full'}
							onClick={(): void => set_hasModal(true)}>
							{'Bribe'}
						</Button>
					</div>
				</div>
			</div>

			<Modal
				className={'yearn--modal-bigger'}
				isOpen={hasModal}
				onClose={(): void => set_hasModal(false)}>
				<GaugeBribeModal
					currentGauge={currentGauge}
					onClose={(): void => set_hasModal(false)} />
			</Modal>
		</div>
	);
}

export {GaugeTableRow};
