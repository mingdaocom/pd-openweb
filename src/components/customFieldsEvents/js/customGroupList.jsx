import $ from 'jquery';
import React from 'react';
import DialogSelectGroups from 'src/components/dialogSelectDept';

class CustomGroupList {
  constructor(target) {
    /**
     * 元素 ID
     */
    this.target = target;
  }

  init() {
    this.group = null;
    let value = $(this.target).attr('value');
    if (value) {
      try {
        this.group = JSON.parse(value);
      } catch (e) {}
    }
    this.btnTpl = `
      <button
          class="transparentBtn ThemeColor3">
        <i
            class="ming Icon icon icon-plus"></i>
        <span>选择部门</span>
      </button>
    `;
    this.textPillTpl = `
      <div
          class="textPill">
        <span>{ text }</span>
        <div
            class="closeBtn"
            data-id={ id }>
          <i
              class="ming Icon icon icon-close"></i>
        </div>
      </div>
    `;

    this.hasAuth = $(this.target).data('hasauth');

    this.render();
  }

  /**
   * 开始事件监听
   */
  start() {
    this.init();

    // events
    this.startAddBtnClickListener();
    this.startRemoveBtnClickListener();
  }

  /**
   * 取消事件监听
   */
  stop() {
    // events
    this.stopAddBtnClickListener();
    this.stopRemoveBtnClickListener();
  }

  startAddBtnClickListener() {
    $(this.target).on('click', '.transparentBtn', this.addBtnClickListener);
  }

  stopAddBtnClickListener() {
    $(this.target).off('click', '.transparentBtn', this.addBtnClickListener);
  }

  addBtnClickListener = e => {
    this.pickGroup();
  };

  pickGroup = () => {
    const projectId = window.localStorage.getItem('plus_projectId') || '';
    // open pick modal
    DialogSelectGroups({
      projectId: projectId,
      selectFn: data => {
        this.group = data[0];

        this.render();
      },
    });
  };

  startRemoveBtnClickListener() {
    $(this.target).on('click', '.closeBtn', this.removeBtnClickListener);
  }

  stopRemoveBtnClickListener() {
    $(this.target).off('click', '.closeBtn', this.removeBtnClickListener);
  }

  removeBtnClickListener = e => {
    // get btn as target
    let target = e.target;
    while (!$(target).hasClass('closeBtn')) {
      target = target.parentNode;
    }

    this.group = null;
    this.render();
  };

  /**
   * 渲染列表
   */
  render() {
    $(this.target).empty();
    $(this.target)
      .closest('.customContents')
      .find('.customFieldsLabel')
      .removeClass('error');
    $(this.target)
      .closest('.customDetailSingle')
      .find('.detailControlName')
      .removeClass('error');
    $(this.target).data('group', '');

    if (this.hasAuth === false) {
      let groupName = '';
      if (this.group && this.group.departmentName) {
        groupName = this.group.departmentName;
      }

      $(this.target).append(`
        <span class="text customText">${groupName}</span>
      `);
    } else {
      if (!this.group) {
        $(this.target).append(this.btnTpl);
      } else {
        let list = this.textPillTpl.replace('{ text }', this.group.departmentName);

        $(this.target).append(list);
        $(this.target).data('group', JSON.stringify(this.group));
      }
    }
  }
}

export default CustomGroupList;
