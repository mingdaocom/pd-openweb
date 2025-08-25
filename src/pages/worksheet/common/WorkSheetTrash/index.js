import functionWrap from 'ming-ui/components/FunctionWrap';
import WorkSheetTrash from './WorkSheetTrash';

export default WorkSheetTrash;

export const openWorkSheetTrash = props => functionWrap(WorkSheetTrash, { ...props, closeFnName: 'onCancel' });
