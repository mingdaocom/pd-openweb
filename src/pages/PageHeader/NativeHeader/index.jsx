import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import cx from 'classnames';
import _ from 'lodash';
import { string } from 'prop-types';
import { Icon } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import CommonUserHandle from '../components/CommonUserHandle';
import CoordinationIcon from '../components/CoordinationIcon';
import HomepageIcon from '../components/HomepageIcon';
import IndexSide from '../components/IndexSide';
import { NATIVE_MODULES } from '../config';
import { compareProps } from '../util';
import './index.less';

export default class NativeHeader extends Component {
  static propTypes = {
    path: string,
  };
  static defaultProps = {
    path: 'feed',
  };
  state = { indexSideVisible: false };

  shouldComponentUpdate(nextProps, nextState) {
    return compareProps(this.state, nextState) || compareProps(this.props, nextProps, ['path']);
  }
  switchIndexSideVisible = (visible = true) => {
    this.timer = setTimeout(() => {
      this.setState({ indexSideVisible: visible });
    }, 100);
  };

  render() {
    const { path } = this.props;
    const { indexSideVisible } = this.state;
    return (
      <div className="nativeHeaderWrap">
        <div className="nativeModuleLogo">
          {window.backHomepageWay === 1 ? (
            <div
              className="homepageIcon alignItemsCenter justifyContentCenter"
              style={{ flexWrap: 'nowrap' }}
              onClick={() => navigateTo('/dashboard')}
            >
              <Icon className="Font20 Gray_75" icon="home_page" />
            </div>
          ) : (
            <HomepageIcon
              onClick={this.switchIndexSideVisible}
              onMouseEnter={this.switchIndexSideVisible}
              onMouseLeave={() => clearTimeout(this.timer)}
            />
          )}
          <CoordinationIcon className="nativeCoordinationIcon" />
          <div className="nativeTitle">{_l('协作套件')}</div>
          <Motion style={{ x: spring(indexSideVisible ? 0 : -352) }}>
            {({ x }) => (
              <IndexSide
                posX={x}
                visible={indexSideVisible}
                onClickAway={() => this.switchIndexSideVisible(false)}
                onClose={() => indexSideVisible && this.switchIndexSideVisible(false)}
              />
            )}
          </Motion>
        </div>
        <ul className="nativeTabsWrap">
          {NATIVE_MODULES.map(({ id, href, urlMatch, text }) =>
            id === 'hr' && !_.get(md, ['global', 'Account', 'hrVisible']) ? null : (
              <li
                key={id}
                className={cx('tab-item', { active: urlMatch.test(path) })}
                onClick={() => {
                  id === 'hr' ? window.open(href) : navigateTo(href);
                }}
              >
                {text}
              </li>
            ),
          )}
        </ul>
        <CommonUserHandle type={'native'} />
      </div>
    );
  }
}
