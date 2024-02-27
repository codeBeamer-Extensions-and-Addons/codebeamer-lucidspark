import {
	declareSchema,
	ItemType,
} from 'lucid-extension-sdk/core/data/fieldspecification';
import { CollectionEnumFieldNames } from 'lucid-extension-sdk/core/data/fieldtypedefinition/collectionenumfieldtype';
import { ScalarFieldTypeEnum } from 'lucid-extension-sdk/core/data/fieldtypedefinition/scalarfieldtype';

export const statusSchema = declareSchema({
	primaryKey: [CollectionEnumFieldNames.Id],
	fields: {
		[CollectionEnumFieldNames.Id]: { type: ScalarFieldTypeEnum.STRING },
		[CollectionEnumFieldNames.Name]: { type: ScalarFieldTypeEnum.STRING },
	},
});

export type StatusType = ItemType<typeof statusSchema.example>;
