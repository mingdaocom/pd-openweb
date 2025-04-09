import React from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Select, Tooltip } from 'antd';
import cx from 'classnames';
import { defaultPivotTableStyle } from '../../../enum';
import store from 'redux/configureStore';
import { isLightColor } from 'src/pages/customPage/util';

const ColorBlock = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 2px;
  margin-right: 5px;
`;

const styles = [
  {
    value: 1,
    color: '#E0E0E0',
    name: _l('简单'),
    config: {
      columnTextColor: '#757575',
      columnBgColor: '#fafafa',
      lineTextColor: '#151515',
      lineBgColor: '#fff',
    },
  },
  {
    value: 2,
    color: '#2196F3',
    name: _l('商务'),
    config: {
      columnTextColor: '#fff',
      columnBgColor: '#2196F3',
      lineTextColor: '#fff',
      lineBgColor: '#2196F3',
    },
  },
  {
    value: 3,
    color: '#3E4662',
    name: _l('炫酷'),
    config: {
      columnTextColor: '#fff',
      columnBgColor: '#3E4662',
      lineTextColor: '#fff',
      lineBgColor: '#3E4662',
    },
  },
];

const widthModels = [
  {
    value: 1,
    name: _l('自动'),
  },
  {
    value: 2,
    name: _l('固定'),
  },
  {
    value: 3,
    name: _l('百分比'),
  },
];

const PreinstallStyle = props => {
  const { style, onChangeStyle, customPageConfig } = props;
  const {
    pivotTableStyle = defaultPivotTableStyle,
    paginationVisible,
    paginationSize = 20,
    pcWidthModel = 1,
    mobileWidthModel = 1,
  } = style;
  const iconColor = _.get(store.getState().appPkg, 'iconColor');
  const { pivoTableColor, pivoTableColorIndex = 1 } = customPageConfig;

  const handleChangePivotTableStyle = (data, isRequest) => {
    const config = {
      ...pivotTableStyle,
      ...data,
    };
    if (pivoTableColor) {
      config.pivoTableColorIndex = pivoTableColorIndex + 1;
    }
    onChangeStyle(
      {
        pivotTableStyle: config,
      },
      isRequest,
    );
  };

  return (
    <div className="mBottom16">
      <div className="mBottom10">{_l('预设样式')}</div>
      <div className="chartTypeSelect flexRow valignWrapper">
        <div
          className="flex centerAlign pointer Gray_75"
          onClick={() => {
            const isLight = isLightColor(iconColor);
            handleChangePivotTableStyle({
              columnTextColor: isLight ? '#757575' : '#fff',
              columnBgColor: 'themeColor',
              lineTextColor: isLight ? '#151515' : '#fff',
              lineBgColor: 'themeColor',
            });
          }}
        >
          <ColorBlock style={{ backgroundColor: iconColor }}></ColorBlock>
          {_l('主题')}
        </div>
        {styles.map(item => (
          <div
            key={item.value}
            className="flex centerAlign pointer Gray_75"
            onClick={() => {
              handleChangePivotTableStyle(item.config);
            }}
          >
            <ColorBlock style={{ backgroundColor: item.color }}></ColorBlock>
            {item.name}
          </div>
        ))}
      </div>
      <div className="mBottom10 mTop16 flexRow valignWrapper">
        {_l('列宽模式')}
        <Tooltip
          title={
            <div className="pTop5 pBottom5">
              <div className="mBottom2">{_l('自动')}</div>
              <div>{_l('根据内容长度自动设置列宽')}</div>
              <div className="mBottom2 mTop10">{_l('固定')}</div>
              <div>{_l('列宽按固定宽度，当列数较多时横向滚动查看')}</div>
              <div className="mBottom2 mTop10">{_l('百分比')}</div>
              <div>{_l('列宽按百分比，在所有尺寸下始终完整显示所有列，适合列数较少的情况')}</div>
            </div>
          }
          overlayInnerStyle={{
            width: 300,
          }}
          placement="bottomRight"
          arrowPointAtCenter
        >
          <Icon className="mLeft10 Gray_9e Font16 pointer" icon="knowledge-message" />
        </Tooltip>
      </div>
      <div className="mBottom5">{_l('PC')}</div>
      <div className="chartTypeSelect flexRow valignWrapper">
        {widthModels.map(item => (
          <div
            key={item.value}
            className={cx('flex centerAlign pointer Gray_75', { active: pcWidthModel === item.value })}
            onClick={() => {
              onChangeStyle({ pcWidthModel: item.value }, true);
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
      <div className="mBottom5 mTop10">{_l('移动')}</div>
      <div className="chartTypeSelect flexRow valignWrapper">
        {widthModels.map(item => (
          <div
            key={item.value}
            className={cx('flex centerAlign pointer Gray_75', { active: mobileWidthModel === item.value })}
            onClick={() => {
              onChangeStyle({ mobileWidthModel: item.value });
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
      <div className="flexRow valignWrapper mTop16">
        <Checkbox
          className="mLeft0"
          checked={paginationVisible}
          onChange={e => {
            onChangeStyle({ paginationVisible: e.target.checked });
          }}
        >
          {_l('显示分页')}
        </Checkbox>
      </div>
      {paginationVisible && (
        <div className="mTop10 flexRow valignWrapper">
          <div className="mRight10">{_l('默认')}</div>
          <Select
            style={{ width: 100 }}
            className="chartSelect"
            value={paginationSize}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={value => {
              onChangeStyle({ paginationSize: value });
            }}
          >
            {[20, 25, 30, 50, 100].map(page => (
              <Select.Option className="selectOptionWrapper" key={page} value={page}>
                {page}
              </Select.Option>
            ))}
          </Select>
          <div className="mLeft10">{_l('条/页')}</div>
        </div>
      )}
      <div className="flexRow valignWrapper mTop16">
        <Checkbox
          className="mLeft0"
          checked={style.pivotTableUnilineShow}
          onChange={e => {
            onChangeStyle({ pivotTableUnilineShow: e.target.checked });
          }}
        >
          {_l('单行显示')}
        </Checkbox>
      </div>
    </div>
  );
};

export default PreinstallStyle;
