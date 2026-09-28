import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import moment from 'moment';
import { Icon } from 'ming-ui';
import { DateRangePicker } from 'ming-ui/antd-components';
import autoSize from 'ming-ui/components/AutoSize';
import externalPortalAjax from 'src/api/externalPortal';
import PorTalTable from 'src/pages/Role/PortalCon/tabCon/portalComponent/PortalTable';
import { pageSize } from '../tabCon/util';
import { createActionLogParams, LOG_TABS, normalizeLogRows } from './LoginInfo.util';
import { getLogColumns } from './LoginInfoColumns';
import { LOG_TABLE_BODY_SCROLL_Y, Wrap } from './LoginInfoStyle';

const AutoSizePorTalTable = autoSize(PorTalTable);
const DEFAULT_FILTER = {
  pageIndex: 1,
  searchValue: '',
  startDate: '',
  endDate: '',
};

function LoginInfo(props) {
  const { appId } = props;
  const [activeTab, setActiveTab] = useState(LOG_TABS.LOGIN);
  const [info, setState] = useSetState(DEFAULT_FILTER);
  const infoRef = useRef(DEFAULT_FILTER);
  const ajaxRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  const logTabs = useMemo(
    () => [
      { key: LOG_TABS.LOGIN, text: _l('登录日志') },
      { key: LOG_TABS.MANAGE, text: _l('管理日志') },
    ],
    [],
  );
  const columns = useMemo(() => getLogColumns({ activeTab, appId }), [activeTab, appId]);

  const updateInfo = useCallback(
    dataInfo => {
      infoRef.current = { ...infoRef.current, ...dataInfo };
      setState(dataInfo);
    },
    [setState],
  );

  const requestList = useCallback(
    (dataInfo = {}, tab = activeTab) => {
      const nextInfo = { ...infoRef.current, ...dataInfo };
      const requestParams = createActionLogParams({ appId, tab, info: nextInfo, pageSize });

      infoRef.current = nextInfo;
      if (ajaxRef.current && ajaxRef.current.abort) {
        ajaxRef.current.abort();
      }

      const request = externalPortalAjax.getUserActionLogs(requestParams);
      ajaxRef.current = request;
      request
        .then(res => {
          if (ajaxRef.current !== request) {
            return;
          }

          const { data = {} } = res;
          setLoading(false);
          setList(normalizeLogRows(data.list || [], tab, nextInfo.pageIndex));
          setCount(data.totalCount || 0);
          setState({ ...dataInfo });
        })
        .catch(() => {
          if (ajaxRef.current !== request) {
            return;
          }

          setLoading(false);
        });
    },
    [activeTab, appId, setState],
  );

  const getList = useCallback(
    (dataInfo = {}, tab = activeTab) => {
      setLoading(true);
      requestList(dataInfo, tab);
    },
    [activeTab, requestList],
  );

  useEffect(() => {
    requestList();

    return () => {
      const request = ajaxRef.current;
      ajaxRef.current = null;
      request && request.abort && request.abort();
    };
  }, [requestList]);
  return (
    <Wrap>
      <div className="logTabs">
        {logTabs.map(item => (
          <div
            key={item.key}
            className={activeTab === item.key ? 'logTabItem active' : 'logTabItem'}
            onClick={() => {
              if (activeTab === item.key) {
                return;
              }

              updateInfo(DEFAULT_FILTER);
              setList([]);
              setCount(0);
              setLoading(true);
              setActiveTab(item.key);
            }}
          >
            {item.text}
          </div>
        ))}
      </div>
      <div className="topAct">
        <span className="title InlineBlock textSecondary">{_l('用户')}</span>
        <div className="searchWrapper flexRow mLeft16">
          <Icon icon="search" className="Font18 textTertiary" />
          <input
            type="text"
            className="cursorText flex"
            placeholder={activeTab === LOG_TABS.MANAGE ? _l('搜索操作对象') : _l('搜索用户名、手机号、邮箱')}
            onChange={event => {
              updateInfo({ searchValue: _.trim(event.target.value) });
            }}
            onKeyDown={event => {
              if (event.which === 13) {
                getList({
                  searchValue: _.trim(event.target.value),
                  pageIndex: 1,
                });
              }
            }}
            value={info.searchValue}
          />
          {info.searchValue && (
            <Icon
              icon="cancel"
              className="Font18 Hand textTertiary clearSearchIcon"
              onClick={() => {
                updateInfo({ searchValue: '' });
                getList({
                  searchValue: '',
                  pageIndex: 1,
                });
              }}
            />
          )}
        </div>
        <span className="textSecondary mLeft50 InlineBlock">{_l('时间')}</span>
        <DateRangePicker
          value={info.startDate && info.endDate ? [moment(info.startDate), moment(info.endDate)] : []}
          showTime={{ format: 'HH:mm' }}
          format="YYYY-MM-DD HH:mm"
          onChange={moments => {
            const dateInfo = {
              startDate: !moments || !moments[0] ? '' : moments[0].format('YYYY-MM-DD HH:mm'),
              endDate: !moments || !moments[1] ? '' : moments[1].format('YYYY-MM-DD HH:mm'),
              pageIndex: 1,
            };

            updateInfo(dateInfo);
            getList(dateInfo);
          }}
        />
      </div>
      <div className="con">
        <AutoSizePorTalTable
          className="logInfoTable"
          columns={columns}
          bordered={false}
          noShowCheck
          list={list}
          pageSize={pageSize}
          scrollY={LOG_TABLE_BODY_SCROLL_Y}
          loading={loading}
          pageIndex={info.pageIndex}
          total={count}
          changePage={pageIndex => {
            getList({ pageIndex });
          }}
        />
      </div>
    </Wrap>
  );
}

export default LoginInfo;
