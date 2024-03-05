import functionWrap from 'ming-ui/components/FunctionWrap';
import ExportSheet from './ExportSheet';

export default ExportSheet;
export const exportSheet = props => functionWrap(ExportSheet, { ...props, closeFnName: 'onHide' });
