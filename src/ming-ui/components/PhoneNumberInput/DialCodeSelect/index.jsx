import React from 'react';
import { createRoot } from 'react-dom/client';
import { isValidPhoneNumber } from 'libphonenumber-js/max';
import _ from 'lodash';
import DialCodePanel from './DialCodePanel';
import { buildCountryOptions, getDefaultCode, parseDialCode, parseFullNumberInput } from './utils';

const PANEL_WIDTH = 400;
const PANEL_HEIGHT = 445;
const COMPACT_PANEL_MAX_HEIGHT = 300;
const VIEWPORT_GAP = 8;

const normalizeCode = code => {
  if (!code) return '';
  return String(code).startsWith('+') ? String(code) : `+${code}`;
};

const normalizeValue = value => String(value || '').trim();

export class DialCodeSelectInstance {
  constructor(options = {}) {
    this.element = options.dom || null;
    this.ref = options.ref;
    this.value = normalizeValue(options.value || this.element?.value || '');
    this.defaultCountry = String(options.defaultCountry || 'cn').toLowerCase();
    this.preferredCountries = options.preferredCountries || [];
    this.onlyCountries = options.onlyCountries || [];
    this.locale = options.locale;
    this.onSelectCode = options.onSelectCode || (() => {});
    this.code = parseDialCode({
      value: this.value,
      defaultCountry: this.defaultCountry,
      currentCode: getDefaultCode(this.defaultCountry),
    });
    this.isOpen = false;
    this.container = null;
    this.root = null;
    this.panelLayout = {};

    this._onTriggerClick = event => {
      event.preventDefault();
      event.stopPropagation();
      this._togglePanel();
    };

    this._onTriggerKeydown = event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      this._togglePanel();
    };

    this._onOutsideClick = event => {
      if (this.element?.contains(event.target) || this.container?.contains(event.target)) return;
      this._closePanel();
    };

    this._onEsc = event => {
      if (event.key === 'Escape') {
        this._closePanel();
      }
    };

    this._onReposition = () => {
      if (!this.isOpen) return;
      if (this._positionPanel()) {
        this._renderPanel();
      }
    };

    this._destroy = () => {
      this._closePanel();

      if (this.element) {
        this.element.removeEventListener('click', this._onTriggerClick);
        this.element.removeEventListener('keydown', this._onTriggerKeydown);
      }

      if (this.root) {
        this.root.unmount();
        this.root = null;
      }

      if (this.container?.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }

      this.container = null;
    };

    if (this.element) {
      this.element.addEventListener('click', this._onTriggerClick);
      this.element.addEventListener('keydown', this._onTriggerKeydown);
    }

    if (this.ref && typeof this.ref === 'object') {
      this.ref.current = this;
    }
  }

  _getCurrentValue = value => normalizeValue(value || this.element?.value || this.value);

  _syncCodeByValue = value => {
    const nextCode = parseDialCode({
      value,
      defaultCountry: this.defaultCountry,
      currentCode: this.code || getDefaultCode(this.defaultCountry),
    });

    if (nextCode) {
      this.code = nextCode;
    }

    return nextCode;
  };

  _ensurePanel = () => {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.style.position = 'fixed';
    this.container.style.zIndex = '1050';
    document.body.appendChild(this.container);
    this.root = createRoot(this.container);
  };

  _positionPanel = () => {
    if (!this.element || !this.container) return;
    const rect = this.element.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
    const renderedPanelHeight = Math.ceil(this.container.firstElementChild?.getBoundingClientRect?.().height || 0);
    const expectedPanelHeight = renderedPanelHeight || PANEL_HEIGHT;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const canFitBelow = spaceBelow >= expectedPanelHeight;
    const canFitAbove = spaceAbove >= expectedPanelHeight;
    const isCompact = (!canFitBelow && !canFitAbove) || viewportWidth < PANEL_WIDTH + VIEWPORT_GAP * 2;
    const panelWidth = Math.min(PANEL_WIDTH, Math.max(0, viewportWidth - VIEWPORT_GAP * 2));
    const panelHeight =
      renderedPanelHeight ||
      (isCompact ? Math.min(COMPACT_PANEL_MAX_HEIGHT, Math.max(0, viewportHeight - VIEWPORT_GAP * 2)) : PANEL_HEIGHT);
    const showAbove = !canFitBelow && (canFitAbove || spaceAbove > spaceBelow);
    const canFitRight = viewportWidth - rect.left >= PANEL_WIDTH;
    const canFitLeft = rect.right >= PANEL_WIDTH;
    const alignLeft = !canFitRight && (canFitLeft || rect.left > viewportWidth - rect.right);
    const maxLeft = Math.max(VIEWPORT_GAP, viewportWidth - panelWidth - VIEWPORT_GAP);
    const rawLeft = alignLeft ? rect.right - panelWidth : rect.left;
    const rawTop = showAbove ? rect.top - panelHeight : rect.bottom;
    const left = Math.min(Math.max(rawLeft, VIEWPORT_GAP), maxLeft);
    const top = Math.min(
      Math.max(rawTop, VIEWPORT_GAP),
      Math.max(VIEWPORT_GAP, viewportHeight - panelHeight - VIEWPORT_GAP),
    );
    const nextLayout = {
      panelWidth,
      maxPanelHeight: isCompact ? panelHeight : undefined,
      hideIndexBar: isCompact,
    };
    const layoutChanged = !_.isEqual(this.panelLayout, nextLayout);

    this.container.style.left = `${left}px`;
    this.container.style.top = `${top}px`;
    this.panelLayout = nextLayout;

    return layoutChanged;
  };

  _positionPanelAfterRender = () => {
    const reposition = () => {
      if (this.isOpen) {
        this._positionPanel();
      }
    };

    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(reposition);
    } else {
      setTimeout(reposition, 0);
    }
  };

  _renderPanel = () => {
    if (!this.root || !this.isOpen) return;
    this.root.render(
      <DialCodePanel
        countryOptions={this.getCountryOptions()}
        code={this.code}
        preferredCountries={this.preferredCountries}
        locale={this.locale}
        {...this.panelLayout}
        onSelectCode={nextCode => {
          this.code = nextCode;
          this.onSelectCode(nextCode);
          this._closePanel();
        }}
      />,
    );
  };

  _openPanel = () => {
    if (!this.element || this.isOpen) return;
    this.isOpen = true;
    this._ensurePanel();
    this._syncCodeByValue(this._getCurrentValue());
    this._positionPanel();
    this._renderPanel();
    this._positionPanelAfterRender();
    document.addEventListener('mousedown', this._onOutsideClick, true);
    document.addEventListener('touchstart', this._onOutsideClick, true);
    document.addEventListener('keydown', this._onEsc, true);
    document.addEventListener('scroll', this._onReposition, true);
    window.addEventListener('resize', this._onReposition, true);
    window.addEventListener('scroll', this._onReposition, true);
  };

  _closePanel = () => {
    if (!this.isOpen) return;
    this.isOpen = false;
    document.removeEventListener('mousedown', this._onOutsideClick, true);
    document.removeEventListener('touchstart', this._onOutsideClick, true);
    document.removeEventListener('keydown', this._onEsc, true);
    document.removeEventListener('scroll', this._onReposition, true);
    window.removeEventListener('resize', this._onReposition, true);
    window.removeEventListener('scroll', this._onReposition, true);
    this.root?.render(<></>);
  };

  _togglePanel = () => {
    if (this.isOpen) {
      this._closePanel();
    } else {
      this._openPanel();
    }
  };

  getCountryOptions = options => {
    return buildCountryOptions({
      preferredCountries: this.preferredCountries,
      onlyCountries: this.onlyCountries,
      locale: this.locale,
      ...(options || {}),
    });
  };

  _getCountryByCode = code => {
    return this.getCountryOptions().find(option => option.code === code) || {};
  };

  getSelectedCountryData = value => {
    const currentValue = this._getCurrentValue(value);
    const nextCode = this._syncCodeByValue(currentValue);
    const country = this._getCountryByCode(nextCode);

    return {
      name: country.localName || '',
      iso2: (country.iso2 || '').toLowerCase(),
      dialCode: String(country.dialCode || '').replace(/^\+/, ''),
      code: country.code || nextCode || '',
    };
  };

  getNumber = value => {
    const currentValue = this._getCurrentValue(value);
    if (!currentValue) return '';

    if (currentValue.startsWith('+')) {
      const currentCode = this._syncCodeByValue(currentValue);

      if (currentCode && currentValue.startsWith(currentCode)) {
        return currentValue.slice(currentCode.length).replace(/\s+/g, '');
      }

      return currentValue.replace(/^\+\d{1,4}/, '').replace(/\s+/g, '');
    }

    return currentValue.replace(/\s+/g, '');
  };

  isValidNumber = value => {
    const currentValue = this._getCurrentValue(value);
    if (!currentValue) return false;
    this._syncCodeByValue(currentValue);
    const fullNumber = currentValue.startsWith('+')
      ? currentValue.replace(/\s+/g, '')
      : `${normalizeCode(this.code || getDefaultCode(this.defaultCountry))}${currentValue.replace(/\s+/g, '')}`;
    return !!fullNumber && isValidPhoneNumber(fullNumber);
  };
}

export class IntlTelInputAdapter {
  constructor(element, options = {}) {
    this.element = element;
    this.options = options;
    this.locale = options.locale;
    this.parentElement = null;
    this.parentPosition = '';
    this.needRestoreParentPosition = false;
    this.inputPaddingLeft = '';
    this.dialCodeTrigger = null;
    this.dialCodeLabel = null;
    this.showDialCodeInput = !!options.showDialCodeInput && this.element?.tagName === 'INPUT';
    this.dialCodeInputGap = Number.isFinite(options.dialCodeInputGap) ? options.dialCodeInputGap : 24;
    this.defaultCountry = String(options.initialCountry || 'cn').toLowerCase();
    this.preferredCountries = options.preferredCountries || [];
    this.onlyCountries = options.onlyCountries || [];
    this.countryOptions = buildCountryOptions({
      preferredCountries: this.preferredCountries,
      onlyCountries: this.onlyCountries,
      locale: this.locale,
    });
    this.code = parseDialCode({ value: element?.value || '', defaultCountry: this.defaultCountry });

    this.setupDialCodeInput();

    this.instance = new DialCodeSelectInstance({
      dom: this.dialCodeTrigger || element,
      value: element?.value || '',
      defaultCountry: this.defaultCountry,
      preferredCountries: this.preferredCountries,
      onlyCountries: this.onlyCountries,
      locale: this.locale,
      onSelectCode: nextCode => {
        const prevCode = this.code;
        this.code = nextCode;
        this.updateDialCodeInput();
        // 兼容旧 intl-tel-input 事件契约，仅通知现有监听方同步 dialCode/DefaultCountry，不改输入值。
        if (prevCode !== nextCode) {
          this.element?.dispatchEvent(new Event('countrychange', { bubbles: true }));
        }

        this.element?.dispatchEvent(new Event('close:countrydropdown', { bubbles: true }));
      },
    });

    this.handleElementInput = () => {
      if (!this.element) return;
      const nextCode = parseDialCode({
        value: this.getNumber(),
        defaultCountry: this.defaultCountry,
        currentCode: this.code,
      });

      if (nextCode) {
        this.code = nextCode;
        this.updateDialCodeInput();
      }
    };

    if (this.element) {
      this.element.addEventListener('input', this.handleElementInput, true);
      this.element.addEventListener('change', this.handleElementInput, true);
      if (_.isFunction(options.customPlaceholder)) {
        this.element.setAttribute('placeholder', options.customPlaceholder());
      }
    }

    if (this.element?.value) {
      this.setNumber(this.element.value);
    }

    this.updateDialCodeInput();
  }

  _getCountryByCode = code => {
    return this.countryOptions.find(item => item.code === code) || {};
  };

  _getCountryByIso2 = iso2 => {
    return this.countryOptions.find(item => item.iso2 === String(iso2).toUpperCase()) || {};
  };

  setupDialCodeInput = () => {
    if (!this.showDialCodeInput || !this.element?.parentElement) return;

    this.parentElement = this.element.parentElement;
    this.parentPosition = this.parentElement.style.position || '';
    this.inputPaddingLeft = this.element.style.paddingLeft || '';

    if (window.getComputedStyle(this.parentElement).position === 'static') {
      this.parentElement.style.position = 'relative';
      this.needRestoreParentPosition = true;
    }

    this.dialCodeTrigger = document.createElement('div');
    this.dialCodeTrigger.className = 'mdIntlTelDialCodeTrigger';
    this.dialCodeTrigger.setAttribute('role', 'button');
    this.dialCodeTrigger.tabIndex = this.element.disabled ? -1 : 0;
    this.dialCodeTrigger.style.cssText = [
      'position:absolute',
      'padding-left:12px',
      'top:0',
      'display:flex',
      'align-items:center',
      'gap:4px',
      'padding-right:4px',
      'cursor:pointer',
      'z-index:2',
      'user-select:none',
      'line-height:normal',
    ].join(';');

    this.dialCodeLabel = document.createElement('span');
    this.dialCodeLabel.className = 'mdIntlTelDialCodeLabel';

    const arrow = document.createElement('span');
    arrow.className = 'mdIntlTelDialCodeArrow';
    arrow.style.cssText = 'font-size:12px;line-height:1;';
    arrow.textContent = '▾';

    this.dialCodeTrigger.appendChild(this.dialCodeLabel);
    this.dialCodeTrigger.appendChild(arrow);
    this.parentElement.appendChild(this.dialCodeTrigger);
  };

  updateDialCodeInput = () => {
    if (!this.showDialCodeInput || !this.dialCodeLabel || !this.element) return;

    const inputRect = this.element.getBoundingClientRect();
    const inputHeight = Math.ceil(inputRect.height || this.element.offsetHeight || 0);
    const inputOffsetTop = this.element.offsetTop || 0;

    if (inputHeight > 0) {
      this.dialCodeTrigger.style.top = `${inputOffsetTop}px`;
      this.dialCodeTrigger.style.height = `${inputHeight}px`;
    }

    this.dialCodeLabel.textContent = this.code || getDefaultCode(this.defaultCountry);
    const triggerWidth = Math.ceil(this.dialCodeTrigger?.getBoundingClientRect().width || 0);
    this.element.style.paddingLeft = `${triggerWidth + this.dialCodeInputGap}px`;
  };

  teardownDialCodeInput = () => {
    if (!this.showDialCodeInput || !this.element) return;

    this.element.style.paddingLeft = this.inputPaddingLeft;

    if (this.dialCodeTrigger?.parentNode) {
      this.dialCodeTrigger.parentNode.removeChild(this.dialCodeTrigger);
    }

    this.dialCodeTrigger = null;
    this.dialCodeLabel = null;

    if (this.needRestoreParentPosition && this.parentElement) {
      this.parentElement.style.position = this.parentPosition;
    }

    this.parentElement = null;
    this.needRestoreParentPosition = false;
  };

  getRawInputValue = () => {
    return String(this.element?.value || '').trim();
  };

  getNumber = (inputValue = this.getRawInputValue()) => {
    const raw = String(inputValue || '').trim();
    if (!raw) return '';
    if (raw.startsWith('+')) return raw.replace(/\s+/g, '');
    const localNumber = this.instance.getNumber(raw);
    return `${this.code || getDefaultCode(this.defaultCountry)}${localNumber}`;
  };

  setNumber = value => {
    const raw = String(value || '').trim();
    const parsed = parseFullNumberInput({
      inputValue: raw,
      defaultCountry: this.defaultCountry,
      fallbackCode: this.code,
    });

    if (parsed) {
      this.code = parsed.code;
      this.updateDialCodeInput();

      if (this.element) {
        this.element.value = parsed.numberValue;
      }

      return parsed.e164;
    }

    this.code = parseDialCode({ value: raw, defaultCountry: this.defaultCountry, currentCode: this.code });
    this.updateDialCodeInput();

    if (this.element) {
      this.element.value = raw.startsWith(this.code) ? raw.slice(this.code.length) : raw;
    }

    return this.getNumber(raw);
  };

  setCountry = iso2 => {
    if (!iso2) return;
    const target = this._getCountryByIso2(iso2);

    if (target.code) {
      this.code = target.code;
      this.updateDialCodeInput();
    }
  };

  setCode = code => {
    if (!code) return;
    this.code = String(code).startsWith('+') ? String(code) : `+${code}`;
    this.updateDialCodeInput();
  };

  getSelectedCountryData = () => {
    const target = this._getCountryByCode(this.code);
    return {
      name: target.localName || '',
      iso2: (target.iso2 || '').toLowerCase(),
      dialCode: String(target.dialCode || '').replace(/^\+/, ''),
    };
  };

  isValidNumber = (value = this.getNumber()) => {
    return this.instance.isValidNumber(value);
  };

  destroy = () => {
    if (this.element) {
      this.element.removeEventListener('input', this.handleElementInput, true);
      this.element.removeEventListener('change', this.handleElementInput, true);
    }

    this.instance?._destroy?.();
    this.teardownDialCodeInput();
  };
}

export const MDIntlTelInput = (element, options = {}) => {
  return new IntlTelInputAdapter(element, options);
};

export default DialCodeSelectInstance;
