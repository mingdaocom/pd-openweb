import React, { Fragment } from 'react';
import styled from 'styled-components';
import { defaultPivotTableStyle } from './TitleStyle';

const Wrap = styled.div`
  .colorBlock {
    width: 14px;
    height: 14px;
    border-radius: 2px;
    margin-right: 5px;
  }
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
  const { pivotTableStyle = defaultPivotTableStyle } = style;

  const handleChangePivotTableStyle = (data) => {
    onChangeStyle({
      pivotTableStyle: {
        ...pivotTableStyle,
        ...data,
      }
    });
  }

  return (
    <Wrap className="chartTypeSelect flexRow valignWrapper mBottom16">
      {styles.map(item => (
        <div
          key={item.value}
          className="flex centerAlign pointer Gray_75"
          onClick={() => {
            handleChangePivotTableStyle(item.config);
          }}
        >
          <div className="colorBlock" style={{ backgroundColor: item.color }}></div>
          {item.name}
        </div>
      ))}
    </Wrap>
  );
}

export default PreinstallStyle;
