import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const TabsCon = styled.div`
  text-align: ${({ center }) => (center ? 'center' : 'left')};
`;
const Tab = styled.div`
  position: relative;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px !important;
  color: ${({ active }) => (active ? '#1677ff' : '#757575')};
  padding: 0 30px;
  line-height: 50px;
  display: inline-block;
  text-decoration: none;
  :hover {
    color: #1677ff;
  }
  ::after {
    content: ' ';
    position: absolute;
    left: 18px;
    right: 18px;
    bottom: 0px;
    height: 3px;
    background-color: ${({ active }) => (active ? '#1677ff' : 'transparent')};
  }
`;

export default class Tabs extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    center: PropTypes.bool, // 是否居中 默认 是
    tabStyle: PropTypes.shape({}), // 覆盖 tab 样式
    tabs: PropTypes.arrayOf(PropTypes.shape({})), // tab 数据列表 { value: 1, text: '测试', active: false }
    active: PropTypes.any,
    onChange: PropTypes.func, // 更改回掉 返回整个 tab
  };

  static defaultProps = {
    center: true,
    tabs: [],
    onChange: () => {},
  };

  render() {
    const { tabs, active, className, tabStyle, center, onChange } = this.props;
    return (
      <TabsCon className={className} center={center}>
        {tabs.map((tab, i) => (
          <Tab
            key={i}
            style={tabStyle}
            active={active === tab.value}
            onClick={() => {
              onChange(tab);
            }}
          >
            {tab.text}
          </Tab>
        ))}
      </TabsCon>
    );
  }
}
