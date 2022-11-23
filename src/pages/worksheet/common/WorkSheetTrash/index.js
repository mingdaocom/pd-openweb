import WorkSheetTrash from './WorkSheetTrash';
import functionWrap from 'ming-ui/components/FunctionWrap';

export default WorkSheetTrash;

export const openWorkSheetTrash = props => functionWrap(WorkSheetTrash, { ...props, closeFnName: 'onCancel' });
