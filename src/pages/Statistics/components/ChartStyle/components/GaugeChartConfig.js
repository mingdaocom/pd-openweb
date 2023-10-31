import React, { Component, Fragment, useState } from 'react';
import cx from 'classnames';
import { Icon, ColorPicker } from 'ming-ui';
import { ConfigProvider, Button, Modal, Collapse, Switch, Radio, Input, Checkbox, Tooltip } from 'antd';
import RuleColor from './Color/RuleColor';
import { colorGroup } from 'statistics/Charts/common';

const colors = colorGroup[0].value;
const bisectSectionColors = [{
  value: 100,
  color: colors[0]
}, {
  value: 66,
  color: colors[1]
}, {
  value: 33,
  color: colors[2]
}];

const defaultSectionColorConfig = {
  type: 1,
  quantity: 3,
  isFloor: true,
  sectionColors: bisectSectionColors,
};

const getSection = (value, isFloor) => {
  const n = 100 / value;
  const result = [];
  for(let i = 0; i < value; i++) {
    if (i) {
      const v = n * i;
      result.push(isFloor ? Math.floor(v) : v);
    }
  }
  return result.concat(100).reverse().map(n => {
    return {
      value: n,
    }
  });
}

const SectionColorConfigModal = props => {
  const { style, onChangeStyle, visible, onCancel } = props;
  const { sectionColorConfig = defaultSectionColorConfig } = style;
  const [data, setData] = useState(sectionColorConfig);
  const { type, isFloor, quantity, sectionColors } = data;
  const changeSectionColorConfig = config => {
    setData({
      ...data,
      ...config
    });
  }
  const sortSectionColors = () => {
    changeSectionColorConfig({
      sectionColors: sectionColors.sort((a, b) => b.value - a.value)
    });
  }
  return (
    <Modal
      title={_l('区间颜色')}
      width={680}
      className="chartModal"
      visible={visible}
      centered={true}
      destroyOnClose={true}
      closeIcon={<Icon icon="close" className="Font20 pointer Gray_9e" />}
      footer={(
        <div className="mTop20 mBottom10 pRight8">
          <ConfigProvider autoInsertSpaceInButton={false}>
            <Button
              type="link"
              onClick={onCancel}
            >
              {_l('取消')}
            </Button>
            <Button
              type="primary"
              onClick={() => {
                const filterSectionColors = sectionColors.filter((item, index) => {
                  const next = sectionColors[index + 1] || {};
                  return item.value >= next.value || _.isUndefined(next.value);
                });
                if (filterSectionColors.length !== sectionColors.length) {
                  alert(_l('当前值请按从大到小填写'), 3);
                  return;
                }
                if (sectionColors.filter(item => !item.value).length) {
                  alert(_l('当输入大于0的值'), 3);
                  return;
                }
                onChangeStyle({ sectionColorConfig: data });
                onCancel();
              }}
            >
              {_l('确认')}
            </Button>
          </ConfigProvider>
        </div>
      )}
      onCancel={onCancel}
    >
      <div className="Font13">
        <div className="mBottom10">{_l('数据映射区间')}</div>
        <Radio.Group
          className="mBottom10"
          value={type}
          onChange={(event) => {
            const { value } = event.target;
            const data = {
              type: value
            }
            if (value === 1) {
              data.quantity = sectionColors.length;
              data.sectionColors = getSection(sectionColors.length, isFloor);
            }
            changeSectionColorConfig(data);
          }}
        >
          <Radio value={1} className="Font13 mRight60">{_l('等分区间')}</Radio>
          <Radio value={2} className="Font13">{_l('自定义区间')}</Radio>
        </Radio.Group>
        {type === 1 && (
          <div className="flexRow valignWrapper mTop10 mBottom10">
            <div className="mRight10">{_l('区间个数')}</div>
            <Input
              style={{ width: 100 }}
              className="chartInput"
              value={quantity}
              // placeholder={}
              onChange={event => {
                const value = event.target.value.replace(/[^0-9]+/g, '');
                changeSectionColorConfig({ quantity: value ? Number(value) : '' });
              }}
              onBlur={() => {
                let value = quantity || 0;
                if (value <= 0) {
                  value = 1;
                }
                if (value >= 10) {
                  value = 10;
                }
                const newSectionColors = getSection(value, isFloor);
                changeSectionColorConfig({
                  quantity: value,
                  sectionColors: newSectionColors.map((item, index) => {
                    return {
                      ...item,
                      color: _.get(sectionColors[index], 'color') || undefined
                    }
                  })
                });
              }}
              suffix={
                <div className="flexColumn">
                  <Icon
                    icon="expand_less"
                    className="Gray_9e Font20 pointer mBottom2 Hover_21"
                    onClick={() => {
                      let value = quantity + 1;
                      if (value >= 10) {
                        value = 10;
                      }
                      const newSectionColors = getSection(value, isFloor);
                      changeSectionColorConfig({
                        quantity: value,
                        sectionColors: newSectionColors.map((item, index) => {
                          return {
                            ...item,
                            color: _.get(sectionColors[index], 'color') || undefined
                          }
                        })
                      });
                    }}
                  />
                  <Icon
                    icon="expand_more"
                    className="Gray_9e Font20 pointer mTop2 Hover_21"
                    onClick={() => {
                      let value = quantity - 1;
                      if (value <= 1) {
                        value = 1;
                      }
                      const newSectionColors = getSection(value, isFloor);
                      changeSectionColorConfig({
                        quantity: value,
                        sectionColors: newSectionColors.map((item, index) => {
                          return {
                            ...item,
                            color: _.get(sectionColors[index], 'color') || undefined
                          }
                        })
                      });
                    }}
                  />
                </div>
              }
            />
            <Checkbox
              className="mLeft16"
              checked={isFloor}
              onChange={(event) => {
                const { checked } = event.target;
                changeSectionColorConfig({
                  isFloor: checked,
                  sectionColors: getSection(sectionColors.length, checked)
                });
              }}
            >
              {_l('取整')}
            </Checkbox>
          </div>
        )}
        <div className="mBottom16 mTop10">{_l('按百分比区间划分依据')}</div>
        {sectionColors.map((data, index) => (
          <div className="flexRow valignWrapper mBottom10" key={index}>
            <div className="mRight10">{_l('当前值 <=')}</div>
            <Input
              disabled={type === 1}
              style={{ width: 180 }}
              className="chartInput Gray"
              value={data.value}
              onChange={event => {
                const v = event.target.value.replace(/[^0-9]+/g, '');
                let value = v ? Number(v) : '';
                if (value <= 0) {
                  value = 0;
                }
                if (value >= 100) {
                  value = 100;
                }
                changeSectionColorConfig({
                  sectionColors: sectionColors.map((data, i) => {
                    if (index === i) {
                      return {
                        ...data,
                        value
                      }
                    }
                    return data;
                  })
                });
              }}
              onBlur={sortSectionColors}
              onKeyDown={event => {
                event.which === 13 && sortSectionColors();
              }}
            />
            <div className="mLeft5 mRight24">%</div>
            <div>{_l('颜色为')}</div>
            <ColorPicker
              isPopupBody
              className="mLeft10"
              value={data.color || colors[index]}
              onChange={value => {
                changeSectionColorConfig({
                  sectionColors: sectionColors.map((data, i) => {
                    if (index === i) {
                      return {
                        ...data,
                        color: value
                      }
                    }
                    return data;
                  })
                });
              }}
            >
              <div className="colorWrap pointer">
                <div className="colorBlock" style={{ backgroundColor: data.color || colors[index] }}>
                </div>
              </div>
            </ColorPicker>
            {type === 2 && sectionColors.length > 1 && (
              <Tooltip title={_l('删除')}>
                <Icon
                  className="mLeft10 Gray_9e Font18 pointer Hover_21"
                  icon="close"
                  onClick={() => {
                    changeSectionColorConfig({
                      sectionColors: sectionColors.filter((_, i) => index !== i)
                    });
                  }}
                />
              </Tooltip>
            )}
          </div>
        ))}
        {type === 2 && sectionColors.length < 10 && (
          <div
            className="flexRow valignWrapper pointer mTop10 mBottom10 ThemeColor hoverThemeColor"
            style={{ width: 'max-content' }}
            onClick={() => {
              changeSectionColorConfig({
                sectionColors: sectionColors.concat({
                  value: '',
                })
              });
            }}
          >
            <Icon className="mRight2" icon="add" />
            {_l('添加区间')}
          </div>
        )}
      </div>
    </Modal>
  );
}

const GaugeColor = props => {
  const { currentReport, onChangeStyle, onChangeDisplayValue } = props;
  const { gaugeColor = '#64B5F6' } = currentReport.style;
  const { colorRules } = currentReport.displaySetup;
  const colorRule = _.get(colorRules[1], 'dataBarRule');
  const { gaugeColorType = 1, sectionColorConfig } = currentReport.style;
  const [ruleColorModalVisible, setRuleColorModalVisible] = useState(false);
  const [sectionColorModalVisible, setSectionColorModalVisible] = useState(false);
  return (
    <div className="mBottom16">
      <Radio.Group
        className="mBottom10"
        value={gaugeColorType}
        onChange={(event) => {
          const { value } = event.target;
          onChangeStyle({ gaugeColorType: value });
          if (value === 2 && _.isEmpty(sectionColorConfig)) {
            setSectionColorModalVisible(true);
          }
        }}
      >
        <Radio value={1} className="Font13 mRight40">{_l('进度')}</Radio>
        <Radio value={2} className="Font13">{_l('区间颜色')}</Radio>
      </Radio.Group>
      {gaugeColorType === 1 && (
        <div className="flexRow valignWrapper">
          <div>{_l('颜色')}</div>
          {_.isEmpty(colorRule) && (
            <ColorPicker
              isPopupBody
              className="mLeft10"
              value={gaugeColor}
              onChange={value => {
                onChangeStyle({ gaugeColor: value });
              }}
            >
              <div className="colorWrap pointer">
                <div className="colorBlock" style={{ backgroundColor: gaugeColor }}>
                </div>
              </div>
            </ColorPicker>
          )}
          <div
            className="entranceWrap ruleIcon flexRow valignWrapper pointer"
            onClick={() => {
              setRuleColorModalVisible(true);
            }}
          >
            <Icon className="Font16 Gray_9e" icon="formula" />
          </div>
          {!_.isEmpty(colorRule) && (
            <div
              className="entranceWrap ruleIcon flexRow valignWrapper pointer"
              onClick={() => {
                const newColorRules = colorRules.map((item, index) => index === 1 ? {} : item);
                onChangeDisplayValue('colorRules', newColorRules);
              }}
            >
              <Icon className="Font16 Gray_9e" icon="delete2" />
            </div>
          )}
        </div>
      )}
      {gaugeColorType === 2 && (
        <div
          className="entranceWrap hover flex flexRow valignWrapper pointer pLeft10"
          onClick={() => setSectionColorModalVisible(true)}
        >
          <span className="flex">{_l('自定义区间')}</span>
          <Icon className="Font16 Gray_9e mRight10 highlightIcon" icon="edit" />
        </div>
      )}
      <RuleColor
        isPercent={true}
        visible={ruleColorModalVisible}
        yaxisList={currentReport.yaxisList}
        reportType={currentReport.reportType}
        colorRule={colorRule || {}}
        onSave={(data) => {
          const rule = {
            controlId: '',
            dataBarRule: data
          }
          if (colorRules.length) {
            onChangeDisplayValue('colorRules', [colorRules[0], rule]);
          } else {
            onChangeDisplayValue('colorRules', [{}, rule]);
          }
          setRuleColorModalVisible(false);
        }}
        onCancel={() => setRuleColorModalVisible(false)}
      />
      <SectionColorConfigModal
        style={currentReport.style}
        onChangeStyle={onChangeStyle}
        visible={sectionColorModalVisible}
        onCancel={() => setSectionColorModalVisible(false)}
      />
    </div>
  );
}

export function gaugeColorPanelGenerator(props) {
  const { currentReport, onChangeStyle, onChangeDisplayValue, ...collapseProps } = props;
  return (
    <Collapse.Panel
      key="gaugeColor"
      header={_l('仪表盘')}
      {...props}
    >
      <GaugeColor {...props} />
    </Collapse.Panel>
  );
}

export function scalePanelGenerator(props) {
  const { currentReport, onChangeStyle, ...collapseProps } = props;
  const { style } = currentReport;
  const scaleType = _.isUndefined(style.scaleType) ? 1 : style.scaleType;
  return (
    <Collapse.Panel
      key="scale"
      header={_l('刻度')}
      className={cx({ collapsible: !scaleType })}
      {...collapseProps}
      extra={
        <Switch
          size="small"
          checked={!!scaleType}
          onClick={(checked, event) => {
            event.stopPropagation();
          }}
          onChange={checked => {
            onChangeStyle({ scaleType: checked ? 1 : null });
          }}
        />
      }
    >
      <div className="chartTypeSelect flexRow valignWrapper mBottom16">
        <div
          className={cx('flex centerAlign pointer Gray_75', { active: scaleType === 1 || _.isNull(style.scaleType) })}
          onClick={() => {
            onChangeStyle({ scaleType: 1 });
          }}
        >
          {_l('数值')}
        </div>
        <div
          className={cx('flex centerAlign pointer Gray_75', { active: scaleType === 2 })}
          onClick={() => {
            onChangeStyle({ scaleType: 2 });
          }}
        >
          {_l('百分比')}
        </div>
      </div>
    </Collapse.Panel>
  );
}


export function indicatorPanelGenerator(props) {
  const { currentReport, onChangeStyle, ...collapseProps } = props;
  const { style } = currentReport;
  const indicatorVisible = _.isUndefined(style.indicatorVisible) ? true : style.indicatorVisible;
  return (
    <Collapse.Panel
      key="indicator"
      header={_l('指针')}
      className="hideArrowIcon"
      {...collapseProps}
      extra={
        <Switch
          size="small"
          checked={indicatorVisible}
          onClick={(checked, event) => {
            event.stopPropagation();
          }}
          onChange={checked => {
            onChangeStyle({ indicatorVisible: checked });
          }}
        />
      }
    >
    </Collapse.Panel>
  );
}