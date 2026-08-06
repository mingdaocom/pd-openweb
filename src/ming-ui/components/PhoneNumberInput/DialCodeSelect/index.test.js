const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function createElement(tagName = 'div') {
  const listeners = {};
  const element = {
    tagName: tagName.toUpperCase(),
    style: {},
    children: [],
    parentNode: null,
    parentElement: null,
    value: '',
    disabled: false,
    offsetTop: 0,
    offsetHeight: 40,
    setAttribute: () => null,
    appendChild(child) {
      child.parentNode = element;
      child.parentElement = element;
      element.children.push(child);
    },
    removeChild(child) {
      element.children = element.children.filter(item => item !== child);
      child.parentNode = null;
      child.parentElement = null;
    },
    addEventListener(type, listener) {
      listeners[type] = listeners[type] || [];
      listeners[type].push(listener);
    },
    removeEventListener(type, listener) {
      listeners[type] = (listeners[type] || []).filter(item => item !== listener);
    },
    dispatchEvent(event) {
      (listeners[event.type] || []).forEach(listener => listener(event));
      return true;
    },
    contains(target) {
      return target === element || element.children.includes(target);
    },
    getBoundingClientRect() {
      return { top: 0, bottom: 40, left: 0, right: 200, width: 200, height: 40 };
    },
  };

  return element;
}

function loadModule() {
  const moduleLike = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, 'index.jsx'), {
    babelrc: false,
    presets: ['@babel/preset-react'],
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  global.Event = function Event(type) {
    this.type = type;
  };

  global.document = {
    body: createElement('body'),
    createElement,
    addEventListener: () => null,
    removeEventListener: () => null,
    documentElement: {
      clientWidth: 1024,
      clientHeight: 768,
    },
  };
  global.window = {
    scrollX: 0,
    scrollY: 0,
    innerWidth: 1024,
    innerHeight: 768,
    addEventListener: () => null,
    removeEventListener: () => null,
    getComputedStyle: () => ({ position: 'static' }),
  };

  function localRequire(importPath) {
    if (importPath === 'react') {
      return { createElement: () => null };
    }

    if (importPath === 'react-dom/client') {
      return {
        createRoot: () => ({
          render: () => null,
          unmount: () => null,
        }),
      };
    }

    if (importPath === 'libphonenumber-js/max') {
      return { isValidPhoneNumber: () => true };
    }

    if (importPath === './DialCodePanel') {
      return () => null;
    }

    if (importPath === './utils') {
      return {
        buildCountryOptions: () => [
          { code: '+86', dialCode: '86', iso2: 'CN', localName: '中国大陆' },
          { code: '+852', dialCode: '852', iso2: 'HK', localName: '中国香港' },
        ],
        getDefaultCode: () => '+86',
        parseDialCode: ({ currentCode }) => currentCode || '+86',
        parseFullNumberInput: () => null,
      };
    }

    return require(importPath);
  }

  new Function('module', 'exports', 'require', code)(moduleLike, moduleLike.exports, localRequire);

  return moduleLike.exports;
}

const { IntlTelInputAdapter } = loadModule();
const wrapper = createElement('div');
const input = createElement('input');
input.parentElement = wrapper;
wrapper.appendChild(input);

const events = [];
input.addEventListener('countrychange', () => events.push('countrychange'));
input.addEventListener('close:countrydropdown', () => events.push('close:countrydropdown'));

const adapter = new IntlTelInputAdapter(input, {
  showDialCodeInput: true,
  dialCodeInputGap: 12,
});

assert.strictEqual(input.style.paddingLeft, '212px', '拨号区号触发器和输入内容之间应保留 12px 间距');

const defaultGapInput = createElement('input');
wrapper.appendChild(defaultGapInput);
new IntlTelInputAdapter(defaultGapInput, {
  showDialCodeInput: true,
});

assert.strictEqual(defaultGapInput.style.paddingLeft, '224px', '未传参时应保留默认 24px 间距');

adapter.instance.onSelectCode('+852');

assert.deepStrictEqual(events, ['countrychange', 'close:countrydropdown']);
console.log('DialCodeSelect tests passed');
