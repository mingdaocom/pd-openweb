import React from 'react';
import styled from 'styled-components';
import { FIELD_TYPE_LIST } from '../../../enum';

const Box = styled.div`
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  overflow: hidden;
  .header {
    background: #f2f2f2;
    height: 40px;
    line-height: 40px;
    > div {
      border-right: 1px solid #ddd;
      &:last-child {
        border: none;
      }
    }
  }
  .w80 {
    width: 80px;
  }
  .w130 {
    width: 130px;
  }
  .w180 {
    width: 180px;
  }
  .list {
    li {
      min-height: 40px;
      border-top: 1px solid #ddd;
      line-height: 20px;
      div {
        min-height: 40px;
        border-right: 1px solid #ddd;
        word-break: break-all;
        &:last-child {
          border: none;
        }
        input {
          width: 100%;
          border: none;
          height: 40px;
        }
      }
    }
  }
`;

const ErrorTips = styled.div`
  position: absolute;
  bottom: 25px;
  transform: translateY(-7px);
  z-index: 1;
  left: 130px;
  border-radius: 3px;
  color: #fff;
  padding: 5px 12px;
  white-space: nowrap;
  background: #f44336;
  font-size: 12px;
  min-height: auto !important;
  .errorArrow {
    position: absolute;
    transform: translateY(-5px);
    z-index: 1;
    left: 12px;
    background: transparent;
    border: 6px solid transparent;
    border-top-color: #f44336;
    bottom: -17px;
  }
`;

export default ({ data = [], list = [], errorItems, setErrorItems, updateSource }) => {
  return (
    <Box>
      <div className="header flexRow">
        <div className="bold pLeft15 pRight15 w130">{_l('名称')}</div>
        <div className="bold pLeft15 pRight15 w180">{_l('参数名')}</div>
        <div className="bold pLeft15 pRight15 w80">{_l('类型')}</div>
        <div className="bold pLeft15 pRight15 flex">{_l('参考值')}</div>
      </div>
      <ul className="list">
        {list.map(obj => {
          return (
            <li className="flexRow relative" key={obj.controlId}>
              <div className="pLeft15 pRight15 w130 pTop10 pBottom10">{obj.controlName}</div>
              <div className="pLeft15 pRight15 w180">
                <input
                  type="text"
                  placeholder={_l('请输入参数名')}
                  value={obj.alias}
                  onFocus={e => e.target.select()}
                  onChange={e => {
                    const value = e.target.value.trim();
                    let error = '';

                    if (value) {
                      if (!/^[a-zA-Z]{1}\w*$/.test(value)) {
                        error = 1;
                      } else if (list.filter(o => value === o.alias && o.controlId !== obj.controlId).length > 0) {
                        error = 2;
                      } else {
                        error = '';
                      }
                    } else {
                      error = '';
                    }

                    const others = list.filter(o => o.controlId !== obj.controlId);
                    let repeatControl = {};
                    others.forEach(element => {
                      if (
                        !_.find(others, o => o.controlName === element.controlName && o.controlId !== element.controlId)
                      ) {
                        repeatControl[element.controlId] = errorItems[element.controlId] === 1 ? 1 : '';
                      }
                    });

                    setErrorItems(Object.assign({}, errorItems, { [obj.controlId]: error }, repeatControl));
                    updateSource(
                      data.map(o => {
                        if (o.controlId === obj.controlId) {
                          o.alias = value;
                        }
                        return o;
                      }),
                    );
                  }}
                />
              </div>
              <div className="pLeft15 pRight15 w80 pTop10 pBottom10">
                {_.find(FIELD_TYPE_LIST, o => o.value === obj.type).text}
              </div>
              <div className="pLeft15 pRight15 flex">
                {obj.type !== 10000003 ? (
                  <input
                    type="text"
                    placeholder={_l('请输入参考值')}
                    value={obj.value}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      updateSource(
                        data.map(o => {
                          if (o.controlId === obj.controlId) {
                            o.value = e.target.value;
                          }
                          return o;
                        }),
                      );
                    }}
                    onBlur={e => {
                      updateSource(
                        data.map(o => {
                          if (o.controlId === obj.controlId) {
                            o.value = e.target.value.trim();
                          }
                          return o;
                        }),
                      );
                    }}
                  />
                ) : (
                  <div className="LineHeight40">{obj.value}</div>
                )}
              </div>
              {!!errorItems[obj.controlId] && (
                <ErrorTips>
                  {errorItems[obj.controlId] === 1 ? _l('非法字符') : _l('参数名称不允许重复')}
                  <i className="errorArrow" />
                </ErrorTips>
              )}
            </li>
          );
        })}
      </ul>
    </Box>
  );
};
