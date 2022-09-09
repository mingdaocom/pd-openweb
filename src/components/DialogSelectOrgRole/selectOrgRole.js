import functionWrap from 'worksheet/components/FunctionWrap';
import DialogSelectOrgRole from './';

export default props => functionWrap(DialogSelectOrgRole, { ...props, visibleName: 'orgRoleDialogVisible' });
