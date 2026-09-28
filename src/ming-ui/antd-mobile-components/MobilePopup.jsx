import React, { useEffect, useRef } from 'react';
import { Popup } from 'antd-mobile';
import { getHistoryLayerDepth, useHistoryBackClose } from 'src/utils/platform/navigation/mobileNavigation';
import { compatibleMDJS } from 'src/utils/services/project';

export default function MobilePopup(props) {
  const { visible, layerId, historyUrlParams, onClose = () => {}, children, ...popupProps } = props;
  const sessionIdRef = useRef('');

  // 接管浏览器返回 → 关闭弹层；嵌套时由全局栈按栈顶顺序响应
  useHistoryBackClose({ visible, layerId, onClose, urlParams: historyUrlParams });

  useEffect(() => {
    sessionIdRef.current = Date.now().toString();
    compatibleMDJS('takeOverNavigation', {
      sessionId: sessionIdRef.current, // 随机ID
      appWillGoBack: data => {
        var newSessionId = data.sessionId;
        // sessionId: 传入的sessionId
        // url: App 将返回的页面, 为空则是关闭当前浏览器
        // 若App执行失败, 将夺回控制权
        // H5决定 — 1: 允许App执行；2: 取消原生返回, 由 H5 执行返回
        sessionIdRef.current = newSessionId;

        // 当前仍处于嵌套弹层场景 → 拒绝原生返回，由 H5 自行 history.back 关闭栈顶弹层
        if (getHistoryLayerDepth() > 0) {
          history.back();
          return 2;
        }

        return 1;
      },
    });

    return () => {
      if (!window.isMingDaoApp || !sessionIdRef.current) return;
      compatibleMDJS('handOverNavigation', { sessionId: sessionIdRef.current });
      sessionIdRef.current = '';
    };
  }, []);

  return (
    <Popup {...popupProps} visible={visible} onClose={onClose}>
      {children}
    </Popup>
  );
}
