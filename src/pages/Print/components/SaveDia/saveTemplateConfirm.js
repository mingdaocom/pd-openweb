import functionWrap from 'ming-ui/components/FunctionWrap';
import SaveDia from './index';

const saveTemplateConfirm = props => functionWrap(SaveDia, { ...props, visibleName: 'showSaveDia' });
export default saveTemplateConfirm;
