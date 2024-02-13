import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { useSelector } from 'react-redux';
import { LucidGateway } from '../../../../api/lucidGateway';
import { RootState } from '../../../../store/store';
import { BlockRelation, LucidLineData } from '../../../../models/lucidLineData';

import './importer.css';
import { CardBlockToCodebeamerItemMapping } from '../../../../models/lucidCardData';

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
	const { cbqlString } = useSelector((state: RootState) => state.userSettings);

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

	React.useEffect(() => {
		const processImport = async () => {
			const queryString = getMainQueryString();
			LucidGateway.import(queryString);
		};

		if (props.mode === 'import') {
			processImport().catch((err) => console.error(err));
		}
	}, [props.mode]);

	React.useEffect(() => {
		const processLines = async () => {
			const createLines = async (relations: BlockRelation[]) => {
				const importId = Math.ceil(Math.random() * 899) + 100;
				LucidGateway.startLineImport(importId, relations.length);
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
				LucidGateway.startLineImport(importId, relations.length);
				const _relations: LucidLineData[] = structuredClone(relations);
				for (let i = 0; i < _relations.length; i++) {
					const relation = _relations[i];
					await LucidGateway.deleteLine(importId, relation.id);
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

	const isLoading = true;
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
