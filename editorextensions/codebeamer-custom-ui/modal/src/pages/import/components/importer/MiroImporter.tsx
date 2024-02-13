import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { LucidGateway } from '../../../../api/lucidGateway';
import { CompressedItem } from '../settings/miroImport/MiroImport';

import './importer.css';

export default function Importer(props: {
	items: CompressedItem[];
	onClose?: () => void;
}) {
	/**
	 * Produces the query string for the import.
	 */
	const getMainQueryString = () => {
		return `item.id IN (${props.items.map((i) => i.id).join(',')})`;
	};

	React.useEffect(() => {
		const queryString = getMainQueryString();
		LucidGateway.import(queryString);
	}, []);

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
