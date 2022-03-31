import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import ajaxRequest from 'src/api/appManagement';
import processVersion from '../../../../api/processVersion';
import { Dialog, LoadDiv, Dropdown, Button } from 'ming-ui';
import './index.less';

export default class SelectOtherPBCDialog extends Component {
  static propTypes = {
    companyId: PropTypes.string,
    appId: PropTypes.string,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  };
  static defaultProps = {
    companyId: '',
    appId: '',
    onOk: () => {},
    onCancel: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      selectAppId: '',
      selectPBCId: '',
      appList: null,
      list: [],
    };
  }

  componentDidMount() {
    this.getAppList();
  }

  /**
   * 获取所有的应用
   */
  getAppList() {
    const { companyId, appId } = this.props;

    ajaxRequest.getManagerApps({ projectId: companyId }).then(result => {
      result = result
        .filter(o => o.appId !== appId)
        .map(({ appId, appName }) => {
          return {
            value: appId,
            text: appName,
          };
        });

      this.setState({ appList: result });
    });
  }

  /**
   * 根据应用获取PBC列表
   */
  getPBCList(appId) {
    const list = [];

    if (this.ajaxRequest) {
      this.ajaxRequest.abort();
    }

    this.ajaxRequest = processVersion.list({
      relationId: appId,
      processListType: 10,
    });

    this.ajaxRequest.then(result => {
      this.ajaxRequest = null;

      result.forEach(item => {
        item.processList.forEach(o => {
          list.push({ text: o.name, value: o.id });
        });
      });

      this.setState({ list });
    });
  }

  /**
   * 确认事件
   */
  onOk = () => {
    const { onCancel, onOk } = this.props;
    const { selectAppId, selectPBCId, appList, list } = this.state;
    const appName = appList.find(item => item.value === selectAppId).text;
    const selectPBCName = list.find(item => item.value === selectPBCId).text;

    onOk({
      appId: selectAppId,
      appName,
      selectPBCId,
      selectPBCName,
    });

    onCancel();
  };

  /**
   * 渲染内容
   */
  renderContent() {
    const { onCancel } = this.props;
    const { selectAppId, appList, list, selectPBCId } = this.state;

    return (
      <Fragment>
        <div className="formItem flexRow mTop10">
          <div className="label">{_l('应用')}</div>
          <div className="content">
            <Dropdown
              isAppendToBody
              border
              className="w100"
              placeholder={_l('请选择')}
              noData={_l('没有可选的应用')}
              value={selectAppId}
              data={appList}
              openSearch
              onChange={id => {
                this.setState({ selectAppId: id, list: [] });
                this.getPBCList(id);
              }}
            />
          </div>
        </div>
        <div className="formItem flexRow mTop15">
          <div className="label">{_l('业务流程')}</div>
          <div className="content">
            <Dropdown
              isAppendToBody
              border
              className="w100"
              placeholder={_l('请选择')}
              noData={_l('没有可选的业务流程')}
              disabled={!selectAppId}
              value={selectPBCId}
              data={list}
              openSearch
              onChange={id => this.setState({ selectPBCId: id })}
            />
          </div>
        </div>
        <div className="btns TxtRight mTop20">
          <Button type="link" onClick={onCancel}>
            {_l('取消')}
          </Button>
          <Button disabled={!selectAppId || !selectPBCId} onClick={this.onOk}>
            {_l('确定')}
          </Button>
        </div>
      </Fragment>
    );
  }

  render() {
    const { appList } = this.state;

    return (
      <Dialog
        className="selectOtherPBCDialog"
        visible
        title={_l('调用其他应用下的封装业务流程')}
        footer={null}
        onCancel={this.props.onCancel}
      >
        {appList === null ? <LoadDiv /> : this.renderContent()}
      </Dialog>
    );
  }
}
