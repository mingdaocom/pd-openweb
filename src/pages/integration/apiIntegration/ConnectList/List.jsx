import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, MdLink, UserHead } from 'ming-ui';
import { TYPELIST } from 'src/pages/integration/config';
import ConnectAvator from '../../components/ConnectAvator';
import ConnectOptionMenu from '../../components/ConnectOptionMenu';
import { MoreOperate } from '../style';

const Wrap = styled.div`
  .manageListOrder {
    transform: scale(0.8);
    color: var(--color-text-disabled);
    .icon-arrow-down {
      margin-top: -4px;
    }
  }
  padding: 0 32px 32px;
  .noData {
    .iconCon {
      width: 130px;
      height: 130px;
      line-height: 130px;
      background: var(--color-background-secondary);
      border-radius: 50%;
      margin: 120px auto 0;
      color: var(--color-text-tertiary);
    }
  }
  .addConnect {
    padding: 8px 24px;
    background: var(--color-primary);
    border-radius: 21px;
    color: var(--color-white);
    display: inline-block;
    &:hover {
      background: var(--color-link-hover);
    }
  }
  .headTr {
  }
  .headTr,
  .conTr {
    color: var(--color-text-title);
    margin: 0;
    p {
      margin: 0;
    }
    padding: 15px 0;
    border-bottom: 1px solid var(--color-border-secondary);
    display: flex;
    & > div {
      flex: 12;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      min-width: 0;
      word-break: break-word;
      &.option {
        width: 40px;
        flex: initial;
        opacity: 0;
      }
    }
    .apiCount,
    .apkCount {
      max-width: 100px;
    }
    .name {
      flex: 40;
      overflow: hidden;
      padding-left: 8px;
    }
    .imgCon {
      width: 36px;
      height: 36px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      overflow: hidden;
      line-height: 36px;
      text-align: center;
      font-size: 20px;
    }
  }
  .conTr {
    &:hover {
      background: var(--color-background-card);
      .option {
        opacity: 1;
      }
    }
  }
`;

function List(props) {
  // 滚动分页加载，每页30个，排序为添加时间倒序；
  // 组织内的所有连接都显示，只有超级管理员和拥有者可以点击查看连接详情；
  const keys = [
    {
      key: 'name',
      name: _l('名称'),
      render: item => {
        return (
          <div className="flexRow alignItemsCenter">
            <ConnectAvator {...item} width={36} size={22} />
            <div className="flex pLeft16 overflowHidden pRight16">
              <p className="Font15 Bold WordBreak">{item.name}</p>
              <p className="Font13 textTertiary WordBreak overflow_ellipsis wMax100">{item.explain}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'authType',
      name: _l('鉴权方式'),
      render: item => {
        return (
          <div className="pRight8">
            {item?.hasAuth
              ? _l('OAuth 2.0 认证（授权码）')
              : TYPELIST.find(o => o?.actionId === item?.defaultFlowNode?.actionId)?.text}
          </div>
        );
      },
    },
    {
      key: 'apiCount',
      sortKey: 'countSort',
      renderHead: info => {
        return (
          <div
            className="pRight12 Hand ThemeHoverColor3 flexRow"
            onClick={() =>
              info.onChange({ countSort: info.countSort === 2 ? 0 : info.countSort === 0 ? 1 : 2, pageIndex: 1 })
            }
          >
            <span className="">{_l('API数量')}</span>
            <div className="flexColumn manageListOrder">
              <Icon icon="arrow-up" className={cx('flex', { ThemeColor3: info.countSort === 2 })} />
              <Icon icon="arrow-down" className={cx('flex', { ThemeColor3: info.countSort === 1 })} />
            </div>
          </div>
        );
      },
    },
    {
      key: 'apkCount',
      name: _l('授权应用'),
    },
    {
      key: 'cid',
      name: _l('创建人'),
      render: item => {
        return (
          <div className="pRight8 flexRow alignItemsCenter">
            <UserHead
              user={{ userHead: item?.ownerAccount?.avatar, accountId: item?.ownerAccount?.accountId }}
              size={24}
              className="mRight8"
            />
            {_.get(item, 'ownerAccount.fullName')}
          </div>
        );
      },
    },
    {
      key: 'ctime',
      sortKey: 'timeSort',
      renderHead: info => {
        return (
          <div
            className="pRight12 Hand ThemeHoverColor3 flexRow"
            onClick={() =>
              info.onChange({ timeSort: info.timeSort === 2 ? 0 : info.timeSort === 0 ? 1 : 2, pageIndex: 1 })
            }
          >
            <span className="">{_l('创建时间')}</span>
            <div className="flexColumn manageListOrder">
              <Icon icon="arrow-up" className={cx('flex', { ThemeColor3: info.timeSort === 2 })} />
              <Icon icon="arrow-down" className={cx('flex', { ThemeColor3: info.timeSort === 1 })} />
            </div>
          </div>
        );
      },
      render: item => {
        return <span className="">{item.createdDate}</span>;
      },
    },
    {
      key: 'option',
      name: '',
      render: (item, propsData) => {
        const { isOwner, hasAuth } = item;
        const isConnectOwner = propsData.hasManageAuth || isOwner;
        const canShowMenu = isConnectOwner || hasAuth;

        if (!canShowMenu) {
          return '';
        }

        const popupAlign = {
          points: ['tr', 'br'],
          offset: [0, 10],
          overflow: { adjustX: true, adjustY: true },
        };

        const trigger = (
          <MoreOperate onClick={e => e.stopPropagation()}>
            <i className="icon icon-more_horiz"></i>
          </MoreOperate>
        );

        return (
          <ConnectOptionMenu
            connectData={item}
            currentProjectId={propsData.currentProjectId}
            hasManageAuth={propsData.hasManageAuth}
            onCopySuccess={propsData.onFresh}
            onDeleteSuccess={propsData.onFresh}
            popupAlign={popupAlign}
            trigger={trigger}
          />
        );
      },
    },
  ];

  return (
    <Wrap>
      {props.pageIndex === 1 && props.loading ? (
        <LoadDiv />
      ) : props.list.length > 0 ? (
        <React.Fragment>
          <div className="tableCon">
            <div className="headTr">
              {keys.map(o => {
                return (
                  <div className={`${o.key}`}>
                    {o.renderHead
                      ? o.renderHead({
                          [o.sortKey]: props[o.sortKey],
                          onChange: info => {
                            props.onChange(info);
                          },
                        })
                      : o.name}
                  </div>
                );
              })}
            </div>
            {props.list.map(item => {
              const isCharge = item.isOwner || props.hasManageAuth; //只有超级管理员或拥有者可以查看详情 isOwner拥有者
              if (!isCharge && !item.hasAuth) {
                return (
                  <div className="conTr Hand">
                    {keys.map(o => {
                      return <div className={`${o.key}`}>{o.render ? o.render(item, props) : item[o.key]}</div>;
                    })}
                  </div>
                );
              } else {
                return (
                  <MdLink className="conTr Hand stopPropagation" to={`/integrationConnect/${item.id}`}>
                    {keys.map(o => {
                      return (
                        <div className={`${o.key}`} onClick={e => e.stopPropagation()}>
                          {o.render ? o.render(item, props) : item[o.key]}
                        </div>
                      );
                    })}
                  </MdLink>
                );
              }
            })}
            {props.loading && props.pageIndex !== 1 && <LoadDiv />}
          </div>
        </React.Fragment>
      ) : (
        <div className="noData TxtCenter">
          <span className="iconCon InlineBlock TxtCenter ">
            <i className={`icon-connect Font64 TxtMiddle`} />
          </span>
          <p className="textTertiary mTop20 mBottom0">
            {props.keywords ? _l('无匹配的结果，换一个关键词试试吧') : _l('暂无可用连接')}
          </p>
          {!props.keywords && props.featureType && props.canCreateAPIConnect && props.tab === 1 && (
            <span className="addConnect Bold Hand mTop24" onClick={() => props.onCreate()}>
              {_l('创建自定义连接')}
            </span>
          )}
        </div>
      )}
    </Wrap>
  );
}

export default List;
