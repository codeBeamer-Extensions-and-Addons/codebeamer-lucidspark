import { CodeBeamerItem } from './codebeamer-item.if';
import { CodeBeamerReference } from './codebeamer-reference.if';
import TrackerDetails from './trackerDetails.if';

export interface ItemQueryPage {
	page: number;
	pageSize: number;
	total: number;
	items: CodeBeamerItem[];
}

export interface TrackerSearchPage {
	page: number;
	pageSize: number;
	total: number;
	trackers: TrackerDetails[];
}

export interface UserQueryPage {
	page: number;
	pageSize: number;
	total: number;
	users: {
		id: number;
		name: string;
		firstName: string;
		lastName: string;
		email: string;
	}[];
}

/**
 * Structure of a swawgger /item/${id}/fields response, showing what
 * fields the item has and which are currently editable or readonly.
 */
export interface CodeBeamerItemFields {
	editableFields: CodeBeamerItemField[];
	readonlyFields: CodeBeamerItemField[];
}

/**
 * Structure of a field in the /item/${id}/fields response /and in the PUT body),
 * specifying a specific field's values.
 */
export interface CodeBeamerItemField {
	fieldId: number;
	name: string;
	values?: FieldOptions[];
	value?: unknown;
	type: string;
}

/**
 * Structure of options and minimal information needed to update an item's field with the /Fields endpoint
 */
export interface FieldOptions {
	id: number;
	uri?: string;
	name: string;
	type?: string;
}

/**
 * Structure of a response from the /api/v3/items/{id}/relations endpoint
 */
export interface RelationsQuery {
	itemId: {
		id: number;
		version?: number;
	};

	downstreamReferences: ItemRelation[];
	upstreamReferences: ItemRelation[];
	outgoingAssociations: ItemRelation[];
	incomingAssociations: ItemRelation[];
}

/**
 * Structure of an Item's generic relation, mentioning the relation's id & type as well as
 * the item it goes to
 */
export interface ItemRelation {
	id: number;
	itemRevision: {
		id: number;
		version?: number;
	};
	type: string;
}

export interface AssociationDetails {
	id: number;
	description: string;
	type: CodeBeamerEntityReference;
	from: CodeBeamerEntityReference;
	to: CodeBeamerEntityReference;
}

interface CodeBeamerEntityReference {
	id: number;
	name: string;
}

/**
 * Structure of a response from the google token info endpoint with openid, profile and email scopes
 */
export interface tokenInfo {
	iss: string;
	azp: string;
	aud: string;
	sub: string;
	hd: string;
	email: string;
	email_verified: string;
	at_hash: string;
	name: string;
	picture: string;
	given_name: string;
	family_name: string;
	locale: string;
	iat: string;
	exp: string;
	alg: string;
	kid: string;
	typ: string;
}

/**
 * Structure of a transition / received in an array from the items/{itemId}/transitions endpoint
 */
export interface TransitionDetails {
	id: number;
	name: string;
	description: string;
	descriptionFormat: string;
	fromStatus: CodeBeamerReference;
	toStatus: CodeBeamerReference;
	hidden: boolean;
	permissions: unknown[];
}
