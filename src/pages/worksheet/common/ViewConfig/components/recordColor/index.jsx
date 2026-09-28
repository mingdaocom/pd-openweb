import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import { arrayOf, func, shape, string } from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Button, Select, Switch, Tooltip } from 'ming-ui/antd-components';
import Checkbox from 'src/components/Form/DesktopForm/widgets/Checkbox';
import AddCondition from 'src/pages/worksheet/common/WorkSheetFilter/components/AddCondition';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { RECORD_COLOR_SHOW_TYPE } from 'src/utils/domain/worksheet/constants';

const Wrap = styled.div`
  .line {
    width: 100%;
    height: 1px;
    background: var(--color-border-primary);
  }
`;
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
      color: var(--color-text-title);
      text-align: center;
      padding: 0;
      padding-top: 32px;
      margin: 0;
    }
    .text {
      font-weight: 400;
      text-align: center;
      color: var(--color-text-tertiary);
      line-height: 20px;
      font-size: 13px;
      width: 80%;
      margin: 24px auto 0;
    }
  }
  .customAntSelect {
    margin-top: 10px;
  }
`;

const ADD_BUTTON_STYLE = { '--hap-button-default-color': 'var(--color-primary)' };
const SELECT_CONTROL_CLASS_NAMES = { clear: 'recordColorSelectClear' };
const SELECT_CONTROL_SUFFIX_ICON = <Icon icon="arrow-down-border" className="Font13 textTertiary" />;

const handleSelectControlClick = event => {
  if (event.target.closest?.('.recordColorSelectClear')) {
    event.stopPropagation();
  }
};

function typesInclude(types = [], control = {}) {
  return _.includes(types, control.type) || (control.type === 30 && _.includes(types, control.sourceControlType));
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
        <Select
          className="w100"
          open={false}
          value={value}
          options={[{ value, label: selectedControl.controlName }]}
          prefix={<i className={`icon-${getIconByType(selectedControl.type)} Font16 textSecondary`} />}
          allowClear
          classNames={SELECT_CONTROL_CLASS_NAMES}
          suffixIcon={SELECT_CONTROL_SUFFIX_ICON}
          onClear={onClear}
          onClick={handleSelectControlClick}
        />
      )}
    />
  );
}

SelectControl.propTypes = {
  value: string,
  controls: arrayOf(shape({})),
  onChange: func,
  onClear: func,
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
    color: var(--color-text-title);
    font-weight: bold;
    cursor: pointer;
    .selected {
      position: absolute;
      color: #f52222;
      font-size: 18px;
      right: -9px;
      top: -9px;
      border-radius: 18px;
      background: var(--color-background-primary);
    }
    &.type-0 {
      border: 1px solid var(--color-border-secondary);
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
      background: var(--color-error-bg);
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
      background: var(--color-error-bg);
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
          {value === RECORD_COLOR_SHOW_TYPE[showType] && <i className="selected icon-check_circle"></i>}
        </span>
      ))}
    </SelectColorShowTypeCon>
  );
}

SelectColorShowType.propTypes = {
  value: string,
  onChange: func,
};

function RecordColor(params) {
  const { worksheetControls = [], view = {}, onChange } = params;
  const { advancedSetting = {} } = view;
  const { colorid, coloritems, colortype } = advancedSetting;

  const updateAdvancedSetting = data => {
    onChange(data);
  };

  const filteredControls = worksheetControls.filter(c => typesInclude([9, 11], c));
  const selectedControl = _.find(filteredControls, { controlId: colorid });
  return (
    <Con>
      <div className="textSecondary mTop20">{_l('使用单选项为记录标记颜色')}</div>
      {selectedControl ? (
        <div className="hasData">
          <div className="Font3 Bold mTop16 mBottom8 valignWrapper">
            {_l('字段')}
            {selectedControl && selectedControl.enumDefault2 !== 1 && (
              <Tooltip title={_l('当前选择的字段未启用颜色')}>
                <i className="icon icon-error1 Font16 mLeft6" style={{ color: 'var(--color-warning)' }}></i>
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
          <div className="Font3 Bold mTop24 mBottom8">{_l('显示项')}</div>
          <Select
            className="w100"
            options={[
              { label: _l('全部'), value: 0 },
              { label: _l('显示指定项'), value: 1 },
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
                options: selectedControl.options.map(o => {
                  return { ...o, hide: false }; //视图 记录显示项配置不隐藏选项
                }),
              }}
              default={undefined}
              fromFilter
              isFocus
              className="optionsSelect mTop14"
              dropdownClassName="scrollInTable"
              value={coloritems}
              onChange={newValue => {
                updateAdvancedSetting({
                  coloritems: newValue,
                });
              }}
            />
          )}
          {!['5', '7'].includes(String(view.viewType)) && (
            <Fragment>
              <div className="Font3 Bold mTop24 mBottom8">{_l('显示方式')}</div>
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
            <Button
              block
              className="mTop4"
              color="default"
              variant="filled"
              size="large"
              style={ADD_BUTTON_STYLE}
              icon={<Icon icon="add" className="Font16" />}
            >
              {_l('选择字段')}
            </Button>
          )}
        />
      )}
    </Con>
  );
}

export default function (props) {
  const { updateCurrentView, view, appId } = props;
  const [openList, setState] = useState(['record', 'control']);
  const tabName = _l('颜色');

  const renderHead = key => {
    return (
      <div
        className="headerCon Hand mTop24"
        onClick={() => {
          setState(openList.includes(key) ? openList.filter(o => o !== key) : openList.concat(key));
        }}
      >
        <Icon icon={openList.includes(key) ? 'arrow-down' : 'arrow-right-tip'} className="Font14 textTertiary" />
        <span className="Font15 Bold mLeft10">{key === 'control' ? _l('字段') : _l('记录')}</span>
      </div>
    );
  };

  const onChangeControlByKey = key => {
    updateCurrentView({
      ...view,
      appId,
      advancedSetting: {
        [key]: _.get(view, `advancedSetting.${key}`) === '1' ? '' : '1',
      },
      editAdKeys: [key],
      editAttrs: ['advancedSetting'],
    });
  };

  return (
    <Wrap>
      <div className="viewSetTitle">{tabName}</div>
      {renderHead('record')}
      {openList.includes('record') && (
        <RecordColor
          {...props}
          onChange={data => {
            updateCurrentView({
              ...view,
              appId,
              advancedSetting: data,
              editAdKeys: Object.keys(data),
              editAttrs: ['advancedSetting'],
            });
          }}
        />
      )}
      {/* 支持的视图：表格、看板、画廊、层级、详情、地图视图 */}
      {['0', '1', '3', '2', '6', '8'].includes(String(view.viewType)) && (
        <React.Fragment>
          <div className="line mTop24"></div>
          {renderHead('control')}
          {openList.includes('control') && (
            <div className="mTop10">
              <div className="textSecondary mTop20">{_l('显示字段配置中的样式')}</div>
              <div className="flexRow alignItemsCenter viewConfigSwitchRow mTop8">
                <Switch
                  size="mini"
                  checked={_.get(view, 'advancedSetting.controlstyle') === '1'}
                  onChange={() => onChangeControlByKey('controlstyle')}
                />
                <div className="InlineBlock Normal mLeft12 Hand" onClick={() => onChangeControlByKey('controlstyle')}>
                  {_l('在PC端显示')}
                </div>
              </div>
              {_.get(view, 'advancedSetting.hierarchyViewType') !== '3' && (
                <div className="flexRow alignItemsCenter viewConfigSwitchRow">
                  <Switch
                    size="mini"
                    checked={_.get(view, 'advancedSetting.controlstyleapp') === '1'}
                    onChange={() => onChangeControlByKey('controlstyleapp')}
                  />
                  <div
                    className="InlineBlock Normal mLeft12 Hand"
                    onClick={() => onChangeControlByKey('controlstyleapp')}
                  >
                    {_l('在移动端显示')}
                  </div>
                </div>
              )}
            </div>
          )}
        </React.Fragment>
      )}
    </Wrap>
  );
}
