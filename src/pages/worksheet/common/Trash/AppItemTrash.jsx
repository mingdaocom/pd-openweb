import React, { useState, useEffect, useRef } from 'react';
import { func } from 'prop-types';
import { Dialog } from 'ming-ui';
import BaseTrash from './BaseTrash';
import UserHead from 'src/pages/feed/components/userHead';
import SvgIcon from 'src/components/SvgIcon';
import { getAppItemRecoveryList, removeWorkSheetForApp, appItemRecovery } from 'src/api/appManagement';
import { string } from 'prop-types';
import moment from 'moment';

export default function AppItemTrash(props) {
  const { appId, projectId, onCancel } = props;
  const cache = useRef({});
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [loadOuted, setLoadOuted] = useState();
  const [appItems, setAppItems] = useState([]);
  const [keyword, setKeyword] = useState();
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
    getAppItemRecoveryList({
      keyword: _.isUndefined(args.keyword) ? keyword : args.keyword,
      pageIndex: args.pageIndex || pageIndex,
      pageSize: 14,
      projectId,
      appId,
    }).then(data => {
      if (data.length) {
        setAppItems(oldData => oldData.concat(data));
      } else {
        setLoadOuted(true);
      }
      setLoading(false);
    });
  }
  useEffect(load, []);
  return (
    <div>
      <BaseTrash
        loading={loading}
        title={_l('回收站（应用项）')}
        searchPlaceholder={_l('应用项名称')}
        desc={_l('可恢复60天内删除的应用项')}
        columns={[
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
        ]}
        keyword={keyword}
        data={appItems.map(appItem => [
          [
            <SvgIcon
              url={
                appItem.iconUrl.startsWith('http')
                  ? appItem.iconUrl
                  : `https://fp1.mingdaoyun.cn/customIcon/${appItem.iconUrl}.svg`
              }
              fill="#2196f3"
              size={34}
              className="InlineBlock"
            />,
            <span className="mLeft20 ellipsis">{appItem.name}</span>,
          ],
          <span className="ellipsis">{appItem.type === 0 ? _l('工作表') : _l('自定义页面')}</span>,
          [
            <UserHead
              className="cellUserHead"
              // projectId={projectId}
              bindBusinessCard
              user={{
                userHead: appItem.deletePerson.avatar,
                accountId: appItem.deletePerson.accountId,
              }}
              lazy={'false'}
              size={24}
            />,
            <span className="mLeft8 ellipsis">{appItem.deletePerson.fullname || appItem.deletePerson.fullName}</span>,
          ],
          <span className="Gray_9e">{moment(appItem.deleteTime).format('YYYY-MM-DD HH:mm:ss')}</span>,
        ])}
        onScrollEnd={() => {
          if (!loading && !loadOuted) {
            load({
              pageIndex: pageIndex + 1,
            });
          }
        }}
        onRestore={itemIndex => {
          const appItem = appItems[itemIndex];
          if (cache.current['pending_' + appItem.id]) {
            return;
          } else {
            setPendingCache(appItem.id, true);
          }
          appItemRecovery({
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
        }}
        onDelete={itemIndex => {
          const needDeleteItem = appItems[itemIndex];
          Dialog.confirm({
            title: <span style={{ color: '#f44336' }}>{_l('将彻底删除工作表"%0"', needDeleteItem.name)}</span>,
            buttonType: 'danger',
            description: _l('彻底删除该数据后，将无法恢复。'),
            okText: _l('彻底删除'),
            onOk: () => {
              removeWorkSheetForApp({
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
        }}
        onCancel={onCancel}
        onKeyWordChange={newKeyword => {
          load({ pageIndex: 1, keyword: newKeyword });
        }}
      />
    </div>
  );
}

AppItemTrash.propTypes = {
  appId: string,
  projectId: string,
  onCancel: func,
};
