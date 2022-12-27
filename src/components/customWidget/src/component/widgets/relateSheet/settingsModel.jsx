import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { Dialog, Checkbox, Support } from 'ming-ui';
import cx from 'classnames';
import sheetAjax from 'src/api/worksheet';
import homeAppAjax from 'src/api/homeApp';
import SelectWorksheet from 'src/pages/worksheet/components/SelectWorksheet';
import config from '../../../config';
import Dropdown from '../../common/dropdown';
import RadioGroup from '../../common/radioGroup';
import firstInputSelect from '../../common/firstInputSelect';
import ColumnVisibleControl from '../../common/ColumnVisibleControl';
import { createNewWidget } from '../../../utils/util';
import './addSheetField.less';
import _ from 'lodash';

const systemControl = [
  {
    controlId: 'ownerid',
    controlName: _l('拥有者'),
    type: 26,
  },
  {
    controlId: 'caid',
    controlName: _l('创建者'),
    type: 26,
  },
  {
    controlId: 'ctime',
    controlName: _l('创建时间'),
    type: 16,
  },
  {
    controlId: 'utime',
    controlName: _l('最近修改时间'),
    type: 16,
  },
];
@firstInputSelect
class SettingsModel extends Component {
  static propTypes = {
    widget: PropTypes.shape({
      id: PropTypes.string,
      data: PropTypes.shape({
        enumDefault: PropTypes.number,
        controlName: PropTypes.string,
        dataSource: PropTypes.string,
        controlId: PropTypes.string,
      }),
    }),
    editWidgets: PropTypes.arrayOf(PropTypes.shape({})),
    changeWidgetData: PropTypes.func,
    deleteWidget: PropTypes.func,
    addBottomWidget: PropTypes.func,
  };
  constructor(props) {
    super(props);
    let projectName;
    if (md.global.Account.projects.filter(item => item.projectId === config.global.projectId).length > 0) {
      projectName = md.global.Account.projects.filter(item => item.projectId === config.global.projectId)[0]
        .companyName;
    } else {
      projectName = _l('个人');
    }
    this.state = {
      controlNameIsDefault: true,
      worksheetList: [],
      showAddSheetField: false,
      worksheetInfo: undefined, // 选中的工作表信息
      sheetControls: [], // 选中的工作表控件
      selectedField: [],
      viewsOfWorksheet: [], // 工作表视图
      showSelectSheet: false,
      projectName,
      excelName: _l('新建工作表'),
      loadingSheet: true, // 加载工作表
    };
  }
  componentDidMount() {
    const appId = this.props.widget.data.appId || config.global.appId;
    this.loadWorksheets(appId);
    if (this.props.widget.data.dataSource) {
      this.loadSettingModel(appId, this.props.widget.data.dataSource);
    }
  }

  componentWillReceiveProps(nextProps) {
    const appId = this.props.widget.data.appId || config.global.appId;
    const nextAppId = nextProps.widget.data.appId || config.global.appId;
    if (nextAppId !== appId) {
      this.loadWorksheets(nextAppId);
    }
    if (nextProps.widget.data.dataSource !== this.props.widget.data.dataSource) {
      this.loadSettingModel(nextAppId, nextProps.widget.data.dataSource);
    }
  }

  loadWorksheets(appId) {
    homeAppAjax.getWorksheetsByAppId({ appId }).then(data => {
      const worksheetList = data.map(sheet => ({ name: sheet.workSheetName, value: sheet.workSheetId }));
      worksheetList.push({ name: _l('选择其他应用下的工作表'), value: 'selectSheetFromOtherApp' });
      this.setState({
        worksheetList,
        loadingSheet: false,
      });
    });
  }

  loadSettingModel(appId, worksheetId) {
    if (worksheetId) {
      sheetAjax.getWorksheetInfo({ worksheetId, getViews: true, getTemplate: true, appId }).then(data => {
        const { widget } = this.props;
        const { showControls } = widget.data;
        let columnsOfShowControls = showControls
          .map(showControl =>
            _.find(data.template.controls.concat(systemControl), control => control.controlId === showControl),
          )
          .filter(c => c);
        // 清除掉对应字段已被删除的显示字段
        if (columnsOfShowControls.length < showControls.length) {
          this.props.changeWidgetData(widget.id, { showControls: columnsOfShowControls.map(c => c.controlId) });
        }
        this.setState({
          worksheetInfo: data,
          controlNameIsDefault: this.props.widget.data.controlName === data.name,
          viewsOfWorksheet: data.views.map(view => ({ name: view.name, value: view.viewId })),
        });
      });
    }
  }

  @autobind
  handleChangeControlName() {
    this.setState({ controlNameIsDefault: false });
    this.props.changeWidgetData(this.props.widget.id, {
      controlName: this.refs.controlName.value,
    });
  }

  @autobind
  handleChangeRelateNum(value) {
    if (this.props.widget.data.enumDefault !== value) {
      let showControls = [];
      if (value === 2 && this.state.worksheetInfo) {
        const titleControl = _.find(this.state.worksheetInfo.template.controls, control => control.attribute === 1);
        if (titleControl) {
          showControls = [titleControl.controlId];
        }
      }
      this.props.changeWidgetData(this.props.widget.id, { enumDefault: value, showControls });
    }
  }

  changeWorksheetValue(value) {
    if (value === config.global.sourceId) {
      Dialog.confirm({
        title: _l('关联本表'),
        width: 580,
        okText: _l('保存'),
        description: (
          <div className="relatesheetSelectSelfWorksheetConfirm">
            <p dangerouslySetInnerHTML={{ __html: _l('关联本表会生成一对自带<b>父级-子级</b>的关联本表字段。') }}></p>
            <p
              dangerouslySetInnerHTML={{
                __html: _l(
                  '这对字段可以用来描述组织结构关系，例如：<b>人员</b>中的<b>上级</b>和<b>下属</b>，<b>任务</b>中的<b>母任务</b>和<b>子任务</b>',
                ),
              }}
            ></p>
            <p
              dangerouslySetInnerHTML={{
                __html: _l('如果要添加本表关联，请先保存当前工作配置，然后完成这两个字段的配置。'),
              }}
            ></p>
            <Support
              className="moreHelp"
              type={3}
              href="https://help.mingdao.com/sheet13.html"
              text={_l('更多帮助')}
            />
          </div>
        ),
        onOk: () => {
          return new Promise((resolve, reject) => {
            this.changeWorksheetValueFn(value, () => {
              document.querySelector('.customSave').setAttribute('reload', 1);
              document.querySelector('.customSave').click();
              resolve();
            });
          });
        },
      });
    } else if (value === 'selectSheetFromOtherApp') {
      this.setState({ showSelectSheet: true });
    } else if (value !== this.props.widget.data.dataSource) {
      this.changeWorksheetValueFn(value);
    }
  }

  changeWorksheetValueFn(value, callback = () => {}) {
    sheetAjax.getWorksheetInfo({ worksheetId: value, getTemplate: true, getViews: true }).then(data => {
      const fieldList = data.template.controls
        .filter(
          item =>
            item.type !== 20 &&
            item.type !== 22 &&
            item.type !== 25 &&
            item.type !== 29 &&
            item.type !== 30 &&
            item.type !== 10010 &&
            item.attribute !== 1,
        )
        .concat(systemControl);
      let controlName = this.props.widget.data.controlName;
      if (this.state.controlNameIsDefault) {
        controlName = data.name;
      }
      const changedValue = {
        appId: data.appId,
        dataSource: value,
        controlName,
        viewId: undefined,
        showControls: [],
      };
      this.props.changeWidgetData(this.props.widget.id, changedValue);
      this.setState({
        worksheetInfo: data,
        viewsOfWorksheet: data.views.map(view => ({ name: view.name, value: view.viewId })),
      });
      const dataSource = `$${this.props.widget.data.controlId || this.props.widget.id}$`;
      const sheetFields = _.flatten(this.props.editWidgets).filter(
        widget => widget.enumName === 'SHEETFIELD' && widget.data.dataSource === dataSource,
      );
      if (this.props.widget.data.enumDefault === 1) {
        if (sheetFields.length > 0) {
          sheetFields.forEach(item => {
            this.props.changeWidgetData(item.id, {
              fieldList: fieldList,
              sourceControlId: '',
            });
          });
        }
      } else {
        const titleControl = _.find(data.template.controls, control => control.attribute === 1);
        this.props.changeWidgetData(this.props.widget.id, { showControls: [titleControl.controlId] });
      }
      callback();
    });
  }

  @autobind
  addSheetField() {
    this.setState({ showAddSheetField: false });
    this.state.selectedField.forEach(item => {
      const data = {
        controlName: this.state.sheetControls.filter(controlItem => controlItem.controlId === item)[0].controlName,
        type: 30,
        enumDefault: 1,
        dataSource: this.props.widget.data.controlId
          ? `$${this.props.widget.data.controlId}$`
          : `$${this.props.widget.id}$`,
        sourceControlId: item, // 字段id
        fieldList: this.state.sheetControls,
      };
      this.props.addBottomWidget(createNewWidget('SHEETFIELD', { data }));
    });
  }

  @autobind
  handleAddShowControls(columns) {
    this.props.changeWidgetData(this.props.widget.id, {
      showControls: this.props.widget.data.showControls.concat(columns.map(column => column.controlId)),
    });
  }

  @autobind
  handleDeleteShowControls(sourceControlIds) {
    this.props.changeWidgetData(this.props.widget.id, {
      showControls: this.props.widget.data.showControls.filter(
        controlId => !_.find(sourceControlIds, id => controlId === id),
      ),
    });
  }

  render() {
    let { widget, editWidgets } = this.props;
    let { worksheetInfo, worksheetList, sheetControls, viewsOfWorksheet } = this.state;
    const { enumDefault, dataSource } = widget.data;
    const appId = this.props.widget.data.appId || config.global.appId;
    const showControls = this.props.widget.data.showControls || [];
    return (
      <div className="">
        {this.state.showSelectSheet && (
          <SelectWorksheet
            worksheetType={0}
            projectId={config.global.projectId}
            selectedAppId={widget.data.appId}
            selectedWrorkesheetId={widget.data.dataSource}
            visible={this.state.showSelectSheet}
            onHide={() => {
              this.setState({ showSelectSheet: false });
            }}
            onOk={(appId, worksheetId) => {
              this.props.changeWidgetData(this.props.widget.id, {
                dataSource: worksheetId,
                appId,
              });
              this.changeWorksheetValue(worksheetId);
              console.log(appId, worksheetId);
            }}
          />
        )}
        {this.state.showAddSheetField && (
          <Dialog
            className="addSheetFieldDialog"
            title={_l('添加他表字段')}
            overlayClosable={false}
            width={480}
            onOk={() => {
              if (this.state.selectedField.length > 0) {
                this.addSheetField();
              } else {
                alert(_l('至少选择一个字段'), 3);
                return;
              }
            }}
            onCancel={() => {
              this.setState({ showAddSheetField: false, selectedField: [] });
            }}
            visible={this.state.showAddSheetField}
          >
            <div className="workSheetName mTop6">
              <i className="mRight10" />
              <span className="name" title={worksheetInfo.name}>
                {worksheetInfo.name}
              </span>
            </div>
            <div className="controls mTop20">
              <span className="Block mBottom15 Gray_9e">{_l('显示字段')}</span>
              {sheetControls.map((item, index) => (
                <Checkbox
                  className="mBottom10"
                  key={index}
                  text={item.controlName}
                  // disabled={index === 0}
                  checked={this.state.selectedField.indexOf(item.controlId) > -1}
                  size="small"
                  onClick={() => {
                    const newSelectedField = this.state.selectedField.concat();
                    if (newSelectedField.indexOf(item.controlId) > -1) {
                      _.remove(newSelectedField, controlId => controlId === item.controlId);
                    } else {
                      newSelectedField.push(item.controlId);
                    }
                    this.setState({ selectedField: newSelectedField });
                  }}
                />
              ))}
            </div>
          </Dialog>
        )}
        <div className="wsItem">
          <span className="wsLf">{_l('名称')}</span>
          <input
            className="ThemeBorderColor3"
            data-editcomfirm="true"
            type="text"
            ref="controlName"
            value={this.props.widget.data.controlName}
            onChange={this.handleChangeControlName}
            maxLength="100"
          />
        </div>
        <div className="wsItem selectSheet lastHasBorder">
          <span className="wsLf">{_l('关联表')}</span>
          <Dropdown
            loading={this.state.loadingSheet}
            hint={_l('选择您管理的工作表')}
            noneContent={_l('没有可选的工作表')}
            data={worksheetList}
            value={widget.data.dataSource}
            selectName={
              !widget.data.dataSource || _.find(worksheetList, sheet => sheet.value === widget.data.dataSource)
                ? undefined
                : (worksheetInfo || {}).name
            }
            onChange={this.changeWorksheetValue.bind(this)}
            width="320px"
          />
        </div>
        <div className="wsItem">
          <span className="wsLf">{_l('视图')}</span>
          <div className={cx('selectView', { noview: !widget.data.viewId })}>
            <Dropdown
              loading={this.state.loadingSheet}
              hint={_l('选择视图')}
              noneContent={_l('请先选择关联表')}
              data={
                widget.data.dataSource
                  ? [
                      {
                        name: _l('无(所有记录)'),
                      },
                    ].concat(viewsOfWorksheet)
                  : []
              }
              value={widget.data.viewId === '' ? undefined : widget.data.viewId}
              onChange={value => {
                this.props.changeWidgetData(this.props.widget.id, { viewId: value });
              }}
              width="320px"
            />
          </div>
        </div>
        <div className="wsItem">
          <span className="wsLf"></span>
          <div className="selectViewTip">
            {_l('设置关联视图，根据视图来控制用户的选择范围和对关联记录的查看、操作权限')}
          </div>
        </div>
        <div className="wsItem">
          <span className="wsLf">{_l('数量')}</span>
          <RadioGroup
            data={[
              { name: _l('一条'), value: 1 },
              { name: _l('多条'), value: 2 },
            ]}
            checkedValue={enumDefault}
            changeRadioValue={this.handleChangeRelateNum}
            size="small"
          />
        </div>
        {enumDefault === 2 && (
          <div className="wsItem">
            <span className="wsLf">{_l('显示字段')}</span>
            <ColumnVisibleControl
              widgetId={widget.id}
              worksheetId={widget.data.dataSource}
              controls={worksheetInfo ? worksheetInfo.template.controls : []}
              selectedColumnIds={showControls}
              addShowControls={this.handleAddShowControls}
              deleteShowControls={this.handleDeleteShowControls}
            />
          </div>
        )}
        {enumDefault === 1 && (
          <div className="wsItem relateSheetItem Gray_9e">
            <i className="Icon icon icon-info mRight8 Font16" />
            <span>{_l('通过')}</span>
            <span
              className="addSheetField ThemeColor3"
              onClick={() => {
                if (widget.data.dataSource) {
                  this.setState({
                    showAddSheetField: true,
                    sheetControls: worksheetInfo.template.controls
                      .filter(
                        item =>
                          item.type !== 20 &&
                          item.type !== 22 &&
                          item.type !== 25 &&
                          item.type !== 29 &&
                          item.type !== 30 &&
                          item.type !== 36 &&
                          item.type !== 10010,
                      )
                      .concat(systemControl),
                  });
                } else {
                  alert(_l('请先关联一个工作表'), 3);
                }
              }}
            >
              {_l('添加他表字段')}
            </span>
            <span>{_l('，可以展示关联表中的更多字段')}</span>
          </div>
        )}
      </div>
    );
  }
}

export default {
  type: 29,
  SettingsModel,
};
