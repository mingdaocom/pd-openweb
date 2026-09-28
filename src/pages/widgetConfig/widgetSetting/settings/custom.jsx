import React from 'react';
import _ from 'lodash';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { AddCustomDialog } from '../components/CustomWidget';
import { useDevelopWithAI } from '../components/DevelopWithAI';

function Custom(props) {
  const { data, globalSheetInfo = {}, saveControls, onChange, deleteWidget, from, openDevelopWithAI } = props;
  const { customtype } = getAdvanceSetting(data);

  if (!customtype && from !== 'subList') {
    return (
      <AddCustomDialog
        {...props}
        onCancel={() => deleteWidget(data.controlId)}
        onOk={(nextData, saveInfo = {}) => {
          onChange(nextData, widgets => {
            // 关联本表
            if (saveInfo.relateSelf) {
              saveControls({ refresh: true, actualWidgets: widgets });
            }

            openDevelopWithAI({
              worksheetId: globalSheetInfo.worksheetId,
              control: nextData,
              defaultCode: '',
              rest: {
                ...props,
                data: nextData,
                allControls: _.flatten(widgets),
              },
            });
          });
        }}
      />
    );
  }

  return null;
}

export default withOpeners(Custom, {
  openDevelopWithAI: useDevelopWithAI,
});
