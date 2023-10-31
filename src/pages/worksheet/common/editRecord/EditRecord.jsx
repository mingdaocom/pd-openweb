import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { autobind } from 'core-decorators';
import { Dialog, Dropdown } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import RadioGroup from 'ming-ui/components/RadioGroup';
import CustomFields from 'src/components/newCustomFields';
import { SYSTEM_CONTROL_WITH_UAID, WORKFLOW_SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import quickSelectUser from 'ming-ui/functions/quickSelectUser';
import { CONTROL_EDITABLE_WHITELIST } from 'worksheet/constants/enum';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils.js';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';
import './EditRecord.less';
import _ from 'lodash';

export default class EditRecord extends Component {
  static propTypes = {
    appId: PropTypes.string,
    viewId: PropTypes.string,
    view: PropTypes.shape({}),
    worksheetId: PropTypes.string,
    visible: PropTypes.bool,
    allWorksheetIsSelected: PropTypes.bool,
    hideEditRecord: PropTypes.func,
    clearSelect: PropTypes.func,
    reloadWorksheet: PropTypes.func,
    updateRows: PropTypes.func,
    getWorksheetSheetViewSummary: PropTypes.func,
    searchArgs: PropTypes.shape({}),
    selectedRows: PropTypes.arrayOf(PropTypes.shape({})),
    worksheetInfo: PropTypes.shape({}),
  };
  constructor(props) {
    super(props);
    this.state = {
      isUpdating: false,
      worksheetId: props.worksheetId,
      controlsForSelect: [],
      selectedControlId: undefined, // 选中的要修改数据的字段id
      ownerAccount: {}, // 更改拥有者时候选中的人
      updateType: 2, // 要进行的操作  1-清空数据  2-修改值
      showError: false, // 是否显示错误信息
      hasError: false, // 是否有填写错误
      formFlag: Math.random().toString(32),
    };
  }

  componentDidMount() {
    const { appId, worksheetId, view, activeControl } = this.props;
    const args = {
      appId,
      worksheetId,
      getTemplate: true,
    };
    sheetAjax.getWorksheetInfo(args).then(data => {
      const formData = data.template.controls;
      const controlsForSelect = data.template.controls.filter(
        control =>
          ((control.type < 10000 &&
            _.includes(CONTROL_EDITABLE_WHITELIST, control.type) &&
            !(control.type === 29 && _.get(control, 'advancedSetting.showtype') === '2') &&
            !_.find(SYSTEM_CONTROL_WITH_UAID.concat(WORKFLOW_SYSTEM_CONTROL), { controlId: control.controlId }) &&
            !_.find(view.controls, id => control.controlId === id)) ||
            control.controlId === 'ownerid') &&
          controlState(control).visible &&
          controlState(control).editable,
      );
      let selectedControlId = !!controlsForSelect.length && controlsForSelect[0].controlId;
      if (_.isObject(activeControl) && _.find(controlsForSelect, c => c.controlId === activeControl.controlId)) {
        selectedControlId = activeControl.controlId;
      }
      if (_.isObject(activeControl) && activeControl.controlId === 'ownerid') {
        selectedControlId = 'ownerid';
      }
      this.setState({
        formData,
        controlsForSelect,
        selectedControlId,
        updateType: 2,
      });
    });
  }

  componentDidUpdate() {
    if (this.customwidget.current && this.customwidget.current.con && this.customwidget.current.con.current) {
      $(this.customwidget.current.con.current).find('textarea, input').focus();
    }
  }

  updating = false;
  customwidget = React.createRef();

  @autobind
  selectOwner(e) {
    const _this = this;
    const { appId, projectId } = this.props;
    quickSelectUser($(e.target).closest('.selectOwner')[0], {
      projectId: projectId,

      showMoreInvite: false,
      isTask: false,
      tabType: 3,
      appId,
      includeUndefinedAndMySelf: true,
      offset: {
        top: 2,
        left: 0,
      },
      zIndex: 10001,
      SelectUserSettings: {
        unique: true,
        projectId: projectId,
        callback(users) {
          _this.setState({ ownerAccount: users[0], hasError: false });
        },
      },
      selectCb(users) {
        _this.setState({ ownerAccount: users[0], hasError: false });
      },
    });
  }

  @autobind
  updateRecords() {
    const { formData, selectedControlId, updateType, ownerAccount } = this.state;
    const {
      appId,
      viewId,
      worksheetId,
      recordId,
      selectedRows,
      worksheetInfo,
      searchArgs,
      quickFilter,
      navGroupFilters,
      allWorksheetIsSelected,
      clearSelect = () => {},
      hideEditRecord,
      reloadWorksheet,
      updateRows,
      getWorksheetSheetViewSummary,
    } = this.props;

    if (this.updating) {
      return false;
    }

    let hasError;
    let data;
    if (updateType === 2 && selectedControlId !== 'ownerid') {
      try {
        const submitData = this.customwidget.current.getSubmitData({ ignoreAlert: true });
        data = submitData.data;
        hasError = submitData.hasError;
      } catch (err) {
        console.log(err);
      }
    }

    if (selectedControlId === 'ownerid') {
      hasError = this.state.hasError;
    }
    if (!selectedControlId) {
      alert(_l('请选择要编辑的字段'), 3);
      return false;
    } else if (selectedControlId === 'ownerid' && !ownerAccount.accountId) {
      this.setState({
        showError: true,
        hasError: true,
      });
      return false;
    }
    const hasAuthRowIds = selectedRows.filter(row => row.allowedit || row.allowEdit).map(row => row.rowid);
    if (!allWorksheetIsSelected && hasAuthRowIds.length === 0) {
      alert(_l('无权限修改选择的%0', worksheetInfo.entityName), 2);
      return false;
    }
    if (hasError) {
      this.setState({
        showError: true,
        hasError: true,
      });
      alert(_l('请正确填写%0', worksheetInfo.entityName), 3);
      return false;
    }

    let selectedControl;
    if (selectedControlId === 'ownerid') {
      selectedControl = {
        controlId: 'ownerid',
        type: 26,
        value: ownerAccount.accountId,
      };
    } else {
      selectedControl = _.find(data || formData, control => control.controlId === selectedControlId);
    }
    if (!selectedControl) {
      return;
    }
    const needUpdateControl = formatControlToServer(selectedControl, { needFullUpdate: !recordId });
    if ((needUpdateControl.type === 29 || needUpdateControl.type === 35) && needUpdateControl.value) {
      try {
        needUpdateControl.relationValues = JSON.parse(needUpdateControl.value);
      } catch (err) {}
    }
    if (updateType === 1) {
      needUpdateControl.value = '';
    }
    const args = {
      appId,
      viewId,
      worksheetId,
      rowIds: hasAuthRowIds,
      cells: needUpdateControl,
    };
    if (allWorksheetIsSelected) {
      delete args.rowIds;
      args.isAll = true;
      args.excludeRowIds = selectedRows.map(row => row.rowid);
      args.filterControls = searchArgs.filterControls;
      args.fastFilters = (_.isArray(quickFilter) ? quickFilter : []).map(f =>
        _.pick(f, [
          'controlId',
          'dataType',
          'spliceType',
          'filterType',
          'dateRange',
          'value',
          'values',
          'minValue',
          'maxValue',
        ]),
      );
      args.navGroupFilters = navGroupFilters;
      args.keyWords = searchArgs.keyWords;
      args.searchType = searchArgs.searchType;
    }
    this.setState({ isUpdating: true });

    sheetAjax.updateWorksheetRows(args).then(data => {
      if (data.isSuccess) {
        this.setState({ isUpdating: false });
        clearSelect();
        hideEditRecord();
        if (data.successCount === selectedRows.length) {
          alert(_l('修改成功'));
        } else if (hasAuthRowIds.length < selectedRows.length) {
          alert(_l('修改成功，无编辑权限的%0无法修改', worksheetInfo.entityName));
        }
        if (allWorksheetIsSelected) {
          reloadWorksheet();
        } else {
          if (selectedControl.type === 29) {
            if (selectedControl.advancedSetting.showtype === '2') {
              // 关联表 列表
              let relationValues;
              try {
                relationValues = JSON.parse(needUpdateControl.value);
              } catch (err) {
                relationValues = [];
              }
              needUpdateControl.value = relationValues.length;
            } else {
              needUpdateControl.value = selectedControl.value;
            }
          }
          if (_.includes([19, 23, 24], selectedControl.type)) {
            needUpdateControl.value = selectedControl.value;
          }
          if (selectedControlId === 'ownerid') {
            needUpdateControl.value = JSON.stringify([ownerAccount]);
          }
          updateRows(hasAuthRowIds, { [needUpdateControl.controlId]: needUpdateControl.value });
        }
        getWorksheetSheetViewSummary();
      } else {
        alert(_l('修改失败'), 2);
      }
    });
  }

  getUpdateTypes(control) {
    if (!control) {
      return [];
    }
    if (control.type === 14 || control.unique) {
      return [
        {
          value: 1,
          disabled: control.required,
          text: _l('清空内容'),
        },
      ];
    } else {
      return [
        {
          value: 2,
          text: _l('修改为新值'),
        },
        {
          disabled: control.required || this.state.selectedControlId === 'ownerid',
          value: 1,
          text: _l('清空内容'),
        },
      ];
    }
  }

  render() {
    const {
      isUpdating,
      updateType,
      selectedControlId,
      formData = [],
      controlsForSelect,
      showError,
      hasError,
      formFlag,
    } = this.state;
    const { projectId, worksheetId, hideEditRecord, appId } = this.props;
    const selectedControl = controlsForSelect.filter(control => control.controlId === selectedControlId)[0] || {};
    return (
      <Dialog
        className="workSheetEditRecord"
        title={_l('批量编辑')}
        description={_l('通过批量编辑可快速统一修改相同字段的数据内容，无编辑权限的记录无法修改。')}
        overlayClosable={false}
        width="560"
        anim={false}
        okText={isUpdating ? _l('操作中...') : undefined}
        okDisabled={(selectedControl && selectedControl.required && selectedControl.unique) || isUpdating}
        onCancel={() => {
          if (isUpdating) {
            return;
          }
          hideEditRecord();
        }}
        onOk={this.updateRecords}
        visible={this.props.visible}
      >
        <div className={cx('editRecordBox Font14', showError && hasError && 'hasError')}>
          <div className="selectControl mBottom10">
            <span className="TxtMiddle mRight8 label Gray_9e">{_l('字段')}</span>
            <Dropdown
              isAppendToBody
              openSearch
              className="workSheetControlDropDown"
              value={selectedControlId}
              data={controlsForSelect
                .filter(o => !SYS.includes(o.controlId) || o.controlId === 'ownerid')
                .map(control => ({ text: control.controlName, value: control.controlId }))}
              onChange={value => {
                const newFormData = formData.map(control =>
                  control.controlId === value ? Object.assign({}, control, { value: undefined }) : control,
                );
                const newSelectedControl = controlsForSelect.filter(control => control.controlId === value)[0] || {};
                const newState = {
                  selectedControlId: value,
                  updateType: newSelectedControl.type === 14 ? 1 : 2,
                  formData: newFormData,
                  hasError: false,
                  formFlag: Math.random().toString(32),
                };
                this.setState(newState);
              }}
            />
          </div>
          <div className="selectControlContent">
            <span className="TxtMiddle mRight8 label Gray_9e">{_l('字段内容')}</span>
            <span className="TxtMiddle updateControlType mLeft5">
              <RadioGroup
                className="controlValueRadio TxtMiddle InlineBlock"
                vertical
                data={this.getUpdateTypes(selectedControl)}
                checkedValue={updateType}
                onChange={value => {
                  const newFormData = formData.map(control =>
                    control.controlId === selectedControlId
                      ? Object.assign({}, control, { value: undefined })
                      : control,
                  );
                  const newState = {
                    updateType: value,
                    formData: newFormData,
                    hasError: false,
                  };
                  this.setState(newState);
                }}
                size="small"
              />
            </span>
          </div>
          {selectedControl &&
            this.state.selectedControlId !== 'ownerid' &&
            !selectedControl.unique &&
            updateType === 2 &&
            selectedControl.type !== 14 &&
            controlsForSelect.length > 0 && (
              <CustomFields
                disableRules
                recordId="00000"
                ref={this.customwidget}
                flag={formFlag}
                data={formData
                  .filter(control => control.controlId === selectedControlId)
                  .map(c => ({ ...c, size: 12, sectionId: undefined }))}
                projectId={projectId}
                appId={appId}
                worksheetId={worksheetId}
                onChange={data => {
                  const newState = {
                    formData: formData.map(item => {
                      const newItem = _.find(data, c => c.controlId === item.controlId);
                      return newItem || item;
                    }),
                  };
                  this.setState(newState);
                }}
              />
            )}
          {/* // TODO 更新拥有者 */}
          {this.state.selectedControlId === 'ownerid' && (
            <div className="selectOwnerBox">
              <div className="selectOwner mTop8 pointer" ref={owner => (this.owner = owner)} onClick={this.selectOwner}>
                <span className="InlineBlock flex">{this.state.ownerAccount.fullname || ''}</span>
                <i className="Right ming Icon icon icon-charger" />
              </div>
            </div>
          )}
        </div>
      </Dialog>
    );
  }
}
