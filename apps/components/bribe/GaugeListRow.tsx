import {useMemo, useState} from 'react';
import {GaugeBribeModal} from 'apps/components/bribe/GaugeBribeModal';
import {useBribes} from 'apps/useBribes';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {Modal} from '@yearn-finance/web-lib/components/Modal';
import {Renderable} from '@yearn-finance/web-lib/components/Renderable';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {formatToNormalizedValue, toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount, formatPercent, formatUSD} from '@yearn-finance/web-lib/utils/format.number';
import {ImageWithFallback} from '@common/components/ImageWithFallback';
import {useTokenInfo} from '@common/hooks/useTokenInfo';

import type {ReactElement} from 'react';
import type {TAddress, TDict} from '@yearn-finance/web-lib/types';
import type {TCurveGauge} from '@yearn-finance/web-lib/utils/schemas/curveSchemas';

function GaugeRowItemWithExtraData({address, value}: {address: TAddress; value: bigint}): ReactElement {
	const token = useTokenInfo(address);
	const bribeAmount = formatToNormalizedValue(toBigInt(value), token.decimals);
	const bribeValue = bribeAmount * Number(token.price || 0);

	return (
		<div className={'flex h-auto flex-col items-end pt-0 md:h-14'}>
			<p className={'yearn--table-data-section-item-value'}>{formatUSD(bribeValue, 5, 5)}</p>
			<p className={'font-number inline-flex items-baseline text-right text-xs text-neutral-400'}>
				{formatAmount(bribeAmount, 5, 5)}
				&nbsp;
				<span>{`${token.symbol}`}</span>
			</p>
		</div>
	);
}

export function GaugeListRow({currentGauge}: {currentGauge: TCurveGauge}): ReactElement {
	const {isActive} = useWeb3();
	const {currentRewards, nextRewards} = useBribes();
	const [hasModal, set_hasModal] = useState(false);

	const currentRewardsForCurrentGauge = useMemo((): TDict<bigint> => {
		return currentRewards?.[currentGauge.gauge] || {};
	}, [currentGauge.gauge, currentRewards]);

	const nextRewardsForCurrentGauge = useMemo((): TDict<bigint> => {
		return nextRewards?.[currentGauge.gauge] || {};
	}, [currentGauge.gauge, nextRewards]);

	const gaugeRelativeWeight = useMemo((): number => {
		return formatToNormalizedValue(toBigInt(currentGauge?.gauge_controller?.gauge_relative_weight), 18);
	}, [currentGauge]);

	const currentRewardsForCurrentGaugeMap = Object.entries(currentRewardsForCurrentGauge || {}) || [];
	const nextRewardsForCurrentGaugeMap = Object.entries(nextRewardsForCurrentGauge || {}) || [];

	function renderDefaultValueUSDFallback(): ReactElement {
		return (
			<div className={'flex h-auto flex-col items-end pt-0 md:h-14'}>
				<p className={'yearn--table-data-section-item-value'}>{formatUSD(0, 5, 5)}</p>
				<p className={'font-number inline-flex items-baseline text-right text-xs text-neutral-400'}>{'-'}</p>
			</div>
		);
	}

	return (
		<div
			className={
				'yearn--table-wrapper !col-span-12 cursor-pointer !grid-cols-12 transition-colors hover:bg-neutral-300'
			}>
			<div className={'yearn--table-token-section col-span-4'}>
				<div className={'yearn--table-token-section-item'}>
					<div className={'yearn--table-token-section-item-image'}>
						<ImageWithFallback
							alt={''}
							width={32}
							height={32}
							src={`${process.env.BASE_YEARN_ASSETS_URI}/1/${currentGauge.swap_token}/logo-32.png`}
						/>
					</div>
					<p>{currentGauge.name}</p>
				</div>
				<div className={'flex md:hidden'}>
					<div className={'h-16 pt-4 md:pt-7'}>
						<Button
							className={'yearn--button-smaller w-full'}
							isDisabled={!isActive}
							onClick={(): void => set_hasModal(true)}>
							{'Bribe'}
						</Button>
					</div>
				</div>
			</div>

			<div className={'yearn--table-data-section col-span-8'}>
				<div
					className={'yearn--table-data-section-item md:col-span-3'}
					datatype={'number'}>
					<p className={'yearn--table-data-section-item-label'}>{'Weight'}</p>
					<p className={'yearn--table-data-section-item-value'}>{formatPercent(gaugeRelativeWeight * 100)}</p>
				</div>

				<div
					className={'yearn--table-data-section-item md:col-span-2'}
					datatype={'number'}>
					<p className={'yearn--table-data-section-item-label'}>{'Current Bribes'}</p>
					<Renderable
						shouldRender={!!currentRewardsForCurrentGaugeMap && currentRewardsForCurrentGaugeMap.length > 0}
						fallback={renderDefaultValueUSDFallback()}>
						{currentRewardsForCurrentGaugeMap.map(
							([key, value]: [string, bigint]): ReactElement => (
								<GaugeRowItemWithExtraData
									key={`rewards-${currentGauge.gauge}-${key}`}
									address={toAddress(key)}
									value={value}
								/>
							)
						)}
					</Renderable>
				</div>

				<div
					className={'yearn--table-data-section-item md:col-span-2'}
					datatype={'number'}>
					<p className={'yearn--table-data-section-item-label'}>{'Pending Bribes'}</p>
					<Renderable
						shouldRender={!!nextRewardsForCurrentGaugeMap && nextRewardsForCurrentGaugeMap.length > 0}
						fallback={renderDefaultValueUSDFallback()}>
						{nextRewardsForCurrentGaugeMap.map(
							([key, value]: [string, bigint]): ReactElement => (
								<GaugeRowItemWithExtraData
									key={`rewards-${currentGauge.gauge}-${key}`}
									address={toAddress(key)}
									value={value}
								/>
							)
						)}
					</Renderable>
				</div>

				<div
					className={'yearn--table-data-section-item md:col-span-1'}
					datatype={'number'}>
					<div className={'h-14 pt-0'}>
						<Button
							className={'yearn--button-smaller w-full'}
							isDisabled={!isActive}
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
					onClose={(): void => set_hasModal(false)}
				/>
			</Modal>
		</div>
	);
}