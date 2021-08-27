import functionWrap from 'worksheet/components/FunctionWrap';
import PrintQrCode from './PrintQrCode';

export default PrintQrCode;
export const printQrCode = props => functionWrap(PrintQrCode, { ...props, closeFnName: 'onHide' });
