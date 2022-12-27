
import SelectUser from 'src/pages/hr/approval/components/SelectUser/SelectUser';

class CustomUserList {
  constructor(target, multiple) {
    /**
     * 元素 ID
     */
    this.target = target;
    /**
     * 是否为多选模式
     */
    this.multiple = multiple;
  }

  init() {
    this.users = [];
    let value = $(this.target).attr('value');
    if (value) {
      try {
        this.users.push(JSON.parse(value));
      } catch (e) {}
    }
    this.btnTpl = `
      <span class="buttonAdd ThemeColor3">
        <i class="icon-task-add-member-circle"></i>
      </span>
    `;
    this.userPillTpl = `
      <div
          class="userPill">
        <img
            class="avatar userAvatar"
            data-accountid={ accountId }
            src="{ avatar }" />
        <span
            class="name">{ name }</span>
        <div
            class="closeBtn"
            data-id={ accountId }>
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
    $(this.target).on('click', '.buttonAdd', this.addBtnClickListener);
  }

  stopAddBtnClickListener() {
    $(this.target).off('click', '.buttonAdd', this.addBtnClickListener);
  }

  addBtnClickListener = e => {
    this.pickUser();
  };

  pickUser = () => {
    let projectId = window.localStorage.getItem('plus_projectId') || '';
    // open pick modal
    SelectUser(
      _l('选择人员'),
      projectId,
      data => {
        data.map((item, i, list) => {
          if (!this.userInList(item)) {
            this.users.push(item);
          }

          return null;
        });

        this.render();
      },
      true,
      true,
      [],
      false
    );
  };

  /**
   * 判断用户是否已选中
   * @param {*} item - 用户
   */
  userInList(item) {
    for (let i in this.users) {
      let user = this.users[i];

      if (user.accountId === item.accountId) {
        return true;
      }
    }

    return false;
  }

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

    this.removeUser($(target).data('id'));
  };

  /**
   * 从已选中的列表中删除用户
   * @param {*} userId - 用户 ID
   */
  removeUser(userId) {
    for (let i in this.users) {
      let user = this.users[i];

      if (user.accountId === userId) {
        this.users.splice(i, 1);

        this.render();

        return;
      }
    }
  }

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
    $(this.target).data('users', '');

    if (this.hasAuth === false) {
      let userName = '';
      if (this.users && this.users.length && this.users[0].fullname) {
        userName = this.users[0].fullname;
      }

      $(this.target).append(`
        <span class="text customText">${userName}</span>
      `);
    } else {
      if (this.multiple || !this.users.length) {
        $(this.target).append(this.btnTpl);
      }

      // let ids = [];

      let list = this.users.map((item, i, items) => {
        // ids.push(item.accountId);

        return this.userPillTpl
          .replace('{ avatar }', item.avatar)
          .replace('{ name }', item.fullname)
          .replace('data-accountid={ accountId }', `data-accountid=${item.accountId}`)
          .replace('data-id={ accountId }', `data-id=${item.accountId}`);
      });

      $(this.target).append(list);
      // $(this.target).data('users', ids.join(','));
      // TODO 直接存储完整用户数据（用于展示），仅支持单选
      if (this.users && this.users.length) {
        let user = {
          accountId: this.users[0].accountId,
          fullname: this.users[0].fullname,
          avatar: this.users[0].avatar,
        };

        $(this.target).data('users', JSON.stringify(user));
      }
    }
  }
}

export default CustomUserList;
