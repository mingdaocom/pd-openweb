import React, { Component } from 'react';
import cx from 'classnames';
import { Modal, Select } from 'ming-ui/antd-components';
import reportConfig from '../../api/reportConfig';
import homeApp from 'src/api/homeApp';
import store from 'src/redux/configureStore';
import { canEditApp } from 'src/utils/domain/permission/app';

const PAGE_MOVE_APP_SELECT_CLASS_NAMES = { popup: { root: 'sheetMoveApp' } };

const formatApps = function (validProject, projectId, appId) {
  const appList = [];
  const project = validProject.filter(item => item.projectId === projectId)[0];

  if (project && project.projectApps && project.projectApps.length) {
    project.projectApps.forEach(app => {
      if (canEditApp(app.permissionType) && !app.isLock) {
        appList.push({
          label: appId === app.id ? `${app.name} (${_l('本应用')})` : app.name,
          value: app.id,
        });
      }
    });
  }

  return appList;
};

export default class SheetMove extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSheetMove: false,
      appList: [],
      appValue: '',
      pages: [],
      pageValue: '',
    };
  }
  componentDidMount() {
    const { appId } = this.props;
    const { projectId } = store.getState().appPkg;
    homeApp.getAllHomeApp().then(result => {
      const { validProject } = result;
      const newAppList = formatApps(validProject, projectId, appId);
      this.setState({
        appList: newAppList,
        appValue: appId,
      });
    });
    this.handleChangeApp(appId);
  }
  handleOk() {
    const { reportId, pageId, onSucceed, onCancel } = this.props;
    const { pageValue } = this.state;

    if (pageId === pageValue) {
      alert(_l('不能移动到当前页面'), 3);
      onCancel();
      return;
    }

    reportConfig
      .copyReport({
        reportId,
        sourceType: 1,
        pageId: pageValue,
        move: pageId ? true : false,
        sourcePageId: pageId ? pageId : undefined,
      })
      .then(result => {
        alert(_l('操作成功'));
        onSucceed && onSucceed(result.version);
      });
    onCancel();
  }
  handleChangeApp(value) {
    const { pageId } = this.props;
    this.setState({ appValue: value });
    homeApp
      .getWorksheetsByAppId({
        appId: value,
        type: 1,
      })
      .then(res => {
        res = res
          .filter(item => !item.urlTemplate)
          .map(item => {
            return {
              label: item.workSheetName,
              value: item.workSheetId,
            };
          });
        this.setState({
          pages: res,
          pageValue: res.length ? pageId || res[0].value : '',
        });
      });
  }
  render() {
    const { pageId, dialogClasses } = this.props;
    const { appList, appValue, pages, pageValue } = this.state;
    return (
      <Modal
        wrapClassName={dialogClasses}
        className="PageMove"
        open
        title={pageId ? _l('移动到自定义页面') : _l('复制到自定义页面')}
        width={560}
        okDisabled={!pageValue}
        onOk={() => this.handleOk()}
        onCancel={this.props.onCancel}
      >
        <div className="flexRow valignWrapper mTop25">
          <span className="textSecondary mRight10 TxtRight name">{_l('应用')}</span>
          <Select
            classNames={PAGE_MOVE_APP_SELECT_CLASS_NAMES}
            className={cx('flex', { empty: !appValue })}
            value={appValue}
            options={appList}
            onChange={value => {
              this.handleChangeApp(value);
            }}
          />
        </div>
        <div className="flexRow valignWrapper mTop15">
          <span className="textSecondary mRight10 TxtRight name">{_l('页面')}</span>
          <Select
            disabled={!appValue}
            placeholder={_l('请选择页面')}
            className={cx('flex', { empty: !pageValue })}
            value={pageValue}
            options={pages}
            onChange={value => {
              this.setState({
                pageValue: value,
              });
            }}
          />
        </div>
      </Modal>
    );
  }
}
