import React, {ReactElement} from 'react';

function	GaugeTableHead(): ReactElement {
	return (
		<div className={'mb-2 hidden w-full grid-cols-6 px-10 md:grid'}>
			<p className={'col-span-2 text-start text-base text-neutral-400'}>{'Token'}</p>
			<div className={'col-span-4 grid grid-cols-8'}>
				<div
					className={'group col-span-2 flex flex-row items-center justify-end space-x-1'}>
					<p className={'text-end text-base text-neutral-400'}>
						{'Relative Weight'}
					</p>
				</div>

				<div
					className={'group col-span-2 flex flex-row items-center justify-end space-x-1'}>
					<p className={'text-end text-base text-neutral-400'}>
						{'Type'}
					</p>
				</div>

				<div
					className={'group col-span-3 flex flex-row items-center justify-end space-x-1 pr-16'}>
					<p className={'text-end text-base text-neutral-400'}>
						{'Current Bribes'}
					</p>
				</div>

				<p className={'col-span-1 text-end text-base text-neutral-400'}>&nbsp;</p>
			</div>
		</div>
	);
}

export {GaugeTableHead};