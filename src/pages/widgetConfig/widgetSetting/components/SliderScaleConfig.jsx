import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { arrayOf, number, shape, string, bool, func } from 'prop-types';
import { Modal, Slider, Input } from 'ming-ui';
import { Tip9e } from 'worksheet/components/Basics';

const SliderCon = styled.div`
  margin-top: 30px;
`;

const ScaleCon = styled.div`
  margin-top: 41px;
`;
const ScaleItem = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  input {
    width: 100px;
    margin: 0 20px 0 12px;
  }
`;
const Label = styled.div``;
const Buttons = styled.div``;

export default function SliderScaleDialog(props) {
  const { min, max, step, itemnames, itemcolor, onChange = _.noop, onCancel } = props;
  const cache = useRef({});
  const [scales, setScales] = useState(
    (
      itemnames || [
        { key: max, value: max },
        { key: min, value: min },
      ]
    ).map(c => ({ ...c, id: Math.random().toString(16).slice(2) })),
  );
  const [activeIndex, setActiveIndex] = useState();
  function updateActiveIndex(v) {
    setActiveIndex(v);
    cache.current.activeIndex = v;
  }
  const removeDisabled = scales.length === 1;
  function updateScale(i, key, value) {
    setScales(oldScales => [
      ...oldScales.slice(0, i),
      {
        ...oldScales[i],
        key: _.isUndefined(key) ? oldScales[i].key : key,
        value: _.isUndefined(value) ? oldScales[i].value : value,
      },
      ...oldScales.slice(i + 1),
    ]);
  }
  return (
    <Modal
      width={480}
      visible
      title={_l('刻度')}
      bodyStyle={{ paddingTop: 10 }}
      onCancel={onCancel}
      onOk={() => {
        onCancel();
        onChange(
          _.orderBy(scales, function (o) {
            return Number(o.key);
          }),
        );
      }}
    >
      <Tip9e>{_l('使用刻度标记进度位置，通过参考标记位置以便选值。如在数值为37时，显示刻度37℃。')}</Tip9e>
      <SliderCon>
        <Slider
          value={_.isObject(scales[activeIndex]) && Number(scales[activeIndex].key)}
          step={step}
          min={min}
          max={max}
          itemnames={scales}
          itemcolor={itemcolor}
          showInput={false}
          showNumber={false}
          onChange={v => {
            if (!_.isUndefined(cache.current.activeIndex)) {
              updateScale(cache.current.activeIndex, v);
            }
          }}
        />
      </SliderCon>
      <ScaleCon>
        {scales.map((item, i) => (
          <ScaleItem key={item.id}>
            <Label>{_l('数值')}</Label>
            <Input
              onFocus={() => updateActiveIndex(i)}
              value={item.key}
              onChange={v => updateScale(i, v.replace(/[^-\d.]/g, ''), item.value)}
            />
            <Label className="mLeft16">{_l('刻度')}</Label>
            <Input
              onFocus={() => updateActiveIndex(i)}
              value={item.value}
              onChange={v => updateScale(i, item.key, v)}
            />
            <Buttons>
              <i
                className={'icon-remove_circle_outline Font18 mRight12 ' + (removeDisabled ? 'Gray_d' : 'Gray_9e Hand')}
                onClick={
                  removeDisabled
                    ? () => {}
                    : () => setScales(oldScales => [...oldScales.slice(0, i), ...oldScales.slice(i + 1)])
                }
              ></i>
              <i
                className={'icon-control_point Font18 mRight12 Gray_9e Hand'}
                onClick={() =>
                  setScales(oldScales => [
                    ...oldScales.slice(0, i + 1),
                    { id: Math.random().toString(16).slice(2) },
                    ...oldScales.slice(i + 1),
                  ])
                }
              ></i>
            </Buttons>
          </ScaleItem>
        ))}
      </ScaleCon>
    </Modal>
  );
}

SliderScaleDialog.propTypes = {
  min: number,
  max: number,
  step: number,
  itemcolor: shape({}),
  itemnames: arrayOf(
    shape({
      key: string,
      value: string,
    }),
  ),
  onChange: func,
  onCancel: func,
};
