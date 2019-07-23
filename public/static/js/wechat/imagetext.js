$(function () {
    if (type == 0) {
        // 富文本编辑
        var ue = UE.getEditor('content', {
            toolbars: [
                ['bold',
                    'italic',
                    'underline',
                    'fontborder',
                    'strikethrough',
                    'removeformat',
                    'formatmatch',
                    'autotypeset',
                    'blockquote',
                    'pasteplain',
                    'forecolor',
                    'backcolor',
                    'insertorderedlist',
                    'insertunorderedlist',
                    'selfsimpleupload', //单图上传
                    'insertvideo', //视频
                    'cleardoc',
                    'link', //超链接
                    'unlink', //取消链接
                    'paragraph', //段落格式
                    'justifyleft', //居左对齐
                    'justifyright', //居右对齐
                    'justifycenter', //居中对齐
                    'justifyjustify', //两端对齐
                    'insertorderedlist', //有序列表
                    'insertunorderedlist', //无序列表
                    'rowspacingtop', //段前距
                    'rowspacingbottom', //段后距
                    'imagenone', //默认
                    'imageleft', //左浮动
                    'imageright', //右浮动
                    'imagecenter', //居中
                    'lineheight', //行间距
                    'edittip ', //编辑提示
                    'inserttable', //插入表格
                    'source', //源代码
                ]
            ],
            autoHeightEnabled: true,
            autoFloatEnabled: true,
            enableAutoSave: false,
            elementPathEnabled: false,
            initialFrameHeight: 300,
            initialFrameWidth: 444,
        });
        // 给富文本添加绑定事件
        ue.addListener('blur', function () {
            var content = ue.getContent();
            if (content == '') {
                $('.edit-ing .text').val('');
                $('#content').next().remove();
                $('#content').after('<p class="help-block error-message">正文不能为空</p>');
            } else {
                $('.edit-ing .text').val(content);
                $('#content').next().remove();
            }
        });
        // 添加自定义事件
        UE.commands['selfsimpleupload'] = {
            execCommand: function () {
                top.layer.open({
                    type: 2,
                    title: '图片素材',
                    shadeClose: true,
                    shade: 0.8,
                    area: ['80%', '80%'],
                    content: choseMaterialUrl, //iframe的url
                    success: function (layero, index) {
                        /** 子页面body对象 */
                        var body = top.layer.getChildFrame('body', index);
                        var childForm = top.layer.getChildFrame('form', index);

                        var ifIndex = top.layer.getFrameIndex(layero.find('iframe')[0]['name']); //先得到当前iframe层的索引
                        /** 获取子页面button对象*/
                        var childButton = body.find("input[name='doUploadImage']");

                        childButton.on('click', function () {
                            var uploadFileImg = body.find("#js-fileupload-input")[0].files[0];
                            if (typeof uploadFileImg == 'undefined') {
                                top.layer.msg('请先选择图片', {icon: 0, time: 1000, shadeClose: true, shade: 0.8});
                            }
                            $(childForm[0]).ajaxSubmit({
                                type: 'post',
                                url: uploadImageUrl,
                                dataType: 'json',
                                success: function (data) {
                                    if (data.code == 0) {
                                        showUeImg(data.data.path, data.data.wx_url);
                                        top.layer.close(ifIndex); //再执行关闭
                                        top.layer.msg('操作成功', {icon: 1, time: 1000, shadeClose: true, shade: 0.8});
                                    } else {
                                        top.layer.close(ifIndex); //再执行关闭
                                        top.layer.msg(data.msg, {icon: 0, time: 1000, shadeClose: true, shade: 0.8});
                                    }
                                },
                                error: function (XmlHttpRequest, textStatus, errorThrown) {
                                    top.layer.close(ifIndex); //再执行关闭
                                    top.layer.msg('系统繁忙，请稍后再试！', {icon: 0, time: 1000, shadeClose: true, shade: 0.8});
                                }
                            });
                        });
                        var childClick = body.find(".js-choose");
                        childClick.on('click', function () {
                            var attachment_id = $(this).attr('data-id');
                            if(!attachment_id){
                                top.layer.msg('素材ID异常', {icon:3});
                            }
                            $.ajax({
                                type: "POST",
                                url: checkPicUrl,
                                dataType: "json",
                                data: { id:attachment_id, _token: token},
                                success: function (data) {
                                    if (data.code != 0) {
                                        top.layer.msg(data.msg, {icon:2});
                                    }
                                    else {
                                        showUeImg(data.data.pic_path, data.data.url);
                                        /** 关闭子页面 */
                                        top.layer.close(ifIndex); //再执行关闭
                                        top.layer.msg('操作成功', {icon: 1, time: 1000, shadeClose: true, shade: 0.8});
                                    }
                                },
                                error: function () {
                                    top.layer.msg('系统异常', {icon:3});
                                }
                            });
                        });
                    }
                });
            }
        }
        // 将图片地址显示在富文本内
        function showUeImg(url, wx_url) {
            var html = '<img src='+ wx_url+' _src='+ url +' />';
            ue.execCommand('inserthtml', html);
        }
    }
    //选择链接事件
    $(document).on('click', '#chosePreset', function () {
        parent.layer.open({
            type: 2,
            title: '预设链接',
            shadeClose: true,
            shade: 0.8,
            area: ['50%', '60%'],
            content: chosePresetUrl, //iframe的url
            success: function (layero, index) {
                /** 子页面body对象 */
                var body = parent.layer.getChildFrame('body', index);
                /** 获取子页面button对象*/
                var childButton = body.find("button[name='jss']");
                childButton.on('click', function () {
                    /** 获取子页面点击事件操作的预设链接ID */
                    var urlId = $(this).attr('js-data');
                    var urlName = $(this).attr('js-name');
                    var urlLink = $(this).attr('js-link');
                    var newHtml = "<a href='" + urlLink + "' target='_blank' class='label' style='font-size: 18px;'>【 " + urlName + " 】</a>";
                    $('.choseUrl').empty().append(newHtml);
                    showLinkHtml(urlLink, urlName, 1, urlId)
                    //给表单赋值
                    $('.edit-ing .url-data').val(urlId);//预设链接主键
                    $('.edit-ing .url-type').val(1);//预设链接 url_type = 1

                    /** 关闭子页面 */
                    var ifIndex = parent.layer.getFrameIndex(layero.find('iframe')[0]['name']); //先得到当前iframe层的索引
                    parent.layer.close(ifIndex); //再执行关闭
                    parent.layer.msg('操作成功', {icon: 1, time: 1000, shadeClose: true, shade: 0.8});
                });
            }
        });
    });

    //表单失去焦点
    $(':input').bind('input propertychange', function () {
        var thisVal = $(this).val();
        var thisId = $(this).attr('id');
        switch (thisId) {
            case 'input-title':
                $('.edit-ing .title').val(thisVal);
                if (thisVal == '') {
                    $('.edit-ing .appmsg-title').text('标题');
                    if (!$(this).next().hasClass('error-message')) {
                        $(this).after('<p class="help-block error-message">标题不能为空</p>');
                    }
                } else {
                    $('.edit-ing .appmsg-title').text(thisVal);
                    if ($(this).next().hasClass('error-message')) {
                        $(this).next().remove();
                    }
                }
                break;
            case 'input-digest':
                $('.edit-ing .digest').val(thisVal);
                if (thisVal == '') {
                    $('.edit-ing .appmsg-digest').text('');
                } else {
                    $('.edit-ing .appmsg-digest').text(thisVal);
                }
                break;
            case 'input-author':
                $('.edit-ing .author').val(thisVal);
                break;
        }
    });
    //封面图片是否显示在正文中
    $('#input-show-image').change(function () {
        if ($('#input-show-image').is(':checked')) {
            $('.edit-ing .is_show_text').val(1);
        } else {
            $('.edit-ing .is_show_text').val(0);
        }
    });

    //添加图片
    $('.js-add-image').on('click', function () {
        top.layer.open({
            type: 2,
            title: '图片素材',
            shadeClose: true,
            shade: 0.8,
            area: ['80%', '80%'],
            content: choseMaterialUrl, //iframe的url
            success: function (layero, index) {
                /** 子页面body对象 */
                var body = top.layer.getChildFrame('body', index);
                var childForm = top.layer.getChildFrame('form', index);

                var ifIndex = top.layer.getFrameIndex(layero.find('iframe')[0]['name']); //先得到当前iframe层的索引
                /** 获取子页面button对象*/
                var childButton = body.find("input[name='doUploadImage']");

                childButton.on('click', function () {
                    var uploadFileImg = body.find("#js-fileupload-input")[0].files[0];
                    if (typeof uploadFileImg == 'undefined') {
                        top.layer.msg('请先选择图片', {icon: 0, time: 1000, shadeClose: true, shade: 0.8});
                    }
                    $(childForm[0]).ajaxSubmit({
                        type: 'post',
                        url: uploadImageUrl,
                        dataType: 'json',
                        success: function (data) {
                            if (data.code == 0) {
                                showImg(data.data.path, data.data._path, data.data.media_id);
                                top.layer.close(ifIndex); //再执行关闭
                                top.layer.msg('操作成功', {icon: 1, time: 1000, shadeClose: true, shade: 0.8});
                            } else {
                                top.layer.close(ifIndex); //再执行关闭
                                top.layer.msg(data.msg, {icon: 0, time: 1000, shadeClose: true, shade: 0.8});
                            }
                        },
                        error: function (XmlHttpRequest, textStatus, errorThrown) {
                            top.layer.close(ifIndex); //再执行关闭
                            top.layer.msg('系统繁忙，请稍后再试！', {icon: 0, time: 1000, shadeClose: true, shade: 0.8});
                        }
                    });
                });

                var childClick = body.find(".js-choose");
                childClick.on('click', function () {
                    var attach_path = $(this).attr('js-data');
                    var media_id = $(this).attr('media_id');
                    showImg(httpUploadPatch+attach_path, attach_path, media_id);
                    /** 关闭子页面 */
                    top.layer.close(ifIndex); //再执行关闭
                    top.layer.msg('操作成功', {icon: 1, time: 1000, shadeClose: true, shade: 0.8});
                });
            }
        });
    });

    //选择编辑图文
    $(document).on('click', '.app-field', function () {
        if ($(this).hasClass('image-text-title')) {
            return false;
        }
        var self = this;
        $(self).siblings('.app-field').removeClass('edit-ing');
        $(self).addClass('edit-ing');
        var thisPosition = $(self).position();
        $('.app-sidebar').css('marginTop', thisPosition.top);
        $(self).find('input').each(function () {
            var className = $(this).attr('class');
            var thisVal = $(this).val();
            switch (className) {
                case 'title':
                    $('#input-title').val(thisVal);
                    if (thisVal == '' && !$('#input-title').next().hasClass('error-message')) {
                        $('#input-title').after('<p class="help-block error-message">标题不能为空</p>');
                    }
                    if (thisVal != '' && $('#input-title').next().hasClass('error-message')) {
                        $('#input-title').next().remove();
                    }
                    if (thisVal != '') {
                        $('.edit-ing .appmsg-title').text(thisVal);
                    }
                    break;
                case 'author':
                    $('#input-author').val(thisVal);
                    break;
                case 'cover':
                    var prevImg = $('.js-add-image').prev('img');
                    if ((type == 0) || (type == 1 && is_more == 1)) {
                        var errorMessage = $('.js-image-region').children('.error-message');
                        if (thisVal != '' && errorMessage.length > 0) {
                            errorMessage.remove();
                        }
                        if (thisVal == '' && errorMessage.length <= 0) {
                            $('.js-image-region').append('<p class="help-block error-message">必须选择一张图片</p>');
                        }
                    }
                    if (thisVal != '') {
                        thisVal = httpUploadPatch + thisVal;
                        if (prevImg.length == 0) {
                            $('.js-add-image').before('<img width="100" height="100" src="' + thisVal + '" />');
                        } else {
                            $(prevImg).attr('src', thisVal);
                        }
                        $('.edit-ing .appmsg-thumb-wrap').html('<img src="' + thisVal + '" />')
                        $('.js-add-image').css('margin', '0 0 0 10px').text('重新选择');

                    } else {
                        if (prevImg.length > 0) {
                            $('.js-add-image').css('margin', '0').text('添加图片...');
                            $(prevImg).remove();
                        }
                    }
                    break;
                case 'is_show_text':
                    if (thisVal == 1) {
                        $('#input-show-image').prop('checked', true);
                    } else {
                        $('#input-show-image').prop('checked', false);
                    }
                    break;
                case 'digest':
                    $('#input-digest').val(thisVal);
                    break;
                case 'text':
                    if (type == 0) {
                        ue.setContent(thisVal);
                        if (thisVal == '' && !$('#content').next().hasClass('error-message')) {
                            $('#content').after('<p class="help-block error-message">正文不能为空</p>');
                        }
                        if (thisVal != '' && $('#content').next().hasClass('error-message')) {
                            $('#content').next().remove();
                        }
                    }
                    break;
                case 'url-data', 'url-link', 'url-type', 'url-title':
                    var urlLink = $(self).find('.url-link').val();
                    var urlTitle = $(self).find('.url-title').val();
                    var errorMessage = $('.dropup').children('.error-message');
                    if (thisVal == '' && errorMessage.length <= 0) {
                        $('.dropup').append('<p class="help-block error-message">请设置链接地址</p>');
                    }
                    if (thisVal != '' && errorMessage.length > 0) {
                        errorMessage.remove();
                    }
                    if (urlLink != '' && urlTitle != '') {
                        $('.choseUrl').empty().append("<a href='" + urlLink + "' target='_blank' class='label' style='font-size: 18px;'>【 " + urlTitle + " 】</a>");
                    } else {
                        $('.choseUrl').empty();
                    }
                    break;
            }
        });
    });

    //拖动图文
    $(document).on('mousedown', '.app-field', function (e) {
        if ($(this).hasClass('not-sortable')) {
            return false;
        }
        $(this).css('cursor', 'move');
        var range = {x: 0, y: 0}; //鼠标相对于选中元素的偏移量
        var lastPos = {x: 0, y: 0, x1: 0, y1: 0}; //拖拽目标随鼠标移动的四个坐标
        var tarPos = {x: 0, y: 0, x1: 0, y1: 0}; //目标对象的坐标

        var mousedownY = e.pageY, mousemoveY = 0; //鼠标点击和鼠标移动后的Y坐标位置

        var theDiv = this, move = true; //拖拽对象 拖拽状态
        var theDivId = 0, theDivHeight = 0, tarFirstY = 0; //拖拽对象的索引，高度的初始化
        var tarDiv = null, tarFirst = null, tempDiv = null; //要插入的目标元素的对象，临时对象

        var theDivPosition = $(theDiv).position();
        range.y = e.pageY - theDivPosition.top;
        theDivId = $(theDiv).index();
        theDivHeight = $(theDiv).height();
        $(theDiv).addClass('moveing');
        $(theDiv).css({
            'position': 'absolute',
            'background': '#ececec',
            'width': "288px",
            'height': theDivHeight,
            'z-index': '2',
            'top': theDivPosition.top
        });

        if ($('.temp').length == 0) {
            $('<div class="temp" style="position:static;width:288px;height:' + theDivHeight + 'px;"></div>').insertBefore($(theDiv));
        }

        $(document).mousemove(function (e2) {
            if (!move) {
                return false;
            }

            mousemoveY = e2.pageY; //鼠标移动后的Y坐标位置

            lastPos.y = e2.pageY - range.y;
            lastPos.y1 = lastPos.y + theDivHeight;

            $(theDiv).css('top', lastPos.y);

            var $main = $('.app-fields .app-field').not('.not-sortable').not('.moveing');
            tempDiv = $('.temp');
            $main.each(function () {
                tarDiv = $(this);
                tarPos.y = tarDiv.position().top;
                tarPos.y1 = tarPos.y + tarDiv.height();

                tarFirst = $main.eq(0);
                tarFirstY = tarFirst.position().top;

                if (lastPos.y <= tarFirstY) {
                    tempDiv.insertBefore(tarFirst);
                } else if (lastPos.y >= tarPos.y - theDivHeight && lastPos.y1 >= tarPos.y1) {
                    tempDiv.insertAfter(tarDiv);
                }
            });
        });


        $(document).mouseup(function (e3) {
            if (!move) {
                return false;
            }

            tempDiv = $('.temp');
            $(theDiv).removeAttr('style').removeClass('moveing');
            var diff = Math.abs(mousedownY - mousemoveY);
            if (diff > 10 && mousemoveY != 0) {
                $(theDiv).insertAfter(tempDiv);
            }
            tempDiv.remove();
            move = false;
            $(this).mouseup = null;
            $(this).mousemove = null;
            $(this).mousedown = null;
            return true;
        });
    });

    //新增图文
    $('.js-add-region').on('click', function () {
        if ($('#app-fields').children('.app-field').length >= 10) {
            artAlert('最多只能有10条图文！', 'warning');
            return false;
        }
        var addHtml = '<div class="app-field clearfix">';
        addHtml += '<div class="appmsg appmsg-multiple-others">';
        addHtml += '<h4 class="appmsg-title">标题</h4>';
        addHtml += '<div class="appmsg-thumb-wrap"><p>缩略图</p></div>';
        if (isEdit == 1) {
            addHtml += '<input type="hidden" class="txt_id" name="other_txt_id[]" value="" />';
        }
        addHtml += '<input type="hidden" class="title" name="othertitle[]" value="" />';
        addHtml += '<input type="hidden" class="author" name="otherauthor[]" value="" />';
        addHtml += '<input type="hidden" class="cover" name="othercover[]" value="" />';
        addHtml += '<input type="hidden" class="cover_media_id" name="othercover_media_id[]" value="" />';
        //addHtml += '<input type="hidden" class="is_show_text" name="other_is_show_text[]" value="" />';
        addHtml += '<input type="hidden" class="text" name="othertext[]" value="" />';
        addHtml += '<input type="hidden" class="url-data" name="other_url_data[]" value="" />';
        addHtml += '<input type="hidden" class="url-type" name="other_url_type[]" value="" />';
        addHtml += '<input type="hidden" class="url-link" name="other_url_link[]" value="" />';
        addHtml += '<input type="hidden" class="url-title" name="other_url_title[]" value="" />';
        addHtml += '</div>';
        addHtml += '<div class="actions">';
        addHtml += '<div class="actions-wrap">';
        addHtml += '<span class="action edit">编辑</span>';
        addHtml += '<span class="action delete">删除</span>';
        addHtml += '</div>';
        addHtml += '</div>';
        addHtml += '</div>';
        $('#app-fields').append(addHtml);
        $('#app-fields').children('.app-field').last().trigger('click');
    });

    //删除当前图文
    $(document).on('click', '.delete', function (e) {
        e.stopPropagation();
        if (!confirm('确定要删除吗？')) {
            return false;
        }
        var thisAppField = $(this).parents('.app-field');

        //如果删除的是当前选择的图文，则指定前一条图文为选择图文，否则重新计算app-sidebar的位置
        if ($(thisAppField).hasClass('edit-ing')) {
            var thisAppFieldPrev = $(thisAppField).prev();
            $(thisAppField).remove();
            $(thisAppFieldPrev).trigger('click');
        } else {
            $(thisAppField).remove();
            $('.app-sidebar').css('marginTop', $('#app-fields>.edit-ing').position().top);
        }
    });

    //选择素材库图片
    $(document).on('click', '.imglist li', function () {
        //获取选择的图片
        var childrenImg = $(this).children('img');
        if ($(childrenImg).attr('original-filesize') > 1048576) {
            artAlert('最大支持 1 MB 的图片！', 'warning');
            return false;
        }
        if ($(childrenImg).attr('original-width') > 1200 && type == 0) {
            artAlert('图片宽度不能大于1200像素，否则会导致群发失败！', 'warning');
            return false;
        }
        var imgSrc = $(childrenImg).attr('src');
        var originalImgSrc = $(childrenImg).attr('original-src');
        showImg(imgSrc, originalImgSrc);
    });

    //选择素材库
    $(document).on('click', '#select-img-library', function () {
        if ($('#img-library').css('display') == 'none') {
            $('#select-add-new-img').removeClass('select_li');
            $(this).addClass('select_li');
            $('#add-new-img').hide();
            $('#img-library').show();
        }
    });

    //选择添加新图片
    $(document).on('click', '#select-add-new-img', function () {
        if ($('#add-new-img').css('display') == 'none') {
            $('#select-img-library').removeClass('select_li');
            $(this).addClass('select_li');
            $('#img-library').hide();
            $('#add-new-img').show();
        }
    });

    //关闭选择的图片
    $(document).on('click', '.js-remove-image', function () {
        $('#js-fileupload-input').val('');
        $('.upload-preview-img').hide();
        $('.fileinput-button').show();
    });

    //自定义外链窗口
    $('.js-modal-links').on('click', function () {
        var thisPosition = $('.dropup').position();
        $('.popover-link-wrap').css('top', thisPosition.top + $('.dropup').height() - 8).show();
    });

    //点击空白区域关闭自定义外链窗口
    $(document).bind('click', function (e) {
        var target = $(e.target);
        if (target.closest('.js-modal-links').length == 0 && target.closest('.popover-link-wrap').length == 0) {
            $('.popover').hide();
        }
    });

    $('.js-btn-cancel').on('click', function () {
        $('.popover').hide();
    });

    //选择会员主页
    $('.js-modal-usercenter').on('click', function () {
        showLinkHtml($(this).attr('data-link'), '会员主页', 2, '');
    });

    //选择店铺主页
    $('.js-modal-homepage').on('click', function () {
        showLinkHtml($(this).attr('data-link'), '店铺主页', 3, '');
    });

    //选择文章库
    $('.js-modal-article').on('click', function () {
        window.artDialog.open($(this).attr('data-link'), {
            ok: function () {
                var iframe = this.iframe.contentWindow;
                if (!iframe.document.body) {
                    artAlert('还没加载完毕！', 'warning');
                    return false;
                }
                ;

                var checked = $(iframe.document).find("input[name='id']:checked");
                if (checked.length > 0) {
                    showLinkHtml($(checked).attr('data-url'), '文章：' + $(checked).attr('data-title'), 4, $(checked).val());
                }
                return true;
            },
            cancel: true,
            title: '文章库',
            id: 'article',
            width: 860,
            height: 530,
            lock: true
        });
    });


    //提交数据
    $('#doSubmit').on('click', function () {
        $('#ajaxPostForm').ajaxSubmit({
            type: 'post',
            url: postUrl,
            dataType: 'json',
            beforeSubmit: checkForm,
            success: function (data) {
                if (data.code == 0) {
                    artAlert('操作成功');
                    if (window.navigator.userAgent.indexOf('Chrome') !== -1) {
                        if (type == 0) {
                            window.location.href = notHighUrl;
                        } else {
                            window.location.href = highUrl;
                        }
                    } else {
                        window.location.href = mainUrl;
                    }
                } else {
                    artAlert(data.msg, 'warning');
                }
            },
            error: function (XmlHttpRequest, textStatus, errorThrown) {
                artAlert('系统繁忙，请稍后再试！', 'warning');
            }
        });
    });

    //如果是修改初始化右边的数据
    if (isEdit == 1) {
        if (type == 0) {
            ue.ready(function () {
                $('#app-fields').children('.app-field').first().trigger('click');
            });
        } else {
            $('#app-fields').children('.app-field').first().trigger('click');
        }
    }
});
function artAlert(message, icon) {
    var _newcon = (icon == 'warning') ? 0 : 1;
    top.layer.msg(message);
}

//上传图片缩略图显示
var preivew = function (file, container, input_id) {
    try {
        var pic = new Picture(file, container);
        $('.fileinput-button').hide();
        $('.upload-preview-img').show();
    } catch (e) {
        $("#" + input_id).val("");
        artAlert(e, 'warning');
    }
}

//缩略图类定义
var Picture = function (file, container) {
    var allowExt = ['jpg', 'png'],
        height = 0,
        widht = 0,
        ext = '',
        size = 0,
        name = '',
        path = '';
    var self = this;
    if (file) {
        name = file.value;
        if (window.navigator.userAgent.indexOf("MSIE") >= 1) {
            file.select();
            path = document.selection.createRange().text;
        } else {
            if (file.files) {
                path = window.URL.createObjectURL(file.files.item(0));
            } else {
                path = file.value;
            }
        }

        var img_size = file.files[0].size;
        if (img_size > 1048576) {
            throw '不能选中大于 1 MB 的图片！';
        }
    } else {
        throw "无效的文件，请重新上传！";
    }

    ext = name.substr(name.lastIndexOf(".") + 1, name.length).toLocaleLowerCase();
    if ($.inArray(ext, allowExt) == -1) {
        throw '只支持 jpg / png 格式！';
    }

    if (container.tagName.toLowerCase() != 'img') {
        throw "container is not a valid img label";
        container.display = 'none';
    }
    container.src = path;
    container.alt = name;
    container.style.display = 'inline';
    height = container.height;
    widht = container.widht;
    size = container.fileSize;

    this.get = function (name) {
        return self[name];
    }
}

//验证表单提交参数
function checkForm() {
    var isOk = true;
    $('#app-fields .app-field').each(function () {
        //标题
        if ($.trim($(this).find('.title').val()) == '') {
            $(this).trigger('click');
            $('#input-title').focus();
            isOk = false;
            return false;
        }
        //封面
        if ($.trim($(this).find('.cover').val()) == '') {
            if ((type == 0) || (type == 1 && is_more == 1)) {
                $(this).trigger('click');
                isOk = false;
                return false;
            }
        }

        //链接地址
        if ($.trim($(this).find('.url-type').val()) == '' && type == 1) {
            $(this).trigger('click');
            isOk = false;
            return false;
        }
    });
    return isOk;
}

//图片显示
function showImg(imgSrc, originalImgSrc, media_id) {

    var prevImg = $('.js-add-image').prev('img');
    if (prevImg.length == 0) {
        $('.js-add-image').before('<img width="100" height="100" src="' + imgSrc + '" />');
    } else {
        $(prevImg).attr('src', imgSrc);
    }
    $('.edit-ing .appmsg-thumb-wrap').html('<img src="' + imgSrc + '" />');
    if (type == 1 && is_more == 0) {
        $('.edit-ing .appmsg-thumb-wrap').show();
    }
    $('.edit-ing .cover').val(originalImgSrc);
    $('.edit-ing .cover_media_id').val(media_id);
    $('.js-add-image').css('margin', '0 0 0 10px').text('重新选择');

    var errorMessage = $('.js-image-region').children('.error-message');
    if (errorMessage.length > 0) {
        errorMessage.remove();
    }
}

//显示设置连接
function showLinkHtml(url, title, type, data) {
    // var linkHtml = '<a href="' + url + '" target="_blank"><span class="label label-success">链接：' + title + '</span></a>';
    // $('.js-link-to').html(linkHtml);
    if (type == 1) {
        $('.js-link-placeholder').val('');
        $('.popover').hide();
    }
//错误提示
    var errorMessage = $('.dropup').children('.error-message');
    if (errorMessage.length > 0) {
        errorMessage.remove();
    }
//给表单赋值
    $('.edit-ing .url-data').val(data);
    $('.edit-ing .url-type').val(type);
    $('.edit-ing .url-link').val(url);
    $('.edit-ing .url-title').val(title);
}
