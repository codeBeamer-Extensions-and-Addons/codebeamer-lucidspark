import * as React from 'react';
import { CardBlockToItemMapping } from '../../../../models/cardBlockToItemMapping.if';
import ImportActions from './ImportActions';

describe('<ImportActions>', () => {
	it('mounts', () => {
		cy.mount(
			<ImportActions
				selectedCount={0}
				totalCount={0}
				onImportSelected={() => {}}
				onImportAll={() => {}}
				onSync={() => {}}
				importedItemsCount={0}
				unImportedItemsCount={0}
				onRelations={() => {}}
				relationsCount={0}
				missingRelationsCount={0}
			/>
		);
	});

	context('props', () => {
		it('displays the passed amount of selectedItems in the "Import Selected" button', () => {
			cy.mount(
				<ImportActions
					selectedCount={5}
					totalCount={0}
					onImportSelected={() => {}}
					onImportAll={() => {}}
					onSync={() => {}}
					importedItemsCount={0}
					unImportedItemsCount={0}
					onRelations={() => {}}
					relationsCount={0}
					missingRelationsCount={0}
				/>
			);

			cy.getBySel('importSelected').should(
				'have.text',
				'Import Selected (5)'
			);
		});

		it('disabled the "Import Selected" button when no items have been selected', () => {
			cy.mount(
				<ImportActions
					selectedCount={0}
					totalCount={0}
					onImportSelected={() => {}}
					onImportAll={() => {}}
					onSync={() => {}}
					importedItemsCount={0}
					unImportedItemsCount={0}
					onRelations={() => {}}
					relationsCount={0}
					missingRelationsCount={0}
				/>
			);

			cy.getBySel('importSelected').should('be.disabled');
		});

		it('displays the passed amount of items that have not been imported yet in the "Import All" button', () => {
			cy.mount(
				<ImportActions
					selectedCount={0}
					totalCount={0}
					onImportSelected={() => {}}
					onImportAll={() => {}}
					onSync={() => {}}
					importedItemsCount={0}
					unImportedItemsCount={15}
					onRelations={() => {}}
					relationsCount={0}
					missingRelationsCount={0}
				/>
			);

			cy.getBySel('importAll').should('have.text', 'Import all (15)');
		});

		it('calls the passed handler when clicking the "Import Selected" button', () => {
			const handler = cy.spy().as('handler');

			cy.mount(
				<ImportActions
					selectedCount={2}
					totalCount={5}
					onImportSelected={handler}
					onImportAll={() => {}}
					onSync={() => {}}
					importedItemsCount={0}
					unImportedItemsCount={0}
					onRelations={() => {}}
					relationsCount={0}
					missingRelationsCount={0}
				/>
			);

			cy.getBySel('importSelected').click();

			cy.get('@handler').should('have.been.calledOnce');
		});

		it('calls the passed handler when clicking the "Import All" button', () => {
			const handler = cy.spy().as('handler');

			const items: CardBlockToItemMapping[] = [
				{ itemId: 1, trackerId: 1, cardBlockId: '' },
				{ itemId: 2, trackerId: 1, cardBlockId: '' },
				{ itemId: 3, trackerId: 1, cardBlockId: '' },
			];

			cy.mount(
				<ImportActions
					selectedCount={0}
					totalCount={0}
					onImportSelected={() => {}}
					onImportAll={handler}
					onSync={() => {}}
					importedItemsCount={0}
					unImportedItemsCount={items.length}
					onRelations={() => {}}
					relationsCount={0}
					missingRelationsCount={0}
				/>
			);

			cy.getBySel('importAll').click();

			cy.get('@handler').should('have.been.calledOnce');
		});

		context('syncing', () => {
			it('displays the amount of already imported Items on the Sync button', () => {
				const items: CardBlockToItemMapping[] = [
					{ itemId: 1, trackerId: 1, cardBlockId: '' },
					{ itemId: 2, trackerId: 1, cardBlockId: '' },
					{ itemId: 3, trackerId: 1, cardBlockId: '' },
				];

				cy.mount(
					<ImportActions
						selectedCount={0}
						totalCount={0}
						onImportSelected={() => {}}
						onImportAll={() => {}}
						onSync={() => {}}
						importedItemsCount={items.length}
						unImportedItemsCount={0}
						onRelations={() => {}}
						relationsCount={0}
						missingRelationsCount={0}
					/>
				);

				cy.getBySel('sync').should('contain.text', items.length);
			});

			it('calls the passed handler when clicking the "Sync" button', () => {
				const handler = cy.spy().as('handler');

				const items: CardBlockToItemMapping[] = [
					{ itemId: 1, trackerId: 1, cardBlockId: '' },
					{ itemId: 2, trackerId: 1, cardBlockId: '' },
					{ itemId: 3, trackerId: 1, cardBlockId: '' },
				];

				cy.mount(
					<ImportActions
						selectedCount={0}
						totalCount={0}
						onImportSelected={() => {}}
						onImportAll={() => {}}
						onSync={handler}
						importedItemsCount={items.length}
						unImportedItemsCount={0}
						onRelations={() => {}}
						relationsCount={0}
						missingRelationsCount={0}
					/>
				);

				cy.getBySel('sync').click();

				cy.get('@handler').should('have.been.calledOnce');
			});
		});

		context('Relation & Association Visualization', () => {
			it('displays the amount of missing relations on the "Relation & Association Visualization" button', () => {
				const relations = [
					{
						sourceBlockId: '1',
						targetBlockId: '3',
						type: 'downstream',
					},
					{
						sourceBlockId: '2',
						targetBlockId: '4',
						type: 'downstream',
					},
					{
						sourceBlockId: '3',
						targetBlockId: '5',
						type: 'downstream',
					},
				];

				cy.mount(
					<ImportActions
						selectedCount={0}
						totalCount={0}
						onImportSelected={() => {}}
						onImportAll={() => {}}
						onSync={() => {}}
						importedItemsCount={0}
						unImportedItemsCount={0}
						onRelations={() => {}}
						relationsCount={0}
						missingRelationsCount={relations.length}
					/>
				);

				cy.getBySel('relations').should(
					'contain.text',
					relations.length
				);
			});

			it('disabled the "Relation & Association Visualization" button if no relations exist', () => {
				const relations = [];

				cy.mount(
					<ImportActions
						selectedCount={0}
						totalCount={0}
						onImportSelected={() => {}}
						onImportAll={() => {}}
						onSync={() => {}}
						importedItemsCount={0}
						unImportedItemsCount={0}
						onRelations={() => {}}
						relationsCount={relations.length}
						missingRelationsCount={0}
					/>
				);

				cy.getBySel('relations').should('be.disabled');
			});

			it('displays "Show" on the "Relation & Association Visualization" button if missing relations exists', () => {
				const relations = [
					{
						sourceBlockId: '1',
						targetBlockId: '3',
						type: 'downstream',
					},
					{
						sourceBlockId: '2',
						targetBlockId: '4',
						type: 'downstream',
					},
					{
						sourceBlockId: '3',
						targetBlockId: '5',
						type: 'downstream',
					},
				];

				cy.mount(
					<ImportActions
						selectedCount={0}
						totalCount={0}
						onImportSelected={() => {}}
						onImportAll={() => {}}
						onSync={() => {}}
						importedItemsCount={0}
						unImportedItemsCount={0}
						onRelations={() => {}}
						relationsCount={relations.length}
						missingRelationsCount={relations.length}
					/>
				);

				cy.getBySel('relations').should('contain.text', 'Show');
			});

			it('displays "Hide" on the "Relation & Association Visualization" button if there are no missing relations', () => {
				const relations = [
					{
						sourceBlockId: '1',
						targetBlockId: '3',
						type: 'downstream',
					},
					{
						sourceBlockId: '2',
						targetBlockId: '4',
						type: 'downstream',
					},
					{
						sourceBlockId: '3',
						targetBlockId: '5',
						type: 'downstream',
					},
				];

				cy.mount(
					<ImportActions
						selectedCount={0}
						totalCount={0}
						onImportSelected={() => {}}
						onImportAll={() => {}}
						onSync={() => {}}
						importedItemsCount={0}
						unImportedItemsCount={0}
						onRelations={() => {}}
						relationsCount={relations.length}
						missingRelationsCount={0}
					/>
				);

				cy.getBySel('relations').should('contain.text', 'Hide');
			});

			it('calls the passed handler when clicking the "Sync" button', () => {
				const handler = cy.spy().as('handler');

				const relations = [
					{
						sourceBlockId: '1',
						targetBlockId: '3',
						type: 'downstream',
					},
					{
						sourceBlockId: '2',
						targetBlockId: '4',
						type: 'downstream',
					},
					{
						sourceBlockId: '3',
						targetBlockId: '5',
						type: 'downstream',
					},
				];

				cy.mount(
					<ImportActions
						selectedCount={0}
						totalCount={0}
						onImportSelected={() => {}}
						onImportAll={() => {}}
						onSync={() => {}}
						importedItemsCount={0}
						unImportedItemsCount={0}
						onRelations={handler}
						relationsCount={relations.length}
						missingRelationsCount={relations.length}
					/>
				);

				cy.getBySel('relations').click();

				cy.get('@handler').should('have.been.calledOnce');
			});
		});
	});
});
