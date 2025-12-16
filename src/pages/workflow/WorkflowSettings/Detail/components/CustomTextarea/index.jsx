import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { TagTextarea } from 'ming-ui';
import { handleGlobalVariableName } from '../../../utils';
import SelectOtherFields from '../SelectOtherFields';
import Tag from '../Tag';

export default class CustomTextarea extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    processId: PropTypes.string,
    relationId: PropTypes.string,
    selectNodeId: PropTypes.string,
    sourceAppId: PropTypes.string,
    isIntegration: PropTypes.bool,
    isPlugin: PropTypes.bool,
    type: PropTypes.number,
    height: PropTypes.number,
    content: PropTypes.string,
    formulaMap: PropTypes.object,
    getRef: PropTypes.func,
    onFocus: PropTypes.func,
    onChange: PropTypes.func,
    updateSource: PropTypes.func,
    operatorsSetMargin: PropTypes.bool,
    className: PropTypes.string,
    showCurrent: PropTypes.bool,
    onlyOneValue: PropTypes.bool,
    errorMessage: PropTypes.string,
  };

  static defaultProps = {
    getRef: () => {},
    onFocus: () => {},
    operatorsSetMargin: false,
    sourceAppId: '',
    isIntegration: false,
    isPlugin: false,
    className: '',
    showCurrent: false,
    onlyOneValue: false,
    errorMessage: '',
  };

  state = {
    fieldsVisible: false,
  };

  componentDidMount() {
    this.props.getRef(this.tagtextarea);
  }

  componentDidUpdate(prevProps) {
    if (this.tagtextarea && prevProps.content !== this.props.content) {
      const cursor = this.tagtextarea.cmObj.getCursor();
      const scrollInfo = this.tagtextarea.cmObj.getScrollInfo();
      this.tagtextarea.setValue(this.props.content);
      this.tagtextarea.cmObj.setCursor(cursor);
      this.tagtextarea.cmObj.scrollTo(scrollInfo.left, scrollInfo.top);
      const lastLine = this.tagtextarea.cmObj.lineCount() - 1;
      if (cursor.line === lastLine) {
        setTimeout(() => {
          this.tagtextarea.cmObj.scrollIntoView({ line: lastLine, ch: 0 }, 50);
        }, 10);
      }
    }
  }

  render() {
    const {
      projectId,
      processId,
      relationId,
      selectNodeId,
      sourceAppId,
      isIntegration,
      isPlugin,
      type,
      height,
      content,
      formulaMap,
      onFocus,
      onChange,
      updateSource,
      operatorsSetMargin,
      className,
      onBlur = () => {},
      showCurrent,
      onlyOneValue,
      errorMessage,
    } = this.props;
    const { fieldsVisible } = this.state;

    return (
      <div className="flexRow mTop10 relative">
        <TagTextarea
          className={cx('flex', className, {
            smallPadding: height === 0 && content && content.match(/\$[\w]+-[\w]+\$/g),
            onlyOneValue: content && onlyOneValue,
          })}
          readonly={onlyOneValue}
          height={height}
          defaultValue={content || ''}
          operatorsSetMargin={operatorsSetMargin}
          getRef={tagtextarea => {
            this.tagtextarea = tagtextarea;
          }}
          onFocus={onFocus}
          renderTag={tag => {
            const ids = tag.split(/([a-zA-Z0-9#]{24,32})-/).filter(item => item);
            const nodeObj = formulaMap[ids[0]] || {};
            const controlObj = formulaMap[ids.join('-')] || {};

            return (
              <Tag
                flowNodeType={nodeObj.type}
                appType={nodeObj.appType}
                actionId={nodeObj.actionId}
                nodeName={handleGlobalVariableName(ids[0], controlObj.sourceType, nodeObj.name)}
                controlId={ids[1]}
                controlName={controlObj.name || ''}
                errorMessage={errorMessage}
              />
            );
          }}
          onBlur={onBlur}
          onChange={onChange}
        />
        {content && onlyOneValue && (
          <i
            className="icon-delete ThemeHoverColor3 Absolute Gray_75 Font16 pointer"
            style={{ right: 46, top: 10 }}
            onClick={() => onChange(null, '')}
          />
        )}
        <SelectOtherFields
          item={{ type }}
          fieldsVisible={fieldsVisible}
          projectId={projectId}
          processId={processId}
          relationId={relationId}
          selectNodeId={selectNodeId}
          sourceAppId={sourceAppId}
          isIntegration={isIntegration}
          isPlugin={isPlugin}
          showCurrent={showCurrent}
          handleFieldClick={obj => {
            const newFormulaMap = _.cloneDeep(formulaMap);
            newFormulaMap[obj.nodeId] = {
              type: obj.nodeTypeId,
              appType: obj.appType,
              actionId: obj.actionId,
              name: obj.nodeName,
            };
            newFormulaMap[`${obj.nodeId}-${obj.fieldValueId}`] = {
              type: obj.fieldValueType,
              name: obj.fieldValueName,
              sourceType: obj.sourceType,
            };

            updateSource({ formulaMap: newFormulaMap }, () => {
              if (onlyOneValue) {
                this.tagtextarea.setValue('');
                obj.fieldValueId && this.tagtextarea.insertColumnTag(`${obj.nodeId}-${obj.fieldValueId}`);
              } else {
                this.tagtextarea.insertColumnTag(`${obj.nodeId}-${obj.fieldValueId}`);
              }
            });
          }}
          openLayer={() => this.setState({ fieldsVisible: true })}
          closeLayer={() => this.setState({ fieldsVisible: false })}
        />
      </div>
    );
  }
}
