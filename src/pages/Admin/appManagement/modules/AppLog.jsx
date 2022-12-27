import React, { Fragment } from 'react';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import DatePickerFilter from 'src/pages/Admin/common/datePickerFilter';
import { Icon, ScrollView, LoadDiv, Tooltip } from 'ming-ui';
import ClipboardButton from 'react-clipboard.js';
import ajaxRequest from 'src/api/appManagement';
import Config from '../../config';
import { createLinksForMessage } from 'src/components/common/function';
import { downloadFile } from 'src/util';
import './index.less';
import _ from 'lodash';

const headerBarData = [
  { label: _l('操作日志'), type: 'logs', apiAction: 'getLogs' },
  { label: _l('导出记录'), type: 'records', apiAction: 'getExports' },
];

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
  2: 'icon-toggle_on',
  3: 'icon-toggle_off',
  4: 'icon-delete1',
  5: 'icon-cloud_download',
  6: 'icon-reply1',
  8: 'icon-restart',
};

export default class AppLog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'logs',
      list: [],
      visible: false,
      datePickerVisible: false,
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      this.updateState({
        activeTab: 'logs',
        keyword: '',
        start: '',
        end: '',
        handleType: 0,
        handleTypeLabel: _l('所有类型'),
        expendList: [],
      });
    }
  }

  getList() {
    const { keyword, pageIndex, list, loading, isMore, handleType, activeTab, start, end } = this.state;

    // 加载更多
    if (pageIndex > 1 && ((loading && isMore) || !isMore)) {
      return;
    }

    this.setState({ loading: true });

    //api
    let currentApi = '';
    headerBarData.forEach(item => {
      if (item.type === activeTab) {
        currentApi = item.apiAction;
      }
    });

    if (this.postList) {
      this.postList.abort();
    }

    this.postList = ajaxRequest[currentApi]({
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
    const { handleTypeLabel, visible, datePickerVisible, start, end, searchVisible, keyword } = this.state;
    return (
      <div className={cx('searchBarContainer', searchVisible ? 'extand' : 'close')}>
        <div className="searchBaseBox">
          {isLog ? (
            <Trigger
              popupVisible={visible}
              onPopupVisibleChange={visible => this.setState({ visible: visible })}
              action={['click']}
              popup={() => {
                return (
                  <ul className="optionPanelTrigger">
                    {optionTypeData.map(item => {
                      return (
                        <li
                          key={item.type}
                          onClick={() => {
                            this.updateState({
                              handleType: item.type,
                              handleTypeLabel: item.label,
                              visible: false,
                            });
                          }}
                        >
                          {item.label}
                        </li>
                      );
                    })}
                  </ul>
                );
              }}
              popupAlign={{ points: ['tl', 'tl'] }}
            >
              <div className="optionItem Hand Hover_49 Width90">
                <span>{handleTypeLabel}</span>
                <span className="icon-expand_more mLeft8 Gray_9e"></span>
              </div>
            </Trigger>
          ) : (
            <span className="Gray_9e">{_l('导出的应用文件有效期为30天，请尽快下载')}</span>
          )}

          <div className="optionItem">
            {isLog && (
              <Trigger
                popupVisible={datePickerVisible}
                onPopupVisibleChange={visible => this.setState({ datePickerVisible: visible })}
                action={['click']}
                popupAlign={{ points: ['tr', 'bl'], offset: [20, 5] }}
                popup={
                  <DatePickerFilter
                    updateData={data => {
                      this.updateState({
                        datePickerVisible: false,
                        start: data.startDate,
                        end: data.endDate,
                      });
                    }}
                  />
                }
              >
                <Tooltip popupPlacement="top" text={<span>{_l('按日期筛选')}</span>}>
                  <span className="Font18 Gray_9e Hover_49 icon-event Hand"></span>
                </Tooltip>
              </Trigger>
            )}
            {start && isLog ? (
              <div className="dateRange">
                {_l('%0 ~ %1', start, end)}
                <span className="icon-close" onClick={() => this.updateState({ start: '', end: '' })}></span>
              </div>
            ) : null}

            <Tooltip popupPlacement="top" text={<span>{_l('搜索')}</span>}>
              <span
                className="mLeft24 Font18 Hover_49 Gray_9e icon-search Hand"
                onClick={() => this.setState({ searchVisible: true }, () => this.search.focus())}
              ></span>
            </Tooltip>
          </div>
        </div>

        <div className="workflowSearchWrap">
          <input
            type="text"
            className="ThemeBorderColor3"
            value={keyword}
            ref={con => (this.search = con)}
            placeholder={_l('搜索应用名称/操作者')}
            onChange={e => this.updateState({ keyword: e.target.value })}
          />
          <Icon icon="workflow_find" className="search Gray_9e Font16" />
          <Icon
            icon="close"
            onClick={() => this.updateState({ keyword: '', searchVisible: false })}
            className="close pointer"
          />
        </div>
      </div>
    );
  }

  getAppNames(names = []) {
    return names.join('、');
  }

  renderList(isLogs) {
    const { list, loading } = this.state;
    if (list === null) return;

    if (!list.length) {
      return (
        <div className="manageListNull flex flexColumn">
          <div className="iconWrap">
            <span className="icon icon-assignment" />
          </div>
          <div className="emptyExplain">{isLogs ? _l('暂无日志信息') : _l('暂无导出信息')}</div>
        </div>
      );
    }

    return (
      <ScrollView
        className={cx('flex flexColumn', { scrollExportListContainer: !isLogs })}
        onScrollEnd={this.searchDataList}
      >
        {isLogs ? this.renderLog() : this.renderExport()}
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
              <div className="appLogListItemTop Gray_9e">
                <span className="flexCenter">
                  <span className={cx('Font15 mRight10 mBottom2', optionTypeIcon[item.handleType])}></span>
                  <span dangerouslySetInnerHTML={{ __html: message }}></span>
                  {isAppItem && (
                    <span className="mLeft4">
                      {String(item.appItem.type) === '0'
                        ? _l('工作表 %0', item.appItem.name)
                        : _l('自定义页面 %0', item.appItem.name)}
                    </span>
                  )}
                </span>
                <span>{item.createTime}</span>
              </div>
              <div className="appLogListItemBottom mTop5">
                {isAppItem && <span className="Gray_9e mRight8">{_l('所属应用')}</span>}
                {this.getAppNames(item.appNames)}
              </div>
            </div>
          );
        })}
      </Fragment>
    );
  }

  renderExport() {
    const { list, expendList, passwordDialogVisible } = this.state;
    return (
      <Fragment>
        {list.map(item => {
          const isMoreApp = item.names && item.names.length > 1;
          const isExpand = expendList.includes(item.id);
          const showPassword = passwordDialogVisible === item.id;
          return (
            <div className="flexRow">
              <span
                className={cx(
                  'Gray_9e Hand Hover_49 mTop16 mRight5',
                  isExpand ? 'icon-arrow-down' : 'icon-arrow-right-tip',
                  { Alpha0: !isMoreApp },
                )}
                onClick={() => {
                  this.setState({
                    expendList: isExpand ? expendList.filter(x => x !== item.id) : expendList.concat([item.id]),
                  });
                }}
              ></span>
              <div className="appLogListItem">
                <div className="appLogListItemTop">
                  <span>
                    <span>{isMoreApp ? _l('应用导出') : item.names[0]}</span>
                    {item.password && item.downLoadUrl && (
                      <Tooltip
                        popupPlacement="top"
                        disable={showPassword}
                        text={<span>{_l('该文件已加密，点击查看密码')}</span>}
                      >
                        <span
                          className="Gray_9e mLeft10 icon-lock Hand Hover_49"
                          onClick={() => this.setState({ passwordDialogVisible: showPassword ? null : item.id })}
                        ></span>
                      </Tooltip>
                    )}
                  </span>
                  <span
                    className={cx(item.downLoadUrl ? 'ThemeColor3 ThemeHoverColor2 Hand' : 'Gray_9e')}
                    onClick={() => {
                      if (item.downLoadUrl) {
                        window.open(downloadFile(item.downLoadUrl));
                      }
                    }}
                  >
                    {item.downLoadUrl ? _l('下载') : _l('已过期')}
                  </span>
                  {showPassword ? this.viewPassword(item) : null}
                </div>
                <div className="Gray_9e mTop5">{item.createTime}</div>
                {isMoreApp && isExpand && (
                  <div className="appLogListItemBottom Gray_75 pAll10 GrayBGFA mTop5">
                    {_l('包含%0个应用：%1', item.names.length, this.getAppNames(item.names))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </Fragment>
    );
  }

  viewPassword(item) {
    return (
      <div className="viewAppLogPasswordDialogID">
        <div className="clearfix mBottom24">
          <span className="Left Font15">{_l('查看密码')}</span>
          <span
            className="Right icon-delete Font16 Hover_49 Gray_9e Hand"
            onClick={() => this.setState({ passwordDialogVisible: null })}
          ></span>
        </div>
        <div className="passwordInputBox">
          <input
            type="text"
            className="inputBox"
            value={item.password}
            readonly="readonly"
            ref={input => (this.input = input)}
            onFocus={() => this.input.select()}
          />
          <ClipboardButton
            className="adminHoverColor Hand tip-top"
            component="span"
            data-clipboard-text={item.password}
            onSuccess={() => alert(_l('复制成功'))}
            data-tip={_l('复制密码')}
          >
            <span className="icon-content-copy mLeft15 Gray_9e Hover_49 Hand LineHeight36"></span>
          </ClipboardButton>
        </div>
      </div>
    );
  }

  render() {
    const { activeTab, pageIndex, loading } = this.state;
    const isLog = activeTab === 'logs';
    return (
      <div className="appLogContainer">
        <div className="appLogHeader">
          {headerBarData.map(item => {
            return (
              <div
                key={item.type}
                className={cx('appHeaderItem', { active: activeTab === item.type })}
                onClick={() =>
                  this.updateState({
                    activeTab: item.type,
                    keyword: '',
                    start: '',
                    end: '',
                    handleType: 0,
                    handleTypeLabel: _l('所有类型'),
                    expendList: [],
                  })
                }
              >
                {item.label}
              </div>
            );
          })}
        </div>
        <div className="appLogContent">
          {this.renderSearchBar(isLog)}
          {pageIndex === 1 && loading ? <LoadDiv className="mTop15" /> : this.renderList(isLog)}
        </div>
      </div>
    );
  }
}
