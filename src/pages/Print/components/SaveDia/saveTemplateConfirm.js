import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import SaveDia from './index';

const getSaveTemplateProps = props => ({ ...props, visibleName: 'showSaveDia' });

export default function useSaveTemplateConfirm() {
  return useFunctionWrapComponent(SaveDia, getSaveTemplateProps);
}
