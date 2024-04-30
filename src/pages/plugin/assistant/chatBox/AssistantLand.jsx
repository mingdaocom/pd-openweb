import React from 'react';
import ReactDom from 'react-dom';
import ChatBox from './index';
import preall from 'src/common/preall';

const AssistantLand = () => {
  const shareId = (location.pathname.match(/.*\/public\/assistant\/(\w{24})/) || '')[1];
  return <ChatBox assistantId={shareId} showTitle={true} />;
};

const WrappedComp = preall(AssistantLand, { allowNotLogin: true });

ReactDom.render(<WrappedComp />, document.getElementById('app'));
