import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Popup } from 'antd-mobile';
import _ from 'lodash';
import { Icon, ScrollView } from 'ming-ui';
import { RecordInfoModal } from 'mobile/Record';
import * as actions from 'src/pages/worksheet/redux/actions/calendarview';
import { addBehaviorLog, handlePushState, handleReplaceState } from 'src/utils/project';
import { getRecordColor, getRecordColorConfig } from 'src/utils/record';
import withoutRows from '../../../../SheetRows/assets/withoutRows.png';
import { dateFormat } from '../util.js';
import './index.less';

class CurrentDateInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSearch: false,
      searchValue: '',
      searchResultData: [],
      previewRecordId: undefined,
    };
  }
  componentDidMount() {
    window.addEventListener('popstate', this.onQueryChange);
  }
  componentWillUnmount() {
    window.removeEventListener('popstate', this.onQueryChange);
  }
  onQueryChange = () => {
    handleReplaceState('page', 'recordDetail', () => this.setState({ previewRecordId: undefined }));
  };
  close = () => {
    this.props.mobileIsShowMoreClick(false);
    this.setState({
      searchValue: '',
      searchResultData: [],
    });
  };
  // 数据搜索
  searchResult = value => {
    let searchValue = value || this.state.searchValue;
    let { mobileCurrentCalendatData = [] } = this.props;
    let searchResultData = mobileCurrentCalendatData.filter(item => item.title.includes(searchValue));
    this.setState({ searchResultData });
  };
  // 跳转至详情
  navigateToDetail = rowId => {
    if (window.isMingDaoApp && !window.shareState.shareId) {
      const { base } = this.props;
      window.location.href = `/mobile/record/${base.appId}/${base.worksheetId}/${base.viewId}/${rowId}`;
      return;
    }
    handlePushState('page', 'recordDetail');
    this.setState({ previewRecordId: rowId });
  };
  render() {
    let { searchValue, isSearch, searchResultData, previewRecordId } = this.state;
    let {
      base = {},
      mobileCurrentCalendatData = [],
      mobileCurrentDate,
      visible,
      controls = [],
      worksheetInfo = {},
      view = {},
      isCharge,
    } = this.props;
    let listData =
      isSearch && searchResultData.length
        ? searchResultData
        : !isSearch && mobileCurrentCalendatData.length
          ? mobileCurrentCalendatData
          : [];
    return (
      <Fragment>
        <Popup
          className="currentDateInfoModal mobileModal minFull topRadius"
          visible={visible}
          closeOnMaskClick={true}
          onClose={this.close}
        >
          <div className="modalContentBox flexColumn">
            <div className="header">
              {mobileCurrentDate}
              <div className="closeIcon">
                <Icon icon="close" onClick={this.close} />
              </div>
            </div>
            {listData.length ? (
              <div className="searchWrapper">
                <Icon icon="search" className="searchIcon Font20" />
                <input
                  type="text"
                  className="cursorText"
                  placeholder={_l('搜索记录')}
                  onChange={event => {
                    const searchValue = event.target.value;
                    this.setState({ searchValue });
                  }}
                  onKeyUp={e => {
                    if (e.keyCode === 13) {
                      const searchValue = e.target.value;
                      this.setState({ isSearch: true }, () => {
                        this.searchResult(searchValue);
                      });
                    }
                  }}
                  value={searchValue}
                />
              </div>
            ) : null}
            {(listData.length && (
              <ScrollView className="flex listBox">
                {listData.map(item => {
                  let controlItem = {},
                    keyFields = '',
                    value = '',
                    flag = false;
                  controls.forEach(it => {
                    if (_.has(item.extendedProps, it.controlId) && it.type === 11) {
                      controlItem = it;
                      keyFields = item.extendedProps[it.controlId];
                      flag = true;
                    }
                  });
                  let options = controlItem.options || [];
                  options.forEach(it => {
                    if (keyFields && it.key === JSON.parse(keyFields).join(' ')) {
                      value = it.value;
                    }
                  });
                  let radioStyle = {
                    display: 'inline-block',
                    minWidth: ' 55px',
                    textAlign: 'center',
                    height: '22px',
                    lineHeight: '22px',
                    padding: '0 8px',
                    margin: '10px 0 8px',
                    borderRadius: '11px',
                    backgroundColor: item.backgroundColor,
                    borderColor: item.borderColor,
                    color: item.textColor,
                  };

                  const recordColorConfig = getRecordColorConfig(view);
                  const recordColor =
                    recordColorConfig &&
                    getRecordColor({
                      controlId: recordColorConfig.controlId,
                      colorItems: recordColorConfig.colorItems,
                      controls,
                      row: item.extendedProps,
                    });
                  return (
                    <div
                      className="listItem Relative"
                      key={item.extendedProps.rowid}
                      style={{
                        backgroundColor: recordColor && recordColorConfig.showBg ? recordColor.lightColor : undefined,
                        border:
                          recordColor && recordColorConfig.showBg ? `1px solid ${recordColor.lightColor}` : undefined,
                      }}
                      onClick={() => {
                        this.navigateToDetail(item.extendedProps.rowid);
                        addBehaviorLog('worksheetRecord', base.worksheetId, { rowId: item.extendedProps.rowid }); // 埋点
                      }}
                    >
                      {recordColor && recordColorConfig.showLine && (
                        <div className="colorTag" style={{ backgroundColor: recordColor.color }}></div>
                      )}
                      <div
                        className="title Font14 Bold ellipsis"
                        title={item.title}
                        style={{ WebkitBoxOrient: 'vertical' }}
                      >
                        {item.title}
                      </div>
                      {flag ? value ? <div style={radioStyle}>{value}</div> : <div className="null"></div> : null}
                      {item.start && (
                        <div className="Gray_9e Font13 mTop2 flexRow">
                          {dateFormat(item.start, item.end)}
                          {item.mark && <span className="mLeft10">{item.mark}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </ScrollView>
            )) ||
              null}

            {!listData.length ? (
              <div className="emptyContainer flexColumn flex">
                <img className="img" src={withoutRows} style={{ width: '72px' }} />
                <div>{_l('你这一天没有日程')}</div>
              </div>
            ) : null}
          </div>
        </Popup>
        <RecordInfoModal
          className="full"
          visible={!!previewRecordId}
          enablePayment={worksheetInfo.enablePayment}
          appId={base.appId}
          worksheetId={base.worksheetId}
          viewId={base.viewId}
          rowId={previewRecordId}
          isCharge={isCharge}
          onClose={() => {
            this.setState({
              previewRecordId: undefined,
            });
          }}
        />
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    mobileCurrentCalendatData: state.sheet.calendarview.mobileCurrentCalendatData,
    mobileCurrentDate: state.sheet.calendarview.mobileCurrentDate,
    base: state.sheet.base,
    controls: state.sheet.controls,
    worksheetInfo: state.mobile.worksheetInfo,
    isCharge: state.mobile.isCharge,
  }),
  dispatch => bindActionCreators(_.pick(actions, ['mobileIsShowMoreClick', 'changeMobileCurrentData']), dispatch),
)(CurrentDateInfo);
