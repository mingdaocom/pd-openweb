
import React from 'react';
class Dropdown {
  /**
   * constructor
   * @param {*} target - target element selector
   * @param {*} options - Dropdown options
   * @param {*} multipleLevel - is multiple level menu
   * @param {*} onChange - onChange callback
   */
  constructor(target, options, multipleLevel, onChange) {
    if (!target) {
      return new Error('Argument target is empty!');
    }

    let defaultOnChange = item => {};

    this.target = target;
    this.defaultOptions = options || [];
    this.multipleLevel = multipleLevel || false;
    this.onChange = onChange || defaultOnChange;
  }

  init() {
    // selected item
    this.selectedItem = null;

    let value = $(this.target).attr('value');
    if (value) {
      try {
        this.selectedItem = JSON.parse(value);
        this.selectedItem.label = JSON.parse(this.selectedItem.label);
      } catch (e) {}
    }
    // stack list
    this.list = [];
    // current options
    this.options = this.defaultOptions;
    // hint text
    this.hintText = $(this.target).data('hint') || _l('请选择');
    // menu opened
    this.menuOpened = false;

    this.render();
  }

  clickListener = e => {
    this.toggleMenuOpened();
  };

  itemClickListener = e => {
    let target = null;
    switch (e.target.nodeName) {
      case 'SPAN':
      case 'I':
        target = e.target.parentNode;

        break;
      case 'LI':
        target = e.target;

        break;
      default:
        break;
    }
    if (!target) {
      return;
    }

    if (target.nodeName === 'LI') {
      if ($(target).attr('data-index')) {
        let index = $(target).data('index');

        const item = this.options[index];
        let labels = this.list.map((_item, i, list) => {
          return _item.label;
        });

        if (!item) return;

        labels.push(item.label);

        this.itemOnClick(e, item, {
          value: item.value,
          label: labels,
        });
      } else if ($(target).hasClass('back')) {
        this.back(e);
      }
    }
  };

  keyDownListener = e => {
    if (
      e.keyCode === 27 && // ESC
      this.menuOpened
    ) {
      this.hideMenu();
    }
  };

  toggleMenuOpened() {
    this.menuOpened = !this.menuOpened;

    this.render();
  }

  hideMenu() {
    this.menuOpened = false;

    this.render();
  }

  itemOnClick = (e, item, data) => {
    e.preventDefault();
    e.stopPropagation();

    if (item.disabled) {
      return;
    }

    $(this.target)
      .closest('.customContents')
      .find('.customFieldsLabel')
      .removeClass('error');
    $(this.target)
      .closest('.customDetailSingle')
      .find('.detailControlName')
      .removeClass('error');

    let list = this.list;
    let options = this.options;

    if (this.multipleLevel && item.items && item.items.length) {
      list.push(item);
      options = item.items;
    } else {
      if (this.selectedItem && item.value === this.selectedItem.value) {
        return;
      } else {
        this.onChange(e, data);

        this.menuOpened = false;
      }
    }

    this.selectedItem = data;
    this.options = options;
    this.list = list;

    this.render();
  };

  back = e => {
    e.preventDefault();
    e.stopPropagation();

    let list = this.list;
    list.pop();

    let options = [];
    if (list.length > 0) {
      options = list[list.length - 1].items;
    } else {
      options = this.defaultOptions;
    }

    this.list = list;
    this.options = options;

    this.render();
  };

  emptyClickListener = e => {
    if (!this.target.contains(e.target)) {
      this.hideMenu();
    }
  };

  start() {
    this.init();

    $(this.target).on('click', '.dropdownBtn', this.clickListener);

    $(this.target).on('click', 'li', this.itemClickListener);

    window.addEventListener('mousedown', this.emptyClickListener, false);

    window.addEventListener('keydown', this.keyDownListener, false);
  }

  stop() {
    $(this.target).off('click', '.dropdownBtn', this.clickListener);

    $(this.target).off('click', 'li', this.itemClickListener);

    window.removeEventListener('mousedown', this.emptyClickListener, false);

    window.removeEventListener('keydown', this.keyDownListener, false);
  }

  renderList() {
    if (!this.menuOpened) {
      return '';
    } else {
      let menuNav = '';
      let divider = '';
      if (this.multipleLevel) {
        divider = `
          <li
              class="divider"></li>
        `;
        if (this.list.length < 1) {
          menuNav = `
            <li
                class="dropdownNav">${this.hintText}</li>
          `;
        } else {
          menuNav = `
            <li
                class="dropdownNav back">
              <i
                  class="ming Icon icon icon-arrow-left-border"></i>
              <span>返回</span>
            </li>
          `;
        }
      }

      let menuItems = this.options.map((item, i, list) => {
        if (item.type && item.type === 'header') {
          return `
                <li class="dropdownHeader" title=${item.label}>${item.label}</li>
              `;
        } else if (item.type && item.type === 'divider') {
          return `
                <li class="divider"  title=${item.label}></li>
              `;
        } else {
          let className = '';
          if (!(this.multipleLevel && item.items && item.items.length) && this.selectedItem && item.value === this.selectedItem.value) {
            className = 'active';
          }
          if (item.disabled) {
            className = 'disabled';
          }

          let icon = '';
          if (this.multipleLevel && item.items && item.items.length && !item.disabled) {
            icon = `
                  <i
                      class="ming Icon icon icon-arrow-right-border"></i>
                `;
          }

          return `
                <li
                  class="${className} ThemeBGColor3"
                  data-index="${i}"
                  title="${item.label}"
                >
                  <span>${item.label}</span>
                  ${icon}
                </li>
              `;
        }
      });

      return `
        <ul
            class="dropdownMenu">
          ${menuNav}
          ${divider}
          <div class="scroll">
            ${menuItems.join('')}
          </div>
        </ul>
      `;
    }
  }

  getLabel = () => {
    if (this.selectedItem.label && this.selectedItem.label.join) {
      return this.selectedItem.label.join(' / ');
    } else {
      return this.selectedItem.label;
    }
  };

  render() {
    $(this.target).empty();
    $(this.target).removeClass('view');
    $(this.target).data('value', '');

    this.hasAuth = $(this.target).data('hasauth');
    this.selectedId = $(this.target).data('type');

    if (this.hasAuth === false) {
      let label = this.selectedItem && this.selectedItem.label ? this.getLabel() : '未选择';
      $(this.target).addClass('view').html(`
            <span class="text">${label}</span>
          `);
    } else {
      if (this.menuOpened) {
        $(this.target).addClass('open');
      } else {
        $(this.target).removeClass('open');
      }

      let content = '';

      // toggle button
      let buttonContent = this.hintText;
      let emptyClass = 'empty';
      if (this.selectedItem && this.selectedItem.label) {
        buttonContent = this.getLabel();
        emptyClass = '';
      }

      content += `
        <button class="dropdownBtn ThemeHoverBorderColor4 ${emptyClass}">
          <span>${buttonContent}</span>
          <i class="icon-arrow-down-border"></i>
        </button>
      `;

      // list
      content += this.renderList();

      if (this.selectedItem && this.selectedItem.value) {
        let value = {
          value: this.selectedItem.value,
          label: this.getLabel(),
        };

        $(this.target).data('value', JSON.stringify(value));
      }
      $(this.target).html(content);
    }
  }
}

export default Dropdown;
