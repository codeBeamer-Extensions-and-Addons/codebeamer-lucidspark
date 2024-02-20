import {
	CollectionDefinition,
	CollectionProxy,
	EditorClient,
	ExtensionCardFieldDefinition,
	FieldConstraintType,
	LucidCardIntegrationRegistry,
	ScalarFieldTypeEnum,
	SerializedFieldType,
	isNumber,
} from 'lucid-extension-sdk';
import { CodebeamerClient } from './net/codebeamerclient';
import {
	CollectionName,
	DataAction,
	DataConnectorName,
	DefaultFieldNames,
} from '../../../common/names';
import getCbqlString from '../../../common/util/updateCbqlString';
import {
	MAX_ITEMS_PER_IMPORT,
	DEFAULT_RESULT_PAGE,
} from '../../../common/constants/cb-import-defaults';
import { SemanticFields } from 'lucid-extension-sdk/core/data/fieldtypedefinition/semanticfields';

export class CodebeamerImportModal {
	private readonly client: EditorClient;
	private readonly codebeamerClient: CodebeamerClient;

	constructor(client: EditorClient) {
		this.client = client;
		this.codebeamerClient = new CodebeamerClient(client);
	}

	private readonly projectField = 'project';
	private readonly trackerField = 'tracker';

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
						selectedProjectId as string
					);
					return trackers.map((tracker) => ({
						label: tracker.name,
						value: tracker.id,
					}));
				}
			);
		const fields: ExtensionCardFieldDefinition[] = [
			{
				name: this.projectField,
				label: 'Project',
				type: ScalarFieldTypeEnum.NUMBER,
				default: projects[0]?.id,
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
				// default: this.cachedTrackerId,
				constraints: [
					{
						type: FieldConstraintType.REQUIRED, // this seems to also need separate enforcement in the search()
					},
				],
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
		const trackerId = fields.get(this.trackerField) as number;

		const codebeamerItems = trackerId
			? (
					await this.codebeamerClient.getItems({
						page: DEFAULT_RESULT_PAGE,
						pageSize: MAX_ITEMS_PER_IMPORT,
						queryString: getCbqlString([], '', JSON.stringify(trackerId)),
					})
			  ).items
			: [];

		return {
			data: {
				schema: {
					fields: [
						{
							name: DefaultFieldNames.Id,
							type: ScalarFieldTypeEnum.NUMBER,
						},
						{
							name: DefaultFieldNames.Name,
							type: ScalarFieldTypeEnum.STRING,
							mapping: [SemanticFields.Title],
						},
					],
					primaryKey: [DefaultFieldNames.Id],
				},
				items: new Map(
					codebeamerItems.map((item) => [
						JSON.stringify(item.id),
						{
							[DefaultFieldNames.Id]: item.id,
							[DefaultFieldNames.Name]: item.name,
						},
					])
				),
			},
			fields: [
				{
					name: DefaultFieldNames.Id,
					label: DefaultFieldNames.Id,
					type: ScalarFieldTypeEnum.STRING,
				},
				{
					name: DefaultFieldNames.Name,
					label: DefaultFieldNames.Name,
					type: ScalarFieldTypeEnum.STRING,
				},
			],
			partialImportMetadata: {
				collectionId: CollectionName,
				syncDataSourceId: JSON.stringify(trackerId),
			},
		};
	}

	public async import(
		primaryKeys: string[],
		searchFields: Map<string, SerializedFieldType>
	): Promise<{ collection: CollectionProxy; primaryKeys: string[] }> {
		const trackerId = searchFields.get(this.trackerField);
		const trackerIdString = JSON.stringify(trackerId);
		if (!isNumber(trackerId) || !trackerId) {
			throw new Error('Tracker is required');
		}

		await this.client.performDataAction({
			actionName: DataAction.Import,
			dataConnectorName: DataConnectorName,
			syncDataSourceIdNonce: trackerIdString,
			actionData: {
				itemIds: primaryKeys.map((pk) => JSON.parse(pk)),
				trackerId: trackerIdString,
			},
			asynchronous: true,
		});

		// Wait for the import to complete
		const collection = await this.client.awaitDataImport(
			DataConnectorName,
			trackerIdString,
			CollectionName,
			primaryKeys
		);

		return { collection, primaryKeys };
	}
}
