import React, {ReactElement, ReactNode, useMemo, useState} from 'react';
import {Button} from '@yearn-finance/web-lib/components';
import {GaugeTableEmpty} from 'components/apps/ybribes/bribe/GaugeTableEmpty';
import {GaugeTableHead} from 'components/apps/ybribes/bribe/GaugeTableHead';
import {GaugeTableRow} from 'components/apps/ybribes/bribe/GaugeTableRow';
import Wrapper from 'components/apps/ybribes/Wrapper';
import {useCurve} from 'contexts/useCurve';
import {TCurveGauges} from 'types/curves.d';

function	GaugeList(): ReactElement {
	const	{gauges} = useCurve();
	const	[category, set_category] = useState('all');

	const	filteredGauges = useMemo((): TCurveGauges[] => {
		if (category === 'factory') {
			return gauges.filter((gauge): boolean => gauge.factory);
		}
		return gauges.filter((gauge): boolean => !gauge.factory);
	}, [category, gauges]);

	const	sortedGauges = useMemo((): TCurveGauges[] => {
		const	gaugesToSort = [...filteredGauges];
		return gaugesToSort;
	}, [filteredGauges]);
	
	return (
		<section className={'mt-4 mb-20 grid w-full grid-cols-12 pb-10 md:mb-40 md:mt-20'}>
			<div className={'col-span-12 flex w-full flex-col bg-neutral-100'}>
				<div className={'flex flex-row items-center justify-between px-4 pt-4 pb-2 md:px-10 md:pt-10 md:pb-8'}>
					<div>
						<h2 className={'text-lg font-bold md:text-3xl'}>
							{'Offer Bribe'}
						</h2>
					</div>
					<div className={'flex flex-row space-x-4'}>
						<Button
							onClick={(): void => set_category('all')}
							variant={category === 'all' ? 'filled' : 'outlined'}
							className={'yearn--button-smaller'}>
							{'All'}
						</Button>
						<Button
							onClick={(): void => set_category('factory')}
							variant={category === 'factory' ? 'filled' : 'outlined'}
							className={'yearn--button-smaller'}>
							{'Factory'}
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

function	OfferBribe(): ReactElement {
	return (
		<>
			<div className={'mt-8 mb-10 w-full max-w-6xl text-center'}>
				<b className={'text-center text-lg md:text-2xl'}>{'Buy votes to boost emissions.'}</b>
				<p className={'mt-8 whitespace-pre-line text-center text-base text-neutral-600'}>
					{'Offer a bribe to increase CRV emissions to your favorite Curve pool.\nJust like democracy, minus the suit and expense account.'}
				</p>
			</div>
			<GaugeList />
		</>
	);
}


OfferBribe.getLayout = function getLayout(page: ReactElement): ReactElement {
	return <Wrapper>{page}</Wrapper>;
};

export default OfferBribe;
