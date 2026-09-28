import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Modal, Select } from 'ming-ui/antd-components';
import homeAppAjax from 'src/api/homeApp';
import syncTaskApi from 'src/pages/integration/api/syncTask';
import { canEditApp } from 'src/utils/domain/permission/app';
import './SelectOtherWorksheetDialog.less';

export default class extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    worksheetType: PropTypes.number, // 工作表类型 0: 工作表 1: 自定义页面 2: 聚合表
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
    const { projectId, currentAppId, selectedAppId } = this.props;
    homeAppAjax.getAllHomeApp().then(data => {
      let apps = [];

      if (projectId) {
        apps = _.flatten(
          data.validProject.filter(project => project.projectId === projectId).map(project => project.projectApps),
        ).concat(data.externalApps.filter(app => app.projectId === projectId));
      } else {
        apps = data.aloneApps;
      }

      const toOption = app =>
        app.id === currentAppId
          ? { label: _l('%0  (本应用)', app.name), value: app.id }
          : { label: app.name, value: app.id };
      const myApps = apps.filter(app => canEditApp(app.permissionType) && !app.isLock).map(toOption);
      // 传入的默认应用未必落在当前组织的可选列表里（跨组织、或只有只读权限）。Select 匹配不到
      // 对应 option 时会退化成直接显示 appId，所以从全量应用里补一条；补不到就清掉默认选中，
      // 让它回到 placeholder 而不是把一串 id 摆给用户看。
      const defaultMissing = selectedAppId && !_.find(myApps, item => item.value === selectedAppId);
      const defaultApp = defaultMissing
        ? _.find(
            _.flatten((data.validProject || []).map(project => project.projectApps || [])).concat(
              data.externalApps || [],
              data.aloneApps || [],
            ),
            app => app.id === selectedAppId,
          )
        : null;

      this.setState({
        myApps: defaultApp ? [toOption(defaultApp)].concat(myApps) : myApps,
        ...(defaultMissing && !defaultApp ? { selectedAppId: undefined } : null),
      });
    });
    if (this.props.selectedAppId) {
      this.loadWorksheetsOfApp(this.props.selectedAppId);
    }
  }
  loadWorksheetsOfApp(appId) {
    const { projectId, worksheetType } = this.props;

    if (worksheetType === 2) {
      syncTaskApi
        .list({ projectId, appId, pageNo: 0, pageSize: 9999, taskType: 1 }, { isAggTable: true })
        .then(data => {
          this.setState({
            worksheetsOfSelectedApp: data.content
              .filter(o => o.aggTableTaskStatus !== 0)
              .map(({ name, worksheetId }) => ({ label: name, value: worksheetId })),
          });
        });
    } else {
      homeAppAjax.getWorksheetsByAppId({ appId, type: worksheetType }).then(data => {
        this.setState({
          worksheetsOfSelectedApp: data
            .filter(o => o.createType !== 1)
            .map(sheet => ({ label: sheet.workSheetName, value: sheet.workSheetId })),
        });
      });
    }
  }
  handleOk = () => {
    const { onOk, onHide } = this.props;
    const { myApps, worksheetsOfSelectedApp, selectedAppId, selectedWorksheetId } = this.state;
    const selectedWorksheet = _.find(worksheetsOfSelectedApp, worksheet => worksheet.value === selectedWorksheetId);

    onOk(
      selectedAppId,
      selectedWorksheetId,
      selectedWorksheet && {
        workSheetName: selectedWorksheet.label,
        workSheetId: selectedWorksheet.value,
        appName: (myApps.find(item => item.value === selectedAppId) || {}).label,
      },
    );
    onHide();
  };
  handleCancel = () => {
    this.props.onHide();
  };
  render() {
    const { visible, worksheetType, className, onlyApp, title, description, hideAppLabel, disabled } = this.props;
    const { myApps, worksheetsOfSelectedApp, selectedAppId, selectedWorksheetId } = this.state;
    const worksheetTypeName =
      worksheetType === 1 ? _l('自定义页面') : worksheetType === 2 ? _l('聚合表') : _l('工作表');

    return (
      <Modal
        wrapClassName={className}
        className="selectWorksheetDialog"
        open={visible}
        title={title || _l('选择其他应用下的%0', worksheetTypeName)}
        width={480}
        okDisabled={
          !selectedAppId || (!onlyApp && !_.find(worksheetsOfSelectedApp, item => item.value === selectedWorksheetId))
        }
        keyboard
        onCancel={this.handleCancel}
        onOk={this.handleOk}
      >
        {description && <div className="textSecondary mBottom20">{description}</div>}
        <div className="formItem">
          {!hideAppLabel && <div className="label">{_l('应用')}</div>}
          <div className="content">
            <Select
              showPopupSearch
              optionFilterProp="label"
              className="w100"
              disabled={disabled}
              placeholder={_l('请选择你作为管理员或开发者的应用')}
              notFoundContent={_l('没有可选的应用')}
              value={_.find(myApps, item => item.value === selectedAppId) ? selectedAppId : undefined}
              options={myApps}
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
              <Select
                showPopupSearch
                optionFilterProp="label"
                disabled={!selectedAppId}
                className="w100"
                placeholder={_l('选择') + worksheetTypeName}
                notFoundContent={_l('没有可选的') + worksheetTypeName}
                value={
                  selectedWorksheetId && _.find(worksheetsOfSelectedApp, w => w.value === selectedWorksheetId)
                    ? selectedWorksheetId
                    : undefined
                }
                options={worksheetsOfSelectedApp}
                onChange={value => {
                  this.setState({ selectedWorksheetId: value });
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    );
  }
}
