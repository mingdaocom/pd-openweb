import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { isFormulaResultAsSubtotal } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { canAgg, canChooseForParent, formatControls, getCanSelectControls, isIn, sourceIsMax } from '../util';

const Wrap = styled.div`
  width: 240px;
  overflow-y: auto;
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
    line-height: 16px;
    &:hover {
      background: #f5f5f5;
    }
    &.hs {
      background: #f5f5f5;
      color: #2196f3;
    }
    &.disable {
      cursor: not-allowed;
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
  const { title, onChange, parentName, showNext, controlId, hasFormat } = props;
  const [{ keywords }, setState] = useSetState({ keywords: '' });
  useEffect(() => {
    setTimeout(() => {
      inputRef.current && inputRef.current.focus();
    }, 300);
  }, []);
  const renderDrop = () => {
    let controlsByKey = (hasFormat ? props.controls : formatControls(props.controls, props.worksheetId)).filter(
      o =>
        (o.controlName || '').toLowerCase().indexOf((keywords || '').toLowerCase()) >= 0 &&
        (parentName ? ![29, 34, 35].includes(o.type) : !parentName), //下集不可选 关联记录、级连选择、子表
    );

    controlsByKey = controlsByKey.filter(it =>
      !props.forAggregation
        ? ![31, 37, 6, 8].includes(it.type)
        : !(
            (it.type === 38 && it.enumDefault === 2) || //聚合不支持公式日期加减
            (it.type === 37 && !isFormulaResultAsSubtotal(it))
          ),
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
              const isFull =
                o.isFull || ([29, 34, 35].includes(o.type) && !canChooseForParent(props.flowData, o.dataSource));
              const isValidName = name => {
                return /^[^`~!@#$%^&*()\-+=<>?:"{}|,./;'\[\]·！￥…（）—《》？：“”【】、；‘，。\s\\]+$/.test(name);
              };
              const disable = o.disableChoose || o.isLimit || isFull || !isValidName(o.controlName);
              const hs = controlId === o.controlId;
              return (
                <div
                  className={cx('itemControl flexRow alignItemsCenter', {
                    hs,
                    disable: disable && ![29, 34, 35].includes(o.type),
                    Hand: !disable,
                  })}
                  onClick={event => {
                    if (isFull) {
                      sourceIsMax(_.get(props, 'flowData.projectId'));
                      return;
                    }
                    if (disable) {
                      return;
                    }
                    if ([29, 34, 35].includes(o.type) && !parentName) {
                      //关联记录、级连选择、子表 (一级)只支持选下集
                      showNext(o.controlId);
                      return;
                    }
                    onChange(o);
                  }}
                >
                  <div className={cx('flex flexRow alignItemsCenter', disable ? 'disable' : 'Hand')}>
                    <Icon
                      icon={o.controlId === 'rowscount' ? 'calculate' : getIconByType(o.type)}
                      className={cx('Font16', hs ? 'ThemeColor3' : disable ? 'Gray_bd' : 'Hand Gray_9e')}
                    />
                    <div
                      className={cx(
                        'flex mLeft8 WordBreak overflow_ellipsis',
                        hs ? 'ThemeColor3' : disable ? 'Gray_bd' : 'Gray',
                      )}
                    >
                      {o.controlName}
                    </div>
                  </div>
                  {(o.relationControls || []).length > 0 && !parentName && showNext && (
                    <Icon
                      icon={'arrow-right-tip'}
                      className={cx('mLeft10', disable ? 'Gray_bd' : 'Hand Gray_9e')}
                      onClick={e => {
                        if (disable) {
                          return;
                        }
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
        key={'choose_control'}
        controlId={controlId}
        showNext={controlId => {
          setState({
            controlId,
          });
        }}
      />
      {controlId && (
        <React.Fragment>
          <div className="lineLeft"></div>
          <ChooseControl
            {...props}
            key={'child_choose_control_' + controlId}
            onChange={info => {
              //子集信息
              props.onChange({ control: controls.find(o => o.controlId === controlId) || {}, childrenControl: info });
            }}
            controls={((controls.find(o => o.controlId === controlId) || {}).relationControls || []).map(oo => {
              const parent = controls.find(o => o.controlId === controlId) || {};
              const isFull =
                [29, 34, 35].includes(parent.type) && !canChooseForParent(props.flowData, parent.dataSource);
              if (
                isIn(
                  props.flowData,
                  oo,
                  controls.find(o => o.controlId === controlId) || {},
                  props.worksheetId,
                  props.forAggregation,
                ) ||
                (props.forAggregation &&
                  !canAgg(oo, controls.find(o => o.controlId === controlId) || {}, props.flowData))
              ) {
                return { ...oo, disableChoose: true, isFull };
              }
              return { ...oo, disableChoose: false, isFull };
            })}
            parentName={_l('关联')}
            title={(controls.find(o => o.controlId === controlId) || {}).controlName}
          />
        </React.Fragment>
      )}
    </WrapCon>
  );
}
