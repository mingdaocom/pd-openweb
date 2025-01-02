import EventEmitter from 'events';

export const emitter = new EventEmitter();

export default class MessageBridge {
  constructor({ currentEnvName = 'free_field', containerEnvName = 'main_web' } = {}) {
    this.mainWindow = window.parent;
    this.iframeId = new URL(location.href).searchParams.get('id');
    this.type = new URL(location.href).searchParams.get('type');
    this.emitter = new EventEmitter();
    this.options = {
      currentEnvName,
      containerEnvName,
    };
    this.init();
  }
  init() {
    this.bindWindowEvent();
    this.bindEmitterToWindow();
  }
  bindWindowEvent() {
    window.addEventListener('load', this.handleWindowOnload.bind(this));
    if (window.handleFreeFieldWindowEventBonded) return;
    window.addEventListener('message', this.handleMessage.bind(this));
    window.handleFreeFieldWindowEventBonded = true;
  }
  bindEmitterToWindow() {
    this.emitter.on('send-message-to-main', data => {
      this.sendMessageToMain(data);
    });
  }
  handleMessage(event) {
    const { source, payload } = event.data || {};
    if (source === this.options.containerEnvName) {
      this.emitter.emit('container', payload);
    }
  }
  handleWindowOnload() {
    this.sendMessageToMain({ event: 'window-ready' });
  }
  sendMessageToMain(data) {
    this.mainWindow.postMessage(
      {
        source: this.options.currentEnvName,
        id: this.iframeId,
        payload: data,
      },
      '*',
    );
  }
}
