import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatBox from './index';
import preall from 'src/common/preall';

const AssistantLand = () => {
  const shareId = (location.pathname.match(/.*\/public\/assistant\/(\w{24})/) || '')[1];
  return <ChatBox assistantId={shareId} showTitle={true} />;
};

const WrappedComp = preall(AssistantLand, { allowNotLogin: true });
const root = createRoot(document.getElementById('app'));

root.render(<WrappedComp />);
