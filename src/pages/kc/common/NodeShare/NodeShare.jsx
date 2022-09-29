import React from 'react';
import preall from 'src/common/preall';
import styled from 'styled-components';
import { getAttachment } from './controller';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { NODE_TYPE } from '../../constant/enum';

const Abnormal = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  color: #333;
  font-size: 17px;
  > i {
    font-size: 66px;
    color: #f78c00;
  }
`;

let AttachmentsPreview;

class NodeShare extends React.Component {
  state = {
    node: null,
    currentAccountId: null,
    loading: true,
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    require.ensure([], require => {
      AttachmentsPreview = require('../AttachmentsPreview');
      getAttachment().then(({ node, allowDownload = true } = {}) => {
        if (!node) {
          this.setState({ loading: false });
          return;
        }
        if (node.type === NODE_TYPE.FOLDER) {
          node = null;
        }
        if (this._isMounted) {
          this.setState({ node, allowDownload, loading: false });
        }
      });
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { loading, allowDownload } = this.state;
    if (!AttachmentsPreview || loading) {
      return <LoadDiv size="big" />;
    } else if (!this.state.node) {
      return (
        <Abnormal>
          <i className="icon-task-folder-message"></i>
          <div className="mTop20">{_l('当前文件不存在或您没有权限查看此文件')}</div>
        </Abnormal>
      );
    } else {
      return (
        <AttachmentsPreview
          showTitle
          options={{
            attachments: [this.state.node],
            callFrom: this.state.node.isKc ? 'kc' : 'player',
            fromType: 6,
            index: 0,
            hideFunctions: allowDownload ? [] : ['download', 'share', 'saveToKnowlege'],
          }}
        />
      );
    }
  }
}

module.exports = preall(NodeShare, { allownotlogin: true });
