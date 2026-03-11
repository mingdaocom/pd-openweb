import React, { Fragment, useCallback, useMemo, useRef } from 'react';
import { useSetState } from 'react-use';
import { Select } from 'antd';
import _ from 'lodash';
import appManagementAjax from 'src/api/appManagement';

const PAGE_SIZE = 50;

export default function SearchApp({ projectId, className, onChange = () => {} }) {
  const [state, setState] = useSetState({
    appList: [],
    pageIndex: 1,
    keyword: '',
    isMoreApp: true,
    loadingApp: false,
    appId: undefined,
  });
  const { appList, pageIndex, keyword, isMoreApp, loadingApp, appId } = state;
  const appPromiseRef = useRef(null);

  const getAppList = useCallback(
    (params = {}) => {
      if (appPromiseRef.current && appPromiseRef.current.abort) {
        appPromiseRef.current.abort();
      }

      const nextPage = params.pageIndex || pageIndex;

      nextPage === 1 && setState({ loadingApp: true });

      appPromiseRef.current = appManagementAjax.getAppsByProject({
        projectId,
        status: '',
        order: 3,
        pageIndex: nextPage,
        pageSize: PAGE_SIZE,
        keyword: params.keyword || keyword,
      });

      appPromiseRef.current
        .then(({ apps = [] }) => {
          const newList = (apps || []).map(item => ({ label: item.appName, value: item.appId }));

          setState({
            loadingApp: false,
            appList: nextPage === 1 ? newList : [...appList, ...newList],
            pageIndex: nextPage + 1,
            isMoreApp: newList.length >= PAGE_SIZE,
          });
        })
        .catch(() => {
          setState({ loadingApp: false });
        });
    },
    [projectId],
  );

  const debouncedSearch = useMemo(
    () =>
      _.debounce(value => {
        setState({ keyword: value });
        getAppList({ pageIndex: 1, keyword: value });
      }, 500),
    [],
  );

  const handleScroll = useCallback(
    e => {
      const { scrollTop, scrollHeight, offsetHeight } = e.target;
      if (scrollTop + offsetHeight >= scrollHeight - 5 && isMoreApp && !loadingApp) {
        getAppList();
      }
    },
    [getAppList],
  );

  return (
    <Fragment>
      <Select
        className={`mdAntSelect ${className}`}
        placeholder={_l('全部应用')}
        showSearch
        allowClear
        showArrow={false}
        value={appId}
        options={appList}
        filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
        notFoundContent={<span className="textSecondary">{_l('无搜索结果')}</span>}
        onFocus={() => !appList.length && getAppList()}
        onChange={value => {
          setState({ appId: value });
          onChange(value);
        }}
        onSearch={debouncedSearch}
        onPopupScroll={handleScroll}
        onClear={() => {
          setState({ keyword: '', pageIndex: 1 });
          getAppList({ keyword: '', pageIndex: 1 });
        }}
      />
    </Fragment>
  );
}
