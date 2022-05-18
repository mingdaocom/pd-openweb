import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Modal, Switch } from 'ming-ui';
import functionWrap from 'worksheet/components/FunctionWrap';
import { Tip99, Hr, Bold600 } from 'worksheet/components/Basics';
import ShareUrl from 'worksheet/components/ShareUrl';
import { getUrl, getPublicShare, updatePublicShareStatus } from './controller';

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
  const { from, title, isCharge, isPublic, card, params = {}, onUpdate = () => {}, onClose } = props;
  const [url, setUrl] = useState();
  const [publicUrl, setPublicUrl] = useState(isPublic && props.publicUrl);
  const privateVisible = !_.includes(['report'], from);
  const isEmbed = _.includes(['view', 'customPage'], from);
  const privateTitle = isEmbed ? _l('嵌入链接') : _l('内部成员访问');
  let disabledTip;
  if (!isCharge) {
    disabledTip = from === 'recordInfo' ? _l('记录拥有者才能操作') : _l('应用管理员才能操作');
  }
  async function updatePublicShare(active) {
    const newUrl = await updatePublicShareStatus({
      from,
      isPublic: active,
      ...params,
      onUpdate,
    });
    setPublicUrl(newUrl);
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
      if (!publicUrl) {
        const newUrl = await getPublicShare({
          from,
          isPublic,
          ...params,
        });
        setPublicUrl(newUrl);
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
          />
          <Hr style={{ margin: '25px 0 22px' }} />
        </React.Fragment>
      )}
      <Bold600 className="Font15">{_l('对外公开分享')}</Bold600>
      <Tip99 className="mTop10">{_l('获得链接的所有人都可以查看')}</Tip99>
      <span data-tip={disabledTip} className="InlineBlock mTop15 tip-right">
        <Switch disabled={!isCharge} checked={!!publicUrl} onClick={() => updatePublicShare(!publicUrl)} />
      </span>
      {!!publicUrl && (
        <Fragment>
          <ShareUrl
            chatCard={genCard(from, 'public', params)}
            className="mTop20"
            theme="light"
            copyShowText
            allowSendToChat
            inputBtns={[
              {
                tip: _l('新窗口打开'),
                icon: 'task-new-detail',
                onClick: () => window.open(publicUrl),
              },
            ]}
            url={publicUrl}
          />
          {from === 'newRecord' && (
            <a
              href={`/worksheet/form/edit/${params.worksheetId}?#detail`}
              target="_blank"
              className="mTop13 InlineBlock"
            >
              {_l('编辑公开表单')}
            </a>
          )}
        </Fragment>
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
