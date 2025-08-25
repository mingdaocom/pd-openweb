import React, { Component } from 'react';
import { Dropdown, Menu } from 'antd';
import cx from 'classnames';
import { bool, number } from 'prop-types';
import { Icon, MdLink } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import withEscClose from 'ming-ui/decorators/withEscClose';
import { navigateTo } from 'src/router/navigateTo';
import Content from './Content';
import './index.less';

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

    return (
      <div className={cx('indexSideWrap')} style={{ transform: `translate3d(${posX}px,0,0)` }}>
        <div className="indexSideHeaderWrap">
          <MdLink className="homepageWrap" to={'/dashboard'}>
            <div className="homepage">
              <Icon icon="home_page" className="Font24" />
              <span>{_l('工作台')}</span>
            </div>
          </MdLink>
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            overlay={
              <Menu style={{ width: 120 }}>
                <Menu.Item onClick={() => navigateTo('/personal?type=system')}>{_l('偏好设置')}</Menu.Item>
              </Menu>
            }
          >
            <div className="flexRow alignItemsCenter justifyContentCenter pointer moreWrap">
              <Icon className="Gray_9e Font20" icon="more_horiz" />
            </div>
          </Dropdown>
        </div>
        <Content {...this.props} />
      </div>
    );
  }
}
