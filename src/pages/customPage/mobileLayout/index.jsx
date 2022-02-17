import React, { Fragment } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import { WidgetContent } from '../components';
import { getIconByType, getComponentTitleText } from '../util';

const MobileList = styled.div`
  box-sizing: border-box;
  width: 240px;
  background-color: #fff;
  padding: 16px;
  .emptyHint {
    margin-top: 14px;
    padding: 12px 14px;
    border-radius: 3px;
    border: 1px solid #eaeaea;
    color: #9e9e9e;
    font-size: 12px;
    text-align: center;
    p {
      margin: 16px 0 0 0;
    }
    i {
      font-size: 32px;
    }
  }
  ul {
    li {
      display: flex;
      align-items: center;
      line-height: 36px;
      height: 36px;
      padding: 0 10px;
      background-color: #f5f5f5;
      transition: background-color 0.25s;
      border-radius: 3px;
      margin-top: 8px;
      cursor: pointer;
      i {
        font-size: 20px;
      }
      .name {
        flex: 1;
        padding-left: 12px;
      }
      .add {
        visibility: hidden;
      }
      &:hover {
        background-color: #f0f0f0;
        .add {
          visibility: visible;
        }
      }
    }
  }
`;

const MobileConfig = styled.div`
  flex: 1;
  background-color: #f5f5f5;
  padding: 20px;

  .mobileWrap {
    box-sizing: border-box;
    width: 380px;
    height: 100%;
    margin: 0 auto;
    padding: 15px;
    border-radius: 30px;
    background-color: #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);
  }
  .mobileBox {
    width: 100%;
    height: 100%;
    border-radius: 20px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
  }
  .mobileContent {
    height: calc(100% - 10px);
    margin-top: 5px;
    overflow: auto;
  }
`;

const dealComponents = (components = []) => {
  const hidedComponents = [];
  const visibleComponents = [];
  components.forEach(item => {
    const { mobile = {} } = item;
    // eslint-disable-next-line no-unused-expressions
    mobile.visible ? visibleComponents.push(item) : hidedComponents.push(item);
  });
  return { hidedComponents, visibleComponents };
};
export default function MobileLayout(props) {
  const { components, updateWidgetVisible } = props;
  const { hidedComponents, visibleComponents } = dealComponents(components);
  return (
    <Fragment>
      <MobileList>
        <div className="title Bold Gray_75">{_l('隐藏组件')}</div>
        {hidedComponents.length > 0 ? (
          <ul>
            {hidedComponents.map(
              (item, index) =>
                !item.mobile.visible && (
                  <li onClick={() => updateWidgetVisible({ widget: item, layoutType: 'mobile' })}>
                    <i className={`icon-${getIconByType(item.type)} Gray_75`}></i>
                    <div className="name overflow_ellipsis">{getComponentTitleText(item)}</div>
                    <i className="icon-add add"></i>
                  </li>
                )
            )}
          </ul>
        ) : (
          <div className="emptyHint">
            <i className="icon-visibility_off Gray_9e"></i>
            <p>{_l('点击右侧预览区组件上的隐藏按钮，隐藏的组件在移动端不显示')}</p>
          </div>
        )}
      </MobileList>
      <MobileConfig>
        <div className="mobileWrap">
          <div className="mobileBox">
            <div className="mobileContent">
              <WidgetContent {...props} layoutType="mobile" components={visibleComponents} />
            </div>
          </div>
        </div>
      </MobileConfig>
    </Fragment>
  );
}
