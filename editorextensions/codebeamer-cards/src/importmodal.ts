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
	DocumentProxy,
	UserProxy,
	isString,
	isNumber,
	LucidCardIntegrationRegistry,
} from 'lucid-extension-sdk';
import { CodebeamerClient } from './net/codebeamerclient';
import { DefaultFieldNames, CollectionName } from './name';
import { Item } from './model/codebeamermodel';

export interface ImportModalMessage {
	name: string;
	content: string;
}

interface SearchParamsCache {
	projectId?: number;
	trackerId?: number;
	summary?: string;
}

const itemSchema: SchemaDefinition = {
	primaryKey: [DefaultFieldNames.Id],
	fields: [
		{
			name: DefaultFieldNames.Id,
			type: ScalarFieldTypeEnum.STRING,
			mapping: [SemanticKind.Id],
		},
		{
			name: DefaultFieldNames.Summary,
			type: ScalarFieldTypeEnum.STRING,
			mapping: [SemanticKind.Name],
		},
		{
			name: DefaultFieldNames.Description,
			type: ScalarFieldTypeEnum.STRING,
			mapping: [SemanticKind.Description],
		},
		// {
		//     name: DefaultFieldNames.Project,
		//     type: ScalarFieldTypeEnum.STRING,
		//     mapping: [SemanticKind.Project]
		// },
		{
			name: DefaultFieldNames.Tracker,
			type: ScalarFieldTypeEnum.STRING,
			mapping: [SemanticKind.IssueType],
		},
		{
			name: DefaultFieldNames.Status,
			type: ScalarFieldTypeEnum.STRING,
			mapping: [SemanticKind.Status],
		},
		// {
		// 	name: DefaultFieldNames.AssignedTo,
		// 	type: ScalarFieldTypeEnum.STRING,
		// 	mapping: [SemanticKind.Assignee],
		// },
	],
};

const conradSchema: SchemaDefinition = {
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
		{
			name: DefaultFieldNames.Description,
			type: ScalarFieldTypeEnum.STRING,
			mapping: [SemanticKind.Description],
		},
		// {
		//     name: DefaultFieldNames.Due,
		//     type: [ScalarFieldTypeEnum.DATE, ScalarFieldTypeEnum.DATEONLY, ScalarFieldTypeEnum.NULL] as const,
		//     mapping: [SemanticKind.EndTime],
		// },
		{
			name: 'Link',
			type: ScalarFieldTypeEnum.STRING,
			mapping: [SemanticKind.URL],
			// constraints: [{type: FieldConstraintType.LOCKED}],
		},
		{
			name: DefaultFieldNames.Project,
			type: ScalarFieldTypeEnum.STRING,
		},
	],
};

export class CodebeamerImportModal {
	private codebeamerClient: CodebeamerClient;
	private readonly client: EditorClient;

	private readonly documentProxy: DocumentProxy;
	private readonly userProxy: UserProxy;

	private readonly searchField = 'search';
	private readonly projectField = 'project';
	private readonly trackerField = 'tracker';

	private cachedProjectId: number | undefined;
	private cachedTrackerId: number | undefined;

	constructor(client: EditorClient) {
		this.client = client;
		this.codebeamerClient = new CodebeamerClient(client);
		this.documentProxy = new DocumentProxy(this.client);
		this.userProxy = new UserProxy(this.client);
	}

	public async onSetup() {
		this.loadCachedSearchParams();
	}

	/**
	 * Loads the current user's cached search params directly into the class' properties, if there are any.
	 */
	private loadCachedSearchParams() {
		const userCache = this.documentProxy.properties.get(this.userProxy.id);
		if (!isString(userCache)) return;

		try {
			const cachedParams = JSON.parse(userCache) as SearchParamsCache;

			if (!cachedParams) {
				console.info('No user cache existing');
				return;
			}

			this.cachedProjectId = isNumber(cachedParams.projectId)
				? cachedParams.projectId
				: undefined;

			this.cachedTrackerId = isNumber(cachedParams.trackerId)
				? cachedParams.trackerId
				: undefined;
			console.info('Loaded cached search parameters');
		} catch (error) {
			console.warn('Failed loading cached search parameters: ', error);
		}
	}

	/**
	 * Caches the given {@link SearchParamsCache} for the current user
	 *
	 * @param params {@link SearchParamsCache} to cache
	 */
	private cacheSearchParams(params: SearchParamsCache) {
		this.documentProxy.properties.set(
			this.userProxy.id,
			JSON.stringify(params)
		);
	}

	public async getSearchFields(
		searchSoFar: Map<string, SerializedFieldType>
	): Promise<ExtensionCardFieldDefinition[]> {
		const projects = await this.codebeamerClient.getProjects();

		const trackerOptionsCallback =
			LucidCardIntegrationRegistry.registerFieldOptionsCallback(
				this.client,
				async (inputSoFar: Map<string, SerializedFieldType>) => {
					const selectedProjectId = inputSoFar.get(this.projectField);
					if (!selectedProjectId) return [];

					const trackers = await this.codebeamerClient.getTrackers(
						selectedProjectId as number
					);

					return trackers.map((tracker) => ({
						label: tracker.name,
						value: tracker.id,
					}));
				}
			);

		const searchCallback =
			LucidCardIntegrationRegistry.registerFieldSearchCallback(
				this.client,
				async (searchText) => {
					const items = await this.codebeamerClient.searchItems(
						searchText
					);

					return items.map((item) => ({
						label: item.name,
						value: item.id,
					}));
				}
			);

		const fields: ExtensionCardFieldDefinition[] = [
			{
				name: this.projectField,
				label: 'Project',
				type: ScalarFieldTypeEnum.NUMBER,
				default: this.cachedProjectId ?? projects[0]?.id,
				constraints: [
					{
						type: FieldConstraintType.REQUIRED,
					},
				],
				options: projects.map((project) => ({
					label: project.name,
					value: project.id,
				})),
			},
			{
				name: this.trackerField,
				label: 'Tracker',
				type: ScalarFieldTypeEnum.NUMBER,
				options: trackerOptionsCallback,
				default: this.cachedTrackerId,
				constraints: [
					{
						type: FieldConstraintType.REQUIRED, // this seems to also need separate enforcement in the search()
					},
				],
			},
			{
				name: this.searchField,
				label: 'Summary',
				type: ScalarFieldTypeEnum.STRING,
				// options: searchCallback,
				default: '',
			},
		];

		return fields;
	}

	public async search(fields: Map<string, SerializedFieldType>): Promise<{
		data: CollectionDefinition;
		fields: ExtensionCardFieldDefinition[];
		partialImportMetadata: {
			collectionId: string;
			syncDataSourceId?: string;
		};
	}> {
		let search = fields.get(this.searchField);
		if (!isString(search)) search = '';

		const projectId = fields.get(this.projectField) as number | undefined;
		const trackerId = fields.get(this.trackerField) as number | undefined;

		this.cacheSearchParams({
			projectId,
			trackerId,
		});

		let items: Item[];
		if (!projectId || !trackerId) {
			items = [];
		} else {
			items = await this.codebeamerClient.searchItems(
				search,
				projectId,
				trackerId
			);
		}

		const data: CollectionDefinition = {
			schema: {
				fields: [
					{
						name: DefaultFieldNames.Id,
						type: ScalarFieldTypeEnum.STRING,
						mapping: [SemanticKind.Id],
					},
					{
						name: DefaultFieldNames.Summary,
						type: ScalarFieldTypeEnum.STRING,
						mapping: [SemanticKind.Name],
					},
					{
						name: DefaultFieldNames.Description,
						type: ScalarFieldTypeEnum.STRING,
						mapping: [SemanticKind.Description],
					},
					// {
					//     name: DefaultFieldNames.Project,
					//     type: ScalarFieldTypeEnum.STRING,
					//     mapping: [SemanticKind.Project]
					// },
					{
						name: DefaultFieldNames.Tracker,
						type: ScalarFieldTypeEnum.STRING,
						mapping: [SemanticKind.IssueType],
					},
					{
						name: DefaultFieldNames.Status,
						type: ScalarFieldTypeEnum.STRING,
						mapping: [SemanticKind.Status],
					},
				],
				primaryKey: [DefaultFieldNames.Id],
			},
			items: new Map(
				items.map((item) => [
					JSON.stringify(item.id),
					{
						[DefaultFieldNames.Id]: item.id,
						[DefaultFieldNames.Summary]: item.name,
						[DefaultFieldNames.Description]: item.description,
						[DefaultFieldNames.Tracker]: item.tracker.name,
						[DefaultFieldNames.Status]: item.status.name,
					},
				])
			),
		};

		return {
			data: data,
			fields: [
				{
					name: DefaultFieldNames.Summary,
					label: DefaultFieldNames.Summary,
					type: ScalarFieldTypeEnum.STRING,
				},
				{
					name: DefaultFieldNames.Description,
					label: DefaultFieldNames.Description,
					type: ScalarFieldTypeEnum.STRING,
				},
				{
					name: DefaultFieldNames.Status,
					label: DefaultFieldNames.Status,
					type: ScalarFieldTypeEnum.STRING,
				},
				{
					name: DefaultFieldNames.Tracker,
					label: DefaultFieldNames.Tracker,
					type: ScalarFieldTypeEnum.STRING,
				},
			],
			partialImportMetadata: {
				collectionId: CollectionName,
			},
		};
	}

	public async searchConrad(
		fields: Map<string, SerializedFieldType>
	): Promise<{
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
		const data = new DataProxy(this.client);
		const source =
			data.dataSources.find(
				(source) => source.getSourceConfig()['from'] === 'example'
			) || data.addDataSource('example', { from: 'example' });

		// retrieve existing collection or create a new one
		const collection =
			source.collections.find(
				(collection) => collection.getName() === CollectionName
			) || source.addCollection(CollectionName, itemSchema);

		const itemIds = primaryKeys.filter(
			(itemId) => !collection.items.get(itemId).exists()
		);

		const projectId = searchFields.get(this.projectField) as number;
		const trackerId = searchFields.get(this.trackerField) as number;

		const items = await this.codebeamerClient.getItems(
			itemIds,
			projectId,
			trackerId
		);

		const itemsRecord: Record<string, SerializedFieldType>[] = itemIds.map(
			(itemId) => {
				return {
					Id: itemId,
					Summary: 'content for ' + itemId,
					Description: 'long description for task ' + itemId,
					Tracker: 'test',
					Status: 'test',
				};
			}
		);
		console.log('collection schema: ', collection.getSchema());
		console.log('items being patched: ', itemsRecord);

		collection.patchItems({ added: itemsRecord });

		return { collection, primaryKeys: itemIds };
	}

	public async importConrad(
		primaryKeys: string[],
		searchFields: Map<string, SerializedFieldType>
	): Promise<{ collection: CollectionProxy; primaryKeys: string[] }> {
		const data = new DataProxy(this.client);
		const source =
			data.dataSources.find(
				(source) => source.getSourceConfig()['from'] === 'example'
			) || data.addDataSource('example', { from: 'example' });

		// retrieve existing collection or create a new one
		const collection =
			source.collections.find(
				(collection) => collection.getName() === CollectionName
			) || source.addCollection(CollectionName, conradSchema);

		const filteredPKs = primaryKeys.filter(
			(taskId) => !collection.items.get(taskId).exists()
		);

		const tasks: Record<string, SerializedFieldType>[] = filteredPKs.map(
			(taskId) => {
				return {
					Id: taskId,
					Content: 'content for ' + taskId,
					Completed: false,
					Description: 'long description for task ' + taskId,
					Link: 'www.lucidchart.com',
					Project: 'Project',
				};
			}
		);

		collection.patchItems({ added: tasks });

		return { collection, primaryKeys: filteredPKs };
	}
}
