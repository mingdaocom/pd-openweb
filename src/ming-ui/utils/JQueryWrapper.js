/* eslint-disable object-shorthand */
/* eslint-disable object-shorthand */
/* eslint-disable object-shorthand */
/* eslint-disable object-shorthand */
import React from 'react';
import ReactDOM from 'react-dom';

import PositionContainer from 'ming-ui/components/PositionContainer';

function prefixReact(str) {
  if (!str) return str;
  return 'react' + str;
}

/**
 *
 * @param {React.Component} Component React 组件类
 * @param {Object} options 参数
 * @param {string} options.name jQuery 插件名，如果不传则为 react + 组件名（如组件类名为 Component，则可以使用 $(element).reactComponent(...) 调用）
 * @param {Object} options.defaultProps 组件默认 props
 * @param {Object} options.picker 渲染目标元素成触发器而不是直接渲染组件
 * @param {Object} options.picker.defaultProps PositionContainer 的参数
 * @param {Object} options.publicMethods jQuery 插件公开方法，可以通过 $(element).reactComponent('publicMethodsKey') 调用. PS: 通过如上调用方式还可以调用 react 元素的公开方法
 * @param {Object} options.renderCallback react 组件调用时的回调
 */
export default function createJQueryPluginFromReactComponent(Component, options = { name: null, defaultProps: null, picker: null, publicMethods: {} }) {
  if (!Component) throw new Error('传入组件为空');
  options = options || {};

  const componentName = options.name || prefixReact(Component.displayName || Component.name);
  if (!componentName) throw new Error('未指定组件名');

  const dataKey = `plugin_react_${componentName}`;

  function bindFunctions(obj, thisArg) {
    if (!obj || typeof obj !== 'object') return obj;
    return Object.keys(obj).reduce((newObj, key) => {
      newObj[key] = typeof obj[key] === 'function' ? obj[key].bind(thisArg) : obj[key];
      return newObj;
    }, {});
  }

  function ReactJQueryPlugin(domNode, pluginOptions) {
    this.domNode = domNode;
    this.targetDomNode = options.picker ? $(`<div data-react-component-name="${componentName}" />`).appendTo('body')[0] : this.domNode;
    this.settings = Object.assign({}, options.defaults, pluginOptions);
    this.settings.props = Object.assign({}, options.defaultProps, this.settings.props);
    if (this.settings.publicMethods) {
      Object.assign(this, this.settings.publicMethods);
    }
    if (options.picker) {
      this.settings.pickerProps = Object.assign(
        {
          bounding: this.domNode.getBoundingClientRect(),
          onHide: () => this.closePicker(),
        },
        options.picker.defaultProps,
        this.settings.pickerProps
      );
    }
    this._name = componentName;
    this.init(this.settings.renderCallback);
  }

  const privateMethods = {
    init: function (callback) {
      this.shouldRender = true;
      this.render(callback);
    },
    render: function (props, pickerProps, callback) {
      this.reactElement = React.createElement(Component, bindFunctions(this.settings.props, this));
      let reactElement = this.reactElement;

      if (options.picker) {
        reactElement = React.createElement(PositionContainer, bindFunctions(this.settings.pickerProps, this), this.reactElement);
      }

      // setTimeout 是由于 window 收到 click 事件，PositioContainer 的 destroy 立马就触发了
      setTimeout(() => {
        if (!this.shouldRender) return;
        ReactDOM.render(reactElement, this.targetDomNode, (reactInstance) => {
          this.reactInstance = reactInstance;
          if (callback) callback(reactInstance);
        });
      }, 0);
    },
  };

  const publicMethods = Object.assign(
    {
      /** 更新 react 组件 props */
      setProps: function (props, callback) {
        this.settings.props = Object.assign(this.settings.props, props);
        this.render(callback);
      },
      /** 更新 PositionContainer 组件 props */
      setPickerProps: function (props, callback) {
        this.settings.pickerProps = Object.assign(this.settings.pickerProps, props);
        this.render(callback);
      },
      /** 触发模式下显示组件 */
      openPicker: function () {
        if (options.picker) {
          this.setPickerProps({ visible: true });
        } else {
          console.warn('不是触发模式，创建插件时请传入 picker 参数');
        }
      },
      /** 触发模式下隐藏组件 */
      closePicker: function () {
        if (options.picker) {
          this.setPickerProps({ visible: false });
        } else {
          console.warn('不是触发模式，创建插件时请传入 picker 参数');
        }
      },
      /** 销毁对应的 react 元素 */
      destroy: function () {
        try {
          this.shouldRender = false;
          this.closePicker();
          $(this.domNode).data(dataKey, null);
          this.reactInstance = null;
          ReactDOM.unmountComponentAtNode(this.targetDomNode);
          if (this.targetDomNode && this.targetDomNode !== this.domNode) {
            $(this.targetDomNode).remove();
          }
        } catch (ex) {
          console.error(ex);
        }
      },
    },
    options.publicMethods
  );

  $.extend(ReactJQueryPlugin.prototype, privateMethods, publicMethods);

  $.fn[componentName] = function (pluginOptions, ...args) {
    if (typeof pluginOptions === 'string') {
      const instance = $(this).data(dataKey);
      if (instance.publicMethods && instance.publicMethods[pluginOptions]) {
        instance.publicMethods[pluginOptions].apply(instance, args);
      } else if (publicMethods[pluginOptions]) {
        publicMethods[pluginOptions].apply(instance, args);
      } else if (instance && instance.reactInstance && instance.reactInstance[pluginOptions]) {
        if (typeof instance.reactInstance[pluginOptions] === 'function') {
          return instance.reactInstance[pluginOptions].call(instance.reactInstance, ...args);
        } else {
          return instance.reactInstance[pluginOptions];
        }
      } else {
        throw new Error(`方法未定义: ${pluginOptions}`);
      }
    } else {
      return this.each(function () {
        if (!$(this).data(dataKey)) {
          $(this).data(dataKey, new ReactJQueryPlugin(this, pluginOptions));
        }
      });
    }
  };

  return $.fn[componentName].bind($.fn);
}
