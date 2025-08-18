import {
	declareSchema,
	ItemType,
} from 'lucid-extension-sdk/core/data/fieldspecification';
import { CollectionEnumFieldNames } from 'lucid-extension-sdk/core/data/fieldtypedefinition/collectionenumfieldtype';
import { ScalarFieldTypeEnum } from 'lucid-extension-sdk/core/data/fieldtypedefinition/scalarfieldtype';

export const teamSchema = declareSchema({
	primaryKey: [CollectionEnumFieldNames.Id],
	fields: {
		[CollectionEnumFieldNames.Id]: { type: ScalarFieldTypeEnum.STRING },
		[CollectionEnumFieldNames.Name]: { type: ScalarFieldTypeEnum.STRING },
	},
});

export type TeamType = ItemType<typeof teamSchema.example>;
