import React, { Fragment } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Select } from 'antd';
import { defaultPivotTableStyle } from './TitleStyle';

const ColorBlock = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 2px;
  margin-right: 5px;
`;

const styles = [{
  value: 1,
  color: '#E0E0E0',
  name: _l('简单'),
  config: {
    columnTextColor: '#757575',
    columnBgColor: '#fafafa',
    lineTextColor: '#333',
    lineBgColor: '#fff'
  }
}, {
  value: 2,
  color: '#2196F3',
  name: _l('商务'),
  config: {
    columnTextColor: '#fff',
    columnBgColor: '#2196F3',
    lineTextColor: '#fff',
    lineBgColor: '#2196F3'
  }
}, {
  value: 3,
  color: '#3E4662',
  name: _l('炫酷'),
  config: {
    columnTextColor: '#fff',
    columnBgColor: '#3E4662',
    lineTextColor: '#fff',
    lineBgColor: '#3E4662'
  }
}];

const PreinstallStyle = props => {
  const { style, onChangeStyle } = props;
  const { pivotTableStyle = defaultPivotTableStyle, paginationVisible, paginationSize = 20 } = style;

  const handleChangePivotTableStyle = (data) => {
    onChangeStyle({
      pivotTableStyle: {
        ...pivotTableStyle,
        ...data,
      }
    });
  }

  return (
    <div className="mBottom16">
      <div className="mBottom10">{_l('预设样式')}</div>
      <div className="chartTypeSelect flexRow valignWrapper">
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
      <div className="flexRow valignWrapper mTop16">
        <Checkbox
          className="mLeft0"
          checked={paginationVisible}
          onChange={(e) => {
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
          onChange={(e) => {
            onChangeStyle({ pivotTableUnilineShow: e.target.checked });
          }}
        >
          {_l('单行显示')}
        </Checkbox>
      </div>
    </div>
  );
}

export default PreinstallStyle;
