import React, { Fragment, useRef, useState } from 'react';
import styled from 'styled-components';
import { Slider, Input, Button } from 'ming-ui';
import SliderScaleConfig from 'src/pages/widgetConfig/widgetSetting/components/SliderScaleConfig';

const Con = styled.div`
  width: 100%;
  padding: 100px;
  text-align: center;
`;

export default function D(props) {
  const inputRef = useRef();
  const [itemnames, setItemnames] = useState([
    { key: '10', value: '10只' },
    { key: '18', value: '18只' },
    { key: '30', value: '30只' },
    { key: '80', value: '80只' },
  ]);
  const [itemcolor, setItemcolor] = useState({
    type: 2,
    colors: [
      { key: '20', value: 'red' },
      { key: '60', value: '#ffac00' },
      { key: '100', value: 'green' },
    ],
  });
  const [value, setValue] = useState(18);
  const [visible, setVisible] = useState(true);

  return (
    <Con>
      <Button onClick={() => setVisible(true)}>open SliderScaleConfig</Button>
      {visible && (
        <SliderScaleConfig
          min={0}
          max={100}
          itemnames={itemnames}
          itemcolor={itemcolor}
          onCancel={() => setVisible(false)}
          onChange={value => {
            console.log('new items', value);
            setItemnames(value);
          }}
        />
      )}
      <Slider
        className="mTop10"
        min={0}
        max={100}
        step={1}
        value={value}
        // itemcolor={{ type: 1, color: '#333' }} // 1：固定 2：动态
        itemcolor={itemcolor} // 1：固定 2：动态
        itemnames={itemnames}
      />
      <div className="mTop80">
        <Input manualRef={inputRef} defaultValue={value} />
        <Button className="mLeft10" onClick={() => setValue(Number(inputRef.current.value))}>
          set
        </Button>
      </div>
    </Con>
  );
}
