import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { autobind } from 'core-decorators';
import styled from 'styled-components';
import sheetAjax from 'src/api/worksheet';
import autoSize from 'ming-ui/decorators/autoSize';
import ChildTableContext from 'worksheet/components/ChildTable/ChildTableContext';
import { selectRecord } from 'src/components/recordCardListDialog';
import { mobileSelectRecord } from 'src/components/recordCardListDialog/mobile';
import RelateScanQRCode from 'src/components/newCustomFields/components/RelateScanQRCode';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import { searchRecordInDialog } from 'src/pages/worksheet/components/SearchRelateRecords';
import { RecordInfoModal as MobileRecordInfoModal } from 'mobile/Record';
import NewRecord from 'src/pages/worksheet/common/newRecord/NewRecord';
import MobileNewRecord from 'src/pages/worksheet/common/newRecord/MobileNewRecord';
import { getTitleTextFromRelateControl, controlState } from 'src/components/newCustomFields/tools/utils';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import RecordCoverCard from './RecordCoverCard';
import RecordTag from './RecordTag';
import { getIsScanQR } from 'src/components/newCustomFields/components/ScanQRCode';
import { FROM } from 'src/components/newCustomFields/tools/config';
import { Icon } from 'ming-ui';
import { completeControls } from 'worksheet/util';
import { browserIsMobile, addBehaviorLog } from 'src/util';
import _ from 'lodash';

const MAX_COUNT = 200;

export const Button = styled.div`
  cursor: pointer;
  height: 36px;
  font-weight: bold;
  padding: 0 16px;
  display: flex;
  align-items: center;
  color: #333;
  border: 1px solid #dddddd;
  border-radius: 4px;
  > .icon {
    color: #9e9e9e;
    font-weight: normal;
  }
  &:hover {
    background: #f5f5f5;
  }
`;

export const LoadingButton = styled.div`
  display: inline-block;
  cursor: pointer;
  height: 29px;
  line-height: 29px;
  padding: 0 12px;
  color: #2196f3;
  border-radius: 3px;
  font-size: 13px;
  .loading {
    margin-right: 6px;
    .icon {
      display: inline-block;
      animation: rotate 1.2s linear infinite;
    }
  }
  &:hover {
    background: #f8f8f8;
  }
`;

const Con = styled.div(({ isMobile, autoHeight, isCard }) =>
  isMobile
    ? `
      ${autoHeight ? 'height: auto !important;' : ''}
      ${isCard ? '' : 'align-items: center;'}
      padding: 0px !important;
    `
    : `
    ${autoHeight ? 'height: auto !important;' : ''}
    padding: 0px !important;
  `,
);

const OperateCon = styled.div``;

const RelateScanQRCodeWrap = styled(RelateScanQRCode)`
  &.lineWrap {
    color: #2196f3;
    width: 100%;
    .scanIcon {
      color: #2196f3 !important;
      margin-right: 5px;
    }
    .scanButton {
      width: 100%;
      margin-left: 0;
    }
  }
  .scanButton {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e0e0e0;
    margin-left: 10px;
    border-radius: 3px;
  }
`;

const SearchRecordsButton = styled(Icon)`
  position: absolute;
  cursor: pointer;
  right: 10px;
  font-size: 20px;
  color: #bdbdbd;
  &:hover {
    color: #757575;
  }
`;

export function getCardWidth({ width, isMobile, enumDefault, records }) {
  let cardWidth;
  let colNum = 1;
  if (width) {
    const containerWidth = width - 2;
    if (isMobile) {
      cardWidth = '100%';
    } else if (enumDefault === 1 || (records && records.length === 1)) {
      cardWidth = containerWidth - 14;
    } else if (containerWidth >= 1200) {
      cardWidth = Math.floor(containerWidth / 3) - 14;
      colNum = 3;
    } else if (containerWidth >= 800) {
      cardWidth = Math.floor(containerWidth / 2) - 14;
      colNum = 2;
    } else {
      cardWidth = containerWidth - 14;
      colNum = 1;
    }
  } else {
    cardWidth = '100%';
  }
  return { cardWidth, colNum };
}

@autoSize
export default class RelateRecordCards extends Component {
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
      value: PropTypes.string,
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
      control: { relationControls = [], showControls = [] },
    } = this.props;
    const hasRelateControl = this.hasRelateControl(relationControls, showControls);
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
      controls: hasRelateControl ? [] : completeControls(relationControls),
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
        _.get(this, 'props.control.advancedSetting.originShowType') === '2') ||
      (browserIsMobile() &&
        _.get(control, 'advancedSetting.showtype') === '2' &&
        _.includes([FROM.H5_EDIT, FROM.RECORDINFO], control.from))
    ) {
      this.loadMoreRecords(1);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.control.dataSource !== nextProps.control.dataSource) {
      const {
        control: { relationControls = [], showControls = [] },
      } = nextProps;
      const hasRelateControl = this.hasRelateControl(relationControls, showControls);
      if (hasRelateControl) {
        this.setState({ sheetTemplateLoading: true });
        this.loadControls();
      }
    }
    if (nextProps.flag !== this.props.flag) {
      if (
        (_.get(window, 'shareState.isPublicForm') &&
          _.get(this, 'props.control.advancedSetting.originShowType') === '2') ||
        (browserIsMobile() &&
          _.get(this, 'props.control.advancedSetting.showtype') === '2' &&
          _.includes([FROM.H5_EDIT, FROM.RECORDINFO], nextProps.control.from))
      ) {
        this.loadMoreRecords(1);
      } else {
        this.setState({ records: nextProps.records, count: nextProps.count, addedIds: [], deletedIds: [] });
      }
    }
    if (!_.isEqual(nextProps.records, this.props.records)) {
      this.setState({ records: nextProps.records, count: nextProps.count });
    }
  }

  get controls() {
    const {
      control: { showControls },
    } = this.props;
    const { controls } = this.state;
    return showControls.map(scid => _.find(controls, c => c.controlId === scid)).filter(c => c && c.attribute !== 1);
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
      (_.includes([FROM.H5_ADD, FROM.H5_EDIT, FROM.RECORDINFO], from) && parseInt(advancedSetting.showtype, 10) === 2)
    );
  }

  get addRelationButtonVisible() {
    const { control = {} } = this.props;
    const { from, disabled, enumDefault, enumDefault2 } = control;
    const { records = [] } = this.state;
    const controlPermission = controlState(control, from);

    return (
      (!records.length || enumDefault === 2) &&
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

  getCoverUrl(coverId, record) {
    const { controls } = this.state;
    const coverControl = _.find(controls, c => c.controlId && c.controlId === coverId);
    if (!coverControl) {
      return;
    }
    try {
      const coverFile = _.find(JSON.parse(record[coverId]), file => File.isPicture(file.ext));
      const { previewUrl = '' } = coverFile;
      return previewUrl.indexOf('imageView2') > -1
        ? previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/1/w/200/h/140')
        : `${previewUrl}&imageView2/1/w/200/h/140`;
    } catch (err) {}
    return;
  }

  hasRelateControl(relationControls, showControls) {
    return !!_.find(
      relationControls.filter(rc => _.find(showControls, scid => scid === rc.controlId)),
      c => _.includes([29, 30], c.type),
    );
  }

  loadControls() {
    sheetAjax.getWorksheetInfo({ worksheetId: this.props.control.dataSource, getTemplate: true }).then(data => {
      this.setState({
        controls: data.template.controls,
        sheetTemplateLoading: false,
      });
    });
  }

  @autobind
  loadMoreRecords(pageIndex = 2) {
    const { controlId, recordId, worksheetId } = this.props.control;
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
      })
      .then(res => {
        this.setState(state => {
          const newRecords = _.uniqBy([...state.records, ...res.data], 'rowid');
          return {
            records: newRecords,
            pageIndex,
            isLoadingMore: false,
            showLoadMore: newRecords.length < res.count && res.data.length > 0,
          };
        });
      });
  }

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

  @autobind
  handleDelete(deletedRecord) {
    const { count, records, addedIds, deletedIds } = this.state;
    this.setState(
      {
        deletedIds: _.uniq(deletedIds.concat(deletedRecord.rowid)),
        records: records.filter(r => r.rowid !== deletedRecord.rowid),
        addedIds: addedIds.filter(id => id !== deletedRecord.rowid),
        count: count - 1,
      },
      this.handleChange,
    );
  }

  @autobind
  deleteAllRecord(cb) {
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
  }

  @autobind
  clearAndAdd(newRecords) {
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
  }

  @autobind
  handleAdd(newAdded) {
    const { multiple } = this.props;
    const { count, records, addedIds = [] } = this.state;
    newAdded = newAdded.map(r => ({ ...r, isNewAdd: true })).slice(0, MAX_COUNT - count);
    const newRecords = multiple ? _.uniqBy(newAdded.concat(records), r => r.rowid) : newAdded;
    this.setState(
      {
        records: newRecords,
        count: count + newAdded.length,
        addedIds: addedIds.concat(newAdded.map(r => r.rowid)),
      },
      this.handleChange,
    );
  }

  @autobind
  handleReplaceRecord(oldRecord) {
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
  }

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
          defaultRelatedSheetValue.name = '';
        }
      }
      return {
        worksheetId,
        relateSheetControlId: controlId,
        value: defaultRelatedSheetValue,
      };
    } catch (err) {
      return;
    }
  }

  handleClick = evt => {
    const { control } = this.props;
    const { records } = this.state;
    const { enumDefault2 } = control;

    if (!$(evt.target).closest('.relateRecordBtn').length) return;
    let count = _.isUndefined(this.state.count) ? records.length : this.state.count;
    if (count >= MAX_COUNT) {
      alert(_l('最多关联%0条', MAX_COUNT), 3);
      return;
    }
    if (enumDefault2 !== 10 && enumDefault2 !== 11) {
      this.handleSelectRecord(this.handleAdd);
    } else {
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
    } = control;
    const { records, deletedIds } = this.state;
    const { disabledManualWrite, isCard } = this;
    const selectOptions = {
      control: control,
      recordId,
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
      isCharge: isCharge,
      masterRecordRowId: recordId,
      relateSheetId: dataSource,
      parentWorksheetId: worksheetId,
      filterRelatesheetControlIds: [controlId],
      defaultRelatedSheet: this.getDefaultRelateSheetValue(),
      controlId: controlId,
      onOk: onOk,
      formData: formData,
      ...(browserIsMobile() && !isCard && !showCoverAndControls
        ? { showControls: [], control: { ...control, showControls: [] } }
        : {}),
    };
    (browserIsMobile() ? mobileSelectRecord : selectRecord)(Object.assign(selectOptions, options));
  }

  renderRecordsCon() {
    const { width, control, allowOpenRecord } = this.props;
    const {
      viewId,
      from,
      recordId,
      projectId,
      dataSource,
      disabled,
      enumDefault,
      coverCid,
      openRelateSheet,
      sourceEntityName,
      advancedSetting,
      isCharge,
    } = control;
    const { allowReplaceRecord, isCard } = this;
    const { records, showAll, showLoadMore, isLoadingMore, pageIndex } = this.state;
    const allowlink = (advancedSetting || {}).allowlink;
    const controlPermission = controlState(control, from);
    const allowRemove =
      (control.advancedSetting.allowcancel !== '0' || enumDefault === 1) && controlPermission.editable;
    const isMobile = browserIsMobile();
    const { cardWidth, colNum } = getCardWidth({ width, isMobile, enumDefault, records });
    if (isCard) {
      return (
        <div
          className={cx('recordsCon mBottom6', {
            'pLeft10 pRight10':
              isMobile && _.includes([FROM.H5_EDIT, FROM.RECORDINFO], from) && advancedSetting.showtype === '2',
          })}
        >
          {!!records.length &&
            (showAll ||
            _.includes([FROM.H5_ADD, FROM.H5_EDIT], from) ||
            (isMobile && from === FROM.RECORDINFO) ||
            records.length <= colNum * 3
              ? records
              : records.slice(0, colNum * 3)
            ).map((record, i) => (
              <RecordCoverCard
                from={from}
                projectId={projectId}
                viewId={viewId}
                allowReplaceRecord={allowReplaceRecord}
                disabled={disabled || (!allowRemove && !record.isNewAdd)}
                width={cardWidth}
                isCharge={isCharge}
                key={i}
                controls={this.controls}
                data={record}
                cover={this.getCoverUrl(coverCid, record)}
                allowlink={allowlink}
                parentControl={control}
                sourceEntityName={sourceEntityName}
                onClick={
                  !allowOpenRecord || (control.isSubList && _.get(window, 'shareState.shareId')) || allowlink === '0'
                    ? () => {}
                    : () => {
                        addBehaviorLog('worksheetRecord', dataSource, { rowId: record.rowid }); // 埋点
                        this.setState({ previewRecord: { recordId: record.rowid } });
                      }
                }
                onDelete={() => this.handleDelete(record)}
                onReplaceRecord={() => this.handleReplaceRecord(record)}
              />
            ))}
          {records.length > colNum * 3 &&
            (isMobile ? !_.includes([FROM.H5_ADD, FROM.H5_EDIT, FROM.RECORDINFO], from) : true) && (
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

    return (
      <div className="recordsCon">
        {records.map((record, i) => (
          <RecordTag
            key={i}
            disabled={disabled || !allowRemove}
            title={record.rowid ? getTitleTextFromRelateControl(control, record) : _l('关联当前%0', sourceEntityName)}
            onClick={
              !allowOpenRecord || (disabled && !recordId)
                ? () => {}
                : () => {
                    if (from === FROM.SHARE || from === FROM.WORKFLOW) {
                      openRelateSheet('', record.wsid, record.rowid, viewId);
                    } else if (isMobile) {
                      disabled && this.setState({ previewRecord: { recordId: record.rowid } });
                    } else {
                      this.setState({ previewRecord: { recordId: record.rowid } });
                    }
                  }
            }
            onDelete={() => this.handleDelete(record)}
          />
        ))}
      </div>
    );
  }

  render() {
    const { control, editable, allowOpenRecord, showCoverAndControls } = this.props;
    const {
      appId,
      viewId,
      worksheetId,
      projectId,
      from,
      recordId,
      controlId,
      controlName,
      dataSource,
      disabled,
      enumDefault,
      enumDefault2,
      strDefault,
      showControls = [],
      coverCid,
      formData,
      sourceEntityName,
      sheetSwitchPermit,
      advancedSetting = {},
      isCharge,
      hint,
      openRelateSheet,
    } = control;
    const { records, previewRecord, showNewRecord, sheetTemplateLoading } = this.state;
    const { onlyRelateByScanCode, disabledManualWrite, addRelationButtonVisible, isCard, allowNewRecord } = this;
    const isMobile = browserIsMobile();
    const isScanQR = getIsScanQR();
    const multiple = enumDefault === 2;
    if (sheetTemplateLoading) {
      return null;
    }
    const filterControls = getFilter({ control, formData });
    const NewRecordComponent = isMobile ? MobileNewRecord : NewRecord;
    const allowRemove = control.advancedSetting.allowcancel !== '0' || enumDefault === 1;

    return (
      <Fragment>
        <OperateCon
          className={cx('flexRow valignWrapper mBottom10', {
            'pLeft20 pRight20':
              isMobile && _.includes([FROM.H5_EDIT, FROM.RECORDINFO], from) && advancedSetting.showtype === '2',
          })}
          isMobile={isMobile}
        >
          <Con
            className={cx(
              'customFormControlBox flexRow relateRecordBtn',
              { formBoxNoBorder: isCard },
              {
                controlDisabled:
                  disabled || (addRelationButtonVisible && !isCard && !records.length && disabledManualWrite),
              },
            )}
            isMobile={isMobile}
            autoHeight={!!records.length}
            isCard={isCard}
            onClick={e => !disabled && !isCard && !disabledManualWrite && this.handleClick(e)}
          >
            <div className="flex" style={{ minWidth: 0 }}>
              {addRelationButtonVisible && (
                <Fragment>
                  {isCard ? (
                    <Button className="relateRecordBtn" onClick={this.handleClick}>
                      <i className="icon icon-plus mRight5 Font16"></i>
                      {sourceEntityName || ''}
                    </Button>
                  ) : !records.length ? (
                    <span className="Gray_bd">
                      {disabledManualWrite
                        ? _l('扫码添加%0', sourceEntityName)
                        : isMobile && hint
                        ? hint
                        : _l('选择%0', sourceEntityName)}
                    </span>
                  ) : null}
                </Fragment>
              )}
              {disabledManualWrite && !isScanQR && (
                <div className="Gray_9e mBottom5 mTop5 pTop3 pBottom3">{_l('请在移动端扫码添加关联')}</div>
              )}
              {!isCard && this.renderRecordsCon()}
              {from !== FROM.PUBLIC_ADD &&
                !!previewRecord &&
                (isMobile ? (
                  <MobileRecordInfoModal
                    className="full"
                    visible
                    appId={appId}
                    worksheetId={dataSource}
                    viewId={viewId}
                    rowId={previewRecord && previewRecord.recordId}
                    onClose={() => {
                      this.setState({ previewRecord: undefined });
                      if (_.isFunction(control.refreshRecord)) {
                        control.refreshRecord();
                      }
                    }}
                  />
                ) : (
                  <RecordInfoWrapper
                    visible
                    allowAdd={allowNewRecord}
                    appId={appId}
                    viewId={advancedSetting.openview || control.viewId}
                    from={1}
                    hideRecordInfo={() => {
                      this.setState({ previewRecord: undefined });
                      if (_.isFunction(control.refreshRecord)) {
                        control.refreshRecord();
                      }
                    }}
                    projectId={projectId}
                    recordId={previewRecord && previewRecord.recordId}
                    worksheetId={dataSource}
                    currentSheetRows={records}
                    showPrevNext
                  />
                ))}
              {showNewRecord && (
                <NewRecordComponent
                  showFillNext
                  directAdd
                  className="worksheetRelateNewRecord"
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
            </div>
            {!disabled && !isCard && !onlyRelateByScanCode && (
              <Icon icon="arrow-right-border" className="Font16 Gray_bd" style={{ marginRight: -5 }} />
            )}
          </Con>
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
                  {/*!records.length && <i className="rightArrow icon icon-arrow-right-border Font16 Gray_bd"></i>*/}
                </div>
              </RelateScanQRCodeWrap>
            )}
          {!disabled && multiple && isCard && recordId && !isMobile && (
            <SearchRecordsButton
              icon="search"
              onClick={() => {
                searchRecordInDialog({
                  from,
                  title: controlName,
                  worksheetId,
                  controlId,
                  recordId,
                  control,
                  controls: this.controls,
                  getCoverUrl: r => this.getCoverUrl(coverCid, r),
                  viewId,
                  disabled,
                  isCharge,
                  sourceEntityName,
                  allowlink: (advancedSetting || {}).allowlink,
                  allowAdd: allowNewRecord,
                  allowRemove,
                  onNewRecord: () => {
                    this.setState({ showNewRecord: true });
                  },
                  onCardClick:
                    !allowOpenRecord || (disabled && !recordId)
                      ? () => {}
                      : r => {
                          if (from === FROM.SHARE || from === FROM.WORKFLOW) {
                            openRelateSheet('', r.wsid, r.rowid, viewId);
                          } else if (isMobile) {
                            disabled && this.setState({ previewRecord: { recordId: r.rowid } });
                          } else {
                            this.setState({ previewRecord: { recordId: r.rowid } });
                          }
                        },
                  onDelete: this.handleDelete,
                });
              }}
            />
          )}
        </OperateCon>
        {isCard && this.renderRecordsCon()}
      </Fragment>
    );
  }
}
