import * as actions from 'src/pages/chat/redux/actions';
import store from 'src/redux/configureStore';
import { CHAT_EVENT } from 'src/utils/domain/chat/events';
import { emitter } from 'src/utils/platform/browser/dom';

const openChatSession = ({ id, type } = {}) => {
  if (!id) return;

  if (type === 1) {
    store.dispatch(actions.addUserSession(id));
  } else if (type === 2) {
    store.dispatch(actions.addGroupSession(id));
  }
};

export const registerChatEvents = () => {
  emitter.on(CHAT_EVENT.OPEN_SESSION, openChatSession);

  return () => emitter.off(CHAT_EVENT.OPEN_SESSION, openChatSession);
};
