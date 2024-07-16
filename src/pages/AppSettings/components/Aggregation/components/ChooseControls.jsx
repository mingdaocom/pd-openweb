import React, { Fragment, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { getCanSelectControls, formatControls } from '../util';

const Wrap = styled.div`
  width: 240px;
  max-height: 320px;
  min-height: 300px;
  .controls {
    overflow-y: auto;
  }
  .title {
    padding: 0 16px;
    margin-top: 10px;
  }
  .search {
    position: relative;
    width: calc(100% - 32px);
    margin: 0 auto;
    i {
      position: absolute;
      top: 11px;
      left: 8px;
      font-size: 18px;
    }
    input {
      box-sizing: border-box;
      width: 100%;
      height: 36px;
      border: none;
      outline: none;
      padding-left: 30px;
      border: 1px solid #dddddd;
      opacity: 1;
      border-radius: 4px;
      &::placeholder {
        color: #ccc;
      }
    }
  }
  .itemControl {
    padding: 10px 16px;
    &:hover {
      background: #f5f5f5;
    }
    &.hs {
      background: #f5f5f5;
      color: #2196f3;
    }
  }
`;
const WrapCon = styled.div`
  .lineLeft {
    width: 0;
    // height: 100%;
    max-height: 500px;
    border-left: 1px solid #dddddd;
  }
`;

function ChooseControl(props) {
  const inputRef = useRef(null);
  const { title, onChange, parentName, showNext, controlId } = props;
  const [{ keywords }, setState] = useSetState({ keywords: '' });
  useEffect(() => {
    setTimeout(() => {
      inputRef.current && inputRef.current.focus();
    }, 300);
  }, []);
  const renderDrop = () => {
    const controlsByKey = formatControls(props.controls).filter(
      o => (o.controlName || '').toLowerCase().indexOf((keywords || '').toLowerCase()) >= 0,
    );
    return (
      <React.Fragment>
        <div className="title Bold Gray_75 Font13 WordBreak overflow_ellipsis">
          {parentName ? `>${parentName}` : title}
          {parentName && <span className="ThemeColor3 pLeft5">{title}</span>}
        </div>
        <div className="search mTop8 mBottom6">
          <i className="icon-search Gray_9e" />
          <input
            value={keywords}
            autofocus
            ref={inputRef}
            onChange={e => setState({ keywords: e.target.value })}
            placeholder={_l('搜索字段')}
          />
        </div>
        <div className="flex controls">
          {controlsByKey.length <= 0 ? (
            <div className="Gray_9e mTop40 pTop8 TxtCenter pBottom20">{_l('暂无相关字段')}</div>
          ) : (
            controlsByKey.map(o => {
              const disable = (props.list || []).includes(o.controlId);
              const hs = controlId === o.controlId;
              return (
                <div
                  className={cx('itemControl flexRow alignItemsCenter', { hs })}
                  onClick={event => {
                    if (disable) {
                      return;
                    }
                    onChange(o);
                  }}
                >
                  <div className={cx('flex flexRow alignItemsCenter', disable ? 'disable' : 'Hand')}>
                    <Icon
                      icon={o.controlId === 'rowscount' ? 'calculate' : getIconByType(o.type)}
                      className={cx('Font16', hs ? 'ThemeColor3' : 'Gray_9e')}
                    />
                    <div className={cx('flex mLeft8 WordBreak overflow_ellipsis', hs ? 'ThemeColor3' : 'Gray')}>
                      {o.controlName}
                    </div>
                  </div>
                  {(o.relationControls || []).length > 0 && !parentName && showNext && (
                    <Icon
                      icon={'arrow-right-tip'}
                      className="Gray_9e Hand mLeft10"
                      onClick={e => {
                        e.stopPropagation();
                        showNext(o.controlId);
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </React.Fragment>
    );
  };
  return <Wrap className="flexColumn">{renderDrop(props)}</Wrap>;
}

export default function ChooseControls(props) {
  const [{ controlId, controls }, setState] = useSetState({ controlId: '', controls: [] });
  useEffect(() => {
    let sourceInfos = !props.addRowsCount
      ? props.sourceInfos
      : props.sourceInfos.map(o => {
          if (o.worksheetId === props.worksheetId) {
            return { ...o, controls: [{ controlId: 'rowscount', controlName: _l('记录数量') }].concat(o.controls) };
          } else {
            return o;
          }
        });
    let controlList = getCanSelectControls(sourceInfos, props.flowData, props.worksheetId, props.forAggregation);
    setState({
      controls: controlList,
    });
  }, [props.sourceInfos, props.flowData, props.worksheetId, props.addRowsCount]);

  return (
    <WrapCon className="flexRow h100">
      <ChooseControl
        {...props}
        controls={controls}
        onChange={info => {
          props.onChange({ control: info });
        }}
        controlId={controlId}
        // showNext={controlId => {
        //   setState({
        //     controlId,
        //   });
        // }}
      />
      {/* {controlId && (
        <React.Fragment>
          <div className="lineLeft"></div>
          <ChooseControl
            {...props}
            onChange={info => {
              //子集信息
              props.onChange({ control: controls.find(o => o.controlId === controlId) || {}, childrenControl: info });
            }}
            controls={((controls.find(o => o.controlId === controlId) || {}).relationControls || []).filter(
              o => !_.includes(getConfigControls(props.flowData), `${props.worksheetId}_${o.controlId}`),
            )}
            parentName={_l('关联')}
            title={(controls.find(o => o.controlId === controlId) || {}).controlName}
          />
        </React.Fragment>
      )} */}
    </WrapCon>
  );
}
