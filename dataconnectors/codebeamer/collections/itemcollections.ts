import {
	FieldConstraintType,
	ItemType,
	ScalarFieldTypeEnum,
	SemanticKind,
	declareSchema,
} from 'lucid-extension-sdk';
import { DefaultFieldNames } from '../../../common/names';
import { Item } from '../../../editorextensions/codebeamer-cards/src/model/codebeamermodel'; //move to common?

export const itemSchema = declareSchema({
	primaryKey: [DefaultFieldNames.Id],
	fields: {
		[DefaultFieldNames.Id]: {
			type: ScalarFieldTypeEnum.NUMBER,
			mapping: [SemanticKind.Id],
			constraints: [
				{
					type: FieldConstraintType.LOCKED,
				},
			],
		},
		[DefaultFieldNames.Summary]: {
			type: ScalarFieldTypeEnum.STRING,
			mapping: [SemanticKind.Name],
		},
		[DefaultFieldNames.Description]: {
			type: ScalarFieldTypeEnum.STRING,
			mapping: [SemanticKind.Description],
		},
		[DefaultFieldNames.Tracker]: {
			type: ScalarFieldTypeEnum.STRING,
			mapping: [SemanticKind.IssueType],
		},
		[DefaultFieldNames.Status]: {
			type: ScalarFieldTypeEnum.STRING,
			mapping: [SemanticKind.Status],
		},
		[DefaultFieldNames.AssignedTo]: {
			type: ScalarFieldTypeEnum.STRING,
			mapping: [SemanticKind.Assignee],
		},
	},
});

export type ItemFieldStructure = typeof itemSchema.example;
export type CodebeamerItemType = ItemType<ItemFieldStructure>;

export function getFormattedItem(item: Item) {
	return {
		[DefaultFieldNames.Id]: item.id,
		[DefaultFieldNames.Summary]: item.name,
		[DefaultFieldNames.Description]: item.description,
		[DefaultFieldNames.Tracker]: item.tracker?.name || '',
		[DefaultFieldNames.Status]: item.status?.name || '',
		[DefaultFieldNames.AssignedTo]:
			item.assignedTo.map((a) => a.name).join(', ') || '',
	};
}
