import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { Icon, ScrollView, LoadDiv } from 'ming-ui';
import { Modal, WingBlank, Button } from 'antd-mobile';
import sheetAjax from 'src/api/worksheet';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import NewRecord from 'src/pages/worksheet/common/newRecord/MobileNewRecord';
import RelateScanQRCode from 'src/components/newCustomFields/components/RelateScanQRCode';
import RecordCard from 'src/components/recordCard';
import { fieldCanSort } from 'src/pages/worksheet/util';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { FROM } from 'src/components/newCustomFields/tools/config';
import { getIsScanQR } from 'src/components/newCustomFields/components/ScanQRCode';
import './mobile.less';
import _ from 'lodash';

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
    };
    this.clickSearch = clickSearch;
    this.lazyLoadRecorcd = _.debounce(this.loadRecorcd, 500);
  }
  componentDidMount() {
    const { control, keyWords } = this.props;
    if (control) {
      (window.isPublicWorksheet ? publicWorksheetAjax : sheetAjax)
        .getWorksheetInfo({ worksheetId: control.dataSource, getTemplate: true })
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
            !this.clickSearch || keyWords ? this.loadRecorcd : () => {},
          );
        });
    } else {
      if (!this.clickSearch || keyWords) {
        this.loadRecorcd();
      }
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.keyWords !== nextProps.keyWords) {
      this.setState({
        keyWords: nextProps.keyWords,
      });
    }
  }
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
      parentWorksheetId,
      recordId,
      controlId,
      multiple,
      control,
      formData,
      getDataType,
      relationRowIds = [],
    } = this.props;
    const { pageIndex, keyWords, list, sortControls, worksheetInfo } = this.state;
    if (!keyWords && this.clickSearch) {
      return;
    }
    let getFilterRowsPromise, args;
    let filterControls;
    if (control && control.advancedSetting.filters) {
      if (worksheetInfo) {
        control.relationControls = worksheetInfo.template.controls;
      }
      filterControls = getFilter({ control, formData });
    }
    // 存在不符合条件值的条件
    if (filterControls === false) {
      this.setState({ loading: false });
      return;
    }

    if (from !== FROM.PUBLIC && !window.isPublicWorksheet) {
      getFilterRowsPromise = sheetAjax.getFilterRows;
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
        formId: window.publicWorksheetShareId,
      };
      if (window.recordShareLinkId) {
        args.linkId = window.recordShareLinkId;
      }
    }
    if (parentWorksheetId && controlId) {
      args.relationWorksheetId = parentWorksheetId;
      args.rowId = recordId;
      args.controlId = controlId;
    }
    this.setState({ loading: true });
    this.abortSearch();
    this.searchAjax = getFilterRowsPromise(args);
    this.searchAjax
      .then(res => {
        if (res.resultCode === 1) {
          this.setState(
            {
              list: getDataType
                ? list.concat(res.data.filter(rec => !_.includes(relationRowIds, rec.rowid)))
                : list.concat(res.data.filter(record => !_.find(filterRowIds, fid => record.rowid === fid))),
              loading: false,
              loadouted: res.data.length < 20,
              controls: res.template ? res.template.controls : [],
              worksheet: res.worksheet || {},
            },
            () => {
              if (this.props.keyWords && res.data.length === 1) {
                this.setState({
                  selectedRecords: [res.data[0]],
                });
              }
            },
          );
        } else {
          this.setState({
            loading: false,
            error: true,
          });
        }
      })
      .fail(() => {
        alert(_l('获取列表失败'), 3);
      });
  }
  loadNext() {
    this.setState(
      {
        pageIndex: this.state.pageIndex + 1,
        loading: true,
      },
      this.loadRecorcd,
    );
  }
  @autobind
  handleSearch(value) {
    this.setState(
      {
        keyWords: value,
        pageIndex: 1,
        loading: true,
        list: [],
      },
      () => {
        if (!value && this.clickSearch) {
          this.abortSearch();
          this.setState({ loading: false });
          return;
        }
        this.lazyLoadRecorcd();
      },
    );
  }
  @autobind
  handleSelect(record, selected) {
    const { multiple, onOk, onClose } = this.props;
    const { selectedRecords } = this.state;
    if (multiple) {
      this.setState({
        selectedRecords: selected
          ? _.uniqBy(selectedRecords.concat(record))
          : selectedRecords.filter(r => r.rowid !== record.rowid),
      });
    } else {
      onOk([record]);
      onClose();
    }
  }
  @autobind
  handleConfirm() {
    const { onOk, onClose } = this.props;
    const { selectedRecords, list } = this.state;
    onOk(selectedRecords);
    onClose();
  }
  @autobind
  handleSort(control, isAsc) {
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
  }
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
    const { showControls } = this.props;
    const { controls } = this.state;
    const titleControl = _.find(controls, c => c.attribute === 1);
    const allControls = [
      { controlId: 'ownerid', controlName: _l('拥有者'), type: 26 },
      { controlId: 'caid', controlName: _l('创建者'), type: 26 },
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
  renderSearchWrapper() {
    const isScanQR = getIsScanQR();
    const { relateSheetId, onOk, onClose, control, formData, parentWorksheetId } = this.props;
    const { keyWords, worksheet, worksheetInfo } = this.state;
    const filterControls = getFilter({ control, formData });
    return (
      <div className="searchWrapper">
        <Icon icon="h5_search" />
        <input
          type="text"
          placeholder={_l('搜索%0', worksheet.entityName || _.get(worksheetInfo, 'entityName') || _l('记录'))}
          value={keyWords}
          onChange={e => {
            this.handleSearch(e.target.value);
          }}
        />
        {keyWords ? (
          <Icon
            icon="workflow_cancel"
            onClick={() => {
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
              onChange={data => {
                onOk([data]);
                onClose();
              }}
              onOpenRecordCardListDialog={keyWords => {
                setTimeout(() => {
                  this.handleSearch(keyWords);
                }, 200);
              }}
            >
              <Icon className="Font20" icon="qr_code_19" />
            </RelateScanQRCode>
          )
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
      coverCid,
      onOk,
      onClose,
      control,
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
          <WingBlank size="md">
            <div
              className="worksheetRecordCard allowNewRecordBtn valignWrapper flexRow"
              onClick={() => {
                this.setState({ showNewRecord: true });
              }}
            >
              <Icon icon="add" className="Font24" />
              <span className="bold">{_l('新建%0', worksheet.entityName || '')}</span>
            </div>
          </WingBlank>
        ) : null}
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
          showDraft={advancedSetting.closedrafts !== '1'}
          showDraftsEntry={true}
          sheetSwitchPermit={control.sheetSwitchPermit}
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
            }
          }}
        />
        {list.length
          ? list.map((record, i) => {
              const selected = !!_.find(selectedRecords, r => r.rowid === record.rowid);
              return (
                <WingBlank key={i} size="md">
                  <RecordCard
                    from={3}
                    coverCid={coverCid}
                    showControls={showControls}
                    controls={controls}
                    data={record}
                    selected={selected}
                    onClick={() => this.handleSelect(record, !selected)}
                  />
                </WingBlank>
              );
            })
          : !loading && (
              <div className="empty valignWrapper flexRow">
                <div className="emptyIcon flexColumn valignWrapper">
                  <i className="icon Icon icon-ic-line Font56" />
                  {error ? (
                    <p className="emptyTip Gray_9e">{_l('没有权限')}</p>
                  ) : (
                    <p className="emptyTip Gray_9e">
                      {keyWords
                        ? _l('无匹配的结果')
                        : this.clickSearch
                        ? _l(
                            '输入%0后，显示可选择的记录',
                            worksheet.entityName || _.get(worksheetInfo, 'entityName') || _l('记录'),
                          )
                        : _l('暂无%0', worksheet.entityName || _l('记录'))}
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
    const { visible, onClose, multiple, disabledManualWrite } = this.props;
    const { value, worksheet, selectedRecords } = this.state;
    return (
      <Modal popup visible={visible} onClose={onClose} animationType="slide-up" className="h100">
        <div className="flexColumn leftAlign mobileRecordCardListDialog h100">
          {!disabledManualWrite && this.renderSearchWrapper()}
          {this.renderContent()}
          <div className="btnsWrapper valignWrapper flexRow">
            <WingBlank className="flex" size="sm">
              <Button className="Gray_75 bold" onClick={onClose}>
                {_l('取消')}
              </Button>
            </WingBlank>
            {multiple && (
              <WingBlank className="flex" size="sm">
                <Button className="bold" type="primary" disabled={!selectedRecords.length} onClick={this.handleConfirm}>
                  {multiple && selectedRecords.length ? _l('确定(%0)', selectedRecords.length) : _l('确定')}
                </Button>
              </WingBlank>
            )}
          </div>
        </div>
      </Modal>
    );
  }
}

export function mobileSelectRecord(props) {
  const div = document.createElement('div');
  document.body.appendChild(div);
  function destory() {
    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
  }
  ReactDOM.render(<RecordCardListDialog visible {...props} onClose={destory} />, div);
}
