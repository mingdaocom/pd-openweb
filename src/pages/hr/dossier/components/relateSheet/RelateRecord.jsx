import PropTypes from 'prop-types';
import React, { Component } from 'react';
import sheetAjax from 'src/api/worksheet';
import ScrollView from 'ming-ui/components/ScrollView';
import LoadDiv from 'ming-ui/components/LoadDiv';
import NewRecord from 'src/pages/worksheet/common/newRecord/NewRecord';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import _ from 'lodash';

export default class RelateRecord extends Component {
  static propTypes = {
    style: PropTypes.shape({}),
    appId: PropTypes.string,
    viewId: PropTypes.string,
    closeRelate: PropTypes.func,
    dataChange: PropTypes.func, // 选择记录回调
    worksheetId: PropTypes.string, // 当前工作表Id
    relateSheetId: PropTypes.string, // 关联的表Id
    entityName: PropTypes.string, // 关联的表记录名称
    relateSheetBeLongProject: PropTypes.string, // 关联的表归属网络Id
    filterRowId: PropTypes.array, // 过滤选中的记录Id
    allowAdd: PropTypes.bool, // 是否为被关联表的成员（是否可以新建记录）
    recordId: PropTypes.string, // 所在记录的id
    controlId: PropTypes.string, // 关联表记录控件id
  };
  static defaultProps = {
    filterRowId: [],
  };
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 1, // 记录分页
      sheetRecords: [], // 记录
      controls: [], // 控件
      recordTitleId: '', // 记录标题控件id
      loadended: false, // 记录是否全部获取完
      loading: false,
      error: false,
      keyWords: '',
      showAddRecordDialog: false, // 新建记录
    };
    this.searchRecord = _.debounce(this.getRows, 500);
    this.$relateRecord = React.createRef();
  }
  componentWillMount = function () {
    this.getRows();
  };
  componentDidMount() {
    this.computeStyle();
  }
  getRows = function (pageIndex = 1, keyWords) {
    const { appId, viewId, worksheetId, relateSheetId, recordId, controlId } = this.props;
    const clearState = {
      loading: true,
    };
    if (pageIndex === 1 && this.state.sheetRecords.length) {
      clearState.sheetRecords = [];
    }
    this.setState(clearState);
    const args = {
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
    };
    if (worksheetId && recordId && controlId) {
      args.relationWorksheetId = worksheetId;
      args.rowId = recordId;
      args.controlId = controlId;
    }
    sheetAjax.getFilterRows(args).then(data => {
      if (data.resultCode !== 1) {
        this.setState({
          loading: false,
          error: true,
        });
        return;
      }
      const loadended = data.data.length < 20;
      let sheetRecords = data.data;
      if (pageIndex !== 1) {
        sheetRecords = this.state.sheetRecords.concat(data.data);
      }
      const filteredSheetRecord = sheetRecords.filter(
        recordItem => !(this.props.filterRowId.indexOf(recordItem.rowid) > -1),
      );
      this.setState(
        {
          pageIndex,
          keyWords,
          loadended,
          sheetRecords: filteredSheetRecord,
          controls: data.template.controls,
          loading: false,
        },
        () => {
          if (filteredSheetRecord.length < 7 && !loadended) {
            this.getRows(pageIndex + 1, keyWords);
          }
        },
      );
    });
  };

  computeStyle = () => {
    const { bottom } = this.$relateRecord.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const marginTop = `-${bottom - windowHeight + 30}px`;
    this.$relateRecord.current.style.marginTop = marginTop;
  };
  render() {
    const { appId, viewId, allowAdd, style } = this.props;
    const { controls, error } = this.state;
    return (
      <div
        ref={this.$relateRecord}
        className="relateRecord"
        style={Object.assign({}, style, allowAdd ? {} : { height: 260 })}
      >
        {this.state.showAddRecordDialog && (
          <NewRecord
            showFillNext
            className="worksheetRelateNewRecord"
            worksheetId={this.props.relateSheetId}
            appId={appId}
            viewId={viewId}
            projectId={this.props.relateSheetBeLongProject}
            addType={2}
            entityName={this.props.entityName}
            filterRelateSheetIds={[this.props.worksheetId]}
            visible={this.state.showAddRecordDialog}
            hideNewRecord={() => {
              this.setState({ showAddRecordDialog: false });
            }}
            onAdd={recordItem => {
              if (viewId && !recordItem.isviewdata) {
                alert(_l('添加成功，但添加的记录不属于当前关联的视图'));
                return;
              }
              const newSheetRecords = this.state.sheetRecords.concat();
              newSheetRecords.unshift(recordItem);
              this.setState({ sheetRecords: newSheetRecords });
            }}
          />
        )}
        <i
          className="Icon icon icon-close Font18 Absolute close Gray_9e pointer ThemeHoverColor3"
          onClick={this.props.closeRelate}
        />
        <div className="relateSearchInput">
          <i className="Icon icon icon-search Font15 mRight10 Gray_9e" />
          <input
            type="text"
            ref={search => (this.search = search)}
            placeholder={_l('搜索%0', this.props.entityName)}
            onKeyUp={event => {
              this.searchRecord(1, event.target.value);
            }}
          />
          {this.state.keyWords && (
            <i
              className="Icon icon icon-closeelement-bg-circle Font15 mLeft10 Gray_9e pointer"
              onClick={() => {
                if (this.search) {
                  this.search.value = '';
                }
                this.getRows();
              }}
            />
          )}
        </div>
        <ScrollView
          onScrollEnd={() => {
            if (!this.state.loadended && !this.state.loading) {
              this.getRows(this.state.pageIndex + 1, this.state.keyWords);
            }
          }}
          className="recordList"
        >
          {this.state.sheetRecords.length > 0 && !error
            ? this.state.sheetRecords.map((item, index) => {
                let recordTitle = _l('未命名');
                const titleControl = _.find(controls, control => control.attribute === 1);
                if (titleControl) {
                  recordTitle =
                    renderCellText(
                      Object.assign({}, titleControl, { type: titleControl.type, value: item[titleControl.controlId] }),
                    ) || _l('未命名');
                }
                return (
                  <div
                    className="recordItem ThemeHoverBGColor3 ellipsis pointer"
                    key={index}
                    onClick={() => {
                      const recordItem = {
                        sid: item.rowid,
                        name: item[titleControl.controlId] || '',
                        link: `/worksheet/${this.props.relateSheetId}/row/${item.rowid}`,
                        type: 8,
                        accountId: '',
                        avatar: '',
                        fullName: '',
                        sourcevalue: JSON.stringify(item),
                        row: item,
                      };
                      this.props.dataChange(recordItem);
                    }}
                  >
                    <i className="Icon icon icon-ic-line Font15 mRight10 Gray_9e" />
                    {recordTitle}
                  </div>
                );
              })
            : !this.state.loading && (
                <div className="noneContent TxtCenter">
                  <i className="icon Icon icon-ic-line Font56" />
                  <div className="TxtCenter Gray_9e mTop8">
                    {this.state.keyWords ? _l('无匹配结果') : _l('没有可见的%0', this.props.entityName)}
                  </div>
                </div>
              )}
          {this.state.loading && <LoadDiv />}
        </ScrollView>
        {allowAdd && (
          <div
            className="newRecord ThemeColor3 pointer"
            onClick={() => {
              this.setState({ showAddRecordDialog: true });
            }}
          >
            <i className="icon Icon icon-plus Font15 mRight8" />
            <span>{_l('添加新%0', this.props.entityName)}</span>
          </div>
        )}
      </div>
    );
  }
}
