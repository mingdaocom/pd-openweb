import { getPssId } from 'src/util/pssId';

export const downloadFile = ({ url, params, exportFileName } = {}) => {
  fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: `md_pss_id ${getPssId()}` },
    body: JSON.stringify(params),
  })
    .then(response => response.blob())
    .then(blob => {
      if (blob.type === 'application/json') {
        const reader = new FileReader();
        reader.readAsText(blob, 'utf-8');
        reader.onload = function () {
          const { exception } = JSON.parse(reader.result);
          alert(exception, 2);
        };
      } else {
        const fileName = exportFileName;
        const link = document.createElement('a');

        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);
      }
    });
};
