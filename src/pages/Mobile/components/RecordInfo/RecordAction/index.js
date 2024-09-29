import React, { Fragment, Component } from 'react';
import cx from 'classnames';
import { getRequest, verifyPassword, getCurrentProject } from 'src/util';
import worksheetAjax from 'src/api/worksheet';
import { getRowDetail } from 'worksheet/api';
import { Popup, Dialog, ActionSheet, Button } from 'antd-mobile';
import { message } from 'antd';
import { Icon, LoadDiv } from 'ming-ui';
import MobileVertifyPassword from 'src/ming-ui/components/VertifyPasswordMoibile';
import FillRecordControls from 'src/pages/worksheet/common/recordInfo/FillRecordControls/MobileFillRecordControls';
import NewRecord from 'src/pages/worksheet/common/newRecord/MobileNewRecord';
import { doubleConfirmFunc } from './DoubleConfirm';
import processAjax from 'src/pages/workflow/api/process';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { RecordInfoModal } from 'mobile/Record';
import customBtnWorkflow from 'mobile/components/socket/customBtnWorkflow';
import CustomButtons from './CustomButtons';
import { handleRecordError } from 'worksheet/util';
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
    if (this.props.isBatchOperate && !this.props.recordActionVisible) return;
    customBtnWorkflow();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.recordActionVisible !== this.props.recordActionVisible && this.props.isBatchOperate) {
      customBtnWorkflow();
    }
  }
  componentWillUnmount() {
    if (!window.IM) return;
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
      sheetRow,
      worksheetInfo = {},
      isBatchOperate,
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
        worksheetAjax.updateWorksheetRow({
          worksheetId,
          rowId: rowId,
          newOldControl: [],
          btnRemark: remark,
          btnId: btn.btnId,
          btnWorksheetId: worksheetId,
          btnRowId: rowId,
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
          projectId: !isBatchOperate ? sheetRow.projectId : worksheetInfo.projectId,
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
            projectId: !isBatchOperate ? sheetRow.projectId : worksheetInfo.projectId,
            checkNeedAuth: true,
            closeImageValidation: true,
            success: run,
            fail: result => {
              MobileVertifyPassword.confirm({
                showSubTitle: true,
                autoFocus: true,
                isRequired: true,
                allowNoVerify: result !== 'showPassword',
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
      Dialog.confirm({
        content: _l('最大支持批量执行1000行记录，是否只选中并执行前1000行数据？'),
        onConfirm: () => handleTrigger(),
      });
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
        pushUniqueId: _.get(window, 'md.global.Config.pushUniqueId'),
      })
      .then(data => {
        if (data) {
          this.props.loadRow();
          this.props.loadCustomBtns();
          setTimeout(() => {
            this.setState({ btnDisable: {} });
            this.props.updateBtnDisabled({});
          }, 500);
        } else {
          alert(_l('操作失败'), 2);
        }
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
          Dialog.alert({
            title: _l('无法执行按钮“%0”', btn.name),
            content: _l('关联字段被隐藏或已删除'),
            confirmText: _l('确定'),
          });
          return;
        }
        try {
          const controldata = JSON.parse(addRelationControl.value);
          if (addRelationControl.enumDefault === 1 && controldata.length) {
            Dialog.alert({
              title: _l('无法执行按钮“%0”', btn.name),
              content: _l('%0已有关联记录，无法重复添加', addRelationControl.controlName),
              confirmText: _l('确定'),
            });
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
            masterFormData: rowInfo.receiveControls,
          };
        } catch (err) {
          Dialog.alert({
            title: _l('无法执行按钮“%0”', btn.name),
            content: _l('“%0”为空，请关联操作后再执行按钮操作', relationControl.controlName),
            confirmText: _l('确定'),
          });
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
          Dialog.alert({
            title: _l('无法执行按钮“%0”', btn.name),
            content: _l('“%0”为空，请关联操作后再执行按钮操作', relationControl.controlName),
            confirmText: _l('确定'),
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
        Dialog.alert({
          title: _l('无法执行按钮“%0”', this.activeBtn.name),
          content: _l('关联字段被隐藏或已删除'),
          confirmText: _l('确定'),
        });
        return;
      }
      try {
        const relationControlrelationControlData = JSON.parse(relationControlrelationControl.value);
        if (relationControlrelationControl.enumDefault === 1 && relationControlrelationControlData.length) {
          Dialog.alert({
            title: _l('无法执行按钮“%0”', this.activeBtn.name),
            content: _l('“%0”已有关联记录，无法重复添加', relationControlrelationControl.controlName),
            confirmText: _l('确定'),
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
        this.setState({
          newRecordVisible: true,
          rowInfo: { ...data, receiveControls: data.formData },
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
    let actionDeleteHandler = ActionSheet.show({
      popupClassName: 'md-adm-actionSheet',
      actions: [],
      extra: (
        <div className="flexColumn w100">
          <div className="bold Gray Font17 pTop10">
            {this.isSubList ? _l('是否删除子表记录 ?') : _l('是否删除此条记录 ?')}
          </div>
          <div className="valignWrapper flexRow mTop24">
            <Button
              className="flex mRight6 bold Gray_75 flex ellipsis Font13"
              onClick={() => actionDeleteHandler.close()}
            >
              {_l('取消')}
            </Button>
            <Button
              className="flex mLeft6 bold ellipsis Font13"
              color="danger"
              onClick={() => {
                actionDeleteHandler.close();
                this.handleDelete();
              }}
            >
              {_l('确认')}
            </Button>
          </div>
        </div>
      ),
    });
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
  fillRecordControls = (newControls, targetOptions, customwidget, cb = () => {}) => {
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
          handleRecordError(res.resultCode);
          cb(true);
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
      <Popup
        destroyOnClose={true}
        className="mobileFillRecordControlsModal mobileModal minFull topRadius"
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
      </Popup>
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
            worksheetId: this.masterRecord.worksheetId,
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
      sheetRow = {},
      worksheetInfo = {},
      hideRecordActionVisible,
      customBtns,
      viewId,
      appId,
      switchPermit,
      isBatchOperate,
      loading,
      isFavorite,
      changeActionSheetModalIndex,
      handleCollectRecord = () => {},
    } = this.props;
    const { btnDisable } = this.state;
    const projectId = sheetRow.projectId || worksheetInfo.projectId;
    const isExternal = _.isEmpty(getCurrentProject(projectId));
    const allowDelete =
      (isOpenPermit(permitList.recordDelete, sheetRow.switchPermit, viewId) && sheetRow.allowDelete) ||
      (this.isSubList && this.editable);
    const allowShare =
      (isOpenPermit(permitList.recordShareSwitch, sheetRow.switchPermit, viewId) ||
        isOpenPermit(permitList.embeddedLink, sheetRow.switchPermit, viewId)) &&
      !md.global.Account.isPortal;

    return (
      <Popup
        forceRender
        className="actionSheetModal mobileModal topRadius"
        visible={recordActionVisible}
        onClose={hideRecordActionVisible}
        onMaskClick={hideRecordActionVisible}
        style={changeActionSheetModalIndex ? { '--z-index': 10001 } : {}}
      >
        <React.Fragment>
          <div className="flexRow header">
            <span className="Font13">{!isBatchOperate ? _l('更多操作') : _l('对选中记录执行操作')}</span>
            <div className="closeIcon TxtCenter" onClick={hideRecordActionVisible}>
              <Icon icon="close" />
            </div>
          </div>
          {loading ? (
            <div className="flexRow justifyContentCenter alignItemsCenter mBottom30">
              <LoadDiv />
            </div>
          ) : _.isEmpty(customBtns) && !(appId && !isBatchOperate) ? (
            <div className="Gray bold mBottom30 TxtLeft pLeft15">{_l('暂无按钮')}</div>
          ) : (
            <Fragment>
              <div className="flexRow customBtnLists Font13">
                <CustomButtons
                  isBatch={isBatchOperate}
                  classNames="flex customBtnItem"
                  customBtns={customBtns}
                  btnDisable={btnDisable}
                  handleClick={btn => {
                    this.handleTriggerCustomBtn(btn);
                  }}
                />
              </div>
              {appId && !isBatchOperate ? (
                <div className="extrBtnBox">
                  {allowShare && (
                    <div className="flexRow extraBtnItem">
                      <Icon icon="share" className="Font18 delIcon Gray_9e" />
                      <div className="flex delTxt Font15 Gray" onClick={this.props.onShare}>
                        {_l('分享')}
                      </div>
                    </div>
                  )}
                  {!window.shareState.shareId && !md.global.Account.isPortal && !isExternal && (
                    <div className="flexRow extraBtnItem">
                      <Icon
                        icon="star_3"
                        className={cx('Font18 delIcon', { Gray_9e: !isFavorite, activeStar: isFavorite })}
                      />
                      <div className="flex delTxt Font15 Gray" onClick={handleCollectRecord}>
                        {isFavorite ? _l('取消收藏') : _l('收藏记录')}
                      </div>
                    </div>
                  )}
                  {allowDelete && (
                    <div className="flexRow extraBtnItem">
                      <Icon icon="delete_12" className="Font18 delIcon" />
                      <div className="flex delTxt Font15" onClick={this.handleDeleteAlert}>
                        {_l('删除')}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </Fragment>
          )}
        </React.Fragment>
      </Popup>
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
