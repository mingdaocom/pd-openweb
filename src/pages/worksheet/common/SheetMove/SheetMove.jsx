import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Dialog, Dropdown, Menu, MenuItem, Button, Icon, ScrollView } from 'ming-ui';
import SvgIcon from 'src/components/SvgIcon';
import { APP_ROLE_TYPE } from '../../constants/enum';
import homeApp from 'src/api/homeApp';
import store from 'redux/configureStore';
import './SheetMove.less';

const formatApps = function (validProject, projectId) {
  const appList = [];
  const project = validProject.filter(item => item.projectId === projectId)[0];
  if (project && project.projectApps && project.projectApps.length) {
    project.projectApps.forEach(app => {
      const isCharge = app.permissionType == APP_ROLE_TYPE.ADMIN_ROLE || app.permissionType == APP_ROLE_TYPE.POSSESS_ROLE;
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
      appList: [],
      appValue: '',
      grouping: [],
      groupingValue: '',
      searchValue: ''
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
        appValue: appId
      });
    });
    this.handleChangeApp(appId);
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
        this.setState({
          grouping: appSectionDetail.map(data => {
            data.subVisible = true;
            return data;
          }),
        });
      });
  }
  handleCancel() {
    this.props.onClose();
  }
  handleOk() {
    const { appValue, groupingValue } = this.state;
    this.props.onSave({
      resultAppId: appValue,
      ResultAppSectionId: groupingValue === appValue ? undefined : groupingValue,
    });
    this.props.onClose();
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
  renderGroupingItem(data) {
    const { appItem } = this.props;
    const { groupingValue, grouping, searchValue } = this.state;
    const { subVisible, subName } = data;
    const isParent = data.type === 2;
    const id = isParent ? data.workSheetId : data.appSectionId;
    const name = data.name || data.workSheetName || '';

    if (searchValue && !name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) {
      return null;
    }

    return (
      <div
        key={id}
        className={cx('groupingItem flexRow alignItemsCenter pointer', { active: groupingValue === id, pLeft30: isParent })}
        onClick={() => {
          this.setState({ groupingValue: id });
        }}
      >
        {!isParent && appItem.type !== 2 && (
          <Icon
            icon={subVisible === false ? 'arrow-right-tip' : 'arrow-down'}
            className="Gray_9e"
            onClick={(e) => {
              e.stopPropagation();
              this.setState({
                grouping: grouping.map(data => {
                  if (data.appSectionId === id) {
                    data.subVisible = !subVisible;
                  }
                  return data;
                })
              });
            }}
          />
        )}
        <div className="flex mLeft5">
          <span className="ellipsis">{name || _l('未命名分组')}</span>
          {subName && <span className="Gray_9e mLeft5">{subName}</span>}
        </div>
        {groupingValue === id && <Icon icon="done" className="Font18 ThemeColor" />}
      </div>
    );
  }
  render() {
    const { appItem } = this.props;
    const { appList, appValue, grouping, groupingValue, searchValue } = this.state;
    const { workSheetName, iconUrl, type }  = appItem;
    return (
      <Dialog
        className="SheetMove"
        visible={true}
        anim={false}
        title={<span className="bold">{_l('移动到')}</span>}
        width={640}
        onCancel={this.handleCancel.bind(this)}
        footer={this.renderFooter()}
      >
        <div className="flexRow alignItemsCenter Gray_75">
          {_l('将')}
          <div className="target flexRow alignItemsCenter">
            <SvgIcon url={iconUrl} fill="#757575" size={22} />
            <span className="ellipsis mLeft5" title={workSheetName}>{workSheetName}</span>
          </div>
          {_l('移动到')}
        </div>
        <div className="flexColumn mTop10">
          <span className="mBottom8">{_l('应用')}</span>
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
        <div className="flexColumn mTop15 flex">
          <span className="mBottom8">{_l('选择分组')}</span>
          <div className="groupingWrap flexColumn">
            <div className="searchWrap flexRow alignItemsCenter mBottom8 pBottom10">
              <Icon icon="search" className="Font18 Gray_9e mRight3" />
              <input
                className="w100"
                placeholder="搜索"
                type="text"
                value={searchValue}
                onChange={(e) => {
                  this.setState({
                    searchValue: e.target.value
                  });
                }}
              />
            </div>
            <ScrollView className="flex">
              {type === 2 && this.renderGroupingItem({
                appSectionId: appValue,
                name: _.get(_.find(appList, { value: appValue }), 'text') || '',
                subName: _l('(作为一级分组移动)')
              })}
              {grouping.map(data => (
                <Fragment>
                  {this.renderGroupingItem(data)}
                  {type !== 2 && data.subVisible && data.workSheetInfo.filter(data => data.type == 2).map(data => (
                    this.renderGroupingItem(data)
                  ))}
                </Fragment>
              ))}
            </ScrollView>
          </div>
        </div>
      </Dialog>
    );
  }
}
