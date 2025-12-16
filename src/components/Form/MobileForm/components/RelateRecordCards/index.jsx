import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _, { identity } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import sheetAjax from 'src/api/worksheet';
import { mobileSelectRecord } from 'mobile/components/RecordCardListDialog';
import { RecordInfoModal as MobileRecordInfoModal } from 'mobile/Record';
import { WithoutRows } from 'mobile/RecordList/SheetRows';
import ChildTableContext from 'worksheet/components/ChildTable/ChildTableContext';
import { FROM } from 'src/components/Form/core/config';
import { controlState, getTitleTextFromRelateControl } from 'src/components/Form/core/utils';
import { getIsScanQR } from 'src/components/Form/MobileForm/components/ScanQRCode';
import MobileNewRecord from 'src/pages/worksheet/common/newRecord/MobileNewRecord';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { getTranslateInfo } from 'src/utils/app';
import { completeControls } from 'src/utils/control';
import { addBehaviorLog, handlePushState, handleReplaceState } from 'src/utils/project';
import { replaceControlsTranslateInfo } from 'src/utils/translate';
import { getCoverUrl } from '../../tools/utils';
import SearchInput from '../ChildTable/SearchInput';
import RelateScanQRCode from '../RelateScanQRCode';
import RecordCoverCard from './RecordCoverCard';
import RecordTag from './RecordTag';

const MAX_COUNT = 200;

export const LoadingButton = styled.div`
  display: inline-block;
  cursor: pointer;
  height: 29px;
  line-height: 29px;
  padding: 0 12px;
  color: var(--color-primary);
  border-radius: 3px;
  font-size: 13px;

  .loading {
    margin-right: 6px;
    .icon {
      display: inline-block;
      animation: rotate 1.2s linear infinite;
    }
  }
`;

const RelateScanQRCodeWrap = styled(RelateScanQRCode)`
  &.lineWrap {
    color: #1677ff;
    width: 100%;
    .scanIcon {
      color: #1677ff !important;
      margin-right: 5px;
    }
    .scanButton {
      width: 100%;
      margin-left: 0;
    }
  }
  .scanButton {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e0e0e0;
    margin-left: 10px;
    border-radius: 3px;
  }
`;

const WithoutRowsWrap = styled.div`
  background-color: #f8f8f8;
`;

const RecordTagsWrap = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const OperateWrap = styled.div`
  justify-content: flex-end;
  margin-top: -6px;
  position: absolute;
  top: -34px;
`;

class RelateRecordCards extends Component {
  static contextType = ChildTableContext;
  static propTypes = {
    editable: PropTypes.bool,
    multiple: PropTypes.bool,
    control: PropTypes.shape({
      disabled: PropTypes.bool,
      appId: PropTypes.string, // 他表字段被关联表所在应用 id
      viewId: PropTypes.string, // 他表字段被关联表所在应用所在视图 id
      worksheetId: PropTypes.string, // 他表字段所在表 id
      projectId: PropTypes.string, // 网络 id
      from: PropTypes.number, // 来源
      recordId: PropTypes.string, // 他表字段所在记录 id
      controlId: PropTypes.string, // 他表字段 id
      coverCid: PropTypes.string, // 他表字段封面 id
      enumDefault2: PropTypes.number,
      strDefault: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      dataSource: PropTypes.string,
      showControls: PropTypes.arrayOf(PropTypes.string),
      enumDefault: PropTypes.number,
      onChange: PropTypes.func,
      openRelateSheet: PropTypes.func,
      formData: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    records: PropTypes.arrayOf(PropTypes.shape({})),
    onChange: PropTypes.func,
  };

  static defaultProps = {
    control: {},
  };

  constructor(props) {
    super(props);
    const {
      control: { relationControls = [], showControls = [], worksheetId, advancedSetting = {} },
    } = this.props;
    const hasRelateControl = this.hasRelateControl(
      relationControls,
      this.mobileShowAddAsDropdown ? safeParse(advancedSetting.chooseshowids, 'array') : showControls,
    );
    let showLoadMore = true;
    try {
      if ((props.records || []).length >= props.count) {
        showLoadMore = false;
      }
    } catch (err) {
      console.error(err);
    }
    this.state = {
      sheetTemplateLoading: hasRelateControl,
      controls: hasRelateControl
        ? []
        : replaceControlsTranslateInfo(props.appId, worksheetId, completeControls(relationControls)),
      previewRecord: null,
      showNewRecord: false,
      mobileRecordkeyWords: '',
      count: props.count,
      records: props.records || [],
      deletedIds: props.deletedIds || [],
      addedIds: props.addedIds || [],
      showLoadMore,
      isLoadingMore: false,
      pageIndex: 1,
    };
  }

  componentDidMount() {
    const { count = 0, records = [], control = {} } = this.props;
    if (this.state.sheetTemplateLoading) {
      this.loadControls();
    }
    if (_.get(this, 'props.control.isSubList')) {
      const loadedCount = records.length;
      if (loadedCount < count) {
        this.loadMoreRecords(1);
      }
    }
    if (
      (_.get(window, 'shareState.isPublicForm') &&
        _.includes(['2', '5', '6'], _.get(this, 'props.control.advancedSetting.originShowType'))) ||
      (_.includes(['2', '5'], _.get(control, 'advancedSetting.showtype')) &&
        _.includes([FROM.H5_EDIT, FROM.RECORDINFO, FROM.DRAFT], control.from) &&
        !_.get(this, 'props.control.hasDefaultValue'))
    ) {
      this.loadMoreRecords(1);
    }

    window.addEventListener('popstate', this.onQueryChange, false);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.onQueryChange, false);
  }

  componentWillReceiveProps(nextProps) {
    const control = nextProps.control || {};
    if (this.props.control.dataSource !== nextProps.control.dataSource) {
      const {
        control: { relationControls = [], showControls = [] },
      } = nextProps;
      const hasRelateControl = this.hasRelateControl(relationControls, showControls);
      if (hasRelateControl || _.includes([FROM.H5_EDIT, FROM.RECORDINFO], control.from)) {
        this.setState({ sheetTemplateLoading: true });
        this.loadControls(nextProps);
      }
    }
    if (nextProps.flag !== this.props.flag) {
      if (
        (_.get(window, 'shareState.isPublicForm') &&
          _.includes(['2', '5', '6'], _.get(this, 'props.control.advancedSetting.originShowType'))) ||
        (_.includes(['2', '5'], _.get(control, 'advancedSetting.showtype')) &&
          _.includes([FROM.H5_EDIT, FROM.RECORDINFO], control.from) &&
          !_.get(this, 'props.control.hasDefaultValue'))
      ) {
        this.setState({ records: [], count: 0, addedIds: [], deletedIds: [] }, () =>
          this.loadMoreRecords(1, nextProps),
        );
      } else {
        this.setState({ records: nextProps.records, count: nextProps.count, addedIds: [], deletedIds: [] });
        if (_.get(this, 'props.control.isSubList')) {
          if (nextProps.records.length < nextProps.count) {
            this.loadMoreRecords(1, nextProps);
          }
        }
      }
    }
    if (!_.isEqual(nextProps.records, this.props.records)) {
      this.setState({ records: nextProps.records, count: nextProps.count });
    }

    const { pageIndex, showLoadMore, isLoadingMore } = this.state;
    if (nextProps.loadMoreRelateCards && !isLoadingMore && showLoadMore) {
      this.loadMoreRecords(pageIndex + 1);
    }
  }

  get controls() {
    let {
      control: { showControls = [], advancedSetting },
    } = this.props;
    const { controls } = this.state;
    if (this.mobileShowAddAsDropdown) {
      showControls = safeParse(advancedSetting.chooseshowids, 'array');
    }
    return showControls.map(scid => _.find(controls, c => c.controlId === scid)).filter(identity);
  }

  get onlyRelateByScanCode() {
    const [, , onlyRelateByScanCode] = (_.get(this, 'props.control.strDefault') || '').split('').map(b => !!+b);
    return onlyRelateByScanCode;
  }
  get disabledManualWrite() {
    return this.onlyRelateByScanCode && _.get(this, 'props.control.advancedSetting.dismanual') === '1';
  }

  get isCard() {
    const { from, control = {} } = this.props;
    const advancedSetting = control.advancedSetting || {};
    return (
      parseInt(advancedSetting.showtype, 10) === 1 ||
      (_.includes([FROM.H5_ADD, FROM.H5_EDIT, FROM.RECORDINFO, FROM.DRAFT], from) &&
        parseInt(advancedSetting.showtype, 10) === 2)
    );
  }

  get isRealCard() {
    const { control = {} } = this.props;
    const advancedSetting = control.advancedSetting || {};
    return advancedSetting.showtype === '1';
  }

  get showAddAsDropdown() {
    const { control = {} } = this.props;
    const { showtype } = control.advancedSetting || {};
    const { enumDefault2 } = control;
    return showtype === '3' && enumDefault2 !== 10 && enumDefault2 !== 11;
  }

  get mobileShowAddAsDropdown() {
    const { control = {} } = this.props;
    const { showtype = '2', enumDefault } = control.advancedSetting || {};
    const chooseShowIds = safeParse(control.advancedSetting.chooseshowids, 'array');
    const multiple = enumDefault === 2;
    let showCards = !multiple && !!chooseShowIds.length;

    return showtype === '3' && showCards;
  }

  get addRelationButtonVisible() {
    const { control = {} } = this.props;
    const { from, disabled, enumDefault, enumDefault2 } = control;
    const { records = [] } = this.state;
    const controlPermission = controlState(control, from);

    return (
      (!records.length || enumDefault === 2 || this.showAddAsDropdown) &&
      from !== FROM.SHARE &&
      enumDefault2 !== 11 &&
      (this.isCard ? !this.disabledManualWrite : true) &&
      !disabled &&
      controlPermission.editable
    );
  }
  get allowReplaceRecord() {
    const { control = {} } = this.props;
    const { from, disabled, enumDefault, enumDefault2 } = control;
    const { records = [] } = this.state;
    return (
      records.length === 1 &&
      enumDefault === 1 &&
      from !== FROM.SHARE &&
      enumDefault2 !== 10 &&
      enumDefault2 !== 11 &&
      (this.isCard ? !this.disabledManualWrite : true) &&
      !disabled
    );
  }

  get allowNewRecord() {
    const { control = {}, editable } = this.props;
    return editable && control.enumDefault2 !== 1 && control.enumDefault2 !== 11 && !window.isPublicWorksheet;
  }

  onQueryChange = () => {
    const { showMobileSelectRecord, previewRecord, showNewRecord } = this.state;
    const { recordId, controlId } = _.get(this.props, 'control') || {};
    if (showMobileSelectRecord) {
      const ele = document.querySelector(`.mobileSelectRecordWrap-${controlId}`);
      if (!ele) {
        return;
      }
      handleReplaceState('page', `mobileSelectRecord-${controlId}`, () => {
        this.setState({ showMobileSelectRecord: false });
        ele && document.body.removeChild(ele);
      });
    }

    if (showNewRecord) {
      handleReplaceState('page', `newRelateRecord-${controlId}`, () => this.setState({ showNewRecord: false }));
    }

    if (previewRecord) {
      handleReplaceState('page', `relateRecord-${recordId}`, () => this.setState({ previewRecord: undefined }));
    }
  };

  hasRelateControl(relationControls, showControls) {
    return !!_.find(
      relationControls.filter(rc => _.find(showControls, scid => scid === rc.controlId)),
      c => _.includes([29, 30], c.type),
    );
  }

  loadControls(nextProps) {
    const { dataSource, worksheetId } = (nextProps || this.props).control;
    sheetAjax
      .getWorksheetInfo({ worksheetId: dataSource, getTemplate: true, relationWorksheetId: worksheetId })
      .then(data => {
        this.setState({
          controls: replaceControlsTranslateInfo((nextProps || this.props).appId, dataSource, data.template.controls),
          sheetTemplateLoading: false,
          enablePayment: data.enablePayment,
        });
      });
  }

  loadMoreRecords = (pageIndex = 2, nextProps) => {
    const { formDisabled } = this.props;
    const { from, controlId, recordId, worksheetId, advancedSetting, instanceId, workId, disabled } = (
      nextProps || this.props
    ).control;
    const { keywords } = this.state;
    this.setState({
      isLoadingMore: true,
    });
    sheetAjax
      .getRowRelationRows({
        worksheetId,
        rowId: recordId,
        controlId,
        pageIndex,
        pageSize: 50,
        getType: from === FROM.DRAFT ? from : undefined,
        instanceId,
        workId,
        keywords,
      })
      .then(res => {
        this.setState(state => {
          const data = _.get(res, 'data') || [];
          const shouldReset = disabled && formDisabled && pageIndex === 1;
          const newRecords = shouldReset ? data : _.uniqBy([...state.records, ...data], 'rowid');

          const newState = {
            records: newRecords,
            pageIndex,
            isLoadingMore: false,
            showLoadMore: newRecords.length < res.count && data.length > 0,
          };
          if (
            _.includes(['2', '5'], _.get(advancedSetting, 'showtype')) &&
            _.includes([FROM.H5_EDIT, FROM.RECORDINFO], from)
          ) {
            newState.count = res.count;
          }
          return newState;
        });
      });
  };

  handleChange(searchByChange) {
    const { recordId, onChange } = this.props;
    const { count, records, isLoadingMore, showLoadMore, pageIndex, deletedIds = [], addedIds = [] } = this.state;
    onChange({
      deletedIds,
      addedIds,
      records,
      count: count,
      searchByChange,
    });
    if (recordId && !isLoadingMore && showLoadMore && records.length < 20) {
      this.loadMoreRecords(pageIndex + 1);
    }
  }

  handleDelete = deletedRecord => {
    const { count, records, addedIds, deletedIds } = this.state;
    this.setState(
      {
        deletedIds: _.includes(addedIds, deletedRecord.rowid)
          ? deletedIds
          : _.uniq(deletedIds.concat(deletedRecord.rowid)),
        records: records.filter(r => r.rowid !== deletedRecord.rowid),
        addedIds: addedIds.filter(id => id !== deletedRecord.rowid),
        count: count - 1,
      },
      this.handleChange,
    );
  };

  handleClear = () => {
    const { records, addedIds, deletedIds } = this.state;
    const recordIds = records.map(r => r.rowid);
    const changes = {
      deletedIds: _.uniq(deletedIds.concat(recordIds)),
      records: [],
      addedIds: addedIds.filter(r => !_.includes(recordIds, r.rowid)),
      count: 0,
    };
    this.setState(changes, this.handleChange);
  };

  deleteAllRecord = cb => {
    const { records, addedIds, deletedIds } = this.state;
    const recordIds = records.map(r => r.rowid);
    const changes = {
      deletedIds: _.uniq(deletedIds.concat(recordIds)),
      records: [],
      addedIds: addedIds.filter(r => !_.includes(recordIds, r.rowid)),
      count: 0,
    };
    if (_.isFunction(cb)) {
      cb(changes);
    } else {
      this.setState(changes, this.handleChange);
    }
  };

  clearAndAdd = newRecords => {
    this.deleteAllRecord(changes => {
      const { count, addedIds = [] } = changes;
      this.setState(
        {
          ...changes,
          records: newRecords,
          count: count + newRecords.length,
          addedIds: addedIds.concat(newRecords.map(r => r.rowid)),
        },
        // 查询更新，被动更新
        () => this.handleChange(false),
      );
    });
  };

  handleAdd = newAdded => {
    const { multiple } = this.props;
    const { count, records, addedIds = [] } = this.state;
    const { isRealCard } = this;
    newAdded = newAdded.map(r => ({ ...r, isNewAdd: true }));
    if (isRealCard) {
      newAdded = newAdded.slice(0, MAX_COUNT - count);
    }
    const newRecords = multiple ? _.uniqBy(newAdded.concat(records), r => r.rowid) : newAdded;
    this.setState(
      {
        records: newRecords,
        count: count + newAdded.length,
        addedIds: addedIds.concat(newAdded.map(r => r.rowid)),
      },
      this.handleChange,
    );
  };

  updateRelateRecord = cells => {
    const { records } = this.state;
    const targetRow = cells.find(item => item.controlId === 'rowid') || {};
    const targetRowId = targetRow.value;

    if (!targetRowId) return;

    const valueObj = {};
    cells.forEach(({ controlId, value }) => {
      if (controlId !== 'rowid') {
        valueObj[controlId] = value;
      }
    });

    const updatedRecords = records.map(item => {
      if (item.rowid === targetRowId) {
        const newItem = { ...item };
        Object.keys(newItem).forEach(key => {
          if (key !== 'rowid' && _.has(valueObj, key)) {
            newItem[key] = valueObj[key];
          }
        });
        return newItem;
      }
      return item;
    });
    this.setState(
      {
        records: updatedRecords,
      },
      this.handleChange,
    );
  };

  handleReplaceRecord = oldRecord => {
    const { addedIds = [], deletedIds = [] } = this.state;
    this.handleSelectRecord(newAdded => {
      this.setState(
        {
          records: newAdded,
          deletedIds: _.uniq(deletedIds.concat(oldRecord.rowid)),
          addedIds: addedIds.concat(newAdded.map(r => r.rowid)).filter(id => id !== oldRecord.rowid),
        },
        this.handleChange,
      );
    });
  };

  getDefaultRelateSheetValue() {
    try {
      const { formData, controlId, recordId, worksheetId } = this.props.control;
      const titleControl = _.find(formData, control => control.attribute === 1);
      const defaultRelatedSheetValue = {
        name: titleControl.value,
        sid: recordId,
        type: 8,
        sourcevalue: JSON.stringify({
          ..._.assign(...formData.map(c => ({ [c.controlId]: c.value }))),
          [titleControl.controlId]: titleControl.value,
          rowid: recordId,
        }),
      };
      if (titleControl.type === 29) {
        try {
          const cellData = JSON.parse(titleControl.value);
          defaultRelatedSheetValue.name = cellData[0].name;
        } catch (err) {
          console.log(err);
          defaultRelatedSheetValue.name = '';
        }
      }
      return {
        worksheetId,
        relateSheetControlId: controlId,
        value: defaultRelatedSheetValue,
      };
    } catch (err) {
      console.log(err);
      return;
    }
  }

  handleClick = () => {
    const { control } = this.props;
    const { records } = this.state;
    const { enumDefault2, controlId } = control;
    const { isRealCard } = this;
    // if (!$(evt.target).closest('.relateRecordBtn').length) return;
    let count = _.isUndefined(this.state.count) ? records.length : this.state.count;
    if (isRealCard && count >= MAX_COUNT) {
      alert(_l('最多关联%0条', MAX_COUNT), 3);
      return;
    }
    if (enumDefault2 !== 10 && enumDefault2 !== 11) {
      this.handleSelectRecord(this.handleAdd);
    } else if (this.allowNewRecord) {
      handlePushState('page', `newRelateRecord-${controlId}`);
      this.setState({ showNewRecord: true });
    }
  };

  handleSelectRecord(onOk = () => {}, options = {}) {
    const { control, showCoverAndControls } = this.props;
    const { rows } = this.context || {};
    const {
      appId,
      viewId,
      worksheetId,
      recordId,
      controlId,
      dataSource,
      enumDefault,
      showControls = [],
      coverCid,
      formData,
      isCharge,
      isDraft,
    } = control;
    const { records, deletedIds } = this.state;
    const { disabledManualWrite, isCard } = this;
    const selectOptions = {
      className: `mobileSelectRecordWrap-${controlId}`,
      control: control,
      recordId,
      isCharge,
      ignoreRowIds: deletedIds,
      allowNewRecord: this.allowNewRecord,
      disabledManualWrite: disabledManualWrite,
      multiple: enumDefault === 2,
      coverCid: coverCid,
      filterRowIds: records
        .map(r => r.rowid)
        .concat(control.dataSource === worksheetId ? recordId : [])
        .concat(
          control.isSubList && (control.unique || control.uniqueInRecord)
            ? (rows || []).map(r => _.get(safeParse(r[control.controlId], 'array'), '0.sid')).filter(_.identity)
            : [],
        ),
      showControls: showControls,
      appId: appId,
      viewId: viewId,
      masterRecordRowId: recordId,
      relateSheetId: dataSource,
      parentWorksheetId: worksheetId,
      filterRelatesheetControlIds: [controlId],
      defaultRelatedSheet: this.getDefaultRelateSheetValue(),
      controlId: controlId,
      onOk: onOk,
      formData: formData,
      isDraft,
      onClear: this.handleClear,
      handleReplaceHistoryState: () => {
        history.back();
        this.setState({ showMobileSelectRecord: false });
      },
      ...(!isCard && !showCoverAndControls ? { showControls: [], control: { ...control, showControls: [] } } : {}),
    };
    this.setState({ showMobileSelectRecord: true });
    window.isMingDaoApp && handlePushState('page', `mobileSelectRecord-${controlId}`);
    mobileSelectRecord(Object.assign(selectOptions, options));
  }

  renderRecordsCon() {
    const { control, allowOpenRecord, hideTitle, cardClassName, projectId } = this.props;
    const {
      appId,
      viewId,
      from,
      recordId,
      dataSource,
      disabled,
      enumDefault,
      coverCid,
      advancedSetting,
      isCharge,
      sheetSwitchPermit,
    } = control;
    const sourceEntityName = getTranslateInfo(appId, null, dataSource).recordName || control.sourceEntityName;
    const { allowReplaceRecord, isCard, addRelationButtonVisible } = this;
    const { records, showAll, showLoadMore, isLoadingMore, pageIndex } = this.state;
    const allowlink = (advancedSetting || {}).allowlink;
    const controlPermission = controlState(control, from);
    const allowRemove =
      (control.advancedSetting.allowcancel !== '0' || enumDefault === 1) && controlPermission.editable;
    if (isCard || this.mobileShowAddAsDropdown) {
      return (
        <div style={{ marginBottom: disabled ? 6 : 0 }}>
          {records.length
            ? (showAll || records.length <= 3 ? records : records.slice(0, 3)).map((record, i) => (
                <RecordCoverCard
                  className={cardClassName}
                  hideTitle={hideTitle || (this.mobileShowAddAsDropdown && !disabled)}
                  showAddAsDropdown={this.showAddAsDropdown}
                  from={from}
                  projectId={projectId || control.projectId}
                  viewId={viewId}
                  allowReplaceRecord={allowReplaceRecord}
                  disabled={disabled || (!allowRemove && !record.isNewAdd)}
                  isCharge={isCharge}
                  key={i}
                  controls={this.controls}
                  sheetSwitchPermit={sheetSwitchPermit}
                  data={record}
                  cover={getCoverUrl(coverCid, record, this.state.controls)}
                  allowlink={allowlink}
                  parentControl={control}
                  sourceEntityName={sourceEntityName}
                  onClick={
                    !allowOpenRecord ||
                    (this.mobileShowAddAsDropdown && !disabled && advancedSetting.allowlink === '1') ||
                    (control.isSubList && _.get(window, 'shareState.shareId')) ||
                    allowlink === '0' ||
                    !record.rowid ||
                    /^temp/.test(record.rowid)
                      ? () => {}
                      : () => {
                          handlePushState('page', `relateRecord-${recordId}`);
                          addBehaviorLog('worksheetRecord', dataSource, { rowId: record.rowid }); // 埋点
                          this.setState({ previewRecord: { recordId: record.rowid } });
                        }
                  }
                  onDelete={() => this.handleDelete(record)}
                  onReplaceRecord={() => this.handleReplaceRecord(record)}
                />
              ))
            : isCard && !addRelationButtonVisible && <div className="customFormNull"></div>}
          {records.length > 3 && (
            <div>
              {recordId && showLoadMore && showAll && (
                <LoadingButton
                  onClick={() => {
                    if (!isLoadingMore) {
                      this.loadMoreRecords(pageIndex + 1);
                    }
                  }}
                >
                  {isLoadingMore && (
                    <span className="loading">
                      <i className="icon icon-loading_button"></i>
                    </span>
                  )}
                  {_l('加载更多')}
                </LoadingButton>
              )}
              <LoadingButton
                className="ThemeColor3 Hand mBottom10 InlineBlock"
                onClick={() => this.setState({ showAll: !showAll })}
              >
                {showAll ? _l('收起') : _l('展开更多')}
              </LoadingButton>
            </div>
          )}
        </div>
      );
    }

    return this.renderDropDownRecordsCon();
  }

  renderDropDownRecordsCon = () => {
    const { control, allowOpenRecord } = this.props;
    const { appId, viewId, from, recordId, dataSource, disabled, enumDefault, openRelateSheet } = control;
    const sourceEntityName = getTranslateInfo(appId, null, dataSource).recordName || control.sourceEntityName;
    const { records } = this.state;
    const controlPermission = controlState(control, from);
    const allowRemove =
      (control.advancedSetting.allowcancel !== '0' || enumDefault === 1) && controlPermission.editable;

    return (
      <RecordTagsWrap>
        {records.map((record, i) => (
          <RecordTag
            key={i}
            disabled={disabled || !allowRemove}
            title={record.rowid ? getTitleTextFromRelateControl(control, record) : _l('关联当前%0', sourceEntityName)}
            enumDefault={enumDefault}
            onClick={
              !allowOpenRecord
                ? null
                : () => {
                    if (from === FROM.SHARE || from === FROM.WORKFLOW) {
                      openRelateSheet('', record.wsid, record.rowid, viewId);
                    } else {
                      handlePushState('page', `relateRecord-${recordId}`);
                      this.setState({ previewRecord: { recordId: record.rowid } });
                    }
                  }
            }
            onDelete={() => this.handleDelete(record)}
          />
        ))}
      </RecordTagsWrap>
    );
  };

  render() {
    const { control, formDisabled } = this.props;
    const {
      appId,
      worksheetId,
      projectId,
      from,
      recordId,
      controlId,
      dataSource,
      disabled,
      enumDefault,
      enumDefault2,
      formData,
      advancedSetting = {},
      hint,
      showRelateRecordEmpty,
      sourceBtnName,
    } = control;
    const sourceEntityName = getTranslateInfo(appId, null, dataSource).recordName || control.sourceEntityName;
    const { records, previewRecord, showNewRecord, sheetTemplateLoading, keywords, isMobileSearchFocus } = this.state;
    const { onlyRelateByScanCode, disabledManualWrite, addRelationButtonVisible, isCard, mobileShowAddAsDropdown } =
      this;
    const isScanQR = getIsScanQR();
    const multiple = enumDefault === 2;
    if (sheetTemplateLoading) {
      return null;
    }
    const filterControls = getFilter({ control, formData });
    const NewRecordComponent = MobileNewRecord;
    const { searchcontrol } = advancedSetting;

    const renderHint = () => {
      if (disabledManualWrite) {
        return _l('扫码添加%0', sourceEntityName);
      } else if (hint) {
        return hint;
      } else if (searchcontrol) {
        const searchControl = _.find(control.relationControls, { controlId: searchcontrol }) || {};
        return _l('搜索%0', searchControl.controlName || sourceEntityName);
      } else {
        return _l('选择%0', sourceEntityName);
      }
    };

    if (showRelateRecordEmpty && !addRelationButtonVisible && disabled && _.isEmpty(records)) {
      return (
        <WithoutRowsWrap className="withoutRowsWrapper flexColumn valignWrapper h100">
          <WithoutRows text={_l('暂无记录')} />
        </WithoutRowsWrap>
      );
    }

    const shouldShowMargin = (isCard && addRelationButtonVisible) || (mobileShowAddAsDropdown && !disabled);
    let marginClass = disabled ? 'mBottom10' : 'mBottom14';

    return (
      <Fragment>
        {disabled && formDisabled && enumDefault === 2 && isCard && (
          <OperateWrap className="w100 flexRow">
            <SearchInput
              inputWidth={100}
              searchIcon={<i className="icon icon-search" />}
              keywords={keywords}
              focusedClass={cx({ mRight10: !isMobileSearchFocus })}
              onOk={value => {
                this.setState({ keywords: value, pageIndex: 1 }, () => this.loadMoreRecords(1));
              }}
              onClear={() => {
                this.setState({ keywords: '', pageIndex: 1, isMobileSearchFocus: false }, () =>
                  this.loadMoreRecords(1),
                );
              }}
              onFocus={() => this.setState({ isMobileSearchFocus: true })}
              onBlur={() => this.setState({ isMobileSearchFocus: false })}
            />
          </OperateWrap>
        )}
        <div
          className={cx('flexRow valignWrapper', {
            [marginClass]: shouldShowMargin && records.length,
          })}
        >
          {isCard && addRelationButtonVisible && (
            <div className="customFormControlBox customFormButton" onClick={this.handleClick}>
              <Icon icon="plus" />
              <span>{sourceBtnName || sourceEntityName || ''}</span>
            </div>
          )}
          {!isCard && (!disabled || !mobileShowAddAsDropdown) && (
            <div
              className={cx('customFormControlBox controlMinHeight customFormControlCapsuleBox', {
                controlEditReadonly: !formDisabled && records.length && disabled,
                controlDisabled: formDisabled,
              })}
              onClick={() => {
                if (!disabled) this.handleClick();
              }}
            >
              {records.length ? (
                <div className="flex pRight10">{this.renderDropDownRecordsCon()}</div>
              ) : (
                <span className="flex customFormPlaceholder">{renderHint()}</span>
              )}
              {(!disabled || !formDisabled) && !onlyRelateByScanCode && (
                <Icon icon="arrow-right-border" className="Font16 Gray_bd" />
              )}
            </div>
          )}
          {(!records.length || multiple) &&
            from !== FROM.SHARE &&
            enumDefault2 !== 11 &&
            onlyRelateByScanCode &&
            isScanQR &&
            !disabled && (
              <RelateScanQRCodeWrap
                className={cx({ lineWrap: !addRelationButtonVisible })}
                projectId={projectId}
                worksheetId={dataSource}
                filterControls={filterControls}
                parentWorksheetId={worksheetId}
                control={control}
                relateRecordIds={records.map(r => r.rowid)}
                onChange={data => {
                  this.handleAdd([data]);
                }}
                onOpenRecordCardListDialog={keyWords => {
                  this.handleSelectRecord(this.handleAdd, { keyWords, isScan: true });
                }}
              >
                <div className="scanButton">
                  <i className="scanIcon icon icon-qr_code_19 Font20 Gray_75"></i>
                  {!addRelationButtonVisible && _l('扫码关联%0', sourceEntityName || '')}
                </div>
              </RelateScanQRCodeWrap>
            )}
        </div>
        {(isCard || mobileShowAddAsDropdown) && this.renderRecordsCon()}
        {from !== FROM.PUBLIC_ADD && !!previewRecord && (
          <MobileRecordInfoModal
            className="full"
            visible
            appId={appId}
            worksheetId={dataSource}
            relationWorksheetId={worksheetId}
            viewId={advancedSetting.openview || control.viewId}
            rowId={previewRecord && previewRecord.recordId}
            from={from === FROM.DRAFT ? 3 : 1}
            disableOpenRecordFromRelateRecord={
              _.get(window, 'shareState.isPublicRecord') || _.get(window, 'shareState.isPublicView')
            }
            updateRelateRecord={this.updateRelateRecord}
            onClose={() => {
              this.setState({ previewRecord: undefined });
              if (_.isFunction(control.refreshRecord)) {
                control.refreshRecord();
              }
            }}
          />
        )}
        {showNewRecord && (
          <NewRecordComponent
            showFillNext
            directAdd
            className="worksheetRelateNewRecord"
            needCache={recordId || worksheetId !== dataSource}
            appId={appId}
            worksheetId={dataSource}
            addType={2}
            entityName={sourceEntityName}
            filterRelateSheetIds={[dataSource]}
            filterRelatesheetControlIds={[controlId]}
            visible={showNewRecord}
            masterRecordRowId={recordId}
            hideNewRecord={() => {
              this.setState({ showNewRecord: false });
            }}
            defaultRelatedSheet={this.getDefaultRelateSheetValue()}
            onAdd={record => {
              this.handleAdd([{ ...record, isNewAdd: true }]);
            }}
          />
        )}
      </Fragment>
    );
  }
}

export default autoSize(RelateRecordCards, { onlyWidth: true });
