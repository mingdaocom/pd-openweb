import React, { Component } from 'react';
import { Modal, Progress } from 'antd-mobile';
import { message } from 'antd';
import homeAppAjax from 'src/api/homeApp';
import './index.less';

let timeout = null;

const PUSH_TYPE = {
  ALERT: 1,
  CREATE: 2,
  DETAIL: 3,
  VIEW: 4,
  PAGE: 5,
  LINK: 6,
};

const TYPES = {
  3: _l('填写'),
  4: _l('审批'),
};

const getAppSimpleInfo = workSheetId => {
  return homeAppAjax.getAppSimpleInfo({ workSheetId }, { silent: true });
};

export default class SoketMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    if (window.IM) {
      IM.socket.on('workflow', this.receiveWorkflow);
      IM.socket.on('workflow_push', this.receiveWorkflowPush);
    }
  }
  componentWillUnmount() {
    if (window.IM) {
      IM.socket.off('workflow', this.receiveWorkflow);
      IM.socket.off('workflow_push', this.receiveWorkflowPush);
      clearTimeout(timeout);
    }
  }
  // 自定义按钮
  receiveWorkflow = data => {
    const { status, total, finished, title, type } = data;
    const { isMobileOperate, loadRow = () => {}, updateBtnDisabled = () => {}, updateVisible = () => {} } = this.props;
    if (isMobileOperate) {
      let percent = total === 0 ? 100 : (finished / total) * 100;
      updateVisible(true);
      this.setState({ percent, total: total === 0 ? 1 : total, num: total === 0 ? 1 : finished }, () => {
        if (this.state.percent === 100) {
          updateVisible(false);
        }
      });
    } else if (status == 1) {
      if (_.includes([3, 4], type)) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          Modal.alert(
            <div className="feedbackInfo">
              <span className="custBtnName">{title}</span>
              {_l(' 正在等待%0', TYPES[type])}
            </div>,
            '',
            [{ text: _l('关闭') }],
          );
        }, 1000);
      }
    } else if (status === 2) {
      this.setState({
        percent: 100,
        total: 1,
        num: 1,
      });
      loadRow({ executionFinished: true });
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        Modal.alert(
          <div className="feedbackInfo">
            <span className="custBtnName">{title}</span>
            <span className="verticalAlignM">{_l(' 执行成功!')}</span>
          </div>,
          '',
          [{ text: _l('关闭') }],
        );
        updateBtnDisabled({});
      }, 1000);
    } else {
      this.setState({
        percent: 100,
        total: 1,
        num: 1,
      });
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        Modal.alert(
          <div className="feedbackInfo">
            <span className="custBtnName">{title}</span>
            <span className="verticalAlignM">{_l(' 执行失败!')}</span>
          </div>,
          '',
          [{ text: _l('关闭') }],
        );
      }, 1000);
    }
  };

  // 流程推送
  receiveWorkflowPush = data => {
    const pushType = parseInt(Object.keys(data)[0]);
    const { pushUniqueId, content, appId: worksheetId, rowId, viewId } = data[pushType];
    if (pushUniqueId !== md.global.Config.pushUniqueId) {
      return;
    }
    if (pushType === PUSH_TYPE.ALERT) {
      alert(content);
    }
    if (pushType === PUSH_TYPE.CREATE) {
      getAppSimpleInfo(worksheetId).then(({ appId }) => {
        location.href = `/mobile/addRecord/${appId}/${worksheetId}/${this.props.viewId}`;
      });
    }
    if (pushType === PUSH_TYPE.DETAIL) {
      getAppSimpleInfo(worksheetId).then(({ appId }) => {
        if (viewId) {
          location.href = `/mobile/record/${appId}/${worksheetId}${viewId ? `/${viewId}` : ''}/${rowId}`;
        }
      });
    }
    if (pushType === PUSH_TYPE.VIEW) {
      getAppSimpleInfo(worksheetId).then(({ appId, appSectionId }) => {
        location.href = `/mobile/recordList/${appId}/${appSectionId}/${worksheetId}/${viewId}`;
      });
    }
    if (pushType === PUSH_TYPE.PAGE) {
      getAppSimpleInfo(worksheetId).then(({ appId, appSectionId }) => {
        location.href = `/mobile/customPage/${appId}/${appSectionId}/${worksheetId}`;
      });
    }
    if (pushType === PUSH_TYPE.LINK) {
      location.href = content;
    }
    message.destroy();
  };

  render() {
    const { batchOptCheckedData, runInfoVisible, btnDisable = {}, custBtnName = '' } = this.props;
    let { total = 1 } = this.state;
    if (!_.isEmpty(btnDisable)) return null;
    let totalNum = total || batchOptCheckedData.length;
    if (!runInfoVisible) return null;
    return (
      <Modal animationType="slide-up" visible={runInfoVisible} className="runInfoModal">
        <div className="optRunInfo">
          <p className="infoHeader">{_l(`%0正在执行...`, custBtnName)}</p>
          <p className="num">
            {this.state.num}/{totalNum}
          </p>
          <Progress position="normal" percent={this.state.percent} />
        </div>
      </Modal>
    );
  }
}
