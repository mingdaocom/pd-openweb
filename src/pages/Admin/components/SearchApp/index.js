import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { Select } from 'ming-ui/antd-components';
import appManagementAjax from 'src/api/appManagement';

const PAGE_SIZE = 50;

export default function SearchApp(props) {
  const {
    projectId,
    className,
    mode,
    value,
    placeholder = _l('全部应用'),
    onChange = () => {},
    ...selectProps
  } = props;
  const [listState, setListState] = useState({ appList: [], loading: false });
  const requestRef = useRef(null);
  const queryRef = useRef({ pageIndex: 1, keyword: '', hasMore: true });
  const { appList, loading } = listState;

  const getAppList = useCallback(
    (params = {}) => {
      const query = queryRef.current;
      const pageIndex = params.pageIndex ?? query.pageIndex;
      const keyword = params.keyword ?? query.keyword;

      if (pageIndex > 1 && (requestRef.current || !query.hasMore)) return;

      requestRef.current?.abort?.();
      query.pageIndex = pageIndex;
      query.keyword = keyword;
      setListState(previous => ({
        appList: pageIndex === 1 ? [] : previous.appList,
        loading: true,
      }));

      const request = appManagementAjax.getAppsByProject({
        projectId,
        status: '',
        order: 3,
        pageIndex,
        pageSize: PAGE_SIZE,
        keyword,
      });
      requestRef.current = request;

      request
        .then(({ apps = [] }) => {
          if (requestRef.current !== request) return;

          requestRef.current = null;
          const nextList = apps.map(item => ({ label: item.appName, value: item.appId }));
          query.pageIndex = pageIndex + 1;
          query.hasMore = nextList.length >= PAGE_SIZE;
          setListState(previous => ({
            appList: pageIndex === 1 ? nextList : [...previous.appList, ...nextList],
            loading: false,
          }));
        })
        .catch(() => {
          if (requestRef.current !== request) return;

          requestRef.current = null;
          setListState(previous => ({ ...previous, loading: false }));
        });
    },
    [projectId],
  );

  const debouncedSearch = useMemo(
    () => _.debounce((keyword, loadApps) => loadApps({ pageIndex: 1, keyword }), 500),
    [],
  );

  useEffect(
    () => () => {
      debouncedSearch.cancel();
      requestRef.current?.abort?.();
      requestRef.current = null;
    },
    [debouncedSearch],
  );

  return (
    <Select
      {...selectProps}
      className={className}
      placeholder={placeholder}
      showSearch
      allowClear
      mode={mode}
      maxTagCount={mode === 'multiple' ? 'responsive' : undefined}
      value={value}
      options={appList}
      filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
      notFoundContent={<span className="textSecondary">{loading ? _l('加载中...') : _l('无搜索结果')}</span>}
      onFocus={() => {
        debouncedSearch.cancel();
        if (queryRef.current.keyword || (!appList.length && !loading)) {
          getAppList({ pageIndex: 1, keyword: '' });
        }
      }}
      onChange={onChange}
      onSearch={keyword => debouncedSearch(keyword, getAppList)}
      onPopupScroll={({ target }) => {
        const { scrollTop, scrollHeight, offsetHeight } = target;

        if (scrollTop + offsetHeight >= scrollHeight - 5) getAppList();
      }}
    />
  );
}
