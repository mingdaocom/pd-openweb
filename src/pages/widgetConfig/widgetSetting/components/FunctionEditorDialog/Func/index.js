import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import cx from 'classnames';
import _, { includes } from 'lodash';
import { arrayOf, bool, func, shape } from 'prop-types';
import styled from 'styled-components';
import { validate } from 'uuid';
import { Switch } from 'ming-ui/antd-components';
import { emitter } from 'src/utils/platform/browser/dom';
import CodeEdit from './common/CodeEdit';
import Footer from './common/Footer';
import SelectFnControl from './common/SelectFnControl';
import { useTestFunctionDialog } from './common/TestFunctionDialog';
import Tip from './common/Tip';
import { validateFnExpression } from './validation';
import './style.less';

if (!window.emitter) {
  window.emitter = emitter;
}

const Con = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  color: var(--color-text-title);
`;
const Header = styled.div`
  height: 50px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 17px;
  font-weight: bold;
  padding: 0 24px;
  line-height: 50px;
`;
const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
`;
const SelectFnControlCon = styled.div`
  width: 320px;
  background: var(--color-background-secondary);
`;
const Dev = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 24px;
  overflow: hidden;
`;
const CodeEditCon = styled.div`
  flex: 1;
  height: 260px;
`;
const TipCon = styled.div`
  height: 200px;
  border-top: 1px solid var(--color-background-disabled);
`;

const ActiveJsSwitchCon = styled.div`
  float: right;
  display: flex;
  font-weight: normal;
  align-items: center;
  margin: 16px 30px;
  line-height: 1em;
  font-size: 14px;
  label {
    margin-right: 6px;
  }
  .txt {
    font-family: monospace;
    line-height: 22px !important;
  }
`;

function Func(props, ref) {
  const { open: openTestFunctionDialog, holder: testFunctionDialogHolder } = useTestFunctionDialog();
  const {
    supportDebug,
    isWorksheetFlow,
    appId,
    worksheetId,
    projectId,
    dialogWidth,
    dialogHeight,
    control = {},
    setRef,
    supportJavaScript,
    value,
    value: { expression } = {},
    title,
    renderTag,
    onClose,
    controlGroups,
    onSave,
    className,
    onChange,
    customTitle,
    fromCustom,
  } = props;
  const [type, setType] = useState(value.type || 'mdfunction');
  const [codeEditorLoading, setCodeEditorLoading] = useState(false);
  const [pendingEditorValue, setPendingEditorValue] = useState(null);
  let { controls = [], selectableControls } = props;

  if (_.isArray(controlGroups)) {
    controls = _.flatten(controlGroups.map(group => group.controls.map(c => ({ ...c, workflowGroupId: group.id }))));
    if (isWorksheetFlow) {
      controls = controls.map(c => ({
        ...c,
        type: c.originalType ? c.originalType : c.type,
        ...(includes([9, 10, 11], c.type) && {
          enumDefault2: 0,
        }),
      }));
      controlGroups.forEach(group => {
        group.controls = group.controls.map(c => ({
          ...c,
          type: c.originalType ? c.originalType : c.type,
          ...(includes([9, 10, 11], c.type) && {
            enumDefault2: 0,
          }),
        }));
      });
    }

    // 分组模式下可选字段由 controlGroups 决定
    selectableControls = undefined;
  }

  // 可供选择和输入提示的字段，未传时与 controls 一致；controls 仍保留全量，用于存量表达式的展示和校验
  const fnSelectableControls = selectableControls || controls;

  const codeEditor = useRef();
  const loadingTimerRef = useRef(null);

  const editorFunctions = key => {
    return (...args) => {
      if (codeEditor.current) {
        codeEditor.current[key](...args);
      } else {
        console.error('codeEditor mount failed');
      }
    };
  };

  function handleSave() {
    if (codeEditor.current) {
      const expression = codeEditor.current.getValue();

      let available = validateFnExpression(expression, type);
      const controlIds = (expression.match(/\$(.+?)\$/g) || []).map(id => id.slice(1, -1));

      if (
        controlIds.filter(
          id =>
            !_.find(controls, {
              controlId: /^[a-zA-Z0-9]+-[\w\W]+$/.test(id) && !validate(id) ? id.replace(/[a-zA-Z0-9]+-/, '') : id,
            }),
        ).length
      ) {
        // 存在已删除字段
        available = false;
      }

      console.log({ available });
      onSave({
        type,
        expression,
        status: available ? 1 : -1,
      });
      onClose();
    }
  }

  useImperativeHandle(ref, () => ({
    codeEditor: codeEditor.current,
    handleSave,
  }));
  useEffect(() => {
    if (setRef) {
      setRef('handleSave', handleSave);
    }
  }, []);

  useEffect(() => {
    if (!codeEditorLoading && pendingEditorValue !== null && codeEditor.current) {
      codeEditor.current.setValue(pendingEditorValue);
      setPendingEditorValue(null);
    }
  }, [codeEditorLoading, pendingEditorValue, type]);

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);
  return (
    <Con className={cx('functionEditor', className)}>
      {testFunctionDialogHolder}
      <Header>
        {customTitle || _l('编辑函数')}
        {supportJavaScript && !fromCustom && (
          <ActiveJsSwitchCon>
            <Switch
              size="small"
              checked={type === 'javascript'}
              onClick={(checked, event) => {
                event.stopPropagation();
                const tempValue = codeEditor.current ? codeEditor.current.getValue() : '';
                const nextType = !checked ? 'mdfunction' : 'javascript';
                setPendingEditorValue(tempValue);
                setType(nextType);
                setCodeEditorLoading(true);
                if (loadingTimerRef.current) {
                  clearTimeout(loadingTimerRef.current);
                }

                loadingTimerRef.current = setTimeout(() => {
                  setCodeEditorLoading(false);
                }, 10);
              }}
            />
            {_l('自定义函数')}
          </ActiveJsSwitchCon>
        )}
      </Header>
      <Main>
        <SelectFnControlCon>
          <SelectFnControl
            type={type}
            controlGroups={controlGroups}
            controls={fnSelectableControls}
            control={control}
            insertTagToEditor={editorFunctions('insertTag')}
            insertFn={editorFunctions('insertFn')}
          />
        </SelectFnControlCon>
        <Dev>
          <CodeEditCon>
            {!codeEditorLoading && (
              <CodeEdit
                isWorksheetFlow={isWorksheetFlow}
                isCustom={fromCustom}
                showTestButton={supportDebug && type !== 'javascript'}
                dialogWidth={dialogWidth}
                dialogHeight={dialogHeight}
                appId={appId}
                worksheetId={worksheetId}
                projectId={projectId}
                control={control}
                type={type}
                value={expression}
                title={title}
                controls={controls}
                selectableControls={fnSelectableControls}
                ref={codeEditor}
                renderTag={renderTag}
                onChange={onChange}
                insertTagToEditor={editorFunctions('insertTag')}
                openTestFunctionDialog={openTestFunctionDialog}
              />
            )}
          </CodeEditCon>
          <TipCon>
            <Tip type={type} />
          </TipCon>
          <Footer onClose={onClose} onSave={handleSave} />
        </Dev>
      </Main>
    </Con>
  );
}

export default forwardRef(Func);

Func.propTypes = {
  control: shape({}),
  supportJavaScript: bool,
  value: shape({}),
  controls: arrayOf(shape({})),
  selectableControls: arrayOf(shape({})),
  controlGroups: arrayOf(shape({})), // { controlName, controlId }
  renderTag: func,
  onClose: func,
  onSave: func,
  onChange: func,
};
