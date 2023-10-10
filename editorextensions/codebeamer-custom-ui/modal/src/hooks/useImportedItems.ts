import React, { useState } from 'react';
import { CardBlockToItemMapping } from '../models/cardBlockToItemMapping.if';
import { handleCardBlocks } from '../api/lucidGateway';

/**
 * Queries the CardBlocks present on the Lucid board
 * @returns An array of ${@link CardBlockToItemMapping}s matching the CardBlocks on the board.
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
		handleCardBlocks((data) => {
			const cardBlockCodebeamerItemIdPairs = data.map(
				(x: {
					cardBlock: { id: string };
					codebeamerItemId: number;
				}) => ({
					cardBlockId: x.cardBlock.id,
					itemId: x.codebeamerItemId,
				})
			);
			setImportedCardBlocks(cardBlockCodebeamerItemIdPairs);
		});
	}, []);

	return importedCardBlocks;
};
