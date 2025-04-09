import functionWrap from 'ming-ui/components/FunctionWrap';

export const batchEditRecord = props => {
  import('./BatchEditRecord').then(({ default: BatchEditRecord }) => {
    functionWrap(BatchEditRecord, { ...props });
  });
};
