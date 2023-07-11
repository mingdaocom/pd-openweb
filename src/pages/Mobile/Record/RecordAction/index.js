import React, { Fragment, Component } from 'react';
import cx from 'classnames';
import { getRequest, verifyPassword } from 'src/util';
import worksheetAjax from 'src/api/worksheet';
import { getRowDetail } from 'worksheet/api';
import { Modal, Progress, WingBlank } from 'antd-mobile';
import { message } from 'antd';
import { Icon } from 'ming-ui';
import MobileVertifyPassword from 'src/ming-ui/components/VertifyPasswordMoibile';
import FillRecordControls from 'src/pages/worksheet/common/recordInfo/FillRecordControls/MobileFillRecordControls';
import NewRecord from 'src/pages/worksheet/common/newRecord/MobileNewRecord';
import { doubleConfirmFunc } from './DoubleConfirm';
import CustomRecordCard from 'mobile/RecordList/RecordCard';
import processAjax from 'src/pages/workflow/api/process';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { RecordInfoModal } from 'mobile/Record';
import workflowPushSoket from '../socket/workflowPushSoket';
import customBtnWorkflow from '../socket/customBtnWorkflow';
import './index.less';
import _ from 'lodash';

const CUSTOM_BUTTOM_CLICK_TYPE = {
  IMMEDIATELY: 1,
  CONFIRM: 2,
  FILL_RECORD: 3,
};

class RecordAction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fillRecordVisible: false,
      newRecordVisible: false,
      btnDisable: {},
      rowInfo: {},
      previewRecord: {},
      percent: 0,
      num: 0,
    };
    const { isSubList, editable } = getRequest();
    this.isSubList = isSubList == 'true';
    this.editable = editable == 'true';
  }
  componentDidMount() {
    workflowPushSoket({ viewId: this.props.viewId });
    customBtnWorkflow();
  }
  componentWillUnmount() {
    if (!window.IM) return;
    IM.socket.off('workflow_push');
    IM.socket.off('workflow');
  }

  recef = React.createRef();

  handleTriggerCustomBtn = btn => {
    const {
      worksheetId,
      rowId,
      handleUpdateWorksheetRow,
      handleBatchOperateCustomBtn, // 批量处理
      batchOptCheckedData = [],
    } = this.props;
    this.setState({ custBtnName: btn.name });
    this.remark = undefined;
    const _this = this;
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    const run = ({ remark } = {}) => {
      const trigger = () => {
        if (_.isFunction(handleBatchOperateCustomBtn)) {
          handleBatchOperateCustomBtn(btn);
          return;
        }
        _this.triggerImmediately(btn);
      };
      if (_.get(btn, 'advancedSetting.enableremark') && remark) {
        if (_.isFunction(handleUpdateWorksheetRow)) {
          handleUpdateWorksheetRow({
            worksheetId,
            rowId: rowId,
            newOldControl: [],
            btnRemark: remark,
            btnId: btn.btnId,
            btnWorksheetId: worksheetId,
            btnRowId: rowId,
          });
          return;
        }
        worksheetAjax
          .updateWorksheetRow({
            worksheetId,
            rowId: rowId,
            newOldControl: [],
            btnRemark: remark,
            btnId: btn.btnId,
            btnWorksheetId: worksheetId,
            btnRowId: rowId,
          })
          .then(() => {
            trigger(btn);
          });
      } else {
        trigger(btn);
      }
    };
    const handleTrigger = () => {
      const needConfirm = btn.enableConfirm || btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.CONFIRM;
      function confirm({ onOk, onClose = () => {} } = {}) {
        const { confirmcontent, enableremark, remarkname, remarkhint, remarkrequired, remarktype, remarkoptions } =
          _.get(btn, 'advancedSetting') || {};
        doubleConfirmFunc({
          title: btn.confirmMsg,
          description: confirmcontent,
          enableRemark: enableremark,
          remarkName: remarkname,
          remarkHint: remarkhint,
          remarkRequired: remarkrequired,
          remarktype,
          remarkoptions,
          verifyPwd: btn.verifyPwd,
          enableConfirm: btn.enableConfirm,
          okText: btn.sureName,
          cancelText: btn.cancelName,
          btn,
          onOk: onOk ? onOk : btnInfo => run(btnInfo),
          onClose,
        });
      }
      if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.FILL_RECORD) {
        // 填写字段
        _this.fillRecord({
          ...btn,
          confirm: !needConfirm
            ? () => {}
            : () =>
                new Promise((resolve, reject) => {
                  confirm({
                    onOk: ({ remark }) => {
                      _this.remark = remark;
                      resolve();
                    },
                    onClose: reject,
                  });
                }),
        });
        return;
      }
      function verifyAndRun() {
        if (btn.verifyPwd) {
          verifyPassword({
            checkNeedAuth: true,
            closeImageValidation: true,
            success: run,
            fail: () => {
              MobileVertifyPassword.confirm({
                title: _l('安全认证'),
                inputName: _l('登录密码验证'),
                passwordPlaceHolder: _l('输入当前用户（%0）的登录密码', md.global.Account.fullname),
                onOk: run,
              });
            },
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
    };
    if (batchOptCheckedData.length > 1000) {
      Modal.alert(_l('最大支持批量执行1000行记录，是否只选中并执行前1000行数据？'), '', [
        { text: '取消', onPress: () => {} },
        { text: '确认', onPress: () => handleTrigger() },
      ]);
    } else {
      handleTrigger();
    }
    this.props.hideRecordActionVisible();
  };

  triggerImmediately = btn => {
    this.disableCustomButton(btn.btnId);
    const { worksheetId, rowId } = this.props;
    processAjax
      .startProcess({
        appId: worksheetId,
        sources: [rowId],
        triggerId: btn.btnId,
      })
      .then(data => {
        this.props.loadRow();
        this.props.loadCustomBtns();
        setTimeout(() => {
          this.setState({ btnDisable: {} });
          this.props.updateBtnDisabled({});
        }, 500);
      });
  };
  disableCustomButton = id => {
    this.setState({
      btnDisable: { ...this.state.btnDisable, [id]: true },
    });
    this.props.updateBtnDisabled({ [id]: true });
  };
  async fillRecord(btn) {
    const { worksheetId, rowId } = this.props;
    let rowInfo;
    if (rowId) {
      rowInfo = await getRowDetail({
        worksheetId,
        getType: 1,
        rowId,
      });
      rowInfo = {
        ...rowInfo,
        receiveControls: rowInfo.formData,
      };
    } else {
      const worksheetInfo = await worksheetAjax.getWorksheetInfo({ worksheetId, getTemplate: true });
      rowInfo = {
        receiveControls: worksheetInfo.template.controls,
      };
    }
    const titleControl = _.find(rowInfo.receiveControls, control => control.attribute === 1);
    const caseStr = btn.writeObject + '' + btn.writeType;
    const relationControl = _.find(rowInfo.receiveControls, c => c.controlId === btn.relationControl);
    const addRelationControl = _.find(rowInfo.receiveControls, c => c.controlId === btn.addRelationControl);
    this.setState({ rowInfo });
    this.activeBtn = btn;
    this.masterRecord = {};
    this.fillRecordProps = {};
    this.customButtonConfirm = btn.confirm;
    switch (caseStr) {
      case '11': // 本记录 - 填写字段
        this.btnRelateWorksheetId = worksheetId;
        this.fillRecordId = rowId;
        this.fillRecordProps = {
          formData: rowInfo.receiveControls,
          appId: this.props.appId,
        };
        this.setState({
          fillRecordVisible: true,
        });
        break;
      case '12': // 本记录 - 新建关联记录
        if (!addRelationControl || !_.isObject(addRelationControl)) {
          Modal.alert(_l('无法执行按钮“%0”', btn.name), _l('关联字段被隐藏或已删除'), [
            { text: _l('确定'), onPress: () => {} },
          ]);
          return;
        }
        try {
          const controldata = JSON.parse(addRelationControl.value);
          if (addRelationControl.enumDefault === 1 && controldata.length) {
            Modal.alert(
              _l('无法执行按钮“%0”', btn.name),
              _l('%0已有关联记录，无法重复添加', addRelationControl.controlName),
              [{ text: _l('确定'), onPress: () => {} }],
            );
            return;
          }
        } catch (err) {}
        this.btnAddRelateWorksheetId = addRelationControl.dataSource;
        this.masterRecord = {
          rowId: rowId,
          controlId: addRelationControl.controlId,
          worksheetId: worksheetId,
        };
        this.setState({
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
          };
        } catch (err) {
          Modal.alert(
            _l('无法执行按钮“%0”', btn.name),
            _l('“%0”为空，请关联操作后再执行按钮操作', relationControl.controlName),
            [{ text: _l('确定'), onPress: () => {} }],
          );
          return;
        }
        this.setState({
          fillRecordVisible: true,
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
          Modal.alert(
            _l('无法执行按钮“%0”', btn.name),
            _l('“%0”为空，请关联操作后再执行按钮操作', relationControl.controlName),
            [{ text: _l('确定'), onPress: () => {} }],
          );
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
    worksheetAjax
      .getRowByID({
        worksheetId: relationControl.dataSource,
        getType: 1,
        appId: relationControl.appId,
        rowId: controldata[0].sid,
        viewId: relationControl.viewId,
      })
      .then(data => {
        const relationControlrelationControl = _.find(
          data.receiveControls,
          c => c.controlId === relationControlrelationControlId,
        );
        if (!relationControlrelationControl) {
          Modal.alert(_l('无法执行按钮“%0”', this.activeBtn.name), _l('关联字段被隐藏或已删除'), [
            { text: _l('确定'), onPress: () => {} },
          ]);
          return;
        }
        try {
          const relationControlrelationControlData = JSON.parse(relationControlrelationControl.value);
          if (relationControlrelationControl.enumDefault === 1 && relationControlrelationControlData.length) {
            Modal.alert(
              _l('无法执行按钮“%0”', this.activeBtn.name),
              _l('“%0”已有关联记录，无法重复添加', relationControlrelationControl.controlName),
              [{ text: _l('确定'), onPress: () => {} }],
            );
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
          this.setState({
            newRecordVisible: true,
            rowInfo: data,
          });
        }
      });
  }
  handleOpenDiscuss = () => {
    const { appId, worksheetId, viewId, rowId } = this.props;
    window.mobileNavigateTo(`/mobile/discuss/${appId}/${worksheetId}/${viewId}/${rowId}`);
  };
  handleDeleteAlert = () => {
    const { hideRecordActionVisible } = this.props;
    Modal.alert(this.isSubList ? _l('是否删除子表记录 ?') : _l('是否删除此条记录 ?'), '', [
      { text: _l('取消'), style: 'default', onPress: () => {} },
      { text: _l('确定'), style: { color: 'red' }, onPress: this.handleDelete },
    ]);
    hideRecordActionVisible();
  };
  handleDelete = () => {
    const { appId, worksheetId, viewId, rowId } = this.props;
    worksheetAjax
      .deleteWorksheetRows({
        worksheetId,
        viewId,
        appId,
        rowIds: [rowId],
      })
      .then(({ isSuccess }) => {
        if (isSuccess) {
          alert(_l('删除成功'));
          history.back();
        } else {
          alert(_l('删除失败'), 2);
        }
      });
  };
  fillRecordControls = (newControls, targetOptions) => {
    const { worksheetId, rowId, handleUpdateWorksheetRow } = this.props;
    let { custBtnName } = this.state;
    const args = {
      appId: targetOptions.appId,
      viewId: targetOptions.viewId,
      worksheetId: targetOptions.worksheetId,
      rowId: targetOptions.recordId,
      projectID: targetOptions.projectId,
      newOldControl: newControls,
      btnId: this.activeBtn.btnId,
      btnWorksheetId: worksheetId,
      btnRowId: rowId,
      workflowType: this.activeBtn.workflowType,
      btnRemark: this.remark,
    };
    if (_.isFunction(handleUpdateWorksheetRow)) {
      handleUpdateWorksheetRow(args);
      this.setState({ fillRecordVisible: false });
      return;
    }
    worksheetAjax.updateWorksheetRow(args).then(res => {
      if (res && res.data) {
        this.props.loadRow();
        this.props.loadCustomBtns();
        if (this.activeBtn.workflowType === 2) {
          alert(_l('修改成功'));
        } else {
          message.info({
            className: 'flowToastInfo',
            content: (
              <div className="feedbackInfo">
                <span className="custBtnName">“{custBtnName}”</span>
                <span className="verticalAlignM">{_l('正在执行...')}</span>
              </div>
            ),
            duration: 1,
          });
        }
        this.setState({
          fillRecordVisible: false,
        });
      } else {
        if (res.resultCode === 11) {
          if (this.customwidget.current && _.isFunction(this.customwidget.current.uniqueErrorUpdate)) {
            this.customwidget.current.uniqueErrorUpdate(res.badData);
          }
        } else {
          alert(_l('操作失败，请稍后重试'), 2);
        }
      }
    });
  };
  handleAddRecordCallback = () => {
    const { isBatchOperate } = this.props;
    if (this.activeBtn.workflowType === 2) {
      alert(_l('创建成功'));
    }
    !isBatchOperate && this.props.loadRow();
    this.props.loadCustomBtns();
  };
  renderFillRecord() {
    const { activeBtn = {}, fillRecordId, btnRelateWorksheetId, fillRecordProps } = this;
    const { sheetRow, viewId, worksheetInfo = {}, isBatchOperate } = this.props;
    const btnTypeStr = activeBtn.writeObject + '' + activeBtn.writeType;
    return (
      <Modal
        popup
        animationType="slide-up"
        className="mobileFillRecordControlsModal"
        visible={this.state.fillRecordVisible}
        onClose={() => {
          this.setState({ fillRecordVisible: false });
        }}
      >
        <FillRecordControls
          title={activeBtn.name}
          loadWorksheetRecord={btnTypeStr === '21'}
          viewId={viewId}
          projectId={!isBatchOperate ? sheetRow.projectId : worksheetInfo.projectId}
          recordId={fillRecordId}
          worksheetId={btnRelateWorksheetId}
          writeControls={activeBtn.writeControls}
          onSubmit={this.fillRecordControls}
          hideDialog={() => {
            this.setState({
              fillRecordVisible: false,
            });
          }}
          {...fillRecordProps}
          customButtonConfirm={this.customButtonConfirm}
        />
      </Modal>
    );
  }
  renderNewRecord() {
    const { activeBtn = {} } = this;
    const { newRecordVisible, rowInfo } = this.state;
    const { worksheetId, rowId, appId } = this.props;
    return (
      newRecordVisible && (
        <NewRecord
          isCustomButton
          appId={appId}
          title={activeBtn.name}
          className="worksheetRelateNewRecord"
          worksheetId={this.btnAddRelateWorksheetId}
          addType={2}
          filterRelateSheetrecordbase={worksheetId}
          visible={newRecordVisible}
          masterRecord={this.masterRecord}
          customBtn={{
            btnId: activeBtn.btnId,
            btnWorksheetId: worksheetId,
            btnRowId: rowId,
            btnRemark: this.remark,
          }}
          defaultRelatedSheet={{
            worksheetId,
            relateSheetControlId: activeBtn.addRelationControl,
            value: {
              sid: this.masterRecord.rowId,
              sourcevalue: JSON.stringify(
                [{ rowid: this.masterRecord.rowId }, ...(rowInfo ? rowInfo.receiveControls : [])].reduce((a, b) => ({
                  ...a,
                  [b.controlId]: b.value,
                })),
              ),
            },
          }}
          hideNewRecord={() => {
            this.setState({ newRecordVisible: false });
          }}
          openRecord={(rowId, viewId) => {
            this.setState({
              previewRecord: { rowId, viewId },
            });
          }}
          onAdd={this.handleAddRecordCallback}
          customButtonConfirm={this.customButtonConfirm}
        />
      )
    );
  }
  renderRecordAction() {
    const {
      recordActionVisible,
      sheetRow,
      hideRecordActionVisible,
      customBtns,
      viewId,
      appId,
      switchPermit,
      isBatchOperate,
    } = this.props;
    const { btnDisable } = this.state;
    return (
      <Modal
        popup
        forceRender
        animationType="slide-up"
        className="actionSheetModal"
        visible={recordActionVisible}
        onClose={hideRecordActionVisible}
      >
        <React.Fragment>
          <div className="flexRow header">
            <span className="Font13">{!isBatchOperate ? _l('更多操作') : _l('对选中记录执行操作')}</span>
            <div className="closeIcon" onClick={hideRecordActionVisible}>
              <Icon icon="close" />
            </div>
          </div>
          <div className="flexRow customBtnLists Font13">
            {customBtns.map(item => (
              <div
                key={item.btnId}
                className={cx('flex', 'customBtnItem', { disabled: btnDisable[item.btnId] || item.disabled })}
                style={btnDisable[item.btnId] || item.disabled ? {} : { backgroundColor: item.color }}
                onClick={() => {
                  if (btnDisable[item.btnId] || item.disabled) {
                    return;
                  }
                  this.handleTriggerCustomBtn(item);
                }}
              >
                <Icon
                  icon={item.icon || 'custom_actions'}
                  className={cx('mRight7 Font15', { opcIcon: !item.icon && !item.disabled })}
                />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
          {appId && !isBatchOperate ? (
            <div className="extrBtnBox">
              {isOpenPermit(permitList.recordShareSwitch, switchPermit, viewId) && (
                <div className="flexRow extraBtnItem">
                  <Icon icon="share" className="Font18 delIcon" style={{ color: '#757575' }} />
                  <div className="flex delTxt Font15 Gray" onClick={this.props.onShare}>
                    {_l('分享')}
                  </div>
                </div>
              )}
              {(sheetRow.allowDelete || (this.isSubList && this.editable)) && (
                <div className="flexRow extraBtnItem">
                  <Icon icon="delete_12" className="Font18 delIcon" />
                  <div className="flex delTxt Font15" onClick={this.handleDeleteAlert}>
                    {_l('删除')}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </React.Fragment>
      </Modal>
    );
  }
  renderRecordInfo = () => {
    const { appId, viewId } = this.props;
    const { previewRecord } = this.state;
    return (
      <RecordInfoModal
        className="full"
        visible={!!previewRecord.rowId}
        appId={appId}
        worksheetId={this.btnAddRelateWorksheetId}
        viewId={previewRecord.viewId}
        rowId={previewRecord.rowId}
        onClose={() => {
          this.setState({
            previewRecord: {},
          });
        }}
      />
    );
  };
  render() {
    return (
      <div ref={this.recef}>
        {this.renderRecordAction()}
        {this.renderFillRecord()}
        {this.renderNewRecord()}
        {this.renderRecordInfo()}
      </div>
    );
  }
}

export default RecordAction;
