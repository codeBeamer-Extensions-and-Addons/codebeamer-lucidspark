import { isNumber } from 'lucid-extension-sdk/core/checks';
import { DataConnectorAsynchronousAction } from 'lucid-extension-sdk/dataconnector/actions/action';
import { DataConnectorRunError } from 'lucid-extension-sdk/dataconnector/dataconnector';
import { fetchItemsByIds } from '../utils/fetchitemsbyids';
import { CollectionName, DataSourceName } from '../../../common/names';
import { codebeamerItemSchema } from '../schema/codebeamerItemSchema';
import { getCollectionsData } from './importaction';
import { userSchema } from '../schema/userSchema';
import { teamSchema } from '../schema/teamSchema';
import { statusSchema } from '../schema/statusSchema';

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

	const fullItemData = await fetchItemsByIds(
		new Set(itemIds),
		action.context.userCredential
	);

	const { items, foundUsers, foundTeams, foundStatuses } = getCollectionsData(
		fullItemData,
		action.context.userCredential
	);

	if (fullItemData.length > 0) {
		action.client.update({
			dataSourceName: DataSourceName,
			collections: {
				[CollectionName]: {
					schema: {
						fields: codebeamerItemSchema.array,
						primaryKey: codebeamerItemSchema.primaryKey.elements,
					},
					patch: {
						items: codebeamerItemSchema.fromItems(items),
					},
				},
				users: {
					schema: {
						fields: userSchema.array,
						primaryKey: userSchema.primaryKey.elements,
					},
					patch: {
						items: userSchema.fromItems([...foundUsers.values()]),
					},
				},
				teams: {
					schema: {
						fields: teamSchema.array,
						primaryKey: teamSchema.primaryKey.elements,
					},
					patch: {
						items: teamSchema.fromItems([...foundTeams.values()]),
					},
				},
				statuses: {
					schema: {
						fields: statusSchema.array,
						primaryKey: statusSchema.primaryKey.elements,
					},
					patch: {
						items: statusSchema.fromItems([...foundStatuses.values()]),
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
