import React, { Component } from 'react';
import { string, func, bool } from 'prop-types';
import Editor from './braftEditor';
import { compareProps } from '../../util';

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

  componentDidMount() {
    this.resizeHandler();
    this.unBindEvent = this.bindEvent();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const props = this.props || {};
    const state = this.state || {};
    return compareProps(props, nextProps, ['description']) || nextState.isEditing !== state.isEditing;
  }
  componentDidUpdate() {
    this.resizeHandler();
  }
  componentWillUnMount() {
    this.unBindEvent();
  }

  resizeHandler = () => {
    const { innerHeight } = window;
    const $normalEle = document.querySelector('.mdEditorContent');
    const $editingEle = document.querySelector('.BraftEditor-content');
    const maxHeight = Math.max(innerHeight - 200, 400);
    if ($normalEle) $normalEle.style.maxHeight = `${maxHeight}px`;
    if ($editingEle) $editingEle.style.maxHeight = `${maxHeight}px`;
  };

  bindEvent = () => {
    window.addEventListener('resize', this.resizeHandler);
    return () => {
      window.removeEventListener('resize', this.resizeHandler);
    };
  };
  handleSave = val => {
    this.props.onSave(val);
    this.setState({ isEditing: false });
  };

  render() {
    const { description: summary, permissionType } = this.props;
    const { isEditing } = this.state;
    return (
      <Editor
        className="appIntroDescriptionEditor "
        summary={summary}
        isEditing={isEditing}
        permissionType={permissionType}
        changeEditState={isEditing => this.setState({ isEditing })}
        onSave={this.handleSave}
        onCancel={() => this.setState({ isEditing: false })}
        placeholder={_l('请填写应用说明')}
      />
    );
  }
}
