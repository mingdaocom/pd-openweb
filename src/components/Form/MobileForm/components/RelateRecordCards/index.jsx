import React, { Component, Fragment } from 'react';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import _, { identity } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Skeleton } from 'ming-ui/antd-components';
import autoSize from 'ming-ui/components/AutoSize';
import sheetAjax from 'src/api/worksheet';
import { mobileSelectRecord } from 'mobile/components/RecordCardListDialog';
import { RecordInfoModal as MobileRecordInfoModal } from 'mobile/Record';
import { WithoutRows } from 'mobile/RecordList/SheetRows';
import ChildTableContext from 'worksheet/components/ChildTable/ChildTableContext';
import { FROM } from 'src/components/Form/core/config';
import { getIsScanQR } from 'src/components/Form/MobileForm/components/ScanQRCode';
import MobileNewRecord from 'src/pages/worksheet/common/newRecord/MobileNewRecord';
import { getTitleTextFromRelateControl } from 'src/utils/domain/control/display';
import { completeControls, controlState } from 'src/utils/domain/control/state';
import { withKeepShowRowIds } from 'src/utils/domain/control/value';
import { getFilter } from 'src/utils/domain/worksheet/filterDynamic';
import { filterRowsByKeywords } from 'src/utils/domain/worksheet/record';
import { getTranslateInfo } from 'src/utils/services/app';
import { addBehaviorLog } from 'src/utils/services/project';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { replaceControlsTranslateInfo } from 'src/utils/services/translation/app';
import { getViewportSize } from '../../tools/viewport';
import ChildTableFlatComp from '../ChildTable/ChildTableFlatComp';
import MobileTable from '../ChildTable/MobileTable';
import SearchInput from '../ChildTable/SearchInput';
import { TableComponent } from '../ChildTable/TableComponent';
import RelateScanQRCode from '../RelateScanQRCode';
import MobileRelateTreeTable from './MobileRelateTreeTable';
import { MOBILE_TABLE_SHOW_TYPES, shouldLoadInitialRecords, shouldReloadInitialRecords } from './recordLoading';
import RecordTag from './RecordTag';

const MAX_COUNT = 200;
const LIST_LOAD_PAGE_SIZE = 200;
const LIST_MAX_LOAD_COUNT = 1000;
const TABLE_PAGE_SIZE = 20;

const isPortraitOrientation = () => {
  const orientation = _.get(window, 'screen.orientation.type');

  if (orientation) {
    return orientation.startsWith('portrait');
  }

  if (_.isNumber(window.orientation)) {
    return Math.abs(window.orientation) !== 90;
  }

  return window.innerWidth <= window.innerHeight;
};

const MultiRecordLoading = () => (
  <div style={{ padding: 10 }}>
    <Skeleton
      className="pAll20"
      active
      paragraph={{
        rows: 4,
        width: ['30%', '40%', '90%', '60%'],
      }}
    />
  </div>
);

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
    color: var(--color-primary);
    width: 100%;
    .scanIcon {
      color: var(--color-primary) !important;
      margin-right: 5px;
    }
    .scanButton {
      width: 100%;
    }
  }
  .scanButton {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-border-primary);
    border-radius: 3px;
  }
`;

const InitialSingleOperateWrap = styled.div`
  gap: 8px;
`;

const WithoutRowsWrap = styled.div`
  position: absolute;
  inset: 0;
  background-color: var(--color-background-secondary);
`;

const RecordTagsWrap = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const OperateWrap = styled.div`
  justify-content: flex-end;
  align-items: center;
  height: 36px;
  margin: ${({ $showAddButton }) => ($showAddButton ? '12px 0' : '6px 0')};
  ${({ $expanded, $separate }) =>
    $expanded || $separate
      ? ''
      : `
        margin-top: -6px;
        position: absolute;
        top: -34px;
      `}

  .editOperateBtns {
    gap: 8px;
    margin-right: auto;
  }

  .treeTabAddingIcon {
    display: inline-block;
    animation: rotate 1.2s linear infinite;
  }

  .operateBtnBox {
    display: flex;
    align-items: center;

    .icon {
      font-size: 20px;
      color: var(--color-text-tertiary);
    }
    .themeIcon {
      color: var(--color-primary);
    }
  }
`;

const RelateRecordRoot = styled.div`
  position: relative;

  .relateDropdownControls {
    gap: 8px;
  }
`;

const HorizontalRelateTableContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: ${props => (props.$height ? `${props.$height}px` : '100%')};
  width: ${props => (props.$width ? `${props.$width}px` : '100%')};
  overflow: hidden;
  box-sizing: border-box;
  background: var(--color-background-primary);
  ${props =>
    props.$isHorizontalPortrait &&
    `
      transform: rotate(90deg);
      transform-origin: top left;
      left: ${props.$height}px;
    `}
  ${props =>
    props.$isHorizontal &&
    !props.$isHorizontalPortrait &&
    `
      padding-left: constant(safe-area-inset-left);
      padding-left: env(safe-area-inset-left);
      padding-right: constant(safe-area-inset-right);
      padding-right: env(safe-area-inset-right);
      max-height: 100dvh;
      max-width: 100dvw;
    `}

  .expandChildTableHeader {
    padding: 16px 16px 0;
    align-items: center;

    .mobileSearchInputComp.inputBlur {
      background-color: transparent !important;
    }
  }

  .horizontalScrollContent {
    flex: 1;
    min-height: 0;
    padding: 0 16px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: var(--color-text-disabled) transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--color-text-disabled);
      border-radius: 6px;
    }
  }

  .horizontalTableContent {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    > .mobileChildTableCon {
      flex: 1;
      min-height: 0 !important;
      margin-bottom: 0;
    }
  }

  .expandChildTableCon {
    overflow-x: hidden;
    overflow-y: auto;
  }
`;

const RowHeightPopupContent = styled.div`
  padding: 0 16px 12px;

  .header {
    width: 100%;
    line-height: 24px;
    padding: 16px 0 10px;
    justify-content: space-between;
  }

  .closeIcon {
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 50%;
    background: var(--color-border-secondary);
  }

  .rowHeightItem {
    min-height: 44px;
  }
`;

const RelateFlatCardWrap = styled.div`
  position: relative;

  .expandAll {
    display: none;
  }

  &.hasActions {
    .rowHeader {
      padding-right: 64px !important;
    }
  }

  .flatCardActions {
    position: absolute;
    top: -9px;
    right: -9px;
    z-index: 1;
    display: flex;
    gap: 8px;

    .flatCardAction {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      font-size: 26px;
      color: var(--color-text-tertiary);
    }
  }
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
      formData: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.shape({})), PropTypes.func]),
      getCurrentFormData: PropTypes.func,
    }),
    records: PropTypes.arrayOf(PropTypes.shape({})),
    relationActionRows: PropTypes.arrayOf(PropTypes.shape({})),
    relationActionCount: PropTypes.number,
    relationActionControlId: PropTypes.string,
    relationActionParams: PropTypes.shape({}),
    updateActionParams: PropTypes.func,
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

    this.treeTabRemovePendingIds = new Set();
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
      loading: shouldLoadInitialRecords(props),
      pageIndex: 1,
      tablePageIndex: 1,
      showExpand: false,
      expandShowType: 'current',
      showRowHeightModal: false,
      h5height: advancedSetting.h5height || '0',
      viewportSize: getViewportSize(),
      isPortraitOrientation: isPortraitOrientation(),
      treeParentRecord: null,
      treeTabAdding: false,
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
      (_.includes(MOBILE_TABLE_SHOW_TYPES, _.get(control, 'advancedSetting.showtype')) &&
        _.includes([FROM.H5_EDIT, FROM.RECORDINFO, FROM.DRAFT], control.from) &&
        !_.get(this, 'props.control.hasDefaultValue'))
    ) {
      this.loadMoreRecords(1);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps !== this.props) {
      const control = this.props.control || {};
      const exitedBatchOperate =
        _.get(prevProps, 'relationActionParams.isEdit') && !_.get(this.props, 'relationActionParams.isEdit');
      const relationActionRowsChanged =
        this.props.relationActionControlId === control.controlId &&
        !_.isEqual(this.props.relationActionRows, prevProps.relationActionRows);
      const loadsRecordsFromApi = shouldLoadInitialRecords(this.props);
      const shouldIgnoreTransientEmptyRecords =
        loadsRecordsFromApi && _.isEmpty(this.props.records) && !_.isEmpty(this.state.records);
      const shouldReloadRecords = shouldReloadInitialRecords(prevProps, this.props);

      if (prevProps.control.dataSource !== this.props.control.dataSource) {
        const {
          control: { relationControls = [], showControls = [] },
        } = this.props;
        const hasRelateControl = this.hasRelateControl(relationControls, showControls);

        if (hasRelateControl || _.includes([FROM.H5_EDIT, FROM.RECORDINFO], control.from)) {
          this.setState({
            sheetTemplateLoading: true,
          });
          this.loadControls(this.props);
        }
      }

      if (this.props.flag !== prevProps.flag) {
        if (shouldReloadRecords) {
          this.setState(
            {
              records: [],
              count: 0,
              addedIds: [],
              deletedIds: [],
              loading: true,
              tablePageIndex: 1,
            },
            () => this.loadMoreRecords(1, this.props),
          );
        } else {
          this.setState({
            records: this.props.records,
            count: this.props.count,
            addedIds: [],
            deletedIds: [],
            loading: false,
            tablePageIndex: 1,
          });

          if (_.get(this, 'props.control.isSubList')) {
            if (this.props.records.length < this.props.count) {
              this.loadMoreRecords(1, this.props);
            }
          }
        }
      }

      if (exitedBatchOperate && shouldLoadInitialRecords(this.props)) {
        this.setState(
          {
            records: [],
            count: 0,
            loading: true,
            tablePageIndex: 1,
          },
          () => this.loadMoreRecords(1, this.props),
        );
      }

      if (relationActionRowsChanged) {
        const removedRowIds = exitedBatchOperate
          ? _.get(prevProps, 'relationActionParams.selectedRecordIds') || []
          : [];

        this.setState(state => ({
          records: _.uniqBy(
            (this.props.relationActionRows || []).concat(
              state.records.filter(row => !removedRowIds.includes(row.rowid)),
            ),
            'rowid',
          ),
          count: this.props.relationActionCount,
          loading: false,
          tablePageIndex: 1,
        }));
      }

      if (
        !shouldIgnoreTransientEmptyRecords &&
        !relationActionRowsChanged &&
        !_.isEqual(this.props.records, prevProps.records)
      ) {
        this.setState({
          records: this.props.records,
          count: this.props.count,
          ...(shouldReloadRecords ? {} : { loading: false }),
          tablePageIndex: 1,
        });
      }

      const { pageIndex, showLoadMore, isLoadingMore } = this.state;

      if (this.props.loadMoreRelateCards && !isLoadingMore && showLoadMore) {
        this.loadMoreRecords(pageIndex + 1);
      }
    }

    if (!prevState.showExpand && this.state.showExpand) {
      this.addViewportResizeListener();
      this.updateViewportSize();
    } else if (prevState.showExpand && !this.state.showExpand) {
      this.removeViewportResizeListener();
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.removeViewportResizeListener();
    clearTimeout(this.viewportResizeTimer);
  }

  addViewportResizeListener = () => {
    window.addEventListener('resize', this.handleViewportResize);
    window.addEventListener('orientationchange', this.handleViewportResize);
    window.visualViewport && window.visualViewport.addEventListener('resize', this.handleViewportResize);
  };

  removeViewportResizeListener = () => {
    window.removeEventListener('resize', this.handleViewportResize);
    window.removeEventListener('orientationchange', this.handleViewportResize);
    window.visualViewport && window.visualViewport.removeEventListener('resize', this.handleViewportResize);
  };

  handleViewportResize = () => {
    clearTimeout(this.viewportResizeTimer);
    this.viewportResizeTimer = setTimeout(this.updateViewportSize, 100);
  };

  updateViewportSize = () => {
    const viewportSize = getViewportSize();
    const portrait = isPortraitOrientation();

    if (_.isEqual(viewportSize, this.state.viewportSize) && portrait === this.state.isPortraitOrientation) return;
    this.setState({ viewportSize, isPortraitOrientation: portrait });
  };

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
    const { control = {} } = this.props;
    const advancedSetting = control.advancedSetting || {};
    return parseInt(advancedSetting.showtype, 10) === 1;
  }

  get isMobileTable() {
    const { control = {} } = this.props;
    const { advancedSetting = {}, enumDefault } = control;
    const showtype = parseInt(advancedSetting.originShowType || advancedSetting.showtype, 10);

    return enumDefault === 2 && _.includes([2, 5, 6], showtype);
  }

  get isRealCard() {
    const { control = {} } = this.props;
    const advancedSetting = control.advancedSetting || {};
    return advancedSetting.showtype === '1' && !this.isMobileTable;
  }

  get showAddAsDropdown() {
    const { control = {} } = this.props;
    const { showtype } = control.advancedSetting || {};
    const { enumDefault2 } = control;
    return showtype === '3' && enumDefault2 !== 10 && enumDefault2 !== 11;
  }

  get mobileShowAddAsDropdown() {
    const { control = {} } = this.props;
    const { advancedSetting = {}, enumDefault } = control;
    const { showtype = '2' } = advancedSetting;
    const chooseShowIds = safeParse(advancedSetting.chooseshowids, 'array');
    const multiple = enumDefault === 2;
    let showCards = !multiple && !!chooseShowIds.length;

    return showtype === '3' && showCards;
  }

  get addRelationButtonVisible() {
    const { control = {}, formDisabled } = this.props;
    const { from, disabled, enumDefault, enumDefault2 } = control;
    const { records = [] } = this.state;
    const controlPermission = controlState(control, from);
    const isTreeTable = this.isMobileTable && !!_.get(control, 'advancedSetting.layercontrolid');
    const allowTreeTabAdd = isTreeTable && control.showRelateRecordEmpty;

    return (
      (!records.length || enumDefault === 2 || this.showAddAsDropdown) &&
      from !== FROM.SHARE &&
      enumDefault2 !== 11 &&
      (this.isCard || this.isMobileTable ? !this.disabledManualWrite : true) &&
      (!disabled && !formDisabled ? true : allowTreeTabAdd) &&
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
      (this.isCard || this.isMobileTable ? !this.disabledManualWrite : true) &&
      !disabled
    );
  }

  get allowNewRecord() {
    const { control = {}, editable } = this.props;
    return editable && control.enumDefault2 !== 1 && control.enumDefault2 !== 11 && !window.isPublicWorksheet;
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

  loadMoreRecords = (pageIndex = 2, nextProps, callback, loadedCount = 0, batchRequestId) => {
    const { formDisabled } = this.props;
    const nextControl = (nextProps || this.props).control;
    const {
      from,
      controlId,
      recordId,
      worksheetId,
      advancedSetting = {},
      instanceId,
      workId,
      disabled,
      enumDefault,
    } = nextControl;
    const showtype = parseInt(advancedSetting.originShowType || advancedSetting.showtype, 10);
    const isTreeTable = !!advancedSetting.layercontrolid;
    const h5showtype = isTreeTable ? '1' : String(advancedSetting.h5showtype || '2');
    const isListStyle =
      enumDefault === 2 && _.includes(MOBILE_TABLE_SHOW_TYPES, String(showtype)) && h5showtype === '1';
    const pageSize = isListStyle ? LIST_LOAD_PAGE_SIZE : 50;
    const { keywords } = this.state;
    const requestId = batchRequestId || (this.loadRecordsRequestId || 0) + 1;

    if (!batchRequestId) {
      this.loadRecordsRequestId = requestId;
    }

    this.setState({
      isLoadingMore: true,
      loading: isListStyle || pageIndex === 1,
    });
    sheetAjax
      .getRowRelationRows({
        worksheetId,
        rowId: recordId,
        controlId,
        pageIndex,
        pageSize,
        getType: from === FROM.DRAFT ? from : undefined,
        instanceId,
        workId,
        keywords,
      })
      .then(res => {
        if (requestId !== this.loadRecordsRequestId) return;

        this.setState(
          state => {
            const data = _.get(res, 'data') || [];
            const shouldReset = (disabled || formDisabled) && pageIndex === 1;
            const mergedRecords = shouldReset ? data : _.uniqBy([...state.records, ...data], 'rowid');
            const newRecords = isListStyle ? mergedRecords.slice(0, LIST_MAX_LOAD_COUNT) : mergedRecords;
            const nextLoadedCount = loadedCount + data.length;
            const shouldContinueLoading = isListStyle && data.length > 0 && nextLoadedCount < res.count;

            const newState = {
              records: newRecords,
              pageIndex,
              isLoadingMore: shouldContinueLoading,
              loading: shouldContinueLoading,
              showLoadMore:
                newRecords.length < Math.min(res.count, isListStyle ? LIST_MAX_LOAD_COUNT : res.count) &&
                data.length > 0,
            };

            if (
              _.includes(MOBILE_TABLE_SHOW_TYPES, _.get(advancedSetting, 'showtype')) &&
              _.includes([FROM.H5_EDIT, FROM.RECORDINFO, FROM.DRAFT], from)
            ) {
              newState.count = res.count;
            }

            return newState;
          },
          () => {
            const data = _.get(res, 'data') || [];
            const nextLoadedCount = loadedCount + data.length;

            if (isListStyle && data.length > 0 && nextLoadedCount < res.count) {
              this.loadMoreRecords(pageIndex + 1, nextProps, callback, nextLoadedCount, requestId);
              return;
            }

            if (_.isFunction(callback)) {
              callback();
            }
          },
        );
      });
  };

  loadAllRecords = () => {
    const { isLoadingMore, pageIndex, showLoadMore } = this.state;

    if (isLoadingMore || !showLoadMore) return;

    this.loadMoreRecords(pageIndex + 1, undefined, this.loadAllRecords);
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

  removeRecordFromState = (deletedRecord, { directSaved = false } = {}) => {
    this.setState(
      ({ count, records, addedIds, deletedIds, tablePageIndex }) => {
        const hasRecord = !!_.find(records, { rowid: deletedRecord.rowid });
        const nextCount = Math.max(count - (hasRecord ? 1 : 0), 0);

        return {
          deletedIds: directSaved
            ? deletedIds
            : _.includes(addedIds, deletedRecord.rowid)
              ? deletedIds
              : _.uniq(deletedIds.concat(deletedRecord.rowid)),
          records: records
            .filter(r => r.rowid !== deletedRecord.rowid)
            .map(row => {
              const childrenIds = safeParse(row.childrenids, 'array');

              return {
                ...row,
                pid: row.pid === deletedRecord.rowid ? '' : row.pid,
                ...(childrenIds.includes(deletedRecord.rowid)
                  ? { childrenids: JSON.stringify(childrenIds.filter(rowid => rowid !== deletedRecord.rowid)) }
                  : {}),
              };
            }),
          addedIds: addedIds.filter(id => id !== deletedRecord.rowid),
          count: nextCount,
          tablePageIndex: Math.min(tablePageIndex, Math.max(Math.ceil(nextCount / TABLE_PAGE_SIZE), 1)),
        };
      },
      directSaved ? undefined : this.handleChange,
    );
  };

  handleDelete = deletedRecord => {
    if (!this.shouldDirectSaveTreeTab()) {
      this.removeRecordFromState(deletedRecord);
      return;
    }

    if (this.treeTabRemovePendingIds.has(deletedRecord.rowid)) return;

    const { control } = this.props;
    const { appId, viewId, worksheetId, recordId, controlId, instanceId, workId, from } = control;

    this.treeTabRemovePendingIds.add(deletedRecord.rowid);
    return sheetAjax
      .updateRowRelationRows({
        appId,
        viewId,
        worksheetId,
        rowId: recordId,
        controlId,
        isAdd: false,
        rowIds: [deletedRecord.rowid],
        instanceId,
        workId,
        updateType: from === FROM.DRAFT ? from : undefined,
      })
      .then(result => {
        if (result === true || _.get(result, 'isSuccess')) {
          if (!this.unmounted) {
            this.removeRecordFromState(deletedRecord, { directSaved: true });
            alert(_l('取消关联成功！'));
          }

          return;
        }

        alert(_l('取消关联失败！'), 2);
      })
      .catch(_requestError => alertIfNotUnauthorized(_requestError, _l('取消关联失败！'), 2))
      .finally(() => this.treeTabRemovePendingIds.delete(deletedRecord.rowid));
  };

  handleClear = () => {
    const { records, addedIds, deletedIds } = this.state;
    const recordIds = records.map(r => r.rowid);
    const changes = {
      deletedIds: _.uniq(deletedIds.concat(recordIds)),
      records: [],
      addedIds: addedIds.filter(id => !_.includes(recordIds, id)),
      count: 0,
      tablePageIndex: 1,
    };
    this.setState(changes, this.handleChange);
  };

  deleteAllRecord = cb => {
    const { records, addedIds, deletedIds } = this.state;
    const recordIds = records.map(r => r.rowid);
    const changes = {
      deletedIds: _.uniq(deletedIds.concat(recordIds)),
      records: [],
      addedIds: addedIds.filter(id => !_.includes(recordIds, id)),
      count: 0,
      tablePageIndex: 1,
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

  addRecordsToState = (newAdded, { directSaved = false } = {}) => {
    const { multiple } = this.props;
    const { isRealCard } = this;
    const preparedRecords = newAdded.map(r => ({ ...r, isNewAdd: !directSaved }));
    this.setState(
      ({ count, records, addedIds = [], deletedIds = [] }) => {
        const recordsToAdd = isRealCard ? preparedRecords.slice(0, MAX_COUNT - count) : preparedRecords;
        const addedRecords = recordsToAdd.filter(record => !_.find(records, { rowid: record.rowid }));
        const nextRecords = multiple ? _.uniqBy(recordsToAdd.concat(records), r => r.rowid) : recordsToAdd;

        if (!multiple && records.length) {
          const recordIds = records.map(r => r.rowid);

          return {
            records: nextRecords,
            count: nextRecords.length,
            deletedIds: directSaved ? deletedIds : _.uniq(deletedIds.concat(recordIds)),
            addedIds: directSaved
              ? addedIds
              : _.uniq(addedIds.filter(id => !_.includes(recordIds, id)).concat(nextRecords.map(r => r.rowid))),
            tablePageIndex: 1,
          };
        }

        return {
          records: nextRecords,
          count: count + addedRecords.length,
          addedIds: directSaved ? addedIds : addedIds.concat(addedRecords.map(r => r.rowid)),
          tablePageIndex: 1,
        };
      },
      directSaved ? undefined : this.handleChange,
    );
  };

  shouldDirectSaveTreeTab = () => {
    const { control = {} } = this.props;
    const { recordId, advancedSetting = {}, showRelateRecordEmpty } = control;
    // RecordInfo 在查看态传 FROM.RECORDINFO，在编辑态传 FROM.H5_EDIT。
    // 不能用 disabled/formDisabled 判断主记录编辑态，它们还会受控件自身权限影响。
    const isEditing = control.from === FROM.H5_EDIT;

    // 树形标签页在查看态允许新增后立即关联；编辑主记录时先留在表单状态，随主记录一起保存。
    return !!recordId && showRelateRecordEmpty && this.isMobileTable && !!advancedSetting.layercontrolid && !isEditing;
  };

  handleAdd = newAdded => {
    if (!newAdded.length) return;

    if (!this.shouldDirectSaveTreeTab()) {
      this.addRecordsToState(newAdded);
      return;
    }

    if (this.treeTabAddPending) return;

    const { control } = this.props;
    const { appId, viewId, worksheetId, recordId, controlId, instanceId, workId, from } = control;

    this.treeTabAddPending = true;
    this.setState({ treeTabAdding: true });
    sheetAjax
      .updateRowRelationRows({
        appId,
        viewId,
        worksheetId,
        rowId: recordId,
        controlId,
        isAdd: true,
        rowIds: newAdded.map(record => record.rowid),
        instanceId,
        workId,
        updateType: from === FROM.DRAFT ? from : undefined,
      })
      .then(result => {
        if (result === true || _.get(result, 'isSuccess')) {
          if (!this.unmounted) {
            this.addRecordsToState(newAdded, { directSaved: true });
            alert(_l('添加记录成功！'));
          }

          return;
        }

        alert(_l('添加记录失败！'), 2);
      })
      .catch(_requestError2 => alertIfNotUnauthorized(_requestError2, _l('添加记录失败！'), 2))
      .finally(() => {
        this.treeTabAddPending = false;
        if (!this.unmounted) {
          this.setState({ treeTabAdding: false });
        }
      });
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
      const { formData, getCurrentFormData, controlId, recordId, worksheetId } = this.props.control;
      const formDataSnapshot = typeof formData === 'function' ? formData() : formData;
      const formDataArray = _.isFunction(getCurrentFormData) ? getCurrentFormData() : formDataSnapshot;
      const titleControl = _.find(formDataArray, control => control.attribute === 1);

      if (!titleControl) {
        return;
      }

      const defaultRelatedSheetValue = {
        name: titleControl.value,
        sid: recordId,
        type: 8,
        sourcevalue: JSON.stringify({
          ..._.assign(...formDataArray.map(c => ({ [c.controlId]: c.value }))),
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
    const { enumDefault2 } = control;
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
      this.setState({ showNewRecord: true });
    }
  };

  loadTreeChildren = parentRow => {
    const { control } = this.props;
    const { worksheetId, recordId, controlId, from, instanceId, workId, isDraft } = control;

    return sheetAjax
      .getRowRelationRows({
        worksheetId,
        rowId: recordId,
        controlId,
        pageIndex: 1,
        pageSize: 200,
        fastFilters: [{ controlId: 'rowid', value: parentRow.rowid }],
        getType: from === FROM.DRAFT || isDraft ? 21 : undefined,
        instanceId,
        workId,
      })
      .then(res => {
        const children = (res.data || []).map(row => ({ ...row, pid: parentRow.rowid }));

        this.setState(state => ({
          records: _.uniqBy(state.records.concat(children), 'rowid'),
        }));
        return children;
      });
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
    const { disabledManualWrite, isCard, isMobileTable } = this;
    const selectedRowIds = records.map(r => r.rowid);
    // 自定义事件等外部清空不会把 rowid 带进 deletedIds，需并入放行名单，服务端才会返回原关联的记录
    const ignoreRowIds = withKeepShowRowIds(_.uniq(deletedIds.concat(selectedRowIds)), control);
    const selectOptions = {
      className: `mobileSelectRecordWrap-${controlId}`,
      control: control,
      recordId,
      isCharge,
      ignoreRowIds,
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
      layerId: `mobileSelectRecord-${controlId}`,
      onClear: this.handleClear,
      handleReplaceHistoryState: () => {
        this.setState({ showMobileSelectRecord: false });
      },
      ...(!isCard && !isMobileTable && !showCoverAndControls
        ? { showControls: [], control: { ...control, showControls: [] } }
        : {}),
    };
    this.setState({ showMobileSelectRecord: true });
    mobileSelectRecord(Object.assign(selectOptions, options));
  }

  renderRecordsCon({ showExpand = false, expandShowType = 'current' } = {}) {
    const { allowOpenRecord, control, formDisabled, projectId } = this.props;
    const { appId, from, recordId, dataSource, disabled, enumDefault, advancedSetting, sheetSwitchPermit } = control;
    const { allowReplaceRecord, isCard, isMobileTable } = this;
    const {
      records: sourceRecords,
      showAll,
      showLoadMore,
      isLoadingMore,
      keywords,
      pageIndex,
      tablePageIndex,
      loading,
    } = this.state;
    const controlPermission = controlState(control, from);
    const allowRemove =
      (control.advancedSetting.allowcancel !== '0' || enumDefault === 1) && controlPermission.editable;
    const mobileIsEdit = !disabled && !formDisabled;
    const isTreeTable = isMobileTable && !!advancedSetting.layercontrolid;
    const allowTreeTabAdd = isTreeTable && control.showRelateRecordEmpty;
    const records =
      mobileIsEdit && keywords
        ? filterRowsByKeywords({ rows: sourceRecords, controls: this.state.controls, keywords })
        : sourceRecords;

    if (loading) {
      if (enumDefault === 2 && (isCard || isMobileTable)) {
        return <MultiRecordLoading />;
      }

      return (
        <div className="pTop10 pBottom10">
          <LoadDiv size="small" />
        </div>
      );
    }

    const isEditableMultipleTableCard =
      enumDefault === 2 &&
      isMobileTable &&
      !isTreeTable &&
      String(advancedSetting.h5showtype || '2') === '2' &&
      mobileIsEdit;

    if (!keywords && !records.length && isEditableMultipleTableCard) {
      return null;
    }

    if (isCard || isMobileTable || this.mobileShowAddAsDropdown) {
      if (!loading && !records.length && !isMobileTable) {
        if (keywords) {
          return <div className="textTertiary mTop15 bold mBottom10">{_l('暂无记录')}</div>;
        }

        return disabled || formDisabled ? (
          <div className="textTertiary mTop15 bold mBottom10">{_l('暂无记录')}</div>
        ) : null;
      }

      const isDropdown = this.mobileShowAddAsDropdown;
      const showControls = isDropdown ? safeParse(advancedSetting.chooseshowids, 'array') : control.showControls || [];
      const titleControl =
        _.find(this.state.controls, { controlId: advancedSetting.showtitleid }) ||
        _.find(this.state.controls, { attribute: 1 });
      const controls = _.uniqBy([...this.controls, titleControl].filter(identity), 'controlId');
      // 勾选“按用户权限过滤”时与 PC 一致，只按 controlPermissions 筛选，保留原始字段状态。
      const cardControls =
        (control.strDefault || '')[0] === '1'
          ? controls.filter(c => controlState({ ...c, fieldPermission: '111' }).visible)
          : controls;
      const isMultiTable = isMobileTable;
      const isMultipleCard = isCard && enumDefault === 2;
      const forceTable = showExpand && expandShowType === 'table';
      const h5showtype =
        showExpand && expandShowType === 'table' ? '3' : isTreeTable ? '1' : advancedSetting.h5showtype || '2';
      const isMultipleCardStyle = isMultipleCard || (!isTreeTable && isMultiTable && h5showtype === '2');
      const isListStyle = !isTreeTable && isMultiTable && h5showtype === '1';
      const isTableStyle = forceTable || (isMultiTable && h5showtype === '3');
      const showRecords =
        isTreeTable ||
        isMultipleCardStyle ||
        isListStyle ||
        isTableStyle ||
        showExpand ||
        showAll ||
        records.length <= 3
          ? records
          : records.slice(0, 3);
      const h5abstractids = safeParse(advancedSetting.h5abstractids, 'array');
      const worksheetTitleControl = _.find(this.state.controls, { attribute: 1 }) || titleControl || {};
      const treeDisplayControls = h5abstractids
        .map(controlId => _.find(this.state.controls, { controlId }))
        .filter(identity)
        .filter(item => item.controlId !== worksheetTitleControl.controlId);

      const handleOpenRecord = index => {
        const record = showRecords[index];

        if (
          !record ||
          !allowOpenRecord ||
          (control.isSubList && _.get(window, 'shareState.shareId')) ||
          advancedSetting.allowlink === '0' ||
          !record.rowid ||
          /^temp/.test(record.rowid)
        ) {
          return;
        }

        addBehaviorLog('worksheetRecord', dataSource, { rowId: record.rowid });
        this.setState({ previewRecord: { recordId: record.rowid } });
      };

      const { relationActionParams = {}, updateActionParams = () => {} } = this.props;
      const { isEdit: isBatchOperate, selectedRecordIds = [] } = relationActionParams;
      const commonTableProps = {
        allowcancel: allowRemove,
        appId,
        cellErrors: {},
        control,
        controlPermission: { ...controlPermission, editable: false },
        controls,
        disabled,
        h5abstractids,
        isEdit: !keywords && mobileIsEdit && controlPermission.editable,
        isBatchOperate,
        onDelete: rowid => {
          const record = _.find(showRecords, { rowid });

          if (record) {
            this.handleDelete(record);
          }
        },
        onOpen: handleOpenRecord,
        onSelectRow: (rowId, selected) => {
          updateActionParams({
            selectedRecordIds: selected
              ? _.uniq(selectedRecordIds.concat(rowId))
              : selectedRecordIds.filter(id => id !== rowId),
          });
        },
        projectId: projectId || control.projectId,
        rows: showRecords,
        selectedRowIds: selectedRecordIds,
        sheetSwitchPermit,
        showControls,
        showExpand,
        showNumber: false,
        worksheetId: dataSource,
      };

      return (
        <div
          className={cx('mobileChildTableCon', {
            'flex flexColumn': showExpand && (isTreeTable || h5showtype === '3'),
          })}
          style={{ marginBottom: disabled ? 6 : 0 }}
        >
          {isTreeTable ? (
            <MobileRelateTreeTable
              allowAddChild={this.allowNewRecord && (mobileIsEdit || allowTreeTabAdd) && !this.state.treeTabAdding}
              allowRemove={allowRemove && (mobileIsEdit || allowTreeTabAdd)}
              appId={appId}
              control={control}
              controls={this.state.controls}
              displayControls={treeDisplayControls}
              h5height={this.state.h5height}
              isEdit={commonTableProps.isEdit}
              showExpand={showExpand}
              showHeader={!!keywords || !_.isEmpty(showRecords)}
              onAddChild={parentRow =>
                this.setState({
                  showNewRecord: true,
                  treeParentRecord: parentRow,
                })
              }
              onLoadChildren={this.loadTreeChildren}
              onOpen={row => {
                if (!allowOpenRecord || advancedSetting.allowlink === '0' || !row.rowid || /^temp/.test(row.rowid)) {
                  return;
                }

                addBehaviorLog('worksheetRecord', dataSource, { rowId: row.rowid });
                this.setState({ previewRecord: { recordId: row.rowid } });
              }}
              onRemove={this.handleDelete}
              projectId={projectId || control.projectId}
              rows={showRecords}
              sheetSwitchPermit={sheetSwitchPermit}
              titleControl={worksheetTitleControl}
              worksheetId={dataSource}
            />
          ) : isMultiTable && h5showtype === '1' ? (
            <MobileTable {...commonTableProps} isRelateRecordTable showHeader={!!keywords || !_.isEmpty(showRecords)} />
          ) : forceTable || (isMultiTable && h5showtype === '3') ? (
            <TableComponent
              {...commonTableProps}
              h5height={this.state.h5height}
              isRelateRecordTable
              showHeader={!!keywords || !_.isEmpty(showRecords)}
              pagination={
                forceTable
                  ? { pageIndex: 1, count: showRecords.length, pageSize: Math.max(showRecords.length, 1) }
                  : {
                      pageIndex: tablePageIndex,
                      count: mobileIsEdit && keywords ? records.length : this.state.count,
                      pageSize: TABLE_PAGE_SIZE,
                    }
              }
              updatePagination={
                forceTable
                  ? undefined
                  : ({ pageIndex: nextPageIndex }) => {
                      this.setState({ tablePageIndex: nextPageIndex });

                      if (
                        nextPageIndex * TABLE_PAGE_SIZE > records.length &&
                        records.length < this.state.count &&
                        showLoadMore &&
                        !isLoadingMore
                      ) {
                        this.loadMoreRecords(pageIndex + 1);
                      }
                    }
              }
            />
          ) : isMultipleCardStyle ? (
            <ChildTableFlatComp
              {...commonTableProps}
              controls={cardControls}
              // 已按关联字段配置完成权限筛选，避免子表组件再次用 fieldPermission 过滤。
              filterControlsByPermission={false}
              alwaysExpand={enumDefault === 1}
              hideExpandAll={mobileIsEdit}
              inheritCardStyle
              openRecordOnClick={allowOpenRecord && advancedSetting.allowlink !== '0'}
              showCardDelete={allowRemove}
              control={{
                ...control,
                advancedSetting: {
                  ...advancedSetting,
                  showtitleid: advancedSetting.showtitleid || _.get(titleControl, 'controlId'),
                },
              }}
              from={from}
              isEdit={false}
              rows={showRecords}
              showExpand={showExpand}
            />
          ) : (
            showRecords.map((record, index) => {
              const recordDisabled = disabled || (!allowRemove && !record.isNewAdd);
              const showActions = !isDropdown && !recordDisabled;

              return (
                <RelateFlatCardWrap className={cx({ hasActions: showActions })} key={record.rowid || index}>
                  <ChildTableFlatComp
                    {...commonTableProps}
                    controls={cardControls}
                    filterControlsByPermission={false}
                    control={{
                      ...control,
                      advancedSetting: {
                        ...advancedSetting,
                        showtitleid: advancedSetting.showtitleid || _.get(titleControl, 'controlId'),
                      },
                    }}
                    from={from}
                    h5abstractids={isMultiTable ? h5abstractids : showControls}
                    inheritCardStyle
                    isEdit={false}
                    onOpen={() => handleOpenRecord(index)}
                    openRecordOnClick={
                      enumDefault === 1 &&
                      allowOpenRecord &&
                      advancedSetting.allowlink !== '0' &&
                      !!record.rowid &&
                      !/^temp/.test(record.rowid)
                    }
                    rows={[record]}
                  />
                  {showActions && (
                    <div className="flatCardActions">
                      {allowReplaceRecord && (
                        <div className="flatCardAction Hand" onClick={() => this.handleReplaceRecord(record)}>
                          <i className="icon icon-exchange" />
                        </div>
                      )}
                      <div
                        className="flatCardAction Hand"
                        onClick={() => {
                          this.handleDelete(record);
                        }}
                      >
                        <i className="icon icon-cancel" />
                      </div>
                    </div>
                  )}
                </RelateFlatCardWrap>
              );
            })
          )}
          {isTreeTable && recordId && showLoadMore && (
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
          {!isTreeTable &&
            !isMultipleCardStyle &&
            !isListStyle &&
            !isTableStyle &&
            !showExpand &&
            records.length > 3 && (
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
                  className="colorPrimary Hand mBottom10 InlineBlock"
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
    const { appId, viewId, from, dataSource, disabled, enumDefault, openRelateSheet } = control;
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
    const {
      records,
      previewRecord,
      showNewRecord,
      sheetTemplateLoading,
      keywords,
      isMobileSearchFocus,
      showExpand,
      expandShowType,
      showRowHeightModal,
      h5height,
      viewportSize,
      treeParentRecord,
      treeTabAdding,
      loading,
      isPortraitOrientation,
    } = this.state;
    const {
      onlyRelateByScanCode,
      disabledManualWrite,
      addRelationButtonVisible,
      isCard,
      isMobileTable,
      mobileShowAddAsDropdown,
    } = this;
    const isScanQR = getIsScanQR();
    const multiple = enumDefault === 2;

    if (sheetTemplateLoading) {
      return (
        <div className="pTop10 pBottom10">
          <LoadDiv size="small" />
        </div>
      );
    }

    const filterControls = getFilter({ control, formData, appId });
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

    const renderScanQRCode = () =>
      from !== FROM.SHARE &&
      enumDefault2 !== 11 &&
      onlyRelateByScanCode &&
      isScanQR &&
      !disabled && (
        <RelateScanQRCodeWrap
          className={cx({ lineWrap: !addRelationButtonVisible && !records.length })}
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
            <i className="scanIcon icon icon-qr_code_19 Font20 textSecondary"></i>
            {!addRelationButtonVisible && _l('扫码关联%0', sourceEntityName || '')}
          </div>
        </RelateScanQRCodeWrap>
      );

    const mobileIsEdit = !disabled && !formDisabled;
    const showSearch = enumDefault === 2 && (isCard || isMobileTable);
    const showTableHeader = isMobileTable || (isCard && enumDefault === 2);
    const isTreeTable = isMobileTable && !!advancedSetting.layercontrolid;
    const allowTreeTabAdd = isTreeTable && showRelateRecordEmpty;
    const expandH5ShowType = expandShowType === 'table' ? '3' : isMobileTable ? advancedSetting.h5showtype || '2' : '2';
    const isExpandTable = showExpand && (isTreeTable || expandH5ShowType === '3');
    const isHorizontalPortrait = isExpandTable && isPortraitOrientation;
    const isInitialEmptyMultiRecord = !keywords && _.isEmpty(records) && multiple && (isCard || isMobileTable);

    const renderOperateComp = (expanded, hideTableOperations = false) => {
      const currentH5ShowType =
        expanded && expandShowType === 'table' ? '3' : isMobileTable ? advancedSetting.h5showtype || '2' : '2';

      return (
        <OperateWrap
          className="w100 flexRow"
          $expanded={expanded}
          $separate={showTableHeader}
          $showAddButton={!expanded && addRelationButtonVisible && (mobileIsEdit || allowTreeTabAdd)}
        >
          {!expanded && !isMobileSearchFocus && (mobileIsEdit || allowTreeTabAdd) && (
            <div className="editOperateBtns flexRow alignItemsCenter">
              {addRelationButtonVisible && (
                <div
                  className={cx('customFormControlBox customFormButton', { disabled: treeTabAdding })}
                  onClick={() => !treeTabAdding && this.handleClick()}
                >
                  <Icon
                    icon={treeTabAdding ? 'loading_button' : 'plus'}
                    className={cx({ treeTabAddingIcon: treeTabAdding })}
                  />
                  <span>{sourceBtnName || sourceEntityName || ''}</span>
                </div>
              )}
              {mobileIsEdit && renderScanQRCode()}
            </div>
          )}
          {!hideTableOperations && showSearch && (
            <SearchInput
              inputWidth={100}
              searchIcon={
                <div className="operateBtnBox">
                  <i className="icon icon-search" />
                </div>
              }
              active={isMobileSearchFocus}
              keywords={keywords}
              focusedClass={cx({ mRight10: !isMobileSearchFocus })}
              onOk={value => {
                this.setState({ keywords: value, pageIndex: 1, tablePageIndex: 1 }, () => {
                  if (!mobileIsEdit) {
                    this.loadMoreRecords(1);
                  }
                });
              }}
              onClear={() => {
                this.setState({ keywords: '', pageIndex: 1, tablePageIndex: 1, isMobileSearchFocus: false }, () => {
                  if (!mobileIsEdit) {
                    this.loadMoreRecords(1);
                  }
                });
              }}
              onFocus={() => this.setState({ isMobileSearchFocus: true })}
              onBlur={() => this.setState({ isMobileSearchFocus: false })}
            />
          )}
          {!hideTableOperations && showTableHeader && !isMobileSearchFocus && recordId && (
            <span
              className="mLeft12 Hand"
              onClick={() => this.setState({ tablePageIndex: 1 }, () => this.loadMoreRecords(1))}
            >
              <div className="operateBtnBox">
                <i className="icon icon-task-later" />
              </div>
            </span>
          )}
          {!hideTableOperations &&
            showTableHeader &&
            !isMobileSearchFocus &&
            !mobileIsEdit &&
            (isTreeTable || currentH5ShowType === '3') && (
              <span className="mLeft12 Hand" onClick={() => this.setState({ showRowHeightModal: true })}>
                <div className="operateBtnBox">
                  <i
                    className={cx('icon icon-row_height', {
                      colorPrimary: h5height !== (advancedSetting.h5height || '0'),
                    })}
                  />
                </div>
              </span>
            )}
          {!hideTableOperations && showTableHeader && !isMobileSearchFocus && !mobileIsEdit && !keywords && (
            <Fragment>
              {!isTreeTable && !expanded && currentH5ShowType !== '3' && (
                <span
                  className="mLeft12 Hand"
                  onClick={() =>
                    this.setState(
                      {
                        showExpand: true,
                        expandShowType: 'table',
                        viewportSize: getViewportSize(),
                      },
                      currentH5ShowType === '1' ? this.loadAllRecords : undefined,
                    )
                  }
                >
                  <div className="operateBtnBox">
                    <i className="icon icon-table" />
                  </div>
                </span>
              )}
              <span
                className="mLeft12 Hand"
                onClick={() =>
                  this.setState({
                    showExpand: !expanded,
                    expandShowType: 'current',
                    viewportSize: getViewportSize(),
                  })
                }
              >
                <div className="operateBtnBox">
                  <i className={cx('icon', expanded ? 'themeIcon icon-zoom_out2' : 'icon-enlarge1')} />
                </div>
              </span>
            </Fragment>
          )}
        </OperateWrap>
      );
    };

    if (loading && !showExpand && !keywords && multiple && showRelateRecordEmpty && _.isEmpty(records)) {
      return <MultiRecordLoading />;
    }

    const isInitialEmpty = !loading && !keywords && _.isEmpty(records);

    if (isInitialEmpty && !multiple && isCard && mobileIsEdit && !showNewRecord) {
      const addRelationButton = addRelationButtonVisible ? (
        <div className="customFormControlBox customFormButton" onClick={this.handleClick}>
          <Icon icon="plus" />
          <span>{sourceBtnName || sourceEntityName || ''}</span>
        </div>
      ) : null;
      const scanQRCode = renderScanQRCode();

      if (!addRelationButton && !scanQRCode) return null;

      return addRelationButton && scanQRCode ? (
        <InitialSingleOperateWrap className="flexRow alignItemsCenter">
          {addRelationButton}
          {scanQRCode}
        </InitialSingleOperateWrap>
      ) : (
        addRelationButton || scanQRCode
      );
    }

    if (
      !loading &&
      !keywords &&
      multiple &&
      (isCard || isMobileTable) &&
      showRelateRecordEmpty &&
      disabled &&
      _.isEmpty(records)
    ) {
      return (
        <WithoutRowsWrap className="withoutRowsWrapper flexColumn valignWrapper h100">
          <WithoutRows text={_l('暂无记录')} />
        </WithoutRowsWrap>
      );
    }

    const shouldShowMargin = mobileShowAddAsDropdown && !disabled;
    let marginClass = disabled ? 'mBottom10' : 'mBottom14';

    return (
      <RelateRecordRoot>
        {(showSearch || showTableHeader) &&
          (!isInitialEmptyMultiRecord || mobileIsEdit || allowTreeTabAdd) &&
          renderOperateComp(false, isInitialEmptyMultiRecord)}
        <div
          className={cx('flexRow valignWrapper relateDropdownControls', {
            [marginClass]: shouldShowMargin && records.length,
          })}
        >
          {!isCard && !isMobileTable && (!disabled || !mobileShowAddAsDropdown) && (
            <div
              className={cx('customFormControlBox controlMinHeight customFormControlCapsuleBox', {
                controlEditReadonly: !formDisabled && records.length && disabled,
                controlDisabled: formDisabled,
              })}
              onClick={() => {
                if (!disabled && !disabledManualWrite) this.handleClick();
              }}
            >
              {records.length ? (
                <div className="flex pRight10">{this.renderDropDownRecordsCon()}</div>
              ) : (
                <span className="flex customFormPlaceholder">{renderHint()}</span>
              )}
              {(!disabled || !formDisabled) && !onlyRelateByScanCode && (
                <Icon icon="arrow-right-border" className="Font16 textDisabled" />
              )}
            </div>
          )}
          {!isCard && !isMobileTable && renderScanQRCode()}
        </div>
        {(isCard || isMobileTable || mobileShowAddAsDropdown) && this.renderRecordsCon()}
        {showTableHeader && showExpand && (
          <Popup
            className="mobileModal full expandChildTable"
            position="left"
            visible
            bodyStyle={{ width: '100%', height: '100%' }}
            onMaskClick={() => this.setState({ showExpand: false, expandShowType: 'current' })}
          >
            <HorizontalRelateTableContent
              $isHorizontal={isExpandTable}
              $isHorizontalPortrait={isHorizontalPortrait}
              $height={isExpandTable ? (isHorizontalPortrait ? viewportSize.width : viewportSize.height) : undefined}
              $width={isExpandTable ? (isHorizontalPortrait ? viewportSize.height : viewportSize.width) : undefined}
            >
              <div
                className={cx('Relative w100 h100 flexColumn', {
                  expandChildTableCon: !isExpandTable,
                })}
              >
                <div className="expandChildTableHeader">
                  <div className="controlLabelName flex ellipsis">
                    {control.controlName}
                    {`(${this.state.count || records.length})`}
                  </div>
                  {renderOperateComp(true)}
                </div>
                <div
                  className={cx('horizontalScrollContent', {
                    horizontalTableContent: isExpandTable,
                  })}
                >
                  {this.renderRecordsCon({ showExpand: true, expandShowType })}
                </div>
              </div>
            </HorizontalRelateTableContent>
          </Popup>
        )}
        {showRowHeightModal && (
          <Popup
            className="mobileModal"
            visible
            bodyStyle={{ borderRadius: 8 }}
            onMaskClick={() => this.setState({ showRowHeightModal: false })}
          >
            <RowHeightPopupContent>
              <div className="flexRow header">
                <div className="Font13 textTertiary flex">{_l('表格行高')}</div>
                <div className="closeIcon Hand" onClick={() => this.setState({ showRowHeightModal: false })}>
                  <i className="icon icon-close Font17 textTertiary bold" />
                </div>
              </div>
              {[
                { value: '0', text: _l('紧凑') },
                { value: '1', text: _l('中等') },
                { value: '2', text: _l('高') },
                { value: '3', text: _l('自适应') },
              ].map(item => (
                <div
                  key={item.value}
                  className="rowHeightItem flexRow alignItemsCenter Hand"
                  onClick={() => this.setState({ h5height: item.value, showRowHeightModal: false })}
                >
                  <div className="flex">{item.text}</div>
                  {h5height === item.value && <i className="icon icon-done colorPrimary Font20" />}
                </div>
              ))}
            </RowHeightPopupContent>
          </Popup>
        )}
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
              if (!isTreeTable && _.isFunction(control.refreshRecord)) {
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
              this.setState({ showNewRecord: false, treeParentRecord: null });
            }}
            defaultRelatedSheet={treeParentRecord ? undefined : this.getDefaultRelateSheetValue()}
            defaultFormData={
              treeParentRecord
                ? {
                    [advancedSetting.layercontrolid]: JSON.stringify([
                      {
                        sid: treeParentRecord.rowid,
                        sourcevalue: JSON.stringify(treeParentRecord),
                        type: 8,
                      },
                    ]),
                  }
                : undefined
            }
            defaultFormDataEditable={!!treeParentRecord}
            onAdd={record => {
              this.handleAdd([
                {
                  ...record,
                  isNewAdd: true,
                  ...(treeParentRecord ? { pid: treeParentRecord.rowid } : {}),
                },
              ]);
              this.setState({ treeParentRecord: null });
            }}
          />
        )}
      </RelateRecordRoot>
    );
  }
}

export default autoSize(RelateRecordCards, { onlyWidth: true });
