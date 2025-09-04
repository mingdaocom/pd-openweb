import React from 'react';
import styled from 'styled-components';
import { LoadDiv, WaterMark } from 'ming-ui';
import preall from 'src/common/preall';
import { NODE_TYPE } from '../../constant/enum';
import AttachmentsPreview from '../AttachmentsPreview';
import { getAttachment } from './controller';

const Abnormal = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  color: #151515;
  font-size: 17px;
  > i {
    font-size: 66px;
    color: #f78c00;
  }
`;

class NodeShare extends React.Component {
  state = {
    node: null,
    currentAccountId: null,
    loading: true,
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    getAttachment()
      .then(({ node, allowDownload = true } = {}) => {
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
      })
      .catch(() => {
        this.setState({ loading: false });
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
          <i className="icon-error1"></i>
          <div className="mTop20">{_l('当前文件不存在或您没有权限查看此文件')}</div>
        </Abnormal>
      );
    } else {
      return (
        <WaterMark projectId={this.state.node?.projectId}>
          <AttachmentsPreview
            showTitle
            options={{
              attachments: [this.state.node],
              callFrom: this.state.node.isKc ? 'kc' : 'player',
              fromType: 6,
              index: 0,
              hideFunctions: allowDownload ? ['saveToKnowlege'] : ['download', 'share', 'saveToKnowlege'],
            }}
          />
        </WaterMark>
      );
    }
  }
}

export default preall(NodeShare, { allowNotLogin: true });
