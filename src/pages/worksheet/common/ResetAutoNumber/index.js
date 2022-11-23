import functionWrap from 'ming-ui/components/FunctionWrap';
import ResetAutoNumber from './ResetAutoNumber';

export default ResetAutoNumber;
export const openResetAutoNumber = props => functionWrap(ResetAutoNumber, { ...props, closeFnName: 'onHide' });
