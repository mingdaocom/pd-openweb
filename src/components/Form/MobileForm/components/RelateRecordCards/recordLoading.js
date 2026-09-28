import _ from 'lodash';
import { FROM } from 'src/components/Form/core/config';

export const MOBILE_TABLE_SHOW_TYPES = ['2', '5', '6'];

export function shouldLoadInitialRecords(props) {
  const { control = {} } = props;
  const { advancedSetting = {}, from } = control;

  return (
    (_.get(window, 'shareState.isPublicForm') && _.includes(MOBILE_TABLE_SHOW_TYPES, advancedSetting.originShowType)) ||
    (_.includes(MOBILE_TABLE_SHOW_TYPES, advancedSetting.showtype) &&
      _.includes([FROM.H5_EDIT, FROM.RECORDINFO, FROM.DRAFT], from) &&
      !control.hasDefaultValue)
  );
}

export function shouldReloadInitialRecords(prevProps, nextProps) {
  return nextProps.flag !== prevProps.flag && shouldLoadInitialRecords(nextProps);
}
