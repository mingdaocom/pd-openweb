import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { LoadDiv, ScrollView } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import { TextAbsoluteCenter } from 'worksheet/components/StyledComps';
import { getFilter } from 'worksheet/common/WorkSheetFilter/util';
import ReacordItem from './RecordItem';
import _, { times } from 'lodash';

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
    };
    this.handleSearch = _.debounce(this.handleSearch, 500);
  }

  con = React.createRef();

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

  @autobind
  handleEnter() {
    const { onItemClick, onNewRecord } = this.props;
    const { activeId, records } = this.state;
    if (activeId === 'newRecord') {
      onNewRecord();
      return;
    }
    const newActiveRecord = _.find(records, { rowid: activeId });
    if (newActiveRecord) {
      onItemClick(newActiveRecord);
    }
  }

  handleUpdateScroll(newIndex) {
    let itemHeight = 34;
    try {
      itemHeight = this.con.current.querySelector(`.RelateRecordListItem:nth-child(${newIndex})`).offsetHeight;
    } catch (err) {}
    const scrollContent = this.con.current.querySelector('.nano-content');
    const height = scrollContent.clientHeight;
    const scrollTop = scrollContent.scrollTop;
    if (itemHeight * newIndex - scrollTop > height - 20) {
      scrollContent.scrollTop = itemHeight * newIndex - height + itemHeight;
    } else if (itemHeight * newIndex < scrollTop) {
      scrollContent.scrollTop = itemHeight * newIndex;
    }
  }

  @autobind
  updateActiveId(offset) {
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
      this.setState({
        activeId: 'newRecord',
      });
      return;
    }
    const newActiveId = newActiveRecord.rowid;
    this.setState({
      activeId: newActiveId,
    });
  }

  loadRecord() {
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
      staticRecords,
    } = this.props;
    if (!_.isEmpty(staticRecords)) {
      return;
    }
    const { pageIndex, keyWords, records, worksheetInfo } = this.state;
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
    if (parentWorksheetId && controlId) {
      args.relationWorksheetId = parentWorksheetId;
      args.controlId = controlId;
    }
    if (this.searchAjax && _.isFunction(this.searchAjax.abort)) {
      this.searchAjax.abort();
    }
    if (!window.isPublicWorksheet) {
      getFilterRowsPromise = sheetAjax.getFilterRows;
    } else {
      if (window.recordShareLinkId) {
        args.linkId = window.recordShareLinkId;
      }
      args.formId = window.publicWorksheetShareId;
      getFilterRowsPromise = publicWorksheetAjax.getRelationRows;
    }
    this.searchAjax = getFilterRowsPromise(args);
    this.searchAjax.then(res => {
      if (res.resultCode === 1) {
        let newRecords = res.data.filter(row => row.rowid !== recordId);
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
      this.loadRecord,
    );
  }

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
      style,
      maxHeight,
      isMobile,
      control,
      coverCid,
      showControls,
      multiple,
      selectedIds,
      showCoverAndControls,
      prefixRecords = [],
      onItemClick,
      allowNewRecord,
      onNewRecord,
    } = this.props;
    const { error, loading, worksheet = {}, keyWords, controls, loadouted, allowAdd, activeId } = this.state;
    const records = (loading ? [] : prefixRecords).concat(this.state.records);
    if (_.get(control, 'advancedSetting.clicksearch') === '1' && !keyWords) {
      return null;
    }
    const recordItemHeight = showCoverAndControls && showControls.length ? 56 : 36;
    let recordListHeight = records.length * recordItemHeight + 12;
    if (maxHeight) {
      recordListHeight = maxHeight - 48 - 10;
    }
    return (
      <div
        className="RelateRecordList flexColumn"
        ref={this.con}
        style={_.assign({}, style, isMobile ? { width: window.innerWidth } : {})}
      >
        <div
          className="flexColumn"
          style={{
            minHeight: records.length ? recordItemHeight : !records.length && !keyWords && !loading ? 100 : 50,
            height: recordListHeight > 323 ? 323 : recordListHeight,
          }}
        >
          <div className="flex flexColumn listCon" onClick={e => e.stopPropagation()}>
            <ScrollView
              className="flex"
              onScrollEnd={() => {
                if (!loading && !loadouted) {
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
                        ? _l('不存在符合条件的%0', worksheet.entityName || (control && control.sourceEntityName) || '')
                        : _l('没有权限')
                      : _l('暂无记录')}
                  </div>
                </TextAbsoluteCenter>
              )}
              {!!records.length &&
                records.map((record, index) => (
                  <ReacordItem
                    active={activeId === record.rowid}
                    multiple={multiple}
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
        {allowNewRecord && allowAdd && !window.isPublicWorksheet && (!error || error === 'notCorrectCondition') && (
          <div
            className={'RelateRecordList-create ' + (activeId === 'newRecord' ? 'active' : '')}
            onClick={e => {
              e.stopPropagation();
              this.setState({ activeId: undefined });
              onNewRecord(e);
            }}
          >
            <i className="icon icon-plus"></i> {worksheet.entityName || (control && control.sourceEntityName)}
          </div>
        )}
      </div>
    );
  }
}
