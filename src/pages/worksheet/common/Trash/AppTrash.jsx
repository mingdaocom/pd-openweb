import React, { useRef, useState, useEffect } from 'react';
import { func, string, bool } from 'prop-types';
import styled from 'styled-components';
import moment from 'moment';
import { VerifyPasswordConfirm } from 'ming-ui';
import BaseTrash from './BaseTrash';
import UserHead from 'src/pages/feed/components/userHead';
import SvgIcon from 'src/components/SvgIcon';
import homeAppAjax from 'src/api/homeApp';
import _ from 'lodash';

const AppIcon = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ color }) => color};
  border-radius: 6px;
  width: 38px;
  height: 38px;
`;

export default function AppTrash(props) {
  const { isHomePage, projectId, onCancel = () => {}, onRestore = () => {} } = props;
  const cache = useRef({});
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [loadOuted, setLoadOuted] = useState();
  const [apps, setApps] = useState([]);
  const [keyword, setKeyword] = useState();
  function setPendingCache(key, value) {
    cache.current['pending_' + key] = value;
  }
  function load(args = {}) {
    setLoading(true);
    if (!_.isUndefined(args.keyword)) {
      setApps([]);
      setPageIndex(1);
      setLoadOuted(false);
      setKeyword(args.keyword);
    }
    if (args.pageIndex) {
      setPageIndex(args.pageIndex);
    }
    homeAppAjax.getAppRecoveryRecordList({
      pageIndex: args.pageIndex || pageIndex,
      pageSize: 20,
      projectId,
      isHomePage,
      keyword: _.isUndefined(args.keyword) ? keyword : args.keyword,
    }).then(data => {
      if (data.length) {
        setApps(oldData => oldData.concat(data));
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
        title={_l('回收站（应用）')}
        searchPlaceholder={_l('应用名称')}
        desc={_l('可恢复7天内删除的应用')}
        columns={[
          {
            name: _l('应用名称'),
            flex: true,
          },
          {
            name: _l('工作表数'),
            width: 120,
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
        data={apps.map(app => [
          [
            <AppIcon color={app.iconColor}>
              <SvgIcon
                url={
                  app.iconUrl.startsWith('http')
                    ? app.iconUrl
                    : `https://fp1.mingdaoyun.cn/customIcon/${app.iconUrl}.svg`
                }
                fill="#fff"
                size={24}
                className="InlineBlock"
              />
            </AppIcon>,
            <span className="mLeft20 ellipsis" style={{ maxWidth: 250 }}>
              {app.appName}
            </span>,
          ],
          app.wsCount,
          [
            <UserHead
              className="cellUserHead"
              // projectId={projectId}
              bindBusinessCard
              user={{
                userHead: app.deletePerson.avatar,
                accountId: app.deletePerson.accountId,
              }}
              lazy={'false'}
              size={24}
            />,
            <span className="mLeft8 ellipsis">{app.deletePerson.fullname || app.deletePerson.fullName}</span>,
          ],
          <span className="Gray_9e">{moment(app.deleteTime).format('YYYY-MM-DD HH:mm:ss')}</span>,
        ])}
        onScrollEnd={() => {
          if (!loading && !loadOuted) {
            load({
              pageIndex: pageIndex + 1,
            });
          }
        }}
        onRestore={appIndex => {
          const app = apps[appIndex];
          if (cache.current['pending_' + app.id]) {
            return;
          } else {
            setPendingCache(app.id, true);
          }
          homeAppAjax.restoreApp({
            id: app.id,
            projectId,
            isHomePage,
          })
            .then(isSuccess => {
              if (isSuccess) {
                setApps(oldApps => oldApps.filter(a => a.id !== app.id));
                onRestore(app.appId);
                alert(_l('恢复成功'));
                setPendingCache(app.id, false);
              } else {
                return $.Deferred().reject();
              }
            })
            .fail(err => {
              alert(_l('恢复失败'), 2);
              setPendingCache(app.id, false);
            });
        }}
        onDelete={appIndex => {
          const app = apps[appIndex];
          VerifyPasswordConfirm.confirm({
            title: (
              <div className="Bold" style={{ color: '#f44336' }}>
                <i className="icon-error error" style={{ fontSize: '28px', marginRight: '8px' }}></i>
                {_l('将彻底删除应用 “%0”，请认证你的身份', app.appName)}
              </div>
            ),
            description: (
              <div className="Font14 Gray_75">
                {_l('应用为极其重要的数据，彻底删除应用数据时需要验证身份。彻底删除该数据后，将无法恢复。')}
              </div>
            ),
            passwordPlaceHolder: _l('请输入密码确认删除'),
            onOk: () => {
              homeAppAjax.appRecycleBinDelete({
                id: app.id,
                projectId,
                isHomePage,
              })
                .then(res => {
                  if (res.data) {
                    setApps(oldApps => oldApps.filter(a => a.id !== app.id));
                    alert(_l('彻底删除成功'));
                  } else {
                    return $.Deferred().reject();
                  }
                })
                .fail(err => {
                  alert(_l('彻底删除失败'), 2);
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

AppTrash.propTypes = {
  isHomePage: bool,
  projectId: string,
  onCancel: func,
  onRestore: func,
};
