import React, { Fragment, useState, useEffect } from 'react';
import { Dropdown, LoadDiv } from 'ming-ui';
import ProcessInput from './ProcessInput';
import SelectOtherPBCDialog from 'src/pages/workflow/WorkflowSettings/Detail/components/SelectOtherPBCDialog';
import processApi from 'src/pages/workflow/api/process';
import processVersionApi from 'src/pages/workflow/api/processVersion';
import homeAppApi from 'src/api/homeApp';
import customApi from 'statistics/api/custom';
import _ from 'lodash';

export default function SelectProcess(props) {
  const { appId, projectId, btnSetting, setDataSource, setBtnSetting } = props;
  const { processId, config = {} } = btnSetting;

  const [processList, setProcessList] = useState([]);
  const [inputList, setInputList] = useState([]);
  const [otherAppProcess, setOtherAppProcess] = useState(null);
  const [otherProcessVisible, setOtherProcessVisible] = useState(false);
  const [processLoading, setProcessLoading] = useState(true);

  const getList = () => {
    processVersionApi.list({
      relationId: appId,
      processListType: 10,
    }).then(data => {
      const { processList = [], groupName } = data[0] || {};
      setProcessList(processList.map(item => {
        return {
          text: item.name,
          value: item.id
        }
      }));
    });
  }

  useEffect(() => {
    setInputList([]);
    setOtherAppProcess(null);
  }, [btnSetting.id]);

  useEffect(() => {
    if (_.get(btnSetting, ['config', 'text']) === 2 && _.isEmpty(processList)) {
      getList();
      return;
    }
    if (_.get(btnSetting, ['action']) === 6 && _.isEmpty(processList)) {
      getList();
      return;
    }
  }, [btnSetting.config, btnSetting.action]);

  useEffect(() => {
    if (btnSetting.processId) {
      let { inputs = [], inputsIsEdit } = btnSetting.config || {};

      setProcessLoading(true);

      const getProcessApiInfo = () => {
        processApi.getProcessApiInfo({
          processId: btnSetting.processId
        }).then(data => {
          data.inputs = data.inputs.filter(item => [2, 6, 9, 16, 26, 27, 36, 48].includes(item.type));
          if (data.relationId !== appId) {
            homeAppApi.getApp({
              appId: data.relationId
            }).then(app => {
              setOtherAppProcess({
                appName: app.name,
                processName: data.name,
              });
            });
          }
          setInputList(data.inputs.map(item => {
            return {
              text: item.controlName,
              value: item.controlId,
              required: item.required
            }
          }));
          setBtnSetting({
            ...btnSetting,
            config: {
              ...config,
              inputsIsEdit: true,
              inputs: data.inputs.map(item => {
                const input = _.find(inputs, { controlId: item.controlId });
                return {
                  ...item,
                  value: input ? input.value : []
                }
              })
            }
          });
          setProcessLoading(false);
        });
      }

      if (inputsIsEdit) {
        getProcessApiInfo();
      } else {
        customApi.transformControlValue({
          companyId: projectId,
          controls: inputs,
        }).then(data => {
          inputs = data;
          getProcessApiInfo();
        });
      }

    } else {
      setProcessLoading(false);
    }
  }, [btnSetting.id, btnSetting.processId]);

  const changeProcessId = (value) => {
    setOtherAppProcess(null);
    setBtnSetting({
      ...btnSetting,
      processId: value,
      config: {
        ...config,
        inputs: []
      }
    });
  }

  const otherPBC = [
    {
      text: _l('其它应用下的封装业务流程'),
      value: 'other',
      className: 'Gray_75',
    },
  ];

  return (
    <Fragment>
      <div className="settingItem">
        <div className="settingTitle">{_l('选择业务流程')}</div>
        <Dropdown
          border
          openSearch
          value={processId}
          data={[processList, otherPBC]}
          renderTitle={otherAppProcess ? () => (
            <Fragment>
              <span>{otherAppProcess.processName}</span>
              <span className="Gray_75 mLeft5">{`(${otherAppProcess.appName})`}</span>
            </Fragment>
          ) : undefined}
          onChange={value => {
            if (value === 'other') {
              setOtherProcessVisible(true);
            } else {
              changeProcessId(value);
            }
          }}
          style={{ width: '100%', background: '#fff' }}
          menuStyle={{ width: '100%' }}
          placeholder={_l('请选择业务流程')}
          noData={_l('暂无业务流程，请先在应用里创建')}
        />
      </div>
      {processLoading ? (
        <LoadDiv />
      ) : (
        inputList.map(item => (
          <ProcessInput
            key={item.value}
            projectId={projectId}
            item={item}
            action={btnSetting.action}
            inputData={_.find(_.get(btnSetting, ['config', 'inputs']) || [], { controlId: item.value }) || []}
            onChange={(value) => {
              const inputs = _.get(btnSetting, ['config', 'inputs']) || [];
              const newInputs = inputs.map((input) => {
                if (input.controlId === item.value) {
                  return { ...input, value }
                } else {
                  return input;
                }
              });
              setBtnSetting({
                ...btnSetting,
                config: {
                  ...config,
                  inputsIsEdit: true,
                  inputs: newInputs
                }
              });
            }}
          />
        ))
      )}
      {otherProcessVisible && (
        <SelectOtherPBCDialog
          appId={appId}
          companyId={projectId}
          onOk={(data) => {
            changeProcessId(data.selectPBCId);
          }}
          onCancel={() => {
            setOtherProcessVisible(false);
          }}
        />
      )}
    </Fragment>
  );
}
