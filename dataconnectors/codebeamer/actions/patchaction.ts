import { DataConnectorPatchAction } from 'lucid-extension-sdk/dataconnector/actions/action';
import { PatchChange } from 'lucid-extension-sdk/dataconnector/actions/patchresponsebody';
import { updateCodebeamerItem } from '../utils/updatecodebeameritem';
import { DefaultFieldNames } from '../../../common/names';
import { createCodebeamerItem } from '../utils/createcodebeameritem';
import { codebeamerItemDataToLucidFormat } from '../schema/codebeamerItemDataToLucidFormat';

export const patchAction: (
	action: DataConnectorPatchAction
) => Promise<PatchChange[]> = async (action) => {
	return await Promise.all(
		action.patches.map(async (patch) => {
			const change = patch.getChange();
			await Promise.all([
				...Object.entries(patch.itemsAdded).map(
					async ([oldPrimaryKey, additions]) => {
						try {
							const itemResponse = await createCodebeamerItem(
								additions,
								action.context.userCredential
							);

							change.collections.push({
								collectionId: patch.syncCollectionId,
								itemsPatch: {
									items: new Map([
										[
											oldPrimaryKey,
											codebeamerItemDataToLucidFormat(
												itemResponse,
												additions[
													DefaultFieldNames.ProjectId
												] as number
											),
										],
									]),
									itemsDeleted: [],
								},
							});
						} catch (err) {
							change.setTooltipError(
								oldPrimaryKey,
								'Failed to create task in Codebeamer'
							);
							console.warn('Error creating item', err);
						}
					}
				),
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
						}
					}
				),
			]);
			return change;
		})
	);
};
