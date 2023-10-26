import {
	BlockProxy,
	CardBlockProxy,
	EditorClient,
	LineProxy,
	Modal,
	Viewport,
} from 'lucid-extension-sdk';
import { CardData } from '../modal/src/models/lucidCardData';

export interface Message {
	action: string;
	payload: any;
}

export class ImportModal extends Modal {
	constructor(client: EditorClient) {
		super(client, {
			title: 'codebeamer-cards import',
			width: 1080,
			height: 680,
			url: 'modal/index.html',
		});

		this.client.loadBlockClasses(['LucidCardBlock']);
	}

	protected viewport = new Viewport(this.client);

	imports: Map<
		number,
		{ totalItems: number; initialTotalItems: number; finished: boolean }
	> = new Map();
	cardBlocks: CardBlockProxy[] = [];
	lines: LineProxy[] = [];

	/**
	 * Handles messages received from the frame.
	 *
	 * @param {Message} message - The message received from the frame.
	 */
	protected messageFromFrame(message: Message): void {
		switch (message.action) {
			case 'startImport':
				this.imports.set(message.payload.id, {
					totalItems: message.payload.totalItems,
					initialTotalItems: message.payload.totalItems,
					finished: false,
				});
				break;
			case 'importItem':
				this.importItem(message);
				break;
			case 'updateCard':
				this.updateCard(
					message.payload.cardData,
					message.payload.cardBlockId
				);
				break;
			case 'getCardBlocks':
				this.getCardBlocks();
				break;
			case 'getLines':
				this.getLines();
				break;
			case 'closeModal':
				this.hide();
				break;
			case 'createLine':
				const sourceBlock = this.getCardById(
					message.payload.sourceBlockId
				);
				const targetBlock = this.getCardById(
					message.payload.targetBlockId
				);
				if (sourceBlock && targetBlock)
					this.createLine(
						sourceBlock,
						targetBlock,
						message.payload.relationshipType,
						message.payload.lineColor
					);
		}
	}

	/**
	 * Handles the import of an item, creating a LucidCardBlock and updating import status.
	 *
	 * @param {Message} message - The import item message.
	 */
	private importItem(message: Message): void {
		this.createLucidCardBlock(
			message.payload.cardData,
			this.imports.get(message.payload.importId)!.initialTotalItems
		);
		this.imports.get(message.payload.importId)!.totalItems--;
		if (this.imports.get(message.payload.importId)!.totalItems <= 0) {
			this.imports.delete(message.payload.importId);
			this.hide();
		}
	}

	/**
	 * Updates an existing LucidCardBlock with new data.
	 *
	 * @param {CardData} cardData - The updated card data.
	 * @param {string} cardBlockId - The ID of the card block to update.
	 */
	private updateCard(cardData: CardData, cardBlockId: string): void {
		const block = this.getCardById(cardBlockId);

		if (block instanceof CardBlockProxy) {
			this.setCardData(block, cardData);
		}
	}

	/**
	 * Retrieves a CardBlockProxy by its ID.
	 *
	 * @param {string} id - The ID of the card block to find.
	 * @returns {CardBlockProxy | undefined} - The found CardBlockProxy or undefined if not found.
	 */
	private getCardById(id: string): CardBlockProxy | undefined {
		const cardBlock = this.cardBlocks.find(
			(cardBlock) => cardBlock.id === id
		);

		if (!cardBlock) console.error(`CardBlock with id ${id} not found`);

		return cardBlock;
	}

	/**
	 * Generates coordinates for a new card with consideration for the size of the viewport
	 * and existing card blocks.
	 *
	 * @param {number} w - The width of the card.
	 * @param {number} h - The height of the card.
	 * @returns An object with 'x' and 'y' properties representing the coordinates.
	 */
	private generateCoordinates(
		w: number,
		h: number,
		totalItems: number
	): { x: number; y: number } {
		const visibleRect = this.viewport.getVisibleRect();
		let areaWidth = Math.ceil(Math.sqrt(totalItems)) * w;
		let areaHeight = Math.ceil(Math.sqrt(totalItems)) * h;

		//set areaWidth and areaHeight to 80% of viewport size if they are bigger than 80% of the viewport
		if (areaWidth > visibleRect.w * 0.8) {
			areaWidth = visibleRect.w * 0.8;
		}
		if (areaHeight > visibleRect.h * 0.8) {
			areaHeight = visibleRect.h * 0.8;
		}

		const minX = visibleRect.x + (visibleRect.w - areaWidth) / 2 - w / 2;
		const minY = visibleRect.y + (visibleRect.h - areaHeight) / 2 - h / 2;
		const maxX = visibleRect.x + (visibleRect.w + areaWidth) / 2 - w / 2;
		const maxY = visibleRect.y + (visibleRect.h + areaHeight) / 2 - h / 2;
		const x = Math.random() * (maxX - minX) + minX;
		const y = Math.random() * (maxY - minY) + minY;

		return { x, y };
	}

	/**
	 * Creates a LucidCardBlock with the provided card data.
	 *
	 * @param {CardData} cardData - The data for creating the LucidCardBlock.
	 */
	protected async createLucidCardBlock(
		cardData: CardData,
		totalItems: number
	) {
		const page = this.viewport.getCurrentPage()!;
		const widthOfCard = 420;
		const heightOfCard = 160;
		const { x, y } =
			cardData.coordinates ??
			this.generateCoordinates(widthOfCard, heightOfCard, totalItems);

		const block = page.addBlock({
			className: 'LucidCardBlock',
			boundingBox: {
				x,
				y,
				w: widthOfCard,
				h: heightOfCard,
			},
		});

		if (block instanceof CardBlockProxy) {
			this.setCardData(block, cardData);
			block.setDescription(' '); // Add empty description to disable 'Description' placeholder on created cards
			block.shapeData.set('codebeamerItemId', cardData.codebeamerItemId);
			block.shapeData.set(
				'codebeamerTrackerId',
				cardData.codebeamerTrackerId
			);
		}
	}

	/**
	 * Sets the data for a CardBlockProxy based on the provided card data.
	 *
	 * @param {CardBlockProxy} block - The CardBlockProxy to update.
	 * @param {CardData} cardData - The card data to set.
	 */
	private setCardData(block: CardBlockProxy, cardData: CardData): void {
		if (cardData.title) block.setTitle(cardData.title);
		if (cardData.description)
			block.properties.set('NoteHint', cardData.description);
		if (cardData.assignee) block.setAssignee(cardData.assignee);
		if (cardData.estimate) block.setEstimate(cardData.estimate);
		if (cardData.style)
			block.properties.set('LineColor', cardData.style.cardTheme);
	}

	/**
	 * Retrieves and sends the list of LucidCardBlocks to the modal.
	 */
	private getCardBlocks(): void {
		const cardBlocks = (
			this.viewport
				.getCurrentPage()
				?.allBlocks.filter(
					(block) => block instanceof CardBlockProxy
				) as CardBlockProxy[]
		).filter((cardBlock) => cardBlock.shapeData.get('codebeamerItemId'));

		// Save card blocks to the class to be able to access them later
		this.cardBlocks = cardBlocks;

		// Map the card blocks to the codebeamer item ids and send them to the modal
		const data = cardBlocks.map((cardBlock) => ({
			cardBlockId: cardBlock.id,
			codebeamerItemId: cardBlock.shapeData.get('codebeamerItemId'),
			codebeamerTrackerId: cardBlock.shapeData.get('codebeamerTrackerId'),
		}));
		this.sendMessage(JSON.stringify(data));
	}

	/**
	 * Retrieves and sends the list of Lines to the modal.
	 */
	private getLines(): void {
		const lines = this.viewport
			.getCurrentPage()
			?.allLines.filter(
				(line) => line instanceof LineProxy
			) as LineProxy[];

		// Save lines to the class to be able to access them later
		this.lines = lines;

		// Filter out lines that are not connected to card blocks
		const linesConnectedToCardBlocks = lines.filter((line) => {
			const sourceBlock = line.getUpstreamConnection();
			const targetBlock = line.getDownstreamConnection();
			return (
				sourceBlock instanceof CardBlockProxy &&
				targetBlock instanceof CardBlockProxy
			);
		});

		// Map the lines to the card block ids and send them to the modal
		const data = linesConnectedToCardBlocks.map((line) => ({
			lineId: line.id,
			sourceBlockId: (line.getUpstreamConnection() as CardBlockProxy).id,
			targetBlockId: (line.getDownstreamConnection() as CardBlockProxy)
				.id,
		}));
		this.sendMessage(JSON.stringify(data));
	}

	/**
	 * creates a line connecting two block proxies
	 *
	 * @param sourceBlock - the block to connect from
	 * @param targetBlock - the block to connect to
	 * @param relationshipType - the type of relationship between the two blocks
	 */
	private createLine(
		sourceBlock: BlockProxy,
		targetBlock: BlockProxy,
		relationshipType: string,
		lineColor: string
	) {
		const line = sourceBlock.getPage().addLine({
			endpoint1: {
				connection: sourceBlock,
				linkX: 0.5,
				linkY: 1,
			},
			endpoint2: {
				connection: targetBlock,
				linkX: 0.5,
				linkY: 0,
			},
		});

		line.addTextArea(relationshipType, { location: 0.5, side: 0 });
		line.properties.set('LineColor', lineColor);
	}

	protected icon =
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHkAAAB5CAYAAAAd+o5JAAAAAXNSR0IArs4c6QAACmR0RVh0bXhmaWxlACUzQ214ZmlsZSUyMGhvc3QlM0QlMjJhcHAuZGlhZ3JhbXMubmV0JTIyJTIwbW9kaWZpZWQlM0QlMjIyMDIyLTA5LTEzVDEwJTNBMjQlM0EyMS4zMDlaJTIyJTIwYWdlbnQlM0QlMjI1LjAlMjAoV2luZG93cyUyME5UJTIwMTAuMCUzQiUyMFdpbjY0JTNCJTIweDY0KSUyMEFwcGxlV2ViS2l0JTJGNTM3LjM2JTIwKEtIVE1MJTJDJTIwbGlrZSUyMEdlY2tvKSUyMENocm9tZSUyRjEwNS4wLjAuMCUyMFNhZmFyaSUyRjUzNy4zNiUyMiUyMGV0YWclM0QlMjJmWUJGQTBvN2o5RGpKNWFMRE13UiUyMiUyMHZlcnNpb24lM0QlMjIyMC4zLjAlMjIlMjB0eXBlJTNEJTIyZGV2aWNlJTIyJTNFJTNDZGlhZ3JhbSUyMGlkJTNEJTIyR05XelhfcjhqRnNLRGJwNGpPSnQlMjIlMjBuYW1lJTNEJTIyUGFnZS0xJTIyJTNFalZkZGI1dEtFUDAxZnJ6U2dxRzNmU1NZTnR4NlNYeXhXemx2Qk1nYUd3ZkxXY2ZBcjc5elpwWW1VVlhwU3BHeU84ek81NW16NjlrOFB2YmZ6c1ZwcDd1cWJtZSUyQnF2clpmREh6ZlMlMkZ3JTJGUm4lMkJWRFdJNUc4VmlzQ2NtOG9wdlFueVpxeWRVRG5wcGFucWx3JTJCS3R1dGEyNXclMkJDc3Z1JTJCYmt1N1FkWmNUNTMxNDlxVDEzNzBldXBNUFZ2Z3J3czJ0JTJCbFA1dks3a1Q2T1ZSdjh0dTZNYnZKczZmY2wyTXhLVHZCeTY2b3V1czcwVHlaemVOejExbFpIZnU0YmxHOHFTNXk3dXNmdnY0SzdGdyUyRjIlMkY5ejRQdlRaeDM4JTJCUFRwJTJCJTJCUFglMkZjNTc4bmFoTVglMkI1N3J3VzdjVWw3SUsxdzFRQml2dUVaWFBrVXQyODFtZmJVSUdXeFdQZDNuY3ZqVzI2WiUyRnIlMkIyRm5iSFVtaHhZZWJvanlZYzNkNXJ1S3U3YzcwdmFxZmlrdHIzMW1JMnNiZ3BPMU9KQzFlVHRMQXA2YXZLZVliZGhoTlVqVkpZS3F3eFd3ZXlkYiUyRiUyQnZKcVp2NU5mNlJzNCUyRnZiekg4WWJvTEhuJTJGMmxIRlZUM1A2cnlrWDN1cHhYODJvSTUzb0lYOHRqJTJCYXIzMFZYSFg4YnFXRGJwYlhWNnVQMjN1OCUyRlRJWXRUVTN6N2NYcndkMnJhVjhlMnJkUSUyRnIlMkZWQ05UcU9ydWtpOWJJbUdyTDFsczQlMkJ0T1Z6ZG5yMGd5JTJGcFBybm9QS1ZZN205dmR0VTNZeDZPN2Nzam5VcEhlRXZOQTYwZjE0blNUVEJQRjhsVkQwRzRIWk5MRmtjOXlYeXlmSUhsdXp3WWFkMHY5eHVqMSUyQmFTNWRHVjFsYkh3WkF1b3N0ZHJxNzhMUSUyQkc1VHE2WkVPazhEMGp1OWpyUmcya0c2YUxEVVdFZGVRdDl3ZlNWMlF6TmRrQVg4bmxUdnhTTEpyMWx2dkVVRXolMkJjcDMwNmFLRW4yQzUxeVpqdjRoTmpjdjl5bVE1ZERUOEJteFg4cEU4NGtBdDExdUtHM3ZFV1JxSlpXVWxMdzA1OUViRVIyY212N1JQQnFmUDlZR2NmQTRjTTlzOTRDekZvSzJHZiUyRm9HdjdxSlJweTdFeiUyQnc2Y2tlWnc5c20ySzZ5SjdxaU5nR05TZjdxS21QbXRLZWEwTTFKVDlVbTV6allsMWE5eVFQbCUyQnVVZEEzcU1wTE5nV3VRSXg3VVh1S2lIS2tIcTRzbWU5U1BBYlkwJTJCck5PRVNmNU5GWjZuWkMlMkZMZG1QME4lMkJRZk5QNndEMGhHejNwazM5ajlMaVNjJTJCc045SHJYbjVGcnRvOVFqeEI2NUV0Skh6bFdKYlZFSHpSalNyQ3pkWDAyM0IlMkZDaVNmckZMWHBXVDkzdUJtVXo5JTJCYUlPQzZONUhQdlk4ajhiM2VPRnNyWGhNV2tMJTJGcjNSWTFvcmdPVnZDQWVMZXdwVkJycW9lTExYRjJFNE9jWGM4dDVhaGNETUNYemJqMnlFZGJ3UjRtRGY0TXNCaE9XQkZNb2E2c0Z3bzJFR05wQ1J0Y1E5b0Q4eVBYTThiY3BOYWRvJTJGWEswbXdBVThnUlBaVjVBVjZISU1BTTNHR2VCcTZoRlZ4dElQT0JBZUJQN0dLdmthOEgzRkZ0UXNGc0tWamklMkJUUGNhOVJOOHRVanNKcVJEbktUV29FRFZsYjZ1VUxlUEk5NjNBTDdIdVhvTGFXUENqbHFpUU4lMkJlOGNMdlp0ZDlOTFNtbklvR2RjWll6VHlNJTJCN3ZKZ0FXQmElMkZiRVRYSlpGNEM0Wmh0enpKZ2hQaElhcCUyQjRPVUwlMkZVdFJlSVNleTZRayUyQlNweSUyRkNqNE1hdUk1UGVSaHhhJTJGbXVTTlo3JTJGaGtZTXdJRmhUM2tXb28lMkZXQiUyQlU4aExabk5yWmQ0anhxN2dOTVU4WG5rT1k5ZzRTTDl6eGo3eUgyUTJNWWRzZXc2ZW94Z0VxNFBNNjUzd2s4JTJGejFDakhhVHklMkZWNjVEanBpTTg3WGglMkJjbkFMZmclMkZJTThEODVOMjNNQXp6blBLbk0xNVV3NXpyazJPbmlRVGxzSDdMbmJCc2Q0THI0SzdwdG5NWEYzdmN1RTd6SHptNmk5M1E4b2M0JTJCNEN6MkdjYXN6NGs3dGt2M0s4UTNVRkx6U1J5aGklMkY2SFV5OFNEOGdOTkNtV0ZheDN5M0JNejNiTHRFSEo3b0V0Y1Nic0I5bXU4aW5oZlA5YzdwY0d3Qjdoakd1OVNXZVlaekc0UVBNamR2d3ZmRWs4NG0zMXU1Y2pPMDRWNHhwelM0aTFhd0UwcnRlQzMzSTglMkY1aXZ1Z2NXY3hIaUZqZnZPQmlZejd3Umh3ZkdMY25SUzVlNDc3UGdlbXdBdnV2bFBNVDZ5WFRyZ1ptTHY0VHBMOGhJczFldUE1M2tldkdjdkVmMHJ3RWprT0psN2hPNSUyQjV4MnBubSUyRlp6NWlLZWJhNzV4S1VlJTJCQlljSTNFN3pvOFpYNHhwJTJGaTQ0RGptV3RlQ043ZyUyRk1NSEVPNThLY2xRa25BMDg4VzRTdFFPNm1FcjU2dWQlMkIwM05sN25vJTJCUmNSMmpwM3klMkZYQjBYS2pkTEFYTlBEcTVFN2lYcTJrOWN4bmswbiUyRkZxa3ZjWXJlaXQ1eDZtOUZTcyUyQnolMkIlMkJlTDFmNzJqNkFWSjN4OXFlQjFLNXZyM1V2ZW41dlh2JTJGU3AlMkJFaGZ0MVlINmRmWHRBMDhLOW9hZnQyMXVkdjczN3hUTlAlMkZnTSUzRCUzQyUyRmRpYWdyYW0lM0Ul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';
}
