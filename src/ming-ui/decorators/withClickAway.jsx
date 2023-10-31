import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';
import { compact, map, every, flatten } from 'lodash';

function withClickAway(exceptionList, Component = exceptionList) {
  class ClickAwayableComponent extends React.Component {
    static propTypes = {
      onClickAway: PropTypes.func, // 点击外部区域时触发的方法
      // 外部区域中点击到了不触发 onClickAway 的对象，可以��jQuery 对象、ReactComponent 或原��DOM 对象
      onClickAwayExceptions: PropTypes.array,
      // ��Щ�������� jquery plugins ���󶨵�Ԫ�أ�ֱ�Ӵ��붼�ǿ� ��װ��, �����ټ�һ���Զ������жϺ��� return bool
      specialFilter: PropTypes.func,
      ignoreOnHide: PropTypes.bool, // ����ʱ�������¼�
    };
    componentDidMount() {
      this.mounted = true;
      this.checkClickAway = this.checkClickAway.bind(this);
      this.bindClickAway();
    }
    componentWillUnmount() {
      this.mounted = false;
      this.unbindClickAway();
    }
    checkClickAway(e = {}) {
      if (!this.mounted) {
        return;
      }

      const el = ReactDom.findDOMNode(this);
      if (this.props.ignoreOnHide !== false && !$(el).is(':visible')) {
        return;
      }

      const exceptions = compact(
        map(this.props.onClickAwayExceptions, item => {
          if (item instanceof window.jQuery) {
            return map(item, x => x);
          }
          if (typeof item === 'string' && window.jQuery) {
            return map(window.jQuery(item), x => x);
          }
          try {
            return ReactDom.findDOMNode(item);
          } catch (err) {
            return null;
          }
        }),
      );
      // 检��click 的对象是不是在当前组件或��exception 列表��
      if (
        this.props.onClickAway &&
        e.target !== el &&
        !$(e.target).closest($(el)).length &&
        every(flatten(exceptions), item => e.target !== item && !$(e.target).closest($(item)).length) &&
        document.documentElement.contains(e.target)
      ) {
        // �������Զ������жϺ�������ִ��
        if (!(this.props.specialFilter && this.props.specialFilter(e.target))) {
          this.props.onClickAway(e.target);
        }
      }
    }
    bindClickAway() {
      // React 的事件比dom事件先执行，��setTimout 延迟方法，等到组件被渲染后再执行
      // setTimeout(() => $(document).on('mouseup', this.checkClickAway), 0);
      setTimeout(() => document.addEventListener('mousedown', this.checkClickAway, true), 0);
    }
    unbindClickAway() {
      document.removeEventListener('mousedown', this.checkClickAway, true);
    }
    render() {
      const { onClickAway, onClickAwayExceptions, specialFilter, ignoreOnHide, ...rest } = this.props;
      return <Component {...rest} />;
    }
  }

  return ClickAwayableComponent;
}

export default withClickAway;
