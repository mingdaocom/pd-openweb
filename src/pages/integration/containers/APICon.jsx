import React, { useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import { Icon, ScrollView, Support, LoadDiv, Dialog, Tooltip } from 'ming-ui';
import styled from 'styled-components';
import { Switch } from 'antd';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import { TableWrap, LogoWrap } from './style';
import { PageSize, publishStatus2Text, formatDate } from '../config';
import { getApiList, deleteApi, getApiRelationList } from 'src/pages/workflow/api/packageVersion';
import APISetting from 'src/pages/integration/containers/APIWrap/index.jsx';
import SvgIcon from 'src/components/SvgIcon';
import { publish, copyProcess } from 'src/pages/workflow/api/process.js';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import ConnectAvator from '../components/ConnectAvator';

const Wrap = styled.div`
  background: #fff;
  padding: 28px 48px;
  min-height: 100%;
  .connectIcon {
  }
  p {
    margin: 0;
  }
  .apiDesCon {
  }
  .desCon {
    p {
      font-weight: 400;
    }
    input {
      max-width: 160px;
      font-size: 13px;
    }
  }
  .noData {
    text-align: center;
    padding-bottom: 140px;
    .iconCon {
      width: 130px;
      height: 130px;
      line-height: 130px;
      background: #f5f5f5;
      border-radius: 50%;
      margin: 80px auto 0;
      color: #9e9e9e;
    }
  }
  .headTr {
  }
  .conTr:hover {
    background: rgba(247, 247, 247, 1);
  }
  .headTr,
  .conTr {
    margin: 0;
    p {
      margin: 0;
    }
    border-bottom: 1px solid #e3e3e3;
    display: flex;
    & > div {
      flex: 2;
      display: flex;
      align-items: center;
      padding: 16px 8px;
      overflow: hidden;
      word-break: break-word;
    }
    .option {
      overflow: initial;
      width: 140px;
    }
    .name {
      flex: 8;
      overflow: hidden;
      padding: 16px 8px;
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
    .nameConTh {
      .connectLogo {
        position: absolute;
        left: -6px;
        top: -6px;
        z-index: 1;
        opacity: 1;
        &:hover {
          opacity: 0.9;
        }
        .logo {
          border: 2px solid rgb(255 255 255);
          background: rgb(255 255 255);
        }
        i {
          line-height: 18px;
          vertical-align: top !important;
        }
      }
    }
    .optionCon {
      opacity: 0;
    }
    &:hover {
      .apiName {
        color: #2196f3;
      }
      .optionCon {
        opacity: 1;
        .icon {
          color: #9e9e9e;
          &:hover {
            color: #2196f3;
          }
          &.del {
            &:hover {
              color: red;
            }
          }
        }
      }
    }
  }
  // .conTr {
  //   &:hover {
  //     background: rgba(247, 247, 247, 1);
  //   }
  // }
`;
// 列表滚动分页加载，每页30个，排序方式为：API的最后更新时间倒序；
// 显示本组织下的所有API（包括安装的和自定义添加的），只有超级管理员和拥有者可以操作点击有权限的API的「状态」开关，对其余没权限的成员只读显示开关；
// 可以搜索API，可搜索内容：连接名称、API名称、API说明；
// 显示连接中的API列表，内容包括：
// ICON：在icon左上角叠加显示连接的LOGO；
// 标题：API标题，加粗显示
// 连接类型：组织 / 个人
// API说明（超过长度以...显示）
// 启用开关
// 更新未发布文案
// 最近操作：操作人、操作类型、操作时间
// hover时显示日志详情、复制按钮（仅自定义连接下API有）、删除按钮（仅自定义连接下API有），标题变蓝色；
// 点击卡片右侧拉出API详情
function APICon(props) {
  const [{ loading, keywords, pageIndex, isMore, list, publishing, show, listId, showType, hasOnchange }, setState] =
    useSetState({
      loading: true,
      keywords: '',
      pageIndex: 1,
      isMore: false,
      list: [],
      publishing: false,
      show: false,
      listId: '',
      showType: 0,
      hasOnchange: 0, //用于更新获取
    });
  const fetchData = () => {
    setState({ loading: true });
    getApiList(
      {
        companyId: props.currentProjectId,
        types: [1, 2], //（包括安装的和自定义添加的）
        pageIndex,
        pageSize: PageSize,
        keyword: keywords,
      },
      { isIntegration: true },
    ).then(res => {
      setState({ loading: false, list: pageIndex > 1 ? list.concat(res) : res, isMore: res.length < PageSize });
    });
  };
  useEffect(() => {
    fetchData();
  }, [props.currentProjectId, keywords, pageIndex, hasOnchange]);
  /**
   * 切换流程的启用状态
   */
  const switchEnabled = item => {
    if (publishing) {
      return;
    }
    setState({ publishing: true });
    publish({ isPublish: !item.enabled, processId: item.id }, { isIntegration: true }).then(publishData => {
      const { isPublish } = publishData;
      if (isPublish) {
        let data = {};
        if (!item.enabled) {
          data = {
            publishStatus: 2,
          };
        }
        setState({
          publishing: false,
          list: list.map(o => {
            if (o.id !== item.id) {
              return o;
            } else {
              return { ...o, enabled: !item.enabled, ...data };
            }
          }),
        });
      } else {
        setState({
          publishing: false,
        });
        alert(_l('发布失败，请完善API信息'), 2);
      }
    });
  };
  /**
   * 复制工作流
   */
  const onCopyProcess = item => {
    Dialog.confirm({
      title: _l('复制“%0”', item.name),
      // description: _l('将复制目标工作流的所有节点和配置'),
      okText: _l('复制'),
      onOk: () => {
        copyProcess({ processId: item.id, name: _l('-复制') }, { isIntegration: true }).then(res => {
          if (res) {
            setState({ keywords: '', pageIndex: 1, hasOnchange: hasOnchange + 1 });
          }
        });
      },
    });
  };

  /**
   * 删除api
   */
  const onDel = async item => {
    const cite = await getApiRelationList(
      {
        id: item.id,
        isPublic: true,
      },
      { isIntegration: true },
    );
    Dialog.confirm({
      title: (
        <span className="Red">
          {cite.length > 0 ? <Icon type="warning" className="mRight8" /> : ''}
          {_l('删除“%0”', item.name)}
        </span>
      ),
      description: (
        <div>
          {cite.length > 0 ? (
            <React.Fragment>
              <span className="Font14 Bold Gray">{_l('注意：当前API正在被组织内引用')}</span>
              <span
                className="ThemeColor3 Font14 mLeft3 Hand"
                onClick={() => {
                  setState({ show: true, listId: item.id, showType: 1 });
                  $('.Dialog-footer-btns .Button--link').click();
                }}
              >
                {_l('查看引用')}
              </span>
              <p className="Gray_75 Font14 mTop8">{_l('请务必确认引用位置不再需要此API，再执行此操作')}</p>
            </React.Fragment>
          ) : (
            _l('API 删除后将不可恢复，确认删除吗？')
          )}
        </div>
      ),
      buttonType: 'danger',
      onOk: () => {
        deleteApi({ id: item.id }, { isIntegration: true }).then(res => {
          if (res) {
            setState({
              list: list.filter(o => o.id !== item.id),
            });
          }
        });
      },
    });
  };
  const columns = [
    {
      title: _l('名称'),
      dataIndex: 'name',
      render: (text, record) => {
        return (
          <div
            className="flexRow flex alignItemsCenter Hand nameConTh Relative"
            onClick={() => {
              setState({ show: true, listId: record.id });
            }}
          >
            {/* 自建的连接，且没设置logo的情况下不显示角标 */}
            {!(!record.apiPackage.iconName && record.apiPackage.type === 1) && (
              <Tooltip text={<span>{record.apiPackage.name}</span>} popupPlacement={'bottom'}>
                <span className="connectLogo">
                  <ConnectAvator {...record.apiPackage} width={20} size={14} className="" />
                </span>
              </Tooltip>
            )}
            <LogoWrap className="logo iconWrap flexRow alignItemsCenter justifyContentCenter">
              <div className="bg" style={{ backgroundColor: record.iconColor || '#757575' }}></div>
              {record.iconName ? (
                <SvgIcon url={record.iconName} fill={record.iconColor} size={32} />
              ) : (
                <Icon icon="rocket_launch" className={'Font32'} />
              )}
            </LogoWrap>
            <div className="flex pLeft16 apiDesCon pRight16 overflowHidden">
              <p className="Font15 Bold WordBreak apiName overflow_ellipsis">{record.name}</p>
              <p className="Font13 Gray_9e WordBreak overflow_ellipsis" title={record.explain}>
                {record.explain}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      title: _l('状态'),
      dataIndex: 'status',
      render: (text, record) => {
        return (
          <div
            className={cx('statusBox overflow_ellipsis WordBreak', {
              cursorDefault: !(record.publishStatus === 1 && record.enabled),
            })}
          >
            <Switch
              checkedChildren={_l('开启')}
              unCheckedChildren={_l('关闭')}
              checked={record.enabled}
              disabled={!(props.isSuperAdmin || record.isOwner)}
              onChange={() => {
                if (!(props.isSuperAdmin || record.isOwner)) {
                  return;
                }
                switchEnabled(record);
              }}
            />
            {record.publishStatus === 1 && record.enabled && (
              <span className={cx('mLeft10 Font12', record.publishStatus === 1 ? 'ThemeColor3' : 'Gray_9e')}>{`${
                publishStatus2Text[record.publishStatus]
              }`}</span>
            )}
          </div>
        );
      },
    },
    {
      title: _l('最近操作'),
      dataIndex: 'lastModifiedDate',
      render: (text, record) => {
        return (
          <div className="Gray_9e overflow_ellipsis WordBreak">
            <span className="mRight3 Gray">{record.ownerAccount.fullName}</span>
            {record.type === 2 ? _l('安装于') : record.lastModifiedDate ? _l('更新于') : _l('创建于')}{' '}
            {`${formatDate(
              record.type === 2 || !record.lastModifiedDate ? record.createdDate : record.lastModifiedDate,
            )}`}
          </div>
        );
      },
    },
    {
      title: '',
      dataIndex: 'option',
      render: (text, record) => {
        return (
          <div className="optionCon alignItemsCenter">
            <span data-tip={_l('日志')}>
              <Icon
                className="Font18 Hand InlineBlock"
                icon="restore2"
                onClick={() => {
                  setState({ show: true, listId: record.id, showType: 2 });
                }}
              />
            </span>
            {/* //仅自定义连接下API有）// 安装的不可复制和删除、自定义的可以复制与删除 */}
            <span data-tip={_l('复制')} className="mLeft25">
              <Icon
                className={cx('Font18 InlineBlock ', {
                  'Gray_9e Alpha5 cursorDefault': record.type !== 1 || (!props.isSuperAdmin && !record.isOwner),
                })}
                icon="copy"
                onClick={() => {
                  if (record.type !== 1 || (!props.isSuperAdmin && !record.isOwner)) {
                    return;
                  }
                  onCopyProcess(record);
                }}
              />
            </span>
            <span data-tip={_l('删除')} className="mLeft25">
              <Icon
                className={cx('Font18 del InlineBlock', {
                  'Gray_9e Alpha5 cursorDefault': record.type !== 1 || (!props.isSuperAdmin && !record.isOwner),
                })}
                icon="delete1"
                onClick={() => {
                  if (
                    record.type !== 1 ||
                    (!props.isSuperAdmin && !record.isOwner) //没有权限
                  ) {
                    return;
                  }
                  onDel(record);
                }}
              />
            </span>
          </div>
        );
      },
    },
  ];

  const renderEmpty = () => (
    <div className="noData TxtCenter">
      <span className="iconCon InlineBlock TxtCenter ">
        <i className="icon-api Font64 TxtMiddle" />
      </span>
      {keywords ? (
        <p className="Bold Gray_9e Hand mTop24">{_l('无匹配的结果，换一个关键词试试吧')}</p>
      ) : (
        <p className="Bold Gray_9e Hand mTop24">
          {_l('请从')}
          <Link className="pLeft18" to={`/integration/connect`}>
            {_l('连接与认证')}
          </Link>
          {_l('安装或创建 API')}
        </p>
      )}
    </div>
  );
  const onScrollEnd = () => {
    if (loading || isMore) return;
    setState({ pageIndex: pageIndex + 1 });
  };
  return (
    <ScrollView onScrollEnd={onScrollEnd}>
      <Wrap>
        <div className="desCon">
          <h3 className="Bold Font24">API</h3>
          <p className="Font15 mBottom4 mTop8 flexRow">
            <span className="flex">
              <span className="TxtMiddle">{_l('管理第三方 API ，在工作表或工作流中调用')}</span>
              <Support type={3} href="https://help.mingdao.com/integration.html#api管理" text={_l('使用帮助')} />
            </span>
            <SearchInput
              placeholder={_l('搜索 API')}
              value={keywords}
              onChange={v => {
                setState({ keywords: v, pageIndex: 1 });
              }}
            />
          </p>
        </div>
        {loading && pageIndex === 1 ? (
          <LoadDiv />
        ) : (
          <TableWrap className="mTop20">
            {list.length <= 0 ? (
              renderEmpty()
            ) : (
              <div className="tableCon">
                <div className="headTr">
                  {columns.map(o => {
                    return <div className={`${o.dataIndex}`}>{o.title}</div>;
                  })}
                </div>
                {list.map(item => {
                  return (
                    <div className="conTr">
                      {columns.map(o => {
                        return (
                          <div className={`${o.dataIndex}`}>{o.render ? o.render('', item) : item[o.dataIndex]}</div>
                        );
                      })}
                    </div>
                  );
                })}
                {props.loading && props.pageIndex !== 1 && <LoadDiv />}
              </div>
            )}
          </TableWrap>
        )}
        {show && (
          <APISetting
            {...props}
            connectInfo={
              listId && !((list.find(o => o.id === listId) || {}).apiPackage || {}).isOwner && !props.isSuperAdmin
                ? {
                    ...list.find(o => o.id === listId).apiPackage,
                    isOwner: list.find(o => o.id === listId).apiPackage.isOwner,
                    ownerAccount: list.find(o => o.id === listId).ownerAccount,
                  }
                : null
            }
            data={listId ? list.find(o => o.id === listId) : {}}
            listId={listId}
            tab={showType}
            onClickAwayExceptions={['.dropdownTrigger', '.selectIconWrap', '.mui-dialog-dialog', '.Menu']}
            onClickAway={() => setState({ show: false })}
            onCancel={() => setState({ show: false })}
            onDel={() => onDel(list.find(o => o.id === listId))}
            onChange={obj => {
              let listNew = listId
                ? list.map(o => {
                    if (o.id === obj.id) {
                      return { ...o, ...obj };
                    } else {
                      return o;
                    }
                  })
                : ist.concat(obj);
              setState({
                listId: obj.id,
                list: listNew,
              });
            }}
          />
        )}
      </Wrap>
    </ScrollView>
  );
}

export default APICon;
