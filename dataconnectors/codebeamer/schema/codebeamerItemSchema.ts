import {
	CollectionEnumFieldType,
	declareSchema,
	FieldConstraintType,
	FieldTypeDefinition,
	ItemType,
	ScalarFieldTypeEnum,
} from 'lucid-extension-sdk';
import { DefaultFieldNames } from '../../../common/names';
import { SemanticFields } from 'lucid-extension-sdk/core/data/fieldtypedefinition/semanticfields';

const nullable = <T extends FieldTypeDefinition>(type: T) => {
	return [type, ScalarFieldTypeEnum.NULL] as const;
};

export const codebeamerItemSchema = declareSchema({
	primaryKey: [DefaultFieldNames.Id],
	fields: {
		[DefaultFieldNames.Id]: {
			type: ScalarFieldTypeEnum.NUMBER,
			constraints: [{ type: FieldConstraintType.LOCKED }],
		},
		[DefaultFieldNames.Name]: {
			type: ScalarFieldTypeEnum.STRING,
			mapping: [SemanticFields.Title],
		},
		[DefaultFieldNames.Description]: {
			type: nullable(ScalarFieldTypeEnum.STRING),
			mapping: [SemanticFields.Description],
		},
		[DefaultFieldNames.Assignee]: {
			type: nullable(new CollectionEnumFieldType('users')),
			mapping: [SemanticFields.User],
			constraints: [{ type: FieldConstraintType.MAX_VALUE, value: 1 }],
		},
		[DefaultFieldNames.Link]: {
			type: ScalarFieldTypeEnum.STRING,
			mapping: [SemanticFields.SourceItemUrl],
			constraints: [{ type: FieldConstraintType.LOCKED }],
		},
		[DefaultFieldNames.ProjectId]: {
			type: ScalarFieldTypeEnum.NUMBER,
			constraints: [{ type: FieldConstraintType.LOCKED }],
		},
		[DefaultFieldNames.TrackerId]: {
			type: ScalarFieldTypeEnum.NUMBER,
			constraints: [{ type: FieldConstraintType.LOCKED }],
		},
		[DefaultFieldNames.Team]: {
			type: nullable(new CollectionEnumFieldType('teams')),
			constraints: [{ type: FieldConstraintType.MAX_VALUE, value: 1 }],
		},
		[DefaultFieldNames.StoryPoints]: {
			type: nullable(ScalarFieldTypeEnum.NUMBER),
			mapping: [SemanticFields.Estimate],
			constraints: [{ type: FieldConstraintType.MIN_VALUE, value: 0 }],
		},
		[DefaultFieldNames.Version]: {
			type: ScalarFieldTypeEnum.NUMBER,
			constraints: [{ type: FieldConstraintType.LOCKED }],
		},
		[DefaultFieldNames.Status]: {
			type: new CollectionEnumFieldType('statuses'),
			mapping: [SemanticFields.Status],
			constraints: [{ type: FieldConstraintType.LOCKED }],
		},
		[DefaultFieldNames.Owner]: {
			type: nullable(new CollectionEnumFieldType('users')),
			mapping: [SemanticFields.User],
			constraints: [{ type: FieldConstraintType.MAX_VALUE, value: 1 }],
		},
	},
});

export type CodebeamerItemType = ItemType<typeof codebeamerItemSchema.example>;
