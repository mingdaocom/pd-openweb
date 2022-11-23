import functionWrap from 'ming-ui/components/FunctionWrap';
import DialogSelectOrgRole from './';

export default props => functionWrap(DialogSelectOrgRole, { ...props, visibleName: 'orgRoleDialogVisible' });
