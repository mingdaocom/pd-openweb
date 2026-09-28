import React, { useRef, useState } from 'react';
import cx from 'classnames';
import { find, get, isFunction, omit, uniq } from 'lodash';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import CustomFields from 'src/components/Form';
import { useSelectRecords } from 'src/components/SelectRecords';
import execValueFunction from 'src/pages/widgetConfig/widgetSetting/components/FunctionEditorDialog/Func/exec';
import { isRelateRecordTableControl } from 'src/utils/domain/control/type';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import CodeEdit from './CodeEdit';

const Con = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const EditorConCon = styled.div`
  flex: 1;
`;

const EditorCon = styled.div`
  height: 100%;
  padding: 0 20px;
  background: var(--color-background-secondary);
  border-radius: 3px;
  .CodeMirror {
    background: var(--color-background-secondary);
  }
`;

const SELECT_RECORD_BUTTON_STYLE = { minWidth: 72, flexShrink: 0 };

const TestCon = styled.div`
  height: 480px;
  padding-bottom: 26px;
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  overflow: hidden;
  .header {
    height: 56px;
    font-size: 17px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--color-text-disabled);
  }
  .controlName {
    margin-top: 12px;
    position: relative;
    display: flex;
    align-items: center;
    height: 56px;
    overflow: hidden;
    padding-right: 50px;
    .resultValue {
      flex: 1;
      margin-left: 10px;
      font-weight: bold;
      font-size: 20px;
      color: var(--color-success);
      white-space: nowrap;
    }
    .name {
      font-size: 20px;
      font-weight: bold;
      flex-shrink: 0;
    }
    .equal {
      font-size: 20px;
      font-weight: bold;
      color: var(--color-text-secondary);
      margin-left: 6px;
      font-family: monospace;
    }
    &.error {
      color: var(--color-error);
    }
  }
  .testForm {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }
`;

function changeControlType(control) {
  const { type } = control;
  return (
    {
      [String(WIDGETS_TO_API_TYPE_ENUM.SIGNATURE)]: WIDGETS_TO_API_TYPE_ENUM.TEXT,
    }[String(type)] || type
  );
}

export default function TestFunctionDialog(props) {
  const {
    width,
    isWorksheetFlow,
    appId,
    worksheetId,
    projectId,
    control,
    type,
    value,
    title,
    controls,
    selectableControls,
    renderTag,
    onChange,
    onCancel,
    onUpdate,
  } = props;
  const { open: openSelectRecords, holder: selectRecordsHolder } = useSelectRecords();
  const codeEditorRef = useRef();
  const [expression, setExpression] = useState(value);
  const controlIdsInExpression = uniq((expression.match(/\$(.+?)\$/g) || []).map(id => id.slice(1, -1)));
  const [testFormValues, setTestFormValues] = useState({});
  const [formFlag, setFormFlag] = useState(null);
  const [testError, setTestError] = useState(false);
  const [testResultValue, setTestResultValue] = useState('');
  const formData = controlIdsInExpression
    .map(expressionControlId => {
      const bareId = /^[a-zA-Z0-9]+-[\w\W]+$/.test(expressionControlId)
        ? expressionControlId.replace(/[a-zA-Z0-9]+-/, '')
        : expressionControlId;
      const c = find(controls, ctrl => ctrl.controlId === bareId);
      if (!c) return null;
      return {
        ...c,
        controlId: expressionControlId,
        type: changeControlType(c),
        ...(c.type === 30 ? omit(c.sourceControl || { type: c.sourceControlType }, ['controlId', 'controlName']) : {}),
        size: 12,
        sectionId: undefined,
        required: false,
        fieldPermission: '111',
        controlPermissions: '111',
        value: testFormValues[expressionControlId],
        notSupport:
          [
            WIDGETS_TO_API_TYPE_ENUM.SUB_LIST,
            ...(isWorksheetFlow ? [WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET] : []),
          ].includes(c.type) || isRelateRecordTableControl(c),
        notSupportTip: _l('暂不支持调试%0', c.controlName),
      };
    })
    .filter(_.identity);

  const handleTest = () => {
    const testResult = execValueFunction(control, formData, {
      defaultExpression: expression,
    });
    const { value: resultValue } = testResult;

    setTestError(!!testResult.error);
    setTestResultValue(
      _.isUndefined(resultValue) || _.isNull(resultValue) || _.isNaN(resultValue) ? '' : String(resultValue),
    );
  };

  const handleCancel = () => {
    if (codeEditorRef.current) {
      onUpdate(codeEditorRef.current.getValue());
    }

    onCancel();
  };

  return (
    <Modal
      open
      title={_l('函数测试')}
      className="testFunctionDialog contentScroll"
      okText={_l('测试')}
      onOk={handleTest}
      onCancel={handleCancel}
      height={720}
      style={{ minWidth: width }}
    >
      {selectRecordsHolder}
      <Con>
        <EditorConCon>
          <EditorCon className="functionEditor">
            <CodeEdit
              isTest
              control={control}
              type={type}
              value={expression}
              title={title}
              controls={controls}
              selectableControls={selectableControls}
              ref={codeEditorRef}
              renderTag={renderTag}
              onChange={() => {
                setExpression(codeEditorRef.current.getValue());
                onChange();
              }}
              insertTagToEditor={(...args) => {
                if (isFunction(get(codeEditorRef, 'current.insertTag'))) {
                  get(codeEditorRef, 'current.insertTag')(...args);
                }
              }}
            />
          </EditorCon>
        </EditorConCon>
        <TestCon>
          <div className="header">
            {_l('输入参数进行测试')}
            {worksheetId && (
              <Button
                size="small"
                style={SELECT_RECORD_BUTTON_STYLE}
                onClick={() =>
                  openSelectRecords({
                    canSelectAll: false,
                    pageSize: 25,
                    multiple: false,
                    worksheetId,
                    onOk: selectedRecords => {
                      if (selectedRecords && selectedRecords[0]) {
                        const newFormData = {};
                        controlIdsInExpression.forEach(expressionControlId => {
                          const bareId = expressionControlId.replace(/[a-zA-Z0-9]+-/, '');
                          newFormData[expressionControlId] = selectedRecords[0][bareId];
                        });
                        setTestFormValues(newFormData);
                        setFormFlag(Math.random());
                      }
                    },
                  })
                }
              >
                {_l('选择数据')}
              </Button>
            )}
          </div>
          <div className={cx('controlName', { error: testError })}>
            <span className="name ellipsis">{title}</span>
            <span className="equal">=</span>
            {testResultValue && (
              <span className="resultValue" title={testResultValue}>
                <div className="ellipsis">{testResultValue}</div>
              </span>
            )}
          </div>
          <div className="testForm">
            <CustomFields
              from={3}
              flag={formFlag}
              hideControlName
              disableRules
              recordId="FAKE_RECORD_ID_FROM_BATCH_EDIT"
              disabledFunctions={['controlRefresh']}
              showTitle={false}
              data={formData}
              projectId={projectId}
              appId={appId}
              worksheetId={worksheetId}
              onChange={data => {
                if (data) {
                  setTestFormValues(data.reduce((a, b) => Object.assign(a, { [b.controlId]: b.value }), {}));
                }
              }}
            />
          </div>
        </TestCon>
      </Con>
    </Modal>
  );
}

TestFunctionDialog.propTypes = {
  type: PropTypes.number,
  control: PropTypes.shape({}),
  value: PropTypes.shape({}),
  title: PropTypes.string,
  controls: PropTypes.arrayOf(PropTypes.shape({})),
  selectableControls: PropTypes.arrayOf(PropTypes.shape({})),
  codeEditor: PropTypes.shape({}),
  renderTag: PropTypes.func,
  onChange: PropTypes.func,
  insertTagToEditor: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number,
  onCancel: PropTypes.func,
  onUpdate: PropTypes.func,
};

export function useTestFunctionDialog() {
  return useFunctionWrapComponent(TestFunctionDialog);
}
