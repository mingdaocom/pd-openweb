import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';
import UserHead from 'src/pages/feed/components/userHead';
import Structure from 'src/api/structure';
import 'src/components/dialogSelectUser/dialogSelectUser';
import './style.less';
import SelectUser from '../../../approval/components/SelectUser/SelectUser';
import { FormError } from '../lib';

class UserPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * current value
       */
      value: this.props.value || null,
      /**
       * button label
       */
      label: this.props.label || null,
      /**
       * value error
       */
      error: false,
      // dirty
      dirty: false,
      // show error
      showError: false,
      selectType: this.props.selectType || 0,
    };
  }

  componentDidMount() {
    // check init value
    this.checkValue(this.state.value, false);
  }

  componentWillReceiveProps(nextProps) {
    // apply label update
    if (nextProps.label !== this.props.label) {
      const label = nextProps.label && nextProps.label.length ? nextProps.label.toString() : '';

      this.setState({
        label,
      });
    }
    // apply value update
    if (nextProps.value !== this.props.value) {
      this.setState({
        value: nextProps.value,
      });
    }
    // showError changed
    if (nextProps.showError !== this.props.showError) {
      this.setState({
        showError: this.state.dirty || nextProps.showError,
      });
    }
  }

  /**
   * check value
   * @param {any} value - current value
   * @param {bool} dirty - value ever changed
   */
  checkValue = (value, dirty) => {
    const error = {
      type: '',
      message: '',
      dirty,
    };

    // required
    if (this.props.required && (!value || (_.isArray(value) && !value.length))) {
      error.type = FormError.types.REQUIRED;
    }

    if (error.type) {
      // fire onError callback
      if (this.props.onError) {
        this.props.onError(error);
      }
    } else {
      // fire onValid callback
      if (this.props.onValid) {
        this.props.onValid();
      }
    }

    // update state.error
    this.setState({
      error: !!error.type,
      dirty,
      showError: dirty || this.props.showError,
    });
  };

  /**
   * 选择用户
   */
  pickUser = () => {
    const { moduleType } = this.props;
    if (this.props.disabled) {
      return;
    }

    const projectId = window.localStorage.getItem('plus_projectId') || '';
    // open pick modal
    if (this.props.type === 'leader') {
      $({}).dialogSelectUser({
        title: _l('选择直属上司'),
        showMoreInvite: false,
        SelectUserSettings: {
          projectId,
          filterAll: true,
          filterFriend: true,
          filterOthers: true,
          filterOtherProject: true,
          unique: true,
          showTabs: ['structureUsers'],
          extraTabs: [
            {
              id: 'structureUsers',
              name: '所有人',
              type: 4,
              page: true,
              actions: {
                getUsers: (args) => {
                  args = $.extend({}, args, {
                    accountId: this.props.accountId,
                    projectId,
                    isSetParent: true,
                  });
                  return Structure.getAllowChooseUsers(args);
                },
              },
            },
          ],
          callback: (data) => {
            const value = data[0];
            if (this.state.value !== value) {
              this.checkValue(value, true);

              // update state.value
              this.setState({
                value,
              });

              // fire onChange callback
              if (this.props.onChange) {
                this.props.onChange(null, value, {
                  prevValue: this.state.value,
                });
              }
            }
          },
        },
      });
    } else {
      if (this.props.moduleType === 'workflow') {
        const { projectId } = this.props;
        $({}).dialogSelectUser({
          title: _l('请选择'),
          showMoreInvite: false,
          SelectUserSettings: {
            projectId: projectId || '',
            filterAccountIds: this.state.value ? this.state.value.map(item => item.accountId) : [],
            unique: !this.props.selectType,
            callback: (data) => {
              const value = this.props.selectType === 1 ? data.concat(this.state.value || []) : data;
              if (!_.isEqual(this.state.value, value)) {
                this.checkValue(value, true);
                // update state.value
                this.setState({
                  value,
                });

                // fire onChange callback
                if (this.props.onChange) {
                  this.props.onChange(null, value, {
                    prevValue: this.state.value,
                  });
                }
              }
            },
          },
        });
      } else if (this.props.moduleType === 'workSheet') {
        const { projectId } = this.props;
        $(this.pickuserBtn).quickSelectUser({
          showQuickInvite: false,
          showMoreInvite: false,
          isTask: false,
          prefixAccounts: [
            {
              accountId: md.global.Account.accountId,
              fullname: _l('我自己'),
              avatar: md.global.Account.avatar,
            },
          ],
          filterAccountIds: [],
          offset: {
            top: 16,
            left: 0,
          },
          zIndex: 10001,
          SelectUserSettings: {
            unique: this.props.selectType === 0,
            projectId: projectId || '',
            filterAccountIds: [],
            callback: (users) => {
              const oldValue = this.state.value || [];
              const value = this.props.selectType === 1 ? users.filter(user => !_.find(oldValue, u => u.accountId === user.accountId)).concat(oldValue) : users;
              if (!_.isEqual(this.state.value, value)) {
                this.checkValue(value, true);
                // update state.value
                this.setState({
                  value,
                });

                // fire onChange callback
                if (this.props.onChange) {
                  this.props.onChange(null, value, {
                    prevValue: this.state.value,
                  });
                }
              }
            },
          },
          selectCb: (users) => {
            const oldValue = this.state.value || [];
            const value = this.props.selectType === 1 ? users.filter(user => !_.find(oldValue, u => u.accountId === user.accountId)).concat(oldValue) : users;
            if (!_.isEqual(this.state.value, value)) {
              this.checkValue(value, true);
              // update state.value
              this.setState({
                value,
              });

              // fire onChange callback
              if (this.props.onChange) {
                this.props.onChange(null, value, {
                  prevValue: this.state.value,
                });
              }
            }
          },
        });
      } else {
        SelectUser(
          _l('请选择'),
          projectId,
          (data) => {
            const value = data[0];
            if (this.state.value !== value) {
              this.checkValue(value, true);

              // update state.value
              this.setState({
                value,
              });

              // fire onChange callback
              if (this.props.onChange) {
                this.props.onChange(null, value, {
                  prevValue: this.state.value,
                });
              }
            }
          },
          false,
          true,
          this.props.exclude,
          false
        );
      }
    }
  };
  bindCardEvent = function ($mdBusinessCard) {
    const _this = this;
    $mdBusinessCard.find('.worksheetMultiUserButton .removeMember').on('click', (e) => {
      const accountId = e.target.parentElement.getAttribute('data-accountid');
      const newValue = _this.state.value.filter(item => item.accountId !== accountId);
      // update state.value
      this.setState({
        value: newValue,
      });
      this.checkValue(newValue, true);
      // fire onChange callback
      if (_this.props.onChange) {
        _this.props.onChange(null, newValue, {
          prevValue: _this.state.value,
        });
      }
    });
  }.bind(this);
  render() {
    const buttonClassList = ['mui-forminput', 'ThemeFocusBorderColor3'];
    if (this.state.error && this.state.showError) {
      buttonClassList.push('mui-forminput-error');
    }
    const buttonClassNames = buttonClassList.join(' ');
    // if (this.props.selectType === 0) {
    //   return (
    //     <div className={cx('mui-userpicker', this.props.className)}>
    //       <button type="button" className={buttonClassNames} disabled={this.props.disabled} onClick={this.pickUser}>
    //         <span className="mui-forminput-label">{this.state.label}</span>
    //         <Icon icon="charger" />
    //       </button>
    //     </div>
    //   );
    // }
    return (
      <div className={cx('mui-userpicker', this.props.className)}>
        {this.props.moduleType !== 'hr' ? (
          <div className={cx('multi', buttonClassNames)} disabled={this.props.disabled}>
            <span className="mui-forminput-label mTop7">
              {this.state.value &&
                this.state.value.map((item, index) => (
                  <UserHead
                    className="userHead InlineBlock mRight6"
                    alwaysBindCard
                    key={index}
                    user={{
                      userHead: item.avatar,
                      accountId: item.accountId,
                    }}
                    size={24}
                    readyFn={this.props.disabled ? null : this.bindCardEvent}
                    showOpHtml
                    opHtml={
                      !this.props.disabled
                        ? `<div class="worksheetMultiUserButton flexRow flex" data-accountid="${item.accountId}">
                      <div class='removeMember flex TxtCenter Gray_9e ThemeHoverColor3 Hand'>${_l('移除人员')}</div>
                    </div>`
                        : ''
                    }
                  />
                ))}
              {!this.props.disabled && (
                <span
                  ref={pickuserBtn => (this.pickuserBtn = pickuserBtn)}
                  className={cx(
                    'Icon icon Font24 Gray_9e ThemeHoverColor3',
                    this.props.selectType === 1 || !this.state.value || !this.state.value.length ? 'icon-task-add-member-circle' : 'icon-task-folder-charge'
                  )}
                  onClick={this.pickUser}
                />
              )}
            </span>
          </div>
        ) : (
          <button type="button" className={buttonClassNames} disabled={this.props.disabled} onClick={this.pickUser}>
            <span className="mui-forminput-label">{this.state.label}</span>
              <Icon icon="charger" />
          </button>
        )}
      </div>
    );
  }
}

UserPicker.propTypes = {
  /**
   * 当前选中的值
   */
  value: PropTypes.any,
  /**
   * 类型
   */
  type: PropTypes.oneOf([
    /**
     * 通用
     */
    'default',
    /**
     * 上司
     */
    'leader',
  ]),
  accountId: PropTypes.string,
  /**
   * Button 显示内容
   */
  label: PropTypes.string,
  /**
   * 是否必填
   */
  required: PropTypes.bool,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 排除列表
   */
  exclude: PropTypes.any,
  /**
   * 显示错误（忽略 error.dirty）
   */
  showError: PropTypes.bool,
  /**
   * 选项改变回调
   * @param {Event} event - 点击事件
   * @param {any} value - 选中的值
   * @param {object} data - 其他数据
   * data.prevValue - 之前的值
   */
  onChange: PropTypes.func,
  /**
   * 【回调】发生错误
   * @param {Error} error - 错误
   * error.type - 错误类型
   * error.dirty - 值是否发生过改变
   */
  onError: PropTypes.func,
  /**
   * 【回调】值有效（与 onError 相反）
   */
  onValid: PropTypes.func,
  className: PropTypes.string,
  moduleType: PropTypes.string,
  selectType: PropTypes.number, // 选人类型，0 单选 1多选
};

UserPicker.defaultProps = {
  value: null,
  type: 'default',
  accountId: '',
  label: '',
  required: false,
  disabled: false,
  exclude: [],
  showError: false,
  onChange: (event, value, item) => {
    //
  },
  onError: (error) => {
    //
  },
  onValid: () => {
    //
  },
  moduleType: 'hr',
};

export default UserPicker;
