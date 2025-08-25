import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import { Dialog } from 'ming-ui';
import process from '../../../../api/process';
import ProcessVariables from '../ProcessVariables';
import UpdateFields from '../UpdateFields';

export default ({ companyId, processId, relationId, selectNodeId, data, selectProcessId, desc, updateSource }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [processVariables, setProcessVariables] = useState([]);
  const saveProcessOptions = () => {
    let objArrError = 0;

    if (processVariables.filter(item => !item.controlName).length) {
      alert(_l('参数名称不能为空'), 2);
      return;
    }

    processVariables
      .filter(item => item.type === 10000008 && item.processVariableType === 0)
      .forEach(item => {
        if (!processVariables.find(o => o.dataSource === item.controlId)) objArrError++;
      });

    if (objArrError) {
      alert(_l('对象数组下至少要有一个参数'), 2);
      return;
    }

    process
      .saveProcessConfig({
        processId: selectProcessId,
        isSaveVariables: true,
        processVariables,
      })
      .then(result => {
        if (result) {
          alert(_l('保存成功'));
          setShowDialog(false);
          updateSource({ subProcessVariables: result });
        }
      });
  };

  return (
    <Fragment>
      <div className="Font13 mTop20 flexRow">
        <div className="flex bold">{_l('流程参数')}</div>
        {!!selectProcessId && (
          <div
            className="pointer ThemeColor3 ThemeHoverColor2"
            onClick={() => {
              setProcessVariables(data.subProcessVariables);
              setShowDialog(true);
            }}
          >
            {_l('参数设置')}
          </div>
        )}
      </div>
      <div className="Font13 Gray_75 mTop10">{desc}</div>

      <UpdateFields
        type={2}
        isSubProcessNode={true}
        companyId={companyId}
        processId={processId}
        relationId={relationId}
        selectNodeId={selectNodeId}
        controls={data.subProcessVariables}
        fields={data.fields}
        formulaMap={data.formulaMap}
        updateSource={updateSource}
      />

      {showDialog && (
        <Dialog
          visible
          width={800}
          className="subProcessDialog"
          onCancel={() => setShowDialog(false)}
          onOk={saveProcessOptions}
          title={_l('参数设置')}
        >
          <ProcessVariables
            processVariables={processVariables}
            updateSource={({ processVariables }) => setProcessVariables(_.cloneDeep(processVariables))}
          />
        </Dialog>
      )}
    </Fragment>
  );
};
