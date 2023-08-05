import {
	CollectionDefinition,
	CollectionProxy,
	DocumentProxy,
	EditorClient,
	ExtensionCardFieldDefinition,
	FieldConstraintType,
	LucidCardIntegrationRegistry,
	ScalarFieldTypeEnum,
	SemanticKind,
	SerializedFieldType,
	UserProxy,
	isNumber,
	isString,
} from 'lucid-extension-sdk';
import { CodebeamerClient } from './net/codebeamerclient';
import {
	CollectionName,
	DataAction,
	DataConnectorName,
	DefaultFieldNames,
} from '../../../common/names';
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
		console.log('onSetup');
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

			this.cachedProjectId = isNumber(cachedParams.projectId)
				? cachedParams.projectId
				: undefined;

			this.cachedTrackerId = isNumber(cachedParams.trackerId)
				? cachedParams.trackerId
				: undefined;
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

		return {
			data: {
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
						// {
						//     name: DefaultFieldNames.AssignedTo,
						//     type: ScalarFieldTypeEnum.STRING,
						//     mapping: [SemanticKind.Assignee]
						// },
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
			},
			fields: [
				{
					name: DefaultFieldNames.Summary,
					label: DefaultFieldNames.Summary,
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
				syncDataSourceId: `${projectId}-${trackerId}`,
			},
		};
	}

	public async import(
		primaryKeys: string[],
		searchFields: Map<string, SerializedFieldType>
	): Promise<{
		collection: CollectionProxy;
		primaryKeys: string[];
	}> {
		const projectId = searchFields.get(this.projectField) as number;
		const trackerId = searchFields.get(this.trackerField) as number;

		if (isNaN(projectId) || isNaN(trackerId)) {
			throw new Error('No tracker selected');
		}

		console.log("Yeah, no, let's import already. Sure.");

		//! probably not working because of the OAuthProvider specified in the data-connector's manifest
		//! and you can't specify none..
		await this.client.performDataAction({
			dataConnectorName: DataConnectorName,
			actionName: DataAction.Import,
			actionData: {
				projectId,
				trackerId,
				itemIds: primaryKeys.map((p) => JSON.parse(p)),
			},
			syncDataSourceIdNonce: `${projectId}-${trackerId}`,
			asynchronous: true,
		});

		console.log('Performed.');

		const collection = await this.client.awaitDataImport(
			DataConnectorName,
			`${projectId}-${trackerId}`,
			CollectionName,
			primaryKeys
		);

		console.log('Collection noted.');

		return { collection, primaryKeys };
	}
}
