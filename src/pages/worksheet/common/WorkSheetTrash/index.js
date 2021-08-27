import WorkSheetTrash from './WorkSheetTrash';
import functionWrap from 'worksheet/components/FunctionWrap';

export default WorkSheetTrash;

export const openWorkSheetTrash = props => functionWrap(WorkSheetTrash, { ...props, closeFnName: 'onCancel' });
