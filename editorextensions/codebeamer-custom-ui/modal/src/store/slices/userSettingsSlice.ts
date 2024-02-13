import { createSlice, current } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { UserSetting } from '../enums/userSetting.enum';
import { SubqueryLinkMethod } from '../enums/subquery-link-method.enum';
import { IFilterCriteria } from '../../models/filterCriteria.if';
import getCbqlString from '../util/updateCbqlString';
import getQueryEntityNameForCriteria from '../util/getQueryEntityNameForCriteria';

export interface UserSettingsState {
	cbAddress: string;
	cbqlString: string;
	oAuthToken: string;
	trackerId: string;
	advancedSearch: boolean;
	activeFilters: IFilterCriteria[];
	subqueryChaining: string;
	andOrFilterEnabled: boolean;
	andOrFilter: string;
	showAnnouncements: boolean;
}

const initialState: UserSettingsState = {
	cbAddress: localStorage.getItem(UserSetting.CB_ADDRESS) ?? '',
	cbqlString: localStorage.getItem(UserSetting.CBQL_STRING) ?? '',
	oAuthToken: sessionStorage.getItem(UserSetting.OAuth_Token) ?? '',
	trackerId: localStorage.getItem(UserSetting.SELECTED_TRACKER) ?? '',
	advancedSearch: localStorage.getItem(UserSetting.ADVANCED_SEARCH_ENABLED)
		? localStorage.getItem(UserSetting.ADVANCED_SEARCH_ENABLED) == 'true'
		: false,
	activeFilters: JSON.parse(
		localStorage.getItem(UserSetting.FILTER_CRITERIA) ?? '[]'
	) as IFilterCriteria[],
	subqueryChaining:
		localStorage.getItem(UserSetting.SUBQUERY_LINK_METHOD) ??
		SubqueryLinkMethod.AND,
	andOrFilterEnabled: localStorage.getItem(UserSetting.AND_OR_FILTER_ENABLED)
		? localStorage.getItem(UserSetting.AND_OR_FILTER_ENABLED) == 'true'
		: false,
	andOrFilter: localStorage.getItem(UserSetting.AND_OR_FILTER_VALUE) ?? '',
	showAnnouncements: false,
};

export const userSettingsSlice = createSlice({
	name: 'userSettings',
	initialState,
	reducers: {
		setOAuthToken: (state, action: PayloadAction<{ oAuthToken: string }>) => {
			state.oAuthToken = action.payload.oAuthToken;
			sessionStorage.setItem(
				UserSetting.OAuth_Token,
				action.payload.oAuthToken
			);
		},
		setCbqlString: (state, action: PayloadAction<string>) => {
			state.cbqlString = action.payload;
			localStorage.setItem(UserSetting.CBQL_STRING, action.payload);
		},
		resetCbqlStringToCurrentParameters: (state) => {
			const cbqlString = getCbqlString(
				current(state.activeFilters),
				state.subqueryChaining.toString(),
				state.trackerId
			);

			state.cbqlString = cbqlString;
			localStorage.setItem(UserSetting.CBQL_STRING, cbqlString);
		},
		setTrackerId: (state, action: PayloadAction<string>) => {
			state.trackerId = action.payload;
			localStorage.setItem(UserSetting.SELECTED_TRACKER, action.payload);

			const cbqlString = getCbqlString(
				state.activeFilters,
				state.subqueryChaining.toString(),
				state.trackerId
			);
			state.cbqlString = cbqlString;
			localStorage.setItem(UserSetting.CBQL_STRING, cbqlString);
		},
		setAdvancedSearch: (state, action: PayloadAction<boolean>) => {
			state.advancedSearch = action.payload;
			localStorage.setItem(
				UserSetting.ADVANCED_SEARCH_ENABLED,
				action.payload.toString()
			);
		},
		addFilter: (state, action: PayloadAction<IFilterCriteria>) => {
			const newFilter = {
				...action.payload,
				id: state.activeFilters.length,
			};
			const filters = [...current(state.activeFilters), newFilter];

			state.activeFilters = filters;
			localStorage.setItem(
				UserSetting.FILTER_CRITERIA,
				JSON.stringify(filters)
			);

			const cbqlString = getCbqlString(
				filters,
				state.subqueryChaining.toString(),
				state.trackerId
			);

			state.cbqlString = cbqlString;
			localStorage.setItem(UserSetting.CBQL_STRING, cbqlString);
		},
		removeFilter: (state, action: PayloadAction<number>) => {
			const filters = current(state.activeFilters)
				.filter((f) => f.id !== action.payload)
				.map((f, i) => {
					return { ...f, id: i };
				});

			state.activeFilters = filters;

			state.activeFilters = filters;
			localStorage.setItem(
				UserSetting.FILTER_CRITERIA,
				JSON.stringify(filters)
			);

			const cbqlString = getCbqlString(
				filters,
				state.subqueryChaining.toString(),
				state.trackerId
			);
			state.cbqlString = cbqlString;
			localStorage.setItem(UserSetting.CBQL_STRING, cbqlString);
		},
		setAndOrFilterEnabled: (state, action: PayloadAction<boolean>) => {
			state.andOrFilterEnabled = action.payload;

			localStorage.setItem(
				UserSetting.AND_OR_FILTER_ENABLED,
				action.payload.toString()
			);
		},
		setAndOrFilter: (state, action: PayloadAction<string>) => {
			state.andOrFilter = action.payload;

			localStorage.setItem(
				UserSetting.AND_OR_FILTER_VALUE,
				action.payload.toString()
			);

			//* update the CBQL string accordingly
			let cbql = action.payload;

			for (const filter of current(state.activeFilters)) {
				const filterCbql = `${getQueryEntityNameForCriteria(
					filter.fieldName,
					state.trackerId
				)} = '${filter.value}'`;

				const visibleFilterId: string = (filter.id! + 1).toString();
				const filterIdMatchers: string[] = [
					`([${visibleFilterId}] )`,
					`([${visibleFilterId}]\\))`,
					`( [${visibleFilterId}])`,
				];

				cbql = cbql.replace(
					new RegExp(filterIdMatchers[0]),
					filterCbql + ' '
				);
				cbql = cbql.replace(
					new RegExp(filterIdMatchers[1]),
					filterCbql + ')'
				);
				cbql = cbql.replace(
					new RegExp(filterIdMatchers[2]),
					' ' + filterCbql
				);
			}

			cbql = `tracker.id = ${state.trackerId} AND (${cbql})`;

			state.cbqlString = cbql;
			localStorage.setItem(UserSetting.CBQL_STRING, cbql);
		},
		setShowAnnouncements: (state, action: PayloadAction<boolean>) => {
			state.showAnnouncements = action.payload;
		},
	},
});

export const {
	setOAuthToken,
	setTrackerId,
	setAdvancedSearch,
	addFilter,
	removeFilter,
	setCbqlString,
	resetCbqlStringToCurrentParameters,
	setAndOrFilterEnabled,
	setAndOrFilter,
	setShowAnnouncements,
} = userSettingsSlice.actions;

export default userSettingsSlice.reducer;
