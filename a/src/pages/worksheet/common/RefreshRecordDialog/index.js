import RefreshRecordDialog from './RefreshRecordDialog';
import functionWrap from 'ming-ui/components/FunctionWrap';

export default RefreshRecordDialog;

export const refreshRecord = props => functionWrap(RefreshRecordDialog, props);
