import manifest from 'public/manifest.json';
import {LogoYearn} from '@common/icons/LogoYearn';
import {YBRIBE_MENU} from '@yBribe/constants/menu';

import type {ReactElement} from 'react';
import type {TMenu} from '@yearn-finance/web-lib/components/Header';
import type {TMetaFile} from './Meta';

export enum AppName {
	YBRIBE = 'yBribe'
}

type TApp = {
	name: AppName;
	href: string;
	menu: TMenu[];
	manifest: TMetaFile;
	icon: ReactElement;
	isDisabled?: boolean;
};

export const APPS: {[key in AppName]: TApp} = {
	yBribe: {
		name: AppName.YBRIBE,
		href: '/',
		menu: YBRIBE_MENU,
		manifest: manifest,
		icon: (
			<LogoYearn
				className={'h-8 w-8'}
				back={'text-neutral-900'}
				front={'text-neutral-0'}
			/>
		)
	}
};
