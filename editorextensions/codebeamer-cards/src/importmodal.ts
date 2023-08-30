import {
	CollectionDefinition,
	CollectionProxy,
	EditorClient,
	ExtensionCardFieldDefinition,
	SerializedFieldType,
	ScalarFieldTypeEnum,
	SemanticKind,
	FieldConstraintType,
	DataProxy,
	SchemaDefinition,
} from 'lucid-extension-sdk';

import { DefaultFieldNames, CollectionName } from './name';

const taskSchema: SchemaDefinition = {
	primaryKey: [DefaultFieldNames.Id],
	fields: [
		{
			name: DefaultFieldNames.Id,
			type: ScalarFieldTypeEnum.STRING,
			mapping: [SemanticKind.Id],
			// constraints: [{type: FieldConstraintType.LOCKED}],
		},
		{
			name: 'Completed',
			type: ScalarFieldTypeEnum.BOOLEAN,
			mapping: [SemanticKind.Status],
		},
		{
			name: 'Content',
			type: ScalarFieldTypeEnum.STRING,
			mapping: [SemanticKind.Name],
		},
	],
};

export class CodebeamerImportModal {
	constructor(private readonly editorClient: EditorClient) {}

	public async getSearchFields(
		searchSoFar: Map<string, SerializedFieldType>
	): Promise<ExtensionCardFieldDefinition[]> {
		return [];
	}

	public async search(fields: Map<string, SerializedFieldType>): Promise<{
		data: CollectionDefinition;
		fields: ExtensionCardFieldDefinition[];
		partialImportMetadata: {
			collectionId: string;
			syncDataSourceId?: string;
		};
	}> {
		const rand1 = Math.floor(Math.random() * 1000);
		const rand2 = Math.floor(Math.random() * 1000);
		const tasks = ['t' + rand1, 't' + rand2];
		console.log('Tasks: ' + tasks);

		const data: CollectionDefinition = {
			schema: {
				fields: [
					{
						name: DefaultFieldNames.Id,
						type: ScalarFieldTypeEnum.NUMBER,
						mapping: [SemanticKind.Id],
					},
					{
						name: 'Content',
						type: ScalarFieldTypeEnum.STRING,
						mapping: [SemanticKind.Title],
					},
				],
				primaryKey: [DefaultFieldNames.Id],
			},
			items: new Map(
				tasks.map((taskId) => [
					taskId,
					{
						[DefaultFieldNames.Id]: taskId,
						['Content']: 'content for ' + taskId,
						['Completed']: false,
					},
				])
			),
		};
		console.log(data);

		return {
			data: data,
			fields: [
				{
					name: 'Content',
					label: 'Content',
					type: ScalarFieldTypeEnum.STRING,
				},
				{
					name: 'Completed',
					label: 'Completed',
					type: ScalarFieldTypeEnum.BOOLEAN,
				},
			],
			partialImportMetadata: {
				collectionId: CollectionName,
			},
		};
	}

	public async import(
		primaryKeys: string[],
		searchFields: Map<string, SerializedFieldType>
	): Promise<{ collection: CollectionProxy; primaryKeys: string[] }> {
		const data = new DataProxy(this.editorClient);
		const source =
			data.dataSources.find(
				(source) => source.getSourceConfig()['from'] === 'example'
			) || data.addDataSource('example', { from: 'example' });

		// retrieve existing collection or create a new one
		const collection =
			source.collections.find(
				(collection) => collection.getName() === CollectionName
			) || source.addCollection(CollectionName, taskSchema);

		const filteredPKs = primaryKeys.filter(
			(taskId) => !collection.items.get(taskId).exists()
		);

		const tasks: Record<string, SerializedFieldType>[] = filteredPKs.map(
			(taskId) => {
				return {
					Id: taskId,
					Content: 'content for ' + taskId,
					Completed: false,
				};
			}
		);

		collection.patchItems({ added: tasks });

		return { collection, primaryKeys: filteredPKs };
	}
}
