import React, { useEffect, useState } from 'react';
import { Popup } from 'antd-mobile';
import useHistoryBackClose, { getHistoryLayerDepth } from 'src/utils/mobileNavigation';
import { compatibleMDJS } from 'src/utils/project';

export default function MobilePopup(props) {
  const { visible, layerId, historyUrlParams, onClose = () => {}, children, ...popupProps } = props;
  const [sessionId, setSessionId] = useState(Date.now().toString());

  // 接管浏览器返回 → 关闭弹层；嵌套时由全局栈按栈顶顺序响应
  useHistoryBackClose({ visible, layerId, onClose, urlParams: historyUrlParams });

  const handOverNavigation = () => {
    if (!window.isMingDaoApp) return;
    compatibleMDJS('handOverNavigation', { sessionId });
    setSessionId('');
  };

  useEffect(() => {
    compatibleMDJS('takeOverNavigation', {
      sessionId, // 随机ID
      appWillGoBack: data => {
        var newSessionId = data.sessionId;
        // sessionId: 传入的sessionId
        // url: App 将返回的页面, 为空则是关闭当前浏览器
        // 若App执行失败, 将夺回控制权
        // H5决定 — 1: 允许App执行；2: 取消原生返回, 由 H5 执行返回
        setSessionId(newSessionId);

        // 当前仍处于嵌套弹层场景 → 拒绝原生返回，由 H5 自行 history.back 关闭栈顶弹层
        if (getHistoryLayerDepth() > 0) {
          history.back();
          return 2;
        }

        return 1;
      },
    });

    return () => {
      // 仍有未关闭的弹层时，把控制权留给 H5 的栈，等弹层全关后再交还
      if (getHistoryLayerDepth() > 0) return;
      handOverNavigation();
    };
  }, []);

  return (
    <Popup {...popupProps} visible={visible} onClose={onClose}>
      {children}
    </Popup>
  );
}
