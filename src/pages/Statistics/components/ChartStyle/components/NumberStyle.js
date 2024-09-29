import React, { useState, Fragment } from 'react';
import { Icon, ColorPicker, SvgIcon } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import { Input, Collapse, Checkbox, Switch, Tooltip, Select } from 'antd';
import SelectIcon from 'src/pages/AppHomepage/components/SelectIcon';
import Trigger from 'rc-trigger';
import { normTypes } from 'statistics/common';
import RuleColor from './Color/RuleColor';
import { replaceColor } from 'statistics/Charts/NumberChart';

const Wrap = styled.div`
  .chartTypeSelect {
    & > div,
    .active {
      padding: 3px 8px !important;
    }
    .active .shape {
      background-color: #2196f3;
    }
  }
  .lable {
    width: 100px;
  }
  .colorWrap {
    width: 32px;
    height: 32px;
    border-radius: 3px;
    padding: 4px;
    border: 1px solid #dddddd;
    background-color: #fff;
    .colorBlock {
      width: 100%;
      height: 100%;
    }
  }
  .square,
  .circle {
    width: 12px;
    height: 12px;
    background-color: #9e9e9e;
  }
  .square {
    border-radius: 3px;
  }
  .circle {
    border-radius: 50%;
  }
`;

const EntranceWrapper = styled.div`
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  height: 30px;
  background-color: #fff;
  &.ruleIcon {
    width: 30px;
    margin-left: 10px;
    justify-content: center;
    &:hover {
      background-color: #f5f5f5;
    }
  }
`;

export const sizeTypes = [
  {
    name: _l('小'),
    value: 20,
    titleValue: 15,
  },
  {
    name: _l('默认'),
    value: 28,
    titleValue: 15,
  },
  {
    name: _l('中'),
    value: 42,
    titleValue: 18,
  },
  {
    name: _l('大'),
    value: 80,
    titleValue: 24,
  },
  {
    name: _l('超大'),
    value: 120,
    titleValue: 32,
  },
];

const alignTypes = [
  {
    value: 'left',
    icon: 'format_align_left',
  },
  {
    value: 'center',
    icon: 'format_align_center',
  },
];

const iconTypes = [
  {
    value: 'square',
  },
  {
    value: 'circle',
  },
];

const contrastValueShowTypes = [
  {
    name: _l('百分比'),
    value: 0,
  },
  {
    name: _l('数值'),
    value: 1,
  },
];

const colorTypes = [
  {
    name: _l('绿升红降'),
    value: 0,
  },
  {
    name: _l('红升绿降'),
    value: 1,
  },
];

const maxColumnCount = 6;

export const defaultNumberChartStyle = {
  textAlign: 'center',
  columnCount: 4,
  fontSize: 28,
  fontColor: '#333',
  contrastColor: 0,
  contrastValueDot: 2,
  lastContrastText: _l('环比'),
  contrastText: _l('同比'),
  shape: 'square',
  iconVisible: false,
  iconColor: '#2196F3',
  icon: '3_1_coins',
};

const CardLayout = props => {
  const { xaxes, yaxisList, numberChartStyle, onChangeNumberStyle } = props;

  const changeColumnCount = value => {
    if (value) {
      value = parseInt(value);
      value = isNaN(value) ? 0 : value;
      value = value > maxColumnCount ? maxColumnCount : value;
    } else {
      value = 1;
    }
    onChangeNumberStyle({ columnCount: value });
  };

  const lableStyle = { width: 90 };

  return (
    <Wrap className="mBottom16">
      <div className="flexRow valignWrapper mBottom12">
        <div style={lableStyle}>{_l('水平对齐方式')}</div>
        <div className="chartTypeSelect flexRow valignWrapper">
          {alignTypes.map(item => (
            <div
              key={item.value}
              className={cx('flex centerAlign pointer Gray_75', {
                active: item.value === (numberChartStyle.textAlign || 'center'),
              })}
              onClick={() => {
                onChangeNumberStyle({ textAlign: item.value });
              }}
            >
              <Icon className="Font20" icon={item.icon} />
            </div>
          ))}
        </div>
      </div>
      {(xaxes.controlId || yaxisList.length > 1) && (
        <div className="flexRow valignWrapper mBottom12">
          <div style={lableStyle}>{_l('每行显示个数')}</div>
          <Input
            className="chartInput columnCountInput"
            style={{ width: 78 }}
            value={numberChartStyle.columnCount}
            onChange={event => {
              changeColumnCount(event.target.value);
            }}
            suffix={
              <div className="flexColumn">
                <Icon
                  icon="expand_less"
                  className={cx('Font20 pointer mBottom2', numberChartStyle.columnCount === maxColumnCount ? 'disabled' : 'Gray_9e')}
                  onClick={() => {
                    let value = Number(numberChartStyle.columnCount);
                    changeColumnCount(value + 1);
                  }}
                />
                <Icon
                  icon="expand_more"
                  className={cx('Font20 pointer mBottom2', numberChartStyle.columnCount === 1 ? 'disabled' : 'Gray_9e')}
                  onClick={() => {
                    let value = Number(numberChartStyle.columnCount);
                    changeColumnCount(value - 1);
                  }}
                />
              </div>
            }
          />
        </div>
      )}
      {(xaxes.controlId || yaxisList.length > 1) && (
        <div className="flexRow valignWrapper mTop16">
          <Checkbox
            checked={numberChartStyle.allowScroll}
            onChange={e => {
              onChangeNumberStyle({ allowScroll: e.target.checked });
            }}
          >
            {_l('允许容器内滚动')}
          </Checkbox>
          <Tooltip title={_l('当统计项较多时，勾选此配置可以在容器内滚动查看')} placement="bottom" arrowPointAtCenter>
            <Icon className="Gray_9e Font18 pointer" icon="knowledge-message" />
          </Tooltip>
        </div>
      )}
    </Wrap>
  );
};

const IconSetting = props => {
  const { projectId, themeColor, customPageConfig, numberChartStyle, onChangeNumberStyle } = props;
  const [visible, setVisible] = useState(false);
  const { numberChartColor, numberChartColorIndex = 1 } = customPageConfig;
  const icon = numberChartStyle.icon || '3_1_coins';
  const { iconColor } = replaceColor({ iconColor: numberChartStyle.iconColor || '#2196F3' }, {}, themeColor);
  return (
    <Wrap className="mBottom16">
      <div className="flexRow valignWrapper mBottom12">
        <div style={{ width: 60 }}>{_l('图标')}</div>
        <Trigger
          zIndex={1000}
          action={['click']}
          popupAlign={{ points: ['tc', 'bc'], offset: [0, 5], overflow: { adjustX: true, adjustY: true } }}
          popup={
            <SelectIcon
              hideInput={true}
              hideColor={true}
              projectId={projectId}
              icon={icon}
              iconColor={iconColor}
              className="Relative"
              onModify={data => {
                const { icon } = data;
                if (icon) {
                  onChangeNumberStyle({ icon });
                }
              }}
            />
          }
        >
          <EntranceWrapper className="ruleIcon flexRow valignWrapper pointer mLeft0 mRight10" onClick={() => { }}>
            <SvgIcon url={`${md.global.FileStoreConfig.pubHost}customIcon/${icon}.svg`} fill="#9e9e9e" size={22} />
          </EntranceWrapper>
        </Trigger>
        <ColorPicker
          isPopupBody={true}
          sysColor={true}
          themeColor={themeColor}
          value={iconColor}
          onChange={value => {
            const data = { iconColor: value };
            if (numberChartColor) {
              data.numberChartColorIndex = numberChartColorIndex + 1;
            }
            onChangeNumberStyle(data);
          }}
        >
          <div className="colorWrap pointer">
            <div className="colorBlock" style={{ backgroundColor: iconColor }}></div>
          </div>
        </ColorPicker>
      </div>
      <div className="flexRow valignWrapper mBottom12">
        <div style={{ width: 60 }}>{_l('形状')}</div>
        <div className="chartTypeSelect flexRow valignWrapper">
          {iconTypes.map(item => (
            <div
              key={item.value}
              style={{ width: 41 }}
              className={cx('flex centerAlign pointer Gray_75', {
                active: (numberChartStyle.shape || 'square') === item.value,
              })}
              onClick={() => {
                onChangeNumberStyle({ shape: item.value });
              }}
            >
              <div className={cx('shape', item.value)} />
            </div>
          ))}
        </div>
      </div>
    </Wrap>
  );
};

const StatisticsValue = props => {
  const { currentReport, themeColor, customPageConfig, onChangeDisplayValue, numberChartStyle, onChangeNumberStyle } =
    props;
  const { numberChartColor, numberChartColorIndex = 1 } = customPageConfig;
  const [ruleColorModalVisible, setRuleColorModalVisible] = useState(false);
  const { controlId } = currentReport.xaxes;
  const { colorRules } = currentReport.displaySetup;
  const colorRule = _.get(colorRules[0], 'dataBarRule');
  const onCancel = () => {
    setRuleColorModalVisible(false);
  };
  const { fontColor } = replaceColor({ fontColor: numberChartStyle.fontColor }, {}, themeColor);
  return (
    <Wrap className="mBottom16">
      <div className="mBottom12">{_l('文字')}</div>
      <div className="mBottom16">
        <div className="chartTypeSelect flexRow valignWrapper">
          {sizeTypes.map(item => (
            <div
              key={item.value}
              className={cx('flex centerAlign pointer Gray_75', {
                active: (numberChartStyle.fontSize || 28) === item.value,
              })}
              onClick={() => {
                onChangeNumberStyle({ fontSize: item.value });
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
      <div className="flexRow valignWrapper mBottom12">
        <div style={{ width: 50 }}>{_l('颜色')}</div>
        {!colorRule && (
          <ColorPicker
            isPopupBody={true}
            sysColor={true}
            themeColor={themeColor}
            value={fontColor}
            onChange={value => {
              const data = { fontColor: value };
              if (numberChartColor) {
                data.numberChartColorIndex = numberChartColorIndex + 1;
              }
              onChangeNumberStyle(data);
            }}
          >
            <div className="colorWrap pointer">
              <div className="colorBlock" style={{ backgroundColor: fontColor }}></div>
            </div>
          </ColorPicker>
        )}
        <Tooltip title={_l('颜色规则')}>
          <EntranceWrapper
            className="ruleIcon flexRow valignWrapper pointer"
            onClick={() => {
              setRuleColorModalVisible(true);
            }}
          >
            <Icon className="Font16 Gray_9e" icon="formula" />
          </EntranceWrapper>
        </Tooltip>
        {colorRule && (
          <EntranceWrapper
            className="ruleIcon flexRow valignWrapper pointer"
            onClick={() => {
              onChangeDisplayValue('colorRules', []);
            }}
          >
            <Icon className="Font16 Gray_9e" icon="delete2" />
          </EntranceWrapper>
        )}
        <RuleColor
          visible={ruleColorModalVisible}
          yaxisList={currentReport.yaxisList}
          reportType={currentReport.reportType}
          colorRule={colorRule || {}}
          onSave={data => {
            const rule = {
              controlId: '',
              dataBarRule: data,
            };
            onChangeDisplayValue('colorRules', [rule]);
            onCancel();
          }}
          onCancel={onCancel}
        />
      </div>
    </Wrap>
  );
};

export const ContrastValue = props => {
  const { numberChartStyle, onChangeNumberStyle } = props;
  const { contrastValueShowPercent = true, contrastValueShowNumber = false } = numberChartStyle || {};
  const handleChangeContrastValueDot = value => {
    if (value) {
      value = parseInt(value);
      value = isNaN(value) ? 0 : value;
      value = value > 9 ? 9 : value;
    } else {
      value = 0;
    }
    onChangeNumberStyle({
      contrastValueDot: value,
    });
  };
  return (
    <Fragment>
      <div className="mBottom12">
        <div className="mBottom8">{_l('显示方式')}</div>
        <div className="flexRow mBottom8">
          <Checkbox
            checked={contrastValueShowPercent}
            onChange={e => {
              if (contrastValueShowPercent && !contrastValueShowNumber && !e.target.checked) {
                return;
              }
              onChangeNumberStyle({
                contrastValueShowPercent: e.target.checked,
              });
            }}
          >
            {_l('百分比')}
          </Checkbox>
        </div>
        <div className="flexRow mBottom8">
          <Checkbox
            checked={contrastValueShowNumber}
            onChange={e => {
              if (!contrastValueShowPercent && contrastValueShowNumber && !e.target.checked) {
                return;
              }
              onChangeNumberStyle({
                contrastValueShowNumber: e.target.checked,
              });
            }}
          >
            {_l('数值')}
          </Checkbox>
        </div>
      </div>
      <div className="mBottom12">
        <div className="mBottom8">{_l('颜色')}</div>
        <div className="chartTypeSelect flexRow valignWrapper">
          {colorTypes.map(item => (
            <div
              key={item.value}
              className={cx('flex centerAlign pointer Gray_75', {
                active: (numberChartStyle.contrastColor || 0) === item.value,
              })}
              onClick={() => {
                onChangeNumberStyle({
                  contrastColor: item.value,
                });
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
      <div className="mBottom12">
        <div className="mBottom8">{_l('保留小数')}</div>
        <Input
          className="chartInput"
          value={numberChartStyle.contrastValueDot}
          onChange={event => {
            handleChangeContrastValueDot(event.target.value);
          }}
          suffix={
            <div className="flexColumn">
              <Icon
                icon="expand_less"
                className="Gray_9e Font20 pointer mBottom2"
                onClick={() => {
                  let value = Number(numberChartStyle.contrastValueDot);
                  handleChangeContrastValueDot(value + 1);
                }}
              />
              <Icon
                icon="expand_more"
                className="Gray_9e Font20 pointer mTop2"
                onClick={() => {
                  let value = Number(numberChartStyle.contrastValueDot);
                  handleChangeContrastValueDot(value ? value - 1 : 0);
                }}
              />
            </div>
          }
        />
      </div>
      <div className="mBottom12">
        <div className="mBottom8">{_l('文字')}</div>
        <Input
          className="chartInput mBottom12"
          value={numberChartStyle.lastContrastText}
          placeholder={_l('环比')}
          onChange={event => {
            onChangeNumberStyle({
              lastContrastText: event.target.value,
            });
          }}
        />
        <Input
          className="chartInput"
          value={numberChartStyle.contrastText}
          placeholder={_l('同比')}
          onChange={event => {
            onChangeNumberStyle({
              contrastText: event.target.value,
            });
          }}
        />
      </div>
    </Fragment>
  );
};

export function numberSummaryPanelGenerator(props) {
  const { currentReport, changeCurrentReport, onChangeDisplayValue } = props;
  const { xaxes, yaxisList, summary, displaySetup } = currentReport;
  const switchChecked = displaySetup.showTotal;

  if (!xaxes.controlId) {
    return null;
  }

  return (
    <Collapse.Panel
      key="numberChartCount"
      header={_l('总计')}
      className={cx({ collapsible: !switchChecked })}
      extra={
        <Switch
          size="small"
          checked={switchChecked}
          onClick={(checked, event) => {
            event.stopPropagation();
          }}
          onChange={checked => {
            onChangeDisplayValue('showTotal', checked, true);
          }}
        />
      }
    >
      <div className="mBottom16">
        <div className="mBottom8">{_l('汇总方式')}</div>
        <Select
          className="chartSelect w100"
          value={summary.type}
          suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
          onChange={value => {
            const item = _.find(normTypes, { value });
            const isDefault = normTypes.map(item => item.text).includes(summary.name);
            changeCurrentReport(
              {
                summary: {
                  ...summary,
                  type: item.value,
                  name: isDefault ? item.text : summary.name,
                },
              },
              true,
            );
          }}
        >
          {normTypes
            .filter(n => n.value !== 5)
            .map(item => (
              <Select.Option className="selectOptionWrapper" value={item.value}>
                {item.alias || item.text}
              </Select.Option>
            ))}
        </Select>
      </div>
      <div className="mBottom16">
        <div className="mBottom8">{_l('提示')}</div>
        <Input
          value={summary.name}
          className="chartInput w100"
          onChange={event => {
            changeCurrentReport(
              {
                summary: {
                  ...summary,
                  name: event.target.value,
                }
              },
              false,
            );
          }}
        />
      </div>
    </Collapse.Panel>
  );
}

export default function numberStylePanelGenerator(props) {
  const { currentReport, onChangeStyle, ...collapseProps } = props;
  const { style, xaxes, yaxisList } = currentReport;
  const { numberChartStyle = defaultNumberChartStyle } = style;
  const onChangeNumberStyle = data => {
    onChangeStyle({
      numberChartStyle: {
        ...numberChartStyle,
        ...data,
      },
    });
  };
  return (
    <Fragment>
      <Collapse.Panel key="cardLayout" header={_l('卡片布局')} {...collapseProps}>
        <CardLayout
          xaxes={xaxes}
          yaxisList={yaxisList}
          numberChartStyle={numberChartStyle}
          onChangeNumberStyle={onChangeNumberStyle}
        />
      </Collapse.Panel>
      {!xaxes.controlId && yaxisList.length === 1 && (
        <Collapse.Panel
          key="iconSetting"
          header={_l('图标')}
          className={cx({ collapsible: !numberChartStyle.iconVisible })}
          {...collapseProps}
          extra={
            <Switch
              size="small"
              checked={numberChartStyle.iconVisible}
              onClick={(checked, event) => {
                event.stopPropagation();
              }}
              onChange={checked => {
                onChangeNumberStyle({
                  iconVisible: checked,
                });
              }}
            />
          }
        >
          <IconSetting {...props} numberChartStyle={numberChartStyle} onChangeNumberStyle={onChangeNumberStyle} />
        </Collapse.Panel>
      )}
      <Collapse.Panel key="statisticsValue" header={_l('统计值')} {...collapseProps}>
        <StatisticsValue {...props} numberChartStyle={numberChartStyle} onChangeNumberStyle={onChangeNumberStyle} />
      </Collapse.Panel>
    </Fragment>
  );
}
