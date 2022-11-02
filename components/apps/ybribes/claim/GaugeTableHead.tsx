import React, {ReactElement} from 'react';

function	GaugeTableHead(): ReactElement {
	return (
		<div className={'mb-2 hidden w-full grid-cols-7 px-10 md:grid'}>
			<p className={'col-span-2 text-start text-base text-neutral-400'}>{'Token'}</p>
			<div className={'col-span-5 grid grid-cols-10 gap-10'}>
				<p className={'col-span-2 text-end text-base text-neutral-400'}>&nbsp;</p>
				<div
					className={'group col-span-2 flex flex-row items-center justify-end space-x-1'}>
					<p className={'text-end text-base text-neutral-400'}>
						{'Rewards'}
					</p>
				</div>

				<div
					className={'group col-span-2 flex flex-row items-center justify-end space-x-1'}>
					<p className={'text-end text-base text-neutral-400'}>
						{'APR'}
					</p>
				</div>

				<div
					className={'group col-span-2 flex flex-row items-center justify-end space-x-1'}>
					<p className={'text-end text-base text-neutral-400'}>
						{'Claimable'}
					</p>
				</div>

				<p className={'col-span-2 text-end text-base text-neutral-400'}>&nbsp;</p>
			</div>
		</div>
	);
}

export {GaugeTableHead};