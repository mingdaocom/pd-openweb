import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, Dropdown } from 'ming-ui';
import { rolePropType } from './config';

import styles from './style.less?module';
const { roleDialog: roleDialogClassName, roleDialogDangerTitle, roleSelect } = styles;

const TYPES = {
  DELETE: 1,
  DELETE_WITH_USER: 2,
  REMOVE_USER: 3,
  EXIT: 4,
  MOVE_USER: 5,
};

const TITLE = {
  [TYPES.DELETE]: <div className={roleDialogDangerTitle}>{_l('你确认删除此角色吗？')}</div>,
  [TYPES.DELETE_WITH_USER]: <div className={roleDialogDangerTitle}>{_l('你确认删除此角色吗？')}</div>,
  [TYPES.REMOVE_USER]: _l('你确认移出选中的用户吗？'),
  [TYPES.EXIT]: <div className={roleDialogDangerTitle}>{_l('你确认离开当前角色吗？')}</div>,
  [TYPES.MOVE_USER]: _l('移动到其他角色'),
};

const btnProps = {
  [TYPES.DELETE]: { okText: _l('删除'), buttonType: 'danger' },
  [TYPES.DELETE_WITH_USER]: { okText: _l('移动并删除'), buttonType: 'danger' },
  [TYPES.EXIT]: { okText: _l('退出'), buttonType: 'danger' },
};

export default class extends React.PureComponent {
  static TYPES = TYPES;

  static propTypes = {
    type: PropTypes.oneOf(_.values(TYPES)),
    onOk: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,

    roleList: PropTypes.arrayOf(rolePropType),
  };

  static defaultProps = {};

  state = {
    selectedRole: null,
  };

  renderContent() {
    const { type, roleList } = this.props;
    const { selectedRole } = this.state;
    if (type === TYPES.MOVE_USER || type === TYPES.DELETE_WITH_USER) {
      const props = {
        className: 'w100',
        border: true,
        isAppendToBody: true,
        menuClass: 'roleDialogDropdownMenu',
        data: _.map(roleList, ({ roleId, name }) => ({ value: roleId, text: name })),
        value: selectedRole,
        noData: _l('暂无可选的角色'),
        onChange: value => {
          this.setState({
            selectedRole: value,
          });
        },
      };
      return (
        <React.Fragment>
          {type === TYPES.DELETE_WITH_USER ? (
            <div className="mBottom10 Gray_75">{_l('请将当前角色下包含的用户移动到其他角色中')}</div>
          ) : null}
          <div className={roleSelect}>
            <span className="mRight15" style={{ whiteSpace: 'nowrap' }}>
              {_l('移动到')}
            </span>
            <Dropdown {...props} />
          </div>
        </React.Fragment>
      );
    }
  }

  handleMoveUser = () => {
    const { selectedRole } = this.state;
    const { roleList, onOk } = this.props;
    const firstRole = (roleList && roleList.length && roleList[0].roleId) || '';
    return onOk(selectedRole || firstRole);
  };

  handleOk = () => {
    const { onOk } = this.props;
    return onOk();
  };

  render() {
    const { type, onCancel } = this.props;
    const dialogProps = {
      ...(btnProps[type] || {}),
      title: TITLE[type],
      visible: true,
      dialogClasses: roleDialogClassName,
      onCancel,
      action: type === TYPES.MOVE_USER || type === TYPES.DELETE_WITH_USER ? this.handleMoveUser : this.handleOk,
    };

    return <Dialog {...dialogProps}>{this.renderContent()}</Dialog>;
  }
}
