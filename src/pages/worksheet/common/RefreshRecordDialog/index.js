import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import RefreshRecordDialog from './RefreshRecordDialog';

export default RefreshRecordDialog;
export function useRefreshRecord() {
  return useFunctionWrapComponent(RefreshRecordDialog);
}
