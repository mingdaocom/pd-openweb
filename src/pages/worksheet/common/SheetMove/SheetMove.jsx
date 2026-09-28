import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, ScrollView, SvgIcon } from 'ming-ui';
import { Input, Modal, Select } from 'ming-ui/antd-components';
import homeApp from 'src/api/homeApp';
import store from 'src/redux/configureStore';
import { canEditApp } from 'src/utils/domain/permission/app';
import './SheetMove.less';

const formatApps = function (validProject, projectId) {
  const appList = [];
  const project = validProject.filter(item => item.projectId === projectId)[0];

  if (project && project.projectApps && project.projectApps.length) {
    project.projectApps.forEach(app => {
      const isCharge = canEditApp(app.permissionType, app.isLock);

      if (isCharge) {
        appList.push({
          label: app.name,
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
      searchValue: '',
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
  handleChangeApp(appId) {
    this.setState({
      appValue: appId,
      groupingValue: '',
    });
    homeApp
      .getApp({
        appId,
        getSection: true,
      })
      .then(result => {
        const { sections } = result;
        this.setState({
          grouping: sections.map(data => {
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
        className={cx('groupingItem flexRow alignItemsCenter pointer', {
          active: groupingValue === id,
          pLeft30: isParent,
        })}
        onClick={() => {
          this.setState({ groupingValue: id });
        }}
      >
        {!isParent && appItem.type !== 2 && (
          <Icon
            icon={subVisible === false ? 'arrow-right-tip' : 'arrow-down'}
            className="textTertiary"
            onClick={e => {
              e.stopPropagation();
              this.setState({
                grouping: grouping.map(data => {
                  if (data.appSectionId === id) {
                    data.subVisible = !subVisible;
                  }

                  return data;
                }),
              });
            }}
          />
        )}
        <div className="flex mLeft5">
          <span className="ellipsis">{name || _l('未命名分组')}</span>
          {subName && <span className="textTertiary mLeft5">{subName}</span>}
        </div>
        {groupingValue === id && <Icon icon="done" className="Font18 colorPrimary" />}
      </div>
    );
  }
  render() {
    const { appItem } = this.props;
    const { appList, appValue, grouping, groupingValue, searchValue } = this.state;
    const { workSheetName, iconUrl, type } = appItem;
    return (
      <Modal
        className="SheetMove"
        open
        title={_l('移动到')}
        width={640}
        onCancel={this.handleCancel.bind(this)}
        onOk={this.handleOk.bind(this)}
        okText={_l('确认')}
        cancelText={_l('取消')}
        okDisabled={!groupingValue}
        styles={{ body: { overflow: 'hidden' } }}
      >
        <div className="flexRow alignItemsCenter textSecondary">
          {_l('将')}
          <div className="target flexRow alignItemsCenter">
            <SvgIcon url={iconUrl} fill="var(--color-text-secondary)" size={22} />
            <span className="ellipsis mLeft5" title={workSheetName}>
              {workSheetName}
            </span>
          </div>
          {_l('移动到')}
        </div>
        <div className="flexColumn mTop10">
          <span className="mBottom8">{_l('应用')}</span>
          <Select
            showSearch
            optionFilterProp="label"
            placeholder={_l('请选择你作为管理员或开发者的应用')}
            className="flex"
            value={appValue || undefined}
            options={appList}
            onChange={value => {
              this.handleChangeApp(value);
            }}
          />
        </div>
        <div className="flexColumn mTop15 flex">
          <span className="mBottom8">{_l('选择分组')}</span>
          <div className="groupingWrap flexColumn">
            <div className="searchWrap flexRow alignItemsCenter mBottom8 pBottom10">
              <Input
                className="w100"
                variant="borderless"
                prefix={<Icon icon="search" className="Font18 textTertiary" />}
                placeholder={_l('搜索')}
                value={searchValue}
                onChange={e => {
                  this.setState({
                    searchValue: e.target.value,
                  });
                }}
              />
            </div>
            <ScrollView className="flex">
              {type === 2 &&
                this.renderGroupingItem({
                  appSectionId: appValue,
                  name: _.get(_.find(appList, { value: appValue }), 'label') || '',
                  subName: _l('(作为一级分组移动)'),
                })}
              {grouping.map(data => (
                <Fragment>
                  {this.renderGroupingItem(data)}
                  {type !== 2 &&
                    data.subVisible &&
                    data.workSheetInfo.filter(data => data.type == 2).map(data => this.renderGroupingItem(data))}
                </Fragment>
              ))}
            </ScrollView>
          </div>
        </div>
      </Modal>
    );
  }
}
