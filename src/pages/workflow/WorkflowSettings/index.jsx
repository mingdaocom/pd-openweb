import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import LoadDiv from 'ming-ui/components/LoadDiv';
import Header from './Header';
import EditFlow from './EditFlow';
import History from './History';
import ProcessConfig from './ProcessConfig';
import WorkflowInfo from './WorkflowInfo';
import processVersion from '../api/processVersion';
import { getFlowInfo, getProcessById, clearSource } from '../redux/actions';
import _ from 'lodash';

class WorkflowSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabIndex: 1,
      noAuth: false,
      infoVisible: false,
    };
  }

  componentDidMount() {
    this.checkIsAppAdmin();
    $('html').addClass('AppAdminWorkflowEdit');

    if (this.props.match.params.type) {
      this.setState({ tabIndex: parseInt(this.props.match.params.type) });
    }
  }

  componentWillUnmount() {
    this.props.dispatch(clearSource());
    $('html').removeClass('AppAdminWorkflowEdit');
  }

  /**
   * 检测是否是应用管理员
   */
  checkIsAppAdmin() {
    processVersion.getProcessRole({ relationId: this.props.match.params.flowId }).then(result => {
      if (result) {
        this.props.dispatch(getFlowInfo(this.props.match.params.flowId));
        this.props.dispatch(getProcessById(this.props.match.params.flowId));
      } else {
        this.setState({ noAuth: true });
      }
    });
  }

  /**
   * 后退
   */
  back = () => {
    if (history.length === 1) {
      location.href = '/dashboard';
    } else {
      history.back();
    }
  };

  render() {
    const { tabIndex, noAuth, infoVisible } = this.state;
    const { flowInfo, onBack, match } = this.props;
    const isPlugin = location.href.indexOf('workflowplugin') > -1;

    const INDEX2COMPONENT = {
      1: (
        <EditFlow
          urlParams={match.params}
          isPlugin={isPlugin}
          infoVisible={infoVisible}
          changeFlowInfo={visible => this.setState({ infoVisible: visible })}
        />
      ),
      2: <History isPlugin={isPlugin} />,
      3: <ProcessConfig />,
    };

    if (_.isEmpty(flowInfo) && !noAuth) {
      return <LoadDiv className="mTop15" />;
    }

    // 无权限编辑
    if (noAuth) {
      return (
        <Fragment>
          <div className="workflowSettings flexColumn h100">
            <div className="workflowSettingsHeader flexRow">
              <i className="icon-backspace Font20 ThemeColor3 workflowReturn" onClick={this.back} />
            </div>
            <div className="flowEmptyWrap flex">
              <div className="flowEmptyPic flowEmptyPic-lock" />
              <div className="Gray_75 Font14 mTop20">{_l('您无权访问或已删除')}</div>
            </div>
          </div>
          <DocumentTitle title={_l('您无权访问或已删除')} />
        </Fragment>
      );
    }

    // 流程不存在或已删除
    if (!flowInfo.id) {
      return (
        <div className="workflowSettings flexColumn h100">
          <div className="workflowSettingsHeader flexRow">
            <i className="icon-backspace Font20 ThemeColor3 workflowReturn" onClick={this.back} />
          </div>
          <div className="flowEmptyWrap flex">
            <div className="flowEmptyPic flowEmptyPic-del" />
            <div className="Gray_75 Font14 mTop20">{_l('工作流已删除')}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="workflowSettings flexColumn h100">
        <DocumentTitle title={`${flowInfo.name} - ${isPlugin ? _l('工作流插件') : _l('工作流')}`} />
        <Header
          tabIndex={tabIndex}
          switchTabs={tabIndex => this.setState({ tabIndex, infoVisible: false })}
          onBack={onBack}
          isPlugin={isPlugin}
          openFlowInfo={() => this.setState({ infoVisible: true })}
        />
        {INDEX2COMPONENT[tabIndex]}
        {!flowInfo.parentId && (
          <WorkflowInfo
            visible={infoVisible}
            isPlugin={isPlugin}
            onClose={() => this.setState({ infoVisible: false })}
          />
        )}
      </div>
    );
  }
}

export default connect(state => state.workflow)(WorkflowSettings);
