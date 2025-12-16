import React, { Component, Fragment } from 'react';
import api from 'api/application';
import _ from 'lodash';
import { func } from 'prop-types';
import { Dialog, Icon, LoadDiv } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import ThirdAppGroup from './ThirdAppGroup';
import './index.less';

export default class ThirdPartyApp extends Component {
  static propTypes = {
    onCancel: func,
  };
  static defaultProps = {
    onCancel: _.noop,
  };
  state = {
    data: {},
    isLoading: true,
  };
  componentDidMount() {
    this.getData();
  }
  getData = () => {
    api.getAccountApps().then(({ data }) => {
      this.setState({ data, isLoading: false });
    });
  };

  handleSetTopClick = (isTop, para) => {
    api.updateAccountAppTop({ isTop, apps: [para] }).then(res => {
      if (res) this.getData();
    });
  };

  renderApps = () => {
    const { data } = this.state;
    const { top: topData, account: personalData, projects: projectData } = data;
    const appsAmount = topData.length + personalData.apps.length + projectData.length;
    return !appsAmount ? (
      <div className="emptyWrap">
        <div className="emptyIconWrap">
          <Icon icon="sidebar_application_library" />
        </div>
        <div className="explain">{_l('暂无第三方应用')}</div>
      </div>
    ) : (
      <Fragment>
        {topData.length > 0 && (
          <ThirdAppGroup onSetTopClick={this.handleSetTopClick} data={{ type: 'top', apps: topData }} />
        )}
        {personalData.apps.length > 0 && (
          <ThirdAppGroup onSetTopClick={this.handleSetTopClick} data={{ type: 'account', apps: personalData.apps }} />
        )}
        {projectData &&
          projectData.map(project => (
            <ThirdAppGroup key={project.projectId} onSetTopClick={this.handleSetTopClick} data={project} />
          ))}
      </Fragment>
    );
  };

  render() {
    const { onCancel } = this.props;
    const { isLoading } = this.state;
    return (
      <Dialog
        visible
        className="thirdAppDialog"
        title={
          <div className="thirdAppDialogHeader">
            <div className="dialogTitle">{_l('第三方应用')}</div>
          </div>
        }
        footer={null}
        onCancel={onCancel}
      >
        {isLoading ? <LoadDiv className="mTop10" /> : <div className="thirdAppWrap">{this.renderApps()}</div>}
      </Dialog>
    );
  }
}
