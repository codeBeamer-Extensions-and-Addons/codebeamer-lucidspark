import * as React from 'react';
import Query from './components/query/Query';
import QueryResults from './components/queryResults/QueryResults';

import './import.css';
import Footer from './components/Footer/Footer';

export default function Import() {
	return (
		<div className="fade-in import" data-test="import">
			<Query />
			<QueryResults />
			<Footer />
		</div>
	);
}
