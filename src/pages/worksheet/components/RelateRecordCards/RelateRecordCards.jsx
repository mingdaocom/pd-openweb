import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _, { identity, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import sheetAjax from 'src/api/worksheet';
import { RecordInfoModal as MobileRecordInfoModal } from 'mobile/Record';
import { WithoutRows } from 'mobile/RecordList/SheetRows';
import ChildTableContext from 'worksheet/components/ChildTable/ChildTableContext';
import RelateRecordDropdown from 'worksheet/components/RelateRecordDropdown';
import { completeControls, replaceControlsTranslateInfo } from 'worksheet/util';
import RelateScanQRCode from 'src/components/newCustomFields/components/RelateScanQRCode';
import { getIsScanQR } from 'src/components/newCustomFields/components/ScanQRCode';
import { FROM } from 'src/components/newCustomFields/tools/config';
import { controlState, getTitleTextFromRelateControl } from 'src/components/newCustomFields/tools/utils';
import { selectRecord } from 'src/components/recordCardListDialog';
import { mobileSelectRecord } from 'src/components/recordCardListDialog/mobile';
import MobileNewRecord from 'src/pages/worksheet/common/newRecord/MobileNewRecord';
import NewRecord from 'src/pages/worksheet/common/newRecord/NewRecord';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { searchRecordInDialog } from 'src/pages/worksheet/components/SearchRelateRecords';
import { addBehaviorLog, browserIsMobile, getTranslateInfo, handlePushState, handleReplaceState } from 'src/util';
import RegExpValidator from 'src/util/expression';
import RecordCoverCard from './RecordCoverCard';
import RecordTag from './RecordTag';

const MAX_COUNT = 200;

const CARD_MIN_WIDTH = 360;
const CARDS_GAP = 16;

const RecordsCon = styled.div`
  ${({ width }) => (width > 700 ? 'display: grid;' : '')}
  grid-gap: ${CARDS_GAP}px;
  grid-template-columns: repeat(auto-fit, minmax(${CARD_MIN_WIDTH}px, 1fr));
`;

export const Button = styled.div`
  cursor: pointer;
  height: 36px;
  font-weight: bold;
  padding: 0 16px;
  display: flex;
  align-items: center;
  color: #151515;
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

const Con = styled.div(
  ({ isMobile, autoHeight, isCard, showAddAsDropdown }) =>
    `${showAddAsDropdown ? 'width: 100% !important;' : ''}
  ${
    isMobile
      ? `
    ${autoHeight ? 'height: auto !important;' : ''}
    ${isCard && !showAddAsDropdown ? '' : 'align-items: center;'}
  `
      : `
  ${autoHeight ? 'height: auto !important;' : ''}
  padding: 0px !important;
`
  }`,
);

const OperateCon = styled.div`
  &:has(.content:empty) {
    margin-top: -10px;
  }
`;

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

const WithoutRowsWrap = styled.div`
  background-color: #f8f8f8;
`;

export function getCardColNum({ width, isMobile, enumDefault, records }) {
  let colNum = 1;
  if (!isMobile || enumDefault === 1) {
    colNum = Math.floor((width + CARDS_GAP) / (CARD_MIN_WIDTH + CARDS_GAP));
  }
  if (colNum === 0 || isMobile) {
    colNum = 1;
  }
  return colNum;
}

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
      (browserIsMobile() &&
        _.includes(['2', '5'], _.get(control, 'advancedSetting.showtype')) &&
        _.includes([FROM.H5_EDIT, FROM.RECORDINFO, FROM.DRAFT], control.from) &&
        !_.get(this, 'props.control.hasDefaultValue'))
    ) {
      this.loadMoreRecords(1);
    }

    window.addEventListener('popstate', this.onQueryChange);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.onQueryChange);
  }

  componentWillReceiveProps(nextProps) {
    const control = nextProps.control || {};
    if (this.props.control.dataSource !== nextProps.control.dataSource) {
      const {
        control: { relationControls = [], showControls = [] },
      } = nextProps;
      const hasRelateControl = this.hasRelateControl(relationControls, showControls);
      if (hasRelateControl || (browserIsMobile() && _.includes([FROM.H5_EDIT, FROM.RECORDINFO], control.from))) {
        this.setState({ sheetTemplateLoading: true });
        this.loadControls(nextProps);
      }
    }
    if (nextProps.flag !== this.props.flag) {
      if (
        (_.get(window, 'shareState.isPublicForm') &&
          _.includes(['2', '5', '6'], _.get(this, 'props.control.advancedSetting.originShowType'))) ||
        (browserIsMobile() &&
          _.includes(['2', '5'], _.get(control, 'advancedSetting.showtype')) &&
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

  get showAddAsDropdown() {
    const { control = {} } = this.props;
    const { choosetype = '2' } = control.advancedSetting || {};
    const { enumDefault2 } = control;
    return browserIsMobile() && choosetype === '1' && enumDefault2 !== 10 && enumDefault2 !== 11;
  }

  get mobileShowAddAsDropdown() {
    const { control = {} } = this.props;
    const { showtype = '2', enumDefault } = control.advancedSetting || {};
    const chooseShowIds = safeParse(control.advancedSetting.chooseshowids, 'array');
    const multiple = enumDefault === 2;
    let showCards = !multiple && !!chooseShowIds.length;
    const isMobile = browserIsMobile();

    return isMobile && showtype === '3' && showCards;
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
    if (!this.state.previewRecord) return;
    const recordId = _.get(this.props, 'control.recordId');
    handleReplaceState('page', `relateRecord-${recordId}`, () => this.setState({ previewRecord: undefined }));
  };

  getCoverUrl(coverId, record) {
    const { controls } = this.state;
    const coverControl = _.find(controls, c => c.controlId && c.controlId === coverId);
    if (!coverControl) {
      return;
    }
    try {
      const coverFile = _.find(JSON.parse(record[coverId]), file => RegExpValidator.fileIsPicture(file.ext));
      const { previewUrl = '' } = coverFile;
      return previewUrl.indexOf('imageView2') > -1
        ? previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/2/w/200')
        : `${previewUrl}&imageView2/2/w/200`;
    } catch (err) {}
    return;
  }

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
    const { from, controlId, recordId, worksheetId, advancedSetting, instanceId, workId } = (nextProps || this.props)
      .control;
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
      })
      .then(res => {
        this.setState(state => {
          const newRecords = _.uniqBy([...state.records, ...res.data], 'rowid');
          const newState = {
            records: newRecords,
            pageIndex,
            isLoadingMore: false,
            showLoadMore: newRecords.length < res.count && res.data.length > 0,
          };
          if (
            browserIsMobile() &&
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
    } else if (this.allowNewRecord) {
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
      isCharge: isCharge,
      masterRecordRowId: recordId,
      relateSheetId: dataSource,
      parentWorksheetId: worksheetId,
      filterRelatesheetControlIds: [controlId],
      defaultRelatedSheet: this.getDefaultRelateSheetValue(),
      controlId: controlId,
      onOk: onOk,
      formData: formData,
      isDraft,
      ...(browserIsMobile() && !isCard && !showCoverAndControls
        ? { showControls: [], control: { ...control, showControls: [] } }
        : {}),
    };
    (browserIsMobile() ? mobileSelectRecord : selectRecord)(Object.assign(selectOptions, options));
  }

  renderRecordsCon() {
    const { width, control, allowOpenRecord, hideTitle, cardClassName } = this.props;
    const {
      appId,
      viewId,
      from,
      recordId,
      projectId,
      dataSource,
      disabled,
      enumDefault,
      coverCid,
      openRelateSheet,
      advancedSetting,
      isCharge,
      sheetSwitchPermit,
    } = control;
    const sourceEntityName = getTranslateInfo(appId, null, dataSource).recordName || control.sourceEntityName;
    const { allowReplaceRecord, isCard } = this;
    const { records, showAll, showLoadMore, isLoadingMore, pageIndex } = this.state;
    const allowlink = (advancedSetting || {}).allowlink;
    const controlPermission = controlState(control, from);
    const allowRemove =
      (control.advancedSetting.allowcancel !== '0' || enumDefault === 1) && controlPermission.editable;
    const isMobile = browserIsMobile();
    const colNum = getCardColNum({ width, isMobile, enumDefault, records });
    if (isCard || this.mobileShowAddAsDropdown) {
      return (
        <RecordsCon
          width={width}
          className={cx('recordsCon mBottom6', {
            'pLeft10 pRight10':
              isMobile &&
              _.includes([FROM.H5_EDIT, FROM.RECORDINFO, FROM.DRAFT], from) &&
              advancedSetting.showtype === '2',
            Block: isMobile,
          })}
        >
          {!!records.length &&
            (showAll || records.length <= colNum * 3 ? records : records.slice(0, colNum * 3)).map((record, i) => (
              <RecordCoverCard
                className={cardClassName + (width > 700 ? '' : ' mBottom10')}
                hideTitle={hideTitle || (this.mobileShowAddAsDropdown && !disabled)}
                showAddAsDropdown={this.showAddAsDropdown}
                containerWidth={width}
                from={from}
                projectId={projectId}
                viewId={viewId}
                allowReplaceRecord={allowReplaceRecord}
                disabled={disabled || (!allowRemove && !record.isNewAdd)}
                isCharge={isCharge}
                key={i}
                controls={this.controls}
                sheetSwitchPermit={sheetSwitchPermit}
                data={record}
                cover={this.getCoverUrl(coverCid, record)}
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
            ))}
          {records.length > colNum * 3 && (
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
        </RecordsCon>
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
    const isMobile = browserIsMobile();

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
                      handlePushState('page', `relateRecord-${recordId}`);
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
  };

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
      relationControls,
      controlName,
      dataSource,
      disabled,
      enumDefault,
      enumDefault2,
      strDefault,
      showControls = [],
      coverCid,
      formData,
      sheetSwitchPermit,
      advancedSetting = {},
      isCharge,
      hint,
      openRelateSheet,
      showRelateRecordEmpty,
      isDraft,
      sourceBtnName,
    } = control;
    const sourceEntityName = getTranslateInfo(appId, null, dataSource).recordName || control.sourceEntityName;
    const { records, previewRecord, showNewRecord, sheetTemplateLoading, enablePayment } = this.state;
    const {
      onlyRelateByScanCode,
      disabledManualWrite,
      addRelationButtonVisible,
      isCard,
      allowNewRecord,
      showAddAsDropdown,
      mobileShowAddAsDropdown,
    } = this;
    const isMobile = browserIsMobile();
    const isScanQR = getIsScanQR();
    const multiple = enumDefault === 2;
    if (sheetTemplateLoading) {
      return null;
    }
    const filterControls = getFilter({ control, formData });
    const NewRecordComponent = isMobile ? MobileNewRecord : NewRecord;
    const controlPermission = controlState(control, from);
    const allowRemove = control.advancedSetting.allowcancel !== '0' || enumDefault === 1;
    const { searchcontrol } = advancedSetting;
    const renderHint = () => {
      if (disabledManualWrite) {
        return _l('扫码添加%0', sourceEntityName);
      } else if (isMobile && hint) {
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

    return (
      <Fragment>
        <OperateCon
          className={cx('flexRow valignWrapper mBottom10', {
            'pLeft20 pRight20 mobileCreateRelateBtn':
              isMobile &&
              _.includes([FROM.H5_EDIT, FROM.RECORDINFO, FROM.DRAFT], from) &&
              advancedSetting.showtype === '2',
          })}
          isMobile={isMobile}
        >
          <Con
            className={cx(
              'customFormControlBox flexRow relateRecordBtn',
              { formBoxNoBorder: isCard && !(isMobile && showAddAsDropdown) },
              {
                controlDisabled:
                  disabled || (addRelationButtonVisible && !isCard && !records.length && disabledManualWrite),
                pTop0: isMobile,
              },
            )}
            isMobile={isMobile}
            autoHeight={!!records.length}
            isCard={isCard}
            showAddAsDropdown={showAddAsDropdown}
            onClick={e =>
              !disabled &&
              (!isCard || (isCard && isMobile && showAddAsDropdown)) &&
              !disabledManualWrite &&
              this.handleClick(e)
            }
          >
            <div className="flex content" style={{ minWidth: 0 }}>
              {addRelationButtonVisible && (
                <Fragment>
                  {isCard ? (
                    ((enumDefault2 !== 10 && enumDefault2 !== 11) || allowNewRecord) &&
                    (showAddAsDropdown && !isMobile && !multiple && records.length <= 1 ? (
                      <RelateRecordDropdown
                        appId={appId}
                        control={control}
                        formData={formData}
                        disabled={disabled || !controlPermission.editable}
                        selected={records}
                        from={from}
                        viewId={viewId}
                        recordId={recordId}
                        dataSource={dataSource}
                        entityName={sourceEntityName}
                        enumDefault2={enumDefault2}
                        parentWorksheetId={worksheetId}
                        controlId={controlId}
                        controls={relationControls}
                        multiple={multiple}
                        coverCid={advancedSetting.choosecoverid}
                        showControls={safeParse(advancedSetting.chooseshowids, 'array')}
                        allowOpenRecord={advancedSetting.allowlink === '1'}
                        showCoverAndControls={advancedSetting.chooseddset === '1'}
                        onChange={newRecords => {
                          if (isEmpty(newRecords)) {
                            this.handleDelete(records[0]);
                          } else {
                            this.handleAdd(newRecords);
                          }
                        }}
                      />
                    ) : isMobile && showAddAsDropdown ? (
                      this.renderDropDownRecordsCon()
                    ) : (
                      <Button className="relateRecordBtn" onClick={this.handleClick}>
                        <i className="icon icon-plus mRight5 Font16"></i>
                        {sourceBtnName || sourceEntityName || ''}
                      </Button>
                    ))
                  ) : !records.length ? (
                    <span className="Gray_bd">{renderHint()}</span>
                  ) : null}
                </Fragment>
              )}
              {disabledManualWrite && !isScanQR && (
                <div className="Gray_9e mBottom5 mTop5 pTop3 pBottom3">{_l('请在移动端扫码添加关联')}</div>
              )}
              {!isCard && (mobileShowAddAsDropdown ? this.renderDropDownRecordsCon() : this.renderRecordsCon())}
              {from !== FROM.PUBLIC_ADD &&
                !!previewRecord &&
                (isMobile ? (
                  <MobileRecordInfoModal
                    className="full"
                    visible
                    appId={appId}
                    worksheetId={dataSource}
                    viewId={advancedSetting.openview || control.viewId}
                    rowId={previewRecord && previewRecord.recordId}
                    from={from === FROM.DRAFT ? 3 : 1}
                    disableOpenRecordFromRelateRecord={
                      _.get(window, 'shareState.isPublicRecord') || _.get(window, 'shareState.isPublicView')
                    }
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
                    disableOpenRecordFromRelateRecord={
                      _.get(window, 'shareState.isPublicRecord') || _.get(window, 'shareState.isPublicView')
                    }
                    allowAdd={allowNewRecord}
                    appId={appId}
                    viewId={advancedSetting.openview || control.viewId}
                    from={from === FROM.DRAFT ? 3 : 1}
                    hideRecordInfo={() => {
                      this.setState({ previewRecord: undefined });
                      if (_.isFunction(control.refreshRecord)) {
                        control.refreshRecord();
                      }
                    }}
                    projectId={projectId}
                    recordId={previewRecord && previewRecord.recordId}
                    worksheetId={dataSource}
                    relationWorksheetId={worksheetId}
                    currentSheetRows={records}
                    showPrevNext
                    enablePayment={enablePayment}
                    isRelateRecord={true}
                    isDraft={isDraft}
                  />
                ))}
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
            </div>
            {!disabled && (!isCard || (isCard && isMobile && showAddAsDropdown)) && !onlyRelateByScanCode && (
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
        {(isCard || mobileShowAddAsDropdown) && this.renderRecordsCon()}
      </Fragment>
    );
  }
}

export default autoSize(RelateRecordCards, { onlyWidth: true });
