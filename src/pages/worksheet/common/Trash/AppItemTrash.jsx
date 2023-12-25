import React, { Fragment, useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, LoadDiv } from 'ming-ui';
import cx from 'classnames';
import styled from 'styled-components';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import { string } from 'prop-types';
import { Dialog } from 'ming-ui';
import UserHead from 'src/components/userHead';
import SvgIcon from 'src/components/SvgIcon';
import appManagementAjax from 'src/api/appManagement';
import moment from 'moment';
import _ from 'lodash';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Content = styled.div`
  height: calc(100% - 53px);
`;

const TableRow = styled.div`
  display: flex;
  align-items: center;
  height: 60px;
  border-bottom: 1px solid #ddd;
  padding: 0 12px;
  .operateIcon {
    opacity: 0;
  }
  &:hover {
    background: #f5f5f5;
    .operateIcon {
      opacity: 1;
    }
  }
`;

const TableHeaderCon = styled.div``;

const TableHeader = styled(TableRow)`
  padding: 0 142px 0 12px;
  height: 40px;
  &:hover {
    background: inherit;
  }
`;

const TableBody = styled(ScrollView)`
  height: calc(100% - 60px) !important;
  overflow-y: auto;
`;
const TableBodyPadding = styled.div`
  height: 100%;
`;

const Cell = styled.div`
  display: flex;
  align-items: center;
`;

const EmptyCon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: calc(100% - 60px) !important;
  .emptyIcon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 130px;
    height: 130px;
    border-radius: 130px;
    background: #f5f5f5;
    .icon {
      color: #bdbdbd;
      font-size: 66px;
    }
  }
`;

const columns = [
  {
    name: _l('应用项名称'),
    flex: true,
  },
  {
    name: _l('类型'),
    width: 140,
  },
  {
    name: _l('删除者'),
    width: 150,
  },
  {
    name: _l('删除时间'),
    width: 140,
  },
];

export default function AppItemTrash(props) {
  const { appId, projectId, onCancel } = props;
  const cache = useRef({});
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [loadOuted, setLoadOuted] = useState();
  const [appItems, setAppItems] = useState([]);
  const [keyword, setKeyword] = useState();

  const data = appItems.map(appItem => [
    [
      <SvgIcon
        url={
          appItem.iconUrl.startsWith('http')
            ? appItem.iconUrl
            : `${md.global.FileStoreConfig.pubHost.replace(/\/$/, '')}/customIcon/${appItem.iconUrl}.svg`
        }
        fill="#2196f3"
        size={34}
        className="InlineBlock"
      />,
      <span className="mLeft20 ellipsis" style={{ maxWidth: 250 }}>
        {appItem.name}
      </span>,
    ],
    <span className="ellipsis">{appItem.type === 0 ? _l('工作表') : _l('自定义页面')}</span>,
    [
      <UserHead
        className="cellUserHead"
        user={{
          userHead: appItem.deletePerson.avatar,
          accountId: appItem.deletePerson.accountId,
        }}
        appId={appId}
        size={24}
      />,
      <span className="mLeft8 ellipsis">{appItem.deletePerson.fullname || appItem.deletePerson.fullName}</span>,
    ],
    <span className="Gray_9e">{moment(appItem.deleteTime).format('YYYY-MM-DD HH:mm:ss')}</span>,
  ]);

  function setPendingCache(key, value) {
    cache.current['pending_' + key] = value;
  }
  function load(args = {}) {
    setLoading(true);
    if (!_.isUndefined(args.keyword)) {
      setAppItems([]);
      setPageIndex(1);
      setLoadOuted(false);
      setKeyword(args.keyword);
    }
    if (args.pageIndex) {
      setPageIndex(args.pageIndex);
    }
    appManagementAjax
      .getAppItemRecoveryList({
        keyword: _.isUndefined(args.keyword) ? keyword : args.keyword,
        pageIndex: args.pageIndex || pageIndex,
        pageSize: 14,
        projectId,
        appId,
      })
      .then(data => {
        if (data.length) {
          setAppItems(oldData => oldData.concat(data));
        } else {
          setLoadOuted(true);
        }
        setLoading(false);
      });
  }
  function onRestore(itemIndex) {
    const appItem = appItems[itemIndex];
    if (cache.current['pending_' + appItem.id]) {
      return;
    } else {
      setPendingCache(appItem.id, true);
    }
    appManagementAjax
      .appItemRecovery({
        id: appItem.id,
        projectId,
        appId,
      })
      .then(isSuccess => {
        if (isSuccess) {
          setAppItems(items => items.filter(t => t.id !== appItem.id));
          alert(_l('恢复成功'));
          setPendingCache(appItem.id, false);
          if (_.isFunction(window.__worksheetLeftReLoad)) {
            window.__worksheetLeftReLoad();
          }
        } else {
          return $.Deferred().reject();
        }
      })
      .fail(err => {
        alert(_l('恢复失败'), 3);
        setPendingCache(appItem.id, false);
      });
  }
  function onDelete(itemIndex) {
    const needDeleteItem = appItems[itemIndex];
    Dialog.confirm({
      title: <span style={{ color: '#f44336' }}>{_l('将彻底删除工作表"%0"', needDeleteItem.name)}</span>,
      buttonType: 'danger',
      description: _l('彻底删除该数据后，将无法恢复。'),
      okText: _l('彻底删除'),
      onOk: () => {
        appManagementAjax
          .removeWorkSheetForApp({
            appId,
            projectId,
            appSectionId: needDeleteItem.appSectionId,
            workSheetId: needDeleteItem.id,
            type: needDeleteItem.type,
            isPermanentlyDelete: true,
          })
          .then(isSuccess => {
            if (isSuccess) {
              setAppItems(items => items.filter(t => t.id !== appItems[itemIndex].id));
              alert(_l('彻底删除成功'));
            } else {
              return $.Deferred().reject();
            }
          })
          .fail(err => {
            alert(_l('彻底删除失败'), 3);
          });
      },
    });
  }
  function onKeyWordChange(newKeyword) {
    load({ pageIndex: 1, keyword: newKeyword });
  }
  function onScrollEnd() {
    if (!loading && !loadOuted) {
      load({
        pageIndex: pageIndex + 1,
      });
    }
  }
  useEffect(load, []);

  const debounceOnKeyWordChange = useCallback(_.debounce(onKeyWordChange, 300), []);

  return (
    <Fragment>
      <Header>
        <div className="title Font17 Gray">
          <span className="bold mBottom8">{_l('回收站（应用项）')}</span>
          <div className="desc flex Font13 Gray_9e mTop8">
            {_l('可恢复%0天内删除的应用项', md.global.SysSettings.appItemRecycleDays)}
          </div>
        </div>
        <div className="search">
          <SearchInput
            placeholder={_l('应用项名称')}
            value={keyword}
            onChange={_.debounce(v => {
              if (!v) {
                onKeyWordChange(v);
              } else {
                debounceOnKeyWordChange(v);
              }
            }, 500)}
          />
        </div>
      </Header>
      {loading && !data.length && <LoadDiv className="mTop80" />}
      {!loading && !data.length && (
        <EmptyCon>
          <div className="emptyIcon">
            <i className="icon icon-custom_-page_delete"></i>
          </div>
          <div className="Font17 Gray_9e mTop16">{keyword ? _l('没有找到符合条件的结果') : _l('回收站暂无内容')}</div>
        </EmptyCon>
      )}
      {!!data.length && (
        <Content>
          {!!data.length && (
            <TableHeaderCon>
              <TableHeader>
                {columns.map((c, i) => (
                  <Cell
                    key={i}
                    className={cx('Font14 Gray_75', { flex: c.flex })}
                    style={{
                      width: c.width,
                    }}
                  >
                    {c.name}
                  </Cell>
                ))}
              </TableHeader>
            </TableHeaderCon>
          )}
          <TableBody onScrollEnd={onScrollEnd}>
            <TableBodyPadding>
              {!!data.length &&
                data.map((cells, rowKey) => (
                  <TableRow key={rowKey}>
                    {columns.map((c, cellIndex) => (
                      <Cell
                        key={cellIndex}
                        className={c.flex ? 'flex' : ''}
                        style={{
                          width: c.width,
                        }}
                      >
                        {cells[cellIndex]}
                      </Cell>
                    ))}
                    <span data-tip={_l('恢复')} className="tip-bottom mLeft40 mRight25">
                      <i
                        className="operateIcon icon icon-restart Font14 Gray_9e Hand"
                        onClick={() => onRestore(rowKey)}
                      ></i>
                    </span>
                    <span data-tip={_l('彻底删除')} className="tip-bottom mRight35">
                      <i
                        className="operateIcon icon icon-trash Font16 Gray_9e Hand"
                        onClick={() => onDelete(rowKey)}
                      ></i>
                    </span>
                  </TableRow>
                ))}
              {loading && !!data.length && <LoadDiv className="mTop20" />}
            </TableBodyPadding>
          </TableBody>
        </Content>
      )}
    </Fragment>
  );
}

AppItemTrash.propTypes = {
  appId: string,
  projectId: string,
};
