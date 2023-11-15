import React from "react";
import Spinner from "react-bootstrap/Spinner";
import "./importActions.css";
import DefaultOverlayTrigger from "../../../../components/defaultOverlayTrigger/DefautOverlayTrigger";

export default function ImportActions(props: {
	selectedCount: number;
	totalCount: number;
	importedItemsCount: number;
	unImportedItemsCount: number;
	relationsCount: number;
	missingRelationsCount: number;
	areAllRelationsLoaded: boolean;
	isRelationsLoading: boolean;
	onImportSelected: () => void;
	onImportAll: () => void;
	onSync: () => void;
	onRelations: () => void;
}) {
	return (
		<div className="w-100 flex-row">
			<DefaultOverlayTrigger
				content={`Import selected items (${props.selectedCount})`}
				placement="top"
			>
				<button
					className="button button-primary button-small flex flex-centered"
					onClick={() => props.onImportSelected()}
					disabled={props.selectedCount == 0}
					data-test="importSelected"
				>
					<span className="mr-5p">
						<svg
							width="24"
							height="24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M11 12.172L8.707 9.879a1 1 0 00-1.414 1.414L12 16l4.707-4.707a1 1 0 00-1.414-1.414L13 12.172V2.586a1 1 0 10-2 0v9.586zM3 19a1 1 0 100 2h18a1 1 0 100-2H3z"
								fill="#fff"
							/>
						</svg>
					</span>
					Import Selected ({props.selectedCount})
				</button>
			</DefaultOverlayTrigger>

			<DefaultOverlayTrigger
				content={`Import all remaining items (${props.unImportedItemsCount})`}
				placement="top"
			>
				<button
					className="button button-primary button-small flex flex-centered"
					disabled={props.unImportedItemsCount == 0}
					onClick={() => props.onImportAll()}
					data-test="importAll"
				>
					<span className="mr-5p">
						<svg
							width="24"
							height="24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M11 12.172L8.707 9.879a1 1 0 00-1.414 1.414L12 16l4.707-4.707a1 1 0 00-1.414-1.414L13 12.172V2.586a1 1 0 10-2 0v9.586zM3 19a1 1 0 100 2h18a1 1 0 100-2H3z"
								fill="#fff"
							/>
						</svg>
					</span>
					Import all ({props.unImportedItemsCount})
				</button>
			</DefaultOverlayTrigger>

			<DefaultOverlayTrigger
				content={`Sync Cards with Codebeamer (${props.importedItemsCount})`}
				placement="top"
			>
				<button
					className="button button-secondary button-small flex flex-centered"
					disabled={props.importedItemsCount == 0}
					data-test="sync"
					onClick={() => props.onSync()}
				>
					<span className="icon icon-refresh mr-1 pos-adjusted-down clickable"></span>
					({props.importedItemsCount})
				</button>
			</DefaultOverlayTrigger>

			<DefaultOverlayTrigger
				content={
					props.areAllRelationsLoaded
						? props.relationsCount > 0 &&
						  props.missingRelationsCount === 0
							? `Hide Relations & Associations (${props.relationsCount})`
							: `Show Relations & Associations (${props.missingRelationsCount})`
						: "Toggle Relations & Associations"
				}
				placement="top"
			>
				<button
					className="button button-secondary button-small flex flex-centered"
					disabled={
						props.isRelationsLoading ||
						(props.areAllRelationsLoaded && props.relationsCount === 0)
					}
					data-test="relations"
					onClick={() => props.onRelations()}
				>
					<span
						className={`icon icon-arrow-line-shape ${
							props.areAllRelationsLoaded ? "mr-1" : ""
						} pos-adjusted-down clickable`}
					></span>

					{props.isRelationsLoading ? (
						<Spinner animation="border" variant="secondary" />
					) : props.areAllRelationsLoaded ? (
						props.relationsCount > 0 &&
						props.missingRelationsCount === 0 ? (
							`(${props.relationsCount})`
						) : (
							`(${props.missingRelationsCount})`
						)
					) : null}
				</button>
			</DefaultOverlayTrigger>
		</div>
	);
}
