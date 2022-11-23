import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, Dropdown, Radio } from 'ming-ui';
import { rolePropType } from 'src/pages/Role/config';
import cx from 'classnames';
import styled from 'styled-components';

const Wrap = styled.div`
  .roleSelect {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin-bottom: 16px;

    :global(.Dropdown--input) {
      padding-left: 15px;
    }
  }

  .roleDialogDangerTitle {
    color: @dangerColor;
  }
`;

const DELETE_TYPES = {
  DELETE: 1,
  MOVE: 2,
};

export default class extends React.PureComponent {
  static propTypes = {
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
      <div className={'roleSelect'}>
        <span className={cx('mRight15 Gray_75 mLeft30')} style={{ whiteSpace: 'nowrap' }}>
          {_l('移动到')}
        </span>
        <Dropdown {...props} />
      </div>
    );
  }

  renderContent() {
    const { roleList } = this.props;
    const { selectedRole, deleteType } = this.state;
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
      <Wrap>
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
      </Wrap>
    );
  }

  handleMoveUser = () => {
    const { selectedRole, deleteType } = this.state;
    const { roleList, onOk } = this.props;
    if (deleteType === DELETE_TYPES.MOVE && !selectedRole) {
      alert('请选择要移动到的角色');
      return;
    }
    const firstRole = (roleList && roleList.length && roleList[0].roleId) || '';
    return onOk(deleteType === DELETE_TYPES.MOVE ? selectedRole || firstRole : '');
  };

  render() {
    const { onCancel } = this.props;
    const dialogProps = {
      okText: _l('删除'),
      buttonType: 'danger',
      title: <div className={'roleDialogDangerTitle'}>{_l('你确认删除此角色吗？')}</div>,
      visible: true,
      dialogClasses: 'roleDialogClassName',
      onCancel,
      onOk: this.handleMoveUser,
    };

    return <Dialog {...dialogProps}>{this.renderContent()}</Dialog>;
  }
}
