import React, { useRef, useEffect, useState } from 'react';
import { Motion, spring } from 'react-motion';
import { Icon } from 'ming-ui';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import SvgIcon from 'src/components/SvgIcon';
import cx from 'classnames';
import _ from 'lodash';

const Con = styled.div`
  display: flex;
  height: 56px;
`;
const TabCon = styled.div`
  height: 56px;
  display: flex;
  flex: 1;
  overflow: hidden;
`;
const Tab = styled.div`
  flex: 0 0 auto;
  position: relative;
  line-height: 55px;
  padding: 0 19px;
  font-size: 15px;
  color: #333;
  text-align: center;
  cursor: pointer;
  font-weight: bold;
  max-width: 200px;
  display: flex;
  align-items: center;
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
    &:after {
      display: none;
    }
  }
  &:after {
    content: ' ';
    position: absolute;
    top: 18px;
    bottom: 18px;
    width: 1px;
    background-color: rgba(0, 0, 0, 0.04);
    right: 0px;
  }
  &:last-child:after {
    display: none;
  }
  &.active:before {
    content: ' ';
    position: absolute;
    left: 0px;
    right: 0px;
    height: 3px;
    background-color: #2196f3;
    bottom: 0px;
  }
`;
const Num = styled.div`
  display: inline-block;
  color: #9e9e9e;
  margin-left: 4px;
  white-space: pre;
`;

const ScrollBtn = styled.div`
  width: 36px;
  line-height: 56px;
  padding-left: 10px;
`;
const SplitBtn = styled.div`
  padding-left: 10px;
  height: 56px;
  span {
    line-height: 1em;
    margin: 18px 0;
  }
`;

const IconCon = styled.span`
  line-height: 18px;
  display: inline-block;
  margin-right: 6px;
`;

export default function SectionTableNav(props) {
  const {
    style = {},
    sideVisible,
    formWidth,
    showSplitIcon,
    controls,
    isSplit,
    setSplit,
    activeControlId,
    onClick,
    widgetStyle,
  } = props;
  const tabConRef = useRef();
  const [clientWidth = 0, setClientWidth] = useState();
  const [scrollWidth = 0, setScrollWidth] = useState();
  const [scrollBtnVisible, setScrollBtnVisible] = useState();
  const [scrollLeft, setScrollLeft] = useState(0);
  function scroll(type) {
    let newScrollLeft;
    const stepWidth = clientWidth / 2;
    if (type === 'prev') {
      newScrollLeft = scrollLeft - stepWidth < 0 ? 0 : scrollLeft - stepWidth;
    } else {
      newScrollLeft =
        scrollLeft + stepWidth > scrollWidth - clientWidth ? scrollWidth - clientWidth : scrollLeft + stepWidth;
    }
    setScrollLeft(newScrollLeft);
  }
  useEffect(() => {
    // setScrollWidth(tabConRef.current.scrollWidth);
    const newScrollWidth = _.sum([...tabConRef.current.children].map(a => a.offsetWidth));
    if (newScrollWidth) {
      setScrollWidth(newScrollWidth);
      if (tabConRef.current.clientWidth < newScrollWidth) {
        setClientWidth(tabConRef.current.clientWidth - 36);
        setScrollBtnVisible(true);
      } else {
        setClientWidth(tabConRef.current.clientWidth);
        setScrollBtnVisible(false);
      }
    }
  });
  useEffect(() => {
    setScrollLeft(0);
  }, [sideVisible, formWidth]);

  function renderIcon(control) {
    let iconUrl = control.iconUrl;
    const showIcon = _.get(widgetStyle, 'showicon') || '1';

    if (control.type === 52 && showIcon === '1') {
      const icon = _.get(control, 'advancedSetting.icon');
      if (!icon) {
        return (
          <IconCon>
            <Icon icon="tab" className="Font14" style={{ color: '#6e6e6e' }} />
          </IconCon>
        );
      }
      iconUrl = safeParse(icon).iconUrl;
    }

    return (
      iconUrl && (
        <IconCon>
          <SvgIcon url={iconUrl} fill={'#6e6e6e'} size={18} />
        </IconCon>
      )
    );
  }

  return (
    <Con style={style}>
      <TabCon ref={tabConRef}>
        <Motion defaultStyle={{ scrollLeft }} style={{ scrollLeft: spring(-1 * scrollLeft) }}>
          {value => <span style={{ marginLeft: value.scrollLeft }}></span>}
        </Motion>
        {controls.map((control, i) => (
          <Tab
            key={i}
            className={cx('ellipsis', activeControlId === control.controlId ? 'active' : '')}
            onClick={() => {
              if (activeControlId !== control.controlId) {
                onClick(control.controlId, control);
              }
            }}
          >
            {renderIcon(control)}
            <span className="ellipsis" title={control.controlName}>
              {control.controlName}
            </span>
            {_.get(control, 'advancedSetting.showcount') !== '1' &&
              control.type !== 51 &&
              _.isNumber(Number(control.value)) &&
              !_.isNaN(Number(control.value)) &&
              Number(control.value) !== 0 && <Num> ( {control.value || 0} ) </Num>}
          </Tab>
        ))}
      </TabCon>
      {scrollBtnVisible && (
        <ScrollBtn>
          <i
            className={`icon icon-arrow-left-tip ${scrollLeft === 0 ? 'Gray_bd' : 'Gray_75 Hand'} Font13`}
            onClick={() => scroll('prev')}
          ></i>
          <i
            className={`icon icon-arrow-right-tip ${
              scrollLeft === scrollWidth - clientWidth ? 'Gray_bd' : 'Gray_75 Hand'
            } Font13`}
            onClick={() => scroll('next')}
          ></i>
        </ScrollBtn>
      )}
      {showSplitIcon && (
        <SplitBtn>
          <span className={isSplit ? '' : 'tip-top'} data-tip={isSplit ? _l('取消分栏') : _l('分栏显示')}>
            <i
              className={`icon icon-${
                isSplit ? 'call_to_action_off' : 'call_to_action_on'
              } Font20 Gray_9e Hand ThemeHoverColor3`}
              onClick={() => setSplit(!isSplit)}
            />
          </span>
        </SplitBtn>
      )}
    </Con>
  );
}

SectionTableNav.propTypes = {
  style: PropTypes.shape({}),
  showSplitIcon: PropTypes.bool,
  isSplit: PropTypes.bool,
  setSplit: PropTypes.func,
  controls: PropTypes.arrayOf(PropTypes.shape({})),
  activeControlId: PropTypes.string,
  onClick: PropTypes.func,
};
