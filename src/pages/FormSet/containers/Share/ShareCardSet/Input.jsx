import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Input } from 'ming-ui';
import DynamicDefaultValue from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue';

const Wrap = styled.div`
  &.chooseControl {
    & > div {
      width: 100%;
    }
    .fieldList li {
      max-width: 100%;
    }
  }
`;

function InputForShare(props) {
  const { canUseControl, controls, defaultValue, onChangeValue, worksheetInfo, placeholder } = props;

  const renderInput = () => {
    return (
      <Input
        className="flex"
        {...props}
        onClick={e => e.stopPropagation()}
        onBlur={e => {
          e.stopPropagation();
          const newValue = e.target.value;
          if (!_.isEqual(defaultValue, newValue)) {
            onChangeValue(newValue);
          }
        }}
      />
    );
  };

  return (
    <Wrap className="flexRow chooseControl">
      {canUseControl ? (
        <DynamicDefaultValue
          hideTitle
          propFiledVisible
          hideRelateSheetHeader
          hideSearchAndFun
          globalSheetInfo={_.pick(worksheetInfo, ['appId', 'groupId', 'name', 'projectId', 'worksheetId'])}
          placeholder={placeholder}
          onChange={d => {
            const { advancedSetting = {} } = d;
            let { defsource } = advancedSetting;
            onChangeValue(defsource);
          }}
          allControls={controls}
          data={{
            type: 2,
            advancedSetting: {
              defsource: defaultValue,
            },
          }}
          from={10}
          defaultType={false}
        />
      ) : (
        renderInput()
      )}
    </Wrap>
  );
}

export default InputForShare;
