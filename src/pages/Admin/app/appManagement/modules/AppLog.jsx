import React, { Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import filterXSS from 'xss';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Dropdown, Input, Popover, Tooltip } from 'ming-ui/antd-components';
import ajaxRequest from 'src/api/appManagement';
import createLinksForMessage from 'src/components/comment/utils/createLinksForMessage';
import DatePickerFilter from 'src/pages/Admin/common/datePickerFilter';
import Config from '../../../config';
import './index.less';

const optionTypeData = [
  { label: _l('所有类型'), type: 0 },
  { label: _l('导入'), type: 6 },
  { label: _l('导出'), type: 5 },
  { label: _l('开启'), type: 2 },
  { label: _l('关闭'), type: 3 },
  { label: _l('创建'), type: 1 },
  { label: _l('删除'), type: 4 },
  { label: _l('恢复'), type: 8 },
];

const optionTypeIcon = {
  1: 'icon-add1',
  2: 'icon-ic_toggle_on',
  3: 'icon-ic_toggle_off',
  4: 'icon-trash',
  5: 'icon-cloud_download',
  6: 'icon-reply1',
  8: 'icon-restart',
};

const SEARCH_POPOVER_STYLES = { container: { width: 280 } };

export default class AppLog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'logs',
      list: [],
      visible: false,
      searchVisible: false,
      viewVisible: false,
      handleType: 0,
      handleTypeLabel: _l('所有类型'),
      start: '',
      end: '',
      keyword: '',
      pageIndex: 1,
      loading: false,
      isMore: true,
      expendList: [],
      passwordDialogVisible: null,
    };
  }

  componentDidMount() {
    this.getList();
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.visible) {
        this.updateState({
          activeTab: 'logs',
          keyword: '',
          start: '',
          end: '',
          searchVisible: false,
          handleType: 0,
          handleTypeLabel: _l('所有类型'),
          expendList: [],
        });
      }
    }
  }

  getList() {
    const { keyword, pageIndex, list, loading, isMore, handleType, activeTab, start, end } = this.state;

    // 加载更多
    if (pageIndex > 1 && ((loading && isMore) || !isMore)) {
      return;
    }

    this.setState({ loading: true });

    if (this.postList) {
      this.postList.abort();
    }

    this.postList = ajaxRequest.getLogs({
      projectId: Config.projectId,
      pageIndex,
      pageSize: 30,
      keyword,
      start,
      end,
      handleType,
    });
    this.postList.then(res => {
      this.setState({
        list: pageIndex === 1 ? res[activeTab] : list.concat(res[activeTab]),
        isMore: res[activeTab] && res[activeTab].length === 30,
        pageIndex: pageIndex + 1,
        loading: false,
      });
    });
  }

  searchDataList = _.throttle(() => {
    this.getList();
  }, 200);

  updateState = obj => {
    this.setState({ list: null, pageIndex: 1, ...obj }, this.searchDataList);
  };

  renderSearchBar(isLog) {
    const { handleTypeLabel, visible, start, end, searchVisible, keyword } = this.state;
    return (
      <div className="searchBarContainer">
        <div className="searchBaseBox">
          {isLog ? (
            <Dropdown
              open={visible}
              onOpenChange={visible => this.setState({ visible: visible })}
              trigger={['click']}
              menu={{
                items: optionTypeData.map(item => ({
                  key: item.type,
                  label: item.label,
                  onClick: () => {
                    this.updateState({
                      handleType: item.type,
                      handleTypeLabel: item.label,
                      visible: false,
                    });
                  },
                })),
              }}
            >
              <div className="optionItem Hand hoverColorPrimaryLight Width90">
                <span>{handleTypeLabel}</span>
                <span className="icon-expand_more mLeft8 textTertiary"></span>
              </div>
            </Dropdown>
          ) : (
            <span className="textTertiary">{_l('导出的应用文件有效期为30天，请尽快下载')}</span>
          )}

          <div className="optionItem">
            {isLog && (
              <DatePickerFilter
                tooltipProps={{ placement: 'top', title: _l('按日期筛选') }}
                updateData={data => {
                  this.updateState({
                    start: data.startDate,
                    end: data.endDate,
                  });
                }}
              >
                <span className="Font18 textTertiary hoverColorPrimaryLight icon-event Hand"></span>
              </DatePickerFilter>
            )}
            {start && isLog ? (
              <div className="dateRange">
                {_l('%0 ~ %1', start, end)}
                <span className="icon-close" onClick={() => this.updateState({ start: '', end: '' })}></span>
              </div>
            ) : null}

            <Tooltip placement="top" title={_l('搜索')}>
              <Popover
                open={searchVisible}
                onOpenChange={open => this.setState({ searchVisible: open })}
                trigger="click"
                placement="bottomRight"
                styles={SEARCH_POPOVER_STYLES}
                content={
                  <Input
                    autoFocus
                    allowClear
                    value={keyword}
                    placeholder={_l('搜索应用名称/操作者')}
                    onChange={e => this.updateState({ keyword: e.target.value })}
                    prefix={<Icon icon="search" className="textTertiary Font16" />}
                  />
                }
              >
                <Icon
                  icon="search"
                  className={cx('mLeft24 Font18 hoverColorPrimaryLight Hand', {
                    textTertiary: !keyword,
                    colorPrimary: keyword,
                  })}
                />
              </Popover>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }

  getAppNames(names = []) {
    return names.join('、');
  }

  renderList() {
    const { list, loading } = this.state;
    if (list === null) return;

    if (!list.length) {
      return (
        <div className="manageListNull flex flexColumn">
          <div className="iconWrap">
            <span className="icon icon-assignment" />
          </div>
          <div className="emptyExplain">{_l('暂无日志信息')}</div>
        </div>
      );
    }

    return (
      <ScrollView className="flex flexColumn" onScrollEnd={this.searchDataList}>
        {this.renderLog()}
        {loading && <LoadDiv className="mTop15" />}
      </ScrollView>
    );
  }

  renderLog() {
    const { list } = this.state;
    return (
      <Fragment>
        {list.map(item => {
          const isAppItem = !!item.appItem;
          const message = createLinksForMessage({
            message: item.message,
            rUserList: [item.operator],
          });
          return (
            <div className="appLogListItem">
              <div className="appLogListItemTop textTertiary">
                <span className="flexCenter">
                  <span className={cx('Font15 mRight10 mBottom2', optionTypeIcon[item.handleType])}></span>
                  <span dangerouslySetInnerHTML={{ __html: filterXSS(message) }}></span>
                  {isAppItem && (
                    <span className="mLeft4 WordBreak">
                      {String(item.appItem.type) === '0'
                        ? _l('工作表 %0', item.appItem.name)
                        : _l('自定义页面 %0', item.appItem.name)}
                    </span>
                  )}
                </span>
                <span>{item.createTime}</span>
              </div>
              <div className="appLogListItemBottom mTop5">
                {isAppItem && <span className="textTertiary mRight8">{_l('所属应用')}</span>}
                {this.getAppNames(item.appNames)}
              </div>
            </div>
          );
        })}
      </Fragment>
    );
  }

  render() {
    const { activeTab, pageIndex, loading } = this.state;
    const isLog = activeTab === 'logs';
    return (
      <div className="appLogContainer">
        <div className="appLogContent">
          {this.renderSearchBar(isLog)}
          {pageIndex === 1 && loading ? <LoadDiv className="mTop15" /> : this.renderList(isLog)}
        </div>
      </div>
    );
  }
}
