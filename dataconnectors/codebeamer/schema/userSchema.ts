import {
	declareSchema,
	ItemType,
} from 'lucid-extension-sdk/core/data/fieldspecification';
import { CollectionEnumFieldNames } from 'lucid-extension-sdk/core/data/fieldtypedefinition/collectionenumfieldtype';
import { ScalarFieldTypeEnum } from 'lucid-extension-sdk/core/data/fieldtypedefinition/scalarfieldtype';

export const userSchema = declareSchema({
	primaryKey: [CollectionEnumFieldNames.Id],
	fields: {
		[CollectionEnumFieldNames.Id]: { type: ScalarFieldTypeEnum.STRING },
		[CollectionEnumFieldNames.Name]: { type: ScalarFieldTypeEnum.STRING },
		[CollectionEnumFieldNames.IconUrl]: {
			type: [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL] as const,
		},
	},
});

export type UserType = ItemType<typeof userSchema.example>;
