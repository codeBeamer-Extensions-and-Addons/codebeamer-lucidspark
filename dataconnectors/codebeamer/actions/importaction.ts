import {
	CollectionEnumFieldNames,
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
import { UserType, userSchema } from '../schema/userSchema';
import { TeamType, teamSchema } from '../schema/teamSchema';
import { StatusType, statusSchema } from '../schema/statusSchema';

export const importAction: (
	action: DataConnectorAsynchronousAction
) => Promise<{ success: boolean }> = async (action) => {
	if (!importBodyValidator(action.data)) {
		throw new DataConnectorRunError(
			404,
			'Body must be of type {itemIds: number[], trackerId: number}'
		);
	}
	const { itemIds, projectId, trackerId } = action.data;
	const { items, foundUsers, foundTeams, foundStatuses } = await getTaskData(
		itemIds,
		projectId,
		trackerId,
		action.context.userCredential
	);

	await action.client.update({
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

	return { success: true };
};

const getTaskData = async (
	itemIds: number[],
	projectId: number,
	trackerId: number,
	oAuthToken: string
) => {
	const codebeamerClient = new CodebeamerClient(oAuthToken);

	let cbqlString = getCbqlString([], '', trackerId.toString());
	cbqlString = cbqlString.concat(` AND item.id IN (${itemIds.join(', ')})`);

	const cbqlQuery: CbqlApiQuery = {
		page: DEFAULT_RESULT_PAGE,
		pageSize: DEFAULT_ITEMS_PER_PAGE,
		queryString: cbqlString,
	};
	const fullItemData = (await codebeamerClient.getItems(cbqlQuery)).items;

	const foundUsers = new Map<string, UserType>();
	const foundTeams = new Map<string, TeamType>();
	const foundStatuses = new Map<string, StatusType>();

	const items = fullItemData.map((item) => {
		const formattedItemData = codebeamerItemDataToLucidFormat(
			item,
			projectId
		);

		//decode oauthtoken and get profile picture url
		const tokenPayload = oAuthToken.split('.')[1];
		const padded = tokenPayload + '='.repeat(4 - (tokenPayload.length % 4));
		const decodedPadded = Buffer.from(padded, 'base64').toString('utf-8');
		const decodedToken = JSON.parse(decodedPadded);

		const userIconUrl = decodedToken.picture;
		const userEmail = decodedToken.email;

		if (item.assignedTo.length > 0) {
			for (const assignee of item.assignedTo) {
				foundUsers.set(JSON.stringify(assignee.id.toString()), {
					[CollectionEnumFieldNames.Id]: assignee.id.toString(),
					[CollectionEnumFieldNames.Name]: assignee.name,
					[CollectionEnumFieldNames.IconUrl]:
						// set the google profile picture as the icon url if the user is the assignee
						userEmail === assignee.email ? userIconUrl : null,
				});
			}
		}

		if (item.owners.length > 0) {
			for (const owner of item.owners) {
				foundUsers.set(JSON.stringify(owner.id.toString()), {
					[CollectionEnumFieldNames.Id]: owner.id.toString(),
					[CollectionEnumFieldNames.Name]: owner.name,
					[CollectionEnumFieldNames.IconUrl]:
						// set the google profile picture as the icon url if the user is the owner
						userEmail === owner.email ? userIconUrl : null,
				});
			}
		}

		if (item.teams.length > 0) {
			for (const team of item.teams) {
				foundTeams.set(JSON.stringify(team.id.toString()), {
					[CollectionEnumFieldNames.Id]: team.id.toString(),
					[CollectionEnumFieldNames.Name]: team.name,
				});
			}
		}

		if (item.status) {
			foundStatuses.set(JSON.stringify(item.status.id.toString()), {
				[CollectionEnumFieldNames.Id]: item.status.id.toString(),
				[CollectionEnumFieldNames.Name]: item.status.name,
			});
		}

		return formattedItemData;
	});

	return { items, foundUsers, foundTeams, foundStatuses };
};
