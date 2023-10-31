import React, { Fragment } from 'react';
import styled from 'styled-components';
import { Dropdown, Tooltip } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util';
import { arrayOf, func, shape, string } from 'prop-types';
import Checkbox from 'src/components/newCustomFields/widgets/Checkbox';
import AddCondition from 'src/pages/worksheet/common/WorkSheetFilter/components/AddCondition';
import { RECORD_COLOR_SHOW_TYPE } from 'worksheet/constants/enum';
import _ from 'lodash';
import emptyPng from './img/empty.png';

const Con = styled.div`
  .noData {
    .cover {
      padding-top: 60px;
      img {
        width: 100%;
        display: block;
      }
    }
    h6 {
      font-size: 20px;
      font-weight: 500;
      color: #333333;
      text-align: center;
      padding: 0;
      padding-top: 32px;
      margin: 0;
    }
    .text {
      font-weight: 400;
      text-align: center;
      color: #9e9e9e;
      line-height: 20px;
      font-size: 13px;
      width: 80%;
      margin: 24px auto 0;
    }
  }
  .customAntSelect {
    margin-top: 10px;
    .ant-select-selector {
      border-color: #ddd !important;
      background: #fff !important;
    }
  }
  .customAntSelect:not(.ant-select-open):not(.ant-select-disabled) {
    .ant-select-selector:hover {
      background-color: inherit !important;
      border-color: #ddd !important;
    }
  }
`;

const AddButton = styled.div`
  position: relative;
  background: #2196f3;
  border-radius: 3px;
  color: #fff;
  display: inline-flex;
  width: 138px;
  height: 40px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
`;

const SelectedControlCon = styled.div`
  width: 100%;
  border: 1px solid #eaeaea;
  border-radius: 3px;
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 5px 0 14px;
  &:hover {
    border-color: #2196f3;
  }
  .controlTypeIcon {
    font-size: 16px;
    color: #757575;
  }
  .controlName {
    margin-left: 10px;
    font-size: 14px;
    color: #333;
  }
  .endIcon {
    .icon {
      font-size: 13px;
      color: #9d9d9d;
    }
    .removeIcon {
      display: none;
    }
  }
  &:hover {
    .dropDownIcon {
      display: none;
    }
    .removeIcon {
      display: inline-block;
    }
  }
`;

function typesInclude(types = [], control = {}) {
  return _.includes(types, control.type) || _.includes(types, control.sourceControlType);
}

function SelectControl({ value, controls = [], onChange, onClear }) {
  const selectedControl = _.find(controls, { controlId: value });
  return (
    <AddCondition
      columns={controls.filter(c => typesInclude([9, 11], c) && c.controlId.length === 24)}
      onAdd={onChange}
      style={{
        width: '440px',
      }}
      offset={[0, 0]}
      classNamePopup="addControlDrop"
      comp={() => (
        <SelectedControlCon>
          <i className={`controlTypeIcon icon-${getIconByType(selectedControl.type)}`}></i>
          <div className="controlName ellipsis">{selectedControl.controlName}</div>
          <div className="flex"></div>
          <div className="endIcon">
            <i
              className="icon removeIcon icon-closeelement-bg-circle"
              onClick={e => {
                e.stopPropagation();
                onClear();
              }}
            ></i>
            <i className="icon dropDownIcon icon-arrow-down-border"></i>
          </div>
        </SelectedControlCon>
      )}
    />
  );
}

SelectControl.propTypes = {
  value: string,
  controls: arrayOf(shape({})),
  onChange: func,
};

const SelectColorShowTypeCon = styled.div`
  margin-top: 14px;
  > span {
    position: relative;
    display: inline-flex;
    border-radius: 3px;
    margin-right: 16px;
    width: 78px;
    height: 36px;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    color: #333;
    font-weight: bold;
    cursor: pointer;
    .selected {
      position: absolute;
      color: #f52222;
      font-size: 18px;
      right: -9px;
      top: -9px;
      border-radius: 18px;
      background: #fff;
    }
    &.type-0 {
      border: 1px solid #eaeaea;
      &:before {
        position: absolute;
        content: '';
        width: 4px;
        left: 0;
        top: 0px;
        bottom: 0px;
        background: #f52222;
        border-radius: 3px;
      }
    }
    &.type-1 {
      background: #ffe8e8;
      &:before {
        position: absolute;
        content: '';
        width: 4px;
        left: 0;
        top: 0px;
        bottom: 0px;
        background: #f52222;
        border-radius: 3px;
      }
    }
    &.type-2 {
      background: #ffe8e8;
    }
  }
`;

function SelectColorShowType(props) {
  const { value, onChange } = props;
  return (
    <SelectColorShowTypeCon>
      {Object.keys(RECORD_COLOR_SHOW_TYPE).map((showType, i) => (
        <span
          className={`type-${RECORD_COLOR_SHOW_TYPE[showType]}`}
          key={i}
          onClick={() => onChange(RECORD_COLOR_SHOW_TYPE[showType])}
        >
          Aa
          {value === RECORD_COLOR_SHOW_TYPE[showType] && <i className="selected icon-check_circle1"></i>}
        </span>
      ))}
    </SelectColorShowTypeCon>
  );
}

SelectColorShowType.propTypes = {
  value: string,
  onChange: func,
};

export default function FastFilter(params) {
  const { worksheetControls = [], setFastFilter, view = {}, updateCurrentView, currentSheetInfo } = params;
  const { advancedSetting = {} } = view;
  const { colorid, coloritems, colortype } = advancedSetting;
  const tabName = _l('颜色');
  const tabDescription = _l('选择单选项字段为记录标记颜色，以快速辨别记录之间的区别');
  const updateAdvancedSetting = data => {
    updateCurrentView(
      Object.assign(view, {
        advancedSetting: updateViewAdvancedSetting(view, {
          ...data,
        }),
        editAttrs: ['advancedSetting'],
      }),
    );
  };
  const selectedControl = _.find(worksheetControls, { controlId: colorid });
  return (
    <Con>
      {selectedControl ? (
        <div className="hasData">
          <div className="viewSetTitle">{tabName}</div>
          <div className="Gray_9e mTop8 mBottom4">{tabDescription}</div>
          <div className="Font14 Bold mTop24 mBottom10 valignWrapper">
            {_l('字段')}
            {selectedControl && selectedControl.enumDefault2 !== 1 && (
              <Tooltip className="mLeft6" text={_l('当前选择的字段未启用颜色')}>
                <i className="icon icon-error1 Font16" style={{ color: '#ff9300' }}></i>
              </Tooltip>
            )}
          </div>
          <SelectControl
            value={colorid}
            controls={worksheetControls.filter(c => typesInclude([9, 10, 11], c) && c.controlId.length === 24)}
            onChange={newSelectedControl => {
              updateAdvancedSetting({
                colorid: newSelectedControl.controlId,
                coloritems: '',
                colortype: '0',
              });
            }}
            onClear={() => {
              updateAdvancedSetting({
                colorid: '',
                coloritems: '',
                colortype: '',
              });
            }}
          />
          <div className="Font14 Bold mTop24 mBottom10">{_l('显示项')}</div>
          <Dropdown
            border
            className="w100"
            data={[
              { text: _l('全部'), value: 0 },
              { text: _l('显示指定项'), value: 1 },
            ]}
            value={!coloritems ? 0 : 1}
            onChange={newValue => {
              updateAdvancedSetting({
                coloritems: newValue === 1 ? '[]' : '',
              });
            }}
          />
          {!!coloritems && (
            <Checkbox
              {...{
                ...selectedControl,
                advancedSetting: { ...selectedControl.advancedSetting, allowadd: '0', checktype: '1' },
              }}
              default={undefined}
              fromFilter
              isFocus
              className="optionsSelect mTop14"
              dropdownClassName="scrollInTable withIsEmpty"
              value={coloritems}
              onChange={newValue => {
                updateAdvancedSetting({
                  coloritems: newValue,
                });
              }}
            />
          )}
          {String(view.viewType) !== '5' && (
            <Fragment>
              <div className="Font14 Bold mTop24 mBottom10">{_l('显示方式')}</div>
              <SelectColorShowType
                value={colortype}
                onChange={newValue => {
                  updateAdvancedSetting({
                    colortype: newValue,
                  });
                }}
              />
            </Fragment>
          )}
        </div>
      ) : (
        <div className="noData">
          <div className="cover">
            <img src={emptyPng} alt="" srcset="" />
          </div>
          <h6 className="">{tabName}</h6>
          <p className="text">{tabDescription}</p>
          <div className="mTop32 TxtCenter">
            <AddCondition
              columns={worksheetControls.filter(c => typesInclude([9, 11], c) && c.controlId.length === 24)}
              onAdd={newSelectedControl => {
                updateAdvancedSetting({
                  colorid: newSelectedControl.controlId,
                  coloritems: '',
                  colortype: '0',
                });
              }}
              style={{
                width: '440px',
              }}
              popupAlign={{
                points: ['tc', 'bc'],
                overflow: {
                  adjustX: true,
                  adjustY: true,
                },
              }}
              classNamePopup="addControlDrop"
              comp={() => (
                <AddButton>
                  <i className="icon icon-add Font16 mRight5"></i>
                  {_l('选择字段')}
                </AddButton>
              )}
            />
          </div>
        </div>
      )}
    </Con>
  );
}
