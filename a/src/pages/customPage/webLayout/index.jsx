import React, { useState, memo, useRef, useEffect, Fragment } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { EditWidget, WidgetList, WidgetContent } from '../components';
import cx from 'classnames';
import _ from 'lodash';
import { replaceColor, isLightColor } from 'src/pages/customPage/util';

const ContentWrap = styled.div`
  box-sizing: border-box;
  justify-content: center;
  padding: 0 8px;
  padding-top: 4px;
  background-color: #f5f5f5;
  height: 100%;
  flex: 1;
  overflow: auto;
  &.darkTheme .componentTitle {
    color: rgba(255, 255, 255, 1) !important;
  }
  &.componentsEmpty {
    display: flex;
    align-items: center;
  }
  .empty {
    .iconWrap {
      box-sizing: border-box;
      width: 130px;
      height: 130px;
      border-radius: 50%;
      margin: 0 auto;
      background-color: #e6e6e6;
      text-align: center;
      padding-top: 35px;
      i {
        font-size: 60px;
        color: #bdbdbd;
      }
    }
    p {
      text-align: center;
      font-size: 15px;
      color: #757575;
    }
  }

  .componentsWrap {
    padding: 0 0 4px 0;
    height: 100%;
  }
`;

function webLayout(props) {
  const { editable = true, components = [], updateWidget = _.noop, className = '', emptyPlaceholder, config, appPkg, ...rest } = props;
  const [editingWidget, setWidget] = useState({});
  const $ref = useRef(null);
  const { iconColor } = rest.apk;
  const pageConfig = replaceColor(config || {}, appPkg.iconColor || rest.apk.iconColor);
  return (
    <Fragment>
      {editable && <WidgetList {...props} />}
      <ContentWrap
        ref={$ref}
        className={cx(className, {
          componentsEmpty: components <= 0,
          darkTheme: pageConfig.pageBgColor && !isLightColor(pageConfig.pageBgColor)
        })}
        id="componentsWrap"
        style={{ backgroundColor: appPkg.pcNaviStyle === 1 ? pageConfig.darkenPageBgColor || pageConfig.pageBgColor : pageConfig.pageBgColor }}
      >
        {components.length > 0 ? (
          <div className="componentsWrap">
            <WidgetContent {...props} editingWidget={editingWidget} setWidget={setWidget} config={pageConfig} />
          </div>
        ) : (
          emptyPlaceholder || (
            <div className="empty">
              <div className="addWidgetPic"></div>
              <p>{_l('从左侧添加组件，开始创建页面')}</p>
            </div>
          )
        )}
        {!_.isEmpty(editingWidget) && (
          <EditWidget
            mode="update"
            widget={editingWidget}
            onClose={() => setWidget({})}
            updateWidget={updateWidget}
            {...rest}
          />
        )}
      </ContentWrap>
    </Fragment>
  );
}

export default connect(state => ({
  components: state.customPage.components,
  apk: state.customPage.apk,
}))(memo(webLayout));
