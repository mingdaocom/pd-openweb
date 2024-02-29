import React, { Component } from 'react';
import { string, func, bool } from 'prop-types';
import Editor from './EditorDiaLogContent';
import { compareProps } from '../../util';
import _ from 'lodash';
import './index.less';

export default class AppIntro extends Component {
  static propTypes = {
    isEditing: bool,
    description: string,
    onSave: func,
    onCancel: func,
  };
  static defaultProps = {
    description: '',
    onSave: _.noop,
    onCancel: _.noop,
    isEditing: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      isEditing: props.isEditing,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isEditing: nextProps.isEditing,
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const props = this.props || {};
    const state = this.state || {};
    return compareProps(props, nextProps, ['description']) || nextState.isEditing !== state.isEditing;
  }

  handleSave = val => {
    this.props.onSave(val);
    // this.setState({ isEditing: false });
  };

  render() {
    const {
      description: summary,
      permissionType,
      onCancel,
      changeSetting,
      cacheKey,
      changeEditState = _.noop,
      minHeight,
      maxHeight,
      data,
    } = this.props;
    const { isEditing } = this.state;
    return (
      <Editor
        data={data}
        className="appIntroDescriptionEditor"
        summary={summary}
        isEditing={isEditing}
        permissionType={permissionType}
        changeEditState={isEditing => {
          if (cacheKey === 'appMultilingual') return;
          this.setState({ isEditing });
          changeEditState(isEditing);
        }}
        onSave={this.handleSave}
        changeSetting={changeSetting}
        onCancel={() => {
          // this.setState({ isEditing: false });
          onCancel && onCancel();
        }}
        cacheKey={cacheKey}
        title={this.props.title}
        renderLeftContent={this.props.renderLeftContent}
        minHeight={minHeight}
        maxHeight={maxHeight}
      />
    );
  }
}
