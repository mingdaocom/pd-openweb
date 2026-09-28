import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import ImportFileToChildTable from './ImportFileToChildTable';

export default ImportFileToChildTable;
export function useImportFileToChildTable() {
  return useFunctionWrapComponent(ImportFileToChildTable);
}
