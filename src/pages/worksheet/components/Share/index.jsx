import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';
import { Button, Modal, Switch } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { Tip99, Hr, Bold600 } from 'worksheet/components/Basics';
import ShareUrl from 'worksheet/components/ShareUrl';
import Validity from './Validity';
import { getUrl, getPublicShare, updatePublicShareStatus } from './controller';
import _, { includes } from 'lodash';

function genCard(from, type = 'public', params = {}) {
  if (from === 'recordInfo' && type === 'private') {
    return {
      entityId: params.worksheetId,
      cardType: 8,
      title: params.title,
      extra: {
        rowId: params.rowId,
        viewId: params.viewId,
        appId: params.appId,
      },
    };
  }
  return {
    cardType: 7,
    title: params.title,
    extra: {
      from,
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
    card,
    params = {},
    onUpdate = () => {},
    onClose,
    getCopyContent,
    canEditForm,
    hidePublicShare,
    privateShare,
  } = props;
  const [url, setUrl] = useState();
  const [urlVisible, setUrlVisible] = useState(false);
  const [isPublic, setIsPublic] = useState(props.isPublic);
  const [publicUrl, setPublicUrl] = useState(isPublic && props.publicUrl);
  const [shareData, setShareData] = useState({});
  const privateVisible =
    from === 'report'
      ? params.privateVisible
      : ['view', 'recordInfo', 'newRecord'].includes(from)
      ? privateShare
      : !_.includes(['worksheetApi'], from);
  const isEmbed = _.includes(['view', 'customPage'], from);
  const privateTitle = isEmbed ? _l('嵌入链接') : _l('内部成员访问');
  let disabledTip;
  if (!isCharge) {
    disabledTip =
      from === 'recordInfo' ? _l('记录拥有者才能操作') : _l('系统角色（包含管理员、运营者、开发者）才能操作');
  }
  const handleChangePageTitle = () => {
    if (_.includes(['view'], from)) {
      getPublicShareInfo({
        isEdit: true,
        ...shareData,
      });
    }
    if (_.includes(['customPage'], from)) {
      editEntityShare(shareData);
    }
  }
  async function updatePublicShare(active) {
    const result = await updatePublicShareStatus({
      from,
      isPublic: active,
      pageTitle: _.get(shareData, 'pageTitle'),
      ...params,
      onUpdate,
    });
    setIsPublic(active);
    setShareData(result.appEntityShare ? result.appEntityShare : result);
    setPublicUrl(result ? result.shareLink : null);
    setUrlVisible(false);
  }
  async function getPublicShareInfo(data) {
    const result = await getPublicShare({
      from,
      isPublic,
      ...params,
      ...data,
    });
    setShareData(result);
    setIsPublic(result && !!result.shareLink);
    setPublicUrl(result ? result.shareLink : null);
  }
  async function editEntityShare(data) {
    const result = await updatePublicShareStatus({
      from,
      isPublic: true,
      ...params,
      ...shareData,
      ...data,
    });
    setShareData(result.appEntityShare);
  }
  useEffect(() => {
    if (privateVisible) {
      (async () => {
        const newUrl = await getUrl({
          from,
          ...params,
        });
        setUrl(newUrl);
      })();
    }
  }, []);
  useEffect(() => {
    (async () => {
      if (!publicUrl && !hidePublicShare && !includes(['recordInfo', 'view'], from)) {
        getPublicShareInfo();
      }
    })();
  }, []);

  return (
    <Modal visible width={720} footer={null} title={<Bold600>{title || _l('分享')}</Bold600>} onCancel={onClose}>
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
      {!hidePublicShare && (
        <React.Fragment>
          {from === 'worksheetApi' ? (
            <Tip99 className="">{_l('启用后，将 API 文档公开发布给应用外的用户查看使用')}</Tip99>
          ) : (
            <React.Fragment>
              <Bold600 className="Font15">{_l('对外公开分享')}</Bold600>
              <Tip99 className="mTop10">{_l('获得链接的所有人都可以查看')}</Tip99>
            </React.Fragment>
          )}
          <div className="mTop15 flexRow flexCenter">
            <span className="tip-right" data-tip={disabledTip}>
              <Switch disabled={!isCharge} checked={isPublic} onClick={() => updatePublicShare(!isPublic)} />
            </span>
            <div className="flex"></div>
            {isPublic && !urlVisible && (
              <Button
                className="Right"
                onClick={async () => {
                  if (includes(['recordInfo', 'view'], from)) {
                    await getPublicShareInfo();
                  }
                  setUrlVisible(true);
                }}
              >
                {_l('获取分享链接')}
              </Button>
            )}
          </div>
          {!!publicUrl && urlVisible && (
            <Fragment>
              <ShareUrl
                chatCard={genCard(from, 'public', params)}
                className="mTop20"
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
                  href={`/worksheet/form/edit/${params.worksheetId}?#detail`}
                  target="_blank"
                  className="mTop13 InlineBlock"
                >
                  {_l('编辑公开表单')}
                </a>
              )}
              {_.includes(['view', 'customPage'], from) && (
                <div className="flex flexRow alignItemsCenter mTop16 validityDateConfig">
                  <div className="mRight8">{_l('页面标题')}</div>
                  <Input
                    placeholder={params.title}
                    value={shareData.pageTitle}
                    className="flex"
                    onChange={event => {
                      const { value } = event.target;
                      setShareData({
                        ...shareData,
                        pageTitle: value.slice(0, 200)
                      });
                    }}
                    onBlur={handleChangePageTitle}
                    onKeyDown={event => {
                      event.which === 13 && handleChangePageTitle();
                    }}
                  />
                </div>
              )}
              {_.includes(['view', 'recordInfo', 'customPage', 'worksheetApi'], from) && (
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
                    if (_.includes(['customPage', 'worksheetApi'], from)) {
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
  onUpdate: PropTypes.func,
  onClose: PropTypes.func,
};

export const openShareDialog = props => functionWrap(Share, props);
