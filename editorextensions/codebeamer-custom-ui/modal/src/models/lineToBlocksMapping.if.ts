/**
 * Map line and item together so you can tell which blocks the line is connecting
 */
export interface LineToBlocksMapping {
	lineId: string;
	sourceBlockId: string;
	targetBlockId: string;
}
