import { isNumber } from 'lucid-extension-sdk/core/checks';
import { DataConnectorAsynchronousAction } from 'lucid-extension-sdk/dataconnector/actions/action';
import { DataConnectorRunError } from 'lucid-extension-sdk/dataconnector/dataconnector';
import { fetchItemsByIds } from '../utils/fetchitemsbyids';
import { CollectionName, DataSourceName } from '../../../common/names';
import { codebeamerItemSchema } from '../schema/codebeamerItemSchema';
import { codebeamerItemDataToLucidFormat } from '../schema/codebeamerItemDataToLucidFormat';

export const hardRefreshAction: (
	action: DataConnectorAsynchronousAction
) => Promise<{ success: boolean }> = async (action) => {
	let itemIds: number[] = [];
	Object.keys(action.context.documentCollections).forEach((key) => {
		if (key.includes('items')) {
			itemIds = itemIds.concat(
				action.context.documentCollections?.[key]
					.map((itemId) => JSON.parse(itemId))
					.filter(isNumber)
			);
		}
	});

	if (itemIds.length == 0) {
		return { success: true };
	}

	const fullTaskData = await fetchItemsByIds(
		new Set(itemIds),
		action.context.userCredential
	);

	if (fullTaskData.length > 0) {
		const itemsToAdd = fullTaskData.map(codebeamerItemDataToLucidFormat);
		action.client.update({
			dataSourceName: DataSourceName,
			collections: {
				[CollectionName]: {
					schema: {
						fields: codebeamerItemSchema.array,
						primaryKey: codebeamerItemSchema.primaryKey.elements,
					},
					patch: {
						items: codebeamerItemSchema.fromItems(itemsToAdd),
					},
				},
			},
		});
	} else {
		throw new DataConnectorRunError(
			404,
			'Attempted sync update on async action'
		);
	}

	return { success: true };
};
