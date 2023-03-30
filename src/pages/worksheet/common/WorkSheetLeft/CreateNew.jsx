import React, { Component } from 'react';
import { string, func } from 'prop-types';
import { Dialog, Input } from 'ming-ui';
import styled from 'styled-components';
import _ from 'lodash';
const CreateNewContent = styled.div`
  display: flex;
  align-items: center;
  .Input {
    flex: 1;
    margin-left: 20px;
  }
`;

const createSheetOrCustomPageConfig = {
  customPage: {
    headerText: _l('新建自定义页面'),
    placeholder: _l('例如: 首页、仪表盘'),
    text: _l('页面名称'),
  },
  worksheet: { headerText: _l('新建工作表'), placeholder: _l('例如: 订单、客户'), text: _l('工作表名称') },
};

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
      <Dialog
        visible
        title={headerText}
        okText={_l('创建')}
        onOk={() => onCreate(type, this.state.value.trim())}
        onCancel={onCancel}
      >
        <CreateNewContent>
          <span>{text}</span>
          <Input autoFocus value={value} onChange={value => this.setState({ value })} placeholder={placeholder} />
        </CreateNewContent>
      </Dialog>
    );
  }
}
