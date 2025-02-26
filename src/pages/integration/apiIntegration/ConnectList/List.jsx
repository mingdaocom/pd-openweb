import React from 'react';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import Trigger from 'rc-trigger';
import { LoadDiv, Icon, Menu, MenuItem, Dialog, MdLink } from 'ming-ui';
import ConnectAvator from '../../components/ConnectAvator';
import PublishDialog from 'src/pages/integration/components/PublishDialog.jsx';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import cx from 'classnames';

const Wrap = styled.div`
  .manageListOrder {
    transform: scale(0.8);
    color: #bfbfbf;
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
      background: #f5f5f5;
      border-radius: 50%;
      margin: 120px auto 0;
      color: #9e9e9e;
    }
  }
  .addConnect {
    padding: 8px 24px;
    background: #2196f3;
    border-radius: 21px;
    color: #fff;
    display: inline-block;
    &:hover {
      background: #1764c0;
    }
  }
  .headTr {
  }
  .headTr,
  .conTr {
    color: #151515;
    margin: 0;
    p {
      margin: 0;
    }
    padding: 15px 0;
    border-bottom: 1px solid #e3e3e3;
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
      max-width: 140px;
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
      background: rgba(247, 247, 247, 1);
      .option {
        opacity: 1;
      }
    }
  }
`;
const MoreOperate = styled.span`
  cursor: pointer;
  text-align: center;
  border-radius: 3px;
  line-height: 24px;
  display: inline-block;
  width: 24px;
  height: 24px;
  color: #9e9e9e;
  font-size: 18px;
  &:hover {
    // background-color: rgba(0, 0, 0, 0.03);
    color: #2196f3;
  }
`;
const MenuWrap = styled(Menu)`
  position: relative !important;
  overflow: auto;
  padding: 6px 0 !important;
  width: 200px !important;
`;
const MenuItemWrap = styled(MenuItem)`
  .Item-content {
    padding-left: 47px !important;
  }
`;

const RedMenuItemWrap = styled(MenuItemWrap)`
  .Item-content {
    color: #f44336 !important;
    .Icon {
      color: #f44336 !important;
    }
  }
  &:not(.disabled):hover {
    .Icon {
      color: #fff !important;
    }
  }
`;
function Option(props) {
  const { currentProjectId, data, hasManageAuth } = props;
  const { id, type, isOwner, name, hasAuth } = data;
  const [{ popupVisible, showPublish, apiList }, setState] = useSetState({
    popupVisible: false,
    showPublish: false,
    apiList: [],
  });
  const isConnectOwner = hasManageAuth || isOwner;
  if (!isConnectOwner && !hasAuth) {
    return '';
  }
  const upperConnect = info => {
    packageVersionAjax
      .upper(
        {
          id: id,
          ...info,
        },
        { isIntegration: true },
      )
      .then(res => {
        if (res) {
          setState({ showPublish: false });
          alert(_l('已申请上架，请等待审核'));
        } else {
          alert(_l('申请失败，请稍后再试'), 2);
        }
      });
  };
  const onDel = () => {
    const AjaxFetch =
      props.tab === 3
        ? packageVersionAjax.unInstall(
            {
              id: id,
              companyId: currentProjectId,
            },
            { isIntegration: true },
          )
        : packageVersionAjax.delete(
            {
              id: id,
            },
            { isIntegration: true },
          );
    AjaxFetch.then(res => {
      if (res) {
        alert(_l('删除成功'));
        props.updateList(props.list.filter(o => o.id !== id));
      } else {
        alert(_l('有API被引用，请删除引用后重试'), 3);
      }
    });
  };
  const onCopy = () => {
    packageVersionAjax
      .copy(
        {
          id: id,
        },
        { isIntegration: true },
      )
      .then(res => {
        if (res) {
          alert(_l('复制成功'));
          props.onFresh();
        } else {
          alert(_l('复制失败，请稍后重试'), 3);
        }
      });
  };
  return (
    <React.Fragment>
      <Trigger
        action={['click']}
        popupClassName="moOption"
        getPopupContainer={() => document.body}
        popupVisible={popupVisible}
        onPopupVisibleChange={popupVisible => {
          setState({ popupVisible });
        }}
        popupAlign={{
          points: ['tr', 'br'],
          offset: [0, 10],
          overflow: { adjustX: true, adjustY: true },
        }}
        popup={
          <MenuWrap>
            {isConnectOwner && (
              <React.Fragment>
                {!md.global.Config.IsLocal && //私有部署没有上架
                  type !== 2 && ( //安装的连接 不能上架
                    <MenuItemWrap
                      icon={<Icon icon="publish" className="Font17 mLeft5" />}
                      onClick={e => {
                        setState({ popupVisible: false, showPublish: true });
                        e.stopPropagation();
                      }}
                    >
                      {_l('申请上架到API库')}
                    </MenuItemWrap>
                  )}
                {type !== 2 &&
                  props.tab !== 3 && ( //自建的连接
                    <MenuItemWrap
                      icon={<Icon icon="copy" className="Font17 mLeft5" />}
                      onClick={e => {
                        e.stopPropagation();
                        setState({ popupVisible: false });
                        Dialog.confirm({
                          title: <span className="">{`${_l('复制连接')}“${name}”`}</span>,
                          width: 500,
                          description: _l('将复制目标连接的所有配置信息'),
                          okText: _l('复制'),
                          onOk: () => {
                            setState({ popupVisible: false });
                            onCopy();
                          },
                        });
                      }}
                    >
                      {_l('复制')}
                    </MenuItemWrap>
                  )}
              </React.Fragment>
            )}
            <RedMenuItemWrap
              icon={<Icon icon="delete1" className="Font17 mLeft5" />}
              onClick={e => {
                e.stopPropagation();
                setState({ popupVisible: false });
                props.tab === 3
                  ? Dialog.confirm({
                      title: <span className="Red">{`${_l('确认删除')}`}</span>,
                      buttonType: 'danger',
                      width: 500,
                      description: _l('删除连接后，连接下授权的账户信息也会被删除。'),
                      onOk: () => {
                        onDel();
                      },
                    })
                  : Dialog.confirm({
                      title: <span className="Red">{`${_l('删除连接')}“${name}”`}</span>,
                      buttonType: 'danger',
                      width: 500,
                      description: _l('删除后将不可恢复，确认删除吗？'),
                      onOk: () => {
                        onDel();
                      },
                    });
              }}
            >
              {_l('删除')}
            </RedMenuItemWrap>
          </MenuWrap>
        }
      >
        <MoreOperate
          className="moreOperate mTop3"
          style={popupVisible ? { display: 'inline-block' } : {}}
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <i className="icon icon-task-point-more"></i>
        </MoreOperate>
      </Trigger>
      {showPublish && (
        <PublishDialog
          currentProjectId={currentProjectId}
          id={id}
          onOk={data => {
            upperConnect(data);
          }}
          onCancel={() => {
            setState({ showPublish: false });
          }}
          hasManageAuth={hasManageAuth}
          isGetData
        />
      )}
    </React.Fragment>
  );
}
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
            <p className="Font13 Gray_75 WordBreak overflow_ellipsis wMax100">{item.explain}</p>
          </div>
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
      return <div className="pRight8">{_.get(item, 'ownerAccount.fullName')}</div>;
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
      return <Option data={item} {...propsData} />;
    },
  },
];

function List(props) {
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
                      return <div className={`${o.key}`}>{o.render ? o.render(item, props) : item[o.key]}</div>;
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
          <p className="Gray_9e mTop20 mBottom0">
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
