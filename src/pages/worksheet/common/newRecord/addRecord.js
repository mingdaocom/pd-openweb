import functionWrap from 'ming-ui/components/FunctionWrap';

export default function addRecord(props) {
  import('./NewRecord').then(({ default: NewRecord }) => {
    functionWrap(NewRecord, { ...props, closeFnName: 'hideNewRecord' });
  });
}
