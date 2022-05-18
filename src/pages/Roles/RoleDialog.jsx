import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, Dropdown, Radio } from 'ming-ui';
import { rolePropType } from './config';
import cx from 'classnames';
import styles from './style.less?module';
const { roleDialog: roleDialogClassName, roleDialogDangerTitle, roleSelect } = styles;

const TYPES = {
  DELETE: 1,
  DELETE_WITH_USER: 2,
  REMOVE_USER: 3,
  EXIT: 4,
  MOVE_USER: 5,
};

const DELETE_TYPES = {
  DELETE: 1,
  MOVE: 2,
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
  [TYPES.DELETE_WITH_USER]: { okText: _l('删除'), buttonType: 'danger' },
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
    deleteType: DELETE_TYPES.MOVE,
  };

  renderMove(props) {
    return (
      <div className={roleSelect}>
        <span
          className={cx('mRight15 Gray_75', { mLeft30: this.props.type === TYPES.DELETE_WITH_USER })}
          style={{ whiteSpace: 'nowrap' }}
        >
          {_l('移动到')}
        </span>
        <Dropdown {...props} />
      </div>
    );
  }

  renderContent() {
    const { type, roleList } = this.props;
    const { selectedRole, deleteType } = this.state;
    if (type === TYPES.MOVE_USER || type === TYPES.DELETE_WITH_USER) {
      const props = {
        className: 'w100',
        border: true,
        isAppendToBody: true,
        placeholder: _l('请选择角色'),
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
            <React.Fragment>
              <div className="mBottom16 Gray_75">{_l('如何安排此角色下的用户')}</div>
              <Radio
                className="Bold Block mBottom16"
                text={_l('同时将此角色下的所有用户移动到其他角色')}
                checked={deleteType === DELETE_TYPES.MOVE}
                onClick={() => this.setState({ deleteType: DELETE_TYPES.MOVE })}
              />
              {deleteType === DELETE_TYPES.MOVE && this.renderMove(props)}
              <Radio
                className="Bold Block"
                text={_l('同时删除此角色下的所有用户')}
                checked={deleteType === DELETE_TYPES.DELETE}
                onClick={() => this.setState({ deleteType: DELETE_TYPES.DELETE })}
              />
            </React.Fragment>
          ) : (
            this.renderMove(props)
          )}
        </React.Fragment>
      );
    }
  }

  handleMoveUser = () => {
    const { selectedRole, deleteType } = this.state;
    const { roleList, onOk, type } = this.props;
    if (type === TYPES.DELETE_WITH_USER && deleteType === DELETE_TYPES.MOVE && !selectedRole) {
      alert('请选择要移动到的角色');
      return;
    }
    const firstRole = (roleList && roleList.length && roleList[0].roleId) || '';
    return onOk(deleteType === DELETE_TYPES.MOVE ? selectedRole || firstRole : '');
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
      onOk: type === TYPES.MOVE_USER || type === TYPES.DELETE_WITH_USER ? this.handleMoveUser : this.handleOk,
    };

    return <Dialog {...dialogProps}>{this.renderContent()}</Dialog>;
  }
}
