import React, { Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import * as actions from 'src/pages/chat/redux/actions';
import { emitter } from 'src/utils/common';
import mingoActiveHover from './images/mingo-active-hover.gif';
import mingoActive from './images/mingo-active.png';
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
    background: #6e09f9;
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

  const handleOpenMingo = () => {
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
      className={cx('mingo flexColumn alignItemsCenter justifyContentCenter pointer pTop6 Relative', {
        active: mingoVisible,
      })}
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
      <img className="logo" src={getLogo()} />
    </Wrap>
  );

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
          <Tooltip title="mingo" shortcut="M" placement="left" align={{ offset: [10, 0] }} mouseLeaveDelay={0.1}>
            {Content}
          </Tooltip>
        ))}
    </Fragment>
  );
};

export default connect(
  state => ({
    toolbarConfig: state.chat.toolbarConfig,
  }),
  dispatch => bindActionCreators(_.pick(actions, ['setToolbarConfig']), dispatch),
)(Mingo);
