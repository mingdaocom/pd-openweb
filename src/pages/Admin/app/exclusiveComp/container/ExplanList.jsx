import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import moment from 'moment';
import styled from 'styled-components';
import { Icon, LoadDiv, UserName } from 'ming-ui';
import { Button, Dropdown, Tooltip } from 'ming-ui/antd-components';
import projectAjax from 'src/api/project';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import PurchaseExpandPack from 'src/pages/Admin/components/PurchaseExpandPack.jsx';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { getFeatureStatus } from 'src/utils/services/project';
import EditNameDialog from '../component/EditNameDialog';
import Status from '../component/Status';
import { COMPUTING_INSTANCE_STATUS } from '../config';
import {
  canManageComputingInstance,
  canViewComputingInstanceHistory,
  getComputingHistoryPath,
  isLatestComputingInstanceRequest,
  shouldShowComputingInstanceWorkflowCount,
} from '../historyWorkflow';
import EXCLUSIVE_BIG from '../images/exclusive_big.png';
import EXCLUSIVE_EXPLAN_IMG from '../images/exclusive_explan.png';
import EXCLUSIVE_EXPLAN_HUI_IMG from '../images/exclusive_explan_hui.png';
import '../index.less';

const EmptyWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  img {
    width: 94px;
    height: auto;
    margin-bottom: 25px;
  }
  .desc {
    width: 448px;
    font-size: 14px;
    color: var(--color-text-title);
    line-height: 25px;
    margin-bottom: 70px;
    text-align: center;
  }
`;

function ExplanList(props) {
  const { projectId, refresh } = props;
  const FEATURE_STATUS = getFeatureStatus(projectId, VersionProductType.exclusiveResource);
  const [operateMenuVisible, setOperateMenuVisible] = useState(-1);
  const [editNameParam, setEditNameParam] = useState({
    visible: false,
    value: undefined,
  });
  const [data, setData] = useState({
    list: [],
    outDateList: [],
  });
  const [config, setConfig] = useState({
    isInit: true,
    loading: true,
    effectiveCount: 0,
    upgradeVersionDialog: FEATURE_STATUS ? false : true,
  });
  const listRequestIdRef = useRef(0);

  const getData = useCallback(() => {
    const requestId = ++listRequestIdRef.current;

    return Promise.resolve()
      .then(() => {
        if (!isLatestComputingInstanceRequest(requestId, listRequestIdRef.current)) return undefined;

        setConfig(currentConfig => ({ ...currentConfig, loading: true }));
        return projectAjax.getComputingInstances({ projectId });
      })
      .then(res => {
        if (!isLatestComputingInstanceRequest(requestId, listRequestIdRef.current)) return;

        const instances = res || [];

        setConfig(currentConfig => ({
          ...currentConfig,
          isInit: instances.length === 0,
          effectiveCount: instances.filter(l =>
            [COMPUTING_INSTANCE_STATUS.Creating, COMPUTING_INSTANCE_STATUS.Running].includes(l.status),
          ).length,
        }));
        let list = [];
        let outDateList = [];
        instances.forEach(l => {
          if (l.status < 7) list.push(l);
          else outDateList.push(l);
        });
        setData({
          list: list,
          outDateList: outDateList,
        });
      })
      .finally(() => {
        if (!isLatestComputingInstanceRequest(requestId, listRequestIdRef.current)) return;

        setConfig(currentConfig => ({ ...currentConfig, loading: false }));
      });
  }, [projectId]);

  useEffect(() => {
    getData();

    return () => {
      listRequestIdRef.current += 1;
    };
  }, [getData]);

  useEffect(() => {
    if (refresh === -1) return;

    getData();
  }, [getData, refresh]);

  const updateData = param => {
    projectAjax.updateComputingInstance({ projectId, ...param }).then(res => {
      if (res) {
        getData();
      }
    });
  };

  const goToPurchase = () => {
    if (!FEATURE_STATUS) {
      alert(_l('请联系组织超级管理员购买或升级'), 2);
      return;
    }

    if (FEATURE_STATUS === '2') {
      setConfig({
        ...config,
        upgradeVersionDialog: true,
      });
      return;
    }

    if (
      window.platformENV.isPlatform &&
      !window.platformENV.isLocal &&
      !window.platformENV.isOverseas &&
      config.effectiveCount >= 5
    ) {
      alert(_l('购买数量超出上限'), 3);
      return;
    }

    navigateTo(`/admin/expansionserviceComputing/${projectId}/computing`);
  };

  const renewPurchase = ({ id, resourceId }) => {
    projectAjax
      .retryComputingInstance({
        projectId,
        id,
        resourceId,
      })
      .then(res => {
        if (res) {
          alert(_l('重新创建中...'));
          getData();
        } else {
          alert(_l('创建失败'));
        }
      });
  };

  const renderEmpty = () => {
    return (
      <EmptyWrap className="exclusiveCompContent flex">
        <img src={EXCLUSIVE_BIG} />
        <div className="Font22 bold mBottom24">{_l('算力')}</div>
        <div className="desc">
          {_l(
            '组织购买专属算力服务后，将重要的工作流添加到专属算力服务中运行，可免受本组织或平台其他组织的流程堵塞影响',
          )}
        </div>
        <Button type="primary" shape="round" className="Font14" onClick={goToPurchase}>
          {window.platformENV.isPlatform ? _l('购买专属算力') : _l('创建专属算力')}
        </Button>
      </EmptyWrap>
    );
  };

  const renderList = list => {
    if (list.length === 0) return null;
    return list.map(item => (
      <li className="mBottom14" key={`exclusiveCompItem-${item.id}`} onClick={() => {}}>
        <div className="explanCardHeader valignWrapper">
          <div className="headerLeft">
            <span
              className="Hand"
              onClick={() => {
                if (
                  [
                    COMPUTING_INSTANCE_STATUS.Creating,
                    COMPUTING_INSTANCE_STATUS.CreationFailed,
                    COMPUTING_INSTANCE_STATUS.Destroyed,
                  ].includes(item.status)
                )
                  return;
                navigateTo(`/admin/computing/${projectId}/${item.id}`);
              }}
            >
              <img
                src={
                  item.status === COMPUTING_INSTANCE_STATUS.Running ? EXCLUSIVE_EXPLAN_IMG : EXCLUSIVE_EXPLAN_HUI_IMG
                }
              />
              <span className="bold Font15">{item.name}</span>
            </span>

            <span className="Font15 mRight10">
              <Tooltip
                title={
                  <div>
                    <div className="textDisabled">{_l('资源ID')}</div>
                    <div className="mTop9">
                      {item.resourceId}
                      <Tooltip title={_l('复制资源ID')} placement="top">
                        <span
                          className="Hand"
                          onClick={() => {
                            copy(item.resourceId);
                            alert(_l('复制成功'));
                          }}
                        >
                          <span className="icon-content-copy mLeft8 textDisabled hoverColorPrimaryLight Hand"></span>
                        </span>
                      </Tooltip>
                    </div>
                  </div>
                }
              >
                <span className="icon-info_outline Font16 textDisabled mLeft4"></span>
              </Tooltip>
            </span>
            <Status value={item.status} />
          </div>
          <div
            className="actionsRight Font13 "
            style={{
              color: 'var(--color-text-tertiary)',
            }}
          >
            {item.creator && (
              <Fragment>
                <UserName
                  className="mRight5"
                  style={{
                    color: 'var(--color-text-tertiary)',
                  }}
                  projectId={projectId}
                  user={{ userName: item.creator.fullname, accountId: item.creator.accountId }}
                />
                <span className="mRight5">{_l('创建于')}</span>
                <span>{item.createDateTime ? createTimeSpan(item.createDateTime) : '_'}</span>
              </Fragment>
            )}
            {[COMPUTING_INSTANCE_STATUS.CreationFailed, COMPUTING_INSTANCE_STATUS.Stopped].includes(item.status) && (
              <Button
                color="primary"
                variant="text"
                size="small"
                className="mLeft24"
                onClick={() => renewPurchase(item)}
              >
                {_l('重新创建')}
              </Button>
            )}
            {![
              COMPUTING_INSTANCE_STATUS.Creating,
              COMPUTING_INSTANCE_STATUS.CreationFailed,
              COMPUTING_INSTANCE_STATUS.Starting,
              COMPUTING_INSTANCE_STATUS.Stopping,
              COMPUTING_INSTANCE_STATUS.Stopped,
              COMPUTING_INSTANCE_STATUS.Restarting,
            ]
              .filter(v => (window.platformENV.isPlatform ? true : v !== COMPUTING_INSTANCE_STATUS.CreationFailed))
              .includes(item.status) && (
              <Fragment>
                {canManageComputingInstance(item.status) &&
                  (item.status !== COMPUTING_INSTANCE_STATUS.DestroyFailed || item.workflowCount > 0) && (
                    <Button
                      color="default"
                      variant="outlined"
                      shape="round"
                      className="mLeft24"
                      onClick={() => {
                        navigateTo(`/admin/computing/${projectId}/${item.id}`);
                      }}
                    >
                      {_l('管理')}
                    </Button>
                  )}
                {![COMPUTING_INSTANCE_STATUS.Destroying, COMPUTING_INSTANCE_STATUS.DestroyFailed].includes(
                  item.status,
                ) && (
                  <Dropdown
                    open={operateMenuVisible === item.id}
                    onOpenChange={visible => setOperateMenuVisible(visible ? item.id : -1)}
                    trigger={['click']}
                    menu={{
                      items: [
                        ...(canViewComputingInstanceHistory(item.status)
                          ? [
                              {
                                key: 'view',
                                label: _l('查看'),
                                onClick: () => {
                                  navigateTo(getComputingHistoryPath({ projectId, id: item.id }));
                                  setOperateMenuVisible(-1);
                                },
                              },
                            ]
                          : []),
                        ...([COMPUTING_INSTANCE_STATUS.Creating, COMPUTING_INSTANCE_STATUS.Running].includes(
                          item.status,
                        )
                          ? [
                              {
                                key: 'rename',
                                label: _l('修改名称'),
                                onClick: () => {
                                  setEditNameParam({
                                    visible: true,
                                    value: item.name,
                                    id: item.id,
                                  });
                                  setOperateMenuVisible(-1);
                                },
                              },
                              ...(item.canRenew
                                ? [
                                    {
                                      key: 'renew',
                                      label: (
                                        <PurchaseExpandPack
                                          className="Block renewal"
                                          text={_l('续费')}
                                          type="renewcomputing"
                                          routePath="expansionserviceComputing"
                                          projectId={projectId}
                                          extraParam={item.id}
                                        />
                                      ),
                                    },
                                  ]
                                : []),
                            ]
                          : []),
                        ...([COMPUTING_INSTANCE_STATUS.Destroyed]
                          .concat(!window.platformENV.isPlatform ? [COMPUTING_INSTANCE_STATUS.CreationFailed] : [])
                          .includes(item.status)
                          ? [
                              {
                                key: 'delete',
                                label: _l('删除'),
                                danger: true,
                                onClick: () => {
                                  updateData({
                                    instanceId: item.id,
                                    isDelete: true,
                                  });
                                  setOperateMenuVisible(-1);
                                },
                              },
                            ]
                          : []),
                      ],
                      style: { minWidth: 160 },
                    }}
                  >
                    <Icon icon="moreop" className="textDisabled Font20 mLeft24 hoverColorPrimaryLight Hand" />
                  </Dropdown>
                )}
              </Fragment>
            )}
          </div>
        </div>
        <div className="explanCardContent">
          <div className="explanCardContentItem">
            <p className="label">{_l('规格')}</p>
            <p className="value">{`${_l('%0并发数', item.specification.concurrency)} | ${_l(
              '%0核',
              item.specification.core,
            )}（vCPU） | ${item.specification.memory / 1024}GiB`}</p>
          </div>
          <div className="explanCardContentItem">
            <p className="label">{_l('到期时间')}</p>
            <p className="value">
              {item.status === COMPUTING_INSTANCE_STATUS.CreationFailed ? (
                '_'
              ) : item.expirationDatetime ? (
                <Fragment>
                  <span className={item.remainingDays < 1 ? 'textSecondary mRight5' : 'textPrimary mRight5'}>
                    {moment(item.expirationDatetime).format(_l('YYYY-MM-DD'))}
                    {_l('到期')}
                  </span>
                  {item.remainingDays < 1 ? (
                    <span style={{ color: 'var(--color-error)' }}>{_l('已过期')}</span>
                  ) : (
                    <Fragment>
                      {_l('剩余')} <span style={{ color: 'var(--color-success)' }}>{item.remainingDays}</span>{' '}
                      {_l('天')}
                    </Fragment>
                  )}
                </Fragment>
              ) : (
                '_'
              )}
            </p>
          </div>
          <div
            className={cx('explanCardContentItem', {
              // 服务过期后不显示工作流数，与算力实例是否已销毁无关。
              Visibility: !shouldShowComputingInstanceWorkflowCount(item.remainingDays),
            })}
          >
            <p className="label">{_l('工作流数')}</p>
            <p className="value">{item.workflowCount}</p>
          </div>
        </div>
      </li>
    ));
  };

  return (
    <Fragment>
      {config.loading ? (
        <div className="exclusiveCompContent flex">
          <LoadDiv />
        </div>
      ) : config.isInit ? (
        renderEmpty()
      ) : (
        <div className="exclusiveCompContent flex">
          <div className="exclusiveCompExplan">
            {_l('将重要的工作流添加到专属算力中运行，可免受本组织或平台其他组织的流程堵塞影响')}
            <Button color="primary" variant="text" size="small" icon={<Icon icon="add" />} onClick={goToPurchase}>
              {window.platformENV.isPlatform && window.platformENV.isHap ? _l('购买') : _l('创建')}
            </Button>
          </div>
          <ul className="exclusiveCompList">
            {renderList(data.list)}
            {renderList(data.outDateList)}
          </ul>
        </div>
      )}
      {config.upgradeVersionDialog &&
        FEATURE_STATUS &&
        buriedUpgradeVersionDialog(projectId, VersionProductType.exclusiveResource)}
      <EditNameDialog
        visible={editNameParam.visible}
        defauleValue={editNameParam.value}
        onOk={value => {
          let id = editNameParam.id;
          updateData({
            name: value.trim(),
            instanceId: id,
          });
          setEditNameParam({
            visible: false,
            value: undefined,
            id: undefined,
          });
        }}
        onCancel={() => {
          setEditNameParam({
            visible: false,
            value: undefined,
            id: undefined,
          });
        }}
      />
    </Fragment>
  );
}

export default withRouter(ExplanList);
