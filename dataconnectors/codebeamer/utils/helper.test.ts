import {
	CollectionEnumFieldType,
	CollectionPatch,
	FieldConstraintDefinition,
	FieldConstraintType,
	ScalarFieldTypeEnum,
	SchemaDefinition,
	SerializedFields,
} from 'lucid-extension-sdk';
import { SemanticFields } from 'lucid-extension-sdk/core/data/fieldtypedefinition/semanticfields';

const getSchemas = () => {
	const lockedFieldConstraint: FieldConstraintDefinition = {
		type: FieldConstraintType.LOCKED,
	};
	const userCollection = new CollectionEnumFieldType('users');
	const teamsCollection = new CollectionEnumFieldType('teams');
	const statusesCollection = new CollectionEnumFieldType('statuses');

	const itemSchema: SchemaDefinition = {
		fields: [
			{
				name: 'Id',
				type: ScalarFieldTypeEnum.NUMBER,
				constraints: [lockedFieldConstraint],
				mapping: undefined,
			},
			{
				name: 'Summary',
				type: ScalarFieldTypeEnum.STRING,
				constraints: undefined,
				mapping: [SemanticFields.Title],
			},
			{
				name: 'Description',
				type: [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL],
				constraints: undefined,
				mapping: [SemanticFields.Description],
			},
			{
				name: 'Assigned To',
				type: [userCollection, ScalarFieldTypeEnum.NULL],
				constraints: [{ type: FieldConstraintType.MAX_VALUE, value: 1 }],
				mapping: [SemanticFields.User],
			},
			{
				name: 'Link',
				type: ScalarFieldTypeEnum.STRING,
				constraints: [lockedFieldConstraint],
				mapping: [SemanticFields.SourceItemUrl],
			},
			{
				name: 'Project Id',
				type: ScalarFieldTypeEnum.NUMBER,
				constraints: [lockedFieldConstraint],
				mapping: undefined,
			},
			{
				name: 'Tracker Id',
				type: ScalarFieldTypeEnum.NUMBER,
				constraints: [lockedFieldConstraint],
				mapping: undefined,
			},
			{
				name: 'Team',
				type: [teamsCollection, ScalarFieldTypeEnum.NULL],
				constraints: [{ type: FieldConstraintType.MAX_VALUE, value: 1 }],
				mapping: undefined,
			},
			{
				name: 'Story Points',
				type: [ScalarFieldTypeEnum.NUMBER, ScalarFieldTypeEnum.NULL],
				constraints: [{ type: FieldConstraintType.MIN_VALUE, value: 0 }],
				mapping: [SemanticFields.Estimate],
			},
			{
				name: 'Version',
				type: ScalarFieldTypeEnum.NUMBER,
				constraints: [lockedFieldConstraint],
				mapping: undefined,
			},
			{
				name: 'Status',
				type: [statusesCollection, ScalarFieldTypeEnum.NULL],
				constraints: [lockedFieldConstraint],
				mapping: [SemanticFields.Status],
			},
			{
				name: 'Owner',
				type: [userCollection, ScalarFieldTypeEnum.NULL],
				constraints: [{ type: FieldConstraintType.MAX_VALUE, value: 1 }],
				mapping: [SemanticFields.User],
			},
		],
		primaryKey: ['Id'],
	};

	const userSchema: SchemaDefinition = {
		fields: [
			{
				name: 'id',
				type: ScalarFieldTypeEnum.STRING,
				constraints: undefined,
				mapping: undefined,
			},
			{
				name: 'name',
				type: ScalarFieldTypeEnum.STRING,
				constraints: undefined,
				mapping: undefined,
			},
			{
				name: 'iconUrl',
				type: [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL],
				constraints: undefined,
				mapping: undefined,
			},
		],
		primaryKey: ['id'],
	};

	const teamSchema: SchemaDefinition = {
		fields: [
			{
				name: 'id',
				type: ScalarFieldTypeEnum.STRING,
				constraints: undefined,
				mapping: undefined,
			},
			{
				name: 'name',
				type: ScalarFieldTypeEnum.STRING,
				constraints: undefined,
				mapping: undefined,
			},
		],
		primaryKey: ['id'],
	};

	const statusSchema: SchemaDefinition = {
		fields: [
			{
				name: 'id',
				type: ScalarFieldTypeEnum.STRING,
				constraints: undefined,
				mapping: undefined,
			},
			{
				name: 'name',
				type: ScalarFieldTypeEnum.STRING,
				constraints: undefined,
				mapping: undefined,
			},
		],
		primaryKey: ['id'],
	};

	return {
		items: itemSchema,
		users: userSchema,
		teams: teamSchema,
		statuses: statusSchema,
	};
};

export class RequestCollections {
	private schemas = getSchemas();

	public collectionPatches: Record<string, CollectionPatch> = {
		items: {
			patch: { items: new Map() },
			schema: this.schemas.items,
		},
		users: {
			patch: { items: new Map() },
			schema: this.schemas.users,
		},
		teams: {
			patch: { items: new Map() },
			schema: this.schemas.teams,
		},
		statuses: {
			patch: { items: new Map() },
			schema: this.schemas.statuses,
		},
	};
	public collectionItems(
		collection: string,
		...primaryKeysAndItems: [string | number, SerializedFields][]
	): RequestCollections {
		for (const [pk, serializedFields] of primaryKeysAndItems) {
			this.collectionPatches[collection].patch.items.set(
				JSON.stringify(pk),
				serializedFields
			);
		}
		return this;
	}
	public items(
		...primaryKeysAndItems: [number, SerializedFields][]
	): RequestCollections {
		return this.collectionItems('items', ...primaryKeysAndItems);
	}
	public users(
		...primaryKeysAndItems: [string, SerializedFields][]
	): RequestCollections {
		return this.collectionItems('users', ...primaryKeysAndItems);
	}
	public teams(
		...primaryKeysAndItems: [string, SerializedFields][]
	): RequestCollections {
		return this.collectionItems('teams', ...primaryKeysAndItems);
	}
	public statuses(
		...primaryKeysAndItems: [string, SerializedFields][]
	): RequestCollections {
		return this.collectionItems('statuses', ...primaryKeysAndItems);
	}
}

//expired token for profile picture parsing
export const oAuthToken =
	'eyJhbGciOiJSUzI1NiIsImtpZCI6IjZmOTc3N2E2ODU5MDc3OThlZjc5NDA2MmMwMGI2NWQ2NmMyNDBiMWIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzNjY1MTc0NzM3MTktZmIzc3RpdnA5am45MGo2cHE0OW80czBscnJuNHNnZDAuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzNjY1MTc0NzM3MTktZmIzc3RpdnA5am45MGo2cHE0OW80czBscnJuNHNnZDAuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDU5MTA1NDEyNjEwMTQwMDE3NzAiLCJoZCI6InJvY2hlLmNvbSIsImVtYWlsIjoiZXRoYW4uYmF1bWdhcnRuZXJAcm9jaGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJ6bGJMVG14RWN3WG5aVlFrZjljbU1BIiwibmFtZSI6IkV0aGFuIEJhdW1nYXJ0bmVyIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0kyUmM5Q2dLMXVMQzRha3ZHOFRnd1dubGFkLTc3MW4yQTNERnVTYWppVjlSdz1zOTYtYyIsImdpdmVuX25hbWUiOiJFdGhhbiIsImZhbWlseV9uYW1lIjoiQmF1bWdhcnRuZXIiLCJsb2NhbGUiOiJlbiIsImlhdCI6MTcwOTAyMjg3OSwiZXhwIjoxNzA5MDI2NDc5fQ.FkYs53eVfSQBkzlmEEFbnbM_dQCQqnxTmK35t3G6uWBb3_xnJmdjNEM-3FgMCDabgMRfzvzTHPpp0Nud_ZIGoCZCR2XhnGYGOc5y6urzeDOBikJj8Dx1X5-wVjVqgxp1yuwz0JaqUOV_JfWlFPcMtUvb64H03PcjlY4882eDiyXlV0WkcT8jSJ3iS_95ZnRWft0gLfpQ2oKody3SgEBWz3MxvKt4eotpBmj_1rMEGGUS_qAHatB1gVWOv3mnsc_Epy3we1bEjhNWHTzJzLFEGKt3k8I-u5G5D6C6fD5nicPYXwJnb3PjPFTwrs3zoBl6DXp5mi1PNjr2Oal96XG2oA';
