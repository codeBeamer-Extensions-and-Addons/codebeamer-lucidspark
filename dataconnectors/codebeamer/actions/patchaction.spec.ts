import 'jasmine';
import { MockDataConnectorClient } from 'lucid-extension-sdk/dataconnector/dataconnectorclient';
import { makeDataConnector } from '..';
import { DataUpdateFilterType } from 'lucid-extension-sdk';
import {
	PatchChange,
	PatchChangeCollection,
} from 'lucid-extension-sdk/dataconnector/actions/patchresponsebody';

describe('patch action', () => {
	it('updates the name of an item', async () => {
		// const mockDataConnectorClient = new MockDataConnectorClient();
		const mockDataConnectorClient = new MockDataConnectorClient();
		const dataConnector = makeDataConnector(mockDataConnectorClient);
		const oAuthToken = 'test token';

		const action = {
			name: 'Patch',
			patches: [
				{
					id: 'someId1',
					itemsAdded: {},
					itemsChanged: {
						'1': {
							Name: 'new test name',
						},
					},
					itemsDeleted: [],
					syncSourceId: 'someSyncSourceId1',
					syncCollectionId: 'items',
					itemOrderChanged: undefined,
					getChange: (
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						collections?: PatchChangeCollection[] | undefined
					) => {
						return undefined as unknown as PatchChange;
					},
				},
			],
			client: mockDataConnectorClient.dataSourceClient,
			context: {
				userCredential: oAuthToken,
				packageId: 'some package id',
				packageVersion: '2.2.2',
				dataConnectorName: '',
				installationId: undefined,
				documentCollections: {},
				updateFilterType: DataUpdateFilterType.AllUpdates,
			},
		};

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

		expect(result).toEqual({
			status: 200,
			body: {
				success: true,
			},
		});
	});
});
