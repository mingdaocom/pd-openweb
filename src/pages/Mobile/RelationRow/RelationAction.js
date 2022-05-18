import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { Icon } from 'ming-ui';
import { Flex, ActivityIndicator, WhiteSpace, ListView, WingBlank, Button, Modal } from 'antd-mobile';
import RelateScanQRCode from 'src/components/newCustomFields/components/RelateScanQRCode';
import DocumentTitle from 'react-document-title';
import NewRecord from 'src/pages/worksheet/common/newRecord/MobileNewRecord';
import MobileRecordCardListDialog from 'src/components/recordCardListDialog/mobile';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import * as actions from './redux/actions';
import sheetAjax from 'src/api/worksheet';
import styled from 'styled-components';

const BtnsWrapper = styled(Flex)`
  height: 50px;
  border-top: 1px solid #f5f5f5;
  background-color: #fff;
  a {
    text-decoration: none;
  }
  .am-button {
    height: 36px;
    line-height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    &, &::before, &-active::before {
      font-size: 14px;
      border-radius: 50px !important;
    }
  }
`;

@withRouter
class RelationAction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRelevanceRecord: false,
      showCreateRecord: false,
      recordkeyWords: '',
      title: ''
    };
  }
  handleSetEdit = (value) => {
    this.props.updateActionParams({
      isEdit: value,
      selectedRecordIds: []
    });
  }
  removeRelationRows = () => {
    const { base, relationRow, match, actionParams, updateRelationRows, permissionInfo } = this.props;
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
        .fail(err => {
          alert(_l('取消关联失败！'), 2);
        });
    }
  }
  addRelationRows(newRelationRows) {
    const { base, relationRows } = this.props;
    const ids = relationRows.map(item => item.rowid);
    const list = newRelationRows.filter(item => !ids.includes(item.rowid));

    if (_.isEmpty(list)) {
      alert(_l('无法关联已经关联过的记录'), 2);
      return;
    }

    sheetAjax
      .updateRowRelationRows({
        worksheetId: base.worksheetId,
        appId: base.appId,
        viewId: base.viewId,
        rowId: base.rowId,
        controlId: base.controlId,
        isAdd: true,
        rowIds: list.map(r => r.rowid),
      })
      .then(data => {
        if (data.isSuccess) {
          alert(_l('添加记录成功！'));
          this.pushRelationRows(list);
        } else {
          alert(_l('添加记录失败！'), 2);
        }
      })
      .fail(err => {
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
      title: visible ? _l('选择%0', entityName) : _l('%0详情', entityName)
    });
  }
  renderDialog() {
    const { showCreateRecord, recordkeyWords, showRelevanceRecord } = this.state;
    const { base, rowInfo, relationRow, actionParams, permissionInfo } = this.props;
    const { showControls, coverCid } = actionParams;
    const { worksheet } = relationRow;
    const { rowId, controlId, worksheetId } = base;
    const { isCreate, isSubList, activeRelateSheetControl } = permissionInfo;

    let defaultRelatedSheetValue;
    try {
      const formData = rowInfo.receiveControls.filter(_.identity);
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

    return (
      <Fragment>
        {showRelevanceRecord && (
          <MobileRecordCardListDialog
            multiple
            control={_.find(rowInfo.receiveControls, { controlId: controlId })}
            formData={rowInfo.receiveControls}
            visible={showRelevanceRecord}
            allowNewRecord={isCreate}
            coverCid={coverCid}
            keyWords={recordkeyWords}
            showControls={showControls}
            appId={worksheet.appId}
            parentWorksheetId={worksheetId}
            filterRelatesheetControlIds={[controlId]}
            controlId={controlId}
            recordId={rowId}
            filterRowIds={[rowId]}
            allowAdd={false}
            entityName={worksheet.entityName}
            relateSheetBeLongProject={worksheet.projectId}
            relateSheetId={worksheet.worksheetId}
            onClose={() => {
              this.setState({ recordkeyWords: '' });
              this.handleSetShowRelevanceRecord(false);
            }}
            onOk={records => {
              this.addRelationRows(records);
            }}
          />
        )}
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
      </Fragment>
    );
  }
  renderRelateScanQRCodeBtn() {
    const { base, rowInfo, relationRow } = this.props;
    const { worksheet } = relationRow;
    const control = _.find(rowInfo.receiveControls, { controlId: base.controlId });
    const formData = rowInfo.receiveControls;
    const filterControls = getFilter({ control, formData });

    return (
      <RelateScanQRCode
        projectId={worksheet.projectId}
        worksheetId={worksheet.worksheetId}
        filterControls={filterControls}
        onChange={data => {
          this.addRelationRows([data]);
        }}
        onOpenRecordCardListDialog={keyWords => {
          this.setState({ showRelevanceRecord: true, recordkeyWords: keyWords });
        }}
      >
        <Button type="primary">
          <Fragment>
            <Icon icon="add" className="Font20" />
            {_l('扫码关联%0', worksheet.entityName || _l('记录'))}
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
        <WingBlank size="sm" className="flex">
          <Button
            className="edit Gray_75 bold"
            onClick={() => {
              this.handleSetEdit(false);
            }}
          >
            {_l('取消')}
          </Button>
        </WingBlank>
        {(isRelevance || !!selectedRecordIds.length) && (
          <WingBlank size="sm" className="flex">
            <Button
              className="bold"
              type="primary"
              disabled={!selectedRecordIds.length}
              onClick={() => {
                Modal.alert(isSubList ? _l('确认删除吗？') : _l('确认取消选中的关联关系吗？'), '', [
                  { text: _l('取消'), onPress: () => {} },
                  {
                    text: _l('确认'),
                    onPress: () => {
                      this.removeRelationRows();
                    },
                  },
                ]);
              }}
            >
              {selectedRecordIds.length
                ? isSubList
                  ? _l('确认删除(%0)', selectedRecordIds.length)
                  : _l('取消关联(%0)', selectedRecordIds.length)
                : _l('取消关联')}
            </Button>
          </WingBlank>
        )}
      </Fragment>
    );
  }
  renderContent() {
    const { relationRows, permissionInfo } = this.props;
    const { isCreate, isRelevance, hasEdit, onlyRelateByScanCode } = permissionInfo;
    return (
      <Fragment>
        {hasEdit && (
          <WingBlank size="sm" className="flex">
            <Button
              disabled={!relationRows.length}
              className="edit Gray_75 bold"
              onClick={() => {
                this.handleSetEdit(true);
              }}
            >
              {_l('批量操作')}
            </Button>
          </WingBlank>
        )}
        {onlyRelateByScanCode ? (
          <WingBlank size="sm" className="flex">{this.renderRelateScanQRCodeBtn()}</WingBlank>
        ) : (
          (isRelevance || isCreate) && (
            <WingBlank size="sm" className="flex">
              <Button
                type="primary"
                className="bold"
                onClick={() => {
                  if (isRelevance) {
                    this.handleSetShowRelevanceRecord(true);
                    return
                  }
                  if (isCreate) {
                    this.setState({ showCreateRecord: true });
                    return
                  }
                }}
              >
                <Fragment>
                  <Icon icon="add" className="Font20" />
                  {isRelevance ? _l('添加关联') : _l('新建关联')}
                </Fragment>
              </Button>
            </WingBlank>
          )
        )}
      </Fragment>
    );
  }
  render() {
    const { title } = this.state;
    const { actionParams, permissionInfo } = this.props;
    const { isEdit } = actionParams;
    const { isRelevance, hasEdit } = permissionInfo;

    if (!isRelevance && !hasEdit) {
      return null;
    }

    return (
      <BtnsWrapper justify="center" align="center">
        {title && <DocumentTitle title={title} />}
        {isEdit ? (
          this.renderEdit()
        ) : (
          this.renderContent()
        )}
        {this.renderDialog()}
      </BtnsWrapper>
    );
  }
}

export default connect(
  state => ({
    ..._.pick(state.mobile, ['base', 'rowInfo', 'relationRow', 'relationRows', 'actionParams', 'permissionInfo'])
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, ['updateActionParams', 'updatePageIndex', 'updateRelationRows']),
      dispatch,
  ),
)(RelationAction);

