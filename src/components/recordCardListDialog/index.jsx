import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Dialog, Button, Checkbox } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import ScrollView from 'ming-ui/components/ScrollView';
import LoadDiv from 'ming-ui/components/LoadDiv';
import NewRecord from 'src/pages/worksheet/common/newRecord/NewRecord';
import RecordCard from 'src/components/recordCard';
import { checkIsTextControl, fieldCanSort, replaceControlsTranslateInfo } from 'src/pages/worksheet/util';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import Header from './Header';
import './recordCardListDialog.less';
import _ from 'lodash';

function getSearchConfig(control) {
  try {
    const { searchcontrol, searchtype, clicksearch, searchfilters = '[]' } = control.advancedSetting || {};
    let searchControl;
    if (searchcontrol) {
      searchControl = _.find(control.relationControls, { controlId: searchcontrol });
    }
    if (!searchControl) {
      searchControl = _.find(control.relationControls, { attribute: 1 });
    }
    return {
      searchControl,
      searchType: Number(searchtype),
      clickSearch: clicksearch === '1',
      searchFilters: safeParse(searchfilters, 'array'),
    };
  } catch (err) {
    console.error(err);
    return {};
  }
}
export default class RecordCardListDialog extends Component {
  static propTypes = {
    from: PropTypes.number, // 来源
    maxCount: PropTypes.number,
    selectedCount: PropTypes.number,
    viewId: PropTypes.string, // 他表字段被关联表所在应用所在视图id
    relateSheetId: PropTypes.string, // 他表字段被关联表id
    parentWorksheetId: PropTypes.string, // 记录所在表id
    recordId: PropTypes.string, // 记录id
    controlId: PropTypes.string, // 他表字段id
    allowAdd: PropTypes.bool, // 是否有新建记录权限
    allowNewRecord: PropTypes.bool, // 允许新建记录
    coverCid: PropTypes.string, // 封面字段 id
    showControls: PropTypes.arrayOf(PropTypes.string), // 显示在卡片里的字段 id 数组
    filterRowIds: PropTypes.arrayOf(PropTypes.string), // 过滤的记录
    ignoreRowIds: PropTypes.arrayOf(PropTypes.string), // 给卡片用的，传后后端过滤已关联时会忽略这些记录
    filterRelatesheetControlIds: PropTypes.arrayOf(PropTypes.string), // 过滤的关联表控件对应控件id
    defaultRelatedSheet: PropTypes.shape({}),
    singleConfirm: PropTypes.bool, // 单选需要确认
    multiple: PropTypes.bool, // 是否多选
    visible: PropTypes.bool, // 弹窗显示
    control: PropTypes.shape({}), // 关联表控件
    onClose: PropTypes.func, // 关闭回掉
    onOk: PropTypes.func, // 确定回掉
    onText: PropTypes.string,
    formData: PropTypes.arrayOf(PropTypes.shape({})),
    pageSize: PropTypes.number,
  };
  static defaultProps = {
    allowNewRecord: true,
    filterRowIds: [],
    showControls: [],
    filterRelatesheetControlIds: [],
    onClose: () => {},
    onOk: () => {},
    formData: [],
    singleConfirm: false,
    pageSize: 50,
  };
  conRef = React.createRef();
  listRef = React.createRef();
  constructor(props) {
    super(props);
    this.state = {
      allowAdd: props.allowAdd || false,
      loading: true,
      list: [],
      controls: [],
      sortControls: [],
      selectedRecords: [],
      worksheet: {},
      pageIndex: 1,
      loadouted: false,
      showNewRecord: false,
      selectAll: false,
      focusIndex: -1,
    };
    this.handleSearch = _.debounce(this.handleSearch, 500);
  }
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
          window.worksheetControlsCache = {};
          data.template.controls.forEach(c => {
            if (c.type === 29) {
              window.worksheetControlsCache[c.dataSource] = c.relationControls;
            }
          });
          this.setState(
            {
              allowAdd: _.get(window, 'shareState.isPublicFormPreview') ? false : data.allowAdd,
              worksheetInfo: data,
            },
            this.loadRecord,
          );
        });
    } else {
      this.loadRecord();
    }
  }

  handleInputKeyDown = e => {
    const { singleConfirm, multiple, onOk, onClose } = this.props;
    const { focusIndex, list, selectedRecords } = this.state;
    e.stopPropagation();
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      onOk(selectedRecords);
      onClose();
      return;
    }
    if (e.key === 'ArrowUp') {
      this.updateFocusIndex(false);
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      this.updateFocusIndex(true);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (list[focusIndex]) {
        if (multiple || singleConfirm) {
          const selected = _.find(selectedRecords, r => r.rowid === list[focusIndex].rowid);
          this.setState({
            selectedRecords: selected
              ? selectedRecords.filter(r => r.rowid !== selected.rowid)
              : selectedRecords.concat(list[focusIndex]),
          });
        } else {
          onOk([list[focusIndex]]);
          onClose();
        }
      }
    }
  };
  updateFocusIndex(isNext) {
    const { focusIndex = 0, list } = this.state;
    if (!list.length) {
      return;
    }
    let newIndex = focusIndex + (isNext ? 1 : -1);
    if (newIndex < 0) {
      newIndex = 0;
    }
    if (newIndex > list.length - 1) {
      newIndex = list.length - 1;
    }
    this.setState({ focusIndex: newIndex }, () => {
      let $list = this.listRef.current.nanoScroller;
      if (!$list) {
        return;
      }
      $list = $list.querySelector('.nano-content');
      const $currentItem = $list.querySelector(`.worksheetRecordCard:nth-child(${newIndex + 1})`);
      if (isNext && $currentItem.offsetTop + $currentItem.offsetHeight > $list.scrollTop + $list.clientHeight) {
        $list.scrollTop = $list.scrollTop + $currentItem.offsetHeight + 12;
      } else if ($currentItem.offsetTop < $list.scrollTop) {
        $list.scrollTop = $list.scrollTop - $currentItem.offsetHeight - 12;
      }
    });
  }
  loadRecord() {
    const {
      from,
      viewId,
      relateSheetId,
      filterRowIds,
      ignoreRowIds,
      parentWorksheetId,
      recordId,
      controlId,
      control,
      formData,
      isDraft,
      pageSize,
    } = this.props;
    const {
      pageIndex,
      keyWords,
      list,
      ignoreAllFilters,
      sortControls,
      quickFilters = [],
      filterForControlSearch,
      worksheetInfo,
    } = this.state;
    const searchConfig = control ? getSearchConfig(control) : {};
    const { searchControl } = searchConfig;
    let getFilterRowsPromise, args;
    let filterControls;
    if (control && control.advancedSetting.filters) {
      if (worksheetInfo) {
        control.relationControls = worksheetInfo.template.controls;
      }
      filterControls = getFilter({ control: { ...control, recordId }, formData });
    }
    // 存在不符合条件值的条件
    if (filterControls === false && !ignoreAllFilters) {
      this.setState({ error: 'notCorrectCondition', loading: false });
      return;
    }
    if (this.searchAjax && _.isFunction(this.searchAjax.abort)) {
      this.searchAjax.abort();
    }
    args = {
      worksheetId: relateSheetId,
      viewId,
      searchType: 1,
      pageSize,
      pageIndex,
      status: 1,
      keyWords: _.trim(keyWords),
      isGetWorksheet: true,
      getType: isDraft ? 27 : 7,
      sortControls,
      filterControls: ignoreAllFilters ? [] : filterControls || [],
      fastFilters: quickFilters.map(f =>
        _.pick(f, [
          'controlId',
          'dataType',
          'spliceType',
          'filterType',
          'dateRange',
          'value',
          'values',
          'minValue',
          'maxValue',
        ]),
      ),
    };
    if (filterForControlSearch) {
      args.filterControls = args.filterControls.concat(filterForControlSearch);
    }
    if (!window.isPublicWorksheet) {
      getFilterRowsPromise = sheetAjax.getFilterRows;
    } else {
      getFilterRowsPromise = publicWorksheetAjax.getRelationRows;
      args.shareId = window.publicWorksheetShareId;
    }
    if (parentWorksheetId && controlId && _.get(parentWorksheetId, 'length') === 24) {
      args.relationWorksheetId = parentWorksheetId;
      args.rowId = recordId;
      args.controlId = controlId;
      if (ignoreRowIds) {
        args.requestParams = {
          _system_excluderowids: JSON.stringify(ignoreRowIds),
        };
      }
    }
    this.searchAjax = getFilterRowsPromise(args);
    this.searchAjax.then(res => {
      if (res.resultCode === 1) {
        let filteredList = _.uniqBy(
          list.concat(res.data.filter(record => !_.find(filterRowIds, fid => record.rowid === fid))),
          'rowid',
        );
        const needSort =
          keyWords && pageIndex === 1 && _.get(control, 'advancedSetting.searchcontrol') && searchControl;
        if (needSort && _.get(control, 'advancedSetting.searchtype') !== '1') {
          filteredList = filteredList.sort((a, b) => (b[searchControl.controlId] === keyWords ? 1 : -1));
        }
        this.setState(
          {
            focusIndex: needSort && filteredList[0] && filteredList[0][searchControl.controlId] === keyWords ? 0 : -1,
            error: undefined,
            list: filteredList,
            loading: false,
            loadouted: res.data.length < pageSize,
            controls: res.template
              ? replaceControlsTranslateInfo(res.worksheet.appId, null, res.template.controls)
              : [],
            worksheet: res.worksheet || {},
          },
          () => {
            if (!this.state.loadouted && filteredList.length < 8) {
              this.loadNext();
            }
          },
        );
      } else {
        this.setState({
          loading: false,
          error: true,
        });
      }
    });
  }
  loadNext() {
    this.setState(
      {
        pageIndex: this.state.pageIndex + 1,
        loading: true,
        selectAll: false,
      },
      this.loadRecord,
    );
  }

  handleSearch = value => {
    this.setState(
      {
        keyWords: value,
        pageIndex: 1,
        loading: true,
        list: [],
      },
      this.loadRecord,
    );
  };

  handleFilter = filters => {
    this.setState(
      {
        quickFilters: filters,
        pageIndex: 1,
        loading: true,
        list: [],
      },
      this.loadRecord,
    );
  };

  handleSelect = (record, selected) => {
    const { maxCount, selectedCount, multiple, onOk, onClose, singleConfirm } = this.props;
    const { selectedRecords } = this.state;
    if (multiple) {
      if (selected && selectedCount + selectedRecords.length + 1 > maxCount) {
        alert(_l('最多关联%0条', maxCount), 3);
        return;
      }
      this.setState({
        selectedRecords: selected
          ? selectedRecords.concat(record)
          : selectedRecords.filter(r => r.rowid !== record.rowid),
      });
    } else if (singleConfirm) {
      this.setState({ selectedRecords: [record] });
    } else {
      onOk([record]);
      onClose();
    }
  };

  handleConfirm = () => {
    const { onOk, onClose } = this.props;
    const { selectedRecords } = this.state;
    onOk(selectedRecords);
    onClose();
  };

  handleSort = (control, isAsc) => {
    let newIsAsc;
    if (_.isUndefined(isAsc)) {
      newIsAsc = true;
    } else if (isAsc === false) {
      newIsAsc = undefined;
    } else {
      newIsAsc = false;
    }
    this.setState(
      {
        sortControls: _.isUndefined(newIsAsc)
          ? []
          : [
              {
                controlId: control.controlId,
                datatype: control.sourceControlType || control.type,
                isAsc: newIsAsc,
              },
            ],
        pageIndex: 1,
        loading: true,
        list: [],
      },
      this.loadRecord,
    );
  };
  canSort(control) {
    const itemType = control.sourceControlType || control.type;
    return fieldCanSort(itemType);
  }
  getControlSortStatus(control) {
    const { sortControls } = this.state;
    const sortedControl = _.find(sortControls, sc => sc.controlId === control.controlId);
    return sortedControl && sortedControl.isAsc;
  }
  get cardControls() {
    const { control = {} } = this.props;
    const showControls = control.showControls || this.props.showControls;
    const { controls } = this.state;
    const titleControl = _.find(controls, c => c.attribute === 1);
    const allControls = [
      { controlId: 'ownerid', controlName: _l('拥有者'), type: 26 },
      { controlId: 'caid', controlName: _l('创建人'), type: 26 },
      { controlId: 'ctime', controlName: _l('创建时间'), type: 16 },
      { controlId: 'utime', controlName: _l('最近修改时间'), type: 16 },
    ].concat(controls);
    let cardControls = new Array(showControls.length);
    allControls.forEach(control => {
      const indexOfShowControls = showControls.indexOf(control.controlId);
      if (indexOfShowControls > -1 && control.attribute !== 1) {
        cardControls[indexOfShowControls] = control;
      }
    });
    if (titleControl) {
      cardControls = [titleControl].concat(cardControls);
    }
    return cardControls.filter(c => !!c);
  }
  render() {
    const {
      canSelectAll,
      maxCount,
      selectedCount,
      viewId,
      relateSheetId,
      control,
      filterRelatesheetControlIds,
      recordId,
      visible,
      multiple,
      allowNewRecord,
      defaultRelatedSheet,
      onOk,
      onClose,
      singleConfirm,
      onText,
      masterRecordRowId,
      isCharge,
      isDraft,
    } = this.props;
    const {
      loading,
      selectAll,
      loadouted,
      error,
      list,
      controls,
      selectedRecords,
      keyWords,
      worksheet,
      showNewRecord,
      allowAdd,
      quickFilters = [],
      focusIndex,
      filterForControlSearch,
    } = this.state;
    const { cardControls } = this;
    const allowShowIgnoreAllFilters = isCharge && recordId === 'FAKE_RECORD_ID_FROM_BATCH_EDIT';
    const searchConfig = control ? getSearchConfig(control) : {};
    const { clickSearch, searchControl } = searchConfig;
    const showList = !control || !(clickSearch && !keyWords);
    const coverCid = this.props.coverCid || (control && control.coverCid);
    return (
      <Dialog
        className="recordCardListDialog"
        overlayClosable={false}
        anim={false}
        visible={visible}
        width={window.innerWidth - 20 > 960 ? 960 : window.innerWidth - 20}
        footer={null}
        onCancel={onClose}
      >
        <div
          className="recordCardListCon flexColumn"
          style={{ height: window.innerHeight > 1000 ? 1000 - 138 : window.innerHeight - 138 }}
        >
          {!error && (
            <Header
              entityName={worksheet.entityName}
              projectId={worksheet.projectId}
              appId={worksheet.appId}
              control={control}
              searchConfig={searchConfig}
              controls={controls}
              quickFilters={quickFilters}
              onSearch={this.handleSearch}
              onFilter={this.handleFilter}
              onKeyDown={this.handleInputKeyDown}
            />
          )}
          {showList ? (
            <React.Fragment>
              {error !== 'notCorrectCondition' && (
                <div
                  className="recordCardListHeader flexRow"
                  style={{ padding: coverCid ? '6px 94px 6px 6px' : '6px' }}
                >
                  {cardControls.slice(0, 7).map((control, i) => {
                    const canSort = this.canSort(control);
                    const isAsc = this.getControlSortStatus(control);
                    return (
                      <div
                        className={cx('controlName flex Hand', { title: control.attribute })}
                        key={i}
                        onClick={() => {
                          this.handleSort(control, isAsc);
                        }}
                      >
                        {control.attribute === 1 ? (
                          <i className="icon icon-ic_title"></i>
                        ) : (
                          <span className="ellipsis Bold Font12 Gray_75 controlNameValue">{control.controlName}</span>
                        )}
                        {canSort && (
                          <span className="orderStatus">
                            <span className="flexColumn">
                              <i className={cx('icon icon-arrow-up', { ThemeColor3: isAsc === true })}></i>
                              <i className={cx('icon icon-arrow-down', { ThemeColor3: isAsc === false })}></i>
                            </span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <ScrollView
                className="recordCardList flex"
                ref={this.listRef}
                onScrollEnd={() => {
                  if (!loading && !loadouted) {
                    this.loadNext();
                  }
                }}
              >
                {list.length
                  ? list.map((record, i) => {
                      const selected = !!_.find(selectedRecords, r => r.rowid === record.rowid);
                      const focused = focusIndex === i;
                      return (
                        <RecordCard
                          key={i}
                          from={2}
                          coverCid={coverCid}
                          isCharge={isCharge}
                          projectId={worksheet.projectId}
                          worksheetId={relateSheetId}
                          showControls={cardControls.map(c => c.controlId)}
                          controls={controls}
                          data={record}
                          selected={selected}
                          focused={focused}
                          onClick={() => {
                            this.setState({
                              focusIndex: i,
                            });
                            this.handleSelect(record, !selected);
                          }}
                        />
                      );
                    })
                  : !loading && (
                      <div className="empty">
                        <div className="emptyIcon">
                          <i className="icon Icon icon-ic-line Font56" />
                          {error ? (
                            <p className="emptyTip">
                              {error === 'notCorrectCondition'
                                ? _l('不存在符合条件的%0', worksheet.entityName || control.sourceEntityName || '')
                                : _l('没有权限')}
                              {error === 'notCorrectCondition' && allowShowIgnoreAllFilters && (
                                <div
                                  className="mTop10 ThemeColor3 TxtCenter Hand"
                                  onClick={() => this.setState({ ignoreAllFilters: true }, this.loadRecord)}
                                >
                                  {_l('查看全部记录')}
                                </div>
                              )}
                            </p>
                          ) : (
                            <p className="emptyTip">
                              {keyWords
                                ? _l('无匹配的结果')
                                : worksheet.entityName
                                ? _l('暂无%0', worksheet.entityName)
                                : _l('暂无记录')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                {loading && <LoadDiv />}
              </ScrollView>
            </React.Fragment>
          ) : (
            <div className="flex clickSearchTip">{_l('输入%0进行查询', searchControl.controlName)}</div>
          )}
          {(!error || error === 'notCorrectCondition') && (multiple || allowNewRecord) && (
            <div className="recordCardListFooter">
              {allowNewRecord && allowAdd && (
                <span
                  className="addRecord Hand InlineBlock ThemeBGColor3 ThemeHoverBGColor2"
                  onClick={() => {
                    if (selectedCount + selectedRecords.length >= maxCount) {
                      alert(_l('最多关联%0条', maxCount), 3);
                      return;
                    }
                    this.setState({ showNewRecord: true });
                  }}
                >
                  <i className="icon icon-plus mRight3"></i>
                  <span className="bold">{_l('新建%0', worksheet.entityName || '')}</span>
                </span>
              )}
              {showNewRecord && (
                <NewRecord
                  className="worksheetRelateNewRecord worksheetRelateNewRecordFromSelectRelateRecord"
                  viewId={viewId}
                  worksheetId={relateSheetId}
                  projectId={worksheet.projectId}
                  masterRecordRowId={masterRecordRowId}
                  addType={2}
                  entityName={worksheet.entityName}
                  filterRelateSheetIds={[relateSheetId]}
                  filterRelatesheetControlIds={filterRelatesheetControlIds}
                  defaultFormDataEditable
                  isDraft={isDraft}
                  defaultFormData={
                    searchControl && checkIsTextControl(searchControl.type) && keyWords
                      ? {
                          [searchControl.controlId]: keyWords,
                        }
                      : {}
                  }
                  defaultRelatedSheet={defaultRelatedSheet}
                  visible={showNewRecord}
                  hideNewRecord={() => {
                    this.setState({ showNewRecord: false });
                  }}
                  onAdd={row => {
                    if (multiple || singleConfirm) {
                      this.setState(
                        {
                          list: [row, ...list],
                        },
                        () => {
                          this.handleSelect(row, true);
                        },
                      );
                    } else {
                      onOk([row]);
                      onClose();
                    }
                  }}
                />
              )}
              {showList && canSelectAll && (
                <Checkbox
                  className="InlineBlock mTop8"
                  text={_l('全选（已选择%0/%1条）', selectedRecords.length, list.length)}
                  checked={selectAll}
                  onClick={() => {
                    this.setState({ selectAll: !selectAll, selectedRecords: selectAll ? [] : list.slice(0, 1000) });
                    if (selectAll) {
                      return;
                    }
                    if (list.length > 1000) {
                      alert(_l('最多选择1000条记录'), 3);
                    } else if (loadouted) {
                      alert(_l('全选所有%0行记录', list.length));
                    } else {
                      alert(_l('全选已加载的%0行记录，滚动加载更多记录', list.length));
                    }
                  }}
                />
              )}
              {(multiple || singleConfirm) && (
                <span className="Right">
                  <Button type="link" onClick={onClose}>
                    {_l('取消')}
                  </Button>
                  <Button
                    type="primary"
                    className="mLeft10"
                    disabled={!selectedRecords.length}
                    onClick={this.handleConfirm}
                  >
                    {multiple && !canSelectAll && selectedRecords.length
                      ? _l('确定(%0)', selectedRecords.length)
                      : onText || _l('确定')}
                  </Button>
                </span>
              )}
            </div>
          )}
        </div>
      </Dialog>
    );
  }
}

export function selectRecord(props) {
  functionWrap(RecordCardListDialog, props);
}
