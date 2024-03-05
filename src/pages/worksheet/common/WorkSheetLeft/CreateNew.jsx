import React, { Component, Fragment } from 'react';
import { string, func } from 'prop-types';
import { Dialog, Input } from 'ming-ui';
import styled from 'styled-components';
import ExternalLink from './ExternalLink';
import _ from 'lodash';

const CreateNewContent = styled.div``;

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
    customPageArgs: {}
  };
  render() {
    const { type, onCreate, onCancel } = this.props;
    const { value, customPageArgs } = this.state;
    const { headerText, text, placeholder } = createSheetOrCustomPageConfig[type];
    return (
      <Dialog
        visible
        title={headerText}
        width={type === 'customPage' ? 580 : undefined}
        okText={_l('新建')}
        onOk={() => {
          const name = this.state.value.trim().slice(0, 100);
          const { configuration = {}, urlTemplate } = customPageArgs;
          if (!name) {
            alert(_l('请填写名称'), 3);
            return;
          }
          const protocolReg = configuration.openType === '1' ? /^https:\/\/.+$/ : /^https?:\/\/.+$/;
          if (configuration.customPageType === '2' && !protocolReg.test(urlTemplate)) {
            alert(_l('请输入正确的url'), 3);
            return;
          }
          onCreate(type, {
            name,
            ...customPageArgs,
          });
        }}
        onCancel={onCancel}
      >
        <CreateNewContent>
          <div className="flexRow alignItemsCenter">
            <div style={{ width: 75 }}>{text}</div>
            <Input
              autoFocus
              className="flex"
              value={value}
              onChange={value => this.setState({ value })}
              placeholder={placeholder}
            />
          </div>
          {type === 'customPage' && (
            <ExternalLink
              onChange={(data) => {
                if (data.configuration.customPageType === '2') {
                  this.setState({ customPageArgs: data });
                } else {
                  this.setState({ customPageArgs: {} });
                }
              }}
            />
          )}
        </CreateNewContent>
      </Dialog>
    );
  }
}
