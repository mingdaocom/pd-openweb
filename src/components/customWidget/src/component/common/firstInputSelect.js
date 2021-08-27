import global from '../../config/globalConfig';

function firstInputSelect(SettingModel) {
  class NewSettingModel extends SettingModel {
    componentDidMount() {
      if (super.componentDidMount) super.componentDidMount();

      $('.widgetSettingsBox input:first').select();
      global.isFirstInputSelect = false;
    }

    componentDidUpdate() {
      if (super.componentDidUpdate) super.componentDidUpdate();

      if (global.isFirstInputSelect) {
        $('.widgetSettingsBox input:first').select();
        global.isFirstInputSelect = false;
      }
    }
  }
  return NewSettingModel;
}

export default firstInputSelect;
