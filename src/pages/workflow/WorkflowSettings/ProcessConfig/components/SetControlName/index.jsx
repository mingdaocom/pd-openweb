import React, { Fragment } from 'react';
import styled from 'styled-components';
import { FIELD_TYPE_LIST } from '../../../enum';
import cx from 'classnames';
import _ from 'lodash';

const FIELD_TYPE = FIELD_TYPE_LIST.concat([{ text: _l('对象'), value: 10000006, en: 'object' }]);

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
  .w20 {
    width: 20px;
    .clearLine {
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 1px;
      background: #fff;
      z-index: 1;
    }
  }
  .w110 {
    width: 110px;
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
  const updateReferenceValue = ({ controlId, dataSource }, value) => {
    return data.map(o => {
      if (o.controlId === controlId) {
        o.value = value;
      }
      if (o.controlId === dataSource) {
        const objectArray = {};
        let isAllEmpty = true;

        data
          .filter(item => item.dataSource === dataSource)
          .forEach(item => {
            if ((controlId === item.controlId && value) || (controlId !== item.controlId && item.value)) {
              isAllEmpty = false;
            }

            objectArray[item.alias || item.controlId] = controlId === item.controlId ? value : item.value || '';
          });

        o.value = isAllEmpty ? '' : JSON.stringify([objectArray]);
      }
      return o;
    });
  };

  const renderList = source => {
    return source.map((obj, index) => {
      if (obj.dataSource && _.find(list, o => o.controlId === obj.dataSource).type === 10000007) {
        return null;
      }

      return (
        <Fragment>
          <li className="flexRow relative" key={obj.controlId}>
            {obj.dataSource && (
              <div className="w20 relative">{index !== source.length - 1 && <span className="clearLine" />}</div>
            )}
            <div className={cx('pLeft15 pRight15 pTop10 pBottom10', obj.dataSource ? 'w110' : 'w130')}>
              {obj.controlName}
            </div>
            <div className="pLeft15 pRight15 w110 pTop10 pBottom10">
              {_.find(FIELD_TYPE, o => o.value === obj.type).text}
            </div>
            <div className="pLeft15 pRight15 w180">
              <input
                type="text"
                placeholder={_l('请输入别名')}
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
                    if (!_.find(others, o => o.alias === element.alias && o.controlId !== element.controlId)) {
                      repeatControl[element.controlId] = errorItems[element.controlId] === 1 ? 1 : '';
                    }
                  });

                  setErrorItems(Object.assign({}, errorItems, { [obj.controlId]: error }, repeatControl));
                  updateSource(
                    data
                      .map(o => {
                        if (o.controlId === obj.controlId) {
                          o.alias = value;
                        }
                        return o;
                      })
                      .map(o => {
                        if (o.controlId === obj.dataSource) {
                          const objectArray = {};
                          let isAllEmpty = true;

                          data
                            .filter(item => item.dataSource === obj.dataSource)
                            .forEach(item => {
                              if (item.value) isAllEmpty = false;
                              objectArray[item.alias || item.controlId] = item.value || '';
                            });

                          o.value = isAllEmpty ? '' : JSON.stringify([objectArray]);
                        }
                      }),
                  );
                }}
              />
            </div>
            <div className="pLeft15 pRight15 flex">
              {!_.includes([10000003, 10000008], obj.type) ? (
                <input
                  type="text"
                  placeholder={_l('请输入参考值')}
                  value={obj.value}
                  onFocus={e => e.target.select()}
                  onChange={e => updateSource(updateReferenceValue(obj, e.target.value))}
                  onBlur={e => updateSource(updateReferenceValue(obj, e.target.value.trim()))}
                />
              ) : (
                <div className="flexRow alignItemsCenter">{obj.value}</div>
              )}
            </div>
            {!!errorItems[obj.controlId] && (
              <ErrorTips>
                {errorItems[obj.controlId] === 1 ? _l('非法字符') : _l('参数名称不允许重复')}
                <i className="errorArrow" />
              </ErrorTips>
            )}
          </li>
          {renderList(list.filter(o => o.dataSource === obj.controlId))}
        </Fragment>
      );
    });
  };

  return (
    <Box>
      <div className="header flexRow">
        <div className="bold pLeft15 pRight15 w130">{_l('参数名')}</div>
        <div className="bold pLeft15 pRight15 w110">{_l('类型')}</div>
        <div className="bold pLeft15 pRight15 w180">{_l('别名')}</div>
        <div className="bold pLeft15 pRight15 flex">{_l('参考值')}</div>
      </div>
      <ul className="list">{renderList(list.filter(o => !o.dataSource))}</ul>
    </Box>
  );
};
