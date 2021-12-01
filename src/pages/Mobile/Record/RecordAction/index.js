import React, { Fragment, Component } from 'react';
import cx from 'classnames';
import { getRequest } from 'src/util';
import worksheetAjax from 'src/api/worksheet';
import { Modal } from 'antd-mobile';
import { Icon } from 'ming-ui';
import FillRecordControls from 'src/pages/worksheet/common/recordInfo/FillRecordControls/MobileFillRecordControls';
import NewRecord from 'src/pages/worksheet/common/newRecord/MobileNewRecord';
import { startProcess } from 'src/pages/workflow/api/process';
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
    }
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
    worksheetAjax.getWorksheetShareUrl({
      appId,
      worksheetId,
      rowId,
      viewId,
      objectType: 2,
    }).then(shareUrl => {
      this.setState({
        shareUrl,
      });
    });
  }
  receiveWorkflow = (data) => {
    const { storeId, status } = data;
    if (!storeId && status === 2) {
      this.props.loadRow();
      this.setState({ btnDisable: {} });
    }
  }
  handleTriggerCustomBtn = btn => {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.IMMEDIATELY) {
      // 立即执行
      this.triggerImmediately(btn.btnId);
    } else if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.CONFIRM) {
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
  }
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
  }
  disableCustomButton = id => {
    this.setState({
      btnDisable: { ...this.state.btnDisable, [id]: true },
    });
  }
  async fillRecord(btn) {
    const { worksheetId, rowId } = this.props;
    const rowInfo = await worksheetAjax.getRowByID({
      worksheetId,
      getType: 1,
      rowId,
    });
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
    worksheetAjax.getRowByID({
      worksheetId: relationControl.dataSource,
      getType: 1,
      appId: relationControl.appId,
      rowId: controldata[0].sid,
      viewId: relationControl.viewId,
    }).then(data => {
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
  }
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
  }
  handleDeleteAlert = () => {
    const { hideRecordActionVisible } = this.props;
    Modal.alert(this.isSubList ? _l('是否删除子表记录 ?') : _l('是否删除此条记录 ?'), '', [
      { text: _l('取消'), style: 'default', onPress: () => {} },
      { text: _l('确定'), style: { color: 'red' }, onPress: this.handleDelete },
    ]);
    hideRecordActionVisible();
  }
  handleDelete = () => {
    const { appId, worksheetId, viewId, rowId } = this.props;
    worksheetAjax.deleteWorksheetRows({
      worksheetId,
      viewId,
      appId,
      rowIds: [rowId],
    }).then(({ isSuccess }) => {
      if (isSuccess) {
        alert(_l('删除成功'));
        history.back();
      } else {
        alert(_l('删除失败'));
      }
    });
  }
  fillRecordControls = (newControls, targetOptions) => {
    const { worksheetId, rowId } = this.props;
    worksheetAjax
      .updateWorksheetRow({
        appId: targetOptions.appId,
        viewId: targetOptions.viewId,
        worksheetId: targetOptions.worksheetId,
        rowId: targetOptions.recordId,
        projectID: targetOptions.projectId,
        newOldControl: newControls,
        btnId: this.activeBtn.btnId,
        btnWorksheetId: worksheetId,
        btnRowId: rowId,
      })
      .then(res => {
        if (res && res.data) {
          alert(_l('操作已执行'), 3);
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
  }
  handleAddRecordCallback = () => {
    if (this.activeBtn.workflowType === 2) {
      alert(_l('操作已执行'), 3);
    }
    this.props.loadRow();
    this.props.loadCustomBtns();
  }
  renderFillRecord() {
    const { activeBtn = {}, fillRecordId, btnRelateWorksheetId, fillRecordProps } = this;
    const { sheetRow, viewId } = this.props;
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
          projectId={sheetRow.projectId}
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
      switchPermit
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
            <span className="Font1">{sheetRow.titleName}</span>
            <div className="closeIcon" onClick={hideRecordActionVisible}>
              <Icon icon="close" />
            </div>
          </div>
          <div className="flexRow customBtnLists Font13">
            {customBtns.map(item => (<div
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
              <Icon icon={item.icon || 'custom_actions'} className={cx('mRight7 Font15', { opcIcon: !item.icon && !item.disabled })}/>
              <span >{item.name}</span>
            </div>))}
          </div>
          {appId ? (<div className="extrBtnBox">
              { shareUrl && isOpenPermit(permitList.recordDiscussSwitch, switchPermit, viewId) && (<div className="flexRow extraBtnItem">
                <Icon icon="share" className="Font18 delIcon" style={{color: '#757575'}} />
                <div className="flex delTxt Font13 Gray" onClick={this.handleOpenShare}>{_l("分享")}</div>
              </div>)}
              {(sheetRow.allowDelete || (this.isSubList && this.editable)) && (<div className="flexRow extraBtnItem">
                <Icon icon="delete_12" className="Font18 delIcon" />
                <div className="flex delTxt Font13" onClick={this.handleDeleteAlert}>{_l("删除")}</div>
              </div>)}
          </div>) : null}
        </React.Fragment>
      </Modal>
    );
  }
  render() {
    return (
      <div ref={this.recef}>
        {this.renderRecordAction()}
        {this.renderFillRecord()}
        {this.renderNewRecord()}
      </div>
    )
  }
}

export default RecordAction;
