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
	isNumber,
	isString,
	LucidCardIntegrationRegistry,
} from 'lucid-extension-sdk';
import { CodebeamerClient } from './net/codebeamerclient';
import { DefaultFieldNames, CollectionName } from './name';
import { Item } from './model/codebeamermodel';

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
			// constraints: [{type: FieldConstraintType.LOCKED}],
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
		{
			name: DefaultFieldNames.Link,
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
						type: ScalarFieldTypeEnum.NUMBER,
						mapping: [SemanticKind.Id],
					},
					{
						name: DefaultFieldNames.Summary,
						type: ScalarFieldTypeEnum.STRING,
						mapping: [SemanticKind.Title],
					},
					{
						name: DefaultFieldNames.Content,
						type: ScalarFieldTypeEnum.STRING,
						mapping: [SemanticKind.Description],
					},
				],
				primaryKey: [DefaultFieldNames.Id],
			},
			items: new Map(
				items.map((item) => [
					item.id.toString(),
					{
						[DefaultFieldNames.Id]: item.id,
						[DefaultFieldNames.Summary]: item.name,
						[DefaultFieldNames.Content]: item.description,
					},
				])
			),
		};
		console.log(data);

		return {
			data: data,
			fields: [
				{
					name: DefaultFieldNames.Id,
					label: DefaultFieldNames.Id,
					type: ScalarFieldTypeEnum.NUMBER,
				},
				{
					name: DefaultFieldNames.Summary,
					label: DefaultFieldNames.Summary,
					type: ScalarFieldTypeEnum.STRING,
				},
				{
					name: DefaultFieldNames.Content,
					label: DefaultFieldNames.Content,
					type: ScalarFieldTypeEnum.STRING,
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
			) ?? data.addDataSource('example', { from: 'example' });

		// retrieve existing collection or create a new one
		const collection =
			source.collections.find(
				(collection) => collection.getName() === CollectionName
			) ?? source.addCollection(CollectionName, itemSchema);

		const filteredPKs = primaryKeys.filter(
			(taskId) => !collection.items.get(taskId).exists()
		);

		console.log('Import items: ', filteredPKs);
		const rawItems: Item[] = await this.codebeamerClient.getItems(
			filteredPKs,
			searchFields.get(this.projectField) as number | undefined,
			searchFields.get(this.trackerField) as number | undefined
		);

		const items: Record<string, SerializedFieldType>[] = rawItems.map(
			(item) => {
				return {
					Id: item.id,
					Summary: item.name,
					Description: item.description,
					Link: `https://retina.roche.com/cb/issue/${item.id}`,
					Project: item.tracker.name,
				};
			}
		);
		console.log('Fetched data: ', items);

		collection.patchItems({ added: items });

		console.log('Finishing import (pre return)');

		return { collection, primaryKeys: filteredPKs };
	}
}
