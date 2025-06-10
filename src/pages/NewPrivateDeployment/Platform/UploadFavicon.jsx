import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import qiniuAjax from 'src/api/qiniu';
import RegExpValidator from 'src/utils/expression';

export default function (props) {
    const { onUploaded, children } = props;
    const uploadButtonRef = useRef(null);

    useEffect(() => {
        initUpload();
    }, []);

    const initUpload = () => {
        const uploader = new plupload.Uploader({
            browse_button: uploadButtonRef.current,
            url: md.global.FileStoreConfig.uploadHost,
            chunk_size: '4mb',
            file_data_name: 'file',
            multi_selection: false,
            filters: {
                mime_types: [{ extensions: 'png' }],
                max_file_size: '2m',
                prevent_duplicates: true,
            },
        });

        uploader.bind('FilesAdded', (uploader, files) => {
            qiniuAjax.getFaviconUploadToken().then(res => {
                files.forEach((item, i) => {
                    item.token = res.uptoken;
                    item.key = res.key;
                    item.serverName = res.serverName;
                    item.fileName = res.fileName;
                });
                uploader.start();
            });
        });

        uploader.bind('BeforeUpload', (uploader, file) => {
            const fileExt = `.${RegExpValidator.getExtOfFileName(file.name)}`;
            uploader.settings.multipart_params = { token: file.token };
            uploader.settings.multipart_params.key = file.key;
            uploader.settings.multipart_params['x:serverName'] = file.serverName;
            uploader.settings.multipart_params['x:filePath'] = file.key ? file.key.replace(file.fileName, '') : '';
            uploader.settings.multipart_params['x:fileName'] = (file.fileName || '').replace(/\.[^\.]*$/, '');
            uploader.settings.multipart_params['x:originalFileName'] = encodeURIComponent(
                file.name.indexOf('.') > -1 ? file.name.split('.').slice(0, -1).join('.') : file.name,
            );
            uploader.settings.multipart_params['x:fileExt'] = fileExt;
        });

        uploader.bind('FileUploaded', (uploader, file, response) => {
            onUploaded();
        });

        uploader.bind('Error', (uploader, error) => {
            alert(_l('上传失败'), 2);
        });

        uploader.init();
    };

    return (
        <div className="imageUploaderWrapper" ref={uploadButtonRef}>
            {children}
        </div>
    );
}
