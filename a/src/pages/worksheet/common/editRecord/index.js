import EditRecord from './EditRecord';
import functionWrap from 'ming-ui/components/FunctionWrap';

export default EditRecord;

export const editRecord = props => functionWrap(EditRecord, { ...props, closeFnName: 'hideEditRecord' });
