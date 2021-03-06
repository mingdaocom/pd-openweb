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
      color: #fff;
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
            alert(_l('???????????????'));
          } else {
            alert(_l('???????????????'), 2);
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
            alert(_l('?????????????????????'));
          } else {
            alert(_l('?????????????????????'), 2);
          }
        })
        .fail(err => {
          alert(_l('?????????????????????'), 2);
        });
    }
  }
  addRelationRows(newRelationRows) {
    const { base, relationRows } = this.props;
    const ids = relationRows.map(item => item.rowid);
    const list = newRelationRows.filter(item => !ids.includes(item.rowid));

    if (_.isEmpty(list)) {
      alert(_l('????????????????????????????????????'), 2);
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
          alert(_l('?????????????????????'));
          this.pushRelationRows(list);
        } else {
          alert(_l('?????????????????????'), 2);
        }
      })
      .fail(err => {
        alert(_l('?????????????????????'), 2);
      });
  }
  pushRelationRows(items) {
    const { relationRows, updateRelationRows } = this.props;
    const newRelationRows = items.concat(relationRows);
    updateRelationRows(newRelationRows, items.length);
  }
  handleSetShowRelevanceRecord = visible => {
    const { relationRow } = this.props;
    const entityName = relationRow.worksheet.entityName || _l('??????');
    this.setState({
      showRelevanceRecord: visible,
      title: visible ? _l('??????%0', entityName) : _l('%0??????', entityName)
    });
  }
  renderDialog() {
    const { showCreateRecord, recordkeyWords, showRelevanceRecord } = this.state;
    const { base, rowInfo, relationRow, actionParams, permissionInfo } = this.props;
    const { showControls, coverCid } = actionParams;
    const { worksheet } = relationRow;
    const { rowId, controlId, worksheetId } = base;
    const { isCreate, isSubList, activeRelateSheetControl, onlyRelateByScanCode } = permissionInfo;
    const disabledManualWrite = onlyRelateByScanCode && _.get(activeRelateSheetControl, 'advancedSetting.dismanual') === '1';

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
            disabledManualWrite={disabledManualWrite}
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
          title={isSubList && _l('??????%0', activeRelateSheetControl.controlName)}
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
            <Icon icon="qr_code_19" className="Font20" />
            {_l('????????????')}
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
            {_l('??????')}
          </Button>
        </WingBlank>
        {(isRelevance || !!selectedRecordIds.length) && (
          <WingBlank size="sm" className="flex">
            <Button
              className="bold"
              type="primary"
              disabled={!selectedRecordIds.length}
              onClick={() => {
                Modal.alert(isSubList ? _l('??????????????????') : _l('???????????????????????????????????????'), '', [
                  { text: _l('??????'), onPress: () => {} },
                  {
                    text: _l('??????'),
                    onPress: () => {
                      this.removeRelationRows();
                    },
                  },
                ]);
              }}
            >
              {selectedRecordIds.length
                ? isSubList
                  ? _l('????????????(%0)', selectedRecordIds.length)
                  : _l('????????????(%0)', selectedRecordIds.length)
                : _l('????????????')}
            </Button>
          </WingBlank>
        )}
      </Fragment>
    );
  }
  renderContent() {
    const { relationRows, permissionInfo } = this.props;
    const { isCreate, isRelevance, hasEdit, onlyRelateByScanCode, activeRelateSheetControl } = permissionInfo;
    const disabledManualWrite = onlyRelateByScanCode && _.get(activeRelateSheetControl, 'advancedSetting.dismanual') === '1';
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
              {_l('????????????')}
            </Button>
          </WingBlank>
        )}
        {(isRelevance || isCreate) && (
          <Fragment>
            {onlyRelateByScanCode && <WingBlank size="sm" className="flex">{this.renderRelateScanQRCodeBtn()}</WingBlank>}
            {!disabledManualWrite && (
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
                    {isRelevance ? _l('????????????') : _l('????????????')}
                  </Fragment>
                </Button>
              </WingBlank>
            )}
          </Fragment>
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

