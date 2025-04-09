import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './redux/actions';

const TabsContent = props => {
	const [Components, setComponents] = useState(true);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
    import('src/pages/customPage/components/editWidget/tabs').then(component => {
			setComponents(component);
			setLoading(false);
    });
	}, []);

	if (loading) {
		return null;
	}

	return (
		<Components.Tabs {...props} />
	);
}

export default connect(
	state => ({
		loadFilterComponentCount: state.mobile.loadFilterComponentCount,
	}),
	dispatch => bindActionCreators(_.pick(actions, ['updateLoadFilterComponentCount']), dispatch),
)(TabsContent);
