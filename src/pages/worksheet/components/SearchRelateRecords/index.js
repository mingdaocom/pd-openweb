import SearchRelateRecords from './SearchRelateRecords';
import functionWrap from 'ming-ui/components/FunctionWrap';
export default SearchRelateRecords;

export function searchRecordInDialog(props) {
  return functionWrap(SearchRelateRecords, props);
}
