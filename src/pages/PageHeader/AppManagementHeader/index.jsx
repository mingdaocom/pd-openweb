import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import styled from 'styled-components';
import CommonUserHandle from '../components/CommonUserHandle';
import { APP_MANAGEMENT_TABS } from '../config';
import './index.less';
import SideLayer from '../components/SideLayer';

const Workbench = styled.div`
  display: flex;
  align-items: center;
  padding: 0 16px;
  .workbench {
    display: flex;
    align-items: center;
    margin-left: 18px;
    cursor: pointer;
    span {
      margin-left: 6px;
      font-size: 16px;
      font-weight: bold;
    }
  }
`;
export default class AppManagementHeader extends Component {
  static propTypes = {};
  static defaultProps = {};
  state = {};
  render() {
    let { url } = this.props.match;
    return (
      <div className="appManagementHeaderWrap">
        <Fragment>
          <Workbench>
            <SideLayer />
          </Workbench>
          <ul className="appTab">
            {APP_MANAGEMENT_TABS.map(({ text, urlMatch, href, id }) => (
              <li key={id} className={cx({ active: urlMatch.test(url) })} onClick={() => navigateTo(href)}>
                {text}
              </li>
            ))}
          </ul>
          <CommonUserHandle />
        </Fragment>
      </div>
    );
  }
}
