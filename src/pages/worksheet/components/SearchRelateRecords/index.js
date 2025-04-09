import functionWrap from 'ming-ui/components/FunctionWrap';

export function searchRecordInDialog(props) {
  import('./SearchRelateRecords').then(({ default: SearchRelateRecords }) => {
    functionWrap(SearchRelateRecords, props);
  });
}
