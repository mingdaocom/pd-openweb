import io from 'socket.io-client';
import { getPssId } from 'src/util/pssId';

export const socketInit = () => {
  if (window.IM === undefined) {
    window.IM = {};
    const socket = io.connect(window.config.SERVER_NAME, {
      path: '/mds2',
      reconnectionAttempts: 100,
      timeout: 15000,
      query: {
        pss_id: getPssId(),
      },
      transports: ['websocket'],
    });
    window.IM.socket = socket;
  }
};
