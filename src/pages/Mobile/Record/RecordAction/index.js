import React, { Fragment, Component } from 'react';
import cx from 'classnames';
import { getRequest } from 'src/util';
import worksheetAjax from 'src/api/worksheet';
import { InputItem, Modal, Progress, WingBlank } from 'antd-mobile';
import { Icon } from 'ming-ui';
import FillRecordControls from 'src/pages/worksheet/common/recordInfo/FillRecordControls/MobileFillRecordControls';
import NewRecord from 'src/pages/worksheet/common/newRecord/MobileNewRecord';
import CustomRecordCard from 'src/pages/Mobile/RecordList/RecordCard';
import process, { startProcess } from 'src/pages/workflow/api/process';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import './index.less';

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
      shareUrl: '',
      rowInfo: {},
      percent: 0,
      num: 0,
    };
    const { isSubList, editable } = getRequest();
    this.isSubList = isSubList == 'true';
    this.editable = editable == 'true';
  }
  componentDidMount() {
    IM.socket.on('workflow', this.receiveWorkflow);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.recordActionVisible && !this.props.recordActionVisible && !this.state.shareUrl) {
      const { appId } = this.props;
      if (navigator.share && appId) {
        this.getWorksheetShareUrl();
      }
    }
  }
  recef = React.createRef();
  componentWillUnmount() {
    IM.socket.off('workflow', this.receiveWorkflow);
  }
  getWorksheetShareUrl() {
    const { appId, worksheetId, rowId, viewId } = this.props;
    worksheetAjax
      .getWorksheetShareUrl({
        appId,
        worksheetId,
        rowId,
        viewId,
        objectType: 2,
      })
      .then(shareUrl => {
        this.setState({
          shareUrl,
        });
      });
  }
  receiveWorkflow = data => {
    const { status, storeId, total, finished, title } = data;
    const { isMobileOperate } = this.props;
    if (!isMobileOperate && !storeId && status === 2) {
      this.props.loadRow();
      this.setState({ btnDisable: {} });
    }
    if (storeId) {
      let percent = total === 0 ? 100 : (finished / total) * 100;
      this.setState({ percent, total: total === 0 ? 1 : total, num: total === 0 ? 1 : finished });
      if (total === finished) {
        this.props.showRunInfo(false);
        process.getStore({ storeId }).then(res => {
          const filtered = _.filter(res, item => !!item.checked);
          const success = _.filter(filtered, item => [1, 2].includes(item.status));
          const failure = _.filter(filtered, item => !item.status);
          this.setState({ failure });
          if (!_.isEmpty(failure)) {
            Modal.alert(
              _l('%0执行完毕', title),
              <div>{(_l(`%0条成功`, success.length), _l(`%0条失败`, failure.length))}</div>,
              [
                {
                  text: _l('查看详情'),
                  onPress: () => {
                    this.setState({ showFailureInfoModal: true });
                  },
                },
                { text: _l('忽略') },
              ],
            );
          }
        });
      }
    } else {
      this.setState({ total: 1, percent: 100 });
      this.props.showRunInfo && this.props.showRunInfo(false);
    }
  };
  renderRunInfo = () => {
    const { batchOptCheckedData, runInfoVisible } = this.props;
    let { custBtnName = '', total } = this.state;
    let totalNum = total || batchOptCheckedData.length;
    return (
      <Modal animationType="slide-up" visible={runInfoVisible} className="runInfoModal">
        <div className="optRunInfo">
          <p className="infoHeader">{_l(`%0正在执行...`, custBtnName)}</p>
          <p className="num">
            {this.state.num}/{totalNum}
          </p>
          <Progress position="normal" percent={this.state.percent} />
        </div>
      </Modal>
    );
  };
  handleTriggerCustomBtn = btn => {
    const { handleBatchOperateCustomBtn } = this.props;
    this.setState({ custBtnName: btn.name });
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.IMMEDIATELY) {
      if (handleBatchOperateCustomBtn) {
        handleBatchOperateCustomBtn(btn);
        return;
      }
      // 立即执行
      this.triggerImmediately(btn.btnId);
    } else if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.CONFIRM) {
      if (handleBatchOperateCustomBtn) {
        handleBatchOperateCustomBtn(btn);
        return;
      }
      // 二次确认
      Modal.alert(_l('你确认对记录执行此操作吗？'), '', [
        { text: _l('取消'), onPress: () => {}, style: 'default' },
        { text: _l('确定'), onPress: () => this.triggerImmediately(btn.btnId) },
      ]);
    } else if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.FILL_RECORD) {
      // 填写字段
      this.fillRecord(btn);
    } else {
      // 无 clickType 有误
    }
    this.props.hideRecordActionVisible();
  };
  triggerImmediately = btnId => {
    const { worksheetId, rowId } = this.props;
    startProcess({
      appId: worksheetId,
      sources: [rowId],
      triggerId: btnId,
    }).then(data => {
      alert(_l('操作已执行'), 3);
      this.props.loadCustomBtns();
      this.disableCustomButton(btnId);
    });
  };
  disableCustomButton = id => {
    this.setState({
      btnDisable: { ...this.state.btnDisable, [id]: true },
    });
  };
  async fillRecord(btn) {
    const { worksheetId, rowId } = this.props;
    let rowInfo;
    if (rowId) {
      rowInfo = await worksheetAjax.getRowByID({
        worksheetId,
        getType: 1,
        rowId,
      });
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
    switch (caseStr) {
      case '11': // 本记录 - 填写字段
        this.btnRelateWorksheetId = worksheetId;
        this.fillRecordId = rowId;
        this.fillRecordProps = {
          formData: rowInfo.receiveControls,
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
              _l('“%0”已有关联记录，无法重复添加', addRelationControl.controlName),
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
          });
        }
      });
  }
  handleOpenDiscuss = () => {
    const { appId, worksheetId, viewId, rowId } = this.props;
    window.mobileNavigateTo(`/mobile/discuss/${appId}/${worksheetId}/${viewId}/${rowId}`);
  };
  handleOpenShare = () => {
    const { shareUrl } = this.state;
    navigator
      .share({
        title: _l('系统'),
        text: document.title,
        url: shareUrl,
      })
      .then(() => {
        alert(_l('分享成功'));
      });
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
    };
    if (_.isFunction(handleUpdateWorksheetRow)) {
      handleUpdateWorksheetRow(args);
      this.setState({ fillRecordVisible: false });
      return;
    }
    worksheetAjax.updateWorksheetRow(args).then(res => {
      if (res && res.data) {
        alert(_l('操作已执行'));
        if (this.activeBtn.workflowType === 2) {
          this.props.loadRow();
          this.props.loadCustomBtns();
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
    const { isMobileOperate } = this.props;
    if (this.activeBtn.workflowType === 2) {
      alert(_l('操作已执行'), 3);
    }
    !isMobileOperate && this.props.loadRow();
    this.props.loadCustomBtns();
  };
  renderFillRecord() {
    const { activeBtn = {}, fillRecordId, btnRelateWorksheetId, fillRecordProps } = this;
    const { sheetRow, viewId, worksheetInfo = {}, isMobileOperate } = this.props;
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
          projectId={!isMobileOperate ? sheetRow.projectId : worksheetInfo.projectId}
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
        />
      </Modal>
    );
  }
  renderNewRecord() {
    const { activeBtn = {} } = this;
    const { newRecordVisible, rowInfo } = this.state;
    const { worksheetId, rowId } = this.props;
    return (
      newRecordVisible && (
        <NewRecord
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
          onAdd={this.handleAddRecordCallback}
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
      isMobileOperate,
    } = this.props;
    const { btnDisable, shareUrl } = this.state;
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
            <span className="Font13">{!isMobileOperate ? sheetRow.titleName : _l('对选中记录执行操作')}</span>
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
          {appId && !isMobileOperate ? (
            <div className="extrBtnBox">
              {shareUrl && isOpenPermit(permitList.recordDiscussSwitch, switchPermit, viewId) && (
                <div className="flexRow extraBtnItem">
                  <Icon icon="share" className="Font18 delIcon" style={{ color: '#757575' }} />
                  <div className="flex delTxt Font13 Gray" onClick={this.handleOpenShare}>
                    {_l('分享')}
                  </div>
                </div>
              )}
              {(sheetRow.allowDelete || (this.isSubList && this.editable)) && (
                <div className="flexRow extraBtnItem">
                  <Icon icon="delete_12" className="Font18 delIcon" />
                  <div className="flex delTxt Font13" onClick={this.handleDeleteAlert}>
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
  renderFailureRecord = () => {
    let { showFailureInfoModal, failure = [] } = this.state;
    const { currentSheetRows = [], view, worksheetInfo, worksheetControls } = this.props;
    let failureList = [];
    currentSheetRows.forEach(item => {
      failure.forEach(it => {
        if (it.sourceId === item.rowid) {
          failureList.push(item);
        }
      });
    });
    return (
      <Modal
        className="failureInfoModal"
        popup
        visible={showFailureInfoModal}
        animationType="slide-up"
        onClose={() => {
          this.setState({ showFailureInfoModal: false });
        }}
        title={
          <div className="header flexRow">
            <div className="flex">{_l(`执行失败(${failure.length})`)}</div>
            <Icon
              icon="close"
              className="Font8 closeIcon"
              onClick={() => {
                this.setState({ showFailureInfoModal: false });
              }}
            />
          </div>
        }
      >
        {failureList.map(item => {
            return (
              <WingBlank size="md" key={item.rowid}>
                <CustomRecordCard
                  isFailureData={true}
                  key={item.rowid}
                  data={item}
                  view={view}
                  controls={worksheetControls}
                  allowAdd={worksheetInfo.allowAdd}
                />
              </WingBlank>
            );
          })}
      </Modal>
    );
  };
  render() {
    return (
      <div ref={this.recef}>
        {this.renderRecordAction()}
        {this.renderFillRecord()}
        {this.renderNewRecord()}
        {this.props.isMobileOperate && this.renderRunInfo()}
        {this.props.isMobileOperate && this.renderFailureRecord()}
      </div>
    );
  }
}

export default RecordAction;
