import React from 'react';
import DynamicDefaultValue from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue';
import styled from 'styled-components';
import _ from 'lodash';

const ProcessWrap = styled.div`
  .selectOtherFieldContainer {
    ${props => (props.hideDynamicValue ? 'display: none;' : '')}
  }
  .defaultOptionsWrap {
    ${props => (props.hideDynamicValue ? 'margin-right: 0;' : '')}
    background: #fff
  }
`;

export default function ProcessInput(props) {
  const { projectId, item, inputData, onChange } = props;
  const { value = [], type, enumDefault } = inputData;
  const hideDynamicValue = _.includes([6, 9, 14, 36], type);
  return (
    <ProcessWrap className="settingItem" hideDynamicValue={hideDynamicValue}>
      <div className="settingTitle Normal">
        {item.text}
        {item.required && <i className="Red">*</i>}
      </div>
      <DynamicDefaultValue
        from={5} // 为了异化默认值其他字段配置
        allControls={[]}
        globalSheetInfo={{
          projectId
        }}
        hideTitle={true}
        totalWidth={hideDynamicValue}
        data={{
          ...inputData,
          advancedSetting: { defsource: JSON.stringify(value), defaulttype: '' },
          enumDefault: _.includes([26, 27, 48], type) ? 1 : enumDefault,
        }}
        onChange={newData => {
          const defSource = safeParse(_.get(newData, 'advancedSetting.defsource') || '[]');
          onChange(defSource);
        }}
      />
    </ProcessWrap>
  );
}
