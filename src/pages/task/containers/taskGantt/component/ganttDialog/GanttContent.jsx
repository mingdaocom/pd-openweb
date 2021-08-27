import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { byDay, byWeek, byMonth } from './time';
import TimeHeader from './TimeHeader';
import GraphBg from './GraphBg';
import GraphContent from './GraphContent';
import config from './config';
import moment from 'moment';
import { durDays } from './time';

/**
 * 生成一个 从 1 ~ length+1的长度为length的数组
 * 10 => [1,2,3,4,5,6,7,8,9,10]
 * @param {*} length
 */
const genRationArr = length => Array.from({ length }, (v, i) => ++i);

const { TYPE_TO_WIDTH } = config;
export default class ganttContent extends Component {
  /**
   * 组件成功挂载
   * 1. 绑定滚动事件以实现同步滚动
   * 2. 重新计算甘特图的背景高度
   */
  componentDidMount() {
    const $taskList = document.querySelector('.taskListWrap');
    this.graphWrap.addEventListener('scroll', (e) => {
      e.currentTarget.className == config.scrollingEle && ($taskList.scrollTop = e.target.scrollTop);
    });
    this.graphWrap.addEventListener('mouseover', (e) => {
      config.scrollingEle = e.currentTarget.className;
    });

    this.computeBgHeight();
  }

  /**
   * 获取当前的滚动是在哪一个时间窗口
   */
  getPosList = (timeBox) => {
    this.posList = [];
    this.timeBox = timeBox;
    this.getIndex = (val) => {
      if (this.posList.length <= 1) return 0;
      for (let i = 0; i < this.posList.length; i++) {
        if (this.posList[i] <= val && val <= this.posList[i + 1]) {
          return i;
        }
      }
      return this.posList.length - 1;
    };

    Array.from(timeBox).forEach((ele) => {
      this.posList.push(ele.offsetLeft);
    });
  };

  /**
   * 当甘特图沿x轴滚动时,使上方的时间条有吸附左边缘的效果
   */
  handleScroll = (el) => {
    const left = el.scrollLeft;
    const index = this.getIndex(left);
    this.timeBox[index].style.paddingLeft = left - this.posList[index] + 15 + 'px';
  };

  /**
   * 当组件挂载和更新后重新计算甘特图的背景高度使之与内容高度相等
   */
  computeBgHeight() {
    const contentHeight = document.querySelector('.graphContent').getBoundingClientRect().height;
    const wrapHeight = document.querySelector('.graphWrap').getBoundingClientRect().height;
    const $bg = document.querySelector('.graphBg');
    const $taskListWrap = document.querySelector('.taskListWrap');
    $bg.style.height = $taskListWrap.style.height = Math.max(contentHeight, wrapHeight) + 'px';
  }

  componentDidUpdate() {
    this.computeBgHeight();
  }

  render() {
    const { type, beginTime, endTime, ...rest } = this.props;

    /**
     * 计算从开始到今天经过的天数
     */
    const tempBegin = beginTime.clone();
    const durFromBeginToToday = Math.floor(durDays(moment(tempBegin), moment()));

    /**
     * 根据类型渲染不同的宽度
     */
    const width = TYPE_TO_WIDTH[type];

    /**
     * 根据类型处理日期数据
     */
    let time;
    if (type === 'day') {
      time = byDay(beginTime, endTime);
    }
    if (type === 'week') {
      time = byWeek(beginTime, endTime);
    }
    if (type === 'month') {
      time = byMonth(beginTime, endTime);
    }

    return (
      <div className="ganttContentBox flex flexColumn" onScroll={e => this.handleScroll(e.target)}>
        <TimeHeader {...{ time, type }} getPosList={this.getPosList} />
        <div className="graphWrap" ref={node => (this.graphWrap = node)}>
          <GraphBg {...{ time, type, durFromBeginToToday }} />
          <GraphContent {...{ time, width, type, beginTime, ...rest }} />
        </div>
      </div>
    );
  }
}
