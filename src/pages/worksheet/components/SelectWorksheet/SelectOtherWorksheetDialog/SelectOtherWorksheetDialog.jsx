import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Button, Dropdown } from 'ming-ui';
import cx from 'classnames';
import homeAppAjax from 'src/api/homeApp';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util';
import './SelectOtherWorksheetDialog.less';
import _ from 'lodash';

export default class extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    worksheetType: PropTypes.number, // 工作表类型 0: 工作表 1: 自定义页面
    selectedAppId: PropTypes.string, // 已选中的应用id
    selectedWorksheetId: PropTypes.string, // 已选中的工作表id
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onHide: PropTypes.func,
    onlyApp: PropTypes.bool, // 仅选择应用
    title: PropTypes.string, // 标题
    description: PropTypes.string, // 描述
    hideAppLabel: PropTypes.bool, // 隐藏应用标题
  };
  constructor(props) {
    super(props);
    this.state = {
      myApps: [],
      selectedAppId: props.selectedAppId,
      worksheetsOfSelectedApp: [],
      selectedWorksheetId: props.selectedWorksheetId,
    };
  }
  componentDidMount() {
    const { projectId, currentAppId } = this.props;
    homeAppAjax.getAllHomeApp().then(data => {
      let apps = [];
      if (projectId) {
        apps = _.flatten(
          data.validProject.filter(project => project.projectId === projectId).map(project => project.projectApps),
        ).concat(data.externalApps.filter(app => app.projectId === projectId));
      } else {
        apps = data.aloneApps;
      }
      this.setState({
        myApps: apps
          .filter(app => canEditApp(app.permissionType) && !app.isLock)
          .map(app =>
            app.id === currentAppId
              ? { text: _l('%0  (本应用)', app.name), value: app.id }
              : { text: app.name, value: app.id },
          ),
      });
    });
    if (this.props.selectedAppId) {
      this.loadWorksheetsOfApp(this.props.selectedAppId);
    }
  }
  loadWorksheetsOfApp(appId) {
    const { worksheetType } = this.props;
    homeAppAjax.getWorksheetsByAppId({ appId, type: worksheetType }).then(data => {
      this.setState({
        worksheetsOfSelectedApp: data
          .filter(o => o.createType !== 1)
          .map(sheet => ({ text: sheet.workSheetName, value: sheet.workSheetId })),
      });
    });
  }
  render() {
    const { visible, onHide, worksheetType, onOk, className, onlyApp, title, description, hideAppLabel, disabled } =
      this.props;
    const { myApps, worksheetsOfSelectedApp, selectedAppId, selectedWorksheetId } = this.state;
    const worksheetTypeName = worksheetType === 1 ? _l('自定义页面') : _l('工作表');
    return (
      <Dialog
        dialogClasses={className}
        className={cx('selectWorksheetDialog')}
        visible={visible}
        anim={false}
        title={title || _l('选择其他应用下的') + worksheetTypeName}
        description={description}
        footer={null}
        width={480}
        onCancel={onHide}
        onOk={() => {}}
      >
        <div className="formItem">
          {!hideAppLabel && <div className="label">{_l('应用')}</div>}
          <div className="content">
            <Dropdown
              isAppendToBody
              border
              openSearch
              className="w100"
              disabled={disabled}
              menuClass="selectWorksheetDropdownMenu"
              placeholder={_l('请选择你作为管理员或开发者的应用')}
              noData={_l('没有可选的应用')}
              defaultValue={selectedAppId}
              data={myApps}
              onChange={value => {
                this.setState({ selectedAppId: value, selectedWorksheetId: undefined });
                !onlyApp && this.loadWorksheetsOfApp(value);
              }}
            />
          </div>
        </div>
        {!onlyApp && (
          <div className="formItem">
            <div className="label">{worksheetTypeName}</div>
            <div className="content">
              <Dropdown
                isAppendToBody
                border
                openSearch
                disabled={!selectedAppId}
                className="w100"
                menuClass="selectWorksheetDropdownMenu"
                placeholder={_l('选择') + worksheetTypeName}
                noData={_l('没有可选的') + worksheetTypeName}
                value={
                  selectedWorksheetId && _.find(worksheetsOfSelectedApp, w => w.value === selectedWorksheetId)
                    ? selectedWorksheetId
                    : undefined
                }
                data={worksheetsOfSelectedApp}
                onChange={value => {
                  this.setState({ selectedWorksheetId: value });
                }}
              />
            </div>
          </div>
        )}

        <div className="btns TxtRight mTop32">
          <Button
            type="link"
            onClick={() => {
              onHide();
            }}
          >
            {_l('取消')}
          </Button>
          <Button
            disabled={!selectedAppId || (!selectedWorksheetId && !onlyApp)}
            onClick={() => {
              const selectedWrorkesheet = _.find(worksheetsOfSelectedApp, w => w.value === selectedWorksheetId);
              onOk(
                selectedAppId,
                selectedWorksheetId,
                selectedWrorkesheet && {
                  workSheetName: selectedWrorkesheet.text,
                  workSheetId: selectedWrorkesheet.value,
                  appName: myApps.find(item => item.value === selectedAppId).text,
                },
              );
              onHide();
            }}
          >
            {_l('确定')}
          </Button>
        </div>
      </Dialog>
    );
  }
}
