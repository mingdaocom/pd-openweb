import React, { Component } from 'react';
import { OtherFieldList, SelectOtherField } from '../components';
import { DynamicValueInputWrap } from '../styled';

export default class AttachmentInput extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <DynamicValueInputWrap>
        <OtherFieldList {...this.props} />
        <SelectOtherField {...this.props} />
      </DynamicValueInputWrap>
    );
  }
}
