import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Placement } from 'react-bootstrap/esm/types';

export default function DefaultOverlayTrigger(props: {
	children: JSX.Element;
	content: string;
	placement?: Placement;
}): JSX.Element {
	const { placement, children, content } = props;
	return (
		<OverlayTrigger
			placement={placement ?? 'bottom'}
			trigger={['hover', 'focus']}
			delay={{ show: 250, hide: 250 }}
			overlay={<Tooltip className="tooltip-grey">{content}</Tooltip>}
		>
			{children}
		</OverlayTrigger>
	);
}
