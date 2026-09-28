import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { ColorPicker, Icon, SvgIcon } from 'ming-ui';
import { Checkbox, Input, InputNumber, Segmented, Select, Switch, Tooltip } from 'ming-ui/antd-components';
import { dialogSelectIcon } from 'ming-ui/functions';
import { replaceColor } from 'statistics/Charts/NumberChart';
import { defaultNumberChartStyle, normTypes, sizeTypes } from '../../../enum';
import BgPicker from './BgPicker';
import RuleColor from './Color/RuleColor';

const Wrap = styled.div`
  .shape.active {
    background-color: var(--color-primary);
  }
  .lable {
    width: 100px;
  }
  .colorWrap {
    width: 32px;
    height: 32px;
    border-radius: 3px;
    padding: 4px;
    border: 1px solid var(--color-border-primary);
    background-color: var(--color-background-primary);
    .colorBlock {
      width: 100%;
      height: 100%;
    }
  }
  .square,
  .circle {
    width: 12px;
    height: 12px;
    background-color: var(--color-text-tertiary);
  }
  .square {
    border-radius: 3px;
  }
  .circle {
    border-radius: 50%;
  }
`;

const EntranceWrapper = styled.div`
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  height: 30px;
  background-color: var(--color-background-primary);
  &.ruleIcon {
    width: 30px;
    margin-left: 10px;
    justify-content: center;
    &:hover {
      background-color: var(--color-background-hover);
    }
  }
`;

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

const CardLayout = props => {
  const { themeColor, currentReport, handleChangeDisplaySetup, numberChartStyle, onChangeNumberStyle } = props;
  const { xaxes, yaxisList, displaySetup } = currentReport;

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
        <Segmented
          className="bgDisabled"
          value={numberChartStyle.textAlign || 'center'}
          options={alignTypes.map(item => ({
            value: item.value,
            label: <Icon className="Font20" icon={item.icon} />,
          }))}
          onChange={value => {
            onChangeNumberStyle({ textAlign: value });
          }}
        />
      </div>
      {(xaxes.controlId || yaxisList.length > 1) && (
        <div className="flexRow valignWrapper mBottom12">
          <div style={lableStyle}>{_l('每行显示个数')}</div>
          <InputNumber
            min={1}
            max={maxColumnCount}
            precision={0}
            style={{ width: 78 }}
            value={numberChartStyle.columnCount}
            onChange={changeColumnCount}
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
          <Tooltip
            title={_l('当统计项较多时，勾选此配置可以在容器内滚动查看')}
            placement="bottom"
            arrow={{ pointAtCenter: true }}
          >
            <Icon className="textTertiary Font18 pointer" icon="info" />
          </Tooltip>
        </div>
      )}
      {!xaxes.controlId && yaxisList.length === 1 && (
        <div className="flexRow valignWrapper mBottom12">
          <div className="mRight10">{_l('背景')}</div>
          <BgPicker
            themeColor={themeColor}
            config={numberChartStyle}
            onChange={onChangeNumberStyle}
            previewUrl={displaySetup.previewUrl || displaySetup.imageUrl}
            onChangeImage={(imageData, styleData) => {
              handleChangeDisplaySetup(imageData);
              if (styleData) {
                onChangeNumberStyle(styleData);
              }
            }}
            onClear={() => {
              onChangeNumberStyle({ bgStyleValue: '', bgColor: '#fff' });
            }}
          ></BgPicker>
        </div>
      )}
    </Wrap>
  );
};

const IconSetting = props => {
  const { projectId, themeColor, customPageConfig, numberChartStyle, onChangeNumberStyle } = props;
  const { numberChartColor, numberChartColorIndex = 1 } = customPageConfig;
  const icon = numberChartStyle.icon || '3_1_coins';
  const { iconColor } = replaceColor({ iconColor: numberChartStyle.iconColor || '#1677ff' }, {}, themeColor);
  return (
    <Wrap className="mBottom16">
      <div className="flexRow valignWrapper mBottom12">
        <div style={{ width: 60 }}>{_l('图标')}</div>
        <EntranceWrapper
          className="ruleIcon flexRow valignWrapper pointer mLeft0 mRight10"
          onClick={() => {
            dialogSelectIcon({
              hideInput: true,
              hideColor: true,
              projectId,
              icon,
              iconColor,
              onModify: data => data?.icon && onChangeNumberStyle({ icon: data.icon }),
            });
          }}
        >
          <SvgIcon
            url={`${md.global.FileStoreConfig.pubHost}/customIcon/${icon}.svg`}
            fill="var(--color-text-tertiary)"
            size={22}
          />
        </EntranceWrapper>
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
        <Segmented
          className="bgDisabled"
          value={numberChartStyle.shape || 'square'}
          options={iconTypes.map(item => ({
            value: item.value,
            label: (
              <div
                className={cx('shape', item.value, {
                  active: (numberChartStyle.shape || 'square') === item.value,
                })}
              />
            ),
          }))}
          onChange={value => {
            onChangeNumberStyle({ shape: value });
          }}
        />
      </div>
    </Wrap>
  );
};

const StatisticsValue = props => {
  const { currentReport, themeColor, customPageConfig, onChangeDisplayValue, numberChartStyle, onChangeNumberStyle } =
    props;
  const { numberChartColor, numberChartColorIndex = 1 } = customPageConfig;
  const [ruleColorModalVisible, setRuleColorModalVisible] = useState(false);
  const { xaxes, yaxisList, displaySetup } = currentReport;
  const { colorRules } = displaySetup;
  const colorRule = _.get(colorRules[0], 'dataBarRule');

  const onCancel = () => {
    setRuleColorModalVisible(false);
  };

  const { fontColor, titleColor } = replaceColor(_.pick(numberChartStyle, ['fontColor', 'titleColor']), {}, themeColor);
  return (
    <Wrap className="mBottom16">
      <div className="mBottom12">{_l('文字')}</div>
      <div className="mBottom16">
        <Segmented
          block
          className="bgDisabled"
          styles={{
            label: {
              '--hap-control-padding-horizontal': '10px',
            },
          }}
          value={numberChartStyle.fontSize || 28}
          options={sizeTypes.map(item => ({
            value: item.value,
            label: (
              <span className="ellipsis" title={item.name}>
                {item.name}
              </span>
            ),
          }))}
          onChange={value => {
            onChangeNumberStyle({ fontSize: value });
          }}
        />
      </div>
      {!xaxes.controlId && yaxisList.length === 1 && numberChartStyle.bgStyleValue && (
        <div className="flexRow valignWrapper mBottom12">
          <div style={{ width: 60 }}>{_l('文本颜色')}</div>
          <ColorPicker
            isPopupBody={true}
            sysColor={true}
            themeColor={themeColor}
            value={titleColor}
            onChange={value => {
              const data = { titleColor: value };
              onChangeNumberStyle(data);
            }}
          >
            <div className="colorWrap pointer">
              <div className="colorBlock" style={{ backgroundColor: titleColor }}></div>
            </div>
          </ColorPicker>
        </div>
      )}
      <div className="flexRow valignWrapper mBottom12">
        <div style={{ width: 60 }}>{_l('数值颜色')}</div>
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
            <Icon className="Font16 textTertiary" icon="formula" />
          </EntranceWrapper>
        </Tooltip>
        {colorRule && (
          <EntranceWrapper
            className="ruleIcon flexRow valignWrapper pointer"
            onClick={() => {
              onChangeDisplayValue('colorRules', []);
            }}
          >
            <Icon className="Font16 textTertiary" icon="trash" />
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
      value = _.clamp(value, 0, 9);
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
        <Segmented
          block
          className="bgDisabled"
          value={numberChartStyle.contrastColor || 0}
          options={colorTypes.map(item => ({
            value: item.value,
            label: (
              <span className="ellipsis" title={item.name}>
                {item.name}
              </span>
            ),
          }))}
          onChange={value => {
            onChangeNumberStyle({
              contrastColor: value,
            });
          }}
        />
      </div>
      <div className="mBottom12">
        <div className="mBottom8">{_l('保留小数')}</div>
        <InputNumber
          className="w100"
          min={0}
          max={9}
          precision={0}
          value={numberChartStyle.contrastValueDot}
          onChange={value => {
            handleChangeContrastValueDot(value);
          }}
        />
      </div>
      <div className="mBottom12">
        <div className="mBottom8">{_l('文字')}</div>
        <Input
          className="mBottom12"
          defaultValue={numberChartStyle.lastContrastText}
          placeholder={_l('环比')}
          onPressEnter={event => event.currentTarget.blur()}
          onBlur={event => {
            onChangeNumberStyle({
              lastContrastText: event.target.value,
            });
          }}
        />
        <Input
          defaultValue={numberChartStyle.contrastText}
          placeholder={_l('同比')}
          onPressEnter={event => event.currentTarget.blur()}
          onBlur={event => {
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
  const { xaxes, summary, displaySetup } = currentReport;
  const switchChecked = displaySetup.showTotal;

  if (!xaxes.controlId) {
    return null;
  }

  return {
    key: 'numberChartCount',
    label: _l('总计'),
    className: cx({ collapsible: !switchChecked }),
    extra: (
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
    ),
    children: (
      <Fragment>
        <div className="mBottom16">
          <div className="mBottom8">{_l('汇总方式')}</div>
          <Select
            className="w100"
            value={summary.type}
            suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
            options={normTypes
              .filter(n => ![5, 6].includes(n.value))
              .map(item => ({
                value: item.value,
                label: item.alias || item.text,
              }))}
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
          />
        </div>
        <div className="mBottom16">
          <div className="mBottom8">{_l('提示')}</div>
          <Input
            key={`${summary.controlId}-${summary.type}`}
            defaultValue={summary.name}
            maxLength={20}
            className="w100"
            onPressEnter={event => event.currentTarget.blur()}
            onBlur={event => {
              changeCurrentReport(
                {
                  summary: {
                    ...summary,
                    name: event.target.value,
                  },
                },
                false,
              );
            }}
          />
        </div>
      </Fragment>
    ),
  };
}

export default function numberStylePanelGenerator(props) {
  const { currentReport, onChangeStyle } = props;
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

  return [
    {
      key: 'cardLayout',
      label: _l('卡片样式'),
      children: <CardLayout {...props} numberChartStyle={numberChartStyle} onChangeNumberStyle={onChangeNumberStyle} />,
    },
    !xaxes.controlId &&
      yaxisList.length === 1 && {
        key: 'iconSetting',
        label: _l('图标'),
        className: cx({ collapsible: !numberChartStyle.iconVisible }),
        extra: (
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
        ),
        children: (
          <IconSetting {...props} numberChartStyle={numberChartStyle} onChangeNumberStyle={onChangeNumberStyle} />
        ),
      },
    {
      key: 'statisticsValue',
      label: _l('统计值'),
      children: (
        <StatisticsValue {...props} numberChartStyle={numberChartStyle} onChangeNumberStyle={onChangeNumberStyle} />
      ),
    },
  ].filter(Boolean);
}
