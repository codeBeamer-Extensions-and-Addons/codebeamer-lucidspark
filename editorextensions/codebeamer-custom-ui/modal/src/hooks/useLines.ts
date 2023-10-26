import React, { useState } from 'react';
import { MessageHandler, LineData } from '../api/lucidGateway';
import { LineToBlocksMapping } from '../models/lineToBlocksMapping.if';

/**
 * Queries the Lines present on the Lucid board
 * @returns An array of ${@link LineToBlocksMapping}s matching the Lines on the board.
 */
export const useLines = () => {
	const [lines, setLines] = useState<LineToBlocksMapping[]>([]);

	const messageHandler = MessageHandler.getInstance();

	/**
	 * Queries the editor extension for the currently existing Lines on the board.
	 */
	React.useEffect(() => {
		const handleLinesData = (data: LineData[]) => {
			const lineBlockIdsPairs = data.map(
				(x: {
					lineId: string;
					sourceBlockId: string;
					targetBlockId: string;
				}) => ({
					lineId: x.lineId,
					sourceBlockId: x.sourceBlockId,
					targetBlockId: x.targetBlockId,
				})
			);
			setLines(lineBlockIdsPairs);
		};

		messageHandler.getLines(handleLinesData);
	}, []);

	return lines;
};
