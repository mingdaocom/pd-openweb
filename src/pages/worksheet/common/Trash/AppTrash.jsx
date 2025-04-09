import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { bool, func, string } from 'prop-types';
import styled from 'styled-components';
import { SvgIcon, UserHead, VerifyPasswordConfirm } from 'ming-ui';
import homeAppAjax from 'src/api/homeApp';
import BaseTrash from './BaseTrash';

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
    homeAppAjax
      .getAppRecoveryRecordList({
        pageIndex: args.pageIndex || pageIndex,
        pageSize: 20,
        projectId,
        isHomePage,
        keyword: _.isUndefined(args.keyword) ? keyword : args.keyword,
      })
      .then(data => {
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
        desc={_l('可恢复%0天内删除的应用', md.global.SysSettings.appRecycleDays)}
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
                    : `${md.global.FileStoreConfig.pubHost.replace(/\/$/, '')}/customIcon/${app.iconUrl}.svg`
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
              projectId={projectId}
              className="cellUserHead"
              user={{
                userHead: app.deletePerson.avatar,
                accountId: app.deletePerson.accountId,
              }}
              appId={app.appId}
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
          homeAppAjax
            .restoreApp({
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
                return Promise.reject();
              }
            })
            .catch(err => {
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
            description: <div className="Font14 Gray_75">{_l('删除后无法恢复(物理删除)，请谨慎操作！')}</div>,
            confirmType: 'danger',
            allowNoVerify: false,
            isRequired: false,
            closeImageValidation: false,
            onOk: () => {
              homeAppAjax
                .appRecycleBinDelete({
                  id: app.id,
                  projectId,
                  isHomePage,
                })
                .then(res => {
                  if (res.data) {
                    setApps(oldApps => oldApps.filter(a => a.id !== app.id));
                    alert(_l('彻底删除成功'));
                  } else {
                    return Promise.reject();
                  }
                })
                .catch(err => {
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
