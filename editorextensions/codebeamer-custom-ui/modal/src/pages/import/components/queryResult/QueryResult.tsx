import React, { useRef } from 'react';
import { ItemListView } from '../../../../models/itemListView';
import './queryResult.css';

export default function QueryResult(props: {
	item: ItemListView;
	checked?: boolean;
	disabled?: boolean;
	onSelect: Function;
}) {
	const checkbox = useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		if (checkbox.current) {
			checkbox.current.checked = props.checked ?? false;
		}
	}, []);

	const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
		// Prevent event propagation to the parent tr element
		e.stopPropagation();
	};

	const toggleCheckbox = () => {
		if (checkbox.current) {
			checkbox.current.click();
		}
	};

	return (
		<tr className="queryResult" onClick={toggleCheckbox}>
			<td>
				<input
					type="checkbox"
					className="checkBox clickable"
					onChange={(e) =>
						props.onSelect(props.item, e.target.checked)
					}
					disabled={props.disabled}
					data-test={'itemCheck-' + props.item.id}
					ref={checkbox}
					onClick={handleCheckboxClick}
				/>
			</td>
			<td data-test="itemId">{props.item.id}</td>
			<td data-test="itemName">{props.item.name}</td>
		</tr>
	);
}
