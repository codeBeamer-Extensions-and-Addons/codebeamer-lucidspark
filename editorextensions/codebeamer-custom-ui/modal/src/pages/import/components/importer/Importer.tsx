import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { useSelector } from 'react-redux';
import { LucidGateway } from '../../../../api/lucidGateway';
import { RootState } from '../../../../store/store';
import { BlockRelation, LucidLineData } from '../../../../models/lucidLineData';

import './importer.css';
import { CardBlockToCodebeamerItemMapping } from '../../../../models/lucidCardData';
import { useGetItemsQuery } from '../../../../api/codeBeamerApi';
import {
	DEFAULT_RESULT_PAGE,
	MAX_ITEMS_PER_IMPORT,
} from '../../../../constants/cb-import-defaults';

export default function Importer(props: {
	items: string[];
	totalItems?: number;
	queryString?: string;
	onClose?: () => void;
	mode: 'import' | 'createLines' | 'deleteLines' | '';
	relationsToCreate?: BlockRelation[];
	relationsToDelete?: LucidLineData[];
	isLoadingRelations?: boolean;
	importedItems?: CardBlockToCodebeamerItemMapping[];
}) {
	const { cbqlString, trackerId } = useSelector(
		(state: RootState) => state.userSettings
	);
	const { projectId } = useSelector((state: RootState) => state.boardSettings);

	/**
	 * Produces the "main query string", which defines what should be imported.
	 */
	const getMainQueryString = () => {
		const mainQuery = cbqlString;
		const selectedItemsFilter = props.items.length
			? ` AND item.id IN (${props.items.join(',')})`
			: '';
		const importedItemsFilter = props.importedItems?.length
			? ` AND item.id NOT IN (${props.importedItems
					.map((i) => i.codebeamerItemId)
					.join(',')})`
			: '';

		if (props.queryString) {
			return `${props.queryString}${importedItemsFilter}`;
		} else {
			return `${mainQuery}${selectedItemsFilter}${importedItemsFilter}`;
		}
	};

	//* we require to pass all item ids when importing to lucid
	//* if no items were selected, we fetch the items ourself to get their ids

	const { data, error, isLoading } =
		props.mode === 'import' && !props.items.length
			? useGetItemsQuery({
					page: DEFAULT_RESULT_PAGE,
					pageSize: MAX_ITEMS_PER_IMPORT,
					queryString: getMainQueryString(),
			  })
			: { data: undefined, error: undefined, isLoading: false };

	React.useEffect(() => {
		const processImport = async () => {
			if (error) {
				if (props.onClose) props.onClose();
			}
			if (props.items.length > 0) {
				const selectedItems = props.items.map(Number);
				LucidGateway.import(
					selectedItems,
					Number(trackerId),
					Number(projectId)
				);
			} else {
				// import all
				if (!data) return;

				const items = data.items.map((item) => item.id);
				let itemsToImport = items;

				if (props.importedItems) {
					const importedItems = props.importedItems.map(
						(i) => i.codebeamerItemId
					);
					itemsToImport = items.filter(
						(item) => !importedItems.includes(item)
					);
				}

				console.log('importing items:', itemsToImport);
				console.log('trackerId:', trackerId);
				console.log('projectId:', projectId);

				LucidGateway.import(
					itemsToImport,
					Number(trackerId),
					Number(projectId)
				);
			}
		};

		if (props.mode === 'import') {
			processImport().catch((err) => console.error(err));
		}
	}, [data, props.mode]);

	React.useEffect(() => {
		const processLines = async () => {
			const createLines = async (relations: BlockRelation[]) => {
				const importId = Math.ceil(Math.random() * 899) + 100;
				LucidGateway.startLineImport(importId, relations.length);
				const _relations: BlockRelation[] = structuredClone(relations);
				for (let i = 0; i < _relations.length; i++) {
					const relation = _relations[i];
					LucidGateway.createLine(
						importId,
						relation.sourceBlockId,
						relation.targetBlockId,
						relation.type
					);
				}
			};

			const deleteLines = async (relations: LucidLineData[]) => {
				const importId = Math.ceil(Math.random() * 899) + 100;
				LucidGateway.startLineImport(importId, relations.length);
				const _relations: LucidLineData[] = structuredClone(relations);
				for (let i = 0; i < _relations.length; i++) {
					const relation = _relations[i];
					LucidGateway.deleteLine(importId, relation.id);
				}
			};

			if (props.mode === 'createLines') {
				createLines(props.relationsToCreate as BlockRelation[]).catch(
					(err) => console.error(err)
				);
			} else if (props.mode === 'deleteLines') {
				deleteLines(props.relationsToDelete as LucidLineData[]).catch(
					(err) => console.error(err)
				);
			}
		};

		if (props.mode === 'createLines') {
			if (props.relationsToCreate && !props.isLoadingRelations) {
				processLines().catch((err) => console.error(err));
			}
		} else if (props.mode === 'deleteLines') {
			if (props.relationsToDelete && !props.isLoadingRelations) {
				processLines().catch((err) => console.error(err));
			}
		}
	}, [props.mode]);

	return (
		<Modal show centered>
			<Modal.Header
				closeButton={props.onClose !== undefined}
				onHide={() => {
					if (props.onClose) props.onClose();
				}}
			></Modal.Header>
			<Modal.Body>
				<div className="centered w-80">
					<h5 className="h5 text-center">
						{(isLoading || props.isLoadingRelations) && (
							<>
								<Spinner animation="grow" variant="primary" />
								<br />
								<span>Fetching data</span>
							</>
						)}
						{!isLoading && !props.isLoadingRelations && (
							<>
								<Spinner animation="border" variant="primary" />
								<br />
								<span>
									{props.mode === 'import'
										? 'Creating cards'
										: props.mode === 'createLines'
										? `Visualizing ${props.relationsToCreate?.length} Relations & Associations`
										: `Deleting ${props.relationsToDelete?.length} Relations & Associations`}
								</span>
							</>
						)}
					</h5>
				</div>
			</Modal.Body>
		</Modal>
	);
}
