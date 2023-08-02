import { DataConnectorAsynchronousAction } from 'lucid-extension-sdk';
import { CodebeamerClient } from '../net/codebeamerclient';
import { getFormattedItem, itemSchema } from '../collections/itemcollections';
import { CollectionName } from '../../../common/names';

export const importAction: (
	action: DataConnectorAsynchronousAction
) => Promise<{ success: boolean }> = async (action) => {
	// action.data should pass Ids of selected items along with project & tracker id for more efficient querying
	const { projectId, trackerId, itemIds } = action.data as {
		projectId: number;
		trackerId: number;
		itemIds: number[];
	};

	const codebeamerClient = new CodebeamerClient();

	const items = await codebeamerClient.getItems(
		itemIds,
		projectId,
		trackerId
	);

	const formattedItems = items.map(getFormattedItem);

	await action.client.update({
		dataSourceName: 'codebeamer',
		collections: {
			[CollectionName]: {
				schema: {
					fields: itemSchema.array,
					primaryKey: itemSchema.primaryKey.elements,
				},
				patch: {
					items: itemSchema.fromItems(formattedItems),
				},
			},
		},
	});

	return { success: true };
};
