import React, { cloneElement, Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Drawer } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import DragMask from 'worksheet/common/DragMask';
import Favorite from 'src/pages/chat/containers/FavoriteDrawer';
import Mingo from 'src/pages/chat/containers/MingoDrawer';
import SessionList from 'src/pages/chat/containers/SessionListDrawer';
import * as actions from 'src/pages/chat/redux/actions';

const FixingWrap = styled.div`
  border-left: 2px solid #e0e0e0;
`;

const Drag = styled.div(
  ({ left }) => `
  position: fixed;
  z-index: 99;
  left: ${left}px;
  width: 2px;
  height: 100%;
  cursor: ew-resize;
  &:hover {
    border-left: 1px solid #ddd;
  }
`,
);

const defaultWidth = 400;
const rightToolbarWidth = 52;

const ToolbarDrawer = props => {
  const { type, fixing, visible, width, onClose } = props;
  const [dragMaskVisible, setDragMaskVisible] = useState(false);
  const bodyWidth = document.body.clientWidth;
  const drawerWidth = bodyWidth - width - rightToolbarWidth;
  const [dragLeft, setDragLeft] = useState(drawerWidth);
  const drawerWidht = bodyWidth - dragLeft - rightToolbarWidth;
  const minDrawerWidht = bodyWidth - 800 - rightToolbarWidth;
  const maxDrawerWidht = bodyWidth - 250 - rightToolbarWidth;

  const handleResize = () => {
    setDragLeft(document.body.clientWidth - width - rightToolbarWidth);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (visible) {
      handleResize();
    }
  }, [visible]);

  const renderDrag = () => {
    return (
      <Fragment>
        {dragMaskVisible && (
          <DragMask
            value={dragLeft}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
            }}
            min={minDrawerWidht}
            max={maxDrawerWidht}
            onChange={value => {
              setDragLeft(value);
              const width = bodyWidth - value - rightToolbarWidth;
              localStorage.setItem(`${type}DrawerWidth`, width);
              setDragMaskVisible(false);
            }}
          />
        )}
        <Drag
          left={dragLeft}
          onMouseDown={() => {
            setDragMaskVisible(true);
          }}
        />
      </Fragment>
    );
  };

  return (
    <Fragment>
      {fixing ? (
        visible && (
          <FixingWrap style={{ width: drawerWidht }}>
            {renderDrag()}
            {props.children}
          </FixingWrap>
        )
      ) : (
        <Drawer
          placement="right"
          visible={visible}
          destroyOnClose={false}
          closable={false}
          maskStyle={{
            backgroundColor: 'transparent',
          }}
          onClose={() => {
            onClose();
            localStorage.removeItem('toolBarOpenType');
          }}
          getContainer={() => document.querySelector('#containerWrapper')}
          width={drawerWidht}
          style={{
            // position: 'absolute',
            zIndex: 20,
            right: 52,
          }}
          bodyStyle={{
            padding: 0,
          }}
        >
          {renderDrag()}
          {cloneElement(props.children, {
            drawerVisible: visible,
          })}
        </Drawer>
      )}
    </Fragment>
  );
};

const DrawerWrap = props => {
  const { toolbarConfig, setToolbarConfig } = props;
  const { mingoVisible, mingoFixing, sessionListVisible, sessionListFixing, favoriteVisible, favoriteFixing } =
    toolbarConfig;
  const mingoDrawerWidth = Number(localStorage.getItem(`mingoDrawerWidth`) || defaultWidth);
  const sessionListDrawerWidth = Number(localStorage.getItem(`sessionListDrawerWidth`) || 250);
  const favoriteDrawerWidth = Number(localStorage.getItem(`favoriteDrawerWidth`) || defaultWidth);

  return (
    <Fragment>
      <ToolbarDrawer
        type="mingo"
        width={mingoDrawerWidth}
        fixing={mingoFixing}
        visible={mingoVisible}
        onClose={() => setToolbarConfig({ mingoVisible: false })}
      >
        <Mingo />
      </ToolbarDrawer>
      <ToolbarDrawer
        type="sessionList"
        width={sessionListDrawerWidth}
        fixing={sessionListFixing}
        visible={sessionListVisible}
        onClose={() => setToolbarConfig({ sessionListVisible: false })}
      >
        <SessionList />
      </ToolbarDrawer>
      <ToolbarDrawer
        type="favorite"
        width={favoriteDrawerWidth}
        fixing={favoriteFixing}
        visible={favoriteVisible}
        onClose={() => setToolbarConfig({ favoriteVisible: false })}
      >
        <Favorite />
      </ToolbarDrawer>
    </Fragment>
  );
};

export default connect(
  state => ({
    toolbarConfig: state.chat.toolbarConfig,
  }),
  dispatch => bindActionCreators(_.pick(actions, ['setToolbarConfig']), dispatch),
)(DrawerWrap);
