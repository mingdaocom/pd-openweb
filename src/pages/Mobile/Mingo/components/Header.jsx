import React from 'react';
import { Icon } from 'ming-ui';
import SelectProject from 'mobile/components/SelectProject';

function ToolbarActions({ onOpenHistory, onNewChat }) {
  return (
    <div className="toolbarActions flexRow">
      <div className="toolbarIconBtn historyBtn" onClick={onOpenHistory}>
        <Icon icon="access_time" />
      </div>
      <div className="toolbarIconBtn newChatBtn" onClick={onNewChat}>
        <Icon icon="newchat" />
      </div>
    </div>
  );
}

export default function Header({ isChatting, disableProjectSelect, onOpenHistory, onFocusInput, onProjectChange }) {
  if (isChatting) {
    return (
      <div className="mobileAiHeader flexRow">
        <div className="flex"></div>
        <ToolbarActions onOpenHistory={onOpenHistory} onNewChat={onFocusInput} />
      </div>
    );
  }

  return (
    <div className="mobileAiHomeHeader flexRow">
      {disableProjectSelect ? (
        <div className="flex"></div>
      ) : (
        <SelectProject className="mingoProjectSelect flex overflowHidden" changeProject={onProjectChange} />
      )}
      <ToolbarActions onOpenHistory={onOpenHistory} onNewChat={onFocusInput} />
    </div>
  );
}
