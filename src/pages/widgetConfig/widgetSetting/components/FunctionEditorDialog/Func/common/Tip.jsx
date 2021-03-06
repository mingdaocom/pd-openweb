import React, { useState, useEffect } from 'react';
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

const List = styled.ul`
  margin: 0;
  padding-left: 20px;
`;
const Item = styled.li``;
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
    color: #333;
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
  useEffect(() => {
    window.emitter.addListener('FUNCTIONEDITOR_FOCUS_FN', handleEnter);
    window.emitter.addListener('FUNCTIONEDITOR_BLUR_FN', handleLeave);
    window.emitter.addListener('FUNCTIONEDITOR_ACTIVE_FN', handleClick);
    return () => {
      window.emitter.removeListener('FUNCTIONEDITOR_FOCUS_FN', handleEnter);
      window.emitter.removeListener('FUNCTIONEDITOR_BLUR_FN', handleLeave);
      window.emitter.removeListener('FUNCTIONEDITOR_ACTIVE_FN', handleClick);
    };
  }, []);
  return (
    <Con>
      {type === 'javascript' ? (
        <ul>
          <li>{_l('???????????????????????????????????????????????????')}</li>
          <li>{_l('???????????????????????? JavaScript ??????????????????????????????????????????????????????')}</li>
          <li>{_l('???????????????????????????????????????????????????????????????????????? UI')}</li>
          <li>{_l('?????? 1 ??????????????????????????????????????????')}</li>
        </ul>
      ) : (
        <React.Fragment>
          {!visibleFn && (
            <ul>
              <li>{_l('?????????????????????????????????????????????????????????')}</li>
              <li>
                <span
                  dangerouslySetInnerHTML={{
                    __html: beautify(_l('?????????????????????NETWORKDAYS($????????????$, $??????$)')),
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
