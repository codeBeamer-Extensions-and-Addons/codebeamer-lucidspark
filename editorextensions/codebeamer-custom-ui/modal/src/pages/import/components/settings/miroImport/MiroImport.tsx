import React, { ChangeEvent, useState } from 'react';
import MiroImporter from '../../importer/MiroImporter';

export interface CompressedItem {
	id: string;
	coordinates: {
		x: number;
		y: number;
	};
}

export default function MiroImport() {
	const [isLoading, setIsLoading] = useState(false);
	const [file, setFile] = useState<File>();
	const [importing, setImporting] = useState(false);
	const [itemsToImport, setItemsToImport] = useState<CompressedItem[]>([]);

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFile(e.target.files[0]);
		}
	};

	const readImportData = async () => {
		if (!file) {
			console.warn('No file selected');
			return;
		}
		if (!(file!.type == 'application/json')) {
			console.warn('File must be a JSON file');
			return;
		}
		setIsLoading(true);

		try {
			const readFile = await file.text();
			const json = JSON.parse(readFile) as CompressedItem[];
			// console.log(json);
			setItemsToImport(json);
			setImporting(true);
		} catch (error) {
			console.error('Error reading file: ', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="centered">
			<p className="mt-3" style={{ width: '150%', textAlign: 'center' }}>
				<span>
					Upload your exported codebeamer-cards <em>JSON</em> from our Miro
					plugin here to import them to this Lucidspark board.
				</span>
			</p>
			<input className="mt-3" type="file" onChange={handleFileChange} />
			<button
				onClick={readImportData}
				disabled={!file || isLoading}
				className={`mt-1 fade-in button button-primary ${
					isLoading ? 'button-loading' : ''
				}`}
				data-test="submit"
			>
				Import
			</button>
			{importing && <MiroImporter items={itemsToImport} />}
		</div>
	);
}
