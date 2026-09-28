import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import ResetAutoNumber from './ResetAutoNumber';

const getResetAutoNumberProps = props => ({ ...props, closeFnName: 'onHide' });

export default ResetAutoNumber;
export function useResetAutoNumber() {
  return useFunctionWrapComponent(ResetAutoNumber, getResetAutoNumberProps);
}
