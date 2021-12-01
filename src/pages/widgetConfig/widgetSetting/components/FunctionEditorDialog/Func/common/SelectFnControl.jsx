import React, { useState } from 'react';
import styled from 'styled-components';
import { func, arrayOf, shape } from 'prop-types';
import FnList from './FnList';
import ControlList from './ControlList';

const Con = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
const Tabs = styled.div`
  margin: 10px;
  height: 36px;
  padding: 4px;
  border-radius: 6px;
  background-color: #eaeaea;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.16);
`;
const Tab = styled.div`
  display: inline-block;
  font-weight: 500;
  cursor: pointer;
  width: 50%;
  height: 28px;
  line-height: 28px;
  text-align: center;
  font-size: 13px;
  color: #757575;
  border-radius: 6px;
  &.active {
    color: #333;
    background: #fff;
  }
`;
const Search = styled.div`
  margin: 0 10px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  input {
    border: none;
    outline: none;
    padding: 0 10px;
    height: 36px;
    line-height: 36px;
    flex: 1;
    background: transparent;
  }
`;
const Icon = styled.i`
  font-size: 20px;
  color: #9d9d9d;
`;
const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

export default function SelectFnControl(props) {
  const { controls, insertTagToEditor, insertFn } = props;
  const [keywords, setKeywords] = useState('');
  const [activeTab, setActiveTab] = useState('fn');
  return (
    <Con>
      <Tabs>
        {[
          {
            name: 'fn',
            text: _l('函数'),
          },
          {
            name: 'control',
            text: _l('字段'),
          },
        ].map((item, i) => (
          <Tab
            key={i}
            className={activeTab === item.name ? 'active' : ''}
            onClick={() => {
              setActiveTab(item.name);
              setKeywords('');
            }}
          >
            {item.text}
          </Tab>
        ))}
      </Tabs>
      <Search>
        <Icon className="icon icon-search" />
        <input type="text" value={keywords} placeholder={_l('搜索')} onChange={e => setKeywords(e.target.value)} />
      </Search>
      <Content>
        {activeTab === 'fn' && <FnList keywords={keywords} insertFn={insertFn} />}
        {activeTab === 'control' && (
          <ControlList keywords={keywords} controls={controls} insertTagToEditor={insertTagToEditor} />
        )}
      </Content>
    </Con>
  );
}

SelectFnControl.propTypes = {
  insertTagToEditor: func,
  insertFn: func,
  controls: arrayOf(shape({})),
};
