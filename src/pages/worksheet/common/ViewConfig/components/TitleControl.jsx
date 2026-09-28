import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';
import ConcatenateSetting from 'src/pages/widgetConfig/widgetSetting/settings/concatenate.jsx';
import { canSetAsTitle, getIconByType } from 'src/utils/domain/control/metadata';
import { ALL_SYS } from 'src/utils/domain/control/widget';
import { getWrappedViewTitleControlId } from 'src/utils/services/worksheet/view';

const Wrap = styled.div`
  .fieldsWrap .fieldList li {
    max-width: 100%;
  }
  .tagInputarea .CodeMirror .CodeMirror-lines {
    padding: 3px 0;
  }
  .CodeMirror-sizer {
    min-height: 36px;
    .CodeMirror-placeholder {
      line-height: 28px !important;
      color: var(--color-text-disabled) !important;
      padding-left: 10px !important;
    }
  }
  .isolate {
    bottom: 100%;
  }
`;

function resolveTitleControl({ viewtitle, cancelAble, worksheetControls }) {
  if (!viewtitle && cancelAble) return {};
  // 兼容 $单个字段ID$：高亮按归一后的真实字段 ID 匹配；保存仍走 handleChange 写回原值。
  const controlId = getWrappedViewTitleControlId(viewtitle);
  return worksheetControls.find(o => (controlId ? o.controlId === controlId : o.attribute === 1)) || {};
}

function TitleDrop(props) {
  const { advancedSetting, worksheetControls, handleChange, controls, cancelAble } = props;
  const { viewtitle } = advancedSetting;
  const titleControl = resolveTitleControl({ viewtitle, cancelAble, worksheetControls });
  const selectOptions = controls.map(item => ({
    value: item.value,
    label: (
      <div className="flexRow alignItemsCenter">
        <Icon icon={item.iconName} className="Font16 textTertiary" />
        <span className="mLeft10 Font14">{item.text}</span>
      </div>
    ),
  }));
  const titleControlValue = selectOptions.some(item => item.value === titleControl.controlId)
    ? titleControl.controlId
    : undefined;

  return (
    <Select
      className="w100"
      options={selectOptions}
      labelRender={({ value }) => controls.find(item => item.value === value)?.text}
      value={titleControlValue}
      allowClear={cancelAble}
      listHeight={260}
      style={{ width: '100%' }}
      onChange={value => {
        if (value === titleControl.controlId) {
          return;
        }

        if (!value) {
          handleChange('');
        } else {
          handleChange(value);
        }
      }}
      placeholder={_l('请选择')}
    />
  );
}

export default function (props) {
  const { isCard, advancedSetting, className, worksheetControls, handleChange, title } = props;
  const { viewtitle } = advancedSetting;
  const controls = worksheetControls
    .filter(o => canSetAsTitle(o) && !_.includes(ALL_SYS, o.controlId))
    .map(it => {
      return {
        ...it,
        value: it.controlId,
        text: it.controlName,
        iconName: getIconByType(it.type, false),
      };
    });
  return (
    <Wrap className={className}>
      <div className="title Font13 bold"> {title || _l('标题')}</div>
      {!isCard && <div className="textSecondary mTop8 Font13">{_l('指定显示在时间块上的内容')}</div>}
      <div className="settingContent mTop8">
        {isCard ? (
          <TitleDrop {...props} controls={controls} />
        ) : (
          <ConcatenateSetting
            data={{
              type: 32,
              dataSource: viewtitle,
            }}
            placeholder={_l('记录标题')}
            classNames={'mTop0'}
            hideTitle
            withSYS={false}
            allControls={controls}
            onChange={data => {
              handleChange(data.dataSource);
            }}
          />
        )}
      </div>
    </Wrap>
  );
}
