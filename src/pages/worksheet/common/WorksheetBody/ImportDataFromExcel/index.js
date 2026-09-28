import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import ImportDataFromExcel from './ImportDataFromExcel';

const getImportDataFromExcelProps = props => ({ ...props, closeFnName: 'hideImportDataFromExcel' });

export default ImportDataFromExcel;
export function useImportDataFromExcel() {
  return useFunctionWrapComponent(ImportDataFromExcel, getImportDataFromExcelProps);
}
