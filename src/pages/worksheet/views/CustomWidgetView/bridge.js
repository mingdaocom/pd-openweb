import { autobind } from 'core-decorators';
import { get, last, isFunction } from 'lodash';
import { api, utils } from './widgetFunctions';

export default class WidgetBridge {
  constructor(options) {
    this.cache = options.cache;
  }
  init(onLoad = () => {}, onLoadError = () => {}) {
    this.onLoad = onLoad;
    this.onLoadError = onLoadError;
    window.addEventListener('message', this.handleWidgetContainerMessage);
  }
  destroy() {
    window.removeEventListener('message', this.handleWidgetContainerMessage);
  }
  @autobind
  sendWidgetBridge(args) {
    if (this.targetWindow) {
      this.targetWindow.postMessage(
        {
          from: 'widget-container',
          ...args,
        },
        '*',
      );
    }
  }
  mountPropertyOnWindow(propertyName, propertyValue) {
    this.sendWidgetBridge({
      action: 'set-window',
      key: propertyName,
      value: propertyValue,
    });
  }
  @autobind
  async handleWidgetContainerMessage(e) {
    if (e.data.from !== 'customwidget') return;
    if (this.cache.current.scriptUrl && e.data.action === 'begin-load-widget' && this.targetWindow) {
      // prepare(iframeRef.current.contentWindow, worksheetInfo);
      // iframeRef.current.contentWindow.openSide = value => {
      //   setSide(value);
      // };
      let loadUrl = this.cache.current.scriptUrl;
      if (this.cache.current.isServerUrl) {
        loadUrl =
          md.global.FileStoreConfig.pubHost +
          (last(md.global.FileStoreConfig.pubHost) === '/' ? '' : '/') +
          this.cache.current.scriptUrl;
      }
      this.sendWidgetBridge({
        action: 'load-widget',
        value: loadUrl,
      });
      this.onLoad();
    } else if (e.data.action === 'call-md-api') {
      try {
        const { functionName, args } = e.data;
        if (!isFunction(api[functionName])) {
          throw new Error('not a md api function');
        }
        const result = await api[functionName](args);
        e.ports[0].postMessage({
          result,
        });
      } catch (err) {
        e.ports[0].postMessage({
          error: err,
        });
      }
    } else if (e.data.action === 'call-md-util') {
      try {
        const { functionName, args } = e.data;
        if (!isFunction(utils[functionName])) {
          throw new Error('not a md api function');
        }
        const result = await utils[functionName]({
          ...args,
          projectId: get(this, 'cache.current.config.worksheetInfo.projectId'),
          worksheetInfo:
            args.worksheetId && args.worksheetId !== get(this, 'cache.current.config.worksheetInfo.worksheetId')
              ? undefined
              : get(this, 'cache.current.config.worksheetInfo'),
        });
        e.ports[0].postMessage({
          result,
        });
      } catch (err) {
        e.ports[0].postMessage({
          error: err,
        });
      }
    } else if (e.data.action === 'load-url-error') {
      this.onLoadError();
    } else if (e.data.action === 'document-click-event') {
      document.body.dispatchEvent(new Event('mousedown'));
    }
  }
}
