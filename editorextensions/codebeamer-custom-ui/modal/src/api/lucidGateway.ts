import { RelationshipType } from '../enums/associationRelationshipType.enum';
import { getColorForRelationshipType } from './utils/getColorForRelationshipType';
import { Message, MessageAction } from '../models/messageInterfaces';
import { MessageHandler } from './messageHandler';

export class LucidGateway {
	/**
	 * Create a line between two card blocks
	 * @param importId - The ID of the import.
	 * @param sourceBlockId - The ID of the source card block.
	 * @param targetBlockId - The ID of the target card block.
	 * @param relationshipType - The type of relationship between the codebeamer items on the two card blocks.
	 */
	public static createLine(
		importId: number,
		sourceBlockId: string,
		targetBlockId: string,
		relationshipType: RelationshipType
	) {
		const lineColor = getColorForRelationshipType(relationshipType);

		this.postMessage({
			action: MessageAction.CREATE_LINE,
			payload: {
				importId,
				sourceBlockId,
				targetBlockId,
				relationshipType,
				lineColor,
			},
		});
	}

	/**
	 * Start an import with specified ID and total items.
	 * @param id - The import ID.
	 * @param items - The total number of items to import.
	 */
	public static startLineImport(id: number, items: number) {
		this.postMessage({
			action: MessageAction.START_LINE_IMPORT,
			payload: { id: id, totalItems: items },
		});
	}

	/**
	 * Start an import with query string
	 * @param itemIds - The ids of the Codebeamer Items to import
	 * @param trackerId - The id of the tracker that the items belong to
	 * @param projectId - The id of the project that the tracker belongs to
	 */
	public static import(
		itemIds: number[],
		trackerId: number,
		projectId: number
	) {
		this.postMessage({
			action: MessageAction.IMPORT,
			payload: {
				itemIds: itemIds,
				trackerId: trackerId,
				projectId: projectId,
			},
		});
	}

	/**
	 * Request card block data from the parent window.
	 */
	public static requestCardBlockData() {
		this.postMessage({
			action: MessageAction.GET_CARD_BLOCKS,
		});
	}

	/**
	 * Request line data from the parent window.
	 */
	public static requestLineData() {
		this.postMessage({
			action: MessageAction.GET_LINES,
		});
	}

	/**
	 * Request the OAuth token from the parent window.
	 */
	public static requestOAuthToken() {
		this.postMessage({
			action: MessageAction.GET_OAUTH_TOKEN,
		});
	}

	/**
	 * Get the OAuth token from Lucid.
	 * @returns The OAuth token.
	 */
	public static async getOAuthToken(): Promise<string> {
		return new Promise((resolve, reject) => {
			MessageHandler.getInstance().getOAuthToken((data) => {
				if (data && data.length > 0) {
					const token = data[0];
					return resolve(token);
				} else {
					return reject(new Error('OAuth token not received from Lucid.'));
				}
			});
		});
	}

	/**
	 * Delete a line by id
	 * @param importId - The ID of the import.
	 * @param lineId - The ID of the line to delete.
	 */
	public static deleteLine(importId: number, lineId: string) {
		this.postMessage({
			action: MessageAction.DELETE_LINE,
			payload: { importId, lineId },
		});
	}

	/**
	 * Call this function to close the modal.
	 */
	public static closeModal() {
		this.postMessage({ action: MessageAction.CLOSE_MODAL });
	}

	/**
	 * Post a message to the parent window.
	 */
	private static postMessage(message: Message) {
		window.parent.postMessage(message, '*');
	}
}
