import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import ExplanList from './ExplanList';
import ExplanDetail from './ExplanDetail';
import './index.less';

export default class ExclusiveComp extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="exclusiveComp flex flexColumn">
        <AdminTitle prefix={_l('专属算力')} />
        <Route
          path={'/admin/computing/:projectId'}
          exact
          render={({ match: { params } }) => {
            return <ExplanList {...params} />;
          }}
        />
        <Route
          path={'/admin/computing/:projectId/:id'}
          exact
          render={({ match: { params } }) => {
            return <ExplanDetail {...params} />;
          }}
        />
      </div>
    );
  }
}
