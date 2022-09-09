import RefreshRecordDialog from './RefreshRecordDialog';
import functionWrap from 'worksheet/components/FunctionWrap';

export default RefreshRecordDialog;

export const refreshRecord = props => functionWrap(RefreshRecordDialog, props);
