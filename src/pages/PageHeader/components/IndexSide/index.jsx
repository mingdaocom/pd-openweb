import React, { Component, Fragment } from 'react';
import { number, bool } from 'prop-types';
import withClickAway from 'ming-ui/decorators/withClickAway';
import withEscClose from 'ming-ui/decorators/withEscClose';
import { Icon, ScrollView } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import cx from 'classnames';
import './index.less';
import Content from './Content';

@withClickAway
@withEscClose
export default class IndexSide extends Component {
  static propTypes = {
    posX: number,
    visible: bool,
  };
  static defaultProps = {
    posX: -352,
  };

  render() {
    const { posX } = this.props;
    const { pathname } = window.location;
    return (
      <div className={cx('indexSideWrap')} style={{ transform: `translate3d(${posX}px,0,0)` }}>
        <div className="indexSideHeaderWrap">
          <div
            className={cx('homepageWrap', { appIndexPage: pathname === '/app/my' })}
            onClick={() => navigateTo('/app/my')}>
            <div className="homepage">
              <Icon icon="home_page" className="Font24" />
              <span>{_l('主页')}</span>
            </div>
          </div>
        </div>
        <Content {...this.props} />
      </div>
    );
  }
}
