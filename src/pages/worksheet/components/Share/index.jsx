import React, { Fragment, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _, { includes } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Button, Input, Modal, Radio, Switch, Tooltip } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import { Bold600, Hr, Tip99 } from 'worksheet/components/Basics';
import ShareUrl from 'worksheet/components/ShareUrl';
import { checkCertification } from 'src/components/checkCertification';
import { CHAT_CARD_TYPE } from 'src/components/shareAttachment/enum';
import { getCurrentProjectId } from 'src/pages/globalSearch/utils';
import { pathCompletion } from 'src/utils/platform/navigation/path';
// 未开启分享时的空态圆形图标（设计稿：直径 130、图标 60、底 #f5f5f5 / 图标 #9e9e9e）
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { getPublicShare, getUrl, SHARE_SCOPE, updatePublicShareStatus } from './controller';
import Validity from './Validity';

const LinkCircle = styled.div`
  width: 130px;
  height: 130px;
  margin: 0 auto 30px;
  border-radius: 50%;
  background: var(--color-background-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  .icon {
    font-size: 60px;
    color: var(--color-text-tertiary);
  }
`;

// 可见范围选项：每项一行，主文案下带一行说明
const ScopeGroup = styled(Radio.Group)`
  display: block;
  .hap-radio-wrapper {
    display: flex;
    align-items: flex-start;
  }
  .hap-radio-wrapper + .hap-radio-wrapper {
    margin-top: 14px;
  }
  .hap-radio {
    margin-top: -20px;
  }
  .scopeTitle {
    font-weight: 600;
  }
  .scopeDesc {
    color: var(--color-text-tertiary);
    font-size: 13px;
  }
`;

// 对话机器人（chatbot）与 Mingo 会话（mingoHistory）分享出去的是一条会话链接，
// 没有可归属的工作表/应用实体，按纯链接卡片发送，消息端呈现为链接形态
const LINK_CARD_FROMS = ['chatbot', 'mingoHistory'];

function genCard(from, type = 'public', params = {}) {
  if (from === 'recordInfo' && type === 'private') {
    return {
      entityId: params.worksheetId,
      cardType: CHAT_CARD_TYPE.WORKSHEETROW,
      title: params.title,
      extra: {
        rowId: params.rowId,
        viewId: params.viewId,
        appId: params.appId,
      },
    };
  }

  return {
    cardType: includes(LINK_CARD_FROMS, from) ? CHAT_CARD_TYPE.LINK : CHAT_CARD_TYPE.WORKSHEET,
    title: params.title,
    extra: {
      from: from === 'aiAction' ? 'chatbot' : from,
      worksheetId: params.worksheetId,
      appId: params.appId,
    },
  };
}

export default function Share(props) {
  const {
    from,
    title,
    isCharge,
    params = {},
    onUpdate = () => {},
    onClose,
    getCopyContent,
    canEditForm,
    hidePublicShare,
    privateShare,
    isPayShare,
    hidePublicTitle,
    publicShareDesc,
    getShareLinkTxt,
    width,
    // 支持可见范围（本网络内 / 公开）：开启后展示范围选择，并把 scope + projectId 一起提交
    supportProjectScope,
    // 打开弹窗时若尚未分享是否自动开启；不传时沿用各来源既有行为
    autoEnable,
  } = props;
  const isFromWorksheetApi = from === 'worksheetApi';
  const [url, setUrl] = useState();
  const [urlVisible, setUrlVisible] = useState(false);
  const [isPublic, setIsPublic] = useState(props.isPublic);
  const [publicUrl, setPublicUrl] = useState(isPublic && props.publicUrl);
  const [shareData, setShareData] = useState({});
  // 分享实体的锚点：来源 id 由业务侧生成时（params.createShareSource），它与 params.sourceId 未必相同。
  // 开启 / 切换范围时把实际用的记下来，关闭与改标题、有效期、密码时复用，不再重建来源
  const [shareSourceId, setShareSourceId] = useState(params.sourceId);
  // 可见范围：开启时默认「本网络内」；已开启的分享按回显的 scope 走
  const [scope, setScope] = useState(SHARE_SCOPE.PROJECT);
  // 分享状态回显完成前的占位：带范围选择的分享默认关闭，先渲染会闪一下「暂未开启分享」再跳到已开启
  const [initializing, setInitializing] = useState(
    () => !!supportProjectScope && !props.publicUrl && !hidePublicShare && !includes(['recordInfo', 'view'], from),
  );
  // 当前分享是否「仅本网络内可见」：这类分享靠登录 + 成员身份控权，不提供对外治理项
  const isProjectShare = !!supportProjectScope && scope === SHARE_SCOPE.PROJECT;
  const privateVisible =
    from === 'report'
      ? params.privateVisible
      : ['view', 'recordInfo', 'newRecord', 'chatbot', 'aiAction', 'mingoHelp', 'mingoHistory'].includes(from)
        ? privateShare
        : !_.includes(['worksheetApi', 'pay'], from);
  const isEmbed = _.includes(['customPage'], from);
  // 自定义分享（Mingo 会话等）把业务侧标题一并提交为分享页标题。开启分享有三个入口
  // （自动开启 / 手动开关 / 切换可见范围），任一处漏传都会让分享页标题落空，统一走这个值
  const customShareTitle = props.isCustomShare ? params.title : undefined;
  const privateTitle = isEmbed ? _l('嵌入链接') : _l('应用成员');
  let disabledTip;

  if (!isCharge) {
    if (from === 'recordInfo') {
      disabledTip = _l('记录拥有者才能操作');
    } else if (['chatbot', 'aiAction', 'mingoHelp', 'mingoHistory'].includes(from)) {
      disabledTip = _l('会话拥有者才能操作');
    } else {
      disabledTip = _l('系统角色（包含管理员、运营者、开发者）才能操作');
    }
  }

  const handleChangePageTitle = () => {
    if (_.includes(['view'], from)) {
      getPublicShareInfo({
        isEdit: true,
        ...shareData,
      });
    }

    if (_.includes(['customPage', 'chatbot', 'aiAction', 'mingoHelp', 'mingoHistory'], from)) {
      editEntityShare(shareData);
    }
  };

  async function updatePublicShare(active, defaultTitle, nextScope) {
    const targetScope = _.isUndefined(nextScope) ? scope : nextScope;
    const result = await updatePublicShareStatus({
      from,
      isPublic: active,
      pageTitle: defaultTitle || _.get(shareData, 'pageTitle'),
      ...params,
      // 关闭时按当前分享的锚点撤销，而不是 params.sourceId
      ...(!active && shareSourceId ? { sourceId: shareSourceId } : {}),
      ...(supportProjectScope ? { scope: targetScope, projectId: params.projectId || getCurrentProjectId() } : {}),
      onUpdate,
    });

    if (result && result.shareSourceId) {
      setShareSourceId(result.shareSourceId);
    }

    setIsPublic(active);
    setShareData(result.appEntityShare ? result.appEntityShare : result);
    setPublicUrl(result ? `${result.shareLink}${isPayShare ? '?payshare=true' : ''}` : null);
    // 带范围选择的分享开启即出链接，不再多一步「获取分享链接」
    setUrlVisible(!!supportProjectScope && active);
  }

  async function getPublicShareInfo(data) {
    let result;

    try {
      result = await getPublicShare({
        from,
        isPublic,
        ...params,
        ...data,
      });
    } finally {
      setInitializing(false);
    }

    setShareData(result);
    const active = result && !!result.shareLink;
    setIsPublic(active);
    setPublicUrl(result ? `${result.shareLink}${isPayShare ? '?payshare=true' : ''}` : null);
    // autoEnable 未显式给出时沿用既有行为：这几类来源打开弹窗即开启分享
    const shouldAutoEnable = _.isUndefined(autoEnable)
      ? ['chatbot', 'aiAction', 'mingoHelp', 'mingoHistory'].includes(from)
      : autoEnable;

    if (!active && shouldAutoEnable) {
      updatePublicShare(true, customShareTitle);
    }

    if (supportProjectScope && active) {
      // scope 字段缺失（老分享数据）按公开处理，避免把已公开的链接显示成本网络内
      setScope(_.get(result, 'scope') === SHARE_SCOPE.PROJECT ? SHARE_SCOPE.PROJECT : SHARE_SCOPE.PUBLIC);
      setUrlVisible(true);
    }
  }

  async function editEntityShare(data) {
    const result = await updatePublicShareStatus({
      from,
      isPublic: true,
      ...params,
      ...shareData,
      ...data,
      // 改的只是已开启分享的标题 / 有效期 / 密码，锚点不变：沿用当前 sourceId，
      // 不重新走 createShareSource，否则每改一次都换一条分享实体（链接跟着变，配置也落到新实体上）
      sourceId: shareSourceId || params.sourceId,
      reuseShareSource: true,
      ...(supportProjectScope ? { scope, projectId: params.projectId || getCurrentProjectId() } : {}),
    });
    setShareData(result.appEntityShare);
  }

  // 切换可见范围：按新范围重新提交一次（来源 id 由业务侧生成时会随之重建）
  async function handleChangeScope(nextScope) {
    const prevScope = scope;

    setScope(nextScope);

    try {
      await updatePublicShare(true, customShareTitle, nextScope);
    } catch (err) {
      console.error('[share] change share scope failed', err);
      setScope(prevScope);
      alertIfNotUnauthorized(err, _l('操作失败'), 2);
    }
  }

  // 初始化只跑一次：弹窗打开后来源与参数不再变化（关闭重开会重新挂载）。
  // 每次渲染把最新入参 / 回调写进 ref，初始化 effect 只读 ref —— 既不必把每次渲染都新建的 params
  // 塞进依赖数组（会重复请求），也不留下 exhaustive-deps 隐患。
  const latestRef = useRef(null);

  useEffect(() => {
    latestRef.current = { from, params, privateVisible, hidePublicShare, publicUrl, getPublicShareInfo };
  });

  useEffect(() => {
    const latest = latestRef.current;

    if (latest.privateVisible) {
      getUrl({ from: latest.from, ...latest.params }).then(setUrl);
    }

    if (!latest.publicUrl && !latest.hidePublicShare && !includes(['recordInfo', 'view'], latest.from)) {
      latest.getPublicShareInfo();
    }
  }, []);

  const modalTitleText = title || _l('分享');

  return (
    <Modal
      open
      width={width || 720}
      footer={null}
      title={modalTitleText}
      onCancel={onClose}
      styles={{ header: { marginBottom: 12 } }}
    >
      {privateVisible && (
        <React.Fragment>
          <Bold600 className="Font15">{privateTitle}</Bold600>
          <Tip99 className="mTop10">{_l('仅限应用内成员登录系统后根据权限访问')}</Tip99>
          <ShareUrl
            chatCard={genCard(from, 'private', params)}
            theme="light"
            copyShowText
            className="mTop13"
            url={url}
            qrVisible={!isEmbed}
            allowSendToChat={!isEmbed}
            inputBtns={[
              {
                tip: _l('新窗口打开'),
                icon: 'task-new-detail',
                onClick: () => window.open(url),
              },
            ]}
            {...(_.isFunction(getCopyContent)
              ? {
                  getCopyContent: urlForCopy => getCopyContent('private', urlForCopy + '?'),
                }
              : {})}
          />

          <Hr style={{ margin: '25px 0 22px' }} />
        </React.Fragment>
      )}
      {!hidePublicShare && initializing && (
        <div className="TxtCenter mTop40 mBottom40">
          <LoadDiv />
        </div>
      )}
      {!hidePublicShare && !initializing && (
        <React.Fragment>
          {isFromWorksheetApi ? (
            <Tip99 className="">{_l('启用后，将 API 文档公开发布给应用外的用户查看使用')}</Tip99>
          ) : (
            <div className="flexRow alignItemsCenter">
              <div className="flex">
                {!hidePublicTitle && (
                  <Bold600 className="Font15">{supportProjectScope ? _l('分享') : _l('公开')}</Bold600>
                )}
                <Tip99 className={cx({ mTop10: !isPayShare, textSecondary: isPayShare })}>
                  {publicShareDesc ||
                    (supportProjectScope
                      ? _l('开启后，可选择分享范围并生成分享链接')
                      : _l('获得链接的所有人都可以查看'))}
                </Tip99>
              </div>
              {!isPayShare && (
                <Tooltip title={disabledTip} placement="right">
                  <span>
                    <Switch
                      disabled={['chatbot', 'aiAction', 'mingoHelp', 'mingoHistory'].includes(from) ? false : !isCharge}
                      checked={isPublic}
                      onClick={(checked, event) => {
                        event.stopPropagation();
                        return updatePublicShare(!isPublic, customShareTitle);
                      }}
                    />
                  </span>
                </Tooltip>
              )}
            </div>
          )}
          {supportProjectScope && !isPublic && (
            <Fragment>
              <Hr style={{ margin: '22px 0 0' }} />
              <div className="TxtCenter mTop45 mBottom40">
                <LinkCircle>
                  <Icon icon="link" />
                </LinkCircle>
                <div className="Font17 textPrimary">{_l('暂未开启分享')}</div>
                <Tip99 className="mTop10">{_l('开启分享后，可选择访问范围并生成分享链接')}</Tip99>
              </div>
            </Fragment>
          )}
          {supportProjectScope && isPublic && (
            <Fragment>
              <Hr style={{ margin: '20px 0 22px' }} />
              <Bold600 className="Font15 mBottom16">{_l('分享范围')}</Bold600>
              <ScopeGroup value={scope} onChange={event => handleChangeScope(event.target.value)}>
                <Radio value={SHARE_SCOPE.PROJECT}>
                  <div>
                    <div className="scopeTitle">{_l('组织内成员')}</div>
                    <div className="scopeDesc">{_l('组织内成员登录后通过链接访问')}</div>
                  </div>
                </Radio>
                <Radio value={SHARE_SCOPE.PUBLIC}>
                  <div>
                    <div className="scopeTitle">{_l('公开')}</div>
                    <div className="scopeDesc">{_l('获得链接的所有人都可以查看')}</div>
                  </div>
                </Radio>
              </ScopeGroup>
              <Bold600 className="Font15 mTop24">{isProjectShare ? _l('组织内分享链接') : _l('公开分享链接')}</Bold600>
            </Fragment>
          )}
          {supportProjectScope || (isPayShare && !!publicUrl && urlVisible) ? (
            ''
          ) : (
            <div
              className={cx('flexRow flexCenter', {
                mTop24: isPayShare,
                mTop15: !urlVisible || isFromWorksheetApi,
              })}
            >
              {isFromWorksheetApi && (
                <Fragment>
                  <Switch
                    disabled={!isCharge}
                    checked={isPublic}
                    onClick={(checked, event) => {
                      event.stopPropagation();
                      return updatePublicShare(!isPublic);
                    }}
                  />
                </Fragment>
              )}
              <div className="flex"></div>
              {isPublic && !urlVisible && (
                <Fragment>
                  {isPayShare && (
                    <Button color="primary" variant="link" className="mRight10 Right" onClick={onClose}>
                      {_l('取消')}
                    </Button>
                  )}
                  <Button
                    type="primary"
                    className="Right"
                    onClick={() =>
                      checkCertification({
                        projectId: getCurrentProjectId(),
                        authType: 2,
                        checkSuccess: async () => {
                          if (includes(['recordInfo', 'view'], from)) {
                            await getPublicShareInfo();
                          }

                          setUrlVisible(true);
                        },
                      })
                    }
                  >
                    {getShareLinkTxt || _l('获取分享链接')}
                  </Button>
                </Fragment>
              )}
            </div>
          )}
          {!!publicUrl && urlVisible && (
            <Fragment>
              <ShareUrl
                chatCard={genCard(from, 'public', params)}
                className={supportProjectScope ? 'mTop13' : 'mTop20'}
                theme="light"
                copyShowText
                allowSendToChat={from !== 'worksheetApi'}
                qrVisible={from !== 'worksheetApi'}
                inputBtns={[
                  {
                    tip: _l('新窗口打开'),
                    icon: 'task-new-detail',
                    onClick: () => window.open(publicUrl),
                  },
                ]}
                url={publicUrl}
                {...(_.isFunction(getCopyContent)
                  ? {
                      getCopyContent: urlForCopy => getCopyContent('public', urlForCopy + '?'),
                    }
                  : {})}
              />

              {from === 'newRecord' && canEditForm && (
                <a
                  href={pathCompletion(`/worksheet/form/edit/${params.worksheetId}?#detail`)}
                  target="_blank"
                  className="mTop13 InlineBlock"
                >
                  {_l('编辑公开表单')}
                </a>
              )}
              {/* 本网络内可见的分享靠登录 + 成员身份控权，不提供标题 / 有效期 / 密码这套对外治理项 */}
              {_.includes(['view', 'customPage', 'chatbot', 'aiAction', 'mingoHelp', 'mingoHistory'], from) &&
                !isProjectShare && (
                  <div className="flex flexRow alignItemsCenter mTop16 validityDateConfig">
                    <div className="labelName mRight8">{_l('标题')}</div>
                    <Input
                      placeholder={params.title}
                      value={shareData.pageTitle}
                      className="flex"
                      onChange={event => {
                        const { value } = event.target;
                        setShareData({
                          ...shareData,
                          pageTitle: value.slice(0, 200),
                        });
                      }}
                      onBlur={handleChangePageTitle}
                      onKeyDown={event => {
                        event.which === 13 && handleChangePageTitle();
                      }}
                    />
                  </div>
                )}
              {_.includes(
                [
                  'view',
                  'recordInfo',
                  'customPage',
                  'worksheetApi',
                  'chatbot',
                  'aiAction',
                  'mingoHelp',
                  'mingoHistory',
                ],

                from,
              ) &&
                !isProjectShare && (
                  <Validity
                    data={shareData}
                    onChange={data => {
                      setShareData({
                        ...shareData,
                        ...data,
                      });
                      if (_.includes(['view', 'recordInfo'], from)) {
                        getPublicShareInfo({
                          isEdit: true,
                          ...shareData,
                          ...data,
                        });
                      }

                      if (
                        _.includes(
                          ['customPage', 'worksheetApi', 'chatbot', 'aiAction', 'mingoHelp', 'mingoHistory'],
                          from,
                        )
                      ) {
                        editEntityShare(data);
                      }
                    }}
                  />
                )}
            </Fragment>
          )}
        </React.Fragment>
      )}
    </Modal>
  );
}

Share.propTypes = {
  from: PropTypes.string,
  title: PropTypes.string,
  params: PropTypes.shape({}),
  card: PropTypes.shape({}),
  isCharge: PropTypes.bool,
  publicUrl: PropTypes.string,
  isPublic: PropTypes.number,
  // 支持可见范围（本网络内 / 公开）：开启后展示范围选择，开启即出链接，且本网络内范围不展示标题/有效期/密码
  supportProjectScope: PropTypes.bool,
  // 打开弹窗时若尚未分享是否自动开启；不传时沿用各来源既有行为
  autoEnable: PropTypes.bool,
  onUpdate: PropTypes.func,
  onClose: PropTypes.func,
};

export function useShareDialog() {
  return useFunctionWrapComponent(Share);
}
