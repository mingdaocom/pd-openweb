import React, { Component } from 'react';
import { Dropdown, Menu } from 'antd';
import cx from 'classnames';
import { bool, func, number } from 'prop-types';
import { Icon, MdLink } from 'ming-ui';
import ClickAway from 'ming-ui/components/ClickAway';
import { navigateTo } from 'src/router/navigateTo';
import Content from './Content';
import './index.less';

let IndexSide = class IndexSide extends Component {
  static propTypes = {
    onClose: func,
    posX: number,
    visible: bool,
  };
  static defaultProps = {
    posX: -352,
  };

  componentDidMount() {
    document.body && document.body.addEventListener('keydown', this.closeWhenPressEsc);
  }

  componentWillUnmount() {
    document.body && document.body.removeEventListener('keydown', this.closeWhenPressEsc);
  }

  closeWhenPressEsc = e => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      this.props.onClose();
    }
  };

  render() {
    const { posX } = this.props;
    return (
      <div
        className={cx('indexSideWrap')}
        style={{
          transform: `translate3d(${posX}px,0,0)`,
        }}
      >
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
              <Menu
                style={{
                  width: 120,
                }}
              >
                <Menu.Item onClick={() => navigateTo('/personal?type=system')}>{_l('偏好设置')}</Menu.Item>
              </Menu>
            }
          >
            <div className="flexRow alignItemsCenter justifyContentCenter pointer moreWrap">
              <Icon className="textTertiary Font20" icon="more_horiz" />
            </div>
          </Dropdown>
        </div>
        <Content {...this.props} />
      </div>
    );
  }
};
IndexSide = ClickAway.wrap(IndexSide);
export default IndexSide;
