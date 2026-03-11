import React from 'react';
import styled from 'styled-components';
import Config from '../../../config';
import RoleList from '../roleList';

const Wrap = styled.div`
  border-radius: 4px;
  flex: 1;
  min-height: 0;
  background-color: var(--color-background-primary);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .roleAuthHeader {
    height: 56px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-border-secondary);
    box-sizing: border-box;
    .detailTitle {
      display: flex;
      align-items: center;
    }
    .menuTab {
      display: flex;
      height: 100%;
      li {
        height: 100%;
        display: flex;
        align-items: center;
        border-bottom: 2px solid transparent;
        margin-right: 4px;
        padding: 0 16px;
        &:hover {
          background-color: var(--color-background-hover);
        }
        a {
          font-weight: 600;
          color: var(--color-text-title) !important;
          font-size: 17px;
        }
        &.menuTab-active {
          border-bottom-color: var(--color-primary);
          a {
            color: var(--color-primary) !important;
          }
        }
      }
    }
  }
  .roleAuthContent {
    flex: 1;
    min-height: 0;
  }
`;

export default class ApplyRole extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Wrap>
        <div className="roleAuthHeader">
          <div className="detailTitle">
            <span className="Font17 Bold">{_l('申请角色权限')}</span>
          </div>
        </div>
        <div className="roleAuthContent pLeft24 pRight24">
          <RoleList entry="apply" projectId={Config.projectId} authority={this.props.authority} />
        </div>
      </Wrap>
    );
  }
}
