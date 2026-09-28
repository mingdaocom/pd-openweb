import _ from 'lodash';
import io from 'socket.io-client';
import { getPssId } from 'src/utils/platform/auth/pssId';

/**
 * 创建全局 Socket 连接；已初始化时不重复建连。
 * 返回值仅在本次实际创建连接时存在，供入口注册首次连接事件。
 */
export function createSocketConnection() {
  if (window.IM !== undefined) return;

  window.IM = {};
  const socket = io.connect(_.get(window, 'config.SERVER_NAME'), {
    path: `${window.__customSubPath__}/mds2`,
    reconnectionAttempts: 100,
    timeout: 15000,
    query:
      window.platformENV.isHap ||
      window.top !== window.self ||
      md.global.Config.IsMultiMds2 ||
      location.href.indexOf('localhost') > -1
        ? { pss_id: getPssId() }
        : {}, // 非私有部署、Iframe 或 mds2 多域名下通过 URL 参数鉴权
    transports: window.config.SocketPolling ? ['polling', 'websocket'] : ['websocket'],
  });

  window.IM.socket = socket;
  return socket;
}
