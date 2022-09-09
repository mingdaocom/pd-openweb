/**
 * 转换 API 数据到表单分组数据
 */

/**
 * 转换 API 数据到表单分组数据
 */

import FormAdapter from './form';
import { FORM_VIEW_ID } from '../../../constants/';

class GroupAdapter {
  /**
   * 转换分组
   */
  convert = (apiData, configs) => {
    let groupData = [];

    if (apiData && apiData.length) {
      groupData = apiData.map((item, i, list) => {
        // group
        const group = {
          id: item.type + '',
          name: item.name,
          sort: item.type,
        };
        if (item.type === FORM_VIEW_ID.MATERIAL_ATTACHMENT) {
          // 材料附件
          group.data = item.types;
        } else if (item.type === FORM_VIEW_ID.DOSSIER_CHANGE) {
          group.data = item.changes;
        } else {
          // sub groups
          if (item.formControls && item.formControls.length) {
            group.groups = this.convertDetailSubGroups(item.controls, item.formControls, configs);
          } else if (item.groups && item.groups.length) {
            group.groups = this.convertSubGroups(item.groups, configs);
          } else if (item.controls && item.controls.length) {
            // group data
            group.data = FormAdapter.convert(item.controls, 0, configs);
          }
        }
        return group;
      });
    }

    return groupData;
  };

  /**
   * 转换子分组
   */
  convertSubGroups = (groups, configs) => {
    const subGroups = [];

    groups.map((group, i, list) => {
      let subGroup = {
        id: '',
        name: '',
        data: [],
        repeat: false,
        dataList: [],
      };

      if (group.formControls && group.formControls.length) {
        subGroup = this.convertDetailGroup(group.controls, group.formControls, configs);
      } else if (group.controls && group.controls.length) {
        // group data
        subGroup = {
          id: group.type + '',
          name: group.name,
          data: FormAdapter.convert(group.controls, 0, configs),
          repeat: false,
          disabled: group.type === 0, // 登录凭证 禁止编辑
        };
      }

      subGroups.push(subGroup);

      return null;
    });

    return subGroups;
  };

  /**
   * 转换第一层明细
   */
  convertDetailSubGroups = (controls, data, configs) => {
    const subGroups = [];

    subGroups.push(this.convertDetailGroup(controls, data, configs));

    return subGroups;
  };

  /**
   * 转换明细
   */
  convertDetailGroup = (controls, data, configs) => {
    const subGroup = {
      id: '',
      name: '',
      data: [],
      repeat: true,
      dataList: [],
    };

    if (controls && controls.length) {
      subGroup.id = controls[0].formId;
      subGroup.name = controls[0].controlName;
      subGroup.editable = controls[0].editable;
      if (data && data.length && data[0].tempControls && data[0].tempControls.length) {
        subGroup.data = FormAdapter.convert(data[0].tempControls, 0, configs);
        if (data[0].controls && data[0].controls.length) {
          subGroup.dataList = data[0].controls.map((item, i, list) => {
            return FormAdapter.convert(item, 0, configs);
          });
        }
      }
    }

    return subGroup;
  };
}

export default new GroupAdapter();
