import functionWrap from 'ming-ui/components/FunctionWrap';
import BatchEditRecord from './BatchEditRecord';

export const batchEditRecord = props => functionWrap(BatchEditRecord, { ...props });

export default BatchEditRecord;
