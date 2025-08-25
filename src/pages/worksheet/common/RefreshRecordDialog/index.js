import functionWrap from 'ming-ui/components/FunctionWrap';
import RefreshRecordDialog from './RefreshRecordDialog';

export default RefreshRecordDialog;

export const refreshRecord = props => functionWrap(RefreshRecordDialog, props);
