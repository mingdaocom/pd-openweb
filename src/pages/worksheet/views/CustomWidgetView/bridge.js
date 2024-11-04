import { get, last, isFunction } from 'lodash';
import { api, utils, mainWebApi } from './widgetFunctions';

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
  sendWidgetBridge = args => {
    if (this.targetWindow) {
      this.targetWindow.postMessage(
        {
          from: 'widget-container',
          ...args,
        },
        '*',
      );
    }
  };
  mountPropertyOnWindow(propertyName, propertyValue) {
    this.sendWidgetBridge({
      action: 'set-window',
      key: propertyName,
      value: propertyValue,
    });
  }
  handleWidgetContainerMessage = async e => {
    if (e.data.from !== 'customwidget') return;
    if (this.cache.current.scriptUrl && e.data.action === 'begin-load-widget' && this.targetWindow) {
      // prepare(iframeRef.current.contentWindow, worksheetInfo);
      // iframeRef.current.contentWindow.openSide = value => {
      //   setSide(value);
      // };
      this.onLoad();
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
    } else if (e.data.action === 'call-main-web') {
      const { args = {} } = e.data;
      const { data } = args;
      let controller = args.controller;
      let action = args.action;
      controller = _.lowerCase(controller[0]) + controller.slice(1);
      action = _.lowerCase(action[0]) + action.slice(1);
      action;
      if (get(mainWebApi, [controller, action].join('.'))) {
        try {
          const result = await get(mainWebApi, [controller, action].join('.'))(data);
          e.ports[0].postMessage({
            result,
          });
        } catch (err) {
          e.ports[0].postMessage({
            error: err,
          });
        }
      }
    }
  };
}
