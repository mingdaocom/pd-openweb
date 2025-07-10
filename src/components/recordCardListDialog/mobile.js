import React, { Component, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon, LoadDiv, PopupWrapper, ScrollView } from 'ming-ui';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import sheetAjax from 'src/api/worksheet';
import RelateScanQRCode from 'src/components/newCustomFields/components/RelateScanQRCode';
import { getIsScanQR } from 'src/components/newCustomFields/components/ScanQRCode';
import { FROM } from 'src/components/newCustomFields/tools/config';
import { getCurrentValue } from 'src/components/newCustomFields/tools/formUtils';
import RecordCard from 'src/components/recordCard';
import NewRecord from 'src/pages/worksheet/common/newRecord/MobileNewRecord';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { fieldCanSort } from 'src/utils/control';
import RegExpValidator from 'src/utils/expression';
import { compatibleMDJS, handlePushState, handleReplaceState } from 'src/utils/project';
import { replaceControlsTranslateInfo } from 'src/utils/translate';
import MobileFilter from './MobileFilter';
import './mobile.less';

export default class RecordCardListDialog extends Component {
  static propTypes = {
    from: PropTypes.number, // 来源
    appId: PropTypes.string, // 他表字段被关联表所在应用id
    viewId: PropTypes.string, // 他表字段被关联表所在应用所在视图id
    relateSheetId: PropTypes.string, // 他表字段被关联表id
    parentWorksheetId: PropTypes.string, // 记录所在表id
    recordId: PropTypes.string, // 记录id
    controlId: PropTypes.string, // 他表字段id
    allowNewRecord: PropTypes.bool, // 允许新建记录
    disabledManualWrite: PropTypes.bool, // 禁止手动输入
    coverCid: PropTypes.string, // 封面字段 id
    showControls: PropTypes.arrayOf(PropTypes.string), // 显示在卡片里的字段 id 数组
    filterRowIds: PropTypes.arrayOf(PropTypes.string), // 过滤的记录
    filterRelatesheetControlIds: PropTypes.arrayOf(PropTypes.string), // 过滤的关联表控件对应控件id
    multiple: PropTypes.bool, // 是否多选
    visible: PropTypes.bool, // 弹窗显示
    control: PropTypes.bool, // 关联表控件
    onClose: PropTypes.func, // 关闭回掉
    onOk: PropTypes.func, // 确定回掉
    formData: PropTypes.arrayOf(PropTypes.shape({})),
  };
  static defaultProps = {
    allowNewRecord: true,
    disabledManualWrite: false,
    filterRowIds: [],
    showControls: [],
    filterRelatesheetControlIds: [],
    onClose: () => {},
    onOk: () => {},
    formData: [],
  };
  constructor(props) {
    super(props);
    const clickSearch = _.get(props.control, 'advancedSetting.clicksearch') === '1';
    this.state = {
      loading: !clickSearch,
      list: [],
      controls: [],
      sortControls: [],
      selectedRecords: [],
      worksheet: {},
      pageIndex: 1,
      loadouted: false,
      showNewRecord: false,
      keyWords: props.keyWords,
      filtersVisible: false,
      quickFilters: [],
    };
    this.clickSearch = clickSearch;
    this.isOnComposition = false;
  }
  componentDidMount() {
    const {
      control,
      keyWords,
      parentWorksheetId,
      staticRecords = [],
      filterRowIds,
      onOk = () => {},
      onClose = () => {},
    } = this.props;

    if (!_.isEmpty(staticRecords)) {
      this.setState({ list: staticRecords, loading: false });
      return;
    }
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
              allowAdd: data.allowAdd,
              worksheetInfo: data,
            },

            () => {
              if (!this.clickSearch || keyWords) {
                this.handleSearch(keyWords, control.advancedSetting.scancontrolid === 'rowid' ? true : false);
              }
            },
          );
        });
    } else {
      if (!this.clickSearch || keyWords) {
        this.loadRecorcd();
      }
    }
    window.addEventListener('popstate', this.onQueryChange, false);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.keyWords !== nextProps.keyWords) {
      this.setState({
        keyWords: nextProps.keyWords,
      });
    }
  }
  onQueryChange = () => {
    if (this.state.showNewRecord) {
      const { controlId } = this.props;
      handleReplaceState('page', `newRelateRecord-${controlId}`, () => {
        this.setState({ showNewRecord: false });
      });
    }
  };
  abortSearch() {
    if (this.searchAjax && _.isFunction(this.searchAjax.abort)) {
      this.searchAjax.abort();
    }
  }
  loadRecorcd() {
    const {
      from,
      appId,
      viewId,
      relateSheetId,
      filterRowIds,
      ignoreRowIds,
      parentWorksheetId,
      recordId,
      controlId,
      multiple,
      control = {},
      formData,
      getDataType,
      relationRowIds = [],
      isScan,
      fastSearchControlArgs,
      isDraft,
      onOk = () => {},
      onClose = () => {},
      handleReplaceHistoryState = () => {},
    } = this.props;
    const { pageIndex, keyWords, list, sortControls, worksheetInfo, isScanSearch, ignoreAllFilters } = this.state;
    let getFilterRowsPromise, args;
    let filterControls;
    if (control && _.get(control, 'advancedSetting.filters')) {
      if (worksheetInfo) {
        control.relationControls = worksheetInfo.template.controls;
      }
      filterControls = getFilter({ control, formData });
    }
    // 存在不符合条件值的条件
    if (filterControls === false && !ignoreAllFilters) {
      this.setState({ loading: false });
      return;
    }

    const { scanlink, scancontrol, scancontrolid } = _.get(control, 'advancedSetting') || {};

    if (
      isScan &&
      ((scanlink !== '1' && RegExpValidator.isURL(keyWords)) ||
        (scancontrol !== '1' && !RegExpValidator.isURL(keyWords)))
    ) {
      this.setState({ loading: false });
      return;
    }

    const scanControl =
      _.find(_.get(worksheetInfo, 'template.controls') || [], it => it.controlId === scancontrolid) || {};
    const quickFilters = this.state.quickFilters.map(f =>
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
        'advancedSetting',
      ]),
    );
    const fastFilters =
      isScanSearch && scancontrol === '1' && scancontrolid
        ? [
            {
              controlId: scancontrolid,
              dataType: scanControl.type,
              spliceType: 1,
              filterType: 1,
              dateRange: 0,
              minValue: '',
              maxValue: '',
              value: '',
              values: [keyWords],
            },
          ].concat(quickFilters)
        : quickFilters;

    if (from !== FROM.PUBLIC_ADD && !window.isPublicWorksheet) {
      getFilterRowsPromise = sheetAjax.getFilterRows;

      args = {
        worksheetId: relateSheetId,
        appId,
        viewId,
        searchType: 1,
        pageSize: 20,
        pageIndex,
        status: 1,
        keyWords: isScanSearch && scancontrol === '1' && scancontrolid ? '' : keyWords,
        isGetWorksheet: true,
        getType: isDraft ? 27 : 7,
        sortControls,
        filterControls: ignoreAllFilters ? [] : filterControls || [],
        fastFilters,
      };
    } else {
      getFilterRowsPromise = publicWorksheetAjax.getRelationRows;
      args = {
        worksheetId: relateSheetId,
        appId,
        viewId,
        searchType: 1,
        pageSize: 20,
        pageIndex,
        status: 1,
        keyWords,
        isGetWorksheet: true,
        getType: 7,
        sortControls,
        filterControls,
        fastFilters,
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
    if (parentWorksheetId && controlId) {
      args.relationWorksheetId = parentWorksheetId;
      args.rowId = recordId;
      args.controlId = controlId;
      if (ignoreRowIds) {
        args.requestParams = {
          _system_excluderowids: JSON.stringify(ignoreRowIds),
        };
      }
    }

    this.setState({ loading: true });
    this.abortSearch();
    this.searchAjax = getFilterRowsPromise(args);
    this.searchAjax.then(res => {
      if (res.resultCode === 1) {
        let filteredList = _.uniqBy(
          list.concat(res.data.filter(record => !_.find(filterRowIds, fid => record.rowid === fid))),
          'rowid',
        );

        this.setState(
          {
            list: getDataType
              ? list.concat(res.data.filter(rec => !_.includes(relationRowIds, rec.rowid)))
              : filteredList,
            loading: false,
            loadouted: res.data.length < 20,
            controls: res.template
              ? replaceControlsTranslateInfo(res.worksheet.appId, null, res.template.controls)
              : [],
            worksheet: res.worksheet || {},
          },
          () => {
            if (this.props.keyWords && res.data.length === 1) {
              this.setState({
                selectedRecords: [res.data[0]],
              });
            }
            if (!this.state.loadouted && filteredList.length < 8) {
              this.loadNext();
            }

            if (window.isMingDaoApp && isScan && multiple) {
              const firstRow = res.data && res.data.length ? res.data[0] : {};
              if (filteredList.length > 1) {
                // 终止扫码，用户手动选
                compatibleMDJS('stopScanWithControls', { cid: controlId, cancel: () => {} });
              } else if (filteredList.length === 1) {
                const titleControl = _.find(_.get(control, 'relationControls'), i => i.attribute === 1) || {};
                const nameValue = titleControl ? firstRow[titleControl.controlId] : undefined;
                // 直接关联
                onOk([firstRow]);
                this.appScanCallback({
                  controlId,
                  enumDefault: control.enumDefault,
                  controlName: control.controlName,
                  title: getCurrentValue(titleControl, nameValue, { type: 2 }),
                  rowId: firstRow.rowid,
                });
                onClose();
                handleReplaceHistoryState();
              } else {
                this.appScanCallback({
                  controlId,
                  enumDefault: control.enumDefault,
                  controlName: control.controlName,
                  title: '',
                  rowId: '',
                  type: _.isEmpty(firstRow) ? '1' : '3',
                });
                onClose();
                handleReplaceHistoryState();
              }
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

  // 关联记录关联成功将当前关联数据通过js sdk返回给APP
  appScanCallback = ({ enumDefault, controlId, controlName, title, rowId, type, msg }) => {
    if (enumDefault !== 2) {
      return;
    }
    compatibleMDJS('scanRelationLoaded', {
      cid: controlId,
      cname: controlName,
      relation: _.includes(['2', '3'], type)
        ? {}
        : {
            title: title, //关联记录的标题, 注意转换为纯文本提供
            rowId: rowId, //关联记录的Id
          },
      error: !type
        ? undefined
        : {
            type, //"1": 无数据, "2": 不在关联范围内,
            msg, // 对应描述
          },
    });
  };

  loadNext() {
    this.setState(
      {
        pageIndex: this.state.pageIndex + 1,
        loading: true,
      },
      this.loadRecorcd,
    );
  }

  handleSearch = _.debounce((value, isScanSearch) => {
    this.setState(
      {
        keyWords: value,
        pageIndex: 1,
        loading: true,
        list: [],
        isScanSearch,
      },
      () => {
        if (!value && this.clickSearch) {
          // this.abortSearch();
          this.setState({ loading: false });
          return;
        }
        this.loadRecorcd();
      },
    );
  }, 500);

  handleFilter = filters => {
    this.setState(
      {
        quickFilters: filters,
        pageIndex: 1,
        loading: true,
        list: [],
      },
      this.loadRecorcd,
    );
  };

  handleSelect = (record, selected) => {
    const { multiple, onOk, onClose, maxCount, selectedCount, handleReplaceHistoryState = () => {} } = this.props;
    const { selectedRecords } = this.state;

    if (multiple) {
      if (selectedCount + selectedRecords.length >= maxCount) {
        return alert(_l('最多关联%0条', maxCount), 3);
      }
      this.setState({
        selectedRecords: selected
          ? _.uniqBy(selectedRecords.concat(record))
          : selectedRecords.filter(r => r.rowid !== record.rowid),
      });
    } else {
      onOk([record]);
      onClose();
      window.isMingDaoApp && handleReplaceHistoryState();
    }
  };

  handleConfirm = () => {
    const { onOk, onClose, handleReplaceHistoryState = () => {} } = this.props;
    const { selectedRecords, list } = this.state;
    onOk(selectedRecords);
    onClose();
    window.isMingDaoApp && handleReplaceHistoryState();
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
      this.loadRecorcd,
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
  get title() {
    const { control = {} } = this.props;
    const { worksheet, worksheetInfo } = this.state;
    const title = worksheet.entityName || _.get(worksheetInfo, 'entityName') || _l('记录');
    const { searchcontrol } = control.advancedSetting || {};
    if (searchcontrol) {
      const searchControl = _.find(control.relationControls, { controlId: searchcontrol }) || {};
      return searchControl.controlName || title;
    } else {
      return title;
    }
  }
  renderSearchWrapper() {
    const isScanQR = getIsScanQR();
    const {
      relateSheetId,
      onOk,
      onClose,
      control,
      formData,
      parentWorksheetId,
      handleReplaceHistoryState = () => {},
    } = this.props;
    const { keyWords, worksheet, worksheetInfo, filtersVisible, quickFilters } = this.state;
    const filterControls = getFilter({ control, formData });
    const { searchfilters = '[]' } = _.get(control, 'advancedSetting') || {};
    const searchFilters = safeParse(searchfilters, 'array');
    const controls = _.get(worksheetInfo, 'template.controls');

    return (
      <div className="flexRow alignItemsCenter justifyContentCenter mTop10 pLeft10 pRight10">
        <div className="searchWrapper flex">
          <Icon className="Gray_9e" icon="h5_search" />
          <form action="#" className="flex" onSubmit={event => event.preventDefault()}>
            <input
              className="w100"
              type="search"
              ref={node => (this.inputRef = node)}
              placeholder={_l('搜索%0', this.title)}
              onChange={e => {
                if (this.isOnComposition) return;
                this.handleSearch(e.target.value);
              }}
              onCompositionStart={() => (this.isOnComposition = true)}
              onCompositionEnd={e => {
                if (e.type === 'compositionend') {
                  this.isOnComposition = false;
                }
                this.handleSearch(e.target.value);
              }}
            />
          </form>
          {keyWords ? (
            <Icon
              className="Gray_9e"
              icon="workflow_cancel"
              onClick={() => {
                if (this.inputRef) {
                  this.inputRef.value = '';
                }
                this.handleSearch('');
              }}
            />
          ) : (
            isScanQR && (
              <RelateScanQRCode
                projectId={worksheet.projectId}
                worksheetId={relateSheetId}
                filterControls={filterControls}
                parentWorksheetId={parentWorksheetId}
                control={control}
                onChange={data => {
                  onOk([data]);
                  onClose();
                  window.isMingDaoApp && handleReplaceHistoryState();
                }}
                onOpenRecordCardListDialog={keyWords => {
                  const { scanlink, scancontrol } = _.get(control, 'advancedSetting') || {};
                  setTimeout(() => {
                    if (
                      (scanlink !== '1' && RegExpValidator.isURL(keyWords)) ||
                      (scancontrol !== '1' && !RegExpValidator.isURL(keyWords))
                    ) {
                      this.setState({ pageIndex: 1, list: [] });
                      return;
                    }
                    this.handleSearch(keyWords, true);
                  }, 200);
                }}
              >
                <Icon className="Font20 Gray_9e" icon="qr_code_19" />
              </RelateScanQRCode>
            )
          )}
        </div>
        {searchFilters && !!searchFilters.length && (
          <Fragment>
            <div
              className="filterWrapper flexRow alignItemsCenter justifyContentCenter mLeft10"
              onClick={() => this.setState({ filtersVisible: true })}
            >
              <Icon className={cx('Font20', { ThemeColor: quickFilters.length })} icon="filter" />
            </div>
            <MobileFilter
              filtersVisible={filtersVisible}
              worksheetInfo={worksheetInfo}
              searchFilters={searchFilters}
              controls={controls}
              quickFilters={quickFilters}
              onChangeFiltersVisible={filtersVisible => {
                this.setState({ filtersVisible });
              }}
              onChangeQuickFilter={this.handleFilter}
            />
          </Fragment>
        )}
      </div>
    );
  }
  renderContent() {
    const {
      appId,
      viewId,
      relateSheetId,
      filterRelatesheetControlIds,
      recordId,
      parentWorksheetId,
      controlId,
      visible,
      multiple,
      allowNewRecord,
      disabledManualWrite,
      showControls,
      onOk,
      onClose,
      control,
      from,
      isCharge,
      isDraft,
      staticRecords = [],
      handleReplaceHistoryState = () => {},
    } = this.props;
    const {
      loading,
      loadouted,
      error,
      list,
      controls,
      selectedRecords,
      keyWords,
      worksheet,
      worksheetInfo,
      showNewRecord,
    } = this.state;
    const { advancedSetting = {} } = worksheetInfo || {};
    const { cardControls } = this;
    const formData = this.props.formData.filter(_.identity);
    const titleControl = formData.filter(c => c && c.attribute === 1);
    const defaultRelatedSheetValue = titleControl && {
      name: titleControl.value,
      sid: recordId,
      type: 8,
      sourcevalue: JSON.stringify({
        ..._.assign(...formData.map(c => ({ [c.controlId]: c.value }))),
        [titleControl.controlId]: titleControl.value,
        rowid: recordId,
      }),
    };
    const coverCid = this.props.coverCid || (control && control.coverCid);
    const entityName = worksheet.entityName || _.get(worksheetInfo, 'entityName') || _l('记录');
    const allowShowIgnoreAllFilters = isCharge && recordId === 'FAKE_RECORD_ID_FROM_BATCH_EDIT';

    return (
      <ScrollView
        className="recordCardList mTop10 flex"
        onScrollEnd={() => {
          if (!loading && !loadouted) {
            this.loadNext();
          }
        }}
      >
        {allowNewRecord && !disabledManualWrite ? (
          <div className="mLeft8 mRight8">
            <div
              className="worksheetRecordCard allowNewRecordBtn valignWrapper flexRow"
              onClick={() => {
                handlePushState('page', `newRelateRecord-${controlId}`);
                this.setState({ showNewRecord: true });
              }}
            >
              <Icon icon="add" className="Font24" />
              <span className="bold">{_l('新建%0', entityName)}</span>
            </div>
          </div>
        ) : null}
        {showNewRecord && (
          <NewRecord
            hideFillNext
            appId={appId}
            viewId={viewId}
            worksheetId={relateSheetId}
            projectId={worksheet.projectId}
            addType={2}
            entityName={worksheet.entityName}
            filterRelateSheetIds={[relateSheetId]}
            filterRelatesheetControlIds={filterRelatesheetControlIds}
            defaultRelatedSheet={{
              worksheetId: parentWorksheetId,
              relateSheetControlId: controlId,
              value: defaultRelatedSheetValue,
            }}
            visible={showNewRecord}
            isDraft={isDraft}
            showDraftsEntry={true}
            sheetSwitchPermit={control && control.sheetSwitchPermit}
            hideNewRecord={() => {
              this.setState({ showNewRecord: false });
            }}
            onAdd={row => {
              if (multiple) {
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
                window.isMingDaoApp && handleReplaceHistoryState();
              }
            }}
          />
        )}
        {list.length
          ? list.map((record, i) => {
              if (!_.isEmpty(staticRecords)) {
                return (
                  <div
                    className="worksheetRecordCard mobile noControls withoutCover"
                    onClick={() => this.handleSelect(record, !selected)}
                  >
                    <p className="titleText ellipsis">{record.name}</p>
                  </div>
                );
              }
              const selected = !!_.find(selectedRecords, r => r.rowid === record.rowid);
              return (
                <div key={i} className="mLeft8 mRight8">
                  <RecordCard
                    from={3}
                    control={control}
                    coverCid={coverCid}
                    showControls={cardControls.map(c => c.controlId)}
                    controls={controls}
                    data={record}
                    selected={selected}
                    onClick={() => this.handleSelect(record, !selected)}
                  />
                </div>
              );
            })
          : !loading && (
              <div className="empty valignWrapper flexRow">
                <div className="emptyIcon flexColumn valignWrapper">
                  <i className="icon Icon icon-ic-line Font56" />
                  {error ? (
                    <p className="emptyTip Gray_9e">
                      {error === 'notCorrectCondition'
                        ? _l('不存在符合条件的%0', worksheet.entityName || control.sourceEntityName || '')
                        : _l('没有权限')}

                      {error === 'notCorrectCondition' && allowShowIgnoreAllFilters && (
                        <div
                          className="mTop10 ThemeColor3 TxtCenter Hand"
                          onClick={() => this.setState({ ignoreAllFilters: true }, this.loadRecorcd)}
                        >
                          {_l('查看全部记录')}
                        </div>
                      )}
                    </p>
                  ) : (
                    <p className="emptyTip Gray_9e">
                      {keyWords
                        ? _l('无匹配的结果')
                        : this.clickSearch
                          ? _l('输入%0后，显示可选择的记录', this.title)
                          : _l('暂无%0', entityName)}
                    </p>
                  )}
                </div>
              </div>
            )}
        {loading && <LoadDiv />}
      </ScrollView>
    );
  }
  render() {
    const {
      visible,
      onClose,
      multiple,
      disabledManualWrite,
      filterRowIds,
      onClear,
      className,
      handleReplaceHistoryState = () => {},
    } = this.props;
    const { value, worksheet, selectedRecords } = this.state;

    return (
      <PopupWrapper
        className={className}
        bodyClassName="heightPopupBody40"
        visible={visible}
        title={_l('关联记录')}
        confirmDisable={!selectedRecords.length}
        confirmText={selectedRecords.length ? _l('确定(%0)', selectedRecords.length) : _l('确定')}
        onClose={() => {
          onClose();
          window.isMingDaoApp && handleReplaceHistoryState();
        }}
        onConfirm={multiple ? this.handleConfirm : null}
        clearDisable={!multiple && !filterRowIds.length}
        onClear={
          !multiple
            ? () => {
                onClear();
                onClose();
                window.isMingDaoApp && handleReplaceHistoryState();
              }
            : null
        }
      >
        <div className="flexColumn mobileRecordCardListDialog">
          {!disabledManualWrite && this.renderSearchWrapper()}
          {this.renderContent()}
        </div>
      </PopupWrapper>
    );
  }
}

export function mobileSelectRecord(props) {
  const div = document.createElement('div');

  document.body.appendChild(div);

  const root = createRoot(div);

  function destory() {
    root.unmount();
    document.body.removeChild(div);
  }

  root.render(<RecordCardListDialog visible {...props} onClose={destory} />);
}
