import React, { Fragment } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { NavLink, withRouter } from 'react-router-dom';
import { menuGroup } from './router.config';
import { navigateTo } from 'src/router/navigateTo';
import qs from 'query-string';
import _ from 'lodash';

const Wrap = styled.div`
  width: 240px;
  height: 100%;
  background-color: #fff;
  box-shadow: 0px 1px 4px 1px rgba(0,0,0,0.1600);
  overflow-y: auto;

  .title, .menuItem {
    padding: 0 20px;
  }
  .title {
    color: #AFAFAF;
    margin-top: 26px;
  }
  .menuItem {
    height: 45px;
    width: 95%;
    border-radius: 0 50px 50px 0;
    cursor: pointer;
    font-weight: 400;
    color: #000;
    &.active {
      color: #2196F3;
      background-color: #2196f31f !important;
      .icon {
        color: #2196F3 !important;
      }
    }
    &:hover {
      background-color: #f5f5f5;
    }
  }
`;

const Sidebar = props => {
  return (
    <Wrap className="privateDeploymentSidebar">
      {menuGroup.map(group => (
        <Fragment key={group.type}>
          <div className="title Font13 mBottom8">{group.title}</div>
          <div className="menu">
            {group.menus.map(item => (
              <NavLink
                key={item.type}
                to={_.get(item, 'routes[0].path')}
                className="menuItem valignWrapper"
                activeClassName="active"
              >
                <Icon className="Font18 Gray_9e" icon={item.icon} />
                <span className="Font14 mLeft12">{item.title}</span>
              </NavLink>
            ))}
          </div>
        </Fragment>
      ))}
    </Wrap>
  );
}

export default withRouter(Sidebar);
