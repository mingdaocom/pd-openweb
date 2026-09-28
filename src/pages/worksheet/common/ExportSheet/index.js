import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import ExportSheet from './ExportSheet';

export default ExportSheet;
export function useExportSheet() {
  return useFunctionWrapComponent(ExportSheet);
}
