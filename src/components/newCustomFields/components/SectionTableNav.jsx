import React, { useRef, useEffect, useState, Fragment } from 'react';
import { Motion, spring } from 'react-motion';
import { Icon, Tooltip, SvgIcon } from 'ming-ui';
import PropTypes from 'prop-types';
import styled from 'styled-components';
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
  max-width: 220px;
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
  color: #757575;
  white-space: pre;
  margin-left: 6px;
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
    display: inline-block;
    line-height: 1em;
    margin: 18px 0;
  }
`;

const IconCon = styled.span`
  line-height: 18px;
  display: inline-block;
  ${props => (props.isFixedRight ? 'margin-left: 10px;' : ' margin-right: 10px;')}
`;

export function renderTabs(props) {
  const { widgetStyle = {}, controls = [], activeControlId, onClick, showTip = false } = props;

  function renderIcon(control) {
    let iconUrl = control.iconUrl;
    const showIcon = _.get(widgetStyle, 'showicon') || '1';
    const isFixedActive = _.includes(['3', '4'], widgetStyle.tabposition) && activeControlId === control.controlId;
    const isFixedRight = widgetStyle.tabposition === '4';

    if (showIcon !== '1') return null;

    if (_.includes([51, 52], control.type)) {
      const icon = _.get(control, 'advancedSetting.icon');
      if (!icon) {
        const defaultIcon = control.type === 51 ? 'Worksheet_query' : 'tab';
        return (
          <IconCon isFixedRight={isFixedRight}>
            <Icon icon={defaultIcon} className="Font20" style={{ color: '#6e6e6e' }} />
          </IconCon>
        );
      }
      iconUrl = safeParse(icon).iconUrl;
    }

    return (
      iconUrl && (
        <IconCon isFixedRight={isFixedRight}>
          <SvgIcon url={iconUrl} fill={isFixedActive ? '#2196f3' : '#6e6e6e'} size={20} />
        </IconCon>
      )
    );
  }

  return (
    <Fragment>
      {controls.map((control, i) => {
        let showNum =
          _.get(control, 'advancedSetting.showcount') !== '1' &&
          control.type !== 51 &&
          _.isNumber(Number(control.value)) &&
          !_.isNaN(Number(control.value)) &&
          Number(control.value) !== 0;
        let num = control.value || 0;
        if (control.type === 29 && control.store && !control.store.getState().loading) {
          num = control.store.getState().tableState.count;
        }
        return (
          <Tooltip popupPlacement="right" text={control.controlName} disable={!showTip}>
            <Tab
              key={i}
              title={control.controlName}
              className={cx('ellipsis sectionTabItem', activeControlId === control.controlId ? 'active' : '')}
              onClick={() => {
                if (activeControlId !== control.controlId) {
                  onClick(control.controlId, control);
                }
              }}
            >
              {renderIcon(control, widgetStyle)}
              <span className="ellipsis">{control.controlName}</span>
              {showNum && !!num && <Num>{num}</Num>}
            </Tab>
          </Tooltip>
        );
      })}
    </Fragment>
  );
}

export default function SectionTableNav(props) {
  const { style = {}, sideVisible, formWidth, showSplitIcon, isSplit, setSplit } = props;
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

  return (
    <Con style={style}>
      <TabCon ref={tabConRef}>
        <Motion defaultStyle={{ scrollLeft }} style={{ scrollLeft: spring(-1 * scrollLeft) }}>
          {value => <span style={{ marginLeft: value.scrollLeft }}></span>}
        </Motion>
        {renderTabs(props)}
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
          <Tooltip text={isSplit ? _l('取消分栏') : _l('分栏显示')}>
            <span>
              <i
                className={`icon icon-${
                  isSplit ? 'call_to_action_off' : 'call_to_action_on'
                } Font20 Gray_9e Hand ThemeHoverColor3`}
                onClick={() => setSplit(!isSplit)}
              />
            </span>
          </Tooltip>
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
