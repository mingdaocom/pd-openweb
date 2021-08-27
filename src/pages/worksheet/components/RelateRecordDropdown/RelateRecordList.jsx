import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { LoadDiv, ScrollView } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import { getFilter } from 'worksheet/common/WorkSheetFilter/util';
import ReacordItem from './RecordItem';

export default class RelateRecordList extends React.PureComponent {
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
    onItemClick: PropTypes.func,
    onClear: PropTypes.func,
    onNewRecord: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      keyWords: '',
      records: [],
      pageIndex: 1,
    };
    this.handleSearch = _.debounce(this.handleSearch, 300);
  }

  componentDidMount() {
    const { control } = this.props;
    if (control) {
      (window.isPublicWorksheet ? publicWorksheetAjax : sheetAjax)
        .getWorksheetInfo({ worksheetId: control.dataSource, getTemplate: true })
        .then(data => {
          this.setState(
            {
              allowAdd: data.allowAdd,
              worksheetInfo: data,
            },
            this.loadRecorcd,
          );
        });
    } else {
      this.loadRecorcd();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.keyWords !== this.props.keyWords) {
      this.handleSearch(nextProps.keyWords);
    }
  }

  loadRecorcd() {
    const {
      from,
      control,
      formData,
      viewId,
      dataSource,
      selectedIds,
      parentWorksheetId,
      recordId,
      controlId,
      multiple,
    } = this.props;
    const { pageIndex, keyWords, records, worksheetInfo } = this.state;
    let filterControls;
    if (control && control.advancedSetting.filters) {
      if (worksheetInfo) {
        control.relationControls = worksheetInfo.template.controls;
      }
      filterControls = getFilter({ control, formData });
    }
    // 存在不符合条件值的条件
    if (filterControls === false) {
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
      pageSize: 20,
      pageIndex,
      status: 1,
      keyWords,
      isGetWorksheet: true,
      getType: 7,
      filterControls,
    };
    if (this.searchAjax && _.isFunction(this.searchAjax.abort)) {
      this.searchAjax.abort();
    }
    if (!window.isPublicWorksheet) {
      getFilterRowsPromise = sheetAjax.getFilterRows;
    } else {
      getFilterRowsPromise = publicWorksheetAjax.getRelationRows;
    }
    this.searchAjax = getFilterRowsPromise(args);
    this.searchAjax.then(res => {
      if (res.resultCode === 1) {
        let newRecords = res.data;
        this.setState({
          records: records.concat(newRecords),
          loading: false,
          loadouted: res.data.length < 20,
          controls: res.template ? res.template.controls : [],
          worksheet: res.worksheet || {},
        });
      } else {
        this.setState({
          loading: false,
          error: true,
        });
      }
    });
  }

  @autobind
  handleSearch(value) {
    this.setState(
      {
        keyWords: value.trim(),
        pageIndex: 1,
        records: [],
      },
      this.loadRecorcd,
    );
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

  render() {
    const {
      style,
      isMobile,
      control,
      coverCid,
      showControls,
      multiple,
      selectedIds,
      showCoverAndControls,
      onItemClick,
      allowNewRecord,
      onNewRecord,
    } = this.props;
    const { error, loading, worksheet = {}, keyWords, records, controls, loadouted, allowAdd } = this.state;
    return (
      <div
        className="RelateRecordList flexColumn"
        style={_.assign({}, style, isMobile ? { width: window.innerWidth } : {})}
      >
        <div className="flex flexColumn listCon">
          <ScrollView
            className="flex"
            onScrollEnd={() => {
              if (!loading && !loadouted) {
                this.loadNext();
              }
            }}
          >
            {!records.length && keyWords && !loading && (
              <div style={{ margin: 12, color: '#9e9e9e', textAlign: 'center', marginTop: 120 }}>
                {_l('无匹配结果')}
              </div>
            )}
            {!records.length && !keyWords && !loading && (
              <div style={{ margin: 12, color: '#9e9e9e', textAlign: 'center', marginTop: 90 }}>
                <i className="icon Icon icon-ic-line Font56 Gray_bd"></i>
                <div className="mTop10">
                  {error
                    ? error === 'notCorrectCondition'
                      ? _l('不存在符合条件的%0', worksheet.entityName || (control && control.sourceEntityName) || '')
                      : _l('没有权限')
                    : _l('暂无记录')}
                </div>
              </div>
            )}
            {!!records.length &&
              records.map((record, index) => (
                <ReacordItem
                  multiple={multiple}
                  selected={_.find(selectedIds, fid => record.rowid === fid)}
                  showCoverAndControls={showCoverAndControls}
                  controls={controls}
                  key={index}
                  showControls={showControls}
                  coverCid={coverCid}
                  data={record}
                  onClick={() => onItemClick(record)}
                />
              ))}
            {loading && (
              <div className="loadingCon">
                {' '}
                <LoadDiv />{' '}
              </div>
            )}
          </ScrollView>
        </div>
        <div style={{ borderTop: '1px solid #ddd' }} />
        {allowNewRecord && allowAdd && !window.isPublicWorksheet && !error && (
          <div className="RelateRecordList-create" onClick={onNewRecord}>
            <i className="icon icon-plus"></i> {worksheet.entityName || (control && control.sourceEntityName)}
          </div>
        )}
      </div>
    );
  }
}
