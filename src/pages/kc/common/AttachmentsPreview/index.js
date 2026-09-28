import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { useZIndex } from 'antd/es/_util/hooks/useZIndex';
import ZIndexContext from 'antd/es/_util/zindexContext';
import AttachmentsPreview from './attachmentsPreview';
import reducer from './reducers/reducer';

function createPreviewStore() {
  return createStore(reducer, compose(applyMiddleware(thunk)));
}

export default function AttachmentsPreviewProvider(props) {
  // 嵌套预览的初始化和卸载只能更新当前实例的状态。
  const [store] = useState(createPreviewStore);
  const [zIndex, contextZIndex] = useZIndex('Modal', props.zIndex);

  return (
    <ZIndexContext.Provider value={contextZIndex}>
      <Provider store={store}>
        <AttachmentsPreview {...props} zIndex={zIndex ?? contextZIndex} />
      </Provider>
    </ZIndexContext.Provider>
  );
}
