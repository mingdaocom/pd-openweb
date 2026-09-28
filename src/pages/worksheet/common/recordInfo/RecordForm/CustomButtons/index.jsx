import React, { useCallback, useRef } from 'react';
import cx from 'classnames';
import _, { find, get, includes, isFunction, isUndefined } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { SvgIcon, VerifyPasswordConfirm } from 'ming-ui';
import { Button, Modal, Tooltip } from 'ming-ui/antd-components';
import { mdNotification } from 'ming-ui/functions';
import verifyPassword from 'ming-ui/functions/verifyPassword';
import { useFunctionWrapOpener, withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import worksheetAjax from 'src/api/worksheet';
import processAjax from 'src/pages/workflow/api/process';
import { getRowDetail } from 'worksheet/api';
import { useAddRecord } from 'worksheet/common/newRecord/addRecord';
import IconText from 'worksheet/components/IconText';
import { CUSTOM_BUTTOM_CLICK_TYPE } from 'src/utils/domain/worksheet/constants';
import { emitter } from 'src/utils/platform/browser/dom';
import { appendDataToLocalPushUniqueId } from 'src/utils/platform/storage/local';
import { getTranslateInfo } from 'src/utils/services/app';
import { handleRecordError } from 'src/utils/services/worksheet/record';
import FillRecordControls from '../../FillRecordControls';
import CustomButtonConfirm from './CustomButtonConfirm';

export const HoverButton = styled(Button)`
  ${props =>
    props.$operateHeight &&
    `&.isOperates {
    height: ${props.$operateHeight}px !important;
    padding: 0 8px 0 8px !important;
    .hap-btn-icon .icon {
      font-size: 16px !important;
    }
    &.operates-showIcon-false:not(.operates-icon) {
      .hap-btn-icon {
        display: none !important;
      }
    }
    &.operates-icon {
      border: none !important;
      background: transparent !important;
      /* 停用态不给悬浮反馈，否则会误导成可点击 */
      &:not(:disabled):hover {
        background: var(--color-background-hover) !important;
      }
    }
    &.operates-text {
      border: none !important;
      background: transparent !important;
      &:not(:disabled):hover {
        border: none !important;
        background: var(--color-background-secondary) !important;
      }
    }
    &.operates-icon {
      width: 28px !important;
      min-width: 28px !important;
      padding: 0 !important;
      .hap-btn-icon {
        margin: 0 !important;
        width: 28px !important;
        /* 图标容器被撑满按钮宽度，需自己水平居中，否则图标贴左 */
        justify-content: center;
      }
      .buttonText {
        display: none !important;
      }
      /* 仅图标时可点击态直接露出按钮自身配色，未配自定义色时回退到按钮文字色 */
      &:not(:disabled) .hap-btn-icon .icon {
        color: var(--hap-btn-color-base, currentColor) !important;
      }
      /* 停用态统一灰色；保留原色的多色 svg 图标不跟随 color，靠灰阶一起压成灰色 */
      &:disabled .hap-btn-icon .icon {
        color: var(--color-text-disabled) !important;
        filter: grayscale(1);
      }
    }
    &:not(.isInCard) .buttonText {
      max-width: 200px !important;
    }
  }`}
`;

class CustomButtonActionController extends React.Component {
  static propTypes = {
    iseditting: PropTypes.bool,
    isBatchOperate: PropTypes.bool,
    type: PropTypes.string,
    projectId: PropTypes.string,
    viewId: PropTypes.string,
    worksheetId: PropTypes.string,
    recordId: PropTypes.string,
    workId: PropTypes.string,
    instanceId: PropTypes.string,
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
    openAddRecord: PropTypes.func,
    openFunctionWrap: PropTypes.func,
    modal: PropTypes.shape({ confirm: PropTypes.func }),
    actionsRef: PropTypes.shape({ current: PropTypes.shape({}) }),
    onButtonTriggerFail: PropTypes.func,
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
    onButtonTriggerFail: () => {},
  };

  state = {};

  componentDidMount() {
    this.props.actionsRef.current = this;
    emitter.on('RECORD_WORKFLOW_UPDATE', this.handleRecordWorkflowUpdate);
  }
  componentWillUnmount() {
    if (this.props.actionsRef.current === this) {
      this.props.actionsRef.current = null;
    }

    emitter.off('RECORD_WORKFLOW_UPDATE', this.handleRecordWorkflowUpdate);
  }

  get continueFill() {
    return get(this.activeBtn, 'advancedSetting.continuewrite') === '1';
  }
  get tipConfig() {
    const { appId, worksheetId } = this.props;
    const translateInfo = getTranslateInfo(appId, worksheetId, this.activeBtn.btnId);
    const tiptext = get(this.activeBtn, 'advancedSetting.tiptext');
    return {
      enableTip: get(this.activeBtn, 'advancedSetting.opentip') !== '0',
      tipText: tiptext ? translateInfo.completeText || tiptext || _l('操作完成') : _l('操作完成'),
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
    appendDataToLocalPushUniqueId(_this.tipConfig);
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
        showVerifyType: true,
        allowNoVerify: !removeNoneVerification,
        isRequired: true,
        closeImageValidation: true,
        onOk: run,
      });
    }

    function handleTrigger() {
      const needConfirm = btn.enableConfirm || btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.CONFIRM;

      function confirm({ onOk, onClose = () => {} } = {}) {
        // 同一时刻只允许存在一个二次确认弹层。连点提交会走多次 onSave，每次都调到这里，
        // 叠加出的确认框位置完全重合，逐个点确定就会把同一个按钮动作重复执行多次。
        // 这里按弹层 DOM 是否存在来判断，而不是用模块级标志位：FunctionWrap 的 popstate 卸载
        // 只 unmount、不回调 onClose，标志位会永久残留，导致之后再也弹不出确认框
        if (document.querySelector('.customButtonConfirmDialog')) {
          // 走调用方的取消分支收尾，避免 await 的 Promise 一直挂起、loading 关不掉
          if (isFunction(onClose)) {
            onClose();
          }

          return;
        }

        const translateInfo = getTranslateInfo(appId, worksheetId, btn.btnId);
        const advancedSetting = _.get(btn, 'advancedSetting') || {};
        const title = btn.confirmMsg ? translateInfo.confirmMsg || btn.confirmMsg : '';
        const description = advancedSetting.confirmcontent
          ? translateInfo.confirmContent || advancedSetting.confirmcontent
          : '';
        const enableRemark = advancedSetting.enableremark;
        const okText = btn.sureName ? translateInfo.sureName || btn.sureName : '';
        const cancelText = btn.cancelName ? translateInfo.cancelName || btn.cancelName : '';
        const handleConfirm = onOk || run;

        if (!description && !enableRemark && !btn.verifyPwd) {
          _this.props.modal.confirm({
            className: 'customButtonConfirm customButtonConfirmDialog',
            content: <div className="Font17 bold textPrimary">{title}</div>,
            okText: okText || _l('确定'),
            cancelText: cancelText || _l('取消'),
            focusable: { autoFocusButton: 'ok' },
            okButtonProps: { 'data-custom-button-confirm-ok': true },
            mask: { closable: true },
            // 记录详情和静态确认框各自存在焦点锁，autoFocusButton 的首次聚焦会被外层焦点锁覆盖；
            // 等内层弹层完成打开后再次聚焦确认按钮，避免焦点落到关闭或取消按钮。
            afterOpenChange: open => {
              if (open) {
                document
                  .querySelector('.customButtonConfirmDialog [data-custom-button-confirm-ok]')
                  ?.focus({ preventScroll: true });
              }
            },
            onOk: () => handleConfirm({ remark: '' }),
            onCancel: onClose,
          });
          return;
        }

        _this.props.openFunctionWrap(CustomButtonConfirm, {
          projectId,
          title,
          description,
          enableRemark,
          remarkName: advancedSetting.remarkname ? translateInfo.remark || advancedSetting.remarkname : '',
          remarkHint: advancedSetting.remarkhint ? translateInfo.hintText || advancedSetting.remarkhint : '',
          remarkRequired: _.get(btn, 'advancedSetting.remarkrequired'),
          remarkoptions: (() => {
            const remarkoptions = safeParse(_.get(btn, 'advancedSetting.remarkoptions'));
            const { template = [] } = remarkoptions;
            return JSON.stringify({
              ...remarkoptions,
              template: template.map((item, index) => {
                return {
                  ...item,
                  value: item.value ? translateInfo[`templateName_${index}`] || item.value : '',
                };
              }),
            });
          })(),
          remarktype: advancedSetting.remarktype,
          verifyPwd: btn.verifyPwd,
          okText,
          cancelText,
          onOk: handleConfirm,
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

    const batchOperateLimit = md.global.SysSettings.worktableBatchOperateDataLimitCount || 1000;

    if (count > batchOperateLimit) {
      this.props.modal.confirm({
        title: (
          <span
            style={{
              lineHeight: '1.5em',
            }}
          >
            {_l('最大支持批量执行%0行记录，是否只选中并执行前%0行数据？', batchOperateLimit)}
          </span>
        ),
        onOk: handleTrigger,
      });
    } else {
      handleTrigger();
    }
  };

  triggerImmediately = (btnId, btn) => {
    const { worksheetId, recordId, loadBtns, onButtonClick, onButtonTriggerFail } = this.props;
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
          // 流程没有启动，不会有执行结束的推送回执，需就地解除点击态，否则按钮一直灰着
          onButtonTriggerFail(btnId);
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
    this.props.openAddRecord({
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
    const { isAll, worksheetId, recordId, changeToSelectCurrentPageFromSelectAll } = this.props;
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
          this.props.modal.confirm({
            title: _l('不支持跨页批量修改附件'),
            content: _l('该按钮中附件字段的编辑仅对本页选中的记录生效'),
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
          this.props.modal.confirm({
            title: _l('无法执行按钮“%0”', btn.name),
            content: _l('关联字段被隐藏或已删除'),
            okButtonProps: {
              danger: true,
            },
            cancelButtonProps: {
              style: {
                display: 'none',
              },
            },
          });
          return;
        }

        try {
          const controldata = JSON.parse(addRelationControl.value);

          if (addRelationControl.enumDefault === 1 && controldata.length) {
            this.props.modal.confirm({
              title: _l('无法执行按钮“%0”', btn.name),
              content: _l('“%0”已有关联记录，无法重复添加', addRelationControl.controlName),
              okButtonProps: {
                danger: true,
              },
              cancelButtonProps: {
                style: {
                  display: 'none',
                },
              },
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
          this.props.modal.confirm({
            title: _l('无法执行按钮“%0”', btn.name),
            content: _l('“%0”为空，请关联操作后再执行按钮操作', relationControl.controlName),
            okButtonProps: {
              danger: true,
            },
            cancelButtonProps: {
              style: {
                display: 'none',
              },
            },
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
          this.props.modal.confirm({
            title: _l('无法执行按钮“%0”', btn.name),
            content: _l('“%0”为空，请关联操作后再执行按钮操作', relationControl.controlName),
            okButtonProps: {
              danger: true,
            },
            cancelButtonProps: {
              style: {
                display: 'none',
              },
            },
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
        this.props.modal.confirm({
          title: _l('无法执行按钮“%0”', this.activeBtn.name),
          content: _l('关联字段被隐藏或已删除'),
          okButtonProps: {
            danger: true,
          },
          cancelButtonProps: {
            style: {
              display: 'none',
            },
          },
        });
        return;
      }

      try {
        const relationControlrelationControlData = JSON.parse(relationControlrelationControl.value);

        if (relationControlrelationControl.enumDefault === 1 && relationControlrelationControlData.length) {
          this.props.modal.confirm({
            title: _l('无法执行按钮“%0”', this.activeBtn.name),
            content: _l('“%0”已有关联记录，无法重复添加', relationControlrelationControl.controlName),
            okButtonProps: {
              danger: true,
            },
            cancelButtonProps: {
              style: {
                display: 'none',
              },
            },
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
      workId,
      instanceId,
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
            customButton={{
              btnId: activeBtn.btnId,
              workId,
              instanceId,
            }}
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
      ((isRecordLock && !includes(['copy', 'print', 'sysprint', 'share'], button.type)) || isEditLock) &&
      button.clickType === 3
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
    return this.renderDialogs();
  }
}

const CustomButtonActionControllerWithOpeners = withOpeners(CustomButtonActionController, {
  openFunctionWrap: useFunctionWrapOpener,
  openAddRecord: useAddRecord,
});

export function useCustomButtonActions(props) {
  const actionsRef = useRef();
  const [modal, contextHolder] = Modal.useModal();
  const executeButton = useCallback(button => {
    return actionsRef.current ? actionsRef.current.handleButtonClick(button) : true;
  }, []);
  const holder = (
    <React.Fragment>
      {contextHolder}
      <CustomButtonActionControllerWithOpeners {...props} actionsRef={actionsRef} modal={modal} />
    </React.Fragment>
  );

  return { executeButton, holder };
}

function CustomButtons(props) {
  const { executeButton, holder } = useCustomButtonActions(props);
  const {
    type = 'button',
    showMore,
    operateHeight,
    btnDisable = {},
    isOperates,
    hideDisabled,
    isInCard,
    onHideMoreBtn,
  } = props;
  let { buttons } = props;

  if (hideDisabled) {
    buttons = buttons.filter(button => !(btnDisable[button.btnId] || button.disabled));
  }

  if (md.global.Account.isPortal) {
    buttons = buttons.map(button => ({ ...button, verifyPwd: false }));
  }

  let buttonComponents = [];

  if (type === 'button') {
    buttonComponents = buttons.map((button, index) => {
      const isDisabled = btnDisable[button.btnId] || button.disabled;
      const showAsPrimary = button.showAsPrimary !== false;
      const isTransparent = button.color === 'transparent';
      const color = isTransparent ? 'default' : button.color || 'primary';
      const variant = showAsPrimary && !isTransparent ? 'solid' : 'outlined';
      const buttonIcon =
        !!button.iconUrl && !!button.icon && button.icon.endsWith('_svg') ? (
          <SvgIcon
            className="InlineBlock icon svgIcon"
            addClassName="TxtMiddle"
            url={button.iconUrl}
            fill="currentColor"
            size={16}
          />
        ) : button.icon ? (
          <i className={`icon icon-${button.icon || 'custom_actions'}`} />
        ) : null;

      let hasRightMargin = true;

      if (isOperates) {
        if (button.style === 'text') {
          hasRightMargin = false;
        } else if (isInCard && includes(['text', 'icon'], button.style)) {
          hasRightMargin = false;
        } else if (buttons.length === 1 && !showMore) {
          hasRightMargin = false;
        } else if (!showMore && index === buttons.length - 1) {
          hasRightMargin = false;
        }
      }

      const buttonComponent = (
        <span key={button.btnId} className={cx('InlineBlock borderBox', { mRight6: hasRightMargin })}>
          <HoverButton
            $operateHeight={isOperates && operateHeight}
            className={cx(
              'recordCustomButton overflowHidden',
              {
                isOperates,
                isInCard,
              },
              button.className,
            )}
            color={color}
            variant={variant}
            disabled={isDisabled}
            icon={buttonIcon}
            style={{ maxWidth: '100%' }}
            onClick={event => {
              if (executeButton(button)) {
                return;
              }

              onHideMoreBtn(event);
            }}
            title={button.name}
          >
            <span className="buttonText breakAll overflow_ellipsis">{button.name}</span>
          </HoverButton>
        </span>
      );

      if (button.desc && button.style !== 'icon') {
        return (
          <Tooltip key={button.btnId} placement="bottom" title={button.desc}>
            {buttonComponent}
          </Tooltip>
        );
      }

      if (button.style === 'icon') {
        return (
          <Tooltip key={button.btnId} placement="bottom" title={button.name}>
            {buttonComponent}
          </Tooltip>
        );
      }

      return buttonComponent;
    });
  } else if (type === 'iconText') {
    buttonComponents = buttons.map(button => (
      <Tooltip key={button.btnId} placement="bottom" title={button.desc}>
        <span>
          <IconText
            title={button.name}
            disabled={btnDisable[button.btnId] || button.disabled}
            icon={button.icon || 'custom_actions'}
            iconUrl={button.iconUrl}
            iconColor={
              !button.icon
                ? 'var(--color-text-disabled)'
                : button.color === 'transparent'
                  ? 'var(--color-text-primary)'
                  : button.color
            }
            text={button.name}
            onClick={event => {
              if (executeButton(button)) {
                return;
              }

              onHideMoreBtn(event);
            }}
          />
        </span>
      </Tooltip>
    ));
  }

  return (
    <React.Fragment>
      {holder}
      {buttonComponents}
    </React.Fragment>
  );
}

CustomButtons.propTypes = CustomButtonActionController.propTypes;
CustomButtons.defaultProps = CustomButtonActionController.defaultProps;

export default CustomButtons;
