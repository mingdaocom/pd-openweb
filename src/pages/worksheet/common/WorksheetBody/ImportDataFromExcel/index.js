import functionWrap from 'worksheet/components/FunctionWrap';
import ImportDataFromExcel from './ImportDataFromExcel';

export default ImportDataFromExcel;
export const importDataFromExcel = props =>
  functionWrap(ImportDataFromExcel, { ...props, closeFnName: 'hideImportDataFromExcel' });
