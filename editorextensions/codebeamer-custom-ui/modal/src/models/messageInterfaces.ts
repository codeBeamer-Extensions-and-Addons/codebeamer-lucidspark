import { RelationshipType } from '../enums/associationRelationshipType.enum';
import { CardBlockToCodebeamerItemMapping } from './lucidCardData';
import { LucidLineData } from './lucidLineData';

/**
 * Interface for a message object with an action and payload.
 * @interface Message
 * @property action - The action to perform.
 * @property payload - The payload for the action.
 */
export interface Message {
	action: MessageAction;
	payload?:
		| StartLineImportPayload
		| CreateLinePayload
		| DeleteLinePayload
		| ImportPayload;
}

export interface IncomingMessage {
	action: MessageAction;
	payload: LucidLineData[] | CardBlockToCodebeamerItemMapping[];
}

// Interface for payload specific to the CREATE_LINE action
export interface CreateLinePayload {
	importId: number;
	sourceBlockId: string;
	targetBlockId: string;
	relationshipType: RelationshipType;
	lineColor: string;
}

// Interface for payload specific to the DELETE_LINE action
export interface DeleteLinePayload {
	importId: number;
	lineId: string;
}

// Interface for payload specific to the START_LINE_IMPORT action
export interface StartLineImportPayload {
	id: number;
	totalItems: number;
}

// Interface for payload specific to the IMPORT action
export interface ImportPayload {
	queryString: string;
}

/**
 * action enum for message actions
 */
export enum MessageAction {
	GET_CARD_BLOCKS = 'getCardBlocks',
	GET_LINES = 'getLines',
	GET_OAUTH_TOKEN = 'getOAuthToken',
	IMPORT = 'import',
	CREATE_LINE = 'createLine',
	DELETE_LINE = 'deleteLine',
	START_LINE_IMPORT = 'startLineImport',
	CLOSE_MODAL = 'closeModal',
}
