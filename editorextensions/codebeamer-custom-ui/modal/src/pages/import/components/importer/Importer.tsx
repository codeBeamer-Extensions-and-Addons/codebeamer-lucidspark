import React from 'react';
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

import './importer.css';

export default function Importer(props: {
	items: string[];
	totalItems?: number;
	queryString?: string;
	onClose?: Function;
}) {
	const { cbqlString } = useSelector(
		(state: RootState) => state.userSettings
	);

	const importedItems = useImportedItems();

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
					.map((i) => i.itemId)
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

	const { data, error, isLoading } = useGetItemsQuery({
		page: DEFAULT_RESULT_PAGE,
		pageSize: MAX_ITEMS_PER_IMPORT,
		queryString: getMainQueryString(),
	});

	React.useEffect(() => {
		const importItems = async (items: CodeBeamerItem[]) => {
			const importId = Math.ceil(Math.random() * 899) + 100;
			LucidGateway.startImport(importId, items.length);
			const _items: CodeBeamerItem[] = structuredClone(items);
			for (let i = 0; i < _items.length; i++) {
				console.log('Item no. ' + i + ' of ' + _items.length);
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
	}, [data]);

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
						{isLoading && (
							<>
								<Spinner animation="grow" variant="primary" />
								<br />
								<span>Fetching data</span>
							</>
						)}
						{!isLoading && (
							<>
								<Spinner animation="border" variant="primary" />
								<br />
								<span>Creating cards</span>
							</>
						)}
					</h5>
				</div>
			</Modal.Body>
		</Modal>
	);
}
