import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { Icon } from 'ming-ui';
import { Dialog, Button } from 'antd-mobile';
import RelateScanQRCode from 'src/components/newCustomFields/components/RelateScanQRCode';
import DocumentTitle from 'react-document-title';
import NewRecord from 'src/pages/worksheet/common/newRecord/MobileNewRecord';
import MobileRecordCardListDialog from 'src/components/recordCardListDialog/mobile';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import * as actions from './redux/actions';
import RegExpValidator from 'src/util/expression';
import sheetAjax from 'src/api/worksheet';
import _ from 'lodash';

class RelationAction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRelevanceRecord: false,
      showCreateRecord: false,
      recordkeyWords: '',
      title: '',
    };
  }
  handleSetEdit = value => {
    this.props.updateActionParams({
      isEdit: value,
      selectedRecordIds: [],
    });
  };
  removeRelationRows = () => {
    const { base, relationRow, actionParams, updateRelationRows, permissionInfo, getDataType } = this.props;
    const { worksheet } = relationRow;
    const { selectedRecordIds } = actionParams;
    const { isSubList } = permissionInfo;
    if (isSubList) {
      sheetAjax
        .deleteWorksheetRows({
          worksheetId: worksheet.worksheetId,
          rowIds: selectedRecordIds,
        })
        .then(data => {
          if (data.isSuccess) {
            const { relationRows } = this.props;
            const newRelationRows = relationRows.filter(n => !selectedRecordIds.includes(n.rowid));
            updateRelationRows(newRelationRows, -selectedRecordIds.length);
            this.handleSetEdit(false);
            alert(_l('删除成功！'));
          } else {
            alert(_l('删除失败！'), 2);
          }
        });
    } else {
      sheetAjax
        .updateRowRelationRows({
          worksheetId: base.worksheetId,
          appId: base.appId,
          viewId: base.viewId,
          rowId: base.rowId,
          controlId: base.controlId,
          isAdd: false,
          rowIds: selectedRecordIds,
          updateType: getDataType,
        })
        .then(data => {
          if (data.isSuccess) {
            const { relationRows } = this.props;
            const newRelationRows = relationRows.filter(n => !selectedRecordIds.includes(n.rowid));
            updateRelationRows(newRelationRows, -selectedRecordIds.length);
            this.handleSetEdit(false);
            alert(_l('取消关联成功！'));
          } else {
            alert(_l('取消关联失败！'), 2);
          }
        })
        .catch(err => {
          alert(_l('取消关联失败！'), 2);
        });
    }
  };
  addRelationRows(newRelationRows) {
    const { base, relationRows, getDataType, rowInfo } = this.props;
    const ids = relationRows.map(item => item.rowid);
    const list = newRelationRows.filter(item => !ids.includes(item.rowid));

    if (_.isEmpty(list)) {
      alert(_l('无法关联已经关联过的记录'), 2);
      return;
    }

    // 关联查询  begin-->
    const { type } = _.find(rowInfo.templateControls, { controlId: base.controlId }) || {};
    if (type === 51) {
      this.pushRelationRows(list);
      return;
    }
    // --> end

    sheetAjax
      .updateRowRelationRows({
        worksheetId: base.worksheetId,
        appId: base.appId,
        viewId: base.viewId,
        rowId: base.rowId,
        controlId: base.controlId,
        isAdd: true,
        rowIds: list.map(r => r.rowid),
        updateType: getDataType,
      })
      .then(data => {
        if (data.isSuccess) {
          alert(_l('添加记录成功！'));
          this.pushRelationRows(list);
        } else {
          alert(_l('添加记录失败！'), 2);
        }
      })
      .catch(err => {
        alert(_l('添加记录失败！'), 2);
      });
  }
  pushRelationRows(items) {
    const { relationRows, updateRelationRows } = this.props;
    const newRelationRows = items.concat(relationRows);
    updateRelationRows(newRelationRows, items.length);
  }
  handleSetShowRelevanceRecord = visible => {
    const { relationRow } = this.props;
    const entityName = relationRow.worksheet.entityName || _l('记录');
    this.setState({
      showRelevanceRecord: visible,
      title: visible ? _l('选择%0', entityName) : _l('%0详情', entityName),
    });
  };
  renderDialog() {
    const { showCreateRecord, recordkeyWords, showRelevanceRecord } = this.state;
    const { base, rowInfo, relationRow, actionParams, permissionInfo } = this.props;
    const { showControls, coverCid } = actionParams;
    const { worksheet } = relationRow;
    const { rowId, controlId, worksheetId } = base;
    const { isCreate, isSubList, activeRelateSheetControl, onlyRelateByScanCode } = permissionInfo;
    const disabledManualWrite =
      onlyRelateByScanCode && _.get(activeRelateSheetControl, 'advancedSetting.dismanual') === '1';
    const formData = this.props.formData || rowInfo.templateControls.filter(_.identity);

    let defaultRelatedSheetValue;
    try {
      const titleControl = formData.filter(c => c && c.attribute === 1);
      defaultRelatedSheetValue = titleControl && {
        name: titleControl.value,
        sid: rowId,
        type: 8,
        sourcevalue: JSON.stringify({
          ..._.assign(...formData.map(c => ({ [c.controlId]: c.value }))),
          [titleControl.controlId]: titleControl.value,
          rowid: rowId,
        }),
      };
    } catch (err) {}

    const currentControl = _.find(formData, v => v.controlId === controlId) || {};

    return (
      <Fragment>
        {showRelevanceRecord && (
          <MobileRecordCardListDialog
            multiple
            control={_.find(rowInfo.templateControls, { controlId: controlId })}
            formData={formData}
            visible={showRelevanceRecord}
            allowNewRecord={isCreate && !_.get(window, 'shareState.isPublicForm')}
            disabledManualWrite={disabledManualWrite}
            coverCid={coverCid}
            keyWords={recordkeyWords}
            showControls={showControls}
            appId={worksheet.appId}
            viewId={_.get(currentControl, 'advancedSetting.openview')}
            parentWorksheetId={worksheetId}
            filterRelatesheetControlIds={[controlId]}
            controlId={controlId}
            recordId={rowId}
            filterRowIds={[rowId]}
            allowAdd={false}
            entityName={worksheet.entityName}
            relateSheetBeLongProject={worksheet.projectId}
            relateSheetId={worksheet.worksheetId}
            getDataType={this.props.getDataType}
            relationRowIds={(this.props.relationRows || []).map(it => it.rowid)}
            onClose={() => {
              this.setState({ recordkeyWords: '' });
              this.handleSetShowRelevanceRecord(false);
            }}
            onOk={records => {
              this.addRelationRows(records);
            }}
          />
        )}
        {showCreateRecord && (
          <NewRecord
            hideFillNext
            className="worksheetRelateNewRecord"
            title={isSubList && _l('创建%0', activeRelateSheetControl.controlName)}
            appId={worksheet.appId}
            worksheetId={worksheet.worksheetId}
            projectId={worksheet.projectId}
            addType={2}
            entityName={worksheet.entityName}
            filterRelateSheetIds={[worksheet.worksheetId]}
            filterRelatesheetControlIds={[controlId]}
            defaultRelatedSheet={{
              worksheetId,
              relateSheetControlId: activeRelateSheetControl.controlId,
              value: defaultRelatedSheetValue,
            }}
            visible={showCreateRecord}
            hideNewRecord={() => {
              this.setState({ showCreateRecord: false });
            }}
            onAdd={row => {
              this.addRelationRows([row]);
            }}
          />
        )}
      </Fragment>
    );
  }
  renderRelateScanQRCodeBtn() {
    const { base, rowInfo, relationRow } = this.props;
    const { worksheet } = relationRow;
    const formData = this.props.formData || rowInfo.templateControls;
    const control = _.find(formData, { controlId: base.controlId });
    const filterControls = getFilter({ control, formData });

    return (
      <RelateScanQRCode
        projectId={worksheet.projectId}
        worksheetId={worksheet.worksheetId}
        filterControls={filterControls}
        control={control}
        onChange={data => {
          this.addRelationRows([data]);
        }}
        onOpenRecordCardListDialog={keyWords => {
          const { scanlink, scancontrol } = _.get(control, 'advancedSetting') || {};
          if (
            (scanlink !== '1' && RegExpValidator.isURL(keyWords)) ||
            (scancontrol !== '1' && !RegExpValidator.isURL(keyWords))
          ) {
            return;
          }
          this.setState({ showRelevanceRecord: true, recordkeyWords: keyWords });
        }}
      >
        <Button className="flex mLeft6 mRight6 Font13" color="primary">
          <Fragment>
            <Icon icon="qr_code_19" className="Font20 TxtBottom" />
            {_l('扫码关联')}
          </Fragment>
        </Button>
      </RelateScanQRCode>
    );
  }
  renderEdit() {
    const { actionParams, permissionInfo } = this.props;
    const { isEdit, selectedRecordIds } = actionParams;
    const { isRelevance, isSubList } = permissionInfo;
    return (
      <Fragment>
        <Button
          className="flex mLeft6 mRight6 edit Gray_75 bold Font13"
          onClick={() => {
            this.handleSetEdit(false);
          }}
        >
          {_l('取消')}
        </Button>
        {(isRelevance || !!selectedRecordIds.length) && (
          <Button
            className="flex mLeft6 mRight6 bold Font13"
            color="primary"
            disabled={!selectedRecordIds.length}
            onClick={() => {
              Dialog.confirm({
                content: isSubList ? _l('确认删除吗？') : _l('确认取消选中的关联关系吗？'),
                onConfirm: this.removeRelationRows
              });
            }}
          >
            {selectedRecordIds.length
              ? isSubList
                ? _l('确认删除(%0)', selectedRecordIds.length)
                : _l('取消关联(%0)', selectedRecordIds.length)
              : _l('取消关联')}
          </Button>
        )}
      </Fragment>
    );
  }
  renderContent() {
    const { relationRows, permissionInfo, relationRow, rowInfo = {}, controlId, base, rulesLocked } = this.props;
    const { isCreate, isRelevance, allowRemoveRelation, onlyRelateByScanCode, activeRelateSheetControl, hasEdit } =
      permissionInfo;
    const disabledManualWrite =
      onlyRelateByScanCode && _.get(activeRelateSheetControl, 'advancedSetting.dismanual') === '1';
    const entityName = relationRow.worksheet.entityName || _l('关联');

    const control = _.find(rowInfo.templateControls || [], { controlId: controlId }) || {};
    const controlPermission = controlState(control, base.rowId ? 3 : 2);
    const allowNewRecord =
      control.type === 51
        ? base.rowId &&
          controlPermission.editable &&
          control.enumDefault2 !== 1 &&
          control.enumDefault2 !== 11 &&
          !window.isPublicWorksheet
        : isRelevance || isCreate;
    return (
      <Fragment>
        {control.type !== 51 && allowRemoveRelation && hasEdit && !rulesLocked && (
          <Button
            disabled={!relationRows.length}
            className="flex mLeft6 mRight6 edit Gray_75 bold Font13"
            onClick={() => {
              this.handleSetEdit(true);
            }}
          >
            {_l('批量操作')}
          </Button>
        )}
        {allowNewRecord && !rulesLocked && (
          <Fragment>
            {onlyRelateByScanCode && (
              this.renderRelateScanQRCodeBtn()
            )}
            {!disabledManualWrite && (
              <Button
                color="primary"
                className="flex mLeft6 mRight6 bold Font13"
                onClick={() => {
                  if (control.type === 51) {
                    this.setState({ showCreateRecord: true });
                    return;
                  }
                  if (isRelevance) {
                    this.handleSetShowRelevanceRecord(true);
                    return;
                  }
                  if (isCreate) {
                    this.setState({ showCreateRecord: true });
                    return;
                  }
                }}
              >
                <Icon icon="add" className="Font20 TxtBottom" />
                {isRelevance ? _l('添加') : _l('新建')}
                {entityName}
              </Button>
            )}
          </Fragment>
        )}
      </Fragment>
    );
  }
  render() {
    const { title } = this.state;
    const { actionParams, permissionInfo, rowInfo = {}, controlId, base = {} } = this.props;
    const { isEdit } = actionParams;
    const { isRelevance, hasEdit, allowRemoveRelation } = permissionInfo;

    const control = _.find(rowInfo.templateControls || [], { controlId: controlId }) || {};
    const controlPermission = controlState(control, base.rowId ? 3 : 2);
    const allowNewRecord =
      base.rowId &&
      controlPermission.editable &&
      control.enumDefault2 !== 1 &&
      control.enumDefault2 !== 11 &&
      !window.isPublicWorksheet;

    if (!hasEdit) return null;
    if (control.type === 51 && !allowNewRecord) return null;

    if (!isRelevance && !hasEdit && !allowRemoveRelation) {
      return null;
    }

    return (
      <div className="flexRow alignItemsCenter justifyContentCenter WhiteBG pAll10">
        {title && <DocumentTitle title={title} />}
        {isEdit ? this.renderEdit() : this.renderContent()}
        {this.renderDialog()}
      </div>
    );
  }
}

export default connect(
  state => ({
    ..._.pick(state.mobile, ['base', 'rowInfo', 'relationRow', 'relationRows', 'actionParams', 'permissionInfo']),
  }),
  dispatch =>
    bindActionCreators(_.pick(actions, ['updateActionParams', 'updatePageIndex', 'updateRelationRows']), dispatch),
)(RelationAction);
