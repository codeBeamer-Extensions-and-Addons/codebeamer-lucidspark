import { DataConnectorPatchAction } from 'lucid-extension-sdk/dataconnector/actions/action';
import { PatchChange } from 'lucid-extension-sdk/dataconnector/actions/patchresponsebody';
import { updateCodebeamerItem } from '../utils/updatecodebeameritem';

export const patchAction: (
	action: DataConnectorPatchAction
) => Promise<PatchChange[]> = async (action) => {
	console.log('patch action', action);
	return await Promise.all(
		action.patches.map(async (patch) => {
			const change = patch.getChange();
			await Promise.all([
				...Object.entries(patch.itemsChanged).map(
					async ([primaryKey, additions]) => {
						try {
							const itemId = JSON.parse(primaryKey) as number;
							await updateCodebeamerItem(
								itemId,
								additions,
								action.context.userCredential
							);
						} catch (err) {
							change.setTooltipError(
								primaryKey,
								'Failed to update item in Codebeamer'
							);
							console.warn('error patching', err);
						}
					}
				),
			]);
			return change;
		})
	);
};
