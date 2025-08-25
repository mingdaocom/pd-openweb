import React from 'react';
import _, { find, get, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { LoadDiv, ScrollView } from 'ming-ui';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import sheetAjax from 'src/api/worksheet';
import { getFilter } from 'worksheet/common/WorkSheetFilter/util';
import { TextAbsoluteCenter } from 'worksheet/components/StyledComps';
import { selectRecords } from 'src/components/SelectRecords';
import { getTranslateInfo } from 'src/utils/app';
import ChildTableContext from '../ChildTable/ChildTableContext';
import ReacordItem from './RecordItem';

export default class RelateRecordList extends React.PureComponent {
  static contextType = ChildTableContext;
  static propTypes = {
    from: PropTypes.number,
    viewId: PropTypes.string,
    dataSource: PropTypes.string,
    selectedIds: PropTypes.arrayOf(PropTypes.string),
    parentWorksheetId: PropTypes.string,
    recordId: PropTypes.string,
    controlId: PropTypes.string,
    multiple: PropTypes.bool,
    showCoverAndControls: PropTypes.bool,
    coverCid: PropTypes.string,
    showControls: PropTypes.arrayOf(PropTypes.string),
    prefixRecords: PropTypes.arrayOf(PropTypes.shape({})),
    onItemClick: PropTypes.func,
    onClear: PropTypes.func,
    onNewRecord: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: _.isEmpty(props.staticRecords),
      keyWords: '',
      records: props.staticRecords || [],
      pageIndex: 1,
      activeId: undefined,
      ignoreAllFilters: false,
    };
    this.handleSearch = _.debounce(this.handleSearch, 500);
    this.scrollViewRef = React.createRef();
  }

  con = React.createRef();

  componentDidMount() {
    const { control, parentWorksheetId } = this.props;
    if (control) {
      (window.isPublicWorksheet && !_.get(window, 'shareState.isPublicWorkflowRecord')
        ? publicWorksheetAjax
        : sheetAjax
      )
        .getWorksheetInfo({
          worksheetId: control.dataSource,
          getTemplate: true,
          relationWorksheetId: parentWorksheetId,
        })
        .then(data => {
          this.setState(
            {
              allowAdd: data.allowAdd,
              worksheetInfo: data,
            },
            this.loadRecord,
          );
        });
    } else {
      this.loadRecord();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.keyWords !== this.props.keyWords) {
      this.handleSearch(nextProps.keyWords);
    }
  }

  handleEnter = () => {
    const { allowNewRecord, onItemClick, onNewRecord } = this.props;
    const { error, activeId, records, allowAdd } = this.state;
    if (
      records.length === 0 &&
      allowNewRecord &&
      allowAdd &&
      !(_.get(window, 'shareState.isPublicFormPreview') || _.get(window, 'shareState.isPublicForm')) &&
      (!error || error === 'notCorrectCondition')
    ) {
      onNewRecord();
      return;
    }
    const newActiveRecord = _.find(records, { rowid: activeId });
    if (newActiveRecord) {
      onItemClick(newActiveRecord);
    }
  };

  handleUpdateScroll(newIndex) {
    let itemHeight = 34;
    try {
      itemHeight = this.con.current.querySelector(`.RelateRecordListItem:nth-child(${newIndex})`).offsetHeight;
    } catch (err) {
      console.log(err);
    }
    const scrollInfo = this.scrollViewRef.getScrollInfo() || {};
    const height = scrollInfo.clientHeight;
    const scrollTop = scrollInfo.scrollTop;
    if (itemHeight * newIndex - scrollTop > height - 20) {
      this.scrollViewRef.scrollTo({ top: itemHeight * newIndex - height + itemHeight });
    } else if (itemHeight * newIndex < scrollTop) {
      this.scrollViewRef.scrollTo({ top: itemHeight * newIndex });
    }
  }

  updateActiveId = offset => {
    const { activeId, records } = this.state;
    let currentIndex;
    if (!activeId) {
      currentIndex = -1;
    } else {
      currentIndex = _.findIndex(records, { rowid: activeId });
    }
    if (_.isUndefined(currentIndex)) {
      currentIndex = -1;
    }
    const newActiveRecord = records[currentIndex + offset];
    this.handleUpdateScroll(currentIndex + offset);
    if (!newActiveRecord) {
      return;
    }
    const newActiveId = newActiveRecord.rowid;
    this.setState({
      activeId: newActiveId,
    });
  };

  loadRecord() {
    const {
      isSubList,
      isDraft,
      isQuickFilter,
      control,
      formData,
      viewId,
      dataSource,
      parentWorksheetId,
      recordId,
      controlId,
      searchControl,
      staticRecords,
      getFilterRowsGetType,
      fastSearchControlArgs,
      ignoreRowIds = [],
    } = this.props;
    const _this = this;
    if (!_.isEmpty(staticRecords)) {
      return;
    }
    const { pageIndex, keyWords, records, worksheetInfo, ignoreAllFilters } = this.state;
    if (_.get(control, 'advancedSetting.clicksearch') === '1' && !keyWords) {
      this.setState({ loading: false, records: [] });
      return;
    }
    let filterControls;
    if (!_.isEmpty(_.get(worksheetInfo, 'template.controls'))) {
      control.relationControls = worksheetInfo.template.controls;
    }
    if (control && control.advancedSetting.filters) {
      filterControls = getFilter({ control, formData });
    }
    // 存在不符合条件值的条件
    if (filterControls === false && !isQuickFilter && !ignoreAllFilters) {
      this.setState({ error: 'notCorrectCondition', loading: false });
      return;
    }
    this.setState({
      loading: true,
    });
    let getFilterRowsPromise;
    const args = {
      worksheetId: dataSource,
      viewId,
      searchType: 1,
      pageSize: 50,
      pageIndex,
      status: 1,
      keyWords,
      isGetWorksheet: true,
      getType: getFilterRowsGetType || (isDraft ? 27 : 7), // 32 是快速筛选专用，只处理记录可见逻辑，不生效字段其它配置。
      filterControls: ignoreAllFilters ? [] : filterControls || [],
      rowId: !isSubList ? get(control, 'recordId') : undefined,
    };
    if (!isEmpty(ignoreRowIds)) {
      args.requestParams = {
        _system_excluderowids: JSON.stringify(ignoreRowIds),
      };
    }
    if (fastSearchControlArgs) {
      delete args['keyWords'];
      if (String(keyWords || '').trim()) {
        args.fastFilters = [
          {
            spliceType: 1,
            isGroup: true,
            groupFilters: [
              {
                controlId: fastSearchControlArgs.controlId,
                dataType: 2,
                spliceType: 1,
                filterType: fastSearchControlArgs.filterType,
                dateRange: 0,
                isDynamicsource: false,
                values: [keyWords],
              },
            ],
          },
        ];
      }
    }
    if (parentWorksheetId && controlId && _.get(parentWorksheetId, 'length') === 24) {
      args.relationWorksheetId = parentWorksheetId;
      args.controlId = controlId;
    }
    if (this.searchAjax && _.isFunction(this.searchAjax.abort)) {
      this.searchAjax.abort();
    }
    if (!window.isPublicWorksheet) {
      getFilterRowsPromise = sheetAjax.getFilterRows;
    } else {
      args.shareId = window.publicWorksheetShareId;
      getFilterRowsPromise = publicWorksheetAjax.getRelationRows;
    }
    this.searchAjax = getFilterRowsPromise(args);
    this.searchAjax.then(res => {
      if (res.resultCode === 1) {
        let ignoreRowIdsForChildTable = [];
        if (control.unique || control.uniqueInRecord) {
          ignoreRowIdsForChildTable = (_.get(_this, 'context.rows') || [])
            .map(r => _.get(safeParse(r[control.controlId], 'array'), '0.sid'))
            .filter(_.identity);
        }
        let newRecords = records.concat(
          res.data.filter(row => row.rowid !== recordId && !_.includes(ignoreRowIdsForChildTable, row.rowid)),
        );
        const needSort =
          keyWords && pageIndex === 1 && _.get(control, 'advancedSetting.searchcontrol') && searchControl;
        if (
          needSort &&
          _.get(control, 'advancedSetting.searchtype') !== '1' &&
          find(newRecords, record => record[searchControl.controlId] === keyWords)
        ) {
          // pick match record to top
          newRecords = newRecords.sort((a, b) => {
            if (a[searchControl.controlId] === keyWords) {
              return -1;
            }
            if (b[searchControl.controlId] === keyWords) {
              return 1;
            }
            return 0;
          });
        }
        this.setState({
          error: undefined,
          records: newRecords,
          loading: false,
          loadouted: res.data.length < 20,
          controls: res.template ? res.template.controls : [],
          worksheet: res.worksheet || {},
          activeId:
            needSort && newRecords[0] && newRecords[0][searchControl.controlId] === keyWords
              ? newRecords[0].rowid
              : undefined,
        });
      } else {
        this.setState({
          loading: false,
          error: true,
        });
      }
    });
  }

  handleSearch = value => {
    const { staticRecords } = this.props;
    if (!_.isEmpty(staticRecords)) {
      this.setState({
        keyWords: value.trim(),
      });
      return;
    }
    this.setState(
      {
        keyWords: value.trim(),
        pageIndex: 1,
        records: [],
      },
      this.loadRecord,
    );
  };

  loadNext() {
    this.setState(
      {
        pageIndex: this.state.pageIndex + 1,
        loading: true,
      },
      this.loadRecord,
    );
  }

  render() {
    const {
      appId,
      style,
      isDraft,
      parentWorksheetId,
      viewId,
      formData,
      entityName,
      maxHeight,
      isCharge,
      recordId,
      isMobile,
      control,
      coverCid,
      showControls,
      searchControl,
      multiple,
      selectedIds,
      showCoverAndControls,
      staticRecords,
      prefixRecords = [],
      onItemClick,
      allowNewRecord,
      onNewRecord,
      onChange,
      focusInput = () => {},
    } = this.props;
    const showDialogSelect = get(control, 'advancedSetting.openfastfilters') === '1';
    const allowShowIgnoreAllFilters = isCharge && recordId === 'FAKE_RECORD_ID_FROM_BATCH_EDIT';
    const { error, loading, worksheet = {}, keyWords, controls, loadouted, allowAdd, activeId } = this.state;
    const showCreateRecord =
      allowNewRecord &&
      allowAdd &&
      !(_.get(window, 'shareState.isPublicFormPreview') || _.get(window, 'shareState.isPublicForm'));
    let records = (loading ? [] : prefixRecords).concat(this.state.records);
    if (!_.isEmpty(staticRecords) && keyWords) {
      records = _.filter(staticRecords, row => new RegExp(keyWords, 'i').test(row.name));
    }
    if (_.get(control, 'advancedSetting.clicksearch') === '1' && !keyWords) {
      return null;
    }
    const createRecordName =
      getTranslateInfo(appId, null, control.dataSource).createBtnName || _.get(worksheet, 'advancedSetting.btnname');
    const recordItemHeight = showCoverAndControls && showControls.length ? 56 : 36;
    let recordListHeight = records.length * recordItemHeight + 12;
    if (maxHeight) {
      recordListHeight = maxHeight - 48 - 10;
    }
    const hasFilter =
      _.get(control, 'advancedSetting.searchfilters') || _.get(control, 'advancedSetting.fastfiltersview');
    return (
      <div
        className="RelateRecordList flexColumn"
        ref={this.con}
        style={_.assign({}, style, isMobile ? { width: window.innerWidth } : {})}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flexColumn"
          style={{
            minHeight: records.length
              ? recordItemHeight
              : !records.length && !keyWords && !loading
                ? window.innerHeight / 2 > 300
                  ? 300
                  : 100
                : 50,
            height: recordListHeight > 323 ? 323 : recordListHeight,
          }}
        >
          <div className="flex flexColumn listCon minHeight0" onClick={e => e.stopPropagation()}>
            <ScrollView
              ref={el => (this.scrollViewRef = el)}
              className="flex"
              onScrollEnd={() => {
                if (!loading && !loadouted && _.isEmpty(staticRecords)) {
                  this.loadNext();
                }
              }}
            >
              {!records.length && keyWords && !loading && (
                <TextAbsoluteCenter style={{ color: '#9e9e9e' }}>{_l('无匹配结果')}</TextAbsoluteCenter>
              )}
              {!records.length && !keyWords && !loading && (
                <TextAbsoluteCenter style={{ color: '#9e9e9e' }}>
                  <i className="icon Icon icon-ic-line Font56 Gray_bd"></i>
                  <div className="mTop10">
                    {error
                      ? error === 'notCorrectCondition'
                        ? _l(
                            '不存在符合条件的%0',
                            entityName || worksheet.entityName || (control && control.sourceEntityName) || '',
                          )
                        : _l('没有权限')
                      : _l('暂无记录')}
                    {error === 'notCorrectCondition' && allowShowIgnoreAllFilters && (
                      <div
                        className="mTop10 ThemeColor3 TxtCenter Hand"
                        onClick={() => {
                          this.setState({ ignoreAllFilters: true }, this.loadRecord);
                          focusInput();
                        }}
                      >
                        {_l('查看全部记录')}
                      </div>
                    )}
                  </div>
                </TextAbsoluteCenter>
              )}
              {!!records.length &&
                records.map((record, index) => (
                  <ReacordItem
                    active={activeId === record.rowid}
                    multiple={multiple}
                    titleIsBold={searchControl && keyWords && record[searchControl.controlId] === keyWords}
                    selected={_.find(selectedIds, fid => record.rowid === fid)}
                    showCoverAndControls={showCoverAndControls}
                    control={control}
                    controls={controls}
                    key={index}
                    showControls={record.rowid === 'isEmpty' ? [] : showControls}
                    coverCid={coverCid}
                    data={record}
                    onClick={e => {
                      e.stopPropagation();
                      this.setState({ activeId: undefined });
                      onItemClick(record);
                    }}
                  />
                ))}
              {loading && (
                <div className="loadingCon">
                  <LoadDiv />
                </div>
              )}
            </ScrollView>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #ddd' }} />
        {(!error || error === 'notCorrectCondition') && (showCreateRecord || showDialogSelect) && (
          <div className={'RelateRecordList-create ' + (activeId === 'newRecord' ? 'active' : '')}>
            {showCreateRecord && (
              <div
                onClick={e => {
                  e.stopPropagation();
                  this.setState({ activeId: undefined });
                  onNewRecord(e);
                }}
              >
                <i className="icon icon-plus mRight5"></i>
                {createRecordName ||
                  (control && control.sourceBtnName) ||
                  entityName ||
                  worksheet.entityName ||
                  (control && control.sourceEntityName)}
              </div>
            )}

            {showDialogSelect && (
              <i
                className={`icon icon-${hasFilter ? 'worksheet_filter' : 'worksheet_enlarge'} Font20 Gray_9e Hand ThemeHoverColor3`}
                onClick={() => {
                  selectRecords({
                    projectId: worksheet?.projectId,
                    control,
                    controlId: control.controlId,
                    recordId,
                    isCharge,
                    multiple,
                    allowNewRecord:
                      allowNewRecord &&
                      allowAdd &&
                      !(_.get(window, 'shareState.isPublicFormPreview') || _.get(window, 'shareState.isPublicForm')),
                    coverCid,
                    appId,
                    viewId,
                    formData,
                    relateSheetId: control.dataSource,
                    parentWorksheetId: parentWorksheetId,
                    showControls: showControls,
                    filterRowIds: selectedIds,
                    onOk: records => {
                      onChange(records);
                    },
                    isDraft,
                  });
                }}
              ></i>
            )}
          </div>
        )}
      </div>
    );
  }
}
