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

describe('import action', () => {
	it('imports a single item from id', async () => {
		const mockDataConnectorClient = new MockDataConnectorClient();
		const dataConnector = makeDataConnector(mockDataConnectorClient);

		const trackerId = 1;
		const itemIds = [1];
		const action = { name: 'Import', data: { itemIds, trackerId } };
		const oAuthToken = 'test token';
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

		const postedCollections = new RequestCollections().codebeamerItems([
			'1',
			{ Id: 1, Name: 'Test Item 1' },
		]).collectionPatches;
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
		const oAuthToken = 'test token';
		const itemId = 1;
		const documentCollections = { items: [`${itemId}`] };

		const postedCollections = new RequestCollections().codebeamerItems([
			'1',
			{ Id: 1, Name: 'Test Item 1' },
		]).collectionPatches;
		mockDataConnectorClient.dataSourceClient.gotUpdate =
			successUpdateFunctionForWithExpectedRequest(postedCollections);

		spyOn(CodebeamerClient.prototype, 'getItem')
			.withArgs(itemId)
			.and.returnValue(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				Promise.resolve(testItem as any as CodeBeamerItem)
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
		expect(CodebeamerClient.prototype.getItem).toHaveBeenCalledWith(itemId);
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
	status: [
		{
			id: 1,
			name: 'Test Status',
			type: 'Test Type',
		},
	],
	storyPoints: 5,
	tracker: {
		id: 1,
		name: 'Test Tracker',
	},
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

const lockedFieldConstraint: FieldConstraintDefinition = {
	type: FieldConstraintType.LOCKED,
};
const itemSchema: SchemaDefinition = {
	fields: [
		{
			name: 'Id',
			type: ScalarFieldTypeEnum.NUMBER,
			constraints: [lockedFieldConstraint],
			mapping: undefined,
		},
		{
			name: 'Name',
			type: ScalarFieldTypeEnum.STRING,
			constraints: undefined,
			mapping: [SemanticFields.Title],
		},
	],
	primaryKey: ['Id'],
};

class RequestCollections {
	public collectionPatches: Record<string, CollectionPatch> = {
		items: {
			patch: { items: new Map() },
			schema: itemSchema,
		},
	};
	public items(
		collection: string,
		...primaryKeysAndItems: [string, SerializedFields][]
	): RequestCollections {
		for (const [pk, serializedFields] of primaryKeysAndItems) {
			this.collectionPatches[collection].patch.items.set(
				pk,
				serializedFields
			);
		}
		return this;
	}
	public codebeamerItems(
		...primaryKeysAndItems: [string, SerializedFields][]
	): RequestCollections {
		return this.items('items', ...primaryKeysAndItems);
	}
}
