import React, { Fragment, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import ClipboardButton from 'react-clipboard.js';
import moment from 'moment';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Button, Icon, LoadDiv, Tooltip, UserName } from 'ming-ui';
import projectAjax from 'src/api/project';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import PurchaseExpandPack from 'src/pages/Admin/components/PurchaseExpandPack.jsx';
import { navigateTo } from 'src/router/navigateTo';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import EditNameDialog from '../component/EditNameDialog';
import Status from '../component/Status';
import { COMPUTING_INSTANCE_STATUS } from '../config';
import EXCLUSIVE_BIG from '../images/exclusive_big.png';
import EXCLUSIVE_EXPLAN_IMG from '../images/exclusive_explan.png';
import EXCLUSIVE_EXPLAN_HUI_IMG from '../images/exclusive_explan_hui.png';
import '../index.less';

const MoreOperateMenu = styled.ul`
  background: #fff;
  box-shadow: 0px 4px 16px 1px rgba(0, 0, 0, 0.24);
  border-radius: 3px 3px 3px 3px;
  width: 160px;
  font-size: 13px;
  color: #151515;
  padding: 4px 0;
  li {
    line-height: 36px;
    padding: 0 24px;
    cursor: pointer;
    a {
      color: #151515;
      transition: none !important;
    }
    .renewal {
      color: #151515 !important;
    }
    &:hover {
      background-color: #2196f3;
      color: #fff;
      a {
        color: #fff;
      }
      .renewal {
        color: #fff !important;
      }
    }
  }
`;

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
    color: #151515;
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

  useEffect(() => {
    getData();
  }, [projectId]);

  useEffect(() => {
    if (refresh === -1) return;

    getData();
  }, [refresh]);

  const getData = () => {
    !config.loading &&
      setConfig({
        ...config,
        loading: true,
      });
    projectAjax.getComputingInstances({ projectId }).then(res => {
      setConfig({
        ...config,
        isInit: res && res.length === 0,
        loading: false,
        effectiveCount: res.filter(l =>
          [COMPUTING_INSTANCE_STATUS.Creating, COMPUTING_INSTANCE_STATUS.Running].includes(l.status),
        ).length,
      });
      let list = [];
      let outDateList = [];
      res.forEach(l => {
        if (l.status < 7) list.push(l);
        else outDateList.push(l);
      });
      setData({
        list: list,
        outDateList: outDateList,
      });
    });
  };

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
        <Button radius className="exclusiveCompButton Font14" onClick={goToPurchase}>
          {md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal ? _l('创建专属算力') : _l('购买专属算力')}
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
                text={
                  <div>
                    <div className="Gray_bd">{_l('资源ID')}</div>
                    <div className="mTop9">
                      {item.resourceId}
                      <ClipboardButton
                        className="Hand tip-top"
                        component="span"
                        data-clipboard-text={item.resourceId}
                        onSuccess={() => alert(_l('复制成功'))}
                        data-tip={_l('复制资源ID')}
                      >
                        <span className="icon-content-copy mLeft8 Gray_bd Hover_49 Hand"></span>
                      </ClipboardButton>
                    </div>
                  </div>
                }
              >
                <span className="icon-info_outline Font16 Gray_bd mLeft4"></span>
              </Tooltip>
            </span>
            <Status value={item.status} />
          </div>
          <div
            className="actionsRight Font13 "
            style={{
              color: '#AEAEAE',
            }}
          >
            {item.creator && (
              <Fragment>
                <UserName
                  className="mRight5"
                  style={{
                    color: '#AEAEAE',
                  }}
                  user={{ userName: item.creator.fullname, accountId: item.creator.accountId }}
                />
                <span className="mRight5">{_l('创建于')}</span>
                <span>{item.createDateTime ? createTimeSpan(item.createDateTime) : '_'}</span>
              </Fragment>
            )}
            {[COMPUTING_INSTANCE_STATUS.CreationFailed, COMPUTING_INSTANCE_STATUS.Stopped].includes(item.status) && (
              <span className="repurchaseBtn mLeft24" onClick={() => renewPurchase(item)}>
                {_l('重新创建')}
              </span>
            )}
            {![
              COMPUTING_INSTANCE_STATUS.Creating,
              COMPUTING_INSTANCE_STATUS.CreationFailed,
              COMPUTING_INSTANCE_STATUS.Starting,
              COMPUTING_INSTANCE_STATUS.Stopping,
              COMPUTING_INSTANCE_STATUS.Stopped,
              COMPUTING_INSTANCE_STATUS.Restarting,
            ].includes(item.status) && (
              <Fragment>
                {(![COMPUTING_INSTANCE_STATUS.Destroyed, COMPUTING_INSTANCE_STATUS.DestroyFailed].includes(
                  item.status,
                ) ||
                  item.workflowCount > 0) && (
                  <span
                    className="manageBtn"
                    onClick={() => {
                      navigateTo(`/admin/computing/${projectId}/${item.id}`);
                    }}
                  >
                    {_l('管理')}
                  </span>
                )}
                {![COMPUTING_INSTANCE_STATUS.Destroying, COMPUTING_INSTANCE_STATUS.DestroyFailed].includes(
                  item.status,
                ) && (
                  <Trigger
                    popupVisible={operateMenuVisible === item.id}
                    onPopupVisibleChange={visible => setOperateMenuVisible(visible ? item.id : -1)}
                    action={['click']}
                    popup={
                      <MoreOperateMenu>
                        {[COMPUTING_INSTANCE_STATUS.Creating, COMPUTING_INSTANCE_STATUS.Running].includes(
                          item.status,
                        ) && (
                          <Fragment>
                            <li
                              onClick={() => {
                                setEditNameParam({
                                  visible: true,
                                  value: item.name,
                                  id: item.id,
                                });
                                setOperateMenuVisible(-1);
                              }}
                            >
                              {_l('修改名称')}
                            </li>
                            {item.canRenew && (
                              <li>
                                <PurchaseExpandPack
                                  className="Block renewal"
                                  text={_l('续费')}
                                  type="renewcomputing"
                                  routePath="expansionserviceComputing"
                                  projectId={projectId}
                                  extraParam={item.id}
                                />
                              </li>
                            )}
                          </Fragment>
                        )}

                        {[COMPUTING_INSTANCE_STATUS.Destroyed].includes(item.status) && (
                          <li
                            onClick={() => {
                              updateData({
                                instanceId: item.id,
                                isDelete: true,
                              });
                              setOperateMenuVisible(-1);
                            }}
                          >
                            {_l('删除')}
                          </li>
                        )}
                      </MoreOperateMenu>
                    }
                    popupAlign={{ points: ['tr', 'bc'], offset: [15, 0] }}
                  >
                    <Icon icon="moreop" className="Gray_bd Font20 mLeft24 Hover_49 Hand" />
                  </Trigger>
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
                  <span className={item.remainingDays < 1 ? 'Gray_75 mRight5' : 'Gray mRight5'}>
                    {moment(item.expirationDatetime).format(_l('YYYY-MM-DD'))}
                    {_l('到期')}
                  </span>
                  {item.remainingDays < 1 ? (
                    <span style={{ color: '#F51744' }}>{_l('已过期')}</span>
                  ) : (
                    <Fragment>
                      {_l('剩余')} <span style={{ color: '#33B153' }}>{item.remainingDays}</span> {_l('天')}
                    </Fragment>
                  )}
                </Fragment>
              ) : (
                '_'
              )}
            </p>
          </div>
          <div className="explanCardContentItem">
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
            <span className="createComputingButton Hand" onClick={goToPurchase}>
              <Icon icon="add" className="mRight3" />
              {_l('创建')}
            </span>
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
