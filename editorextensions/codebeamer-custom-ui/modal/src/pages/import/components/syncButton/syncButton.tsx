import React from "react";
import DefaultOverlayTrigger from "../../../../components/defaultOverlayTrigger/DefautOverlayTrigger";

const SyncButton = (props: {
	importedItemsCount: number;
	onSync: () => void;
}) => {
	return (
		<DefaultOverlayTrigger
			content={`Sync imported cards with codebeamer`}
			placement="top"
		>
			<button
				className="button button-secondary button-small flex flex-centered"
				disabled={props.importedItemsCount === 0}
				data-test="sync"
				onClick={props.onSync}
			>
				<span className="icon icon-refresh mr-25 pos-adjusted-down clickable"></span>
				({props.importedItemsCount})
			</button>
		</DefaultOverlayTrigger>
	);
};

export default SyncButton;
