import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { ScrollView, SvgIcon } from 'ming-ui';

const AppListContainer = styled.div`
  width: 100%;
  border-radius: 3px;
  border: 1px solid var(--color-border-primary);

  .headTr {
    display: flex;
    height: 36px;
    line-height: 36px;
    font-size: 12px;
    color: var(--color-text-tertiary);
    padding: 0 12px;
  }
  .name {
    flex: 7;
    min-width: 0;
  }
  .createTime,
  .owner {
    flex: 3;
    min-width: 0;
  }
  .option {
    flex: 1;
  }

  .noDataContent {
    height: 100px;
    line-height: 100px;
    color: var(--color-text-disabled);
    text-align: center;
  }
  .appList {
    height: 280px;

    .dataItem {
      display: flex;
      height: 48px;
      line-height: 48px;
      padding: 0 12px;
      .appIcon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 24px;
        min-width: 24px;
        height: 24px;
        line-height: 16px;
        border-radius: 4px;
        margin-right: 8px;
      }
      .userIcon {
        width: 25px;
        height: 25px;
        border-radius: 50%;
        margin-right: 6px;
      }
      .removeItem {
        color: var(--color-text-disabled);
        cursor: pointer;
        &:hover {
          color: var(--color-primary);
        }
      }
    }
  }
`;

export default function AuthAppList(props) {
  const { className, authApps = [], onRemove = () => {} } = props;

  const columns = [
    {
      dataIndex: 'name',
      title: _l('应用名称'),
      render: item => {
        return (
          <div className="flexRow alignItemsCenter">
            <div className="appIcon" style={{ background: item.iconColor }}>
              <SvgIcon url={item.iconUrl} fill="#fff" size={16} />
            </div>
            <span className="overflow_ellipsis mRight10" title={item.appName}>
              {item.appName}
            </span>
          </div>
        );
      },
    },
    {
      dataIndex: 'createTime',
      title: _l('创建时间'),
      render: item => {
        return <div>{item.ctime ? moment(item.ctime).format('YYYY-MM-DD') : ''}</div>;
      },
    },
    {
      dataIndex: 'owner',
      title: _l('拥有者'),
      render: item => {
        const createAccount = item.createAccountInfo || {};
        return !_.isEmpty(createAccount) ? (
          <div className="flexRow alignItemsCenter">
            <img className="userIcon" src={createAccount.avatar} />
            <span className="overflow_ellipsis" title={createAccount.fullName}>
              {createAccount.fullName}
            </span>
          </div>
        ) : null;
      },
    },
    {
      dataIndex: 'option',
      title: '',
      render: item => (
        <div className="removeItem" onClick={() => onRemove(item.appId)}>
          {_l('移除')}
        </div>
      ),
    },
  ];

  return (
    <AppListContainer className={className}>
      <div className="headTr">
        {columns.map((item, index) => {
          return (
            <div key={index} className={`${item.dataIndex}`}>
              {item.title}
            </div>
          );
        })}
      </div>
      {!authApps.length ? (
        <div className="noDataContent">{_l('暂无应用')}</div>
      ) : (
        <ScrollView className="appList">
          {authApps.map((appItem, i) => {
            return (
              <div key={i} className="dataItem">
                {columns.map((item, j) => {
                  return (
                    <div key={`${i}-${j}`} className={`${item.dataIndex}`}>
                      {item.render ? item.render(appItem) : appItem[item.dataIndex]}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </ScrollView>
      )}
    </AppListContainer>
  );
}
