import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetItemsQuery } from '../../../../api/codeBeamerApi';
import {
	DEFAULT_ITEMS_PER_PAGE,
	DEFAULT_RESULT_PAGE,
} from '../../../../constants/cb-import-defaults';
import { ItemListView } from '../../../../models/itemListView';
import { ItemQueryResultView } from '../../../../models/itemQueryResultView';
import { RootState } from '../../../../store/store';
import ImportActions from '../importActions/ImportActions';
import Importer from '../importer/Importer';
import QueryResult from '../queryResult/QueryResult';

import './queryResults.css';
import { useImportedItems } from '../../../../hooks/useImportedItems';
import { useLines } from '../../../../hooks/useLines';
import { BlockRelation, LucidLineData } from '../../../../models/lucidLineData';
import RelationsButton from '../relationsButton/relationsButton';

export default function QueryResults() {
	const [page, setPage] = useState(DEFAULT_RESULT_PAGE);
	const [items, setItems] = useState<ItemQueryResultView[]>([]);
	const [itemsToImport, setItemsToImport] = useState<string[]>([]);
	const [eos, setEos] = useState(false);
	const [importing, setImporting] = useState(false);
	const [missingRelations, setMissingRelations] = useState<BlockRelation[]>(
		[]
	);
	const [relationsToDelete, setRelationsToDelete] = useState<LucidLineData[]>(
		[]
	);
	// "" state is used while fetching relations and then switches to the correct mode once the data if fetched to start creating or deleting lines
	const [importingMode, setImportingMode] = useState<
		'import' | 'createLines' | 'deleteLines' | ''
	>('');

	const intersectionObserverOptions = {
		root: document.getElementById('queryResultsContainer'),
		rootMargin: '0px',
		threshold: 1,
	};

	const intersectionObserverCallback = (
		entries: IntersectionObserverEntry[],
		observer: IntersectionObserver
	) => {
		if (!entries[0]) return;
		if (!entries[0].isIntersecting) return;
		observer.unobserve(entries[0].target);

		fetchItems();
	};

	const lazyLoadObserver: IntersectionObserver = new IntersectionObserver(
		intersectionObserverCallback,
		intersectionObserverOptions
	);

	const { cbqlString, trackerId, activeFilters } = useSelector(
		(state: RootState) => state.userSettings
	);

	const { data, error, isLoading } = useGetItemsQuery({
		page: page,
		pageSize: DEFAULT_ITEMS_PER_PAGE,
		queryString: cbqlString,
	});

	const {
		importedItems,
		relations,
		isLoadingRelations,
		fetchRelations,
		areAllRelationsLoaded,
	} = useImportedItems(trackerId);
	const lines = useLines();

	const getMissingRelations = (allRelations: BlockRelation[]) => {
		const missingRelations = allRelations.filter((relation) => {
			return !lines.find((line) => {
				return (
					line.sourceBlockId == relation.sourceBlockId &&
					line.targetBlockId == relation.targetBlockId
				);
			});
		});

		return missingRelations;
	};

	/**
	 * Fetches items indirectly by increasing the observed {@link page} variable.
	 * Also updates {@link eos}, terminating fetches when it's reached.
	 */
	const fetchItems = () => {
		if (data) {
			setEos(items.length >= data.total);
			if (items.length < data.total) {
				const previous = page;
				setPage(previous + 1);
			}
		}
	};

	/**
	 * Handler for (un-)checking an item.
	 * @param item Item in question
	 * @param checked Value to set the Item's "selected" property to (== its checkbox' "checked" value)
	 */
	const toggleItemSelected = (item: ItemQueryResultView, checked: boolean) => {
		setItems(
			items.map((i) => {
				if (i.id != item.id) return i;
				return new ItemQueryResultView(item.id, item.name, checked);
			})
		);
	};

	/**
	 * Reset the items cache whenever we change filter or tracker
	 * Must run before the hook that adds the items from the newly fetched query
	 */
	React.useEffect(() => {
		setItems([]);
		setPage(1);
	}, [cbqlString]);

	React.useEffect(() => {
		lazyLoadObserver.disconnect();
	}, [trackerId]);

	//append loaded items whenever we get new ones
	//! this should (must, or else it doesn't really work) only trigger when we load another page of query results
	React.useEffect(() => {
		if (data && data.items.length) {
			if (data.page > 1) {
				setItems([
					...items,
					...data.items.map(
						(i: ItemListView) => new ItemQueryResultView(i.id, i.name)
					),
				]);
			} else {
				setItems(
					data.items.map(
						(i: ItemListView) => new ItemQueryResultView(i.id, i.name)
					)
				);
			}
		}
	}, [data]);

	React.useEffect(() => {
		const lastItem = document.querySelector(
			'#queryResults tbody tr:last-child'
		);
		if (lastItem) {
			lazyLoadObserver.observe(lastItem);
		}
	}, [items]);

	const handleImportSelected = () => {
		setItemsToImport(
			items.filter((i) => i.selected).map((i) => i.id.toString())
		);
		setImportingMode('import');
		setImporting(true);
	};

	const handleImportAll = () => {
		// passing an empty array == "Which one would you like to import? Yes."
		setItemsToImport([]);
		setImportingMode('import');
		setImporting(true);
	};

	const handleRelations = async () => {
		let blockRelations = relations;

		setImporting(true);

		if (!areAllRelationsLoaded) {
			blockRelations = await fetchRelations(importedItems);
		}

		const missingRelations = getMissingRelations(blockRelations);

		if (missingRelations.length > 0) {
			setMissingRelations(missingRelations);
			setImportingMode('createLines');
		} else {
			const linesToBeDeleted = lines.filter((line) => {
				return blockRelations.find((relation) => {
					return (
						line.sourceBlockId == relation.sourceBlockId &&
						line.targetBlockId == relation.targetBlockId
					);
				});
			});
			setRelationsToDelete(linesToBeDeleted);
			setImportingMode('deleteLines');
		}
	};

	//*********************************************************************** */
	//********************************RENDER********************************* */
	//*********************************************************************** */

	if (!items.length && isLoading) {
		return (
			<div className="centered h-auto">
				<div className="loading-spinner"></div>
			</div>
		);
	}
	if (data && data.total == 0) {
		return (
			<div className="centered h-auto">
				<h3 className="h3 muted-info" data-test="noItemsInTracker">
					No Items in this Query
				</h3>
			</div>
		);
	} else if (error) {
		return (
			<div className="centered h-auto">
				<h3 className="h3 error">Invalid query</h3>
			</div>
		);
	} else if (trackerId) {
		return (
			<div>
				<table className="table" id="queryResults" data-test="resultsTable">
					<thead>
						<tr>
							<td>Imported</td>
							<td>ID</td>
							<td>Name</td>
						</tr>
					</thead>
					<tbody data-test="tableBody">
						{items.map((i) => (
							<QueryResult
								item={i}
								key={i.id}
								checked={
									importedItems.find(
										(imported) => imported.codebeamerItemId == i.id
									) !== undefined
								}
								disabled={
									importedItems.find(
										(imported) => imported.codebeamerItemId == i.id
									) !== undefined
								}
								onSelect={toggleItemSelected}
							/>
						))}
					</tbody>
					<tfoot>
						<tr className="text-center">
							{!eos && (
								<td
									colSpan={3}
									className="position-relative loading-spinner loading-spinner-table-end"
								></td>
							)}
							{eos && (
								<td colSpan={3} className="muted" data-test="eosInfo">
									End of stream
								</td>
							)}
						</tr>
					</tfoot>
				</table>
				<div className="w-100 flex-row">
					<ImportActions
						selectedCount={items.filter((i) => i.selected).length}
						onImportSelected={handleImportSelected}
						onImportAll={handleImportAll}
						unImportedItemsCount={
							activeFilters.length > 0
								? (data?.total ?? 0) -
								  (items.filter((item) => {
										return (
											importedItems.find(
												(imported) =>
													imported.codebeamerItemId == item.id
											) !== undefined
										);
								  }).length ?? 0)
								: (data?.total ?? 0) -
								  (importedItems.filter((item, index, array) => {
										return (
											item.codebeamerTrackerId ==
												Number(trackerId) &&
											array.findIndex(
												(i) =>
													i.codebeamerItemId ==
													item.codebeamerItemId
											) == index
										);
								  }).length ?? 0)
						}
					/>
					<RelationsButton
						relationsCount={relations.length}
						missingRelationsCount={getMissingRelations(relations).length}
						areAllRelationsLoaded={areAllRelationsLoaded}
						isRelationsLoading={isLoadingRelations}
						onRelations={handleRelations}
					/>
				</div>

				{importing && (
					<Importer
						mode={importingMode}
						items={itemsToImport}
						importedItems={importedItems}
						totalItems={
							itemsToImport.length > 0
								? itemsToImport.length
								: data?.total
						}
						relationsToCreate={missingRelations}
						relationsToDelete={relationsToDelete}
						isLoadingRelations={isLoadingRelations}
					/>
				)}
			</div>
		);
	} else {
		return (
			<div className="centered">
				<h3 className="h3 muted-color">
					Select a Tracker to load its Items
				</h3>
			</div>
		);
	}
}
