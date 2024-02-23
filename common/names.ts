// common names

export const DataConnectorName = 'codebeamer';
export const DataSourceName = 'codebeamer';
export const CollectionName = 'items';
export const OAuthProvider = 'google';

export const baseUrl =
	'https://mocked-codebeamer-oauth-fd59eb404ed5.herokuapp.com/cb';

export enum DataAction {
	Import = 'Import',
	HardRefresh = 'HardRefresh',
	Patch = 'Patch',
}

/**
 * Enumerates the "standard" ~atomic (of type number, text, choice, date, duration and user-reference) properties of any codeBeamer item.
 * In fact, there seems to not be a set-in-stone standard, which all cb items must have in common (but maybe the ID).
 * Therefore, this enumeration only lists the presumably most common properties. To decide what's "most common", only trackers
 * and Stakeholder-requirements in the Retina (custom codeBeamer) Toolchains project at Roche Diagnostics were considered.
 */

export enum DefaultFieldNames {
	Name = 'Name',
	Id = 'Id',
	Assignee = 'Assignee',
	Link = 'Link',
	StoryPoints = 'Story Points',
	Description = 'Description',
	ProjectId = 'Project Id',
	TrackerId = 'Tracker Id',
	Team = 'Team',
	Version = 'Version',
	Status = 'Status',
	Owner = 'Owner',
}
