import React, { Component } from 'react';
import { bool, func, string } from 'prop-types';
import { FullScreenCurtain } from 'ming-ui';
import WorkflowSettings from '../../WorkflowSettings';

export default class WorkflowDialog extends Component {
  static propTypes = {
    needChat: bool,
    flowId: string,
    onBack: func,
  };

  static defaultProps = {
    flowId: '',
    onBack: () => {},
  };

  render() {
    const { flowId, needChat, onBack } = this.props;
    const match = {
      params: {
        flowId,
      },
    };

    return (
      <FullScreenCurtain needChat={needChat}>
        <WorkflowSettings match={match} onBack={onBack} />
      </FullScreenCurtain>
    );
  }
}
