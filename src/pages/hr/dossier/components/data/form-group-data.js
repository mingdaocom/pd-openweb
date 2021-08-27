import FormData from './form-data';

/**
 * 分组/子分组
 */
const group1 = {
  /**
   * 分组 ID
   */
  id: 'id',
  /**
   * 分组名称
   */
  name: 'name',
  /**
   * 是否重复（仅限子分组）
   */
  repeat: true,
  /**
   * 表单数据
   */
  data: [],
};

const group2 = {
  /**
   * 分组 ID
   */
  id: 'id',
  /**
   * 分组名称
   */
  name: 'name',
  /**
   * 子分组列表
   */
  groups: [],
};

/**
 * 分组分隔
 */
const divider = {
  type: 'divider',
};

const FormGroupData = [
  {
    id: '111',
    name: 'Group111',
    data: FormData,
  },
  {
    type: 'divider',
  },
  {
    id: '222',
    name: 'Group222',
    groups: [
      {
        id: '222-1',
        name: 'SubGroup1',
        data: FormData,
      },
      {
        id: '222-2',
        name: 'SubGroup2',
        data: FormData,
        repeat: true,
        dataList: [FormData, FormData],
      },
      {
        id: '222-3',
        name: 'SubGroup3',
        data: FormData,
      },
    ],
  },
];

export default FormGroupData;
