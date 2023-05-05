import React, { Fragment } from 'react';
import cx from 'classnames';
import { Collapse, Checkbox, Switch } from 'antd';
import goldCrown from 'statistics/assets/topChart/gold_crown.png';
import goldMedal from 'statistics/assets/topChart/gold_medal.png';
import one from 'statistics/assets/topChart/one.png';

const styles = [{
  value: 'crown',
  name: _l('皇冠'),
  icon: goldCrown,
}, {
  value: 'medal',
  name: _l('奖牌'),
  icon: goldMedal,
}, {
  value: 'number',
  name: _l('数字'),
  icon: one,
}];

const TopStyle = props => {
  const { style, onChangeStyle } = props;
  const { topStyle } = style || {};
  return (
    <div className="chartTypeImageSelect flexRow valignWrapper mBottom16">
      {styles.map(item => (
        <div
          key={item.value}
          className={cx('flex styleItem centerAlign pointer Gray_75', { active: item.value === topStyle })}
          onClick={() => {
            onChangeStyle({ topStyle: item.value });
          }}
        >
          <div className="iconWrap">
            <img src={item.icon} />
          </div>
          {item.name}
        </div>
      ))}
    </div>
  );
}

const ValueProgressVisible = props => {
  const { style, onChangeStyle } = props;
  const { valueProgressVisible } = style || {};
  return (
    <div className="flexRow valignWrapper">
      <Checkbox
        className="mLeft0 mBottom16"
        checked={valueProgressVisible}
        onChange={() => {
          onChangeStyle({ valueProgressVisible: !valueProgressVisible });
        }}
      >
        {_l('显示图形')}
      </Checkbox>
    </div>
  );
}


export default function topChartPanelGenerator(props) {
  const { currentReport, onChangeStyle } = props;
  const { topStyle = 'crown', valueProgressVisible = true } = currentReport.style || {};
  return (
    <Fragment>
      <Collapse.Panel
        key="valueProgress"
        header={_l('数据条')}
        className={cx({ collapsible: !valueProgressVisible })}
        extra={
          <Switch
            size="small"
            checked={valueProgressVisible}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              onChangeStyle({ valueProgressVisible: checked });
            }}
          />
        }
      >
        <ValueProgressVisible style={currentReport.style} onChangeStyle={onChangeStyle} />
      </Collapse.Panel>
      <Collapse.Panel
        key="topStyle"
        header={_l('TOP样式')}
        className={cx({ collapsible: !topStyle })}
        extra={
          <Switch
            size="small"
            checked={topStyle}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              onChangeStyle({ topStyle: checked ? 'crown' : false });
            }}
          />
        }
      >
        <TopStyle style={currentReport.style} onChangeStyle={onChangeStyle} />
      </Collapse.Panel>
    </Fragment>
  );
}

