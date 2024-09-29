import React, { useEffect, useState, Fragment } from 'react';
import ChatBox from 'src/pages/plugin/assistant/chatBox';
import styled from 'styled-components';
import assistantApi from 'src/api/assistant';
import { CenterPopup } from 'antd-mobile';
import { Icon, SvgIcon, FunctionWrap } from 'ming-ui';

const ModalWrap = styled(CenterPopup)`
  .adm-center-popup-wrap {
    min-width: 90vw;
    max-width: 90vw;
  }
  .adm-center-popup-body {
    height: 90vh;
  }
`;

const SuspensionAi = styled.div`
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #fff;
`;

const openAssistantChat = props =>
  FunctionWrap(
    props => {
      const [visible, setVisible] = useState(true);
      return (
        <ModalWrap
          onClose={() => setVisible(false)}
          visible={visible}
        >
          <Icon
            icon="closeelement-bg-circle"
            className="Absolute Gray_9e Font22"
            style={{ top: 10, right: 10, zIndex: 1 }}
            onClick={() => setVisible(false)}
          />
          <div className="h100 TxtLeft" style={{ padding: '36px 15px 0 15px' }}>
            <ChatBox assistantId={props.assistantId} fullContent={true} />
          </div>
        </ModalWrap>
      );
    },
    { ...props },
  );

function AiContent(props) {
  const { widget } = props;
  const { config = {} } = widget;
  const isSuspension = config.showType === 'suspension';
  const [suspensionAi, setSuspensionAi] = useState(null);

  useEffect(() => {
    if (isSuspension && widget.value) {
      assistantApi
        .getSimpleInfo({
          assistantId: widget.value,
        })
        .then(data => {
          setSuspensionAi(data);
        });
    }
  }, []);

  if (isSuspension) {
    const { iconUrl, iconColor } = suspensionAi || {};
    if (suspensionAi || _.isEmpty(widget.value)) {
      return widget.value ? (
        <SuspensionAi
          className="flexRow alignItemsCenter justifyContentCenter card"
          style={{ backgroundColor: iconColor || '#2196f3' }}
          onClick={() => {
            openAssistantChat({ assistantId: suspensionAi.id, name: suspensionAi.name });
          }}
        >
          <SvgIcon size={26} url={iconUrl} fill="#fff" />
        </SuspensionAi>
      ) : (
        <SuspensionAi
          className="flexRow alignItemsCenter justifyContentCenter card"
          style={{ backgroundColor: '#2196f3' }}
          onClick={() => {
            alert(_l('助手已关闭或删除'), 3);
          }}
        >
          <Icon icon="workflow_failure" className="White Font20 mBottom5" />
        </SuspensionAi>
      );
    } else {
      return null;
    }
  } else {
    return widget.value ? (
      <ChatBox assistantId={widget.value} fullContent={true} />
    ) : (
      <div className="flexColumn valignWrapper w100 h100" style={{ justifyContent: 'center' }}>
        <Icon icon="workflow_failure" className="Font64 Gray_c mBottom10" />
        <div className="Gray_9e Font20 mBottom2">{_l('助手已关闭或删除')}</div>
      </div>
    );
  }
}

export default AiContent;
