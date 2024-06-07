import React from "react";
import Spinner from "react-bootstrap/Spinner";
import DefaultOverlayTrigger from "../../../../components/defaultOverlayTrigger/DefautOverlayTrigger";

const RelationsButton = (props: {
	relationsCount: number;
	missingRelationsCount: number;
	areAllRelationsLoaded: boolean;
	isRelationsLoading: boolean;
	onRelations: () => void;
}) => {
	return (
		<DefaultOverlayTrigger
			content={
				props.areAllRelationsLoaded
					? props.relationsCount > 0 && props.missingRelationsCount === 0
						? `Hide relations for items in the tracker`
						: `Show relations for items in the tracker`
					: "Toggle relations for items in the Tracker"
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
				onClick={props.onRelations}
			>
				{props.isRelationsLoading ? (
					<Spinner animation="border" variant="secondary" size="sm" />
				) : (
					<span
						className={`icon icon-arrow-line-shape ${
							props.areAllRelationsLoaded ? "mr-25" : ""
						} ${
							props.areAllRelationsLoaded &&
							props.relationsCount > 0 &&
							props.missingRelationsCount == 0
								? "rotate-90"
								: ""
						} pos-adjusted-down clickable`}
					></span>
				)}
				{props.isRelationsLoading ? (
					<></>
				) : props.areAllRelationsLoaded ? (
					props.relationsCount > 0 && props.missingRelationsCount === 0 ? (
						`(${props.relationsCount})`
					) : (
						`(${props.missingRelationsCount})`
					)
				) : null}
			</button>
		</DefaultOverlayTrigger>
	);
};

export default RelationsButton;
