import io from 'socket.io-client';
import { getPssId } from 'src/util/pssId';

export const socketInit = () => {
  if (window.IM === undefined) {
    window.IM = {};
    const socket = io.connect(window.config.SERVER_NAME, {
      path: '/mds2',
      reconnectionAttempts: 100,
      timeout: 15000,
      query: (!md.global.Config.IsLocal || window.top !== window.self || md.global.Config.IsMultiMds2) ? { pss_id: getPssId() } : {},  // 非私有部署 或 Iframe 或 mds2 多域名 下，走 Url 参数
      transports: window.config.SocketPolling ? ['polling', 'websocket'] : ['websocket'],
    });
    window.IM.socket = socket;
  }
};
