// JS BRIDGE
(function() {
     var id = 1,
     callbacks = {},
     registerFuncs = {};
     // 判断iOS or Android
     var userAgent = navigator.userAgent.toLowerCase();
     var isAndroid = userAgent.indexOf("android") !== -1;
     
     // 判断环境，获取不同的 md_native_bridge
     var md_native_bridge = 0;
     if (isAndroid) {
         md_native_bridge = window.Android;
     }
     else {
         md_native_bridge = window.webkit.messageHandlers.md_native_bridge;
     }
     
     window.mdJSBridge = {
         // 调用 Native
         invoke: function(bridgeName, data, callback) {
             var thisId = id ++; // 获取唯一 id
             callbacks[thisId] = callback; // 存储 Callback
             if (isAndroid) {
                 var message = {
                    bridgeName: bridgeName,
                    data: data || {},
                    callbackId: thisId // 传到 Native 端
                 };
                 md_native_bridge.md_native_bridge(JSON.stringify(message));
             } else {
                 md_native_bridge.postMessage({
                    bridgeName: bridgeName,
                    data: data || {},
                    callbackId: thisId // 传到 Native 端
                 });
             }
         },
         on: function(msg) {
             if (isAndroid) {
                 var parsedMsg = JSON.parse(msg);
                 var bridgeName = parsedMsg.bridgeName,
                 data = parsedMsg.data || {},
                 callbackId = parsedMsg.callbackId, // Native 将 callbackId 原封不动传回
                 responstId = parsedMsg.responstId;
             } else {
                 var bridgeName = msg.bridgeName,
                 data = msg.data || {},
                 callbackId = msg.callbackId, // Native 将 callbackId 原封不动传回
                 responstId = msg.responstId;
             }
             
             // 具体逻辑
             // bridgeName 和 callbackId 不会同时存在
             if (callbackId) {
                 if (callbacks[callbackId]) { // 找到相应句柄
                     if (isAndroid) {
                         callbacks[callbackId](parsedMsg.data); // Android 平台
                     } else {
                         callbacks[callbackId](msg.data); // 执行调用
                     }
                 }
             } else if (bridgeName) {
                 if (registerFuncs[bridgeName]) { // 通过 bridgeName 找到注册的回调函数
                     var ret = "",
                         flag = false;
                     var cb = registerFuncs[bridgeName];
                     if (cb) {
                         var result = cb(data, function(r) {
                             flag = true;
                             ret = r;
                         });
                         if (flag) {
                             if (isAndroid) {
                                 var message = {
                                    responstId: responstId,
                                    ret: ret
                                 };
                                 md_native_bridge.md_native_bridge(JSON.stringify(message));
                             } else {
                                 md_native_bridge.postMessage({ // 回调 Native
                                     responstId: responstId,
                                     ret: ret
                                 });
                             }
                         } 
                         else {
                             return result;
                         }
                     }
                     else {
                         if (isAndroid) {
                             var message = {
                                responstId: responstId,
                                ret: 'function not found'
                             };
                             md_native_bridge.md_native_bridge(JSON.stringify(message));
                         } else {
                             md_native_bridge.postMessage({ // 回调 Native
                                responstId: responstId,
                                ret: 'function not found'
                             });
                         }
                     }
                 }
             }
         },
         register: function(bridgeName, callback) {
             if (bridgeName && callback) {
                 registerFuncs[bridgeName] = callback; // 存储回调
             }
         }
     };
 })();

// JS API
(function() {
    var userAgent = window.navigator.userAgent.toLowerCase();
    var isMingdao = userAgent.indexOf("Mingdao Application") !== -1;
    var isAndroid = userAgent.indexOf("android") !== -1;
    var isIOS = userAgent.indexOf("iphone") !== -1 || userAgent.indexOf("ipad") !== -1;
    var isInit = false;
    
    var ready = function (callback) {
        isInit = true;
        callback && callback();
    };
    var login = function (options) {
        invokeMDJSBridge('login', {
            access_token: options.access_token || '',
            expires_in: options.expires_in || 0,
            refresh_token: options.refresh_token || ''
        }, {});
    }
    
    var logout = function (options) {
        invokeMDJSBridge('logout', {
            message: options.message || ''
        }, {});
    };

    function convertOptions(bridgeName, options) {
        if (options.control) {
            var control = options.control;
            delete options.control;
            
            if (bridgeName == 'scanQRCode') {
                if (control.advancedSetting) {
                    if (control.advancedSetting.dismanual == "1") {
                        options.manualInput = 0;
                    } else {
                        options.manualInput = 1;
                    }
                }
                let str = control.strDefault;
                if (typeof str === 'string' && str.length > 0) {
                    let firstChar = str.charAt(0);
                    if (firstChar == "1") {
                        options.albumEnabled = 0;
                    } else {
                        options.albumEnabled = 1;
                    }
                }
            } else if (bridgeName == 'chooseLocation') {
                if (control.advancedSetting) {
                    options.range = control.advancedSetting.distance;
                }
                if (control.enumDefault2 == 1) {
                    options.nearby = true;
                } else {
                    options.nearby = false;
                }
            } else if (bridgeName == 'chooseImage') {
                if (control.enumDefault == 2) {
                    options.sortAscend = true;
                } else {
                    options.sortAscend = false;
                }
                
                if (control.advancedSetting) {
                    options.compress = control.advancedSetting.compress;
                    options.maxSize = control.advancedSetting.max;
                    
                    var shouldCheckSource = false;
                    let str = control.advancedSetting.filetype;
                    if (typeof str === 'string' && str.length > 0) {
                        try {
                            let obj = JSON.parse(str);
                            let type = obj.type;
                            let values = obj.values;
                            if (type == 1) {
                                options.mediaType = 'image';
                                shouldCheckSource = true;
                            } else if (type == 2) {
                                options.mediaType = 'document';
                                options.sourceType = ['other'];
                            } else if (type == 3) {
                                options.mediaType = 'audio';
                                options.sourceType = ['other'];
                            } else if (type == 4) {
                                options.mediaType = 'video';
                                shouldCheckSource = true;
                            } else {
                                if (options.mediaType) {
                                    delete options.mediaType;
                                }
                            }
                            
                            options.format = values;
                        } catch (error) {
                            if (options.mediaType) {
                                delete options.mediaType;
                            }
                        }
                    }
                    
                    if (shouldCheckSource) {
                        if (control.enumDefault2 == 1 ||
                            control.enumDefault2 == 2 ||
                            control.enumDefault2 == 3)
                        {
                            let str2 = control.strDefault;
                            if (typeof str2 === 'string' && str.length > 0) {
                                let firstChar = str2.charAt(0);
                                if (firstChar == "0") {
                                    options.sourceType = ['album' ,'camera'];
                                } else {
                                    options.sourceType = ['camera'];
                                }
                            } else {
                                options.sourceType = ['album' ,'camera'];
                            }
                        }
                        else {
                            options.sourceType = ['album', 'camera', 'other'];
                        }
                    }
                    else {
                        options.sourceType = ['album', 'camera', 'other'];
                    }
                    
                    let filterregex = control.advancedSetting.filterregex;
                    if (typeof filterregex === 'string' && filterregex.length > 0) {
                        try {
                            let obj = JSON.parse(filterregex);
                            options.filterRegex = obj;
                        } catch (error) {
                            if (options.filterRegex) {
                                delete options.filterRegex;
                            }
                        }
                    } else {
                        if (options.filterregex) {
                            delete options.filterregex;
                        }
                    }

                    let watermark = control.advancedSetting.watermark;
                    if (typeof watermark === 'string' && watermark.length > 0) {
                        try {
                            let obj = JSON.parse(watermark);
                            options.watermark = obj;
                        } catch (error) {
                            if (options.watermark) {
                                delete options.watermark;
                            }
                        }
                    } else {
                        if (options.watermark) {
                            delete options.watermark;
                        }
                    }
                }
                
            } else if (bridgeName == 'signature') {
                if (control.advancedSetting) {
                    if (control.advancedSetting.uselast == 0) {
                        options.allowLast = false;
                    } else {
                        options.allowLast = true;
                    }
                }
            }
            
            return options;
        } else {
            return options;
        }
    };
    
    var scanQRCode = function (options) {
        var bridgeName = 'scanQRCode';
        var params = convertOptions(bridgeName, options);
        invokeMDJSBridge(bridgeName, {
            scanType: params.scanType || ["qrCode", "barCode"],
            albumEnabled: params.albumEnabled == 0?0:1,
            manualInput: params.manualInput == 0?0:1,
        }, params);
    };
    
    var openLocation = function (options) {
        invokeMDJSBridge('openLocation', {
            type: options.type || 'gcj02',
            latitude: options.latitude,
            longitude: options.longitude,
            name: options.name || "",
            address: options.address || "",
            scale: options.scale || 28,
            infoUrl: options.infoUrl || ""
        }, options);
    };

    var getLocation = function (options) {
        options = options || {};
        invokeMDJSBridge('getLocation', {}, options);
    };
    
    var chooseLocation = function (options) {
        var bridgeName = 'chooseLocation';
        var params = convertOptions(bridgeName, options);
        options = options || {};
        invokeMDJSBridge(bridgeName, {
            nearby: params.nearby || false,
            range: params.range || 0
            }, params);
    };
    
    // 打开应用
    var openNativePage = function (options) {
        invokeMDJSBridge('openNativePage', {
            type : options.type || '',
            appId: options.appId || '',
            sheetId: options.sheetId || '',
            viewId: options.viewId || '',
            rowId: options.rowId || '',
            pageId: options.pageId || '',
            url : options.url || '',
            openInBrowser: options.openInBrowser || false
        }, options);
    };
    
    // 选择文件
    var chooseImage = function (options) {
        var bridgeName = 'chooseImage';
        var params = convertOptions(bridgeName, options);
        // 给原生注册方法
        if (params.filterRegex && params.checkValueByFilterRegex) {
            registerMDJSBridge('checkValueByFilterRegex', function(data) {
                var name = data.name;
                var result = params.checkValueByFilterRegex(name);
                return result;
            });
        }
        invokeMDJSBridge(bridgeName, {
            sessionId:params.sessionId,
            count: params.count || 100,
            compress: params.compress || false,
            sourceType: params.sourceType || ['album', 'camera', 'other'],
            knowledge: params.knowledge == false? false: true,
            mediaType: params.mediaType,
            format: params.format,
            maxSize: params.maxSize,
            sortAscend: params.sortAscend,
            watermark: params.watermark,
            filterRegex:params.filterRegex,
        }, params);
    };
    
    var showUploadingImage = function (options) {
        invokeMDJSBridge('showUploadingImage', {
            sessionId: options.sessionId || ''
        }, options);
    };
    
    var previewImage = function (options) {
        if (options.filterRegex && options.checkValueByFilterRegex) {
            registerMDJSBridge('checkValueByFilterRegex', function(data) {
                var name = data.name;
                var result = options.checkValueByFilterRegex(name);
                return result;
            });
        }
        invokeMDJSBridge('previewImage', {
            nameEditing: options.nameEditing == false? false:true,
            deletion: options.deletion == false? false:true,
            sharing: options.sharing == false? false:true,
            download: options.sharing == false? false:true,
            index: options.index || 0,
            filterRegex:options.filterRegex,
            files: options.files || []
        }, options)
    };
    
    var signature = function (options) {
        var bridgeName = 'signature';
        var params = convertOptions(bridgeName, options);
        
        invokeMDJSBridge(bridgeName, {
            allowLast: params.allowLast == false? false: true,
        }, params);
    };
    
    var previewSignature = function (options) {
        invokeMDJSBridge('previewSignature', {
            url:options.url
        }, options);
    };
    
    var chooseUsers = function (options) {
        invokeMDJSBridge('chooseUsers', {
            projectId: options.projectId,
            count: options.count,
            appointed: options.appointed || [],
            selected: options.selected || [],
            disabled: options.disabled || [],
            additions: options.additions || []
        }, options);
    };
    
    var chooseDepartments = function (options) {
        invokeMDJSBridge('chooseDepartments', {
            projectId: options.projectId || '',
            count: options.count,
            rangeType: options.rangeType,
            appointed: options.appointed || [],
            appointedUsers: options.appointedUsers || [],
            selected: options.selected || [],
            disabled: options.disabled || []
        }, options);
    };
    
    var chooseRoles = function (options) {
        invokeMDJSBridge('chooseRoles', {
            projectId: options.projectId || '',
            count: options.count,
            appointed: options.appointed || [],
            selected: options.selected || [],
            disabled: options.disabled || []
        }, options);
    };
    
    var workflowPushMessage = function (options) {
        invokeMDJSBridge('workflowPushMessage', {
        message:options.message,
        }, options);
    };
    
    // method 方法名称
    // data   方法参数
    // options callBack
    var invokeMDJSBridge = function (method, data, options) {
        if (window.mdJSBridge) {
            mdJSBridge.invoke(method, parseData(data), function (res) {
                handleResult(method, res, options);
            });
        }
    };

    var registerMDJSBridge = function (eventName, callback) {
        if (window.mdJSBridge) {
            mdJSBridge.register(eventName, function (res, rCallBack) {
                if (callback) {
                    var res = callback(res, rCallBack);
                    if (res) {
                        return res;
                    }
                }
            });
        }
    };

    var parseData = function (data) {
        return data || {};
    };

    var handleResult = function (method, res, options) {
        var errMsg = res.errMsg;
        var result = errMsg || "";
        
        switch (result) {
            case "ok":
                options.success && options.success(res);
                break;
            case "cancel":
                options.cancel && options.cancel(res);
                break;
            default:
                options.fail && options.fail(res);
                break;
        }
        
        options.complete && options.complete(res);
    };

    var MDJS = {
        ready: ready,
        login: login,
        logout: logout,
        scanQRCode: scanQRCode,
        openLocation: openLocation,
        getLocation: getLocation,
        chooseLocation: chooseLocation,
        openNativePage: openNativePage,
        chooseImage: chooseImage,
        showUploadingImage: showUploadingImage,
        previewImage: previewImage,
        signature: signature,
        previewSignature: previewSignature,
        chooseUsers: chooseUsers,
        chooseDepartments: chooseDepartments,
        chooseRoles: chooseRoles,
        workflowPushMessage: workflowPushMessage,
    };

    window.md_js = window.MDJS = MDJS;

    return MDJS;
})();

// 更新地址
// https://sourcecode.mingdao.net/WeeTom/md_js_sdk

