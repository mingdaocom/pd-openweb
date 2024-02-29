import React, { Component, createRef } from 'react';
import { string } from 'prop-types';
import SideAppItem from './SideAppItem';
import cx from 'classnames';
import { getItem, setItem } from '../../util';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util';

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
    const { type, projectId = '@INIT' } = props;
    this.$appGroupWrap = createRef();
    const isShow = getItem(`${type}/${projectId}`);
    this.state = {
      isShow: isShow === null ? true : isShow,
    };
  }

  componentDidMount() {
    this.computeMaxHeight(this.state.isShow);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { items, value } = this.props;
    if (nextState.isShow !== this.state.isShow) return true;
    if (items.length !== nextProps.items.length) return true;
    if (value !== nextProps.value) return true;
    if (items.filter(app => !!app.isMarked).length !== nextProps.items.filter(app => !!app.isMarked).length)
      return true;
    return false;
  }

  componentDidUpdate() {
    this.computeMaxHeight(this.state.isShow);
  }

  // 动态设置max-height属性以使展开收起动画更顺滑
  computeMaxHeight = isShow => {
    const $ele = this.$appGroupWrap.current;
    if (isShow && $ele) {
      const { scrollHeight } = $ele;
      $ele.style.maxHeight = `${scrollHeight}px`;
      $ele.style.transition = `all ${Math.min(Math.max(scrollHeight * 0.0005, 0.1), 0.6)}s ease-in`;
    }
  };

  switchState = () => {
    const { type, projectId = '@INIT' } = this.props;
    this.setState(({ isShow }) => {
      setItem(`${type}/${projectId}`, !isShow);
      this.computeMaxHeight(!isShow);
      return {
        isShow: !isShow,
      };
    });
  };
  render() {
    let { type, projectName, items = [], ...props } = this.props;
    let { isShow } = this.state;
    isShow = isShow === null ? true : isShow;
    items = items.filter(o => !o.pcDisplay || canEditApp(o.permissionType)); //排除pc端未发布的
    if (items.length <= 0) {
      return '';
    }
    return (
      <div className="sideAppGroupWrap">
        <div className="sideAppGroupTitleWrap">
          <div className="sideAppGroupTitle overflow_ellipsis">{projectName || TYPE_TO_TITLE[type]}</div>
          <div className="displayState pointer" onClick={this.switchState}>
            {isShow ? _l('隐藏') : _l('展开')}
          </div>
        </div>
        <div ref={this.$appGroupWrap} className={cx('sideAppGroup', { hideGroup: !isShow })}>
          {items && items.map((item, index) => <SideAppItem {...item} {...props} key={index} type={type} />)}
        </div>
      </div>
    );
  }
}
