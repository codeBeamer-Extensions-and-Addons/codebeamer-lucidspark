/**
 * The codebeamer Item in all its glory
 */
export interface Item {
	id: number;
	name: string;
	description: string;
	descriptionFormat: string;
	createdAt: Date;
	createdBy: UserReference;
	modifiedAt: Date;
	modifiedBy: UserReference;
	owners: UserReference[];
	version: number;
	assignedTo: UserReference[];
	tracker: EntityReference;
	children: [];
	subjects: EntityReference[];
	customFields: CustomFieldReference[];
	priority: EntityReference;
	status: EntityReference;
	categories: [];
	resolutions: [];
	severities: [];
	versions: [];
	ordinal: number;
	typeName: string;
	comments: EntityReference[];
	tags: [];
}

export interface EntityReference {
	id: number;
	name: string;
	type: string;
}

export interface UserReference {
	id: number;
	name: string;
	type: string;
	email: string;
}

interface CustomFieldReference {
	fieldId: number;
	name: string;
	value: string;
	type: string;
}

/**
 * Project summary in a /projects query
 */
export interface ProjectSummary {
	id: number;
	name: string;
	type: string;
}
