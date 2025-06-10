import React, { Component, createRef } from 'react';
import cx from 'classnames';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util';
import SideAppItem from './SideAppItem';

const TYPE_TO_TITLE = {
  markedApps: _l('应用收藏'),
  aloneApps: _l('个人'),
  expireProject: _l('过期应用'),
  externalApps: _l('外部协作'),
};

export default class SideAppGroup extends Component {
  static propTypes = {};
  static defaultProps = {};
  constructor(props) {
    super(props);
    this.$appGroupWrap = createRef();
  }

  componentDidMount() {
    this.computeMaxHeight();
  }

  shouldComponentUpdate(nextProps) {
    const { items, value, expandKeys } = this.props;
    if (expandKeys !== nextProps.expandKeys) return true;
    if (items.length !== nextProps.items.length) return true;
    if (value !== nextProps.value) return true;
    if (items.filter(app => !!app.isMarked).length !== nextProps.items.filter(app => !!app.isMarked).length)
      return true;
    return false;
  }

  componentDidUpdate() {
    this.computeMaxHeight();
  }

  // 动态设置max-height属性以使展开收起动画更顺滑
  computeMaxHeight = () => {
    const { type, projectId = '@INIT', expandKeys } = this.props;
    const isShow = expandKeys.includes(`${type}/${projectId}`);
    const $ele = this.$appGroupWrap.current;

    if (isShow && $ele) {
      const { scrollHeight } = $ele;
      $ele.style.maxHeight = `${scrollHeight}px`;
      $ele.style.transition = `all ${Math.min(Math.max(scrollHeight * 0.0005, 0.1), 0.6)}s ease-in`;
    }
  };

  render() {
    let { type, projectName, items = [], expandKeys, onExpandCollapse, projectId = '@INIT', ...props } = this.props;
    const isShow = expandKeys.includes(`${type}/${projectId}`);
    items = items.filter(o => !o.pcDisplay || canEditApp(o.permissionType)); //排除pc端未发布的
    if (items.length <= 0) {
      return '';
    }
    return (
      <div className="sideAppGroupWrap">
        <div className="sideAppGroupTitleWrap pointer" onClick={() => onExpandCollapse(`${type}/${projectId}`)}>
          <div className="sideAppGroupTitle overflow_ellipsis">{projectName || TYPE_TO_TITLE[type]}</div>
          <div className="displayState">{isShow ? _l('收起') : _l('展开')}</div>
        </div>
        <div ref={this.$appGroupWrap} className={cx('sideAppGroup', { hideGroup: !isShow })}>
          {items && items.map((item, index) => <SideAppItem {...item} {...props} key={index} type={type} />)}
        </div>
      </div>
    );
  }
}
