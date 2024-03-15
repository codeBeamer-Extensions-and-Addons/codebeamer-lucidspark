import * as React from 'react';
import { setTrackerId } from '../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../store/store';
import Importer from './Importer';
import { CardBlockToCodebeamerItemMapping } from '../../../../models/lucidCardData';
import { BlockRelation, LucidLineData } from '../../../../models/lucidLineData';
import { RelationshipType } from '../../../../enums/associationRelationshipType.enum';
import { setProjectId } from '../../../../store/slices/boardSettingsSlice';
import {
	DEFAULT_RESULT_PAGE,
	MAX_ITEMS_PER_IMPORT,
} from '../../../../constants/cb-import-defaults';

describe('<Importer>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Importer items={[]} mode="" />);
	});

	it('does not show a close button by default', () => {
		cy.mountWithStore(<Importer items={[]} mode="" />);

		cy.get('[aria-label="close"]').should('not.exist');
	});

	it('does show a close button if passed an onClose prop', () => {
		const handler = cy.spy();
		cy.mountWithStore(<Importer items={[]} mode="" onClose={handler} />);

		cy.get('[aria-label="Close"]').should('exist');
	});

	it('calls the passed onClose handler when the close button is clicked', () => {
		const handler = cy.spy().as('handler');
		cy.mountWithStore(<Importer items={[]} mode="" onClose={handler} />);

		cy.get('[aria-label="Close"]').click();

		cy.get('@handler').should('have.been.calledOnce');
	});

	it('sends the items to the editor extension  passed as props', () => {
		cy.stub(window.parent, 'postMessage').as('postMessageStub');
		const items: string[] = ['1', '2', '3'];
		const itemsToImport = items.map((i) => parseInt(i));
		const store = getStore();
		store.dispatch(setProjectId('1'));
		store.dispatch(setTrackerId('1'));

		cy.mountWithStore(<Importer items={items} mode="import" />, {
			reduxStore: store,
		});

		cy.get('@postMessageStub').should(
			'have.been.calledWith',
			{
				action: 'import',
				payload: { itemIds: itemsToImport, trackerId: 1, projectId: 1 },
			},
			'*'
		);
	});

	it('send all items in the selected tracker to the editor extension (without any additional filter criteria) when passing an empty array as prop', () => {
		cy.stub(window.parent, 'postMessage').as('postMessageStub');
		const items: string[] = [];
		const itemsToImport = [1, 2, 3];
		const itemsInTracker: { id: number }[] = [
			{ id: 1 },
			{ id: 2 },
			{ id: 3 },
		];
		const store = getStore();
		store.dispatch(setProjectId('1'));
		store.dispatch(setTrackerId('1'));

		cy.intercept('POST', `**/api/v3/items/query`, {
			statusCode: 200,
			body: {
				page: DEFAULT_RESULT_PAGE,
				pageSize: MAX_ITEMS_PER_IMPORT,
				total: itemsInTracker.length,
				items: itemsInTracker,
			},
		}).as('itemsQuery');

		cy.mountWithStore(<Importer items={items} mode="import" />, {
			reduxStore: store,
		});

		cy.wait('@itemsQuery');

		cy.get('@postMessageStub').should(
			'have.been.calledWith',
			{
				action: 'import',
				payload: { itemIds: itemsToImport, trackerId: 1, projectId: 1 },
			},
			'*'
		);
	});

	it('removes the already imported items from the passed props so as not to duplicate them', () => {
		cy.stub(window.parent, 'postMessage').as('postMessageStub');
		const items: string[] = [];
		const itemsToImport = [1, 2, 3];
		const itemsInTracker: { id: number }[] = [
			{ id: 1 },
			{ id: 2 },
			{ id: 3 },
			{ id: 569657 },
			{ id: 569527 },
		];
		const store = getStore();
		store.dispatch(setProjectId('1'));
		store.dispatch(setTrackerId('1'));

		cy.intercept('POST', `**/api/v3/items/query`, {
			statusCode: 200,
			body: {
				page: DEFAULT_RESULT_PAGE,
				pageSize: MAX_ITEMS_PER_IMPORT,
				total: itemsInTracker.length,
				items: itemsInTracker,
			},
		}).as('itemsQuery');

		cy.mountWithStore(
			<Importer
				items={items}
				mode="import"
				importedItems={mockImportedItems}
			/>,
			{
				reduxStore: store,
			}
		);

		cy.wait('@itemsQuery');

		cy.get('@postMessageStub').should(
			'have.been.calledWith',
			{
				action: 'import',
				payload: { itemIds: itemsToImport, trackerId: 1, projectId: 1 },
			},
			'*'
		);
	});

	context('prop queryString', () => {
		it('fetches the details of the items specified in the queryString if one is specified', () => {
			cy.stub(window.parent, 'postMessage').as('postMessageStub');
			const mockQueryString = 'item.id IN (1,2,3,4)';
			const fetchedItems: { id: number }[] = [
				{ id: 1 },
				{ id: 2 },
				{ id: 3 },
				{ id: 4 },
			];
			const itemsToImport = [1, 2, 3, 4];
			const store = getStore();
			store.dispatch(setProjectId('1'));
			store.dispatch(setTrackerId('1'));

			cy.intercept('POST', `**/api/v3/items/query`, {
				statusCode: 200,
				body: {
					page: DEFAULT_RESULT_PAGE,
					pageSize: MAX_ITEMS_PER_IMPORT,
					total: fetchedItems.length,
					items: fetchedItems,
				},
			}).as('itemsQuery');

			cy.mountWithStore(
				<Importer items={[]} mode="import" queryString={mockQueryString} />,
				{
					reduxStore: store,
				}
			);

			cy.wait('@itemsQuery');

			cy.get('@postMessageStub').should(
				'have.been.calledWith',
				{
					action: 'import',
					payload: {
						itemIds: itemsToImport,
						trackerId: 1,
						projectId: 1,
					},
				},
				'*'
			);
		});

		it('still appends what items are already imported to the queryString so as not to duplicate them', () => {
			cy.stub(window.parent, 'postMessage').as('postMessageStub');
			const mockQueryString = 'item.id IN (1,2,3,4)';
			const itemsToImport = [1, 2, 3, 4];
			const itemsInTracker: { id: number }[] = [
				{ id: 1 },
				{ id: 2 },
				{ id: 3 },
				{ id: 4 },
				{ id: 569657 },
				{ id: 569527 },
			];

			const store = getStore();
			store.dispatch(setProjectId('1'));
			store.dispatch(setTrackerId('1'));

			cy.intercept('POST', `**/api/v3/items/query`, {
				statusCode: 200,
				body: {
					page: DEFAULT_RESULT_PAGE,
					pageSize: MAX_ITEMS_PER_IMPORT,
					total: itemsInTracker.length,
					items: itemsInTracker,
				},
			}).as('itemsQuery');

			cy.mountWithStore(
				<Importer
					items={[]}
					mode="import"
					queryString={mockQueryString}
					importedItems={mockImportedItems}
				/>,
				{
					reduxStore: store,
				}
			);

			cy.wait('@itemsQuery');

			cy.get('@postMessageStub').should(
				'have.been.calledWith',
				{
					action: 'import',
					payload: {
						itemIds: itemsToImport,
						trackerId: 1,
						projectId: 1,
					},
				},
				'*'
			);
		});
	});

	context('Lines', () => {
		it('creates lines if mode equals "createLines"', () => {
			cy.stub(window.parent, 'postMessage').as('postMessageStub');

			cy.mountWithStore(
				<Importer
					items={[]}
					mode="createLines"
					relationsToCreate={mockRelations}
					isLoadingRelations={false}
				/>
			);

			mockRelations.forEach((relation) => {
				const linePayload = {
					sourceBlockId: relation.sourceBlockId,
					targetBlockId: relation.targetBlockId,
					relationshipType: relation.type,
					lineColor: '#000000',
				};
				cy.get('@postMessageStub').should(
					'have.been.calledWithMatch',
					{
						action: 'createLine',
						payload: linePayload,
					},
					'*'
				);
			});
		});

		it('deletes lines if mode equals "deleteLines"', () => {
			cy.stub(window.parent, 'postMessage').as('postMessageStub');

			cy.mountWithStore(
				<Importer
					items={[]}
					mode="deleteLines"
					relationsToDelete={mockLines}
					isLoadingRelations={false}
				/>
			);

			mockLines.forEach((line) => {
				const linePayload = {
					lineId: line.id,
				};
				cy.get('@postMessageStub').should(
					'have.been.calledWithMatch',
					{
						action: 'deleteLine',
						payload: linePayload,
					},
					'*'
				);
			});
		});
	});
});

const mockImportedItems: CardBlockToCodebeamerItemMapping[] = [
	{ cardBlockId: '1', codebeamerItemId: 569657, codebeamerTrackerId: 1 },
	{ cardBlockId: '1', codebeamerItemId: 569527, codebeamerTrackerId: 1 },
];

const mockRelations: BlockRelation[] = [
	{
		sourceBlockId: '1',
		targetBlockId: '3',
		type: RelationshipType.DOWNSTREAM,
	},
	{
		sourceBlockId: '2',
		targetBlockId: '4',
		type: RelationshipType.DOWNSTREAM,
	},
	{
		sourceBlockId: '3',
		targetBlockId: '5',
		type: RelationshipType.DOWNSTREAM,
	},
];

const mockLines: LucidLineData[] = [
	{
		id: '1',
		sourceBlockId: '1',
		targetBlockId: '3',
	},
	{
		id: '2',
		sourceBlockId: '2',
		targetBlockId: '4',
	},
	{
		id: '3',
		sourceBlockId: '3',
		targetBlockId: '5',
	},
];
