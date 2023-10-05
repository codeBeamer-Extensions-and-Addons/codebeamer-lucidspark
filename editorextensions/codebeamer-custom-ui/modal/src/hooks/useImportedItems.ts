import React, { useState } from 'react';
import { CardBlockToItemMapping } from '../models/cardBlockToItemMapping.if';

/**
 * Queries the CardBlocks present on the Lucid board
 * @returns An array of ${@link CardBlockToItemMapping}s matching the AppCards on the board.
 */
export const useImportedItems = () => {
	const [importedCardBlocks, setImportedCardBlocks] = useState<
		CardBlockToItemMapping[]
	>([]);

	/**
	 * Queries the editor extension for the currently existing cardBlocks on the board.
	 * This does mean that this plugin is currently not 100% compatible with others that would create Card Blocks.
	 */
	React.useEffect(() => {
		window.parent.postMessage(
			{ action: 'getCardBlocks', payload: {} },
			'*'
		);

		window.addEventListener('message', (e) => {
			const data = JSON.parse(e.data);
			const cardBlockRetinaIdPairs = data.map(
				(x: { cardBlock: { id: any }; retinaId: any }) => ({
					cardBlockId: x.cardBlock.id,
					itemId: x.retinaId,
				})
			);
			setImportedCardBlocks(cardBlockRetinaIdPairs);
		});
	}, []);

	return importedCardBlocks;
};
