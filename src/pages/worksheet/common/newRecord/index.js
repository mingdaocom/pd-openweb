import functionWrap from 'worksheet/components/FunctionWrap';
import NewRecord from './NewRecord';

export default NewRecord;
export const addRecord = props => functionWrap(NewRecord, { ...props, closeFnName: 'hideNewRecord' });
