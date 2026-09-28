import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Modal, Radio, Select } from 'ming-ui/antd-components';
import { rolePropType } from 'src/pages/Role/config';

const Wrap = styled.div`
  .roleSelect {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin-bottom: 16px;
  }
`;

const DELETE_TYPES = {
  DELETE: 1,
  MOVE: 2,
};

const DANGER_BUTTON_PROPS = { danger: true };

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
        <span className={cx('mRight15 textSecondary mLeft30')} style={{ whiteSpace: 'nowrap' }}>
          {_l('移动到')}
        </span>
        <Select {...props} />
      </div>
    );
  }

  renderContent() {
    const { roleList } = this.props;
    const { selectedRole, deleteType } = this.state;
    const props = {
      className: 'w100',
      placeholder: _l('请选择角色'),
      classNames: { popup: { root: 'roleDialogDropdownMenu' } },
      options: _.map(roleList, ({ roleId, name }) => ({ value: roleId, label: name })),
      value: selectedRole,
      notFoundContent: _l('暂无可选的角色'),
      onChange: value => {
        this.setState({
          selectedRole: value,
        });
      },
    };
    return (
      <Wrap>
        <React.Fragment>
          <div className="mBottom16 textSecondary">{_l('如何安排此角色下的用户')}</div>
          <Radio
            className="Bold mBottom16"
            checked={deleteType === DELETE_TYPES.MOVE}
            onChange={() =>
              this.setState({
                deleteType: DELETE_TYPES.MOVE,
              })
            }
            title={_l('同时将此角色下的所有用户移动到其他角色')}
          >
            {_l('同时将此角色下的所有用户移动到其他角色')}
          </Radio>
          {deleteType === DELETE_TYPES.MOVE && this.renderMove(props)}
          <Radio
            className="Bold"
            checked={deleteType === DELETE_TYPES.DELETE}
            onChange={() =>
              this.setState({
                deleteType: DELETE_TYPES.DELETE,
              })
            }
            title={_l('同时删除此角色下的所有用户')}
          >
            {_l('同时删除此角色下的所有用户')}
          </Radio>
        </React.Fragment>
      </Wrap>
    );
  }

  handleMoveUser = () => {
    const { selectedRole, deleteType } = this.state;
    const { roleList, onOk } = this.props;

    if (deleteType === DELETE_TYPES.MOVE && !selectedRole) {
      alert(_l('请选择要移动到的角色'));
      return;
    }

    const firstRole = (roleList && roleList.length && roleList[0].roleId) || '';
    return onOk(deleteType === DELETE_TYPES.MOVE ? selectedRole || firstRole : '');
  };

  render() {
    const { onCancel } = this.props;

    return (
      <Modal
        width={480}
        open
        title={<span className="textError">{_l('你确认删除此角色吗？')}</span>}
        okText={_l('删除')}
        okButtonProps={DANGER_BUTTON_PROPS}
        mask={{ closable: true }}
        keyboard
        onCancel={onCancel}
        onOk={this.handleMoveUser}
      >
        {this.renderContent()}
      </Modal>
    );
  }
}
