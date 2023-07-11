import React, { useEffect, useState, Component, Fragment } from 'react';
import { ScrollView, Input, Icon, LoadDiv } from 'ming-ui';
import { Select } from 'antd';
import appManagementAjax from 'src/api/appManagement';
import projectEncryptAjax from 'src/api/projectEncrypt';
import { getIconByType } from 'src/pages/widgetConfig/util';
import SvgIcon from 'src/components/SvgIcon';
import styled from 'styled-components';

const Wrap = styled.div`
  padding: 12px 20px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  .width160 {
    width: 160px;
  }
  .w20 {
    width: 20%;
  }
  .w30 {
    width: 30%;
  }
  .w50 {
    width: 50%;
  }
  .listHeader {
    padding-bottom: 10px;
    border-bottom: 1px solid #eaeaea;
    color: #9999;
    font-weight: 500;
    div {
      padding-left: 10px;
    }
  }
  .listContent {
    flex: 1;
    min-height: 0;
    .listItem {
      height: 48px;
      line-height: 48px;
      border-bottom: 1px solid #eaeaea;
      .controlName,
      .appName,
      .worksheetName {
        padding-left: 10px;
      }
      .iconWrap {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        text-align: center;
        margin-right: 5px;
      }
    }
  }
  .ant-select-clear {
    right: 14px !important;
  }
`;

const PAGE_SIZE = 10;
export default class EncryptFieldList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appList: [{ label: _l('全部'), value: '' }],
      worksheetList: [{ label: _l('全部'), value: '' }],
      searchParams: { appId: '', worksheetId: '', keywords: '' },
      dataList: [],
      pageIndex: 1,
      isMore: false,
      loading: false,
      appPageIndex: 1,
    };
    this.promise = null;
    this.appPromise = null;
  }
  componentDidMount() {
    this.getAppList();
    this.getList();
  }

  getAppList = () => {
    const { projectId } = this.props;
    const { appPageIndex, isMoreApp, loadingApp, keyword = '' } = this.state;
    // 加载更多
    if (appPageIndex > 1 && ((loadingApp && isMoreApp) || !isMoreApp)) {
      return;
    }
    this.setState({ loadingApp: true });
    if (this.appPromise) {
      this.appPromise.abort();
    }
    this.appPromise = appManagementAjax.getAppsByProject({
      projectId,
      status: '',
      order: 3,
      pageIndex: appPageIndex,
      pageSize: 50,
      keyword,
    });

    this.appPromise
      .then(({ apps }) => {
        const newAppList = apps.map(item => {
          return {
            label: item.appName,
            value: item.appId,
          };
        });
        this.setState({
          appList:
            appPageIndex === 1
              ? [{ label: _l('全部应用'), value: '' }].concat(newAppList)
              : this.state.appList.concat(newAppList),
          isMoreApp: newAppList.length >= 50,
          loadingApp: false,
          appPageIndex: appPageIndex + 1,
        });
      })
      .fail(err => {
        this.setState({ loadingApp: false });
      });
  };
  getWorksheetList = appId => {
    if (!appId) {
      this.setState({ worksheetList: [] });
      return;
    }
    const { projectId } = this.props;
    appManagementAjax.getWorksheetsUnderTheApp({ projectId, appIds: [appId], isFilterCustomPage: true }).then(res => {
      const newWorksheetList = (res[appId] || []).map(item => {
        return {
          label: item.worksheetName,
          value: item.worksheetId,
        };
      });
      this.setState({ worksheetList: [{ label: _l('全部工作表'), value: '' }].concat(newWorksheetList) });
    });
  };

  getList = () => {
    const { projectId, encryptRuleId } = this.props;
    const { searchParams, pageIndex, loading, isMore, dataList } = this.state;

    // 加载更多
    if (pageIndex > 1 && ((loading && isMore) || !isMore)) {
      return;
    }
    this.setState({ loading: true });
    if (this.promise) {
      this.promise.abort();
    }
    this.promise = projectEncryptAjax.pagedEncryptFields({
      projectId,
      encryptRuleId,
      appId: searchParams.appId,
      worksheetId: searchParams.worksheetId,
      keywords: searchParams.keywords,
      pageIndex,
      pageSize: PAGE_SIZE,
    });

    this.promise
      .then(res => {
        let encryptControls = pageIndex === 1 ? res.encryptControls : dataList.concat(res.encryptControls);
        this.setState({
          dataList: encryptControls,
          isMore: res.encryptControls.length >= PAGE_SIZE,
          pageIndex: this.state.pageIndex + 1,
          loading: false,
        });
      })
      .fail(err => {
        this.setState({ loading: false });
      });
  };

  changeConditions = (fields, value) => {
    const { searchParams } = this.state;
    this.setState(
      {
        searchParams: {
          ...searchParams,
          [fields]: value,
          worksheetId:
            fields === 'worksheetId' ? value : fields === 'appId' && !value ? undefined : searchParams.worksheetId,
        },
        pageIndex: 1,
      },
      this.getList,
    );
  };

  onScrollEnd = _.throttle(() => {
    this.getList();
  }, 200);

  render() {
    const { projectId } = this.props;
    const { appList, worksheetList, searchParams, dataList, loading, pageIndex, isMoreApp } = this.state;
    return (
      <Wrap>
        <div className="searchWrap flexRow mBottom20">
          <Select
            className="width160 mRight12 mdAntSelect"
            showSearch
            allowClear
            placeholder={_l('全部')}
            options={appList}
            value={searchParams.appId}
            onSearch={_.debounce(val => {
              this.setState({ keyword: val, appPageIndex: 1 }, this.getAppList);
            }, 500)}
            suffixIcon={<Icon icon="arrow-down-border" className="Font18" />}
            notFoundContent={<span className="Gray_9e">{_l('无搜索结果')}</span>}
            filterOption={(inputValue, option) => {
              return (
                appList
                  .find(item => item.value === option.value)
                  .label.toLowerCase()
                  .indexOf(inputValue.toLowerCase()) > -1
              );
            }}
            onChange={value => {
              this.changeConditions('appId', value);
              this.getWorksheetList(value);
            }}
            onClear={() => {
              this.setState({ appPageIndex: 1, keyword: '' }, this.getAppList);
            }}
            onPopupScroll={e => {
              e.persist();
              const { scrollTop, offsetHeight, scrollHeight } = e.target;
              if (scrollTop + offsetHeight === scrollHeight) {
                if (isMoreApp) {
                  this.getAppList();
                }
              }
            }}
          >
            {appList.map(it => {
              return (
                <Select.Option key={it.value} value={it.value}>
                  {it.label}
                </Select.Option>
              );
            })}
          </Select>

          <Select
            className="width160 mRight12 mdAntSelect"
            showSearch
            allowClear
            placeholder={_l('全部')}
            options={worksheetList}
            disabled={!searchParams.appId}
            value={searchParams.worksheetId}
            onFocus={() => worksheetList.length === 1 && this.getWorksheetList(projectId)}
            filterOption={(inputValue, option) =>
              worksheetList
                .find(item => item.value === option.value)
                .label.toLowerCase()
                .indexOf(inputValue.toLowerCase()) > -1
            }
            suffixIcon={<Icon icon="arrow-down-border" className="Font18" />}
            notFoundContent={<span className="Gray_9e">{_l('无搜索结果')}</span>}
            onChange={value => this.changeConditions('worksheetId', value)}
          />

          <Input
            placeholder={_l('搜索字段')}
            value={searchParams.keywords}
            onChange={val => this.changeConditions('keywords', val)}
          />
        </div>
        <div className="listHeader flexRow">
          <div className="controlName w50">{_l('加密字段')}</div>
          <div className="appName w20">{_l('所属应用')}</div>
          <div className="worksheetName w30">{_l('所属工作表')}</div>
        </div>
        <div className="listContent">
          <ScrollView onScrollEnd={this.onScrollEnd}>
            {dataList.map((item, index) => {
              const { controlName, type, appName, iconColor, appIconUrl, worksheetName, iconUrl } = item;

              return (
                <div className="listItem flexRow" key={index}>
                  <div className="controlName w50 ellipsis">
                    <i className={`Gray_bd mRight5 Font16 TxtMiddle icon-${getIconByType(type)}`}></i>
                    {controlName}
                  </div>
                  <div className="appName w20 flexRow alignItemsCenter">
                    {!!appName ? (
                      <Fragment>
                        <div className="iconWrap pTop2" style={{ backgroundColor: 'rgb(212, 136, 37)' }}>
                          <SvgIcon url={appIconUrl} fill="#fff" size={12} />
                        </div>
                        <div className="flex ellipsis">{appName}</div>
                      </Fragment>
                    ) : (
                      '-'
                    )}
                  </div>
                  <div className="worksheetName w30 flexRow alignItemsCenter">
                    <div className="iconWrap">
                      <SvgIcon url={iconUrl} fill="#757575" size={16} />
                    </div>
                    <div className="flex ellipsis">{worksheetName}</div>
                  </div>
                </div>
              );
            })}
            {loading && pageIndex && <LoadDiv className="mTop30" />}
          </ScrollView>
        </div>
      </Wrap>
    );
  }
}
