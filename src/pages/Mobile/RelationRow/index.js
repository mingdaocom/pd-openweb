import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { withRouter } from 'react-router-dom';
import { Flex, ActivityIndicator, WhiteSpace, ListView, WingBlank, Button, Modal } from 'antd-mobile';
import sheetAjax from 'src/api/worksheet';
import RecordCard from 'src/components/recordCard';
import MobileRecordCardListDialog from 'src/components/recordCardListDialog/mobile';
import RelateScanQRCode from 'src/components/newCustomFields/components/RelateScanQRCode';
import NewRecord from 'src/pages/worksheet/common/newRecord/MobileNewRecord';
import { WithoutRows } from 'src/pages/Mobile/RecordList/SheetRows';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import DocumentTitle from 'react-document-title';
import './index.less';

const PAGE_SIZE = 10;

@withRouter
class RelationRow extends Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      relationRow: {},
      relationRows: [],
      dataSource,
      isMore: true,
      loading: false,
      pageIndex: 1,
      showRelevanceRecord: false,
      showCreateRecord: false,
      showControls: [],
      coverCid: '',
      worksheet: null,
      isEdit: false,
      selectedRecordIds: [],
      title: '',
      recordkeyWords: '',
    }
  }
  componentDidMount() {
    this.getRowByID();
  }
  getRowRelationRows(pageIndex) {
    const { match, controlId, instanceId, rowId, worksheetId } = this.props;
    const { params } = match;
    let data = _.object();

    if (instanceId) {
      data = { rowId, worksheetId }
    } else {
      data = params;
    }

    this.setState({ loading: true });
    sheetAjax
      .getRowRelationRows({
        ...data,
        controlId,
        pageIndex,
        pageSize: PAGE_SIZE,
        getWorksheet: pageIndex === 1,
      })
      .then(result => {
        const { relationRows } = this.state;
        const base = {
          loading: false,
          pageIndex,
          relationRows: relationRows.concat(result.data),
          isMore: result.data.length === PAGE_SIZE,
        }
        if (result.worksheet) {
          base.worksheet = result.worksheet;
        }
        if (pageIndex === 1) {
          const { controls } = result.template;
          const control = _.find(this.state.rowInfo.receiveControls, { controlId });
          const titleControl = _.find(controls, { attribute: 1 });
          const fileControls = controls.filter(item => item.type === 14);
          this.setState({
            relationRow: result,
            showControls: control.showControls.filter(item => titleControl.controlId !== item).slice(0, 3),
            coverCid: fileControls.length ? fileControls[0].controlId : null,
            ...base,
          });
        } else {
          this.setState({
            ...base,
          });
        }
      });
  }
  getRowByID() {
    const { match, controlId, instanceId, workId } = this.props;
    const { params } = match;
    let newParams = null;
    if (instanceId && workId) {
      const { rowId, worksheetId } = this.props;
      newParams = {
        instanceId,
        workId,
        rowId,
        worksheetId,
        getType: 9,
      };
    } else {
      newParams = {
        ...params,
        controlId,
        getType: 1,
        checkView: true,
      };
    }
    sheetAjax.getRowByID(newParams).then(result => {
      this.getRowRelationRows(this.state.pageIndex);
      this.setState({
        rowInfo: result,
      });
    });
  }
  getRowInfo() {
    const { controlId } = this.props;
    const { rowInfo, worksheet } = this.state;
    if (rowInfo && worksheet) {
      const { allowAdd } = worksheet;
      const { receiveControls, allowEdit } = rowInfo;
      const activeSheetIndex = 0;
      const relateSheetControls = receiveControls.filter(
        control => (control.type === 29 && control.enumDefault === 2) || control.type === 34,
      );
      const activeRelateSheetControl = relateSheetControls.filter(item => item.controlId === controlId)[0];
      const controlPermission = controlState(activeRelateSheetControl);
      const { enumDefault2, strDefault, controlPermissions = '111' } = activeRelateSheetControl;
      const [, , onlyRelateByScanCode] = strDefault.split('').map(b => !!+b);
      const isSubList = activeRelateSheetControl.type === 34;
      const isCreate = isSubList
        ? allowEdit && controlPermission.editable && enumDefault2 !== 1 && enumDefault2 !== 11 && !onlyRelateByScanCode
        : allowEdit &&
          controlPermission.editable &&
          allowAdd &&
          enumDefault2 !== 1 &&
          enumDefault2 !== 11 &&
          !onlyRelateByScanCode;
      const isRelevance =
        !isSubList &&
        controlPermission.editable &&
        enumDefault2 !== 10 &&
        enumDefault2 !== 11 &&
        allowEdit &&
        !onlyRelateByScanCode;
      const hasEdit = controlPermission.editable && allowEdit && (allowAdd || isSubList);
      const isWxWork = false;
      const isWeLink = window.navigator.userAgent.toLowerCase().includes('huawei-anyoffice');

      this.isSubList = isSubList;
      this.controlPermission = controlPermission;
      return {
        isCreate,
        isRelevance,
        hasEdit,
        isSubList,
        activeRelateSheetControl,
        onlyRelateByScanCode: onlyRelateByScanCode && (isWxWork || isWeLink),
      };
    } else {
      return {
        activeRelateSheetControl: _.object(),
      };
    }
  }
  pushRelationRows(items) {
    const { relationRows, dataSource } = this.state;
    const newRelationRows = items.concat(relationRows);
    this.setState({
      relationRows: newRelationRows,
    });
  }
  handleEndReached = () => {
    const { loading, isMore, pageIndex } = this.state;
    if (!loading && isMore) {
      this.getRowRelationRows(pageIndex + 1);
    }
  }
  addRelationRows(newRelationRows) {
    const { relationRows } = this.state;
    const ids = relationRows.map(item => item.rowid);
    const list = newRelationRows.filter(item => !ids.includes(item.rowid));

    if (_.isEmpty(list)) {
      alert(_l('无法关联已经关联过的记录'), 2);
      return;
    }

    const { params } = this.props.match;
    sheetAjax
      .updateRowRelationRows({
        worksheetId: params.worksheetId,
        appId: params.appId,
        viewId: params.viewId,
        rowId: params.rowId,
        controlId: this.props.controlId,
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
  removeRelationRows = () => {
    const { params } = this.props.match;
    const { selectedRecordIds, worksheet } = this.state;
    if (this.isSubList) {
      sheetAjax
        .deleteWorksheetRows({
          worksheetId: worksheet.worksheetId,
          rowIds: selectedRecordIds,
        })
        .then(data => {
          if (data.isSuccess) {
            const { relationRows, dataSource } = this.state;
            const newRelationRows = relationRows.filter(n => !selectedRecordIds.includes(n.rowid));
            this.setState({
              relationRows: newRelationRows,
            });
            this.handleSetEdit(false);
            alert(_l('删除成功！'));
          } else {
            alert(_l('删除失败！'), 2);
          }
        });
    } else {
      sheetAjax
        .updateRowRelationRows({
          worksheetId: params.worksheetId,
          appId: params.appId,
          viewId: params.viewId,
          rowId: params.rowId,
          controlId: this.props.controlId,
          isAdd: false,
          rowIds: selectedRecordIds,
        })
        .then(data => {
          if (data.isSuccess) {
            const { relationRows, dataSource } = this.state;
            const newRelationRows = relationRows.filter(n => !selectedRecordIds.includes(n.rowid));
            this.setState({
              relationRows: newRelationRows,
            });
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
  handleSelect = (record, selected) => {
    const { controlId } = this.props;
    const { worksheet, isEdit, selectedRecordIds, rowInfo } = this.state;
    const control = _.find(rowInfo.receiveControls, { controlId });
    if (isEdit) {
      this.setState({
        selectedRecordIds: selected
          ? _.unique(selectedRecordIds.concat(record.rowid))
          : selectedRecordIds.filter(id => id !== record.rowid),
      });
    } else {
      this.props.history.push(
        `/mobile/record/${worksheet.appId || null}/${worksheet.worksheetId}/${control.viewId || null}/${record.rowid}?isSubList=${
          this.isSubList
        }&editable=${this.controlPermission.editable}`,
      );
    }
  }
  handleSetShowRelevanceRecord = visible => {
    const { relationRow } = this.state;
    const entityName = relationRow.worksheet.entityName || _l('记录');
    this.setState({
      showRelevanceRecord: visible,
      title: visible ? _l('选择%0', entityName) : _l('%0详情', entityName)
    });
  }
  handleSetEdit = isEdit => {
    this.setState({
      isEdit,
      selectedRecordIds: [],
    });
  }
  renderRow = item => {
    const { relationRow, showControls, coverCid, selectedRecordIds } = this.state;
    const { controls } = relationRow.template;
    const selected = !!_.find(selectedRecordIds, id => id === item.rowid);
    return (
      <WingBlank size="md" key={item.rowid}>
        <RecordCard
          from={3}
          selected={selected}
          controls={controls}
          showControls={showControls}
          data={item}
          onClick={() => this.handleSelect(item, !selected)}
        />
      </WingBlank>
    );
  }
  renderRelateScanQRCodeBtn() {
    const { relationRow, worksheet, rowInfo } = this.state;
    const { controlId } = this.props;
    const control = _.find(rowInfo.receiveControls, { controlId });
    const formData = rowInfo.receiveControls;
    const filterControls = getFilter({ control, formData });

    return (
      <RelateScanQRCode
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
            {_l('扫码关联%0', relationRow.worksheet.entityName || _l('记录'))}
          </Fragment>
        </Button>
      </RelateScanQRCode>
    );
  }
  renderAddWrapper(isRelevance, hasEdit, onlyRelateByScanCode, isCreate) {
    const { isEdit, selectedRecordIds, relationRows, relationRow, worksheet } = this.state;
    const { isSubList } = this;

    if (!isRelevance && !hasEdit) {
      return null;
    }

    return (
      <Flex justify="center" align="center" className="addWrapper">
        {isEdit ? (
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
        ) : (
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
        )}
      </Flex>
    );
  }
  render() {
    const {
      dataSource,
      relationRows,
      isMore,
      loading,
      relationRow,
      coverCid,
      showControls,
      worksheet,
      isEdit,
      selectedRecordIds,
      showRelevanceRecord,
      showCreateRecord,
      title,
      rowInfo,
    } = this.state;
    const { match, controlId } = this.props;
    const { params } = match;
    const {
      isCreate,
      isRelevance,
      hasEdit,
      isSubList,
      activeRelateSheetControl,
      onlyRelateByScanCode,
    } = this.getRowInfo();

    if (_.isEmpty(relationRow)) {
      return (
        <Flex justify="center" align="center" className="h100">
          <ActivityIndicator size="large" />
        </Flex>
      );
    }

    let defaultRelatedSheetValue;
    try {
      const formData = rowInfo.receiveControls.filter(_.identity);
      const titleControl = formData.filter(c => c && c.attribute === 1);
      defaultRelatedSheetValue = titleControl && {
        name: titleControl.value,
        sid: params.rowId,
        type: 8,
        sourcevalue: JSON.stringify({
          ..._.assign(...formData.map(c => ({ [c.controlId]: c.value }))),
          [titleControl.controlId]: titleControl.value,
          rowid: params.rowId,
        }),
      };
    } catch (err) {}

    return (
      <div className="sheetRelationRow flexColumn h100">
        {title && <DocumentTitle title={title} />}
        {relationRows.length ? (
          <ListView
            className={cx('flex', { editRowWrapper: isEdit })}
            dataSource={dataSource.cloneWithRows(relationRows)}
            renderHeader={() => <Fragment />}
            renderFooter={() =>
              isMore ? <Flex justify="center">{loading ? <ActivityIndicator animating /> : null}</Flex> : <Fragment />
            }
            pageSize={10}
            scrollRenderAheadDistance={500}
            onEndReached={this.handleEndReached}
            onEndReachedThreshold={10}
            renderRow={this.renderRow}
          />
        ) : (
          <div className="withoutRowsWrapper flexColumn valignWrapper h100">
            <WithoutRows text={_l('暂无记录')} />
          </div>
        )}
        {this.renderAddWrapper(isRelevance, hasEdit, onlyRelateByScanCode, isCreate)}
        {showRelevanceRecord && (
          <MobileRecordCardListDialog
            multiple
            control={_.find(rowInfo.receiveControls, { controlId: controlId })}
            formData={rowInfo.receiveControls}
            visible={showRelevanceRecord}
            allowNewRecord={isCreate}
            coverCid={coverCid}
            keyWords={this.state.recordkeyWords}
            showControls={showControls}
            appId={worksheet.appId}
            parentWorksheetId={params.worksheetId}
            filterRelatesheetControlIds={[controlId]}
            controlId={controlId}
            recordId={params.rowId}
            filterRowIds={[params.rowId]}
            allowAdd={false}
            entityName={relationRow.worksheet.entityName}
            relateSheetBeLongProject={relationRow.worksheet.projectId}
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
            worksheetId: params.worksheetId,
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
      </div>
    );
  }
}

export default RelationRow;
