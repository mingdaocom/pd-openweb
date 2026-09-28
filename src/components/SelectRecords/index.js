import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import SelectDialog from './SelectDialog';

export function useSelectRecords() {
  return useFunctionWrapComponent(SelectDialog);
}
