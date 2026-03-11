import React, { useEffect, useRef } from 'react';
import DocumentTitle from 'react-document-title';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv, ScrollView, UserHead } from 'ming-ui';
import flowNodeAjax from 'src/pages/workflow/api/flowNode';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import processAjax from 'src/pages/workflow/api/process';
import { checkPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import ConnectAvator from '../../components/ConnectAvator';
import ConnectDesDia from '../../components/connectDesDialog';
import ConnectOptionMenu from '../../components/ConnectOptionMenu';
import { ActWrap } from '../style';
import Info from './content';
import { ConnetWrap, UpgradeContentWrap } from './style';
import { getNodeList } from './util';

const TABLIST = [
  { tab: 0, txt: _l('连接设置') },
  { tab: 3, txt: _l('账户') },
  { tab: 1, txt: _l('API 管理') },
  { tab: 2, txt: _l('授权到应用') },
];

//连接 详情层
function ConnectCon(props) {
  const [
    {
      connectData,
      nodeInfo,
      loading,
      showEdit,
      tab,
      isFix,
      apiCount,
      apiList,
      isConnectOwner,
      introduce,
      controls,
      tabList,
      hasGetControl,
      hasGetIntroduce,
      hasManageAuth,
      currentProjectId,
      isUpgrade,
    },
    setState,
  ] = useSetState({
    connectData: {},
    showEdit: false,
    tab: 0,
    isFix: false,
    nodeInfo: {},
    apiCount: 0,
    apiList: [],
    loading: true,
    isChange: false,
    isConnectOwner: false,
    introduce: '',
    controls: [],
    tabList: TABLIST,
    hasGetControl: false,
    hasGetIntroduce: false,
    hasManageAuth: props.hasManageAuth,
    currentProjectId: props.currentProjectId || localStorage.getItem('currentProjectId'),
    isUpgrade: false,
  });

  const cache = useRef({ isFix: false });
  const headerRef = useRef();
  const WrapRef = useRef();
  const [{ authType, actionId }, setDefaultFlowNode] = useSetState({
    authType: _.get(props, 'data.authType'),
    actionId: _.get(props, 'data.actionId'),
  });
  useEffect(() => {
    const { match = {} } = props;
    const { params = {} } = match;
    let propsId = params.id || _.get(props, ['data', 'id']);
    if (propsId) {
      getInfoData(propsId);
    } else {
      setState({
        loading: false,
        hasGetControl: true,
        hasGetIntroduce: true,
      });
    }
  }, []);

  useEffect(() => {
    setState({ isConnectOwner: hasManageAuth || connectData.isOwner });
  }, [hasManageAuth, connectData]);

  useEffect(() => {
    hasGetControl && hasGetIntroduce && initTabLIst();
  }, [hasGetControl, hasGetIntroduce]);

  const getInfoData = propsId => {
    getInfo(propsId);
    getDetailInfo(propsId);
  };

  const getParam = data => {
    const info = data || nodeInfo;
    let node = info.flowNodeMap && info.startEventId ? info.flowNodeMap[info.startEventId] : null;
    if (!info.id) {
      return;
    }
    flowNodeAjax
      .getNodeDetail({ processId: info.id, nodeId: node.id, flowNodeType: node.typeId }, { isIntegration: true })
      .then(res => {
        setState({
          controls: res.controls || [],
          hasGetControl: true,
        });
      });
  };

  const initTabLIst = () => {
    //若连接参数及使用说明内容都为空，则隐藏连接设置模块
    if (connectData.type === 2 && controls.length <= 0 && !introduce) {
      setState({
        tab: 1,
        tabList: TABLIST.filter(o => o.tab !== 0),
        loading: false,
      });
    } else {
      setState({
        loading: false,
      });
    }
  };

  // 获取基本详情
  const getDetailInfo = id => {
    packageVersionAjax.getDetail({ isPublic: true, id: id }, { isIntegration: true }).then(
      res => {
        const { apks = [], companyId, upgrading = false } = res;
        const hasManageAuth = checkPermission(companyId, PERMISSION_ENUM.MANAGE_API_CONNECTS);
        let newData = {
          ...connectData,
          ...res,
          apks,
        };
        const canEdit = hasManageAuth || newData.isOwner;
        const list =
          !canEdit && newData.hasAuth
            ? TABLIST.filter(o => (!newData.introduce ? [1, 3].includes(o.tab) : o.tab !== 2))
            : TABLIST;
        setState({
          hasManageAuth,
          tabList: list,
          isUpgrade: upgrading,
          tab: list.map(o => o.tab).includes(tab) ? tab : !canEdit && newData.hasAuth && !newData.introduce ? 3 : 0,
        });
        if (canEdit || newData.hasAuth) {
          setState({
            connectData: newData,
            isConnectOwner: canEdit,
            introduce: res.introduce,
            hasGetIntroduce: true,
          });
        } else {
          setTimeout(() => {
            location.href = '/integration/connectList';
          }, 500);
          alert(_l('你暂时没有权限查看该连接！'), 3);
        }
      },
      () => {
        setTimeout(() => {
          location.href = '/integration/connectList';
        }, 500);
        alert(_l('你暂时没有权限查看该连接！'), 3);
      },
    );
  };

  // 获取连接详情
  const getInfo = processId => {
    if (!processId) {
      return;
    }
    flowNodeAjax.get({ processId }, { isIntegration: true }).then(res => {
      const flowDts = getNodeList(res).filter(o => o.typeId === 22);
      if (flowDts.length > 1) {
        setDefaultFlowNode({ authType: 32, actionId: '523' });
      }
      setState({
        nodeInfo: res,
        // loading: false,
        currentProjectId: res.companyId,
      });
      getParam(res);
      getApiListFetch({ relationId: res.id });
    });
  };
  const getApiListFetch = obj => {
    if (!obj.relationId) {
      return;
    }
    packageVersionAjax
      .getApiList(
        {
          companyId: currentProjectId,
          pageIndex: 1,
          pageSize: 100000, //PageSize,
          keyword: '',
          // relationId: res.id
          ...obj,
        },
        { isIntegration: true },
      )
      .then(res => {
        setState({ apiCount: res.length, apiList: res });
      });
  };
  // 更新基本信息
  const updateInfo = info => {
    processAjax
      .updateProcess(
        {
          companyId: currentProjectId,
          processId: connectData.id,
          name: info.name,
          explain: info.explain,
          iconName: (info.iconName || '').split('?e=')[0],
        },
        { isIntegration: true },
      )
      .then(res => {
        //新建的会丢ownerAccount
        let newData = {
          ...connectData,
          ...res,
          hasAuth: connectData.hasAuth,
          ownerAccount: !_.get(res, 'ownerAccount.accountId') ? connectData.ownerAccount : res.ownerAccount,
          isOwner: connectData.isOwner,
          iconName: info.iconName,
          isChange: true,
        };
        setState({
          connectData: newData,
          isConnectOwner: hasManageAuth || newData.isOwner,
        });
      });
  };

  if (loading) {
    return <LoadDiv />;
  }

  return (
    <React.Fragment>
      <DocumentTitle title={`${_l('集成')}-${connectData?.name || _l('未命名连接')}`} />
      <ScrollView
        onScroll={() => {
          if (!WrapRef.current) return;
          let toFix = $(WrapRef.current).offset().top <= 50;
          if (toFix !== cache.current.isFix) {
            setState({
              isFix: toFix,
            });
            cache.current.isFix = toFix;
          }
        }}
      >
        <ConnetWrap>
          <div className={cx('head', { isFix })} ref={headerRef}>
            <div className="flexRow leftCon">
              <ActWrap
                className="act InlineBlock TxtMiddle TxtCenter mLeft0 mRight32 Hand LineHeight36"
                onClick={() => (location.href = '/integration/connectList')}
              >
                <Icon icon="backspace" className="Font16" />
              </ActWrap>
              <div className="Hand connectDes flexRow flex" onClick={() => {}}>
                <ConnectAvator {...connectData} width={isFix ? 32 : 64} size={isFix ? 22 : 50} />
                <div className={cx('connectTop mLeft16', { mTop8: !isFix, 'mTop2 flex overflowHidden': isFix })}>
                  <p className={cx('name Font20', { 'flexRow flex alignItemsCenter': isFix, Block: !isFix })}>
                    <span className={cx({ 'flex WordBreak overflow_ellipsis': isFix })}>
                      {connectData.name || _l('未命名连接')}
                    </span>
                    {connectData.type === 2 &&
                      // 安装的API 有文档链接icon
                      !!_.get(connectData, 'info.docUrl') && (
                        <span
                          className="ThemeColor3 Hand mLeft5"
                          onClick={() => {
                            const docUrl = _.get(connectData, 'info.docUrl');
                            !!docUrl && window.open(docUrl);
                          }}
                        >
                          <span className="Font14">{_l('官网地址')}</span>
                          <Icon className="Hand docUrl Font14 InlineBlock ThemeColor3 mLeft5" icon="task-new-detail" />
                        </span>
                      )}
                    {!!nodeInfo.startEventId &&
                      (connectData.type === 1 || connectData.type === 2) && //自定义的连接或者安装的 安装的连接 不可修改连接LOGO
                      isConnectOwner && (
                        <Icon
                          icon="edit"
                          className="textTertiary mLeft8"
                          onClick={() => {
                            setState({ showEdit: true });
                          }}
                        />
                      )}
                  </p>
                  <p className="des textTertiary pRight8">{connectData.explain || _l('添加连接说明')}</p>
                </div>
              </div>
              {showEdit && (
                <div className="connectDesDia">
                  <ConnectDesDia
                    onOk={connectData => {
                      setState({ showEdit: false, isChange: true });
                      updateInfo(connectData);
                    }}
                    data={connectData}
                    onClickAway={() => {
                      setState({ showEdit: false });
                    }}
                    onClickAwayExceptions={['.ant-modal-mask', '.ant-modal-wrap', '.mui-dialog-scroll-container']}
                  />
                </div>
              )}
              {(connectData.ownerAccount || (connectData.info || {}).createdBy) && !isUpgrade && (
                <div className="textSecondary node TxtMiddle mLeft10 flexRow infoDes alignItemsCenter">
                  {connectData.type === 2 ? (
                    <React.Fragment>
                      <span
                        className="textPrimary mRight8 maxWidth100 overflow_ellipsis flexRow alignItemsCenter"
                        title={_.get(connectData, 'ownerAccount.fullName')}
                      >
                        <UserHead
                          user={{
                            userHead: connectData?.ownerAccount?.avatar,
                            accountId: connectData?.ownerAccount?.accountId,
                          }}
                          size={24}
                          className="mRight8"
                        />
                        {_.get(connectData, 'ownerAccount.fullName')}
                      </span>
                      <span className="" style={{ color: 'var(--color-text-tertiary)' }}>
                        {_l('安装于')}
                        {connectData.createdDate}
                      </span>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <div className="flexRow alignItemsCenter">
                        <UserHead
                          user={{
                            userHead: connectData?.ownerAccount?.avatar,
                            accountId: connectData?.ownerAccount?.accountId,
                          }}
                          size={24}
                          className="mRight8"
                          newPageChat={true}
                        />
                        <span
                          className="textSecondary mRight8 maxWidth100 overflow_ellipsis"
                          title={_.get(connectData, 'ownerAccount.fullName')}
                        >
                          {_.get(connectData, 'ownerAccount.fullName')}
                        </span>
                      </div>
                      <span className="" style={{ color: 'var(--color-text-tertiary)' }}>
                        {!connectData.lastModifiedDate ? _l('创建于') : _l('更新于')}
                        {connectData.lastModifiedDate ? connectData.lastModifiedDate : connectData.createdDate}
                      </span>
                    </React.Fragment>
                  )}
                  {isConnectOwner && (
                    <ConnectOptionMenu
                      connectData={connectData}
                      currentProjectId={currentProjectId}
                      hasManageAuth={hasManageAuth}
                      onUpgradeSuccess={() => setState({ isUpgrade: true })}
                      onDeleteSuccess={() => {
                        setTimeout(() => {
                          location.href = '/integration/connectList';
                        }, 1000);
                      }}
                      popupAlign={{
                        points: ['tl', 'bl'],
                        overflow: { adjustX: true, adjustY: true },
                      }}
                      onCopySuccess={() => {
                        location.href = '/integration/connectList';
                      }}
                      trigger={
                        <ActWrap className="act InlineBlock TxtMiddle TxtCenter">
                          <i className="icon-moreop Font22 TxtMiddle" />
                        </ActWrap>
                      }
                    />
                  )}
                </div>
              )}
            </div>
            {isUpgrade ? (
              <div className="pBottom40"></div>
            ) : (
              <div className="tabCon">
                {
                  <ul>
                    {tabList.map(o => {
                      if (actionId !== '523' && o.tab === 3) {
                        //OAuth 2.0 认证（授权码）=>有账户
                        return null;
                      }
                      return (
                        <li
                          className={cx('Hand', { isCur: tab === o.tab, disble: !nodeInfo.startEventId })}
                          onClick={() => {
                            if (!nodeInfo.startEventId) {
                              return;
                            }
                            setState({ tab: o.tab });
                          }}
                        >
                          {o.txt}
                          {[1, 2].includes(o.tab) && `( ${o.tab === 1 ? apiCount : (connectData.apks || []).length} )`}
                        </li>
                      );
                    })}
                  </ul>
                }
              </div>
            )}
          </div>
          {isUpgrade ? (
            <UpgradeContentWrap>
              <div className="unusualContent">
                <div className="imgWrap mBottom14">
                  <i className="icon-unarchive Font56" style={{ color: 'var(--color-success)' }} />
                </div>
                <div className="Font17 bold">{_l('连接正在升级中...')}</div>
              </div>
            </UpgradeContentWrap>
          ) : (
            <div className={cx('listCon')} style={{ 'padding-top': isFix ? 124 : 0 }}>
              <div className="scrollDiv" ref={WrapRef}></div>
              {
                <Info
                  connectData={connectData}
                  nodeInfo={nodeInfo}
                  loading={loading}
                  tab={tab}
                  apiList={apiList}
                  isConnectOwner={isConnectOwner}
                  introduce={introduce}
                  controls={controls}
                  hasManageAuth={hasManageAuth}
                  currentProjectId={currentProjectId}
                  actionId={actionId}
                  authType={authType}
                  onChangeSate={info => setState(info)}
                  getInfo={getInfo}
                  setDefaultFlowNode={setDefaultFlowNode}
                  getDetailInfo={getDetailInfo}
                />
              }
            </div>
          )}
        </ConnetWrap>
      </ScrollView>
    </React.Fragment>
  );
}

export default ConnectCon;
