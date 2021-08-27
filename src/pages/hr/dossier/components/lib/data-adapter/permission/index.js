import FormAdapter from './form';

class PermissionAdapter {
  /**
   * 权限列表
   */
  list = [];
  /**
   * 添加进权限列表
   */
  addToList = (data) => {
    data.map((item) => {
      this.list.push({
        controlId: item.controlId,
        formId: item.formId,
        viewable: item.view,
        viewdisabled: item.viewdisabled,
        editable: item.edit,
        editdisabled: item.editdisabled,
      });

      return null;
    });
  };
  /**
   * 转换分组
   */
  convert = (apiData) => {
    let groupData = [];

    if (apiData && apiData.length) {
      groupData = apiData.map((item, i, list) => {
        // group
        const group = {
          id: item.groupType + '',
          name: item.name,
        };

        // sub groups
        if (item.formControls && item.formControls.length) {
          group.groups = this.convertDetailSubGroups(item.controls, item.formControls);
        } else if (item.groups && item.groups.length) {
          group.groups = this.convertSubGroups(item.groups);
        } else if (item.controls && item.controls.length) {
          // group data
          const data = FormAdapter.convert(item.controls);
          this.addToList(data);
          group.data = data;
        }

        return group;
      });
    }

    return {
      groupData,
      list: this.list,
    };
  };

  /**
   * 转换子分组
   */
  convertSubGroups = (groups) => {
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
        subGroup = this.convertDetailGroup(group.controls, group.formControls);
      } else if (group.fields && group.fields.length) {
        // group data
        const data = FormAdapter.convert(group.fields);
        this.addToList(data);
        subGroup = {
          id: group.groupType + '',
          name: group.name,
          data,
        };
      } else if (group.controls && group.controls.length) {
        // group data
        const data = FormAdapter.convert(group.controls);
        this.addToList(data);
        subGroup = {
          id: group.groupType + '',
          name: group.name,
          data,
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
  convertDetailSubGroups = (controls, data) => {
    const subGroups = [];

    subGroups.push(this.convertDetailGroup(controls, data));

    return subGroups;
  };

  /**
   * 转换明细
   */
  convertDetailGroup = (controls, data) => {
    const subGroup = {
      id: '',
      name: '',
      data: [],
    };

    if (controls && controls.length) {
      subGroup.id = controls[0].formId;
      subGroup.name = controls[0].controlName;
      if (data && data.length && data[0].tempControls && data[0].tempControls.length) {
        const _data = FormAdapter.convert(data[0].tempControls);
        this.addToList(_data);
        subGroup.data = _data;
      }
    }

    return subGroup;
  };
}

export default new PermissionAdapter();
