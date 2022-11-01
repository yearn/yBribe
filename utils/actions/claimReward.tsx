import {ethers} from 'ethers';

export async function	claimReward(
	provider: ethers.providers.Web3Provider,
	user: string,
	gauge: string,
	token: string
): Promise<boolean> {
	const	signer = provider.getSigner();

	try {
		const	contract = new ethers.Contract(
			process.env.CURVE_BRIBE_V2_ADDRESS as string,
			['function claim_reward(address, address, address)'],
			signer
		);
		const	transaction = await contract.claim_reward(user, gauge, token);
		const	transactionResult = await transaction.wait();
		if (transactionResult.status === 0) {
			console.error('Fail to perform transaction');
			return false;
		}

		return true;
	} catch(error) {
		console.error(error);
		return false;
	}
}
