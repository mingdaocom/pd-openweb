import React, { Fragment, useState } from 'react';
import { Dialog } from 'ming-ui';
import { Checkbox } from 'antd';
import langConfig from 'src/common/langConfig';
import appManagementApi from 'src/api/appManagement';

const AddLangModal = props => {
  const { app, langs = [], visible, onCancel, onSave } = props;
  const [selectKey, setSelectKey] = useState(langs.map(n => _.find(langConfig, { code: n.type }).key));
  const handleSave = () => {
    appManagementApi.createAppLang({
      projectId: app.projectId,
      appId: app.id,
      langTypes: selectKey.map(n => _.find(langConfig, { key: n }).code),
    }).then(data => {
      const { suc } = data;
      if (suc.length) {
        onCancel();
        onSave();
      }
    });
  };

  return (
    <Dialog
      centered={true}
      title={_l('添加语言')}
      visible={visible}
      onOk={handleSave}
      onCancel={onCancel}
    >
      <div className="flexColumn mTop10">
        {langConfig.map(data => (
          <Checkbox
            className="mLeft0 mBottom10"
            key={data.key}
            disabled={_.find(langs, { type: data.code })}
            checked={selectKey.includes(data.key)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectKey(selectKey.concat(data.key));
              } else {
                setSelectKey(selectKey.filter(n => n !== data.key));
              }
            }}
          >
            {data.value}
          </Checkbox>
        ))}
      </div>
    </Dialog>
  );
}

export default AddLangModal;