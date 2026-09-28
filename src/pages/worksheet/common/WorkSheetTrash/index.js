import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import WorkSheetTrash from './WorkSheetTrash';

const getWorkSheetTrashProps = props => ({ ...props, closeFnName: 'onCancel' });

export default WorkSheetTrash;
export function useWorkSheetTrash() {
  return useFunctionWrapComponent(WorkSheetTrash, getWorkSheetTrashProps);
}
