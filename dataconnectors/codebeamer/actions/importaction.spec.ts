import 'jasmine';
import { MockDataConnectorClient } from 'lucid-extension-sdk/dataconnector/dataconnectorclient';
import { makeDataConnector } from '..';
import {
	DataUpdateFilterType,
	DataSourceRequest,
	CollectionPatch,
} from 'lucid-extension-sdk';
import { CodebeamerClient } from '../net/codebeamerclient';
import { CbqlApiQuery } from '../../../common/models/cbqlApiQuery';
import {
	DEFAULT_ITEMS_PER_PAGE,
	DEFAULT_RESULT_PAGE,
} from '../../../common/constants/cb-import-defaults';
import { CodeBeamerItem } from '../../../common/models/codebeamer-item.if';
import {
	SchemaDefinition,
	FieldConstraintDefinition,
} from 'lucid-extension-sdk/data/schemadefinition';
import { SemanticFields } from 'lucid-extension-sdk/core/data/fieldtypedefinition/semanticfields';
import { FieldConstraintType } from 'lucid-extension-sdk/core/data/serializedfield/serializedfielddefinition';
import { ScalarFieldTypeEnum } from 'lucid-extension-sdk/core/data/fieldtypedefinition/scalarfieldtype';
import { SerializedFields } from 'lucid-extension-sdk/core/data/serializedfield/serializedfields';
import { RequestCollections, oAuthToken } from '../utils/helper.test';
import { baseUrl } from '../../../common/names';
import TrackerDetails from '../../../common/models/trackerDetails.if';

describe('import action', () => {
	it('imports a single item from id', async () => {
		const mockDataConnectorClient = new MockDataConnectorClient();
		const dataConnector = makeDataConnector(mockDataConnectorClient);

		const itemIds = [1];
		const trackerId = 1;
		const projectId = 1;

		const action = {
			name: 'Import',
			data: { itemIds, trackerId, projectId },
		};
		const cbqlString = `tracker.id IN (${trackerId}) AND item.id IN (${itemIds.join(
			', '
		)})`;
		const cbqlQuery: CbqlApiQuery = {
			page: DEFAULT_RESULT_PAGE,
			pageSize: DEFAULT_ITEMS_PER_PAGE,
			queryString: cbqlString,
		};

		spyOn(CodebeamerClient.prototype, 'getItems')
			.withArgs(cbqlQuery)
			.and.returnValue(
				Promise.resolve({
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					items: [testItem as any as CodeBeamerItem],
					page: DEFAULT_RESULT_PAGE,
					pageSize: DEFAULT_ITEMS_PER_PAGE,
					total: itemIds.length,
				})
			);

		const postedCollections = new RequestCollections()
			.items([1, structuredTestItem])
			.users(['1', structuredTestUser])
			.statuses(['1', structuredStatus]).collectionPatches;
		mockDataConnectorClient.dataSourceClient.gotUpdate =
			successUpdateFunctionForWithExpectedRequest(postedCollections);

		const result = await dataConnector.runAction(
			'',
			{ 'x-lucid-signature': '', 'x-lucid-rsa-nonce': '' },
			{
				action,
				userCredential: oAuthToken,
				dataConnectorName: 'codebeamer',
				packageId: 'some package id',
				packageVersion: '2.2.2',
				documentCollections: {},
				updateFilterType: DataUpdateFilterType.AllUpdates,
				documentUpdateToken: 'DocumentUpdateToken',
			}
		);

		expect(result).toEqual({ status: 200, body: { success: true } });
		expect(CodebeamerClient.prototype.getItems).toHaveBeenCalledWith(
			cbqlQuery
		);
	});

	it('hard refresh checks tracked ids', async () => {
		const mockDataConnectorClient = new MockDataConnectorClient();
		const dataConnector = makeDataConnector(mockDataConnectorClient);

		const action = { name: 'HardRefresh', data: null };
		const documentCollections = { items: [`${testItem.id}`] };

		const postedCollections = new RequestCollections()
			.items([1, structuredTestItem])
			.users(['1', structuredTestUser])
			.statuses(['1', structuredStatus]).collectionPatches;
		mockDataConnectorClient.dataSourceClient.gotUpdate =
			successUpdateFunctionForWithExpectedRequest(postedCollections);

		spyOn(CodebeamerClient.prototype, 'getItem')
			.withArgs(testItem.id)
			.and.returnValue(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				Promise.resolve(testItem as any as CodeBeamerItem)
			);

		spyOn(CodebeamerClient.prototype, 'getTracker')
			.withArgs(testItem.tracker.id)
			.and.returnValue(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				Promise.resolve(testTracker as any as TrackerDetails)
			);

		const result = await dataConnector.runAction(
			'',
			{ 'x-lucid-signature': '', 'x-lucid-rsa-nonce': '' },
			{
				action,
				userCredential: oAuthToken,
				dataConnectorName: 'codebeamer',
				packageId: 'some package id',
				packageVersion: '2.2.2',
				documentCollections: documentCollections,
				updateFilterType: DataUpdateFilterType.AllUpdates,
				documentUpdateToken: 'DocumentUpdateToken',
			}
		);

		expect(result).toEqual({ status: 200, body: { success: true } });
		expect(CodebeamerClient.prototype.getItem).toHaveBeenCalledWith(
			testItem.id
		);
	});
});

const testItem = {
	assignedTo: [
		{
			email: 'test@test.test',
			id: 1,
			name: 'Test User',
		},
	],
	customFields: [],
	description: 'Test Description',
	descriptionFormat: 'Wiki',
	id: 1,
	name: 'Test Item 1',
	owners: [
		{
			email: 'test@test.test',
			id: 1,
			name: 'Test User',
		},
	],
	status: {
		id: 1,
		name: 'Test Status',
		type: 'Test Type',
	},

	storyPoints: 5,
	teams: [],
	tracker: {
		id: 1,
		name: 'Test Tracker',
	},
	version: 1,
};

const testTracker = {
	color: '#007AC2',
	id: 1,
	keyName: 'testKey',
	name: 'Test Tracker',
	project: {
		id: 1,
		name: 'Test Project',
	},
};

const structuredTestItem = {
	Id: 1,
	Summary: 'Test Item 1',
	Description: 'Test Description',
	'Assigned To': '1',
	Link: `${baseUrl}/item/1`,
	'Project Id': 1,
	'Tracker Id': 1,
	Team: null,
	'Story Points': 5,
	Version: 1,
	Status: '1',
	Owner: '1',
};

const structuredTestUser = {
	id: '1',
	name: 'Test User',
	iconUrl: null,
};

const structuredStatus = {
	id: '1',
	name: 'Test Status',
};

const successUpdateFunctionForWithExpectedRequest = (
	collections: Record<string, CollectionPatch>
) => {
	return (request: DataSourceRequest) => {
		expect(request.dataSourceName).toEqual('codebeamer');
		expect(request.collections).toEqual(collections);
		return { data: { success: true }, status: 200 };
	};
};
