import React from 'react';
import _ from 'lodash';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/setting';
import { AddCustomDialog } from '../components/CustomWidget';
import { openDevelopWithAI } from '../components/DevelopWithAI';

export default function Custom(props) {
  const { data, globalSheetInfo = {}, saveControls, onChange, deleteWidget, from } = props;
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
