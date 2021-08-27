import React, { Component } from 'react';
import { string, func } from 'prop-types';
import cx from 'classnames';
import { Icon, Button } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import withEscClose from 'ming-ui/decorators/withEscClose';
import appGroupIntroPic from '../../../../common/mdcss/images/appGroupIntro.gif';

@withClickAway
@withEscClose
export default class AppGroupIntro extends Component {
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
  shouldComponentUpdate(nextProps) {
    return this.props.className !== nextProps.className;
  }
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
          {_l('当你的工作表数量变多时，你可以创建分组来分类管理工作表。分组将排列在顶部导航中，方便你在不同类型的工作表间快速切换')}
        </div>
        <div className="introPic">
          <img src={appGroupIntroPic} alt={_l('应用分组介绍')} />
        </div>
        <div className="btnWrap">
          <Button
            size="small"
            style={{ height: 36, padding: '0 24px' }}
            onClick={e => {
              e.stopPropagation();
              addAppGroup();
            }}
          >
            <Icon className="Font16" icon="add" />
            <span className="bold">{_l('添加分组')}</span>
          </Button>
        </div>
      </div>
    );
  }
}
