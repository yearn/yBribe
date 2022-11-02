import React, {cloneElement, Fragment, ReactElement, useRef} from 'react';
import {Menu, Transition} from '@headlessui/react';
import IconChevron from 'components/icons/IconChevron';
import {TCurveGauges} from 'types/curves.d';

export type	TOptionValue = {
	name: string
	tokenAddress: string
	poolAddress: string
	gaugeAddress: string
}

export type TDropdownGaugeOption = {
	icon?: ReactElement;
	label: string;
	value: TCurveGauges | any;
};

export type TDropdownGaugesProps = {
	options: TDropdownGaugeOption[];
	defaultOption: TDropdownGaugeOption;
	selected: TDropdownGaugeOption;
	placeholder?: string;
	onSelect:
		| React.Dispatch<React.SetStateAction<TDropdownGaugeOption>>
		| ((option: TDropdownGaugeOption) => void);
};

function DropdownGauges({options, defaultOption, selected, onSelect, placeholder = ''}: TDropdownGaugesProps): ReactElement {
	const buttonRef = useRef<HTMLButtonElement>(null);
	return (
		<div>
			<Menu as={'menu'} className={'relative inline-block w-full text-left'}>
				{({open}): ReactElement => (
					<>
						<Menu.Button
							ref={buttonRef}
							className={'md: flex h-10 w-full items-center justify-between bg-neutral-0 p-2 px-3 text-base text-neutral-900'}>
							<div className={'relative flex flex-row items-center'}>
								<div className={'h-4 w-4 rounded-full md:h-6 md:w-6'}>
									{selected?.icon ? cloneElement(selected.icon) : <div className={'h-4 w-4 rounded-full bg-neutral-500 md:h-6 md:w-6'} />}
								</div>
								<p className={`pl-2 ${(!selected?.label && !defaultOption?.label) ? 'text-neutral-400' : 'text-neutral-900'} max-w-[75%] overflow-x-hidden text-ellipsis whitespace-nowrap font-normal scrollbar-none md:max-w-full`}>
									{selected?.label || defaultOption?.label || placeholder}
								</p>
							</div>
							<div className={'absolute right-2 md:right-3'}>
								<IconChevron className={`h-4 w-4 transition-transform md:h-6 md:w-6 ${open ? '-rotate-180' : 'rotate-0'}`} />
							</div>
						</Menu.Button>
						<Transition
							as={Fragment}
							show={open}
							enter={'transition duration-100 ease-out'}
							enterFrom={'transform scale-95 opacity-0'}
							enterTo={'transform scale-100 opacity-100'}
							leave={'transition duration-75 ease-out'}
							leaveFrom={'transform scale-100 opacity-100'}
							leaveTo={'transform scale-95 opacity-0'}>
							<Menu.Items className={'yveCRV--dropdown-menu'}>
								{options.map((option, index): ReactElement => (
									<Menu.Item key={option?.label || index}>
										{({active}): ReactElement => (
											<div
												onClick={(): void => {
													onSelect(option);
													setTimeout((): void => buttonRef.current?.click(), 0);
												}}
												data-active={active}
												className={'yveCRV--dropdown-menu-item'}>
												{option?.icon ? cloneElement(option.icon) : null}
												<p className={`${option.icon ? 'pl-2' : 'pl-0'} font-normal text-neutral-900`}>
													{option.label}
												</p>
											</div>
										)}
									</Menu.Item>
								))}
							</Menu.Items>
						</Transition>
					</>
				)}
			</Menu>
		</div>
	);
}

export {DropdownGauges};