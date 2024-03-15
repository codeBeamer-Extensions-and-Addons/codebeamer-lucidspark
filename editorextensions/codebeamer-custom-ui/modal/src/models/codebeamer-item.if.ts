import { CodeBeamerReference } from './codebeamer-reference.if';
import { CodeBeamerUserReference } from './codebeamer-user-reference.if';

/**
 * General structure of a CodeBeamerItem as received from the API.
 */
export interface CodeBeamerItem {
	id: number;
	name: string;
	description: string;
	descriptionFormat: string;
	createdAt: Date | string;
	createdBy: CodeBeamerUserReference;
	modifiedAt: Date | string;
	modifiedBy: CodeBeamerUserReference;
	owners: CodeBeamerUserReference[];
	version: number;
	assignedTo: CodeBeamerUserReference[];
	tracker: CodeBeamerReference;
	children: CodeBeamerReference[];
	customFields: customField[];
	priority: CodeBeamerReference;
	status: CodeBeamerReference;
	categories: CodeBeamerReference[];
	subjects: CodeBeamerReference[];
	teams: CodeBeamerReference[];
	storyPoints: number;
	versions: CodeBeamerReference[];
	ordinal: number;
	typeName: string;
	comments: CodeBeamerReference[];
}

interface customField {
	type: string;
	value?: string;
}

/**
 * Some handpicked properties of what the legacy rest API gives you when you query an item's details.
 *
 * Currently only used to update it
 */
export interface CodeBeamerLegacyItem {
	id?: number;
	uri: string;
	tracker?: CodeBeamerReference;
	supervisors?: CodeBeamerUserReference[];
	name?: string;
	status?: CodeBeamerReference;
	realizedFeaturess?: [];
	versions?: CodeBeamerReference[];
	storyPoints?: number;
	team?: CodeBeamerReference[];
	assignedTo?: CodeBeamerUserReference[];
}
