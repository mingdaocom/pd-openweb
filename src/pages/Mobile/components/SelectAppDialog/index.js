import React, { Fragment, useEffect, useCallback } from 'react';
import { useSetState } from 'react-use';
import { Popup, Button } from 'antd-mobile';
import { Input, SvgIcon, LoadDiv, ScrollView } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import './index.less';
import { _callOnClient } from '@sentry/minimal';
import _ from 'lodash';

const RESULT_IS_DATA = ['getManagerApps', 'getUserApp', 'getMyApp'];
const NO_PAGE = ['getManagerApps', 'getUserApp', 'getMyApp'];

export default function SelectAppDialog(props) {
  const {
    visible,
    projectId,
    ajaxFun = 'getAppsForProject',
    unique = false,
    onClose,
    onOk,
    filterFun = () => {},
  } = props;

  const [stateData, setStateData] = useSetState({
    pageIndex: 1,
    loading: true,
    noMore: false,
    keyWords: '',
    appList: [],
    selectedApps: props.selectedApps,
  });
  const { pageIndex, loading, noMore, keyWords, appList, selectedApps } = stateData;
  const selectedAppIds = selectedApps.map(item => item.appId);

  const onSort = data => data.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

  const getProjectAppList = () => {
    if (!loading) return;
    appManagementApi[ajaxFun]({
      projectId,
      status: '',
      order: 3,
      pageSize: 50,
      pageIndex,
      keyword: _.trim(keyWords),
    }).then(res => {
      let apps = RESULT_IS_DATA.includes(ajaxFun) ? res : res.apps;
      apps = apps.filter(filterFun);
      const list = NO_PAGE.includes(ajaxFun) ? onSort(apps) : apps;
      setStateData({
        loading: false,
        noMore: apps.length < 50 || NO_PAGE.includes(ajaxFun),
        appList: pageIndex > 1 ? appList.concat(list) : list,
        keyWords,
      });
    });
  };

  const onSearch = useCallback(
    _.debounce(value => {
      setStateData(NO_PAGE.includes(ajaxFun) ? { keyWords: value } : { loading: true, pageIndex: 1, keyWords: value });
    }, 500),
  );

  const onScrollEnd = () => {
    if (!noMore && !loading) {
      setStateData({ loading: true, pageIndex: pageIndex + 1 });
    }
  };

  useEffect(() => {
    if (NO_PAGE.includes(ajaxFun) && !!appList.length) return;

    getProjectAppList();
  }, [loading, pageIndex, keyWords]);

  return (
    <Popup className="mobileModal selectAppDialog" position="bottom" visible={visible} onClose={onClose}>
      {loading && pageIndex === 1 && !_.trim(keyWords) ? (
        <LoadDiv className="mTop50" />
      ) : (
        <Fragment>
          <div className="searchWrap flexRow">
            <i className="icon icon-search Gray_9e" />
            <Input className="flex" placeholder={_l('搜索')} onChange={onSearch} />
          </div>
          <ScrollView className="appListWrap flex" onScrollEnd={onScrollEnd}>
            {appList
              .filter(item => !NO_PAGE.includes(ajaxFun) || item.appName.toLowerCase().includes(keyWords.toLowerCase()))
              .map(item => {
                return (
                  <div
                    key={item.appId}
                    className="flexRow alignItemsCenter appItem"
                    onClick={() => {
                      const apps = _.includes(selectedAppIds, item.appId)
                        ? selectedApps.filter(v => v.appId !== item.appId)
                        : selectedApps.concat(item);
                      setStateData({
                        selectedApps: apps,
                      });
                    }}
                  >
                    <div className="appIcon" style={{ background: item.iconColor }}>
                      <SvgIcon url={item.iconUrl} fill="#fff" size={20} />
                    </div>
                    <div className="mLeft15 flexRow flex appName h100 alignItemsCenter">
                      <div className="flex overflow_ellipsis">{item.appName}</div>
                      {_.includes(selectedAppIds, item.appId) && (
                        <i className="icon icon-done ThemeColor Font18 mLeft10" />
                      )}
                    </div>
                  </div>
                );
              })}
            {loading && pageIndex > 1 && <LoadDiv />}
          </ScrollView>
          <div className="footer flexRow">
            <Button className="flex mLeft6 mRight6 Font13 bold Gray_75" onClick={onClose}>
              {_l('取消')}
            </Button>
            <Button
              className="flex mLeft6 mRight6 Font13 bold"
              color="primary"
              onClick={() => {
                onOk(selectedApps);
                onClose();
              }}
            >
              {_l('确认')}
            </Button>
          </div>
        </Fragment>
      )}
    </Popup>
  );
}
