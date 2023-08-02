import {
	CollectionDefinition,
	CollectionProxy,
	EditorClient,
	ExtensionCardFieldDefinition,
	FieldConstraintType,
	LucidCardIntegrationRegistry,
	ScalarFieldTypeEnum,
	SemanticKind,
	SerializedFieldType,
	isString,
} from 'lucid-extension-sdk';
import { CodebeamerClient } from './net/codebeamerclient';
import { CollectionName, DefaultFieldNames } from '../../../common/names';

export interface ImportModalMessage {
	name: string;
	content: string;
}

export class CodebeamerImportModal {
	private codebeamerClient: CodebeamerClient;
	private readonly client: EditorClient;

	private readonly searchField = 'search';
	private readonly projectField = 'project';
	private readonly trackerField = 'tracker';

	constructor(client: EditorClient) {
		this.client = client;
		this.codebeamerClient = new CodebeamerClient(client);
		// super(client, {
		// 	title: 'Import a thing',
		// 	width: 600,
		// 	height: 400,
		// 	content: importHtml,
		// });
	}

	public async onSetup() {
		console.log('onSetup');
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
				constraints: [
					{
						type: FieldConstraintType.REQUIRED, // this seems to also need separate enforcement in the search()
					},
				],
			},
			{
				name: this.searchField,
				label: 'Search',
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

		const items = await this.codebeamerClient.searchItems(
			search,
			projectId,
			trackerId
		);

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
				syncDataSourceId: `${projectId}${
					trackerId ? '-' + trackerId : ''
				}`,
			},
		};

		throw new Error('Not implemented either, materess');
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
