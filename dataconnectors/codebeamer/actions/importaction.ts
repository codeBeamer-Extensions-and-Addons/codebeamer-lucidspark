import {
	DataConnectorAsynchronousAction,
	DataConnectorRunError,
} from 'lucid-extension-sdk';
import { CollectionName, DataSourceName } from '../../../common/names';
import { codebeamerItemSchema } from '../schema/codebeamerItemSchema';
import { codebeamerItemDataToLucidFormat } from '../schema/codebeamerItemDataToLucidFormat';
import { CodebeamerClient } from '../net/codebeamerclient';
import getCbqlString from '../../../common/util/updateCbqlString';
import { CbqlApiQuery } from '../../../common/models/cbqlApiQuery';
import {
	DEFAULT_RESULT_PAGE,
	DEFAULT_ITEMS_PER_PAGE,
} from '../../../common/constants/cb-import-defaults';
import { importBodyValidator } from '../utils/validators';

export const importAction: (
	action: DataConnectorAsynchronousAction
) => Promise<{ success: boolean }> = async (action) => {
	if (!importBodyValidator(action.data)) {
		throw new DataConnectorRunError(
			404,
<<<<<<< Updated upstream
			'Body must be of type {itemIds: number[], trackerId: string}'
=======
			'Body must be of type {itemIds: number[], trackerId: number}'
>>>>>>> Stashed changes
		);
	}
	const { itemIds, trackerId } = action.data;
	const itemsToAdd = await getTaskData(
		itemIds,
		trackerId,
		action.context.userCredential
	);

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

	return { success: true };
};

const getTaskData = async (
	itemIds: number[],
<<<<<<< Updated upstream
	trackerId: string,
=======
	trackerId: number,
>>>>>>> Stashed changes
	oAuthToken: string
) => {
	const codebeamerClient = new CodebeamerClient(oAuthToken);

<<<<<<< Updated upstream
	let cbqlString = getCbqlString([], '', trackerId);
=======
	let cbqlString = getCbqlString([], '', trackerId.toString());
>>>>>>> Stashed changes
	cbqlString = cbqlString.concat(` AND item.id IN (${itemIds.join(', ')})`);

	const cbqlQuery: CbqlApiQuery = {
		page: DEFAULT_RESULT_PAGE,
		pageSize: DEFAULT_ITEMS_PER_PAGE,
		queryString: cbqlString,
	};
	const fullTaskData = (await codebeamerClient.getItems(cbqlQuery)).items;
	const formattedTaskData = fullTaskData.map(codebeamerItemDataToLucidFormat);
	return formattedTaskData;
};
