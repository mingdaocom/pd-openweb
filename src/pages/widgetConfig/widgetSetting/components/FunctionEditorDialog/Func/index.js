import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useRef, useState } from 'react';
import cx from 'classnames';
import _, { includes } from 'lodash';
import { arrayOf, bool, func, shape } from 'prop-types';
import styled from 'styled-components';
import { Switch } from 'ming-ui';
import { emitter, validateFnExpression } from 'src/utils/common';
import CodeEdit from './common/CodeEdit';
import Footer from './common/Footer';
import SelectFnControl from './common/SelectFnControl';
import { openTestFunctionDialog } from './common/TestFunctionDialog';
import Tip from './common/Tip';
import './style.less';

if (!window.emitter) {
  window.emitter = emitter;
}

const Con = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  color: #151515;
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
  background: #fafafa;
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
  border-top: 1px solid #f0f0f0;
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
  let { controls = [] } = props;
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
  }
  const codeEditor = useRef();
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
              controlId: /^[a-zA-Z0-9]+-[\w\W]+$/.test(id) ? id.replace(/[a-zA-Z0-9]+-/, '') : id,
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
  return (
    <Con className={cx('functionEditor', className)}>
      <Header>
        {customTitle || _l('编辑函数')}
        {supportJavaScript && !fromCustom && (
          <ActiveJsSwitchCon>
            <Switch
              size="small"
              checked={type === 'javascript'}
              onClick={checked => {
                setType(checked ? 'mdfunction' : 'javascript');
                const tempValue = codeEditor.current ? codeEditor.current.getValue() : '';
                setCodeEditorLoading(true);
                setTimeout(() => {
                  setCodeEditorLoading(false);
                }, 10);
                setTimeout(() => {
                  codeEditor.current.setValue(tempValue);
                }, 20);
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
            controls={controls}
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
  control: shape({}),
  controls: arrayOf(shape({})),
  controlGroups: arrayOf(shape({})), // { controlName, controlId }
  renderTag: func,
  onClose: func,
  onSave: func,
  onChange: func,
};
