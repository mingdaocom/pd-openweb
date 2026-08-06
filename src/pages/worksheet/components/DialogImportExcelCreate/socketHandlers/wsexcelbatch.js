import { antNotification } from 'ming-ui';

export const wsexcelbatchSocketInit = () => {
  IM.socket.on('wsexcelbatch', ({ sheetCount, id, addCount, errorCount }) => {
    antNotification.close(id);
    antNotification.success({
      message: _l('表数据导入完成'),
      description: _l('共导入%0张表，总计%1行数据', sheetCount, addCount),
      btnText: errorCount ? _l('查看错误报告') : '',
      onBtnClick: () => {
        import('src/pages/worksheet/common/WorksheetBody/ImportDataFromExcel/ErrorDialog').then(
          ({ default: openErrorDialog }) => {
            openErrorDialog({ fileKey: id, isBatch: true });
          },
        );
      },
    });
  });
};
