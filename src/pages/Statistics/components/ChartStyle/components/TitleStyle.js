import React, { Fragment } from 'react';
import { Icon, ColorPicker } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import { Checkbox, Select, Tooltip } from 'antd';
import { replaceColor } from 'statistics/Charts/PivotTable';
import { defaultPivotTableStyle } from '../../../enum';

const Wrap = styled.div`
  .chartTypeSelect {
    & > div,
    .active {
      padding: 3px 8px !important;
    }
  }
  .lable {
    width: 80px;
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
`;

const alignTypes = [
  {
    value: 'left',
    icon: 'format_align_left',
    tooltip: _l('左对齐'),
  },
  {
    value: 'center',
    icon: 'format_align_center',
    tooltip: _l('居中'),
  },
  {
    value: 'right',
    icon: 'format_align_right',
    tooltip: _l('右对齐'),
  },
];

const TitleStyle = props => {
  const { name, type, style, pivotTable = {}, onChangeStyle, themeColor, customPageConfig = {} } = props;
  const { currentReport = {}, changeCurrentReport } = props;
  const { displaySetup = {}, yaxisList = [] } = currentReport;
  const pivotTableStyle = replaceColor({
    pivotTableStyle: style.pivotTableStyle || defaultPivotTableStyle,
    customPageConfig: {},
    themeColor,
  });
  const textColor = type === 'line' ? pivotTableStyle.lineTextColor : pivotTableStyle.columnTextColor;
  const bgColor = type === 'line' ? pivotTableStyle.lineBgColor : pivotTableStyle.columnBgColor;
  const { lines = [] } = pivotTable;
  const { pivoTableColor, pivoTableColorIndex = 1 } = customPageConfig;

  const handleChangePivotTableStyle = data => {
    onChangeStyle({
      pivotTableStyle: {
        ...pivotTableStyle,
        ...data,
      },
    });
  };

  const renderAlign = () => {
    const key = `${type}TextAlign`;
    return (
      <div className="flexRow valignWrapper mBottom12">
        <div className="lable">{_l('对齐方式')}</div>
        <div>
          <div className="chartTypeSelect flexRow valignWrapper">
            {alignTypes.map(item => (
              <Tooltip key={item.value} arrowPointAtCenter title={item.tooltip} placement="bottom">
                <div
                  className={cx('flex centerAlign pointer Gray_75', { active: item.value === pivotTableStyle[key] })}
                  onClick={() => {
                    handleChangePivotTableStyle({
                      [key]: item.value,
                    });
                  }}
                >
                  <Icon className="Font20" icon={item.icon} />
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Wrap className="mBottom16">
      {renderAlign()}
      {type === 'cell' ? (
        <Fragment>
          <div className="flexRow valignWrapper mBottom12">
            <div className="lable">{_l('颜色')}</div>
            <div className="flexRow valignWrapper">
              <div className="flex flexRow valignWrapper mRight10">
                {_l('奇行')}
                <ColorPicker
                  isPopupBody
                  className="mLeft5"
                  value={pivotTableStyle.oddBgColor}
                  onChange={value => {
                    handleChangePivotTableStyle({
                      oddBgColor: value,
                    });
                  }}
                >
                  <div className="colorWrap pointer">
                    <div className="colorBlock" style={{ backgroundColor: pivotTableStyle.oddBgColor }}></div>
                  </div>
                </ColorPicker>
              </div>
              <div className="flex flexRow valignWrapper">
                {_l('偶行')}
                <ColorPicker
                  isPopupBody
                  className="mLeft5"
                  value={pivotTableStyle.evenBgColor}
                  onChange={value => {
                    handleChangePivotTableStyle({
                      evenBgColor: value,
                    });
                  }}
                >
                  <div className="colorWrap pointer">
                    <div className="colorBlock" style={{ backgroundColor: pivotTableStyle.evenBgColor }}></div>
                  </div>
                </ColorPicker>
              </div>
            </div>
          </div>
          <div className="flexRow valignWrapper mBottom12">
            <div className="lable">{_l('文本颜色')}</div>
            <ColorPicker
              isPopupBody
              value={pivotTableStyle.textColor}
              onChange={value => {
                handleChangePivotTableStyle({
                  textColor: value,
                });
              }}
            >
              <div className="colorWrap pointer">
                <div className="colorBlock" style={{ backgroundColor: pivotTableStyle.textColor }}></div>
              </div>
            </ColorPicker>
          </div>
          <div className="flexRow valignWrapper mTop16">
            <Checkbox
              className="mLeft0"
              checked={displaySetup.mergeCell}
              onChange={e => {
                const { pivotTable = {} } = currentReport;
                const param = {
                  displaySetup: {
                    ...displaySetup,
                    mergeCell: e.target.checked,
                  },
                  pivotTable
                }
                if (!e.target.checked) {
                  const { lines = [] } = pivotTable;
                  const newLines = lines.map((n, index) => {
                    return index ? { ...n, subTotal: false } : n;
                  });
                  if (!newLines.filter(n => n.subTotal).length) {
                    param.yaxisList = yaxisList.map(n => {
                      return { ...n, showPercent: 0 }
                    });
                  }
                  param.pivotTable.lines = newLines;
                }
                changeCurrentReport(param, true);
              }}
            >
              {_l('合并单元格')}
            </Checkbox>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <div className="flexRow valignWrapper mBottom12">
            <div className="lable">{_l('文字')}</div>
            <ColorPicker
              isPopupBody={true}
              sysColor={true}
              themeColor={themeColor}
              value={textColor}
              onChange={value => {
                const data = {};
                if (type === 'line') {
                  data.lineTextColor = value;
                } else {
                  data.columnTextColor = value;
                }
                if (pivoTableColor) {
                  data.pivoTableColorIndex = pivoTableColorIndex + 1;
                }
                handleChangePivotTableStyle(data);
              }}
            >
              <div className="colorWrap pointer">
                <div className="colorBlock" style={{ backgroundColor: textColor }}></div>
              </div>
            </ColorPicker>
          </div>
          <div className="flexRow valignWrapper mBottom12">
            <div className="lable">{_l('背景色')}</div>
            <ColorPicker
              isPopupBody={true}
              sysColor={true}
              themeColor={themeColor}
              value={bgColor}
              onChange={value => {
                const data = {};
                if (type === 'line') {
                  data.lineBgColor = value;
                } else {
                  data.columnBgColor = value;
                }
                if (pivoTableColor) {
                  data.pivoTableColorIndex = pivoTableColorIndex + 1;
                }
                handleChangePivotTableStyle(data);
              }}
            >
              <div className="colorWrap pointer">
                <div className="colorBlock" style={{ backgroundColor: bgColor }}></div>
              </div>
            </ColorPicker>
          </div>
          {type === 'line' ? (
            <div className="mBottom12">
              <div className="lable mBottom10">{_l('冻结行标题')}</div>
              <div className="flexRow valignWrapper mBottom5">
                <Checkbox
                  style={{ width: 60 }}
                  checked={style.pivotTableLineFreeze}
                  onChange={event => {
                    const { checked } = event.target;
                    onChangeStyle({
                      pivotTableLineFreeze: checked,
                    });
                  }}
                >
                  {_l('PC')}
                </Checkbox>
                <Select
                  style={{ width: 130 }}
                  className="chartSelect"
                  value={_.isNumber(style.pivotTableLineFreezeIndex) ? style.pivotTableLineFreezeIndex : 'all'}
                  suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                  onChange={value => {
                    onChangeStyle({
                      pivotTableLineFreezeIndex: value,
                    });
                  }}
                >
                  <Select.Option className="selectOptionWrapper" value="all">
                    {_l('全部列')}
                  </Select.Option>
                  {lines.slice(0, lines.length - 1).map((data, index) => (
                    <Select.Option className="selectOptionWrapper" value={index} key={index}>
                      {_l('%0列', index + 1)}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div className="flexRow valignWrapper">
                <Checkbox
                  style={{ width: 60 }}
                  checked={style.mobilePivotTableLineFreeze}
                  onChange={event => {
                    const { checked } = event.target;
                    onChangeStyle({
                      mobilePivotTableLineFreeze: checked,
                    });
                  }}
                >
                  {_l('移动')}
                </Checkbox>
                <Select
                  style={{ width: 130 }}
                  className="chartSelect mRight10"
                  value={
                    _.isNumber(style.mobilePivotTableLineFreezeIndex) ? style.mobilePivotTableLineFreezeIndex : 'all'
                  }
                  suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                  onChange={value => {
                    onChangeStyle({
                      mobilePivotTableLineFreezeIndex: value,
                    });
                  }}
                >
                  <Select.Option className="selectOptionWrapper" value="all">
                    {_l('全部列')}
                  </Select.Option>
                  {lines.slice(0, lines.length - 1).map((data, index) => (
                    <Select.Option className="selectOptionWrapper" value={index} key={index}>
                      {_l('%0列', index + 1)}
                    </Select.Option>
                  ))}
                </Select>
                <Tooltip
                  title={_l('移动端屏幕尺寸较小，设置时请注意宽度和高度')}
                  overlayStyle={{ width: 170 }}
                  placement="bottomRight"
                  arrowPointAtCenter
                >
                  <Icon className="Gray_9e Font18 pointer" icon="knowledge-message" />
                </Tooltip>
              </div>
            </div>
          ) : (
            <div className="flexRow mBottom12">
              <div className="lable">{_l('冻结列标题')}</div>
              <div className="flexRow valignWrapper">
                <Checkbox
                  checked={style.pivotTableColumnFreeze}
                  onChange={event => {
                    const { checked } = event.target;
                    onChangeStyle({
                      pivotTableColumnFreeze: checked,
                    });
                  }}
                >
                  {_l('PC')}
                </Checkbox>
                <Checkbox
                  checked={style.mobilePivotTableColumnFreeze}
                  onChange={event => {
                    const { checked } = event.target;
                    onChangeStyle({
                      mobilePivotTableColumnFreeze: checked,
                    });
                  }}
                >
                  {_l('移动')}
                </Checkbox>
                <Tooltip
                  title={_l('移动端屏幕尺寸较小，设置时请注意宽度和高度')}
                  overlayStyle={{ width: 170 }}
                  placement="bottomRight"
                  arrowPointAtCenter
                >
                  <Icon className="Gray_9e Font18 pointer" icon="knowledge-message" />
                </Tooltip>
              </div>
            </div>
          )}
        </Fragment>
      )}
    </Wrap>
  );
};

export default TitleStyle;
