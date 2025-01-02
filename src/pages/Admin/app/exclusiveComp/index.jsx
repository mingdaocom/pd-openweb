import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import cx from 'classnames';
import _ from 'lodash';
import { Support } from 'ming-ui';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { navigateTo } from 'src/router/navigateTo';
import ExplanList from './container/ExplanList';
import ExplanDetail from './container/ExplanDetail';
import DataBase from './container/DataBase';
import ManageDataBase from './container/ManageDataBase';
import { getFeatureStatus } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import './index.less';

export default class ExclusiveComp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: _.get(props.match, 'url').includes('computing') ? 'computing' : 'database',
      refresh: -1,
      baseList: [],
    };
  }

  onClick = active => {
    const { match } = this.props;

    if (active === this.state.activeKey) return;

    navigateTo(`/admin/${active}/${match.params.projectId}`);
  };

  onRefresh = () => this.setState({ refresh: !this.state.refresh });

  renderHeader = () => {
    const { activeKey } = this.state;
    const { match } = this.props;
    if (match.params.explanId) return null;
    const projectId = _.get(match, 'params.projectId');
    const computingFeature = getFeatureStatus(projectId, VersionProductType.exclusiveResource);
    const databaseFeature =
      getFeatureStatus(projectId, VersionProductType.dataBase) && !md.global.Config.IsPlatformLocal;

    return (
      <div className="exclusiveHeader">
        <div className="exclusiveHeaderTextCon">
          {computingFeature && (
            <span
              className={cx('Hand', { active: activeKey === 'computing' })}
              onClick={() => this.onClick('computing')}
            >
              {_l('算力')}
            </span>
          )}
          {databaseFeature && (
            <span className={cx('Hand', { active: activeKey === 'database' })} onClick={() => this.onClick('database')}>
              {_l('数据库')}
            </span>
          )}
        </div>
        <div className="refresh Hand Font20 mRight24 " onClick={this.onRefresh}>
          <i className="icon-task-later Gray_9" />
        </div>
        <Support text={_l('帮助')} type={2} href="https://help.mingdao.com/application/exclusive-computing-power" />
      </div>
    );
  };

  render() {
    const { refresh, activeKey, baseList } = this.state;
    const projectId = _.get(this.props, 'match.params.projectId');
    const hasDataBase =
      getFeatureStatus(projectId, VersionProductType.dataBase) === '1' && !md.global.Config.IsPlatformLocal;
    const hasComputing = getFeatureStatus(projectId, VersionProductType.exclusiveResource);

    return (
      <div className="orgManagementWrap exclusiveComp flex flexColumn">
        <AdminTitle prefix={activeKey === 'computing' ? _l('专属算力') : _l('专属数据库')} />
        {this.renderHeader()}

        {hasComputing && (
          <Fragment>
            <Route
              path={'/admin/computing/:projectId'}
              exact
              render={({ match: { params } }) => {
                return <ExplanList {...params} refresh={refresh} />;
              }}
            />
            <Route
              path={'/admin/computing/:projectId/:id'}
              exact
              render={({ match: { params } }) => {
                return <ExplanDetail {...params} />;
              }}
            />
          </Fragment>
        )}
        {hasDataBase && (
          <Fragment>
            <Route
              path={'/admin/database/:projectId'}
              exact
              render={({ match: { params } }) => {
                return <DataBase {...params} refresh={refresh} />;
              }}
            />
            <Route
              path={'/admin/database/:projectId/:id'}
              exact
              render={({ match: { params } }) => {
                return <ManageDataBase {...params} />;
              }}
            />
          </Fragment>
        )}
      </div>
    );
  }
}
