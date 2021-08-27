import functionWrap from 'worksheet/components/FunctionWrap';
import SheetSetName from './SheetSetName';

export default SheetSetName;
export const setSheetName = props => functionWrap(SheetSetName, { ...props, closeFnName: 'onHide' });
