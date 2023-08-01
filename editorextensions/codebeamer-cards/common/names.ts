// common names

export const DataConnectorName = 'codebeamer';
export const CollectionName = 'Items';

/**
 * Enumerates the "standard" ~atomic (of type number, text, choice, date, duration and user-reference) properties of any codeBeamer item.
 * In fact, there seems to not be a set-in-stone standard, which all cb items must have in common (but maybe the ID).
 * Therefore, this enumeration only lists the presumably most common properties. To decide what's "most common", only trackers
 * and Stakeholder-requirements in the Retina (custom codeBeamer) Toolchains project at Roche Diagnostics were considered.
 */
export enum DefaultFieldNames {
	Summary = 'Summary',
	Description = 'Description',
	Id = 'Id',
	Teams = 'Teams',
	Owner = 'Owner',
	Status = 'Status',
	Project = 'Project',
	Tracker = 'Tracker',
	Versions = 'Versions',
	Priority = 'Priority',
	StoryPoints = 'Story points',
	Subject = 'Subjects',
	StartDate = 'Start date',
	EndDate = 'End date',
	AssignedTo = 'Assigned to',
	AssignedAt = 'Assigned at',
	SubmittedAt = 'Submitted at',
	SubmittedBy = 'Submitted by',
	ModifiedAt = 'Modified at',
	ModifiedBy = 'Modified by',
	EstimatedMillis = 'Estimated effort',
}
