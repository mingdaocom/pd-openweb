import React, { Fragment, useEffect, useState } from 'react';
import { Dropdown, Menu } from 'antd';
import { Icon, SvgIcon } from 'ming-ui';
import ChatBox from 'src/pages/plugin/assistant/chatBox';
import assistantApi from 'src/api/assistant';
import AssistantChatBox from 'src/pages/plugin/assistant/chatBox/AssistantChatBox';

const AiDisplay = props => {
  const { widget, editable = false, delWidget } = props;
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
      const Con = widget.value ? (
        <div
          className="suspensionAi flexRow alignItemsCenter justifyContentCenter pointer"
          style={{ backgroundColor: iconColor || '#2196f3' }}
          onClick={() => {
            if (editable) return;
            AssistantChatBox({ assistantId: suspensionAi.id, name: suspensionAi.name });
          }}
        >
          <SvgIcon size={32} url={iconUrl} fill="#fff" />
          <div className="shade" />
        </div>
      ) : (
        <div
          className="suspensionAi flexRow alignItemsCenter justifyContentCenter pointer"
          style={{ backgroundColor: '#2196f3' }}
          onClick={() => {
            alert(_l('助手已关闭或删除'), 3);
          }}
        >
          <Icon icon="workflow_failure" className="White Font40 mBottom5" />
        </div>
      );
      if (editable) {
        return (
          <Dropdown
            trigger={['click']}
            placement="leftTop"
            overlay={
              <Menu className="pTop10 pBottom10 boderRadAll_4" style={{ width: 160 }}>
                <Menu.Item key="delete" onClick={() => delWidget(widget)}>
                  <div className="flexRow valignWrapper pTop3 pBottom3">
                    <Icon icon="delete2" className="mRight5 Font16 Gray_9e" />
                    {_l('删除')}
                  </div>
                </Menu.Item>
              </Menu>
            }
          >
            {Con}
          </Dropdown>
        );
      } else {
        return Con;
      }
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
};

export default AiDisplay;
