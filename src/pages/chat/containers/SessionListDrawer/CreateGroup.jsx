import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Dropdown, Menu } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import * as actions from 'src/pages/chat/redux/actions';
import { createDiscussion } from 'src/pages/chat/utils/group';
import createGroup from 'src/pages/Group/createGroup';

const CreateWrap = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  position: absolute;
  bottom: 24px;
  right: 8px;
  background: #1677ff;
  box-shadow: 0px 3px 12px 1px rgba(0, 0, 0, 0.24);
  .icon {
    transition: 0.3s;
  }
  &:hover .icon {
    transform: rotate(45deg);
  }
`;

const CreateGroup = props => {
  const handleAddSession = () => {
    createDiscussion(undefined, (result, isGroup) => {
      if (isGroup) {
        // const message = {
        //   count: 0,
        //   msg: {
        //     con: `${_l('我')}：${_l('聊天创建成功')}`,
        //   },
        // };
        // this.props.dispatch(actions.setCurrentSessionId(result.groupId, message));
      } else {
        const { accountId, avatar, fullname } = result[0];
        const msg = {
          logo: avatar,
          uname: fullname,
          sysType: 1,
        };
        props.addUserSession(accountId, msg);
      }
    });
  };

  return (
    <Fragment>
      <Dropdown
        placement="topRight"
        overlay={
          <Menu style={{ width: 180, padding: '8px 0' }}>
            <Menu.Item key="addSession" style={{ padding: '7px 12px' }} onClick={handleAddSession}>
              <div className="flexRow alignItemsCenter">
                <Icon icon="task-reply-msg" className="Gray_75 Font18 mRight10" />
                <div>{`${_l('发起聊天')} (Q)`}</div>
              </div>
            </Menu.Item>
            <Menu.Item key="createGroup" style={{ padding: '7px 12px' }} onClick={() => createGroup({})}>
              <div className="flexRow alignItemsCenter">
                <Icon icon="group" className="Gray_75 Font20 mRight10" />
                <div>{_l('创建群组')}</div>
              </div>
            </Menu.Item>
          </Menu>
        }
      >
        <CreateWrap className="flexRow alignItemsCenter justifyContentCenter pointer">
          <Icon icon="add" className="Font30 White" />
        </CreateWrap>
      </Dropdown>
    </Fragment>
  );
};

export default connect(
  () => ({}),
  dispatch => bindActionCreators(_.pick(actions, ['addUserSession']), dispatch),
)(CreateGroup);
