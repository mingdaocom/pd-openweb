import React, { Component } from 'react';
import cx from 'classnames';
import { Dialog, Dropdown, Menu, MenuItem, Button } from 'ming-ui';
import { APP_ROLE_TYPE } from '../../constants/enum';
import homeApp from 'src/api/homeApp';
import store from 'redux/configureStore';
import './SheetMove.less';

const formatApps = function (validProject, projectId, appId) {
  const appList = [];
  const project = validProject.filter(item => item.projectId === projectId)[0];
  if (project && project.projectApps && project.projectApps.length) {
    project.projectApps.forEach(app => {
      const isCharge = app.permissionType == APP_ROLE_TYPE.ADMIN_ROLE || app.permissionType == APP_ROLE_TYPE.POSSESS_ROLE;
      if (isCharge && appId !== app.id) {
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
      menu: this.getAppGroups(props),
      appList: [],
      appValue: '',
      grouping: [],
      groupingValue: '',
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
      });
    });
  }
  componentWillReceiveProps(nextProps) {
    const { visible } = nextProps;
    if (visible) {
      this.setState({
        menu: this.getAppGroups(nextProps),
      });
    }
  }
  getAppGroups(props) {
    const { groupId } = props;
    const { appGroups } = store.getState().appPkg;
    const newGrouping = appGroups.map(item => {
      return {
        value: item.appSectionId,
        text: item.name || _l('未命名分组'),
        disabled: item.appSectionId === groupId,
      };
    });
    return newGrouping;
  }
  handleChangeApp(appId) {
    this.setState({
      appValue: appId,
    });
    homeApp
      .getAppInfo({
        appId,
      })
      .then(result => {
        const { appSectionDetail } = result;
        const newGrouping = appSectionDetail
          .map(item => {
            return {
              value: item.appSectionId,
              text: item.name || _l('未命名分组'),
            };
          })
          .filter(item => item.value !== this.props.groupId);
        this.setState({
          grouping: newGrouping,
          groupingValue: newGrouping.length ? newGrouping[0].value : '',
        });
      });
  }
  handleCancel() {
    this.props.onHide();
    this.setState({
      showSheetMove: false,
    });
  }
  handleOk() {
    const { appValue, groupingValue } = this.state;
    this.props.onSave({
      resultAppId: appValue,
      ResultAppSectionId: groupingValue,
    });
    this.props.onHide();
  }
  renderFooter() {
    const { groupingValue } = this.state;
    return (
      <div>
        <Button type="link" onClick={this.handleCancel.bind(this)}>
          {_l('取消')}
        </Button>
        <Button type="primary" onClick={this.handleOk.bind(this)} disabled={!groupingValue} className={cx({ 'Button--disabled': !groupingValue })}>
          {_l('确认')}
        </Button>
      </div>
    );
  }
  renderDialog() {
    const { appList, appValue, grouping, groupingValue } = this.state;
    const { showSheetMove } = this.state;
    return (
      <Dialog
        className="SheetMove"
        visible={showSheetMove}
        anim={false}
        title={_l('移动工作表到其他应用')}
        width={560}
        onCancel={this.handleCancel.bind(this)}
        footer={this.renderFooter()}
      >
        <div className="Gray_75">{_l('工作表下的所有视图、记录和触发的工作流都会移动到目标应用中')}</div>
        <div className="flexRow valignWrapper mTop25">
          <span className="Gray_75 mRight10 TxtRight name">{_l('应用')}</span>
          <Dropdown
            isAppendToBody
            placeholder={_l('请选择你作为管理员的应用')}
            menuClass="sheetMoveApp"
            className={cx('flex', { empty: !appValue })}
            border
            openSearch
            value={appValue}
            data={appList}
            onChange={value => {
              this.handleChangeApp(value);
            }}
          />
        </div>
        <div className="flexRow valignWrapper mTop15">
          <span className="Gray_75 mRight10 TxtRight name">{_l('分组')}</span>
          <Dropdown
            disabled={!appValue}
            isAppendToBody
            className={cx('flex', { empty: !groupingValue })}
            border
            openSearch
            value={groupingValue}
            data={grouping}
            onChange={value => {
              this.setState({
                groupingValue: value,
              });
            }}
          />
        </div>
      </Dialog>
    );
  }
  render() {
    const { className } = this.props;
    const { menu } = this.state;
    return (
      <Menu className={className}>
        {menu.map(item => (
          <MenuItem
            key={item.value}
            disabled={item.disabled}
            onClick={() => {
              if (item.disabled) return;
              this.props.onSave({
                resultAppId: this.props.appId,
                ResultAppSectionId: item.value,
              });
            }}
          >
            <span className="text">{item.text}</span>
          </MenuItem>
        ))}
        {menu.length ? <hr className="splitter" /> : undefined}
        <MenuItem
          onClick={() => {
            this.setState({ showSheetMove: true });
            this.props.onHide();
          }}
        >
          <span className="text">{_l('其他应用')}</span>
        </MenuItem>
        {this.state.showSheetMove ? this.renderDialog() : null}
      </Menu>
    );
  }
}
