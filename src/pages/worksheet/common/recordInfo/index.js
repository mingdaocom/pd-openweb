import React from 'react';
import functionWrap from 'ming-ui/components/FunctionWrap';
import useFunctionWrapComponent, { openFunctionWrapComponent } from 'ming-ui/hooks/useFunctionWrapComponent';
import RecordInfo from './RecordInfoWrapper';

const getRecordInfoProps = props => ({
  ...props,
  closeFnName: 'hideRecordInfo',
  hideRecordInfo: props.onClose,
});

export default class Record extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.recordId !== nextProps.recordId;
  }
  render() {
    return <RecordInfo {...this.props} />;
  }
}

export function useRecordInfo() {
  return useFunctionWrapComponent(RecordInfo, getRecordInfoProps);
}

export function openGlobalRecordInfo(props) {
  openFunctionWrapComponent(functionWrap, RecordInfo, props, getRecordInfoProps);
}
