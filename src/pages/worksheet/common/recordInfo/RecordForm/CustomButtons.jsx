import React, { Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import styled from 'styled-components';
import { Input } from 'antd';
import { Button, MenuItem, Icon, Tooltip, Textarea, Dialog, VerifyPasswordConfirm } from 'ming-ui';
import IconText from 'worksheet/components/IconText';
import NewRecord from 'src/pages/worksheet/common/newRecord/NewRecord';
import { verifyPassword } from 'src/util';
import FillRecordControls from '../FillRecordControls';
import { CUSTOM_BUTTOM_CLICK_TYPE } from 'worksheet/constants/enum';
import worksheetAjax from 'src/api/worksheet';
import { getRowDetail } from 'worksheet/api';
import processAjax from 'src/pages/workflow/api/process';
import _ from 'lodash';
import FunctionWrap from 'ming-ui/components/FunctionWrap';

const Password = styled(Input.Password)`
  box-shadow: none !important;
  line-height: 28px !important;
  border-radius: 3px !important;
  border: 1px solid #ccc !important;
  margin-bottom: 10px;
  &.ant-input-affix-wrapper-focused {
    border-color: #2196f3;
  }
`;

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

const SectionName = styled.div`
  font-size: 13px;
  color: #333;
  font-weight: 500;
  margin: 18px 0 8px;
  position: relative;
  &.required {
    &:before {
      position: absolute;
      left: -10px;
      top: 3px;
      color: red;
      content: '*';
    }
  }
`;

const RemarkTextArea = styled(Textarea)`
  &::placeholder {
    color: #bfbfbf;
  }
`;

function confirm(props) {
  const {
    title,
    description,
    okText,
    cancelText,
    enableRemark,
    remarkName,
    remarkHint,
    remarkRequired,
    verifyPwd,
    onOk,
    onClose,
  } = props;
  const passwordRef = useRef();
  const remarkRef = useRef();
  return (
    <Dialog
      visible
      className="customButtonConfirm"
      title={<b>{title}</b>}
      okText={okText}
      cancelText={cancelText}
      onOk={() => {
        const remark = _.get(remarkRef, 'current.value') || '';
        if (remarkRequired && !remark.trim()) {
          alert(_l('%0不能为空', remarkName), 3);
          return;
        }
        if (verifyPwd) {
          verifyPassword(passwordRef.current.input.value, () => {
            onOk({ remark });
            onClose();
          });
        } else {
          onOk({ remark });
          onClose();
        }
      }}
      onCancel={onClose}
    >
      {description && <div className="Font14 Gray_75">{description}</div>}
      {enableRemark && (
        <Fragment>
          <SectionName className={cx({ required: remarkRequired })}>{remarkName || _l('备注')}</SectionName>
          <RemarkTextArea manualRef={ref => (remarkRef.current = ref)} placeholder={remarkHint} />
        </Fragment>
      )}
      {verifyPwd && (
        <Fragment>
          <SectionName className={cx({ required: true })}>{_l('登录密码验证')}</SectionName>
          <div style={{ height: '0px', overflow: 'hidden' }}>
            // 用来避免浏览器将用户名塞到其它input里
            <input type="text" />
          </div>
          <Password
            ref={passwordRef}
            autoComplete="new-password"
            placeholder={_l('输入当前用户（%0）的登录密码', md.global.Account.fullname)}
          />
        </Fragment>
      )}
    </Dialog>
  );
}

const confirmClick = props => FunctionWrap(confirm, props);
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

  @autobind
  triggerCustomBtn(btn) {
    const { worksheetId, recordId, handleUpdateWorksheetRow } = this.props;
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
    function handleTrigger() {
      const needConform = btn.enableConfirm || btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.CONFIRM;
      function run({ remark } = {}) {
        function trigger(btn) {
          if (handleTriggerCustomBtn) {
            handleTriggerCustomBtn(btn);
            return;
          }
          _this.triggerImmediately(btn.btnId);
          triggerCallback();
        }
        if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.FILL_RECORD) {
          // 填写字段
          _this.remark = remark;
          _this.fillRecord(btn);
        } else if (_.get(btn, 'advancedSetting.enableremark') && remark) {
          if (_.isFunction(handleUpdateWorksheetRow)) {
            handleUpdateWorksheetRow({
              worksheetId,
              rowId: recordId,
              newOldControl: [],
              btnRemark: remark,
              btnId: btn.btnId,
              btnWorksheetId: worksheetId,
              btnRowId: recordId,
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
          });
        } else {
          trigger(btn);
        }
      }
      function verifyAndRun() {
        if (btn.verifyPwd) {
          VerifyPasswordConfirm.confirm({
            title: _l('安全认证'),
            inputName: _l('登录密码验证'),
            passwordPlaceHolder: _l('输入当前用户（%0）的密码', md.global.Account.fullname),
            onOk: run,
          });
        } else {
          run();
        }
      }
      if (needConform) {
        // 二次确认
        confirmClick({
          title: btn.confirmMsg,
          description: _.get(btn, 'advancedSetting.confirmcontent'),
          enableRemark: _.get(btn, 'advancedSetting.enableremark'),
          remarkName: _.get(btn, 'advancedSetting.remarkname'),
          remarkHint: _.get(btn, 'advancedSetting.remarkhint'),
          remarkRequired: _.get(btn, 'advancedSetting.remarkrequired'),
          verifyPwd: btn.verifyPwd,
          okText: btn.sureName,
          cancelText: btn.cancelName,
          onOk: run,
        });
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
  }

  @autobind
  triggerImmediately(btnId) {
    const { worksheetId, recordId, loadBtns, onButtonClick } = this.props;
    onButtonClick(btnId);
    processAjax
      .startProcess({
        appId: worksheetId,
        sources: [recordId],
        triggerId: btnId,
        pushUniqueId: md.global.Config.pushUniqueId,
      })
      .then(data => {
        loadBtns();
      });
  }

  @autobind
  handleAddRecordCallback(recordItem) {
    const { reloadRecord, loadBtns, triggerCallback } = this.props;
    const { activeBtn = {} } = this;
    const btnTypeStr = activeBtn.writeObject + '' + activeBtn.writeType;
    // 新建记录成功回掉
    if (this.activeBtn.workflowType === 2) {
      alert(_l('操作成功'));
    }
    loadBtns();
    if (btnTypeStr === '12') {
      reloadRecord();
    }
    triggerCallback();
  }

  @autobind
  fillRecordControls(newControls, targetOptions, customwidget) {
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
    // if (isFromBatchEdit) {
    //   delete args.btnRowId;
    //   delete args.rowId;
    //   delete args.rowId;
    //   if (isAll) {
    //     args.isAll = true;
    //     args.excludeRowIds = selectedRows.map(row => row.rowid);
    //   } else {
    //     args.rowIds = selectedRows.map(row => row.rowid);
    //   }
    // }
    if (_.isFunction(handleUpdateWorksheetRow)) {
      handleUpdateWorksheetRow(args);
      this.setStateFn({
        fillRecordControlsVisible: false,
      });
      return;
    }
    worksheetAjax.updateWorksheetRow(args).then(res => {
      if (res && res.data) {
        this.setStateFn({
          fillRecordControlsVisible: false,
        });
        loadBtns();
        onUpdateRow(res.data);
        if (this.activeBtn.workflowType === 2) {
          alert(_l('操作成功'));
        }
        if (targetOptions.recordId === recordId) {
          onUpdate(_.pick(res.data, newControls.map(c => c.controlId).concat('isviewdata')), res.data, newControls);
        }
        if (this.activeBtn.writeObject === 1 && !res.data.isviewdata) {
          hideRecordInfo();
        }
        triggerCallback();
      } else {
        if (res.resultCode === 11) {
          if (customwidget && _.isFunction(customwidget.uniqueErrorUpdate)) {
            customwidget.uniqueErrorUpdate(res.badData);
          }
        } else {
          alert(_l('保存失败，请稍后重试'), 2);
        }
      }
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
    this.activeBtn = btn;
    this.fillRecordProps = {};
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

  @autobind
  setStateFn(args) {
    const { setCustomButtonActive } = this.props;
    if (typeof args.fillRecordControlsVisible !== 'undefined' || typeof args.newRecordVisible !== 'undefined') {
      setCustomButtonActive(args.fillRecordControlsVisible || args.newRecordVisible);
    }
    this.setState(args);
  }

  renderDialogs() {
    const { worksheetId, viewId, appId, recordId, projectId, isBatchOperate, triggerCallback } = this.props;
    const { rowInfo, fillRecordControlsVisible, newRecordVisible } = this.state;
    const { activeBtn = {}, fillRecordId, btnRelateWorksheetId, fillRecordProps } = this;
    const btnTypeStr = activeBtn.writeObject + '' + activeBtn.writeType;
    return (
      <React.Fragment key="dialogs">
        {fillRecordControlsVisible && (
          <FillRecordControls
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
            writeControls={activeBtn.writeControls}
            onSubmit={this.fillRecordControls}
            hideDialog={() => {
              this.setStateFn({
                fillRecordControlsVisible: false,
              });
              triggerCallback();
            }}
            {...fillRecordProps}
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
              btnRemark: this.remark,
            }}
            defaultRelatedSheet={{
              worksheetId,
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
        const buttonComponent = (
          <span key={i} className="InlineBlock borderBox mRight6">
            <Button
              className={cx('recordCustomButton overflowHidden')}
              size="small"
              type="ghost"
              disabled={btnDisable[button.btnId] || button.disabled}
              style={{
                backgroundColor: button.color || '#2196f3',
                borderColor: button.color || '#2196f3',
                color: '#fff',
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
                {button.icon && <i className={`icon icon-${button.icon}`}></i>}
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
        <IconText
          disabled={btnDisable[button.btnId] || button.disabled}
          icon={button.icon || 'custom_actions'}
          iconColor={button.color}
          text={button.name}
          onClick={evt => {
            if (btnDisable[button.btnId] || button.disabled) {
              return;
            }
            onHideMoreBtn(evt);
            this.triggerCustomBtn(button);
          }}
        />
      ));
    } else {
      buttonComponents = buttons.map((button, i) => (
        <MenuItemWrap
          key={i}
          icon={
            button.icon ? (
              <Icon style={{ color: button.color }} icon={button.icon || 'custom_actions'} className="Font17 mLeft5" />
            ) : (
              <Icon icon="custom_actions" className="Font17 mLeft5" />
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
