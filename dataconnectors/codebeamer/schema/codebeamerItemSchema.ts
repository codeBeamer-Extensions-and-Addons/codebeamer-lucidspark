import {
	declareSchema,
	FieldConstraintType,
	ItemType,
	ScalarFieldTypeEnum,
} from 'lucid-extension-sdk';
import { DefaultFieldNames } from '../../../common/names';
import { SemanticFields } from 'lucid-extension-sdk/core/data/fieldtypedefinition/semanticfields';

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
	},
});

export type CodebeamerItemType = ItemType<typeof codebeamerItemSchema.example>;
