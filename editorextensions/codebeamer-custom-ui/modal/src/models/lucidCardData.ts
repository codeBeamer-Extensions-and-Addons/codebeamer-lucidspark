/**
 * Structure of the card data being prepared for import on a lucid board
 */
export interface CardData {
	codebeamerItemId: number;
	codebeamerTrackerId: number;
	title?: string;
	description?: string;
	assignee?: string;
	estimate?: number;
	style?: {
		cardTheme?: string;
	};
	coordinates?: {
		x: number;
		y: number;
	};
}

/**
 * Interface for card block data.
 */
export interface CardBlockToCodebeamerItemMapping {
	cardBlockId: string;
	codebeamerItemId: number;
	codebeamerTrackerId: number;
}
