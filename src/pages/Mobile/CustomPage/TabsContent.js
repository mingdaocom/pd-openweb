import React, { lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import * as actions from './redux/actions';

const LoadableTabs = lazy(() =>
  import('src/pages/customPage/components/editWidget/tabs').then(component => ({
    default: component.Tabs,
  })),
);

const TabsContent = props => {
  return (
    <Suspense fallback={null}>
      <LoadableTabs {...props} />
    </Suspense>
  );
};

export default connect(
  state => ({
    loadFilterComponentCount: state.mobile.loadFilterComponentCount,
  }),
  dispatch => bindActionCreators(_.pick(actions, ['updateLoadFilterComponentCount']), dispatch),
)(TabsContent);
