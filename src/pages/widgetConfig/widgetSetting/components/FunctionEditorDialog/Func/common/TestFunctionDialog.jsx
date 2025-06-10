import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { find, get, isFunction, omit, uniq } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Modal } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import CustomFields from 'src/components/newCustomFields';
import { selectRecords } from 'src/components/SelectRecords';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget.js';
import execValueFunction from 'src/pages/widgetConfig/widgetSetting/components/FunctionEditorDialog/Func/exec';
import { isRelateRecordTableControl } from 'src/utils/control';
import CodeEdit from './CodeEdit';

const Header = styled.div`
  height: 50px;
  font-size: 17px;
  font-weight: bold;
  padding: 0 24px;
  line-height: 50px;
`;

const Con = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const EditorConCon = styled.div`
  padding: 0 26px;
  flex: 1;
`;

const EditorCon = styled.div`
  height: 100%;
  padding: 0 20px;
  background: #fafafa;
  border-radius: 3px;
  .CodeMirror {
    background: #fafafa;
  }
`;

const TestCon = styled.div`
  height: 480px;
  padding-bottom: 26px;
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  overflow: hidden;
  .header {
    padding: 0 26px;
    height: 56px;
    font-size: 17px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #bdbdbd;
    .selectRecord {
      width: 72px;
      height: 24px;
      line-height: 22px;
      border-radius: 2px;
      border: 1px solid #bdbdbd;
      color: #bdbdbd;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      justify-content: center;
      &:hover {
        border-color: #2196f3;
        color: #2196f3;
      }
    }
  }
  .controlName {
    padding: 0 26px;
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
      color: #4caf50;
      white-space: nowrap;
    }
    .name {
      font-size: 20px;
      font-weight: bold;
    }
    .equal {
      font-size: 20px;
      font-weight: bold;
      color: #757575;
      margin-left: 6px;
      font-family: monospace;
    }
    &.error {
      color: #f44336;
    }
  }
  .testForm {
    padding: 0 26px;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .footer {
    padding: 0 26px;
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
    renderTag,
    onChange,
    insertTagToEditor,
    onCancel,
    onUpdate,
  } = props;
  const codeEditorRef = useRef();
  const [expression, setExpression] = useState(value);
  const controlIdsInExpression = uniq((expression.match(/\$(.+?)\$/g) || []).map(id => id.slice(1, -1)));
  const [testFormValues, setTestFormValues] = useState({});
  const [formFlag, setFormFlag] = useState(null);
  const [testError, setTestError] = useState(false);
  const [testResultValue, setTestResultValue] = useState('');
  const formData = controlIdsInExpression
    .map(controlId =>
      find(controls, c => {
        return (
          (/^[a-zA-Z0-9]+-[\w\W]+$/.test(controlId) ? controlId.replace(/[a-zA-Z0-9]+-/, '') : controlId) ===
          c.controlId
        );
      }),
    )
    .filter(_.identity)
    .map(c => ({
      ...c,
      type: changeControlType(c),
      ...(c.type === 30 ? omit(c.sourceControl || { type: c.sourceControlType }, 'controlId') : {}),
      size: 12,
      sectionId: undefined,
      required: false,
      fieldPermission: '111',
      controlPermissions: '111',
      value: testFormValues[c.controlId],
      notSupport:
        [
          WIDGETS_TO_API_TYPE_ENUM.SUB_LIST,
          ...(isWorksheetFlow ? [WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET] : []),
        ].includes(c.type) || isRelateRecordTableControl(c),
      notSupportTip: _l('暂不支持调试%0', c.controlName),
    }));
  return (
    <Modal
      visible
      className="testFunctionDialog contentScroll"
      footer={null}
      onCancel={() => {
        onUpdate(codeEditorRef.current.getValue());
        onCancel();
      }}
      height={720}
      style={{ minWidth: width }}
      bodyStyle={{
        padding: 0,
        position: 'relative',
        height: 720,
        flex: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header>{_l('函数测试')}</Header>
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
              <div
                className="selectRecord"
                onClick={() =>
                  selectRecords({
                    canSelectAll: false,
                    pageSize: 25,
                    multiple: false,
                    worksheetId,
                    onOk: selectedRecords => {
                      if (selectedRecords && selectedRecords[0]) {
                        const newFormData = {};
                        controlIdsInExpression.forEach(controlId => {
                          controlId = controlId.replace(/[a-zA-Z0-9]+-/, '');
                          newFormData[controlId] = selectedRecords[0][controlId];
                        });
                        setTestFormValues(newFormData);
                        setFormFlag(Math.random());
                      }
                    },
                  })
                }
              >
                {_l('选择数据')}
              </div>
            )}
          </div>
          <div className={cx('controlName', { error: testError })}>
            <span className="name ellipsis">{title}</span>
            <span className="equal">=</span>
            {testResultValue && (
              <span className="resultValue">
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
              ref={ref => {
                // setRef(ref);
              }}
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
          <div className="footer">
            <Button
              className="mTop20"
              style={{ width: 90, padding: 0 }}
              onClick={() => {
                const testResult = execValueFunction(control, formData, {
                  defaultExpression: expression.replace(/\$([a-zA-Z0-9]+-)(.*?)\$/g, '$$$2$'),
                });
                setTestError(!!testResult.error);
                setTestResultValue(testResult.value || '');
              }}
            >
              {_l('测试')}
            </Button>
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
  codeEditor: PropTypes.shape({}),
  renderTag: PropTypes.func,
  onChange: PropTypes.func,
  insertTagToEditor: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number,
  onCancel: PropTypes.func,
  onUpdate: PropTypes.func,
};

export function openTestFunctionDialog(props) {
  return functionWrap(TestFunctionDialog, props);
}
