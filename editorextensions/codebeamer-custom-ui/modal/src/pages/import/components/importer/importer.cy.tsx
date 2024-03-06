import * as React from 'react';
import { setTrackerId } from '../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../store/store';
import Importer from './Importer';
import { CardBlockToCodebeamerItemMapping } from '../../../../models/lucidCardData';
import { BlockRelation, LucidLineData } from '../../../../models/lucidLineData';
import { RelationshipType } from '../../../../enums/associationRelationshipType.enum';

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
		const store = getStore();
		store.dispatch(setTrackerId('1'));

		const expectedQuery = `tracker.id IN (1) AND item.id IN (1,2,3)`;

		cy.mountWithStore(<Importer items={items} mode="import" />, {
			reduxStore: store,
		});

		cy.get('@postMessageStub').should(
			'have.been.calledWith',
			{
				action: 'import',
				payload: { queryString: expectedQuery },
			},
			'*'
		);
	});

	it('send all items in the selected tracker to the editor extension (without any additional filter criteria) when passing an empty array as prop', () => {
		cy.stub(window.parent, 'postMessage').as('postMessageStub');
		const items: string[] = [];
		const store = getStore();
		store.dispatch(setTrackerId('1'));

		const expectedQuery = `tracker.id IN (1)`;

		cy.mountWithStore(<Importer items={items} mode="import" />, {
			reduxStore: store,
		});

		cy.get('@postMessageStub').should(
			'have.been.calledWith',
			{
				action: 'import',
				payload: { queryString: expectedQuery },
			},
			'*'
		);
	});

	it('appends what items are already imported to the queryString so as not to duplicate them', () => {
		cy.stub(window.parent, 'postMessage').as('postMessageStub');
		const items: string[] = ['1', '2', '3'];
		const store = getStore();
		store.dispatch(setTrackerId('1'));

		const expectedQuery = `tracker.id IN (1) AND item.id IN (${items.join(
			','
		)}) AND item.id NOT IN (569657,569527)`; //the latter two are from down in the mockImportedItems

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
		cy.get('@postMessageStub').should(
			'have.been.calledWith',
			{
				action: 'import',
				payload: { queryString: expectedQuery },
			},
			'*'
		);
	});

	context('prop queryString', () => {
		it('fetches the details of the items specified in the queryString if one is specified', () => {
			cy.stub(window.parent, 'postMessage').as('postMessageStub');
			const mockQueryString = 'item.id IN (1,2,3,4)';

			cy.mountWithStore(
				<Importer items={[]} mode="import" queryString={mockQueryString} />
			);

			cy.get('@postMessageStub').should(
				'have.been.calledWith',
				{
					action: 'import',
					payload: { queryString: mockQueryString },
				},
				'*'
			);
		});

		it('still appends what items are already imported to the queryString so as not to duplicate them', () => {
			cy.stub(window.parent, 'postMessage').as('postMessageStub');
			const mockQueryString = 'item.id IN (1,2,3,4)';

			const expectedQuery = `${mockQueryString} AND item.id NOT IN (569657,569527)`; //the latter two are from down in the mockImportedItems

			cy.mountWithStore(
				<Importer
					items={[]}
					mode="import"
					queryString={mockQueryString}
					importedItems={mockImportedItems}
				/>
			);

			cy.get('@postMessageStub').should(
				'have.been.calledWith',
				{
					action: 'import',
					payload: { queryString: expectedQuery },
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
