import {
	LucidCardIntegration,
	EditorClient,
	DataSourceProxy,
	FieldDisplayType,
	OnClickHandlerKeys,
	HorizontalBadgePos,
	LucidCardIntegrationRegistry,
	isNumber,
	DataProxy,
	DataItemProxy,
	ExtensionCardFieldOption,
	VerticalBadgePos,
	FieldConstraintType,
	ScalarFieldTypeEnum,
	SerializedFieldType,
	ExtensionCardFieldDefinition,
	CollectionProxy,
} from 'lucid-extension-sdk';
import {
	CollectionName,
	DataConnectorName,
	DefaultFieldNames,
} from '../../../common/names';
import { CodebeamerImportModal } from './CodebeamerImportModal';
import { ImportModal } from './importmodal';
import { CodebeamerClient } from './net/codebeamerclient';
import { CbqlApiQuery } from '../../../common/models/cbqlApiQuery';

export class CodebeamerCardIntegration extends LucidCardIntegration {
	private codebeamerClient: CodebeamerClient;
	private data: DataProxy;
	constructor(private readonly editorClient: EditorClient) {
		super(editorClient);
		this.codebeamerClient = new CodebeamerClient(editorClient);
		this.data = new DataProxy(editorClient);
	}

	/**
	 * Helper function to format dataItemProxy for search results
	 * @param dataItemProxy
	 * @returns
	 */
	private formatDataItemProxyForSearch = (dataItemProxy: DataItemProxy) => ({
		label: dataItemProxy.fields.get('name') as string,
		value: dataItemProxy.fields.get('id') as string,
		iconUrl: dataItemProxy.fields.get('iconUrl') as string,
	});

	/**
	 * Callback to search for users
	 */
	private userSearchCallback =
		LucidCardIntegrationRegistry.registerFieldSearchCallback(
			this.editorClient,
			async (search, cardData) => {
				const projectId = cardData.get(DefaultFieldNames.ProjectId);
				const userCollection = this.data.dataSources
					.find((source) => source.getName() === DataConnectorName)
					?.collections.find(
						(collection) => collection.getName() === 'users'
					);

				if (!isNumber(projectId) || !userCollection) return [];

				const decodedOauthToken = await this.editorClient
					.getOAuthToken('google')
					.then(async (token) => {
						return token
							? await this.codebeamerClient.getTokenInfo(token)
							: undefined;
					});

				// Search for users in the existing userCollection based on the search term
				const existingUsersInCollection = userCollection.items.filter(
					(item) =>
						(item.fields.get('name') as string)
							.toLowerCase()
							.includes(search.toLowerCase())
				);

				const searchResultsFromCodebeamer = (
					await this.codebeamerClient.searchUsers(search, projectId)
				).users.map((user) => {
					let iconUrl: string | undefined = '';

					// Check if user is already in the existing collection
					const userInCollection = existingUsersInCollection.find(
						(item) => item.fields.get('id') === user.id.toString()
					);

					// If not, then add it to the collection
					if (!userInCollection) {
						if (
							decodedOauthToken &&
							user.email === decodedOauthToken.email
						) {
							// Decode oauth token and get profile picture url
							iconUrl = decodedOauthToken.picture || undefined;
						}

						userCollection.patchItems({
							added: [
								{
									id: user.id.toString(),
									name: user.name,
									iconUrl: iconUrl,
								},
							],
						});
					}

					return {
						label: user.name,
						value: user.id.toString(),
						iconUrl: iconUrl,
					};
				});

				// Merge and return the search results from both existing collection and Codebeamer
				const mergedResults = new Map<string, ExtensionCardFieldOption>();
				existingUsersInCollection.forEach((userItem) => {
					const formattedUser =
						this.formatDataItemProxyForSearch(userItem);
					mergedResults.set(formattedUser.value, formattedUser);
				});

				searchResultsFromCodebeamer.forEach((user) => {
					const formattedUser = {
						label: user.label,
						value: user.value,
						iconUrl: user.iconUrl,
					};
					mergedResults.set(formattedUser.value, formattedUser);
				});

				return Array.from(mergedResults.values());
			}
		);

	/**
	 * Callback to search for teams
	 */
	private teamSearchCallback =
		LucidCardIntegrationRegistry.registerFieldSearchCallback(
			this.client,
			async (search, cardData) => {
				const projectId = cardData.get(
					DefaultFieldNames.ProjectId
				) as number;
				const teamCollection = this.data.dataSources
					.find((source) => source.getName() === DataConnectorName)
					?.collections.find(
						(collection) => collection.getName() === 'teams'
					);

				if (!isNumber(projectId) || !teamCollection) return [];

				const teamTracker = await this.codebeamerClient.getTeamTracker(
					projectId
				);

				const existingTeamsInCollection = teamCollection.items.filter(
					(item) =>
						(item.fields.get('name') as string)
							.toLowerCase()
							.includes(search.toLowerCase())
				);

				const body: CbqlApiQuery = {
					page: 1,
					pageSize: 10,
					queryString: `tracker.id IN (${teamTracker.id}) AND Summary LIKE '${search}%'`,
				};

				const searchResultsFromCodebeamer = (
					await this.codebeamerClient.getItems(body)
				).items.map((team) => {
					// Check if team is already in the existing collection
					const teamInCollection = existingTeamsInCollection.find(
						(item) => item.fields.get('id') === team.id.toString()
					);

					// If not, then add it to the collection
					if (!teamInCollection) {
						teamCollection.patchItems({
							added: [
								{
									id: team.id.toString(),
									name: team.name,
								},
							],
						});
					}

					return {
						label: team.name,
						value: team.id.toString(),
					};
				});

				// Merge and return the search results from both existing collection and Codebeamer
				const mergedResults = new Map<string, ExtensionCardFieldOption>();
				existingTeamsInCollection.forEach((team) => {
					const fomattedTeam = this.formatDataItemProxyForSearch(team);
					mergedResults.set(fomattedTeam.value, fomattedTeam);
				});

				searchResultsFromCodebeamer.forEach((team) => {
					const formattedTeam = {
						label: team.label,
						value: team.value,
					};
					mergedResults.set(formattedTeam.value, formattedTeam);
				});

				return Array.from(mergedResults.values());
			}
		);

	/**
	 * Callback to get status options
	 */
	private statusOptionsCallback =
		LucidCardIntegrationRegistry.registerFieldOptionsCallback(
			this.client,
			async (cardData) => {
				const itemId = cardData.get(DefaultFieldNames.Id) as number;
				const codebeamerDataSource = this.data.dataSources.find(
					(source) => source.getName() === DataConnectorName
				);
				const statusCollection = codebeamerDataSource?.collections.find(
					(collection) => collection.getName() === 'statuses'
				);

				if (!isNumber(itemId) || !statusCollection) return [];

				const transitions = await this.codebeamerClient.getTransitions(
					itemId
				);
				const toStatuses = transitions.map((transition) => {
					return transition.toStatus;
				});
				const toStatusesIds = toStatuses.map((status) =>
					status.id.toString()
				);

				const existingStatusesInCollection = statusCollection.items.filter(
					(item) =>
						toStatusesIds.some((id) => item.fields.get('id') === id)
				);

				return transitions.map((transition) => {
					// Check if the toStatus is already in the existing collection
					const statusInCollection = existingStatusesInCollection.find(
						(item) =>
							item.fields.get('id') === transition.toStatus.id.toString()
					);

					// If not, then add it to the collection
					if (!statusInCollection) {
						statusCollection.patchItems({
							added: [
								{
									id: transition.toStatus.id.toString(),
									name: transition.toStatus.name,
								},
							],
						});
					}

					// return the name of the transition to mimick the behavior in Codebeamer
					return {
						label: transition.name,
						value: transition.toStatus.id.toString(),
					};
				});
			}
		);

	public fieldConfiguration = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		getAllFields: (dataSource: DataSourceProxy) => {
			return Promise.resolve([...Object.values(DefaultFieldNames)]);
		},
		onSelectedFieldsChange: async (
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			dataSource: DataSourceProxy,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			selectedFields: string[]
		) => {},

		fieldValueSearchCallbacks: new Map([
			[DefaultFieldNames.AssignedTo, this.userSearchCallback],
			[DefaultFieldNames.Owner, this.userSearchCallback],
			[DefaultFieldNames.Team, this.teamSearchCallback],
			[DefaultFieldNames.Status, this.statusOptionsCallback],
		]),
	};

	public label = 'cb-cards';
	public itemLabel = 'Codebeamer item';
	public itemsLabel = 'Codebeamer items';
	public iconUrl =
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHkAAAB5CAYAAAAd+o5JAAAAAXNSR0IArs4c6QAACmR0RVh0bXhmaWxlACUzQ214ZmlsZSUyMGhvc3QlM0QlMjJhcHAuZGlhZ3JhbXMubmV0JTIyJTIwbW9kaWZpZWQlM0QlMjIyMDIyLTA5LTEzVDEwJTNBMjQlM0EyMS4zMDlaJTIyJTIwYWdlbnQlM0QlMjI1LjAlMjAoV2luZG93cyUyME5UJTIwMTAuMCUzQiUyMFdpbjY0JTNCJTIweDY0KSUyMEFwcGxlV2ViS2l0JTJGNTM3LjM2JTIwKEtIVE1MJTJDJTIwbGlrZSUyMEdlY2tvKSUyMENocm9tZSUyRjEwNS4wLjAuMCUyMFNhZmFyaSUyRjUzNy4zNiUyMiUyMGV0YWclM0QlMjJmWUJGQTBvN2o5RGpKNWFMRE13UiUyMiUyMHZlcnNpb24lM0QlMjIyMC4zLjAlMjIlMjB0eXBlJTNEJTIyZGV2aWNlJTIyJTNFJTNDZGlhZ3JhbSUyMGlkJTNEJTIyR05XelhfcjhqRnNLRGJwNGpPSnQlMjIlMjBuYW1lJTNEJTIyUGFnZS0xJTIyJTNFalZkZGI1dEtFUDAxZnJ6U2dxRzNmU1NZTnR4NlNYeXhXemx2Qk1nYUd3ZkxXY2ZBcjc5elpwWW1VVlhwU3BHeU84ek81NW16NjlrOFB2YmZ6c1ZwcDd1cWJtZSUyQnF2clpmREh6ZlMlMkZ3JTJGUm4lMkJWRFdJNUc4VmlzQ2NtOG9wdlFueVpxeWRVRG5wcGFucWx3JTJCS3R1dGEyNXclMkJDc3Z1JTJCYmt1N1FkWmNUNTMxNDlxVDEzNzBldXBNUFZ2Z3J3czJ0JTJCbFA1dks3a1Q2T1ZSdjh0dTZNYnZKczZmY2wyTXhLVHZCeTY2b3V1czcwVHlaemVOejExbFpIZnU0YmxHOHFTNXk3dXNmdnY0SzdGdyUyRjIlMkY5ejRQdlRaeDM4JTJCUFRwJTJCJTJCUFglMkZjNTc4bmFoTVglMkI1N3J3VzdjVWw3SUsxdzFRQml2dUVaWFBrVXQyODFtZmJVSUdXeFdQZDNuY3ZqVzI2WiUyRnIlMkIyRm5iSFVtaHhZZWJvanlZYzNkNXJ1S3U3YzcwdmFxZmlrdHIzMW1JMnNiZ3BPMU9KQzFlVHRMQXA2YXZLZVliZGhoTlVqVkpZS3F3eFd3ZXlkYiUyRiUyQnZKcVp2NU5mNlJzNCUyRnZiekg4WWJvTEhuJTJGMmxIRlZUM1A2cnlrWDN1cHhYODJvSTUzb0lYOHRqJTJCYXIzMFZYSFg4YnFXRGJwYlhWNnVQMjN1OCUyRlRJWXRUVTN6N2NYcndkMnJhVjhlMnJkUSUyRnIlMkZWQ05UcU9ydWtpOWJJbUdyTDFsczQlMkJ0T1Z6ZG5yMGd5JTJGcFBybm9QS1ZZN205dmR0VTNZeDZPN2Nzam5VcEhlRXZOQTYwZjE0blNUVEJQRjhsVkQwRzRIWk5MRmtjOXlYeXlmSUhsdXp3WWFkMHY5eHVqMSUyQmFTNWRHVjFsYkh3WkF1b3N0ZHJxNzhMUSUyQkc1VHE2WkVPazhEMGp1OWpyUmcya0c2YUxEVVdFZGVRdDl3ZlNWMlF6TmRrQVg4bmxUdnhTTEpyMWx2dkVVRXolMkJjcDMwNmFLRW4yQzUxeVpqdjRoTmpjdjl5bVE1ZERUOEJteFg4cEU4NGtBdDExdUtHM3ZFV1JxSlpXVWxMdzA1OUViRVIyY212N1JQQnFmUDlZR2NmQTRjTTlzOTRDekZvSzJHZiUyRm9HdjdxSlJweTdFeiUyQnc2Y2tlWnc5c20ySzZ5SjdxaU5nR05TZjdxS21QbXRLZWEwTTFKVDlVbTV6allsMWE5eVFQbCUyQnVVZEEzcU1wTE5nV3VRSXg3VVh1S2lIS2tIcTRzbWU5U1BBYlkwJTJCck5PRVNmNU5GWjZuWkMlMkZMZG1QME4lMkJRZk5QNndEMGhHejNwazM5ajlMaVNjJTJCc045SHJYbjVGcnRvOVFqeEI2NUV0Skh6bFdKYlZFSHpSalNyQ3pkWDAyM0IlMkZDaVNmckZMWHBXVDkzdUJtVXo5JTJCYUlPQzZONUhQdlk4ajhiM2VPRnNyWGhNV2tMJTJGcjNSWTFvcmdPVnZDQWVMZXdwVkJycW9lTExYRjJFNE9jWGM4dDVhaGNETUNYemJqMnlFZGJ3UjRtRGY0TXNCaE9XQkZNb2E2c0Z3bzJFR05wQ1J0Y1E5b0Q4eVBYTThiY3BOYWRvJTJGWEswbXdBVThnUlBaVjVBVjZISU1BTTNHR2VCcTZoRlZ4dElQT0JBZUJQN0dLdmthOEgzRkZ0UXNGc0tWamklMkJUUGNhOVJOOHRVanNKcVJEbktUV29FRFZsYjZ1VUxlUEk5NjNBTDdIdVhvTGFXUENqbHFpUU4lMkJlOGNMdlp0ZDlOTFNtbklvR2RjWll6VHlNJTJCN3ZKZ0FXQmElMkZiRVRYSlpGNEM0Wmh0enpKZ2hQaElhcCUyQjRPVUwlMkZVdFJlSVNleTZRayUyQlNweSUyRkNqNE1hdUk1UGVSaHhhJTJGbXVTTlo3JTJGaGtZTXdJRmhUM2tXb28lMkZXQiUyQlU4aExabk5yWmQ0anhxN2dOTVU4WG5rT1k5ZzRTTDl6eGo3eUgyUTJNWWRzZXc2ZW94Z0VxNFBNNjUzd2s4JTJGejFDakhhVHklMkZWNjVEanBpTTg3WGglMkJjbkFMZmclMkZJTThEODVOMjNNQXp6blBLbk0xNVV3NXpyazJPbmlRVGxzSDdMbmJCc2Q0THI0SzdwdG5NWEYzdmN1RTd6SHptNmk5M1E4b2M0JTJCNEN6MkdjYXN6NGs3dGt2M0s4UTNVRkx6U1J5aGklMkY2SFV5OFNEOGdOTkNtV0ZheDN5M0JNejNiTHRFSEo3b0V0Y1Nic0I5bXU4aW5oZlA5YzdwY0d3Qjdoakd1OVNXZVlaekc0UVBNamR2d3ZmRWs4NG0zMXU1Y2pPMDRWNHhwelM0aTFhd0UwcnRlQzMzSTglMkY1aXZ1Z2NXY3hIaUZqZnZPQmlZejd3Umh3ZkdMY25SUzVlNDc3UGdlbXdBdnV2bFBNVDZ5WFRyZ1ptTHY0VHBMOGhJczFldUE1M2tldkdjdkVmMHJ3RWprT0psN2hPNSUyQjV4MnBubSUyRlp6NWlLZWJhNzV4S1VlJTJCQlljSTNFN3pvOFpYNHhwJTJGaTQ0RGptV3RlQ043ZyUyRk1NSEVPNThLY2xRa25BMDg4VzRTdFFPNm1FcjU2dWQlMkIwM05sN25vJTJCUmNSMmpwM3klMkZYQjBYS2pkTEFYTlBEcTVFN2lYcTJrOWN4bmswbiUyRkZxa3ZjWXJlaXQ1eDZtOUZTcyUyQnolMkIlMkJlTDFmNzJqNkFWSjN4OXFlQjFLNXZyM1V2ZW41dlh2JTJGU3AlMkJFaGZ0MVlINmRmWHRBMDhLOW9hZnQyMXVkdjczN3hUTlAlMkZnTSUzRCUzQyUyRmRpYWdyYW0lM0Ul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';
	public dataConnectorName: string = DataConnectorName;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public getDefaultConfig = async (dataSource: DataSourceProxy) => {
		return Promise.resolve({
			cardConfig: {
				fieldNames: [DefaultFieldNames.Name],
				fieldDisplaySettings: new Map([
					[
						DefaultFieldNames.Id,
						{
							stencilConfig: {
								displayType: FieldDisplayType.SquareImageBadge,
								valueFormula: `="${this.iconUrl}"`,
								onClickHandlerKey: OnClickHandlerKeys.OpenBrowserWindow,
								linkFormula: '=@Link',
								horizontalPosition: HorizontalBadgePos.RIGHT,
								tooltipFormula:
									'=IF(ISNOTEMPTY(LASTSYNCTIME), "Last synced " & RELATIVETIMEFORMAT(LASTSYNCTIME), "Open in Todoist")',
								backgroundColor: '#00000000',
							},
						},
					],
					[
						DefaultFieldNames.AssignedTo,
						{
							stencilConfig: {
								displayType: FieldDisplayType.UserProfile,
								tooltipFormula: `=CONCATENATE("Assigned to ", @'Assigned To'.name)`,
								valueFormula: `OBJECT("iconUrl", @'Assigned To'.iconUrl,"name", @'Assigned To'.name)`,
								onClickHandlerKey: OnClickHandlerKeys.BasicEditPanel,
							},
						},
					],
					[
						DefaultFieldNames.StoryPoints,
						{
							stencilConfig: {
								displayType: FieldDisplayType.StandardEstimation,
								tooltipFormula: `="Story Points: " & @StoryPoints`,
								onClickHandlerKey: OnClickHandlerKeys.BasicEditPanel,
								horizontalPosition: HorizontalBadgePos.RIGHT,
								verticalPosition: VerticalBadgePos.TOP,
							},
						},
					],
					[
						DefaultFieldNames.Status,
						{
							stencilConfig: {
								displayType: FieldDisplayType.BasicTextBadge,
								valueFormula: `=@Status.name`,
								horizontalPosition: HorizontalBadgePos.LEFT,
							},
						},
					],
				]),
			},
			cardDetailsPanelConfig: {
				fields: [
					{
						name: DefaultFieldNames.Name,
						locked: false,
					},
					{
						name: DefaultFieldNames.Description,
						locked: false,
					},

					{
						name: DefaultFieldNames.AssignedTo,
						locked: false,
					},
					{
						name: DefaultFieldNames.Owner,
						locked: false,
					},
					{
						name: DefaultFieldNames.Team,
						locked: false,
					},
					{
						name: DefaultFieldNames.Status,
						locked: true,
					},
					{
						name: DefaultFieldNames.StoryPoints,
						locked: false,
					},
					{
						name: DefaultFieldNames.Version,
						locked: true,
					},
				],
			},
		});
	};

	public addCard = {
		/**
		 * Given the values entered by the user so far into input fields, return the list of all input fields
		 * to display in the create-card form.
		 */
		getInputFields: async (
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			inputSoFar: Map<string, SerializedFieldType>
		): Promise<ExtensionCardFieldDefinition[]> => {
			const projects = await this.codebeamerClient.getProjects();
			const trackerOptionsCallback =
				LucidCardIntegrationRegistry.registerFieldOptionsCallback(
					this.client,
					async (inputSoFar: Map<string, SerializedFieldType>) => {
						const selectedProjectId = inputSoFar.get(
							DefaultFieldNames.ProjectId
						);
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

			const fields: ExtensionCardFieldDefinition[] = [
				{
					name: DefaultFieldNames.Name,
					label: 'Item Summary',
					type: ScalarFieldTypeEnum.STRING,
					constraints: [{ type: FieldConstraintType.REQUIRED }],
				},
				{
					name: DefaultFieldNames.Description,
					label: 'Item Description',
					type: ScalarFieldTypeEnum.STRING,
				},
				{
					name: DefaultFieldNames.ProjectId,
					label: 'Project',
					type: ScalarFieldTypeEnum.NUMBER,
					default: projects[0]?.id,
					constraints: [{ type: FieldConstraintType.REQUIRED }],
					options: projects.map((project) => ({
						label: project.name,
						value: project.id,
					})),
				},
				{
					name: DefaultFieldNames.TrackerId,
					label: 'Tracker',
					type: ScalarFieldTypeEnum.NUMBER,
					options: trackerOptionsCallback,
					constraints: [
						{
							type: FieldConstraintType.REQUIRED,
						},
					],
				},
			];

			return fields;
		},

		/**
		 * Given the values entered by the user into input fields, create a new data record to represent the
		 * created card, and return information about that record.
		 */
		createCardData: async (
			input: Map<string, SerializedFieldType>
		): Promise<{ collection: CollectionProxy; primaryKey: string }> => {
			const projectId = input.get(DefaultFieldNames.ProjectId);
			const trackerId = input.get(DefaultFieldNames.TrackerId);
			if (
				!isNumber(trackerId) ||
				!trackerId ||
				!isNumber(projectId) ||
				!projectId
			) {
				throw new Error('No tracker or project selected');
			}
			let collection: CollectionProxy;
			try {
				//Short timeout: If we haven't done an import yet, this will fail pretty much immediately.
				//If we HAVE done an import it'll give the collection immediately.
				collection = await this.editorClient.awaitDataImport(
					DataConnectorName,
					trackerId.toString(),
					CollectionName,
					[],
					1
				);
			} catch {
				//If the import wasn't already ready, go ahead and import in the correct data source, but
				//an empty list of ote,s. This will get the collection & source set up correctly.
				await this.editorClient.performDataAction({
					dataConnectorName: DataConnectorName,
					syncDataSourceIdNonce: trackerId.toString(),
					actionName: 'Import',
					actionData: { itemIds: [], projectId, trackerId },
					asynchronous: true,
				});
				collection = await this.editorClient.awaitDataImport(
					DataConnectorName,
					trackerId.toString(),
					CollectionName,
					[]
				);
			}

			const primaryKeys = collection.patchItems({
				added: [
					{
						[DefaultFieldNames.ProjectId]: input.get(
							DefaultFieldNames.ProjectId
						),
						[DefaultFieldNames.TrackerId]: input.get(
							DefaultFieldNames.TrackerId
						),
						[DefaultFieldNames.Name]: input.get(DefaultFieldNames.Name),
						[DefaultFieldNames.Description]: input.get(
							DefaultFieldNames.Description
						),
					},
				],
			});

			if (primaryKeys.length != 1) {
				throw new Error('Failed to add new card data');
			}

			return { collection, primaryKey: primaryKeys[0] };
		},
	};

	public importModal = new ImportModal(this.editorClient);
}
