import { RelationshipType } from "../enums/associationRelationshipType.enum";

/**
 * Interface for line data
 */
export interface LucidLineData {
	id: string;
	sourceBlockId: string;
	targetBlockId: string;
}

/**
 * Structure of a Relation with the specific block ids
 */
export interface BlockRelation {
	sourceBlockId: string;
	targetBlockId: string;
	type: RelationshipType;
}
