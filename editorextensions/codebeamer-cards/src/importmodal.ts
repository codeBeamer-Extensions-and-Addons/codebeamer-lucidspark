import {
	CollectionDefinition,
	CollectionProxy,
	EditorClient,
	ExtensionCardFieldDefinition,
	Modal,
	SerializedFieldType,
} from 'lucid-extension-sdk';
import importHtml from '../resources/import.html';

export interface ImportModalMessage {
	name: string;
	content: string;
}

export class CodebeamerImportModal {
	constructor(client: EditorClient) {
		// super(client, {
		// 	title: 'Import a thing',
		// 	width: 600,
		// 	height: 400,
		// 	content: importHtml,
		// });
	}

	public async getSearchFields(
		searchSoFar: Map<string, SerializedFieldType>
	): Promise<ExtensionCardFieldDefinition[]> {
		throw new Error('Not implemented');
	}

	public async search(fields: Map<string, SerializedFieldType>): Promise<{
		data: CollectionDefinition;
		fields: ExtensionCardFieldDefinition[];
		partialImportMetadata: {
			collectionId: string;
			syncDataSourceId?: string;
		};
	}> {
		throw new Error('Not implemented, mate');
	}

	public async import(
		primaryKeys: string[],
		searchFields: Map<string, SerializedFieldType>
	): Promise<{
		collection: CollectionProxy;
		primaryKeys: string[];
	}> {
		throw new Error('Not implemented either, materess');
	}

	// protected frameLoaded() {
	// 	this.sendMessage({ message: 'Successfully passed message to iframe' });
	// }

	// protected messageFromFrame(message: ImportModalMessage): void {
	// 	console.log(message['name']);
	// 	console.log(message['content']);

	// 	this.hide();
	// }
}
