import React, { Fragment, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui/antd-components';
import * as actions from 'src/pages/chat/redux/actions';
import { emitter } from 'src/utils/common';
import mingoActiveHover from './images/mingo-active-hover.gif';
import mingoActive from './images/mingo-active.png';
import buildTipImg from './images/mingo-build-tip.svg';
import mingoClick from './images/mingo-click.gif';
import mingoDefault from './images/mingo-default.png';
import mingoHover from './images/mingo-hover.gif';

const Wrap = styled.div`
  height: 70px;
  &.active::before {
    content: '';
    position: absolute;
    left: 4px;
    top: 50%;
    height: 12px;
    width: 4px;
    border-radius: 3px;
    transform: translateY(-50%);
    background-color: ${props => props.aiColor};
  }
  .logo {
    width: 100%;
    position: relative;
  }
`;

const Mingo = props => {
  const { toolbarConfig, setToolbarConfig } = props;
  const { mingoVisible } = toolbarConfig;
  const { isOpenMingoAI } = toolbarConfig;

  const [hoverNow, setHoverNow] = useState(null);
  const [clickNow, setClickNow] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const wrapRef = useRef(null);
  // 首次访问引导气泡：提示右下角 mingo 可以搭建应用；点击 mingo 后写 localStorage，不再显示
  const [buildTipVisible, setBuildTipVisible] = useState(() => !localStorage.getItem('mingoBuildTipDismissed'));
  const [buildTipPos, setBuildTipPos] = useState(null);

  const { aiBrandName, aiBrandLogoUrl, aiBrandThemeColor } = md.global.SysSettings;
  const showBuildTip = isOpenMingoAI && !mingoVisible && buildTipVisible;

  const dismissBuildTip = () => {
    setBuildTipVisible(false);
    safeLocalStorageSetItem('mingoBuildTipDismissed', '1');
  };

  const handleOpenMingo = () => {
    dismissBuildTip();
    if (mingoVisible) {
      setToolbarConfig({ mingoVisible: false });
      localStorage.removeItem('toolBarOpenType');
    } else {
      setToolbarConfig({
        mingoVisible: true,
        sessionListVisible: false,
        favoriteVisible: false,
        userDrawerVisible: false,
        settingDrawerVisible: false,
      });
      localStorage.setItem('toolBarOpenType', 'mingo');
      if (isPlaying) return;
      setClickNow(Date.now());
      setIsPlaying(true);
      setTimeout(() => {
        setIsPlaying(false);
        setClickNow(null);
        setHoverNow(null);
      }, 3800);
    }
  };

  const handleForcedSetMingoVisible = ({ mingoVisible = true } = {}) => {
    setToolbarConfig({
      mingoVisible,
      mingoFixing: true,
    });
  };

  const getLogo = () => {
    if (aiBrandLogoUrl) {
      return aiBrandLogoUrl;
    }

    if (clickNow || isPlaying) {
      return mingoClick;
    }

    if (hoverNow) {
      return mingoVisible ? mingoActiveHover : mingoHover;
    }

    if (mingoVisible) {
      return mingoActive;
    }

    return mingoDefault;
  };

  const Content = (
    <Wrap
      ref={wrapRef}
      className={cx('mingo flexColumn alignItemsCenter justifyContentCenter pointer pTop6 Relative', {
        active: mingoVisible,
      })}
      aiColor={aiBrandThemeColor || 'var(--color-mingo)'}
      onClick={handleOpenMingo}
      onMouseEnter={() => {
        setClickNow(null);
        setHoverNow(Date.now());
      }}
      onMouseLeave={() => {
        setHoverNow(null);
        setClickNow(null);
      }}
    >
      <img className="logo" src={getLogo()} style={{ width: aiBrandLogoUrl ? 34 : undefined }} />
    </Wrap>
  );

  // 气泡用 portal + fixed 定位（避免被工具栏 overflow 裁剪）：尖角对准图标垂直中间、左侧留 10px。
  // TIP_X/TIP_Y 为尖角在 480×120 原图内的坐标。
  useEffect(() => {
    if (!showBuildTip) return undefined;
    // 原图 480×120 等比缩放到高度 60（宽 240）；尖角坐标同步减半
    const TIP_X = 232.474;
    const TIP_Y = 28.484;
    const GAP = 10;

    const measure = () => {
      const logo = wrapRef.current && wrapRef.current.querySelector('.logo');
      if (!logo) return;
      const r = logo.getBoundingClientRect();
      setBuildTipPos({ left: r.left - GAP - TIP_X, top: r.top + r.height / 2 - TIP_Y });
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [showBuildTip]);

  // 引导气泡只做轻量提示：展示 5s 后自动消失，并持久化标记，避免一直显示或反复弹出
  useEffect(() => {
    if (!showBuildTip) return undefined;
    const timer = setTimeout(dismissBuildTip, 5000);
    return () => clearTimeout(timer);
  }, [showBuildTip]);

  useEffect(() => {
    emitter.on('SET_MINGO_VISIBLE', handleForcedSetMingoVisible);
    return () => {
      emitter.off('SET_MINGO_VISIBLE', handleForcedSetMingoVisible);
    };
  }, []);

  return (
    <Fragment>
      {isOpenMingoAI &&
        (mingoVisible ? (
          Content
        ) : (
          <Tooltip
            title={aiBrandName || _l('AI助手')}
            shortcut="M"
            placement="left"
            align={{ offset: [10, 0] }}
            mouseLeaveDelay={0.1}
          >
            {Content}
          </Tooltip>
        ))}
      {showBuildTip &&
        buildTipPos &&
        createPortal(
          <img
            src={buildTipImg}
            alt=""
            onClick={handleOpenMingo}
            style={{
              position: 'fixed',
              left: buildTipPos.left,
              top: buildTipPos.top,
              width: 240,
              height: 60,
              cursor: 'pointer',
              // 低于 ming-ui Dialog（z-index:1000），避免引导气泡盖在弹层之上
              zIndex: 999,
            }}
          />,
          document.body,
        )}
    </Fragment>
  );
};

export default connect(
  state => ({
    toolbarConfig: state.chat.toolbarConfig,
  }),
  dispatch => bindActionCreators(_.pick(actions, ['setToolbarConfig']), dispatch),
)(Mingo);
