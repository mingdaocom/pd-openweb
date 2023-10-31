import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TagTextarea } from 'ming-ui';
import SelectOtherFields from '../SelectOtherFields';
import Tag from '../Tag';
import cx from 'classnames';
import _ from 'lodash';
import { handleGlobalVariableName } from '../../../utils';

export default class CustomTextarea extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    processId: PropTypes.string,
    relationId: PropTypes.string,
    selectNodeId: PropTypes.string,
    sourceAppId: PropTypes.string,
    isIntegration: PropTypes.bool,
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
  };

  static defaultProps = {
    getRef: () => {},
    onFocus: () => {},
    operatorsSetMargin: false,
    sourceAppId: '',
    isIntegration: false,
    className: '',
  };

  state = {
    fieldsVisible: false,
  };

  componentDidMount() {
    this.props.getRef(this.tagtextarea);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.tagtextarea && prevProps.content !== this.props.content) {
      const cursor = this.tagtextarea.cmObj.getCursor();

      this.tagtextarea.setValue(this.props.content);
      this.tagtextarea.cmObj.setCursor(cursor);
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
      type,
      height,
      content,
      formulaMap,
      onFocus,
      onChange,
      updateSource,
      operatorsSetMargin,
      className,
    } = this.props;
    const { fieldsVisible } = this.state;

    return (
      <div className="flexRow mTop10 relative">
        <TagTextarea
          className={cx('flex', className, {
            smallPadding: height === 0 && content && content.match(/\$[\w]+-[\w]+\$/g),
          })}
          height={height}
          defaultValue={content || ''}
          operatorsSetMargin={operatorsSetMargin}
          getRef={tagtextarea => {
            this.tagtextarea = tagtextarea;
          }}
          onFocus={onFocus}
          renderTag={(tag, options) => {
            const ids = tag.split(/([a-zA-Z0-9#]{24,32})-/).filter(item => item);
            const nodeObj = formulaMap[ids[0]] || {};
            const controlObj = formulaMap[ids[1]] || {};

            return (
              <Tag
                flowNodeType={nodeObj.type}
                appType={nodeObj.appType}
                actionId={nodeObj.actionId}
                nodeName={handleGlobalVariableName(ids[0], controlObj.sourceType, nodeObj.name)}
                controlId={ids[1]}
                controlName={controlObj.name || ''}
              />
            );
          }}
          onChange={onChange}
        />
        <SelectOtherFields
          item={{ type }}
          fieldsVisible={fieldsVisible}
          projectId={projectId}
          processId={processId}
          relationId={relationId}
          selectNodeId={selectNodeId}
          sourceAppId={sourceAppId}
          isIntegration={isIntegration}
          handleFieldClick={obj => {
            const newFormulaMap = _.cloneDeep(formulaMap);
            newFormulaMap[obj.nodeId] = {
              type: obj.nodeTypeId,
              appType: obj.appType,
              actionId: obj.actionId,
              name: obj.nodeName,
            };
            newFormulaMap[obj.fieldValueId] = {
              type: obj.fieldValueType,
              name: obj.fieldValueName,
              sourceType: obj.sourceType,
            };

            updateSource({ formulaMap: newFormulaMap }, () => {
              this.tagtextarea.insertColumnTag(`${obj.nodeId}-${obj.fieldValueId}`);
            });
          }}
          openLayer={() => this.setState({ fieldsVisible: true })}
          closeLayer={() => this.setState({ fieldsVisible: false })}
        />
      </div>
    );
  }
}
