import React, { useState } from 'react';
import { MessageHandler, LineData } from '../api/lucidGateway';

/**
 * Queries the Lines present on the Lucid board
 * @returns An array of ${@link LineToBlocksMapping}s matching the Lines on the board.
 */
export const useLines = () => {
	const [lines, setLines] = useState<LineData[]>([]);

	const messageHandler = MessageHandler.getInstance();

	/**
	 * Queries the editor extension for the currently existing Lines on the board.
	 */
	React.useEffect(() => {
		const handleLinesData = (data: LineData[]) => {
			setLines(data);
		};

		messageHandler.getLines(handleLinesData);
	}, []);

	return lines;
};
