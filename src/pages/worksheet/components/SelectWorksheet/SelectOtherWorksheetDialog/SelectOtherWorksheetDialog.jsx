import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Button, Dropdown } from 'ming-ui';
import cx from 'classnames';
import homeAppAjax from 'src/api/homeApp';
import './SelectOtherWorksheetDialog.less';
import _ from 'lodash';

export default class extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    worksheetType: PropTypes.number, // 工作表类型 0: 工作表 1: 自定义页面
    selectedAppId: PropTypes.string, // 已选中的应用id
    selectedWrorkesheetId: PropTypes.string, // 已选中的工作表id
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onHide: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      myApps: [],
      selectedAppId: props.selectedAppId,
      worksheetsOfSelectedApp: [],
      selectedWrorkesheetId: props.selectedWrorkesheetId,
    };
  }
  componentDidMount() {
    const { projectId } = this.props;
    homeAppAjax.getAllHomeApp().then(data => {
      let apps = [];
      if (projectId) {
        apps = _.flatten(
          data.validProject.filter(project => project.projectId === projectId).map(project => project.projectApps),
        ).filter(app => app.permissionType);
      } else {
        apps = data.aloneApps.filter(app => app.permissionType);
      }
      this.setState({
        myApps: apps.map(app => ({ text: app.name, value: app.id })),
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
        worksheetsOfSelectedApp: data.map(sheet => ({ text: sheet.workSheetName, value: sheet.workSheetId })),
      });
    });
  }
  render() {
    const { visible, onHide, worksheetType, onOk, className } = this.props;
    const { myApps, worksheetsOfSelectedApp, selectedAppId, selectedWrorkesheetId } = this.state;
    const worksheetTypeName = worksheetType === 1 ? _l('自定义页面') : _l('工作表');
    return (
      <Dialog
        dialogClasses={className}
        className={cx('selectWorksheetDialog')}
        visible={visible}
        anim={false}
        title={_l('选择其他应用下的') + worksheetTypeName}
        footer={null}
        width={480}
        onCancel={onHide}
        onOk={() => {}}
      >
        <div className="formItem">
          <div className="label">{_l('应用')}</div>
          <div className="content">
            <Dropdown
              isAppendToBody
              border
              openSearch
              className="w100"
              menuClass="selectWorksheetDropdownMenu"
              placeholder=""
              noData={_l('没有可选的应用')}
              defaultValue={selectedAppId}
              data={myApps}
              onChange={value => {
                this.setState({ selectedAppId: value, selectedWrorkesheetId: undefined });
                this.loadWorksheetsOfApp(value);
              }}
            />
          </div>
        </div>
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
              defaultValue={selectedWrorkesheetId}
              data={worksheetsOfSelectedApp}
              onChange={value => {
                this.setState({ selectedWrorkesheetId: value });
              }}
            />
          </div>
        </div>
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
            disabled={!selectedAppId || !selectedWrorkesheetId}
            onClick={() => {
              const selectedWrorkesheet = _.find(worksheetsOfSelectedApp, w => w.value === selectedWrorkesheetId);
              onOk(
                selectedAppId,
                selectedWrorkesheetId,
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
