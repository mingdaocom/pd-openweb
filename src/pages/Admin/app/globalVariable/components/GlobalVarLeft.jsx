import React, { useState, useEffect, useCallback } from 'react';
import { useSetState } from 'react-use';
import { Icon, ScrollView, LoadDiv, Support, SvgIcon } from 'ming-ui';
import cx from 'classnames';
import '../index.less';
import _ from 'lodash';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import appManagementApi from 'src/api/appManagement';

export default function GlobalVarLeft(props) {
  const { projectId, activeItem, onSelect } = props;
  const [appList, setAppList] = useState([]);
  const [fetchState, setFetchState] = useSetState({
    pageIndex: 1,
    loading: true,
    noMore: false,
    keyWords: '',
  });

  const getAppList = () => {
    if (!fetchState.loading) return;
    appManagementApi
      .getAppsByProject({
        projectId,
        status: '',
        order: 3,
        pageSize: 50,
        pageIndex: fetchState.pageIndex,
        keyword: fetchState.keyWords,
      })
      .then(({ apps }) => {
        setAppList(fetchState.pageIndex > 1 ? appList.concat(apps) : apps);
        setFetchState({ loading: false, noMore: apps.length < 50 });
      });
  };

  useEffect(getAppList, [fetchState.loading, fetchState.pageIndex, fetchState.keyWords]);

  const onSearch = useCallback(
    _.debounce(value => {
      setFetchState({ loading: true, pageIndex: 1, keyWords: value });
    }, 500),
    [],
  );

  const onScrollEnd = () => {
    if (!fetchState.noMore && !fetchState.loading) {
      setFetchState({ loading: true, pageIndex: fetchState.pageIndex + 1 });
    }
  };

  return (
    <div className="globalVarLeft">
      <div className="leftTitle">
        <div className="Bold Font17">{_l('全局变量')}</div>
        <Support text={_l('帮助')} type={2} href="https://help.mingdao.com/workflow/node-update-global-variables" />
      </div>
      <div className={cx('listItem', { isActive: activeItem === 'project' })} onClick={() => onSelect('project')}>
        <Icon icon="company" />
        {_l('组织')}
      </div>
      <SearchInput className="searchCon mLeft18" placeholder={_l('搜索应用')} onChange={onSearch} />
      <div className="Gray_9e mBottom8 pLeft30">{_l('按应用')}</div>
      <ScrollView onScrollEnd={onScrollEnd}>
        {fetchState.pageIndex === 1 && fetchState.loading ? (
          <LoadDiv className="mTop10" />
        ) : (
          <div>
            {!appList.length ? (
              <div className="mTop10 pLeft30 Gray_9e">{fetchState.keyWords ? _l('暂无搜索结果') : _l('暂无应用')}</div>
            ) : (
              appList.map(app => {
                return (
                  <div
                    className={cx('listItem', { isActive: activeItem === app.appId })}
                    onClick={() => onSelect(app.appId)}
                  >
                    <div className="appIcon" style={{ background: app.iconColor }}>
                      <SvgIcon url={app.iconUrl} fill="#fff" size={12} />
                    </div>
                    <span className="overflow_ellipsis" title={app.appName}>
                      {app.appName}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </ScrollView>
      {fetchState.pageIndex > 1 && fetchState.loading && <LoadDiv className="mTop10" />}
    </div>
  );
}
