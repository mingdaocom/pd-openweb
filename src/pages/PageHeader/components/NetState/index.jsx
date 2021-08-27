import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import { string, func, number, oneOf } from 'prop-types';
import { Dialog } from 'ming-ui';
import { Modal } from 'antd-mobile';
import projectApi from 'src/api/project';
import { navigateTo } from 'src/router/navigateTo';
import {
  INDIVIDUAL_NET_TEXT,
  PAID_VERSION_TO_TEXT,
  EXPERIENCE_VERSION_TO_TEXT,
  OVERDUE_NET_TEXT,
  MODULE_NUMBER_TO_TYPE,
  VERSION,
  COMMON,
} from './config';
import './index.less';
import { browserIsMobile } from 'src/util';
const {dialog: {netState: {buyBtn}}} = window.private

class NetState extends Component {
  static propTypes = {
    onClose: func,
    /**
     * 10: 应用数
     * 20: 工作表数
     * 21: 工作表记录数
     * 22: 工作表记录总数
     * 30: 工作流数
     * 32：工作流执行数
     * 40: 项目数
     * 80: 文字识别
     */
    moduleType: oneOf([10, 20, 21, 22, 30, 31, 40, 80]),
    maxCount: number,
    projectId: string,
  };
  static defaultProps = {
    onClose: _.noop,
    moduleType: 20,
  };

  state = { visible: true, projectInfo: {} };

  componentDidMount() {
    this.getProjectLicenseInfo();
  }

  getProjectLicenseInfo = () => {
    const { projectId } = this.props;
    if (projectId) {
      projectApi.getProjectLicenseInfo({ projectId }).then(data => {
        this.setState({ projectInfo: data });
      });
    }
  };

  onCancel = () => {
    this.setState({ visible: false });
    this.props.onClose();
  };

  handleClick = (type, { projectId, versionType, serviceType }) => {
    const { onClose } = this.props;
    // 按钮点击
    if (type === 'operationBtn') {
      // 体验版跳转
      if (_.includes(['experience'], versionType)) {
        navigateTo(`/upgrade/choose?projectId=${projectId}`);
      } else if (_.includes(['app', 'workflow', 'storage'], serviceType)) {
        navigateTo(`/admin/expansionservice/${projectId}/${serviceType}`);
      } else if (_.includes(['ocr'], serviceType)) {
        navigateTo(`/admin/valueaddservice/${projectId}`);
      } else if (
        _.includes(['worksheet', 'sheetRecord'], serviceType) &&
        _.includes(['team', 'company'], versionType)
      ) {
        navigateTo(`/admin/upgradeservice/${projectId}`);
      } else if (_.includes(['overdue'], versionType)) {
        navigateTo(`/upgrade/choose?projectId=${projectId}`);
      }
    }

    // 按钮下文字点击
    if (type === 'operationTxt') {
      navigateTo(`/admin/upgradeservice/${projectId}`);
    }
    onClose();
  };

  renderContent() {
    const { projectId, moduleType, maxCount } = this.props;
    const { projectInfo } = this.state;
    const { licenseType = 0 } = projectInfo;
    const versionId = _.get(projectInfo, ['version', 'versionId']);
    let versionType;
    let displayObj;
    // 服务类型: 工作流、应用、工作表...
    const serviceType = MODULE_NUMBER_TO_TYPE[moduleType];
    // 没有projectId则为个人网络
    if (projectId) {
      /**
       * licenseType
       * 0: 免费
       * 1: 正式版
       * 2: 体验版
       */
      versionType = _.includes([1], licenseType) ? VERSION[licenseType][versionId] : VERSION[licenseType];
      // }
    } else {
      versionType = 'individual';
    }

    switch (versionType) {
      //免费
      case 'overdue':
        displayObj = OVERDUE_NET_TEXT;
        break;

      // 个人显示
      case 'individual':
        displayObj = INDIVIDUAL_NET_TEXT;
        break;

      // 体验版显示
      case 'experience':
        displayObj = EXPERIENCE_VERSION_TO_TEXT;
        break;

      // 正常版本显示
      case 'team':
      case 'company':
      case 'topLevel':
      case 'singleApp':
        displayObj = PAID_VERSION_TO_TEXT[versionType];
        break;
    }

    displayObj = Object.assign({}, displayObj, COMMON)[serviceType];

    // 事件处理函数参数
    const para = { projectId, serviceType, versionType };

    const { hint, explain, btnText, operationText } = displayObj || {};

    return (
      <div className="netStateWrap">
        <div className="imgWrap" />
        <div className="hint">{hint}</div>
        <div className="explain">
          {_.isNumber(Number(maxCount))
            ? explain.replace(/\d+/, maxCount >= 1000 ? maxCount / 10000 : maxCount)
            : explain}
        </div>
        <div className={cx('operationWrap', versionType, { Hidden: buyBtn })}>
          {btnText && (
            <div className={cx('operationBtn', versionType)} onClick={() => this.handleClick('operationBtn', para)}>
              {btnText}
            </div>
          )}
          {operationText && (
            <div className="operationText" onClick={() => this.handleClick('operationTxt', para)}>
              {operationText}
            </div>
          )}
        </div>
      </div>
    );
  }

  render() {
    const { visible } = this.state;
    const isMobile = browserIsMobile();
    if (isMobile) {
      return (
        <Modal popup visible={visible} onClose={this.onCancel} animationType="slide-up">
          {this.renderContent()}
        </Modal>
      );
    } else {
      return (
        <Dialog visible={visible} header={null} footer={null} onCancel={this.onCancel}>
          {this.renderContent()}
        </Dialog>
      );
    }
  }
}

export default function initNetState(props) {
  const $container = document.createElement('div');
  document.body.appendChild($container);
  function handleClose() {
    const timer = setTimeout(() => {
      const isHaveComponent = ReactDOM.unmountComponentAtNode($container);
      if (isHaveComponent && $container.parentElement) {
        $container.parentElement.removeChild($container);
        clearTimeout(timer);
        if (_.isFunction(props.onCancel)) {
          props.onCancel();
        }
      }
    }, 0);
  }
  ReactDOM.render(<NetState onClose={handleClose} {...props} />, $container);
  return handleClose;
}
