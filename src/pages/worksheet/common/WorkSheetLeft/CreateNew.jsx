import React, { Component } from 'react';
import { string, func } from 'prop-types';
import { Dialog, Input } from 'ming-ui';
import { createSheetOrCustomPageConfig } from '../../config';
import styled from 'styled-components';
const CreateNewContent = styled.div`
  display: flex;
  align-items: center;
  .Input {
    flex: 1;
    margin-left: 20px;
  }
`;

export default class CreateNew extends Component {
  static propTypes = {
    type: string,
    onCreate: func,
    onCancel: func,
  };
  static defaultProps = {
    type: 'worksheet',
    onCreate: _.noop,
    onCancel: _.noop,
  };
  state = {
    value: '',
  };
  render() {
    const { type, onCreate, onCancel } = this.props;
    const { value } = this.state;
    const { headerText, text, placeholder } = createSheetOrCustomPageConfig[type];
    return (
      <Dialog visible title={headerText} okText={_l('创建')} onOk={() => onCreate(type, value.trim())} onCancel={onCancel}>
        <CreateNewContent>
          <span>{text}</span>
          <Input autoFocus value={value} onChange={value => this.setState({ value })} placeholder={placeholder} />
        </CreateNewContent>
      </Dialog>
    );
  }
}
