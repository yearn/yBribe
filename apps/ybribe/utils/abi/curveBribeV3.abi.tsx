export const CURVE_BRIBE_V3_ABI = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'user',
				type: 'address'
			}
		],
		name: 'Blacklisted',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'address',
				name: 'owner',
				type: 'address'
			}
		],
		name: 'ChangeOwner',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'user',
				type: 'address'
			},
			{
				indexed: false,
				internalType: 'address',
				name: 'recipient',
				type: 'address'
			}
		],
		name: 'ClearRewardRecipient',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'uint256',
				name: 'fee',
				type: 'uint256'
			}
		],
		name: 'FeeUpdated',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'gauge',
				type: 'address'
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'reward_token',
				type: 'address'
			}
		],
		name: 'NewTokenReward',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'gauge',
				type: 'address'
			},
			{
				indexed: true,
				internalType: 'uint256',
				name: 'period',
				type: 'uint256'
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'bias',
				type: 'uint256'
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'blacklisted_bias',
				type: 'uint256'
			}
		],
		name: 'PeriodUpdated',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'user',
				type: 'address'
			}
		],
		name: 'RemovedFromBlacklist',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'briber',
				type: 'address'
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'gauge',
				type: 'address'
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'reward_token',
				type: 'address'
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256'
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'fee',
				type: 'uint256'
			}
		],
		name: 'RewardAdded',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'user',
				type: 'address'
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'gauge',
				type: 'address'
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'reward_token',
				type: 'address'
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256'
			}
		],
		name: 'RewardClaimed',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'user',
				type: 'address'
			},
			{
				indexed: false,
				internalType: 'address',
				name: 'recipient',
				type: 'address'
			}
		],
		name: 'SetRewardRecipient',
		type: 'event'
	},
	{
		inputs: [
			{internalType: 'address', name: '', type: 'address'},
			{internalType: 'uint256', name: '', type: 'uint256'}
		],
		name: '_gauges_per_reward',
		outputs: [{internalType: 'address', name: '', type: 'address'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{internalType: 'address', name: '', type: 'address'},
			{internalType: 'address', name: '', type: 'address'}
		],
		name: '_rewards_in_gauge',
		outputs: [{internalType: 'bool', name: '', type: 'bool'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{internalType: 'address', name: '', type: 'address'},
			{internalType: 'uint256', name: '', type: 'uint256'}
		],
		name: '_rewards_per_gauge',
		outputs: [{internalType: 'address', name: '', type: 'address'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'accept_owner',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{internalType: 'address', name: '', type: 'address'},
			{internalType: 'address', name: '', type: 'address'}
		],
		name: 'active_period',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{internalType: 'address', name: 'gauge', type: 'address'},
			{internalType: 'address', name: 'reward_token', type: 'address'},
			{internalType: 'uint256', name: 'amount', type: 'uint256'}
		],
		name: 'add_reward_amount',
		outputs: [{internalType: 'bool', name: '', type: 'bool'}],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [{internalType: 'address', name: '_user', type: 'address'}],
		name: 'add_to_blacklist',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{internalType: 'address', name: 'gauge', type: 'address'},
			{internalType: 'address', name: 'reward_token', type: 'address'}
		],
		name: 'claim_reward',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{internalType: 'address', name: 'user', type: 'address'},
			{internalType: 'address', name: 'gauge', type: 'address'},
			{internalType: 'address', name: 'reward_token', type: 'address'}
		],
		name: 'claim_reward_for',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{internalType: 'address[]', name: '_users', type: 'address[]'},
			{internalType: 'address[]', name: '_gauges', type: 'address[]'},
			{
				internalType: 'address[]',
				name: '_reward_tokens',
				type: 'address[]'
			}
		],
		name: 'claim_reward_for_many',
		outputs: [{internalType: 'uint256[]', name: 'amounts', type: 'uint256[]'}],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{internalType: 'address', name: 'user', type: 'address'},
			{internalType: 'address', name: 'gauge', type: 'address'},
			{internalType: 'address', name: 'reward_token', type: 'address'}
		],
		name: 'claimable',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{internalType: 'address', name: '', type: 'address'},
			{internalType: 'address', name: '', type: 'address'}
		],
		name: 'claims_per_gauge',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'clear_recipient',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [],
		name: 'current_period',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'fee_percent',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'fee_recipient',
		outputs: [{internalType: 'address', name: '', type: 'address'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [{internalType: 'address', name: 'reward', type: 'address'}],
		name: 'gauges_per_reward',
		outputs: [{internalType: 'address[]', name: '', type: 'address[]'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'get_blacklist',
		outputs: [{internalType: 'address[]', name: '_blacklist', type: 'address[]'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [{internalType: 'address', name: 'gauge', type: 'address'}],
		name: 'get_blacklisted_bias',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'address_to_check',
				type: 'address'
			}
		],
		name: 'is_blacklisted',
		outputs: [{internalType: 'bool', name: '', type: 'bool'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{internalType: 'address', name: '', type: 'address'},
			{internalType: 'address', name: '', type: 'address'},
			{internalType: 'address', name: '', type: 'address'}
		],
		name: 'last_user_claim',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [{internalType: 'address', name: '', type: 'address'}],
		name: 'next_claim_time',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'owner',
		outputs: [{internalType: 'address', name: '', type: 'address'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'pending_owner',
		outputs: [{internalType: 'address', name: '', type: 'address'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [{internalType: 'address', name: '_user', type: 'address'}],
		name: 'remove_from_blacklist',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{internalType: 'address', name: '', type: 'address'},
			{internalType: 'address', name: '', type: 'address'}
		],
		name: 'reward_per_gauge',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{internalType: 'address', name: '', type: 'address'},
			{internalType: 'address', name: '', type: 'address'}
		],
		name: 'reward_per_token',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [{internalType: 'address', name: '', type: 'address'}],
		name: 'reward_recipient',
		outputs: [{internalType: 'address', name: '', type: 'address'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [{internalType: 'address', name: 'gauge', type: 'address'}],
		name: 'rewards_per_gauge',
		outputs: [{internalType: 'address[]', name: '', type: 'address[]'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [{internalType: 'uint256', name: '_percent', type: 'uint256'}],
		name: 'set_fee_percent',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [{internalType: 'address', name: '_recipient', type: 'address'}],
		name: 'set_fee_recipient',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [{internalType: 'address', name: '_new_owner', type: 'address'}],
		name: 'set_owner',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [{internalType: 'address', name: '_recipient', type: 'address'}],
		name: 'set_recipient',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	}
] as const;
