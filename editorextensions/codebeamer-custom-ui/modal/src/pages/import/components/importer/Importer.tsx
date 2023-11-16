import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { useSelector } from 'react-redux';
import { useGetItemsQuery } from '../../../../api/codeBeamerApi';
import { LucidGateway } from '../../../../api/lucidGateway';
import {
	DEFAULT_RESULT_PAGE,
	MAX_ITEMS_PER_IMPORT,
} from '../../../../constants/cb-import-defaults';
import { CodeBeamerItem } from '../../../../models/codebeamer-item.if';
import { RootState } from '../../../../store/store';
import { useImportedItems } from '../../../../hooks/useImportedItems';
import { BlockRelation, LucidLineData } from '../../../../models/lucidLineData';

import './importer.css';

export default function Importer(props: {
	items: string[];
	totalItems?: number;
	queryString?: string;
	onClose?: Function;
	mode: 'import' | 'createLines' | 'deleteLines' | '';
	relationsToCreate?: BlockRelation[];
	relationsToDelete?: LucidLineData[];
	isLoadingRelations?: boolean;
}) {
	const { cbqlString } = useSelector((state: RootState) => state.userSettings);

	const [loaded, setLoaded] = useState(0);

	const { importedItems } = useImportedItems();

	/**
	 * Produces the "main query string", which defines what should be imported.
	 */
	const getMainQueryString = () => {
		const mainQuery = cbqlString;
		const selectedItemsFilter = props.items.length
			? ` AND item.id IN (${props.items.join(',')})`
			: '';
		const importedItemsFilter = importedItems.length
			? ` AND item.id NOT IN (${importedItems
					.map((i) => i.codebeamerItemId)
					.join(',')})`
			: '';

		if (props.queryString) {
			return `${props.queryString}${importedItemsFilter}`;
		} else {
			return `${mainQuery}${selectedItemsFilter}${importedItemsFilter}`;
		}
	};

	//* applies all currently active filters by using the stored cbqlString,
	//* then further filters out only the selected items (or takes all of 'em)

	const { data, error, isLoading } =
		props.mode === 'import'
			? useGetItemsQuery({
					page: DEFAULT_RESULT_PAGE,
					pageSize: MAX_ITEMS_PER_IMPORT,
					queryString: getMainQueryString(),
			  })
			: { data: undefined, error: undefined, isLoading: false };

	React.useEffect(() => {
		const processImport = async () => {
			const importItems = async (items: CodeBeamerItem[]) => {
				const importId = Math.ceil(Math.random() * 899) + 100;
				LucidGateway.startImport(importId, items.length);
				const _items: CodeBeamerItem[] = structuredClone(items);
				for (let i = 0; i < _items.length; i++) {
					if (_items[i].categories?.length) {
						if (
							_items[i].categories.find(
								(c) => c.name == 'Folder' || c.name == 'Information'
							)
						) {
							continue;
						}
					}
					await LucidGateway.createAppCard(importId, _items[i]);
				}
			};

			if (error) {
				if (props.onClose) props.onClose();
			} else if (data) {
				importItems(data.items as CodeBeamerItem[]).catch((err) =>
					console.error(err)
				);
			}
		};

		if (props.mode === 'import') {
			if (data) {
				processImport().catch((err) => console.error(err));
			}
		}
	}, [data, props.mode]);

	React.useEffect(() => {
		const processLines = async () => {
			const createLines = async (relations: BlockRelation[]) => {
				const importId = Math.ceil(Math.random() * 899) + 100;
				LucidGateway.startImport(importId, relations.length);
				const _relations: BlockRelation[] = structuredClone(relations);
				for (let i = 0; i < _relations.length; i++) {
					const relation = _relations[i];
					await LucidGateway.createLine(
						importId,
						relation.sourceBlockId,
						relation.targetBlockId,
						relation.type
					);
				}
			};

			const deleteLines = async (relations: LucidLineData[]) => {
				const importId = Math.ceil(Math.random() * 899) + 100;
				LucidGateway.startImport(importId, relations.length);
				const _relations: LucidLineData[] = structuredClone(relations);
				for (let i = 0; i < _relations.length; i++) {
					const relation = _relations[i];
					await LucidGateway.deleteLine(importId, relation.id);
				}
			};

			if (error) {
				if (props.onClose) props.onClose();
			} else if (props.relationsToCreate) {
				if (props.mode === 'createLines') {
					createLines(props.relationsToCreate as BlockRelation[]).catch(
						(err) => console.error(err)
					);
				} else if (props.mode === 'deleteLines') {
					deleteLines(props.relationsToDelete as LucidLineData[]).catch(
						(err) => console.error(err)
					);
				}
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
