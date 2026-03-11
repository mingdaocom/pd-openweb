import functionWrap from 'ming-ui/components/FunctionWrap';
import SaveDia from './saveDia';

const saveTemplateConfirm = props => functionWrap(SaveDia, { ...props, visibleName: 'showSaveDia' });
export default saveTemplateConfirm;
