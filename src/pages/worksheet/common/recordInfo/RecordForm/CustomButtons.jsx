import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';
import { Button, MenuItem, Icon, Tooltip, Dialog, VerifyPasswordConfirm, SvgIcon } from 'ming-ui';
import { mdNotification } from 'ming-ui/functions';
import { verifyPassword } from 'src/util';
import IconText from 'worksheet/components/IconText';
import NewRecord from 'src/pages/worksheet/common/newRecord/NewRecord';
import FillRecordControls from '../FillRecordControls';
import { CUSTOM_BUTTOM_CLICK_TYPE } from 'worksheet/constants/enum';
import worksheetAjax from 'src/api/worksheet';
import { getRowDetail } from 'worksheet/api';
import processAjax from 'src/pages/workflow/api/process';
import _, { get } from 'lodash';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import CustomButtonConfirm from './CustomButtonConfirm';
import { emitter, appendDataToLocalPushUniqueId, getButtonColor, handleRecordError } from 'worksheet/util';

const MenuItemWrap = styled(MenuItem)`
  .btnName {
    max-width: calc(100% - 34px);
    display: inline-block;
  }
  &.disabled {
    cursor: not-allowed !important;
    opacity: 0.5;
  }
  &:not(.disabled):hover {
    .Icon {
      color: #fff !important;
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
    const { worksheetId, recordId, handleUpdateWorksheetRow, projectId } = this.props;
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
        allowNoVerify: !removeNoneVerification,
        isRequired: true,
        closeImageValidation: true,
        onOk: run,
      });
    }
    function handleTrigger() {
      const needConfirm = btn.enableConfirm || btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.CONFIRM;
      function confirm({ onOk, onClose = () => {} } = {}) {
        confirmClick({
          projectId,
          title: btn.confirmMsg,
          description: _.get(btn, 'advancedSetting.confirmcontent'),
          enableRemark: _.get(btn, 'advancedSetting.enableremark'),
          remarkName: _.get(btn, 'advancedSetting.remarkname'),
          remarkHint: _.get(btn, 'advancedSetting.remarkhint'),
          remarkRequired: _.get(btn, 'advancedSetting.remarkrequired'),
          remarkoptions: _.get(btn, 'advancedSetting.remarkoptions'),
          remarktype: _.get(btn, 'advancedSetting.remarktype'),
          verifyPwd: btn.verifyPwd,
          okText: btn.sureName,
          cancelText: btn.cancelName,
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

  handleAddRecordCallback = recordItem => {
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
      isFromBatchEdit,
      isAll,
      selectedRows,
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
    const { worksheetId, recordId } = this.props;
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
    this.setStateFn({ rowInfo });
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
        this.setStateFn({
          fillRecordControlsVisible: true,
        });
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
        } catch (err) {}
        this.btnAddRelateWorksheetId = addRelationControl.dataSource;
        this.masterRecord = {
          rowId: recordId,
          controlId: addRelationControl.controlId,
          worksheetId: worksheetId,
        };
        this.setStateFn({
          newRecordVisible: true,
        });
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
      } catch (err) {}
      this.masterRecord = {
        rowId: controldata[0].sid,
        controlId: relationControlrelationControl.controlId,
        worksheetId: relationControl.dataSource,
      };
      if (relationControlrelationControl) {
        this.btnAddRelateWorksheetId = relationControlrelationControl.dataSource;
        this.setStateFn({
          newRecordVisible: true,
          rowInfo: data,
        });
      }
    });
  }

  setStateFn = args => {
    const { setCustomButtonActive } = this.props;
    if (typeof args.fillRecordControlsVisible !== 'undefined' || typeof args.newRecordVisible !== 'undefined') {
      setCustomButtonActive(args.fillRecordControlsVisible || args.newRecordVisible);
    }
    this.setState(args);
  };

  renderDialogs() {
    const {
      isCharge,
      worksheetId,
      viewId,
      appId,
      recordId,
      projectId,
      isBatchOperate,
      triggerCallback,
      sheetSwitchPermit,
      isDraft,
    } = this.props;
    const { rowInfo, fillRecordControlsVisible, newRecordVisible } = this.state;
    const { activeBtn = {}, fillRecordId, btnRelateWorksheetId, fillRecordProps } = this;
    const btnTypeStr = activeBtn.writeObject + '' + activeBtn.writeType;
    return (
      <React.Fragment key="dialogs">
        {fillRecordControlsVisible && (
          <FillRecordControls
            isDraft={isDraft}
            isCharge={isCharge}
            isBatchOperate={isBatchOperate}
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
        {newRecordVisible && (
          <NewRecord
            isCustomButton
            title={this.activeBtn.name}
            className="worksheetRelateNewRecord recordOperateDialog"
            worksheetId={this.btnAddRelateWorksheetId}
            addType={2}
            filterRelateSheetrecordbase={worksheetId}
            visible={newRecordVisible}
            masterRecord={this.masterRecord}
            projectId={projectId}
            customBtn={{
              btnId: this.activeBtn.btnId,
              btnWorksheetId: worksheetId,
              btnRowId: recordId,
            }}
            customButtonConfirm={this.customButtonConfirm}
            defaultRelatedSheet={{
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
            }}
            hideNewRecord={() => {
              this.setStateFn({ newRecordVisible: false });
              triggerCallback();
            }}
            onAdd={this.handleAddRecordCallback}
          />
        )}
      </React.Fragment>
    );
  }

  render() {
    const { type = 'button', btnDisable = {}, hideDisabled, onHideMoreBtn } = this.props;
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
        const buttonColor = getButtonColor(button.color);
        const buttonComponent = (
          <span key={i} className="InlineBlock borderBox mRight6">
            <Button
              className={cx('recordCustomButton overflowHidden', {
                transparentButton: button.color === 'transparent',
              })}
              size="small"
              type="ghost"
              disabled={btnDisable[button.btnId] || button.disabled}
              title={button.name}
              style={{
                ...buttonColor,
                maxWidth: '100%',
                minWidth: 'inherit',
              }}
              onClick={evt => {
                if (btnDisable[button.btnId] || button.disabled) {
                  return;
                }
                onHideMoreBtn(evt);
                this.triggerCustomBtn(button);
              }}
            >
              <div className="content ellipsis">
                {!!button.iconUrl && !!button.icon && button.icon.endsWith('_svg') ? (
                  <SvgIcon
                    className="InlineBlock icon LineHeight30"
                    addClassName="TxtMiddle"
                    url={button.iconUrl}
                    fill={
                      !button.color || button.color === 'transparent' || btnDisable[button.btnId] || button.disabled
                        ? '#bdbdbd'
                        : buttonColor.color
                    }
                    size={18}
                  />
                ) : (
                  <i
                    className={cx(`icon icon-${button.icon || 'custom_actions'}`, {
                      Gray_bd: !button.icon && (!button.color || button.color === 'transparent'),
                    })}
                  />
                )}
                <span className="breakAll overflow_ellipsis">{button.name}</span>
              </div>
            </Button>
          </span>
        );
        return button.desc && type === 'button' ? (
          <Tooltip popupPlacement="bottom" tooltipStyle={{ maxWidth: 350 }} text={<span>{button.desc}</span>}>
            {buttonComponent}
          </Tooltip>
        ) : (
          buttonComponent
        );
      });
    } else if (type === 'iconText') {
      buttonComponents = buttons.map((button, i) => (
        <Tooltip
          popupPlacement="bottom"
          tooltipStyle={{ maxWidth: 350 }}
          text={button.desc && <span>{button.desc}</span>}
        >
          <span>
            <IconText
              title={button.name}
              disabled={btnDisable[button.btnId] || button.disabled}
              icon={button.icon || 'custom_actions'}
              iconUrl={button.iconUrl}
              iconColor={!button.icon ? '#bdbdbd' : button.color === 'transparent' ? '#151515' : button.color}
              text={button.name}
              onClick={evt => {
                if (btnDisable[button.btnId] || button.disabled) {
                  return;
                }
                onHideMoreBtn(evt);
                this.triggerCustomBtn(button);
              }}
            />
          </span>
        </Tooltip>
      ));
    } else {
      buttonComponents = buttons.map((button, i) => (
        <MenuItemWrap
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
          onClick={evt => {
            if (btnDisable[button.btnId] || button.disabled) {
              return;
            }
            document.body.click();
            this.triggerCustomBtn(button);
          }}
        >
          <span className="btnName mLeft15 ellipsis">{button.name}</span>
          {button.desc && (
            <Tooltip popupPlacement="bottom" tooltipStyle={{ maxWidth: 350 }} text={<span>{button.desc}</span>}>
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
