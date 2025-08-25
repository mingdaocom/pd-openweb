import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui';
import { getDefaultData } from 'src/pages/widgetConfig/config/score.js';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/setting.js';
import { browserIsMobile } from 'src/utils/common';
import { getStringBytes } from 'src/utils/common';
import Icon from './Icon';
import './less/Score.less';

const CustomScoreIcon = styled.div`
  .scoreIcon {
    transition: 0.3s;
    color: ${props => props.color || 'rgba(0,0,0,0.16)'};
    &:hover {
      color: ${props => props.color || 'rgba(0,0,0,0.16)'};
    }
  }
`;

class CustomScore extends Component {
  static propTypes = {
    /**
     * 配置信息
     */
    data: PropTypes.object,
    /**
     * 评分数
     */
    score: PropTypes.number,
    /**
     * 回调函数
     */
    callback: PropTypes.func,
    /**
     * 是否禁用
     */
    disabled: PropTypes.bool,
    /**
     * hover 上的回调函数
     */
    hover: PropTypes.func,
    /**
     * 不显示 tip
     */
    hideTip: PropTypes.bool,
  };
  static defaultProps = {
    score: 0,
    callback: () => {},
    disabled: false,
    hover: () => false,
  };
  constructor(props) {
    super(props);
    this.state = {
      score: this.props.score,
      lastScore: this.props.score,
    };

    if (this.props.disabled) {
      this.onMouseEnter = () => {};
      this.onMouseLeave = () => {};
    } else {
      this.onMouseEnter = this.onMouseEnter.bind(this);
      this.onMouseLeave = this.onMouseLeave.bind(this);
    }
    this.onSelect = this.onSelect.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if ('score' in nextProps) {
      this.setState({
        score: nextProps.score,
        lastScore: nextProps.score,
      });
    }
  }
  onSelect(index, event) {
    if (this.props.disabled) return;
    event.stopPropagation();
    if (index === this.state.lastScore) {
      index = 0;
    }
    this.setState({
      lastScore: index,
      score: index,
    });
    this.props.callback(index, event);
  }
  onMouseEnter(index) {
    this.setState({
      score: index,
    });
  }
  onMouseLeave() {
    const { lastScore } = this.state;
    this.setState({
      score: lastScore,
    });
  }

  render() {
    const { score, lastScore } = this.state;
    const { className, data = {}, hideTip, hideText = false, from, backgroundColor } = this.props;
    const isOldData = !(data.advancedSetting || {}).itemicon;
    const {
      max,
      itemicon,
      showvalue,
      itemcolor: defaultColor,
    } = isOldData ? getDefaultData(data) : getAdvanceSetting(data);
    const itemcolor = JSON.parse(defaultColor || '{}');
    const itemnames = getAdvanceSetting(data, 'itemnames') || [];
    const list = Array.from({ length: max });
    const isDingTalkPcSlide =
      window.isDingTalk && (location.search.includes('pc_slide=true') || sessionStorage.getItem('dingtalk_pc_slide'));
    const isMobile = isDingTalkPcSlide ? false : browserIsMobile();
    const text = _.get(itemnames[lastScore - 1], 'value') || lastScore;
    const selectColor =
      (itemcolor.type === 1 ? itemcolor.color : _.get((itemcolor.colors || [])[score - 1], 'value')) || '#FED156';

    return (
      <div className={cx('Score-wrapper customScoreWrap', className)}>
        {list.map((item, index) => {
          const tipText = `${_.get(itemnames[index], 'value') || index + 1}`;
          let tipProps = { popupPlacement: 'top', offset: [0, 1] };
          if (isMobile) {
            if (index === 0 && getStringBytes(tipText) >= 10) {
              tipProps = { popupPlacement: 'topLeft', offset: [-12, 1] };
            }
            if (index === list.length - 1 && getStringBytes(tipText) >= 10) {
              tipProps = { popupPlacement: 'topRight', offset: [12, 1] };
            }
          }
          return (
            <div
              key={index}
              className={cx('StarScore-item', {
                mobileStyle: isMobile && !this.props.disabled,
                active: score > 0 && index < score,
              })}
              {...(isMobile
                ? {
                    onTouchStart: event => this.onSelect(index + 1, event),
                  }
                : {
                    onClick: event => this.onSelect(index + 1, event),
                    onMouseEnter: event => this.onMouseEnter(index + 1, event),
                    onMouseLeave: this.onMouseLeave,
                  })}
            >
              <CustomScoreIcon color={score > 0 && index < score ? selectColor : backgroundColor || '#bdbdbd'}>
                <Tooltip text={<span>{tipText}</span>} {...tipProps} disable={this.props.disabled || hideTip}>
                  <Icon className={cx('scoreIcon', from === 'recordInfo' ? 'Font24' : 'Font18')} icon={itemicon} />
                </Tooltip>
              </CustomScoreIcon>
            </div>
          );
        })}
        {(showvalue === '1' || isOldData) && !!text && !hideText && (
          <div className="mLeft10 LineHeight16 text">{text}</div>
        )}
      </div>
    );
  }
}

export default CustomScore;
