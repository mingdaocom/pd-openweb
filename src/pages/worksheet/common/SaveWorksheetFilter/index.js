import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import SaveWorksheetFilter from './SaveWorksheetFilter';

export default SaveWorksheetFilter;
export function useSaveWorksheetFilter() {
  return useFunctionWrapComponent(SaveWorksheetFilter);
}
