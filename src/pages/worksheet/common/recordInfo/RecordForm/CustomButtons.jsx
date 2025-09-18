import React, { Fragment } from 'react';
import { Tooltip } from 'antd';
import cx from 'classnames';
import _, { find, get, includes, isFunction, isUndefined } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Dialog, Icon, MenuItem, SvgIcon, VerifyPasswordConfirm } from 'ming-ui';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import { mdNotification } from 'ming-ui/functions';
import worksheetAjax from 'src/api/worksheet';
import processAjax from 'src/pages/workflow/api/process';
import { getRowDetail } from 'worksheet/api';
import addRecord from 'worksheet/common/newRecord/addRecord';
import IconText from 'worksheet/components/IconText';
import { CUSTOM_BUTTOM_CLICK_TYPE } from 'worksheet/constants/enum';
import verifyPassword from 'src/components/verifyPassword';
import { getTranslateInfo } from 'src/utils/app';
import { emitter } from 'src/utils/common';
import { appendDataToLocalPushUniqueId } from 'src/utils/common';
import { getButtonColor } from 'src/utils/control';
import { handleRecordError } from 'src/utils/record';
import FillRecordControls from '../FillRecordControls';
import CustomButtonConfirm from './CustomButtonConfirm';

const MenuItemWrap = styled(MenuItem)`
  .btnName {
    max-width: calc(100% - 34px);
    display: inline-block;
  }
  &.disabled {
    cursor: not-allowed !important;
    svg {
      opacity: 0.8;
      filter: grayscale(1);
    }
    .Item-content .icon {
      color: #ddd !important;
    }
    .Item-content .btnName {
      color: #bdbdbd !important;
    }
  }
  &.ming.MenuItem:not(.disabled) .Item-content:not(.disabled):hover {
    .btnName {
      color: #151515 !important;
    }
    background-color: #f2f2f2 !important;
  }
`;

const HoverButton = styled(Button)`
  &.showAsOutline {
    &:hover {
      color: ${props => props.isOperates && `${props.primaryColor} !important;`};
    }
  }
  ${props =>
    props.operateHeight &&
    `&.ming.Button.isOperates {
    height: ${props.operateHeight}px !important;
    line-height: ${props.operateHeight - 2}px !important;
    min-height: ${props.operateHeight}px !important;
    padding: 0 8px 0 8px !important;
    font-size: 12px !important;
    &:not(.iconShowAsSvg).icon {
      font-size: 16px !important;
      margin-right: 2px !important;
      margin-left: -2px !important;
    }
    &.iconShowAsSvg {
      .content {
        align-items: center;
      }
      .icon {
        line-height: 1em;
      }
    }
    .content {
      span,
      i {
        line-height: ${props.operateHeight - 2}px !important;
      }
    }
    .svgIcon.disabled {
      opacity: 0.8;
      filter: grayscale(1);
    }
    &.operates-showIcon-false:not(.operates-icon) {
      .icon, .icon.InlineBlock {
        display: none !important;
      }
    }
    &.operates-icon {
      border: none !important;
      background: transparent !important;
      &:hover {
        background: rgba(0, 0, 0, 0.03) !important;
      }
    }
    &.operates-text {
      border: none !important;
      background: transparent !important;
      &:hover {
        border: none !important;
        background: rgba(0, 0, 0, 0.03) !important;
      }
    }
    &.operates-icon {
      width: 28px !important;
      min-width: 28px !important;
      padding: 0 !important;
      .icon {
        margin: 0 !important;
        width: 28px !important;
        color: #757575 !important;
      }
      .buttonText {
        display: none !important;
      }
      &:hover {
        .icon {
          color: ${props => props.primaryColor} !important;
        }
      }
    }
    &:not(.isInCard) .buttonText {
      max-width: 200px !important;
    }
  }`}
  &.operates-icon,
  &.operates-text {
    &::before {
      display: none;
    }
  }
  &.operates-standard:hover {
    &::before {
      background-color: rgba(0, 0, 0, 0.12);
    }
  }
`;

const confirmClick = props => FunctionWrap(CustomButtonConfirm, props);
export default class CustomButtons extends React.Component {
  static propTypes = {
    iseditting: PropTypes.bool,
    isBatchOperate: PropTypes.bool,
    type: PropTypes.string,
    projectId: PropTypes.string,
    viewId: PropTypes.string,
    worksheetId: PropTypes.string,
    recordId: PropTypes.string,
    buttons: PropTypes.arrayOf(PropTypes.shape({})),
    btnDisable: PropTypes.shape({}),
    loadBtns: PropTypes.func,
    hideRecordInfo: PropTypes.func,
    reloadRecord: PropTypes.func,
    onHideMoreBtn: PropTypes.func,
    triggerCallback: PropTypes.func,
    onUpdate: PropTypes.func,
    setCustomButtonActive: PropTypes.func,
    onButtonClick: PropTypes.func,
  };

  static defaultProps = {
    loadBtns: () => {},
    onUpdate: () => {},
    onUpdateRow: () => {},
    hideRecordInfo: () => {},
    reloadRecord: () => {},
    onHideMoreBtn: () => {},
    triggerCallback: () => {},
    setCustomButtonActive: () => {},
    onButtonClick: () => {},
  };

  state = {};

  componentDidMount() {
    emitter.on('RECORD_WORKFLOW_UPDATE', this.handleRecordWorkflowUpdate);
  }
  componentWillUnmount() {
    emitter.off('RECORD_WORKFLOW_UPDATE', this.handleRecordWorkflowUpdate);
  }

  get continueFill() {
    return get(this.activeBtn, 'advancedSetting.continuewrite') === '1';
  }
  get tipConfig() {
    return {
      enableTip: get(this.activeBtn, 'advancedSetting.opentip') !== '0',
      tipText: get(this.activeBtn, 'advancedSetting.tiptext') || _l('操作完成'),
    };
  }

  getTipConfigWithTranslate() {
    const { appId, worksheetId } = this.props;
    const translateInfo = getTranslateInfo(appId, worksheetId, this.activeBtn.btnId);
    return {
      enableTip: get(this.activeBtn, 'advancedSetting.opentip') !== '0',
      tipText: translateInfo.completeText || get(this.activeBtn, 'advancedSetting.tiptext') || _l('操作完成'),
    };
  }

  handleRecordWorkflowUpdate = ({ recordId: triggerRecordId, triggerBtnId, isSuccess }) => {
    const { recordId } = this.props;
    if (
      this.continueFill &&
      isSuccess &&
      recordId === triggerRecordId &&
      triggerBtnId === get(this.activeBtn, 'btnId')
    ) {
      this.setStateFn({
        fillRecordControlsVisible: false,
      });
      this.triggerCustomBtn(this.activeBtn);
    }
  };

  triggerCustomBtn = btn => {
    const { appId, worksheetId, recordId, handleUpdateWorksheetRow, projectId } = this.props;
    this.remark = undefined;
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    const { count, iseditting, triggerCallback, handleTriggerCustomBtn } = this.props;
    const _this = this;
    if (iseditting) {
      alert(_l('正在编辑记录，无法触发自定义按钮'), 3);
      return;
    }
    this.activeBtn = btn;
    appendDataToLocalPushUniqueId(_this.getTipConfigWithTranslate());
    function run({ remark } = {}) {
      function trigger(btn) {
        if (handleTriggerCustomBtn) {
          handleTriggerCustomBtn(btn);
          return;
        }
        _this.triggerImmediately(btn.btnId, btn);
        triggerCallback();
      }
      if (_.get(btn, 'advancedSetting.enableremark') && remark) {
        if (_.isFunction(handleUpdateWorksheetRow)) {
          handleUpdateWorksheetRow({
            worksheetId,
            rowId: recordId,
            newOldControl: [],
            btnRemark: remark,
            btnId: btn.btnId,
            btnWorksheetId: worksheetId,
            btnRowId: recordId,
            noAlert: true,
          });
          return;
        }
        worksheetAjax.updateWorksheetRow({
          worksheetId,
          rowId: recordId,
          newOldControl: [],
          btnRemark: remark,
          btnId: btn.btnId,
          btnWorksheetId: worksheetId,
          btnRowId: recordId,
          noAlert: true,
        });
      } else {
        trigger(btn);
      }
    }
    function verifyConform(removeNoneVerification) {
      VerifyPasswordConfirm.confirm({
        allowNoVerify: !removeNoneVerification,
        isRequired: true,
        closeImageValidation: true,
        onOk: run,
      });
    }
    function handleTrigger() {
      const needConfirm = btn.enableConfirm || btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.CONFIRM;
      function confirm({ onOk, onClose = () => {} } = {}) {
        const translateInfo = getTranslateInfo(appId, worksheetId, btn.btnId);
        confirmClick({
          projectId,
          title: translateInfo.confirmMsg || btn.confirmMsg,
          description: translateInfo.confirmContent || _.get(btn, 'advancedSetting.confirmcontent'),
          enableRemark: _.get(btn, 'advancedSetting.enableremark'),
          remarkName: translateInfo.remark || _.get(btn, 'advancedSetting.remarkname'),
          remarkHint: translateInfo.hintText || _.get(btn, 'advancedSetting.remarkhint'),
          remarkRequired: _.get(btn, 'advancedSetting.remarkrequired'),
          remarkoptions: (() => {
            const remarkoptions = safeParse(_.get(btn, 'advancedSetting.remarkoptions'));
            const { template = [] } = remarkoptions;
            return JSON.stringify({
              ...remarkoptions,
              template: template.map((item, index) => {
                return {
                  ...item,
                  value: translateInfo[`templateName_${index}`] || item.value,
                };
              }),
            });
          })(),
          remarktype: _.get(btn, 'advancedSetting.remarktype'),
          verifyPwd: btn.verifyPwd,
          okText: translateInfo.sureName || btn.sureName,
          cancelText: translateInfo.cancelName || btn.cancelName,
          onOk: onOk || run,
          onClose,
        });
      }
      if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.FILL_RECORD) {
        _this.fillRecord({
          ...btn,
          confirm:
            needConfirm || btn.verifyPwd
              ? () =>
                  new Promise((resolve, reject) => {
                    confirm({
                      onOk: ({ remark }) => {
                        _this.remark = remark;
                        resolve(remark);
                      },
                      onClose: reject,
                    });
                  })
              : undefined,
        });
        return;
      }
      function verifyAndRun() {
        if (btn.verifyPwd) {
          verifyPassword({
            projectId,
            checkNeedAuth: true,
            success: run,
            fail: result => verifyConform(result === 'showPassword'),
          });
        } else {
          run();
        }
      }
      if (needConfirm) {
        // 二次确认
        confirm();
      } else {
        verifyAndRun();
      }
    }
    if (count > md.global.SysSettings.worktableBatchOperateDataLimitCount) {
      Dialog.confirm({
        title: (
          <span style={{ fontWeight: 500, lineHeight: '1.5em' }}>
            {_l(
              '最大支持批量执行%0行记录，是否只选中并执行前%0行数据？',
              md.global.SysSettings.worktableBatchOperateDataLimitCount,
            )}
          </span>
        ),
        onOk: handleTrigger,
      });
    } else {
      handleTrigger();
    }
  };

  triggerImmediately = (btnId, btn) => {
    const { worksheetId, recordId, loadBtns, onButtonClick } = this.props;
    onButtonClick(btnId);
    processAjax
      .startProcess({
        appId: worksheetId,
        sources: [recordId],
        triggerId: btnId,
        pushUniqueId: _.get(window, 'md.global.Config.pushUniqueId'),
      })
      .then(data => {
        if (!data) {
          mdNotification.error({
            title: _l('批量操作"%0"', btn.name),
            description: _l('失败，记录不满足执行条件或流程尚未启用'),
            duration: 3,
          });
        } else {
          loadBtns();
        }
      });
  };

  handleAddRecordCallback = () => {
    const { reloadRecord, loadBtns, triggerCallback } = this.props;
    const { activeBtn = {} } = this;
    const btnTypeStr = activeBtn.writeObject + '' + activeBtn.writeType;
    // 新建记录成功回掉
    if (this.activeBtn.workflowType === 2 && get(this.tipConfig, 'enableTip')) {
      alert(get(this.tipConfig, 'tipText'));
    }
    loadBtns();
    if (btnTypeStr === '12') {
      reloadRecord();
    }
    triggerCallback();
  };

  fillRecordControls = (newControls, targetOptions, customwidget, cb = () => {}) => {
    const {
      worksheetId,
      recordId,
      hideRecordInfo,
      onUpdate,
      onUpdateRow,
      loadBtns,
      triggerCallback,
      handleUpdateWorksheetRow,
      setCustomButtonActive = () => {},
    } = this.props;
    const args = {
      appId: targetOptions.appId,
      viewId: targetOptions.viewId,
      worksheetId: targetOptions.worksheetId,
      rowId: targetOptions.recordId,
      projectID: targetOptions.projectId,
      newOldControl: newControls,
      btnId: this.activeBtn.btnId,
      hasFilters: !!this.activeBtn.filters.length,
      btnWorksheetId: worksheetId,
      btnRowId: recordId,
      pushUniqueId: md.global.Config.pushUniqueId,
      btnRemark: this.remark,
    };
    if (_.isFunction(handleUpdateWorksheetRow)) {
      handleUpdateWorksheetRow(args);
      this.setStateFn({
        fillRecordControlsVisible: false,
      });
      return;
    }
    worksheetAjax.updateWorksheetRow(args).then(res => {
      if (res && res.data) {
        emitter.emit('ROWS_UPDATE');
        loadBtns();
        onUpdateRow(res.data);
        if (this.activeBtn.workflowType === 2 && get(this.tipConfig, 'enableTip')) {
          alert(get(this.tipConfig, 'tipText'));
        }
        if (targetOptions.recordId === recordId) {
          onUpdate(_.pick(res.data, newControls.map(c => c.controlId).concat('isviewdata')), res.data, newControls);
        }
        if (this.activeBtn.writeObject === 1 && !res.data.isviewdata) {
          hideRecordInfo();
        }
        if (!this.continueFill) {
          this.setStateFn({
            fillRecordControlsVisible: false,
          });
          setCustomButtonActive(false);
        }
        triggerCallback();
      } else {
        if (res.resultCode === 11) {
          if (customwidget && _.isFunction(customwidget.uniqueErrorUpdate)) {
            customwidget.uniqueErrorUpdate(res.badData);
            cb(true);
          }
        } else if (res.resultCode === 22) {
          cb(true, res);
        } else if (_.includes([31, 32], res.resultCode)) {
          cb(true, res);
        } else {
          handleRecordError(res.resultCode);
          cb(true);
        }
      }
    });
  };
  handleNewRecord() {
    const { worksheetId, recordId, projectId } = this.props;
    const { rowInfo } = this.state;
    const { activeBtn = {} } = this;
    addRecord({
      isCustomButton: true,
      title: this.activeBtn.name,
      className: 'worksheetRelateNewRecord recordOperateDialog',
      worksheetId: this.btnAddRelateWorksheetId,
      addType: 2,
      filterRelateSheetrecordbase: worksheetId,
      masterRecord: this.masterRecord,
      projectId: projectId,
      customBtn: {
        btnId: this.activeBtn.btnId,
        btnWorksheetId: worksheetId,
        btnRowId: recordId,
      },
      customButtonConfirm: this.customButtonConfirm,
      defaultRelatedSheet: {
        worksheetId: this.masterRecord.worksheetId,
        relateSheetControlId: activeBtn.addRelationControl,
        value: {
          sid: this.masterRecord.rowId,
          sourcevalue: JSON.stringify(
            [{ rowid: this.masterRecord.rowId }, ...(rowInfo ? rowInfo.formData : [])].reduce((a, b) => ({
              ...a,
              [b.controlId]: b.value,
            })),
          ),
        },
      },
      onAdd: this.handleAddRecordCallback,
    });
  }

  overrideValue(controls, data) {
    return controls.map(control => {
      const dataControl = _.find(data, item => item.controlId === control.controlId);
      return {
        ...control,
        value: dataControl ? dataControl.value : '',
      };
    });
  }

  async fillRecord(btn) {
    /*
     * btn.writeObject 对象 1：本记录 2：关联记录
     * btn.writeType 类型 1：填写字段 2：新建关联记录
     **/
    const { isAll, worksheetId, recordId, selectedRows = [], changeToSelectCurrentPageFromSelectAll } = this.props;
    let rowInfo;
    if (recordId) {
      rowInfo = await getRowDetail({
        worksheetId,
        getType: 1,
        rowId: recordId,
      });
    } else {
      const worksheetInfo = await worksheetAjax.getWorksheetInfo({
        worksheetId,
        getTemplate: true,
      });
      rowInfo = {
        formData: worksheetInfo.template.controls,
        advancedSetting: worksheetInfo.advancedSetting,
      };
    }
    const caseStr = btn.writeObject + '' + btn.writeType;
    const relationControl = _.find(rowInfo.formData, c => c.controlId === btn.relationControl);
    const addRelationControl = _.find(rowInfo.formData || [], c => c.controlId === btn.addRelationControl);
    this.fillRecordProps = {};
    this.customButtonConfirm = btn.confirm;
    appendDataToLocalPushUniqueId({ triggerBtnId: btn.btnId });
    switch (caseStr) {
      case '11': // 本记录 - 填写字段
        this.btnRelateWorksheetId = worksheetId;
        this.fillRecordId = recordId;
        this.fillRecordProps = {
          formData: rowInfo.formData,
          widgetStyle: rowInfo.advancedSetting,
        };
        const hasAttachmentControl = find(
          rowInfo.formData,
          c => find(this.activeBtn?.writeControls, wc => wc.controlId === c.controlId) && c.type === 14,
        );
        if (isAll && hasAttachmentControl && isFunction(changeToSelectCurrentPageFromSelectAll)) {
          // changeToSelectCurrentPageFromSelectAll();
          Dialog.confirm({
            title: _l('不支持跨页批量修改附件'),
            description: _l('该按钮中附件字段的编辑仅对本页选中的记录生效'),
            okText: _l('仅选中本页'),
            onOk: () => {
              changeToSelectCurrentPageFromSelectAll();
              this.setStateFn({
                fillRecordControlsVisible: true,
              });
            },
            cancelText: _l('继续修改'),
            onCancel: () => {
              this.setStateFn({
                fillRecordControlsVisible: true,
              });
            },
          });
        } else {
          this.setStateFn({
            fillRecordControlsVisible: true,
          });
        }
        break;
      case '12': // 本记录 - 新建关联记录
        if (!addRelationControl || !_.isObject(addRelationControl)) {
          Dialog.confirm({
            title: _l('无法执行按钮“%0”', btn.name),
            description: _l('关联字段被隐藏或已删除'),
            removeCancelBtn: true,
            buttonType: 'danger',
          });
          return;
        }
        try {
          const controldata = JSON.parse(addRelationControl.value);
          if (addRelationControl.enumDefault === 1 && controldata.length) {
            Dialog.confirm({
              title: _l('无法执行按钮“%0”', btn.name),
              description: _l('“%0”已有关联记录，无法重复添加', addRelationControl.controlName),
              removeCancelBtn: true,
              buttonType: 'danger',
            });
            return;
          }
        } catch (err) {
          console.log(err);
        }
        this.btnAddRelateWorksheetId = addRelationControl.dataSource;
        this.masterRecord = {
          rowId: recordId,
          controlId: addRelationControl.controlId,
          worksheetId: worksheetId,
        };
        this.setStateFn({ rowInfo }, this.handleNewRecord);
        break;
      case '21': // 关联记录 - 填写字段
        if (!relationControl || !_.isObject(relationControl)) {
          return;
        }
        this.btnRelateWorksheetId = relationControl.dataSource;
        try {
          const controldata = JSON.parse(relationControl.value);
          this.fillRecordId = controldata[0].sid;
          this.fillRecordProps = {
            appId: relationControl.appId,
            rowId: this.fillRecordId,
            viewId: relationControl.viewId,
            masterFormData: rowInfo.formData,
            widgetStyle: rowInfo.advancedSetting,
          };
        } catch (err) {
          console.log(err);
          Dialog.confirm({
            title: _l('无法执行按钮“%0”', btn.name),
            description: _l('“%0”为空，请关联操作后再执行按钮操作', relationControl.controlName),
            removeCancelBtn: true,
            buttonType: 'danger',
          });
          return;
        }
        this.setStateFn({
          fillRecordControlsVisible: true,
        });
        break;
      case '22': // 关联记录 - 新建关联记录
        if (!relationControl || !_.isObject(relationControl)) {
          return;
        }
        try {
          const controldata = JSON.parse(relationControl.value);
          this.fillRecordId = controldata[0].sid;
          this.addRelateRecordRelateRecord(relationControl, btn.addRelationControl);
        } catch (err) {
          console.log(err);
          Dialog.confirm({
            title: _l('无法执行按钮“%0”', btn.name),
            description: _l('“%0”为空，请关联操作后再执行按钮操作', relationControl.controlName),
            removeCancelBtn: true,
            buttonType: 'danger',
          });
          return;
        }
        break;
    }
  }

  addRelateRecordRelateRecord(relationControl, relationControlrelationControlId) {
    let controldata;
    try {
      controldata = JSON.parse(relationControl.value);
    } catch (err) {
      console.log(err);
      return;
    }
    getRowDetail({
      worksheetId: relationControl.dataSource,
      getType: 1,
      appId: relationControl.appId,
      rowId: controldata[0].sid,
    }).then(data => {
      const relationControlrelationControl = _.find(
        data.formData,
        c => c.controlId === relationControlrelationControlId,
      );
      if (!relationControlrelationControl) {
        Dialog.confirm({
          title: _l('无法执行按钮“%0”', this.activeBtn.name),
          description: _l('关联字段被隐藏或已删除'),
          removeCancelBtn: true,
          buttonType: 'danger',
        });
        return;
      }
      try {
        const relationControlrelationControlData = JSON.parse(relationControlrelationControl.value);
        if (relationControlrelationControl.enumDefault === 1 && relationControlrelationControlData.length) {
          Dialog.confirm({
            title: _l('无法执行按钮“%0”', this.activeBtn.name),
            description: _l('“%0”已有关联记录，无法重复添加', relationControlrelationControl.controlName),
            removeCancelBtn: true,
            buttonType: 'danger',
          });
          return;
        }
      } catch (err) {
        console.log(err);
      }
      this.masterRecord = {
        rowId: controldata[0].sid,
        controlId: relationControlrelationControl.controlId,
        worksheetId: relationControl.dataSource,
      };
      if (relationControlrelationControl) {
        this.btnAddRelateWorksheetId = relationControlrelationControl.dataSource;
        this.setStateFn(
          {
            rowInfo: data,
          },
          () => {
            this.handleNewRecord();
          },
        );
      }
    });
  }

  setStateFn = (args, fn) => {
    const { setCustomButtonActive } = this.props;
    if (typeof args.fillRecordControlsVisible !== 'undefined') {
      setCustomButtonActive(args.fillRecordControlsVisible);
    }
    this.setState(args, fn);
  };

  renderDialogs() {
    const {
      isCharge,
      viewId,
      appId,
      projectId,
      isBatchOperate,
      triggerCallback,
      sheetSwitchPermit,
      isDraft,
      selectedRows = [],
    } = this.props;
    const { fillRecordControlsVisible } = this.state;
    const { activeBtn = {}, fillRecordId, btnRelateWorksheetId, fillRecordProps } = this;
    const btnTypeStr = activeBtn.writeObject + '' + activeBtn.writeType;
    const isBatchRecordLock = selectedRows.some(s => s.sys_lock);
    return (
      <React.Fragment key="dialogs">
        {fillRecordControlsVisible && (
          <FillRecordControls
            isDraft={isDraft}
            isCharge={isCharge}
            isBatchOperate={isBatchOperate}
            isBatchRecordLock={isBatchRecordLock}
            className="recordOperateDialog"
            title={activeBtn.name}
            loadWorksheetRecord={btnTypeStr === '21'}
            viewId={viewId}
            appId={appId}
            recordId={fillRecordId}
            projectId={projectId}
            visible={fillRecordControlsVisible}
            worksheetId={btnRelateWorksheetId}
            sheetSwitchPermit={sheetSwitchPermit}
            writeControls={activeBtn.writeControls}
            continueFill={this.continueFill}
            onSubmit={this.fillRecordControls}
            hideDialog={() => {
              this.setStateFn({
                fillRecordControlsVisible: false,
              });
              triggerCallback();
            }}
            {...fillRecordProps}
            customButtonConfirm={this.customButtonConfirm}
          />
        )}
      </React.Fragment>
    );
  }

  handleButtonClick = button => {
    const {
      isOperates,
      isRecordLock,
      btnDisable = {},
      onButtonClick = () => {},
      isEditLock,
      entityName = _l('记录'),
    } = this.props;
    if (button.disabled || btnDisable[button.btnId]) {
      return true;
    }
    if (
      (isRecordLock && !includes(['copy', 'print', 'sysprint', 'share'], button.type)) ||
      (isEditLock && button.clickType === 3)
    ) {
      alert(isRecordLock ? _l('%0已锁定', entityName) : _l('不允许多人同时编辑，稍后重试'), 3);
      return true;
    }
    if (isUndefined(button.type) || button.type === 'custom_button') {
      if (isOperates) {
        worksheetAjax
          .checkWorksheetRowBtn({
            worksheetId: this.props.worksheetId,
            rowId: this.props.recordId,
            btnId: button.btnId,
          })
          .then(allowTrigger => {
            if (allowTrigger) {
              this.triggerCustomBtn(button);
            } else {
              alert(_l('不满足执行条件'), 3);
              onButtonClick(button.btnId);
            }
          });
      } else {
        this.triggerCustomBtn(button);
      }
    } else if (isFunction(button.onClick)) {
      button.onClick(button);
    }
  };

  render() {
    const {
      type = 'button',
      showMore,
      operateHeight,
      btnDisable = {},
      isOperates,
      hideDisabled,
      isInCard,
      onHideMoreBtn,
    } = this.props;
    let { buttons } = this.props;
    if (hideDisabled) {
      buttons = buttons.filter(button => !(btnDisable[button.btnId] || button.disabled));
    }
    if (md.global.Account.isPortal) {
      buttons = buttons.map(b => ({ ...b, verifyPwd: false }));
    }
    let buttonComponents = [];
    if (type === 'button') {
      buttonComponents = buttons.map((button, i) => {
        const buttonColor = getButtonColor(button.color, button.showAsPrimary);
        let fillColor =
          !button.color || button.color === 'transparent' || btnDisable[button.btnId] || button.disabled
            ? '#bdbdbd'
            : buttonColor.color;
        if (isOperates && !button.showAsPrimary) {
          fillColor = button.color;
        }
        let mRight6 = true;
        if (isOperates) {
          if (button.style === 'text') {
            mRight6 = false;
          } else if (isInCard && includes(['text', 'icon'], button.style)) {
            mRight6 = false;
          } else if (buttons.length === 1 && !showMore) {
            mRight6 = false;
          } else if (!showMore && i === buttons.length - 1) {
            mRight6 = false;
          }
        }
        const buttonComponent = (
          <span key={i} className={cx('InlineBlock borderBox', { mRight6 })}>
            <HoverButton
              operateHeight={isOperates && operateHeight}
              className={cx(
                'recordCustomButton overflowHidden',
                {
                  transparentButton: button.color === 'transparent',
                  isOperates,
                  isInCard,
                  showAsOutline: isOperates && !button.showAsPrimary,
                  iconShowAsSvg: !!button.iconUrl && !!button.icon && button.icon.endsWith('_svg'),
                },
                button.className,
              )}
              size="small"
              type="ghost"
              disabled={btnDisable[button.btnId] || button.disabled}
              style={{
                ...buttonColor,
                maxWidth: '100%',
                minWidth: 'inherit',
                ...(isOperates &&
                  !button.showAsPrimary &&
                  button.style === 'text' &&
                  !button.showIcon && {
                    color: button.color,
                  }),
              }}
              isOperates={isOperates}
              primaryColor={button.color !== 'transparent' && (button.color || '#1677ff')}
              onClick={evt => {
                if (this.handleButtonClick(button)) {
                  return;
                }
                onHideMoreBtn(evt);
              }}
              title={button.name}
            >
              <div className="content ellipsis">
                <Fragment>
                  {!!button.iconUrl && !!button.icon && button.icon.endsWith('_svg') ? (
                    <SvgIcon
                      className={cx('InlineBlock icon svgIcon', {
                        LineHeight30: !isOperates,
                        disabled: btnDisable[button.btnId] || button.disabled,
                      })}
                      addClassName="TxtMiddle"
                      url={button.iconUrl}
                      fill={fillColor}
                      size={18}
                    />
                  ) : (
                    button.icon && (
                      <i
                        className={cx(`icon icon-${button.icon || 'custom_actions'}`, {
                          Gray_bd:
                            !button.showAsPrimary && !button.icon && (!button.color || button.color === 'transparent'),
                        })}
                        style={
                          isOperates && !button.showAsPrimary && !(btnDisable[button.btnId] || button.disabled)
                            ? { color: button.color || '#1677ff' }
                            : {}
                        }
                      />
                    )
                  )}
                </Fragment>
                <span className="buttonText breakAll overflow_ellipsis">{button.name}</span>
              </div>
            </HoverButton>
          </span>
        );
        if (button.desc && type === 'button' && button.style !== 'icon') {
          return (
            <Tooltip mouseEnterDelay={0} placement="bottom" title={<span>{button.desc}</span>}>
              {buttonComponent}
            </Tooltip>
          );
        } else if (button.style === 'icon') {
          return (
            <Tooltip placement="bottom" mouseEnterDelay={0} title={<span>{button.name}</span>}>
              {buttonComponent}
            </Tooltip>
          );
        } else {
          return buttonComponent;
        }
      });
    } else if (type === 'iconText') {
      buttonComponents = buttons.map(button => (
        <Tooltip mouseEnterDelay={0} placement="bottom" title={button.desc && <span>{button.desc}</span>}>
          <span>
            <IconText
              title={button.name}
              disabled={btnDisable[button.btnId] || button.disabled}
              icon={button.icon || 'custom_actions'}
              iconUrl={button.iconUrl}
              iconColor={!button.icon ? '#bdbdbd' : button.color === 'transparent' ? '#151515' : button.color}
              text={button.name}
              onClick={evt => {
                if (this.handleButtonClick(button)) {
                  return;
                }
                onHideMoreBtn(evt);
              }}
            />
          </span>
        </Tooltip>
      ));
    } else {
      buttonComponents = buttons.map((button, i) => (
        <MenuItemWrap
          data-event={`customBtn_${i}`}
          title={button.name}
          key={i}
          icon={
            button.icon ? (
              !!button.iconUrl && button.icon.endsWith('_svg') ? (
                <SvgIcon
                  className="InlineBlock TxtTop mLeft5 Icon"
                  addClassName="TxtMiddle"
                  url={button.iconUrl}
                  fill={!button.color || button.color === 'transparent' ? '#bdbdbd' : button.color}
                  size={16}
                />
              ) : (
                <Icon
                  style={{ color: button.color === 'transparent' ? '#151515' : button.color }}
                  icon={button.icon || 'custom_actions'}
                  className="Font17 mLeft5"
                />
              )
            ) : (
              <Icon icon="custom_actions" className="Font17 mLeft5 Gray_bd" />
            )
          }
          className={cx({ disabled: btnDisable[button.btnId] || button.disabled })}
          onClick={() => {
            if (this.handleButtonClick(button)) {
              return;
            }
            document.body.click();
          }}
        >
          <span className="btnName mLeft15 ellipsis">{button.name}</span>
          {button.desc && (
            <Tooltip
              autoCloseDelay={0}
              destroyPopupOnHide
              placement="bottom"
              overlayStyle={{ maxWidth: 350 }}
              title={<span>{button.desc}</span>}
            >
              <i className="icon icon-info_outline Font17 mTop9 Right" />
            </Tooltip>
          )}
        </MenuItemWrap>
      ));
    }
    return (
      <React.Fragment>
        {this.renderDialogs()}
        {buttonComponents}
      </React.Fragment>
    );
  }
}
