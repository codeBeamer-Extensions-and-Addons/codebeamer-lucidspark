import React from "react";
import "./importActions.css";
import DefaultOverlayTrigger from "../../../../components/defaultOverlayTrigger/DefautOverlayTrigger";

export default function ImportActions(props: {
	selectedCount: number;
	unImportedItemsCount: number;
	onImportSelected: () => void;
	onImportAll: () => void;
}) {
	return (
		<div className="flex-row mr-1">
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
				Import selection ({props.selectedCount})
			</button>

			<DefaultOverlayTrigger
				content={`Import all not yet imported items in the view`}
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
		</div>
	);
}
