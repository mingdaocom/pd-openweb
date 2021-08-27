import customFieldsInit from './customFieldsInit';
import { checkRequired } from './js/customFieldsEvents';

require(['mdDialog'], function () {
  var data = [
    {
      controlId: Math.random() * 1000000000,
      controlName: '描述',
      row: 1,
      col: 1,
      hint: '请填写描述',
      type: 2,
      value: '',
    },
    {
      controlId: Math.random() * 1000000000,
      controlName: '请填写地址',
      row: 2,
      col: 1,
      hint: '地址测试',
      type: 1,
      value: '中山西路1279弄国峰科技大厦',
    },
    {
      controlId: Math.random() * 1000000000,
      controlName: '人数',
      row: 5,
      col: 1,
      hint: '人数',
      type: 6,
      dot: 1,
      unit: '人',
      value: 22,
    },
    {
      controlId: Math.random() * 1000000000,
      controlName: '金额',
      row: 5,
      col: 2,
      hint: '金额',
      type: 6,
      dot: 2,
      unit: '元',
      value: '',
    },
    {
      controlId: Math.random() * 1000000000,
      controlName: '手机号',
      row: 3,
      col: 2,
      hint: '手机号',
      type: 3,
      value: '',
    },
    {
      controlId: Math.random() * 1000000000,
      controlName: '电话号码',
      row: 4,
      col: 1,
      hint: '电话号码',
      type: 3,
      value: '',
    },
    {
      controlId: Math.random() * 1000000000,
      controlName: '时间',
      row: 6,
      col: 1,
      hint: '',
      type: 15,
      value: '',
    },
    {
      controlId: Math.random() * 1000000000,
      controlName: '邮箱地址',
      row: 6,
      col: 2,
      hint: '',
      type: 5,
      value: '',
    },
    {
      controlId: Math.random() * 1000000000,
      controlName: '地区',
      row: 7,
      col: 1,
      hint: '',
      type: 19,
      value: '',
    },
    {
      controlId: Math.random() * 1000000000,
      controlName: '身份证',
      row: 7,
      col: 2,
      hint: '身份证号码',
      type: 7,
      value: '',
      default: 1,
    },
    {
      controlId: Math.random() * 1000000000,
      controlName: '',
      row: 8,
      col: 1,
      hint: '',
      type: 22,
      value: '',
      default: 1,
    },
    {
      controlId: Math.random() * 1000000000,
      controlName: '下拉菜单1',
      row: 9,
      col: 1,
      hint: '',
      type: 11,
      value: 1,
      options: [
        {
          key: 1,
          value: '下拉菜单1',
        },
        {
          key: 2,
          value: '下拉菜单2',
        },
        {
          key: 4,
          value: '下拉菜单4',
        },
      ],
    },
    {
      controlId: Math.random() * 1000000000,
      controlName: '单选',
      row: 10,
      col: 1,
      hint: '',
      type: 9,
      value: 2,
      options: [
        {
          key: 1,
          value: '下拉菜单1',
        },
        {
          key: 2,
          value: '下拉菜单2',
        },
        {
          key: 4,
          value: '下拉菜单4',
        },
      ],
    },
    {
      controlId: Math.random() * 1000000000,
      controlName: '复选',
      row: 11,
      col: 1,
      hint: '',
      type: 10,
      value: 3,
      options: [
        {
          key: 1,
          value: '复选1',
        },
        {
          key: 2,
          value: '复选2',
        },
        {
          key: 4,
          value: '复选4',
        },
      ],
    },
    {
      controlId: 'aaaaaaaaa',
      controlName: '附件',
      row: 12,
      col: 1,
      hint: '',
      type: 14,
      value: [
        {
          attachmentType: 2,
          fromType: 3,
          fileID: '572a75e0-0861-400a-bde7-26a7d1676bee',
          docVersionID: '572a75e0-0861-400a-bde7-26a7d1676bee',
          sourceID: 'c0c76c43-5001-4ca1-931a-4ab2d8fcd6b2',
          commentID: '9c238483-b732-43c4-aa73-dca0e38592e3',
          createAccount: {
            accountID: '14d16ea0-b9c3-48fb-af1c-becbada3d5b7',
            avatar: 'https://pic.mingdao.com/UserAvatar/f8348983-c847-4350-ae43-9200af8dcdef.jpg?imageView2/1/w/48/h/48/q/90',
            status: 0,
            fullName: '邱军标',
          },
          accountId: '14d16ea0-b9c3-48fb-af1c-becbada3d5b7',
          createUserAvatar: 'https://pic.mingdao.com/UserAvatar/f8348983-c847-4350-ae43-9200af8dcdef.jpg?imageView2/1/w/48/h/48/q/90',
          createUserName: '邱军标',
          originalFilename: 'errorCode',
          ext: '.txt',
          filesize: 4530,
          createTime: '2016/11/18 12:03:11',
          allowDown: true,
          fileRealPath: 'LV/Wcr1C2Ij75IhWY5/D87WjZL+ja3jXRC8r5VltsjzZZ3N1x9WpYrM3o61FP5LtwdHhp3obvSsROhUPcnj4yxD2mfGwSd9uBFSZC7sZWyA=',
          server: 'https://doc.mingdao.com/',
        },
      ],
    },
    {
      controlId: 'aaaaaaaaa1',
      controlName: '附件1',
      row: 13,
      col: 1,
      hint: '',
      type: 14,
      value: '',
    },
  ];
  $.DialogLayer({
    dialogBoxID: 'customFildsEvents',
    container: {
      header: 'customFildsEvents',
      content: '',
      yesText: '',
      noText: '',
    },
    readyFn: function () {
      customFieldsInit({
        data: data,
        $el: $('#customFildsEvents .dialogContent'),
        validationAfterPost: function () {
          console.log('发送请求');
        },
      });

      $('#btn').on('click', function () {
        var isSuccess = checkRequired({
          $el: $('#customFildsEvents'), // 必要
        });
        alert(isSuccess);
      });
    },
    width: 570,
    callback: function () {},
  });
});
