import React, { Fragment } from 'react';
import { SettingItem } from '../../styled';
import BraftEditor from 'src/components/braftEditor/braftEditor';

export default function Remark({ data, onChange }) {
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('备注内容')}</div>
        <div className="settingContent braftEditor">
          <BraftEditor
            key={data.controlId}
            actualSave={true}
            isEditing={true}
            summary={data.dataSource}
            noFooter={true}
            onActualSave={value => onChange({ dataSource: value })}
          />
        </div>
      </SettingItem>
    </Fragment>
  );
}
