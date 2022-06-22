import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import styled from 'styled-components';
import CommonUserHandle from '../components/CommonUserHandle';
import { APP_MANAGEMENT_TABS } from '../config';
import './index.less';
import SideLayer from '../components/SideLayer';
import { getNew } from 'src/api/map';
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
const NewVersionEntry = styled.div`
  cursor: pointer;
  position: absolute;
  right: 162px;
  height: 28px;
  line-height: 28px;
  padding: 0 16px;
  border-radius: 28px;
  color: #2196f3;
  background: rgba(33, 150, 243, 0.1);
`;

export default class AppManagementHeader extends Component {
  static propTypes = {};
  static defaultProps = {};
  state = {};
  componentDidMount() {
    const { accountId = '', hasShow } = JSON.parse(window.localStorage.getItem('pointForLibrary') || '{}');
    this.setState({
      hasShow,
    });
    //true 不提示红点，false 提示红点
    if (
      accountId !== md.global.Account.accountId ||
      hasShow === undefined ||
      (accountId === md.global.Account.accountId && !hasShow)
    ) {
      window.localStorage.removeItem('pointForLibrary');
      getNew().then(hasShow => {
        window.localStorage.setItem(
          'pointForLibrary',
          JSON.stringify({
            accountId: md.global.Account.accountId,
            hasShow,
          }),
        );
        this.setState({
          hasShow,
        });
      });
    }
  }
  render() {
    let { url } = this.props.match;
    const { hasShow = true } = this.state;
    return (
      <div className="appManagementHeaderWrap">
        <Fragment>
          <Workbench>
            <SideLayer />
          </Workbench>
          <ul className="appTab">
            {APP_MANAGEMENT_TABS.map(({ text, urlMatch, href, id }) => (
              <li
                key={id}
                className={cx({ active: urlMatch.test(url) })}
                onClick={() => {
                  if (id === 'lib') {
                    window.localStorage.setItem(
                      'pointForLibrary',
                      JSON.stringify({
                        accountId: md.global.Account.accountId,
                        hasShow: true,
                      }),
                    );
                  }
                  navigateTo(href);
                }}
              >
                {text}
                {id === 'lib' && !hasShow && (
                  <span
                    className="pointForLibrary"
                    style={{
                      display: 'inline-block',
                      width: '5px',
                      height: '5px',
                      background: '#fd181b',
                      'border-radius': '50%',
                      'margin-left': '4px',
                      'vertical-align': 'top',
                      'margin-top': '20px',
                    }}
                  ></span>
                )}
              </li>
            ))}
          </ul>
          <NewVersionEntry
            onClick={() => {
              localStorage.setItem('oldHome', '');
              location.reload();
            }}
          >
            {_l('体验新版')}
          </NewVersionEntry>
          <CommonUserHandle />
        </Fragment>
      </div>
    );
  }
}
