import React, { useState } from 'react';
import { MessageHandler } from '../api/messageHandler';
import { LucidLineData } from '../models/lucidLineData';
import { MessageAction } from '../models/messageInterfaces';

/**
 * Queries the Lines present on the Lucid board
 * @returns An array of ${@link LineToBlocksMapping}s matching the Lines on the board.
 */
export const useLines = () => {
	const [lines, setLines] = useState<LucidLineData[]>([]);

	const messageHandler = MessageHandler.getInstance();

	/**
	 * Queries the editor extension for the currently existing Lines on the board.
	 */
	React.useEffect(() => {
		const handleLinesData = (data: LucidLineData[]) => {
			setLines(data);
		};

		messageHandler.getLines(handleLinesData);

		return () => {
			messageHandler.unsubscribeCallback(
				MessageAction.GET_LINES,
				handleLinesData
			);
		};
	}, []);

	return lines;
};
