import React, { useEffect, useState } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import { functionDetails } from '../enum';

const Con = styled.div`
  height: 100%;
  padding: 16px 0 0;
  font-size: 13px;
  line-height: 24px;
  overflow: auto;
  .fn {
    font-size: 17px;
    font-weight: 500;
  }
  .grey,
  g {
    color: #757575;
  }
  .green {
    color: #4caf50;
  }
  .control {
    display: inline-block;
    margin: 0 4px;
    height: 24px;
    line-height: 22px;
    color: #3c6b90;
    padding: 0 8px;
    border-radius: 24px;
    border: 1px solid #bbd6ea;
    background: #d8eeff;
    font-weight: 500;
  }
  ul {
    list-style: inside;
    li {
      list-style: inherit;
      margin: 5px 0;
    }
  }
`;

const Des = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #757575;
  bb {
    font-size: 14px !important;
  }
  bb,
  b {
    font-weight: 500;
    color: #151515;
    margin: 6px 0 4px;
    display: inline-block;
  }
`;

function beautify(content) {
  return content
    .replace(/(\w+)\(/g, '<span class="green">$1</span>(')
    .replace(/\$([\w\u4e00-\u9fa5]+)\$/g, '<span class="control">$1</span>');
}

export default function Tip(props) {
  const { type } = props;
  const [hoverFn, setHoverFn] = useState();
  const [activeFn, setActiveFn] = useState();
  const visibleFn = hoverFn || activeFn;
  const fn = functionDetails[visibleFn];
  function handleEnter(fnKey) {
    setHoverFn(fnKey);
  }
  function handleLeave() {
    setHoverFn(activeFn);
  }
  function handleClick(fnKey) {
    setActiveFn(fnKey);
  }
  function clear() {
    setHoverFn(undefined);
    setActiveFn(undefined);
  }
  useEffect(() => {
    window.emitter.addListener('FUNCTIONEDITOR_FOCUS_FN', handleEnter);
    window.emitter.addListener('FUNCTIONEDITOR_BLUR_FN', handleLeave);
    window.emitter.addListener('FUNCTIONEDITOR_ACTIVE_FN', handleClick);
    window.emitter.addListener('FUNCTIONEDITOR_CLEAR', clear);
    return () => {
      window.emitter.removeListener('FUNCTIONEDITOR_FOCUS_FN', handleEnter);
      window.emitter.removeListener('FUNCTIONEDITOR_BLUR_FN', handleLeave);
      window.emitter.removeListener('FUNCTIONEDITOR_ACTIVE_FN', handleClick);
      window.emitter.removeListener('FUNCTIONEDITOR_CLEAR', clear);
    };
  }, []);
  return (
    <Con>
      {type === 'javascript' ? (
        <ul>
          <li>{_l('请在函数头部定义变量接受字段动态值')}</li>
          <li>{_l('自定义函数指采用 JavaScript 代码来实现函数，函数体需要返回一个值')}</li>
          <li>{_l('自定义函数采用异步更新，函数独立线程运行不会阻塞 UI')}</li>
          <li>{_l('函数 1 秒内没有返回结果将被主动终止')}</li>
        </ul>
      ) : (
        <React.Fragment>
          {!visibleFn && (
            <ul>
              <b>{_l('请填写函数、参数和运算符进行运算；函数和字段可从左侧面板选择或直接输入')}</b>
              <li>
                <span
                  dangerouslySetInnerHTML={{
                    __html: beautify(_l('公式编辑示例：NETWORKDAYS($开始时间$, $结束$)')),
                  }}
                />
              </li>
              <li>
                {_l('将选项等复杂字段作为文本使用时请使用STRING函数，比如')}
                <span
                  dangerouslySetInnerHTML={{
                    __html: beautify(_l('STRING($单选$)')),
                  }}
                />
              </li>
            </ul>
          )}
          {visibleFn && fn && (
            <div>
              <div className="fn">{visibleFn}</div>
              <div className="grey">{fn.title}</div>
              <ul>
                <Des
                  dangerouslySetInnerHTML={{
                    __html: beautify(fn.des || ''),
                  }}
                />
              </ul>
            </div>
          )}
        </React.Fragment>
      )}
    </Con>
  );
}

Tip.propTypes = {
  type: string,
};
