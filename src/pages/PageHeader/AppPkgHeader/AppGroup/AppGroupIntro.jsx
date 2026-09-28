import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { func, string } from 'prop-types';
import { Icon } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import ClickAway from 'ming-ui/components/ClickAway';
import appGroupIntroPic from './images/appGroupIntro.gif';

let AppGroupIntro = class AppGroupIntro extends Component {
  static propTypes = {
    className: string,
    addAppGroup: func,
    onClose: func,
  };
  static defaultProps = {
    addAppGroup: _.noop,
    onClose: _.noop,
  };
  state = {};

  componentDidMount() {
    document.body.addEventListener('keydown', this.closeWhenPressEsc);
  }

  componentWillUnmount() {
    document.body && document.body.removeEventListener('keydown', this.closeWhenPressEsc);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.className !== nextProps.className;
  }

  closeWhenPressEsc = e => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      this.props.onClose();
    }
  };
  handleCloseClick = e => {
    e.stopPropagation();
    this.props.onClose();
  };

  render() {
    const { addAppGroup, className } = this.props;
    return (
      <div className={cx('appGroupIntro', className)}>
        <div className="title">{_l('创建分组来管理工作表')}</div>
        <div className="explain">
          {_l(
            '当你的工作表数量变多时，你可以创建分组来分类管理工作表。分组将排列在顶部导航中，方便你在不同类型的工作表间快速切换',
          )}
        </div>
        <div className="introPic">
          <img src={appGroupIntroPic} alt={_l('应用分组介绍')} />
        </div>
        <div className="btnWrap">
          <Button
            type="primary"
            icon={<Icon icon="add" />}
            onClick={e => {
              e.stopPropagation();
              addAppGroup();
            }}
          >
            {_l('添加分组')}
          </Button>
        </div>
      </div>
    );
  }
};
AppGroupIntro = ClickAway.wrap(AppGroupIntro);
export default AppGroupIntro;
