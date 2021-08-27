import React, { Component } from 'react';
import cx from 'classnames';
import { Dialog, Dropdown, Button } from 'ming-ui';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum';
import homeApp from 'src/api/homeApp';
import store from 'redux/configureStore';

const formatApps = function(validProject, projectId) {
  const appList = [];
  const project = validProject.filter(item => item.projectId === projectId)[0];
  if (project && project.projectApps && project.projectApps.length) {
    project.projectApps.forEach(app => {
      const isCharge =
        app.permissionType == APP_ROLE_TYPE.ADMIN_ROLE || app.permissionType == APP_ROLE_TYPE.POSSESS_ROLE;
      if (isCharge) {
        appList.push({
          text: app.name,
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
      const newAppList = formatApps(validProject, projectId);
      this.setState({
        appList: newAppList,
        appValue: appId,
      });
    });
    this.handleChangeApp(appId);
  }
  handleOk() {
    const { pageValue } = this.state;
    this.props.onOk(pageValue);
    this.props.onCancel();
  }
  handleChangeApp(value) {
    this.setState({ appValue: value });
    homeApp
      .getWorksheetsByAppId({
        appId: value,
        type: 1,
      })
      .then(res => {
        res = res.map(item => {
          return {
            text: item.workSheetName,
            value: item.workSheetId,
          };
        });
        this.setState({
          pages: res,
          pageValue: res.length ? res[0].value : '',
        });
      });
  }
  renderFooter() {
    const { pageValue } = this.state;
    return (
      <div>
        <Button type="link" onClick={this.props.onCancel}>
          {_l('取消')}
        </Button>
        <Button
          type="primary"
          onClick={this.handleOk.bind(this)}
          disabled={!pageValue}
          className={cx({ 'Button--disabled': !pageValue })}
        >
          {_l('确认')}
        </Button>
      </div>
    );
  }
  render() {
    const { appList, appValue, pages, pageValue } = this.state;
    return (
      <Dialog
        className="PageMove"
        visible={true}
        anim={false}
        title={_l('复制到自定义页面')}
        width={560}
        onCancel={this.props.onCancel}
        footer={this.renderFooter()}
      >
        <div className="flexRow valignWrapper mTop25">
          <span className="Gray_75 mRight10 TxtRight name">{_l('应用')}</span>
          <Dropdown
            isAppendToBody
            menuClass="sheetMoveApp"
            className={cx('flex', { empty: !appValue })}
            border
            value={appValue}
            data={appList}
            onChange={value => {
              this.handleChangeApp(value);
            }}
          />
        </div>
        <div className="flexRow valignWrapper mTop15">
          <span className="Gray_75 mRight10 TxtRight name">{_l('应用项')}</span>
          <Dropdown
            disabled={!appValue}
            placeholder={_l('请选择页面')}
            isAppendToBody
            className={cx('flex', { empty: !pageValue })}
            border
            value={pageValue}
            data={pages}
            onChange={value => {
              this.setState({
                pageValue: value,
              });
            }}
          />
        </div>
      </Dialog>
    );
  }
}
