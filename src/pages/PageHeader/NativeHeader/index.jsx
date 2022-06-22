import React, { Component } from 'react';
import { string } from 'prop-types';
import cx from 'classnames';
import { Motion, spring } from 'react-motion';
import { navigateTo } from 'src/router/navigateTo';
import { NATIVE_MODULES } from '../config';
import CommonUserHandle from '../components/CommonUserHandle';
import CoordinationIcon from '../components/CoordinationIcon';
import IndexSide from '../components/IndexSide';
import HomepageIcon from '../components/HomepageIcon';
import './index.less';
import { compareProps } from '../util';

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
          <HomepageIcon
            onClick={this.switchIndexSideVisible}
            onMouseEnter={this.switchIndexSideVisible}
            onMouseLeave={() => clearTimeout(this.timer)}
          />
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
