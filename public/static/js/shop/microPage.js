/**
 * 微页面
 * Created by jxt on 7/12 0012.
 */
(function (global) {
    var microPage = global.microPage = {
        default: {
            selector: {
                preview: '.body-content',//预览区域
                config: '.sidebar-inner',//配置区域
                widgets: '.design-widget',//组件区域
                saveBtn: '.j-save',//保存按钮
            },
            dropdownLink: {},//下拉菜单链接对象
            serverUrl: '',//服务器地址
            redirectUrl: '',//保存成功跳转地址
            data: {},//附加数据
            editData: {}//编辑页面的数据
        },
        count: 0,//组件数量
        data: {}//数据
    };

    var $previewArea = null,//预览区域
        $configArea = null,//配置区域
        $widgetsArea = null,//组件区域
        widgets = {},
        $activeWidget = null,//活动组件
        dropdownLink = null,//下拉菜单链接对象
        pageType = null,
        isAppend = 0;//是否追加

    //富文本选项
    var editorConfig = {
        toolbars: [[
            'source', '|',
            'forecolor', 'backcolor', 'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'link', 'unlink', 'spechars', 'blockquote', '|',
            'inserttable', 'mergeright', 'mergedown', 'deleterow', 'deletecol', 'splittorows', 'splittocols', 'splittocells', 'deletecaption', 'inserttitle', 'mergecells', 'deletetable', '|',
            'insertorderedlist', 'insertunorderedlist', '|',
            'indent', 'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|',
            'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
            'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
            'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
            'simpleupload', 'insertimage', 'map', 'insertvideo'
        ]],
        initialFrameWidth:382,
        initialFrameHeight:420,
        //serverUrl: location.protocol + '//' + location.host + "/attachment/pic/config"
    };

    var shopLink = global.shopLink = {
        links: {
            micro_page: {title: '微页面及分类', event: 'microPage'},
            goods: {title: '商品及分组', event: 'goods'},
            //marketing: {title: '营销活动', event: 'marketing'},
            home: {title: '店铺主页', event: 'link'},
            personal: {title: '会员主页', event: 'link'},
            all_goods: {title: '全部商品', event: 'link'},
            goods_group: {title: '商品分组', event: 'link'},
            order: {title: '我的订单', event: 'link'},
            custom: {title: '自定义链接', event: 'custom'}
        },
        relLinks: {
            page_cat: {title: '微页面分类', event: 'pageCat'},
            goods_cat: {title: '商品分组', event: 'goodsCat'}
        }
    };

    function getLinks() {
        return $.extend(shopLink.links, shopLink.relLinks);
    }

    //生产随机数
    function random() {
        return Math.floor(Math.random() * 1000000);
    }

    //修改 radio checkbox ID
    function changeRadioCheckboxID($parent) {
        $parent.find('input[type=radio],input[type=checkbox]').each(function () {
            var id = 'rc_' + random();
            $(this).attr('id', id);
            $(this).siblings('label').attr('for', id);
        });
    }

    //获取图片URL
    function imageUrl($img, id) {
        if (!id) {
            return false;
        }
        $.get('/shop/page/image/url', {id: id}, function (res) {
            $img.attr('src', res.data);
        })
    }

    //显示优惠券信息
    function showCoupon(configDOM, widgetDOM, couponsId, couponsName, faceValue, limitAmount) {
        var configShow = '<li id="config-coupon-id-' + couponsId + '">';
        configShow += '<div class="coupon-list-content">';
        configShow += '<div class="coupon-list-summary">';
        configShow += '<span class="label label-success">优惠券</span>';
        configShow += '<span>' + couponsName + '</span>';
        configShow += '<span class="c-gray">' + limitAmount + '</span>';
        configShow += '</div>';
        configShow += '</div>';
        configShow += '<div class="coupon-list-opts">';
        configShow += '<a class="js-remove-coupon" data-id="' + couponsId + '" href="javascript:;">删除</a>';
        configShow += '</div>';
        configShow += '<input name="coupon[]" type="hidden" value="' + couponsId + '" />';
        configShow += '</li>';
        configDOM.find('.coupon-list').append(configShow);

        var widgetShow = '<li id="widget-coupon-id-' + couponsId + '">';
        widgetShow += '<span class="lf bor_coupon_l border_bg"></span><span class="lf bor_coupon_r border_bg"></span>';
        widgetShow += '<a href="javascript:;">';
        widgetShow += '<div class="custom-coupon-price"><span>￥</span>' + faceValue + '</div>';
        widgetShow += '<div class="custom-coupon-desc">' + limitAmount + '</div>';
        widgetShow += '</a>';
        widgetShow += '</li>';
        var $widgetUI = widgetDOM.find('.custom-coupon');
        if ($widgetUI.hasClass('empty')) {
            $widgetUI.children('.empty-li').hide();
            $widgetUI.removeClass('empty');
        }
        $widgetUI.append(widgetShow);
        if (configDOM.find('.coupon-list li').length >= 3) {
            configDOM.find('.js-add-coupon').hide();
        }
    }

    function setOption(option) {
        option = $.extend(microPage.default, option);
        $previewArea = $(option.selector.preview);
        $configArea = $(option.selector.config);
        $widgetsArea = $(option.selector.widgets);
        dropdownLink = option.dropdownLink;
        pageType = option.type;
        return option;
    }

    /**
     * 初始化操作
     * @param option {saveBtn:'保存按钮','serverUrl':'保存地址','redirectUrl':'回调地址',editData:{}}
     * @returns {microPage}
     */
    microPage.init = function (option) {
        option = setOption(option);
        $(option.saveBtn).click(function () {
            var widgetData = microPage.save(),
                data = option.data || {},
                $self = $(this);
            if (!widgetData) {
                return false;
            }
            data.data = JSON.stringify(widgetData);
            $self.prop('disabled', true);
            var index = top.layer.msg('正在保存数据，请稍后...', {
                time: 100000
            });
            $.ajax({
                url: option.serverUrl,
                type: 'post',
                data: data,
                dataType: 'json',
                success: function (res) {
                    if (res.code == 0) {
                        location.href = option.redirectUrl;
                    } else {
                        top.layer.msg(res.msg);
                    }
                },
                error: function () {
                    top.layer.msg('系统异常');
                },
                complete: function () {
                    $self.prop('disabled', false);
                    top.layer.close(index);
                }
            });
        });
        $('.j-newWidget').click(function () {
            widgets.trigger($(this).attr('data-type'), 0);
        });
        $(document).on('click', '.widget-wrap', function () {
            widgetEditing($(this));
        });
        if (pageType == 'cat') {//分类
            widgets.pageCat();
        } else if (pageType == 'personal') {//个人主页

        } else if (pageType == 'public') {//公众广告

        } else if (pageType == 'custom') {//自定义模块
            widgets.pageCustom();
            $widgetsArea.find('.j-newWidget[data-type=component]').parent('li').hide();
        } else {
            widgets.page();
        }
        $previewArea.sortable({containment: "parent", items: ".widget-wrap:not(.j-sort-disabled)"});
        //修改数据
        if (option.editData) {
            this.edit(option.editData);
        }
        return this;
    };

    //保存数据
    microPage.save = function () {
        if (!validate()) {
            return false;
        }
        //保存当前组件数据
        widgetSave($activeWidget.attr('id'));
        var data = [];
        $('.widget-wrap').each(function (i) {
            var type = $(this).attr('data-type'),
                id = $(this).attr('id');
            if (type) {
                if(type=='rich_text'){
                    widgetSave(id);
                }
                var formData = {type: type, data: microPage.data[id]};
                data.push(formData);
            }
        });
        return data;
    };
    //编辑
    microPage.edit = function (data) {
        var i, len = data.length;
        for (i = 0; i < len; i++) {
            var d = data[i], t = d.type, e = t + 'Edit';
            $('.j-newWidget[data-type=' + t + ']').click();
            if (e in widgets && $.isFunction(widgets[e])) {
                widgets[e](d.data);
            }
        }
        //编辑页面信息
        $('#widget_0').click();
    };
    //验证
    function validate() {
        if (pageType == 'public') {
            return true;
        }
        var titleMsg = '请输入页面名称';
        if (pageType == 'cat') {
            titleMsg = '分类名不能为空';
        } else if (pageType == 'custom') {
            titleMsg = '模块名称不能为空';
        }
        if (!$.trim($('#page_title').val())) {
            widgetEditing($('#widget_0'));
            top.layer.msg(titleMsg);
            return false;
        }
        return true;
    }

    //设置活动组件
    function setActive($widget) {
        $activeWidget = $widget;
    }

    //编辑
    function widgetEditing($widget) {
        var $prev = $activeWidget,
            prevId = $prev && $prev.attr('id') || 0,
            curId = $widget.attr('id');
        if ($prev && curId == prevId) {
            return this;
        }
        //保存数据
        $prev && widgetSave(prevId);
        $configArea.find('.j-config').addClass('hide');
        $configArea.find('#config_' + curId).removeClass('hide');
        $('.widget-wrap').removeClass('editing');
        $widget.addClass('editing');
        //计算sidebar位置
        setSidebarPosition($widget);
        $('#config_append_widget').addClass('hide');
        setActive($widget);
    }

    //设置sidebar 位置
    function setSidebarPosition($widget) {
        var top = $widget.position().top;
        if ($widget.attr('id') == 'widget_0') {
            top -= 70;
        }
        $configArea.parent('.sidebar').css('margin-top', top);
    }

    //绑定数据
    function bind($widget, $configTpl, eventCall) {
        var previewId = $widget.attr('id');
        $configTpl.attr('id', 'config_' + previewId).addClass('j-config');
        $configArea.append($configTpl);
        eventCall && $.isFunction(eventCall) && eventCall();
    }

    //添加组件
    function addWidget(previewSelector) {
        var h = '<div class="widget-wrap" id="widget_' + microPage.count + '"><div class="control-group">' + $(previewSelector).html() + '</div>';
        h += '<div class="actions"><div class="actions-wrap"><span class="action j-edit">编辑</span><span class="action j-add">加内容</span><span class="action j-delete">删除</span></div></div>';
        h += '<div class="sort"><i class="fa fa-bars"></i></div></div>';
        var $widget = $(h);
        if ($activeWidget && isAppend) {
            $activeWidget.after($widget);
        } else {
            $previewArea.append($widget);
        }
        widgetEditing($widget);
        //编辑
        $widget.find('.actions span.j-edit,.actions .sort').click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            $configArea.html($widget.data('config'));
            widgetEditing($widget);
        });
        //追加
        $widget.find('.actions  span.j-add').click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            $configArea.find('.j-config').addClass('hide');
            if ($configArea.find('#config_append_widget').length <= 0) {
                var t = $widgetsArea.clone();
                $configArea.append(t.attr('id', 'config_append_widget'));
                //注册事件
                $configArea.find('#config_append_widget .j-newWidget').click(function () {
                    widgets.trigger($(this).attr('data-type'), 1);
                });
            } else {
                $configArea.find('#config_append_widget').removeClass('hide');
            }
        });
        //删除
        $widget.find('.actions  span.j-delete').click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            var $widget = $(this).closest('.widget-wrap'),
                id = $widget.attr('id'),
                $prev = $widget.prev();
            //删除保存的数据
            delete microPage.data[id];
            $activeWidget = null;
            //删除预览
            $('#config_append_widget').addClass('hide');
            $widget.remove();
            widgetEditing($prev);
        });
        return $widget;
    }

    //保存组件数据
    function widgetSave(id) {
        microPage.data[id] = $('#config_' + id).find('form').serialize();
    }

    //页面设置
    widgets.page = function () {
        var $widget = $('#widget_0');
        $widget.append($('#previewPage'));
        var event = function () {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId);
            $config.find('.j-resetBg').on('click', function () {
                var $color = $(this).siblings('.j-bgColor'),
                    defaultBg = $color.attr('data-default');
                $color.val(defaultBg).change();
                $previewArea.css('background-color', defaultBg);
            });
            $config.find('#page_title').keyup(function () {
                $widget.find('.preview-title').text($(this).val());
            });
            $config.find('.j-bgColor').on('change', function () {
                $previewArea.css('background-color', $(this).val());
            });
            $config.find('.j-category').chosen({
                disable_search_threshold: 10,
                no_results_text: "",
                width: "60%"
            });
            $config.find('.j-page-head').change(function () {
                var v = $(this).val();
                $widget.find('.j-page-head').addClass('hide');
                $widget.find('.page-head-' + v).removeClass('hide');
            });
            $config.find('.j_nav_footer').change(function () {
                var v = $(this).val();
                if(v==0){
                    $('.store_footerNav').removeClass('hide');
                }else{
                    $('.store_footerNav').addClass('hide');
                }
            });
            changeRadioCheckboxID($config);
        };
        setActive($widget);
        bind($widget, $('#pageInfoTpl'), event);
        return this;
    };
    //编辑页面信息
    widgets.pageEdit = function (data) {
        var $config = $('#config_widget_' + microPage.count);
        $config.find('#page_title').val(data.title).keyup();
        $config.find('[name=description]').val(data.description);
        $config.find('.j-bgColor').val(data.bg_color).change();
        $config.find('.j_nav_footer[value=' + data.footer_nav + ']').prop('checked', true).change();
        if (data.category) {
            $config.find('.j-category option[value=' + data.category + ']').prop('selected', true).change();
        }
        $config.find('.j-page-head[value=' + data.page_head_style + ']').prop('checked', true).change();
    };
    //微页面分类添加页面
    function addPage($widget, pageTitle, pageID) {
        var configId = 'config_' + $widget.attr('id'),
            $config = $configArea.find('#' + configId),
            preview = '<li><a class="clearfix" href="javascript:void(0);"><span class="custom-nav-title">' + pageTitle + '</span><i class="pull-right fa fa-chevron-right"></i></a></li>',
            $configList = $config.find('.j-page-list'),
            $itemTpl = $configList.find('.j-item').clone(),
            $preList = $widget.find('.j-page-cats');
        $itemTpl.removeClass('j-item hide');
        $preList.append(preview);
        $itemTpl.find('.j-page-id').attr('name', 'page_id[' + pageID + ']').val(pageID);
        $itemTpl.find('.j-name').text(pageTitle);
        $configList.append($itemTpl);
    }

    widgets.pageCat = function () {
        var $tpl = $('#pageCatTpl').clone(),
            $widget = $('#widget_0');
        $widget.html($('#previewPageCat').html());
        setActive($widget);
        function event() {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId),
                $rich = $widget.find('.custom-richtext');
            $config.find('.j-resetBg').on('click', function () {
                var $color = $(this).siblings('.j-bgColor'),
                    defaultBg = $color.attr('data-default');
                $color.val(defaultBg).change();
                $previewArea.css('background-color', defaultBg);
            });
            $config.find('#page_title').keyup(function () {
                $widget.find('.custom-title .title').text($(this).val());
            });
            $config.find('.first_priority').chosen({
                disable_search_threshold: 10,
                width: "95%"
            });
            $config.on('click', '.action.j-delete', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var $item = $(this).closest('.item'),
                    index = $item.index() - 1,
                    pages = $config.data('pages');
                $item.remove();
                delete pages[$item.find('.j-page-id').val()];
                $widget.find('.j-page-cats li').eq(index).remove();
                $config.data('pages', pages);
            });
            $config.find('.j-choose-page').click(function () {
                dropdownLink.pop('/shop/pop/page?show=1', function (layeror, index) {
                    layer.iframeAuto(index);//子页面自适应
                    /** 子页面body对象 */
                    var body = top.layer.getChildFrame('body', index);
                    body.find('.panel-footer').removeClass('hide');
                    /** 获取子页面button对象*/
                    body.find(".j-btn").click(function () {
                        $(this).toggleClass('btn-white j-selected btn-success');
                        if ($(this).hasClass('.j-selected')) {
                            $(this).text('取消');
                        } else {
                            $(this).text('选取');
                        }
                    });
                    body.find('#btnOk').on('click', function () {
                        var pages = $config.data('pages') || {};
                        body.find('.j-btn.j-selected').each(function () {
                            var id = $(this).attr('data-real-id');
                            if (!(id in pages)) {
                                addPage($widget, $(this).attr('data-page-title'), id);
                                pages[id] = id;
                            }
                        });
                        $config.data('pages', pages);
                        top.layer.close(index);
                    });
                });
            });
            var editor = UE.getEditor('cat-desc-editor', editorConfig);
            editor.addListener('contentChange', function () {
                $rich.html(editor.getContent());
            });
        }

        bind($widget, $tpl, event);
        return this;
    };
    widgets.pageCatEdit = function (data) {
        var $config = $('#config_widget_' + microPage.count),
            $widget = $('#widget_' + microPage.count);
        $config.find('#page_title').val(data.title).keyup();
        $config.find('[name=description]').val(data.content);
        if (data.sort_order) {
            $config.find('.first_priority option[value=' + data.sort_order + ']').prop('selected', true).change();
        }
        if (data.page_id) {
            for (var p in data.page_id) {
                var id = data.page_id[p];
                (function (id) {
                    $.get('/shop/page/info/' + id, function (res) {
                        addPage($widget, res.data['title'], id);
                    });
                })(id);
            }
        }
        if (data.content) {
            var editor = UE.getEditor('cat-desc-editor');
            editor.ready(function () {
                editor.setContent(data.content);
                editor.contentchange();
            });
        }
    };
    //自定义模块
    widgets.pageCustom = function () {
        var $configTpl = $('#pageCustomTpl').clone(),
            $widget = $('#widget_0');
        setActive($widget);
        bind($widget, $configTpl, null);
        return this;
    };
    widgets.pagePublicEdit = function (data) {
        var $config = $('#config_widget_' + microPage.count);
        if (data.position) {
            $config.find('.j-show-position[value=' + data.position + ']').prop('checked', true).change();
        }
        if (data.shop_page) {
            $config.find('#show_page0').prop('checked', true).change();
        }
        if (data.shop_page_cat) {
            $config.find('#show_page1').prop('checked', true).change();
        }
        if (data.shop_goods) {
            $config.find('#show_page2').prop('checked', true).change();
        }
        if (data.shop_goods_group) {
            $config.find('#show_page3').prop('checked', true).change();
        }
        if (data.shop_home) {
            $config.find('#show_page4').prop('checked', true).change();
        }
        if (data.shop_personal) {
            $config.find('#show_page5').prop('checked', true).change();
        }
    };
    //进入店铺
    widgets.store = function () {
        var view = '<p>进入店铺</p>',
            $widget = addWidget('#previewStore');
        bind($widget, $(view), null);
        return this;
    };

    //文本导航
    widgets.text_nav = function () {
        var $tpl = $('#textNavTpl').clone();
        dropdownLink.createLink($tpl.find('.j-dropdownBox:last'));
        var $widget = addWidget('#previewTextNav');

        function add($item, index) {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId),
                preview = '<li><a class="clearfix" href="javascript:void(0);"><span class="custom-nav-title">文本导航</span><i class="pull-right fa fa-chevron-right"></i></a></li>',
                $itemTpl = $item.siblings('.j-item').clone(),
                $preList = $widget.find('.j-custom-nav-text'),
                num = $config.data('num') || 1;
            $itemTpl.removeClass('j-item hide');
            if (index > 0) {
                $item.after($itemTpl);
                $preList.find('li').eq(index).after(preview);
            } else {
                $item.before($itemTpl);
                $preList.append(preview);
            }
            dropdownLink.createLink($itemTpl.find('.j-dropdownBox:last'));
            $itemTpl.find('.j-link').attr('name', 'link[' + num + ']');
            $itemTpl.find('.j-title').attr('name', 'title[' + num + ']');
            num++;
            $config.data('num', num);
        }

        function event() {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId);
            //添加
            $config.find('.j-add-item').click(function (e) {
                e.preventDefault();
                e.stopPropagation();
                add($(this).parent(), 0);
            });
            $config.find('form').on('click', '.action.j-add', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var $item = $(this).closest('.item'),
                    index = $item.index() - 1;
                add($item, index);
            }).on('click', '.action.j-delete', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var $item = $(this).closest('.item'),
                    index = $item.index() - 1;
                $item.remove();
                $widget.find('.custom-nav li').eq(index).remove();
            }).on('keyup', '.j-title', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var index = $(this).closest('.item').index() - 1;
                $widget.find('.j-custom-nav-text li').eq(index).find('.custom-nav-title').text($(this).val());
            });
        }

        bind($widget, $tpl, event);
        return this;
    };
    widgets.text_navEdit = function (data) {
        var $config = $('#config_widget_' + microPage.count),
            titles = data.title,
            links = data.link,
            i, len = titles.length,
            $addItem = $config.find('.j-add-item');
        for (i = 0; i < len; i++) {
            if (i != 0) {
                $addItem.click();
            }
            $config.find('.j-title:last').val(titles[i]).change();
            $config.find('.j-link:last').val(links[i]).change();
            //内容
            $('#widget_' + microPage.count).find(".custom-nav-title:last").html(titles[i]);
            //链接
            var link_array = links[i].split('|');
            if(link_array.length>1){
                var $linkTag = $('<div class="pull-left j-tag link-to"><span class="label label-success"></span></div>');
                var $tagLabel = $linkTag.find('span');
                $tagLabel.html(getLinks()[link_array[0]].title);
                $config.find("input[name='link["+i+"]']").after($linkTag);
                $config.find('.dropdown-toggle span:last').html("修改");
            }
        }
    };

    //图片导航
    widgets.image_nav = function () {
        var $tpl = $('#imageNavTpl').clone();
        dropdownLink.createLink($tpl.find('.j-dropdownBox:last'));
        var $widget = addWidget('#previewImageNav');

        function add($item, index) {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId),
                num = $config.data('num') || 1,
                $preList = $widget.find('.j-custom-nav-image'),
                $itemTpl = $item.siblings('.j-item').clone(),
                imgUrl = $preList.attr('data-url'),
                preview = '<li><div class="nav-img-wap"><img src="' + imgUrl + '"></div></li>',
                len = $preList.find('li').length;
            if (len >= 4) {
                top.layer.msg('图文导航最多添加4个');
                $config.find('.j-operation').hide();
                return false;
            }
            $itemTpl.removeClass('j-item hide');
            if (index > 0) {
                $item.after($itemTpl);
                $preList.find('li').eq(index).after(preview);
            } else {
                $item.before($itemTpl);
                $preList.append(preview);
            }
            len++;
            dropdownLink.createLink($itemTpl.find('.j-dropdownBox:last'));
            $preList.removeClass('custom-nav-3 custom-nav-4').addClass('custom-nav-' + len);
            $itemTpl.find('.j-link').attr('name', 'link[' + num + ']');
            $itemTpl.find('.j-title').attr('name', 'title[' + num + ']');
            $itemTpl.find('.j-image').attr('name', 'image_url[' + num + ']');
            num++;
            if (len >= 4) {
                $config.find('.j-operation').hide();
            }
            $config.data('num', num);
        }

        function event() {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId);
            //添加
            $config.find('.j-add-item').click(function () {
                add($(this).parent(), 0);
            });
            $config.find('form').on('click', '.action.j-add', function () {
                var $item = $(this).closest('.item'),
                    index = $item.index() - 1;
                add($item, index);
            }).on('click', '.action.j-delete', function () {
                var $item = $(this).closest('.item'),
                    index = $item.index() - 1,
                    $preList = $widget.find('.j-custom-nav-image');
                $item.siblings('.j-operation').show();
                $item.remove();
                $preList.find('li').eq(index).remove();
                var len = $preList.find('li').length;
                $preList.removeClass('custom-nav-2 custom-nav-3 custom-nav-4').addClass('custom-nav-' + len);
            });
            $config.on('click', '.j-choose-image', function (e) {
                e.stopPropagation();
                e.preventDefault();
                var self = $(this),
                    i = $(this).closest('.item').index() - 1,
                    $li = $widget.find('.j-custom-nav-image li').eq(i);
                dropdownLink.pop('/shop/pop/image', function (layero, index) {
                    layer.iframeAuto(index);//子页面自适应
                    var body = top.layer.getChildFrame('body', index);
                    body.find(".j-choose").on('click', function () {
                        var src = $(this).find('img').attr('src');
                        self.siblings('.j-image').val($(this).attr('data-id'));
                        self.siblings('img').remove();
                        self.after('<img src="' + src + '">');
                        self.text('重新上传').addClass('modify-image');
                        $li.find('img').attr('src', src);
                        top.layer.close(index);
                    });
                    body.find('#btnUploadOk').on('click', function () {
                        var $form = body.find($(this).attr('data-form')),
                            src = $form.find('img').attr('src');
                        self.siblings('.j-image').val($form.find('.j-local').attr('data-id'));
                        self.siblings('img').remove();
                        self.after('<img src="' + src + '">');
                        self.text('重新上传').addClass('modify-image');
                        $li.find('img').attr('src', src);
                        top.layer.close(index);
                    });
                });
            }).on('keyup', '.j-title', function (e) {
                e.stopPropagation();
                e.preventDefault();
                var index = $(this).closest('.item').index() - 1,
                    val = $(this).val(),
                    li = $widget.find('.j-custom-nav-image li').eq(index),
                    $title = li.find('.title');
                if (val) {
                    if (!$title.length) {
                        li.append('<p class="title">' + val + '</p>');
                    } else {
                        $title.text(val);
                    }
                } else {
                    $title.remove();
                }
            });
        }

        bind($widget, $tpl, event);
        return this;
    };
    widgets.image_navEdit = function (data) {
        var $config = $('#config_widget_' + microPage.count),
            $widget = $('#widget_' + microPage.count),
            titles = data.title,
            links = data.link,
            images = data.image_url,
            i, len = titles.length,
            $addItem = $config.find('.j-add-item');
        for (i = 0; i < len; i++) {
            if (i != 0) {
                $addItem.click();
            }
            $config.find('.j-title:last').val(titles[i]).change();
            $config.find('.j-link:last').val(links[i]).change();
            $config.find('.j-image:last').val(images[i]).change();
            var $img = $widget.find('li:last .nav-img-wap img');
            imageUrl($img, images[i]);
            //小预览图
            var $small_img = $config.find('.item-image:last img');
            $config.find('.item-image:last a i').remove();
            $config.find('.item-image:last a').addClass('modify-image').html('重新上传');
            $small_img.css('display','block');
            imageUrl($small_img, images[i]);
            //链接
            var link_array = links[i].split('|');
            if(link_array.length>1){
                var $linkTag = $('<div class="pull-left j-tag link-to"><span class="label label-success"></span></div>');
                var $tagLabel = $linkTag.find('span');
                $tagLabel.html(getLinks()[link_array[0]].title);
                $config.find("input[name='link["+i+"]']").after($linkTag);
                $config.find('.dropdown-toggle span:last').html("修改");
            }
        }
    };
    //关联链接
    widgets.link = function () {
        var $tpl = $('#linkToTpl').clone(),
            $dropdown = dropdownLink.createLink($tpl.find('.j-dropdownBox:last'), '', 1),
            $widget = addWidget('#previewLinkTo'),
            $preList = $widget.find('.j-custom-link-to'),
            configId = 'config_' + $widget.attr('id');
        var choose = function () {
            var $config = $configArea.find('#' + configId),
                tag = $config.find('.j-tag em').text();
            $preList.find('.custom-nav-title').each(function (i) {
                i++;
                $(this).text('第' + i + '条 ' + tag + '的『关联链接』');
            });
        };
        $dropdown.data('choose', choose);

        function event() {
            $config = $configArea.find('#' + configId);
            $config.find('select').chosen({
                disable_search_threshold: 10,
                no_results_text: "",
                width: "50%"
            });
        }

        bind($widget, $tpl, event);
        return this;
    };
    widgets.linkEdit = function (data) {
        var $config = $('#config_widget_' + microPage.count),
            number = data.number || 3,
            link = data.link;
        $config.find('.j-link:last').val(link).change();
        $config.find('.j-num:last option[value=' + number + ']').prop('selected', true).change();
        //链接
        var link_array = link.split('|');
        if(link_array.length>1){
            var $linkTag = $('<div class="pull-left j-tag link-to"><span class="label label-success"></span></div>');
            var $tagLabel = $linkTag.find('span');
            $tagLabel.html(getLinks()[link_array[0]].title);
            $config.find("input[name=link]").after($linkTag);
            $config.find('.dropdown-toggle span:last').html("修改");
        }
        //条数
        $config.find('.chosen-single span:last').html(number+'条');
    };
    //商品显示样式事件
    function goodsShowEvent($preview, $config) {
        //显示类型
        $config.find('.j-goods-size').change(function () {
            var v = parseInt($(this).val(), 10);
            switch (v) {
                case 0:
                    $preview.removeClass('goods-cross goods-detail').addClass('goods-big');
                    break;
                case 2:
                    $preview.removeClass('goods-big goods-detail').addClass('goods-cross');
                    break;
                case 3:
                    $preview.removeClass('goods-big goods-cross').addClass('goods-detail');
                    break;
                default:
                    $preview.removeClass('goods-cross goods-detail goods-big');
                    break;
            }
        });
        //购买按钮
        $config.find('.j-show-buy').change(function () {
            if ($(this).is(':checked')) {
                $preview.find('.goods-buy').show();
                $config.find('.j-buy-styles').show();
            } else {
                $preview.find('.goods-buy').hide();
                $config.find('.j-buy-styles').hide();
            }
        });
        $config.find('.j-goods-buy').change(function () {
            var v = $(this).val();
            $preview.find('.goods-buy .cart-icon').removeClass('cart-icon-2 cart-icon-3 cart-icon-4').addClass('cart-icon-' + v);
        });
        //商品名
        $config.find('.j-show-name').change(function () {
            if ($(this).is(':checked')) {
                $preview.find('.goods-name').show();
            } else {
                $preview.find('.goods-name').hide();
            }
        });
        //价格
        $config.find('.j-show-price').change(function () {
            if ($(this).is(':checked')) {
                $preview.find('.goods-price').show();
            } else {
                $preview.find('.goods-price').hide();
            }
        });
        changeRadioCheckboxID($config);
    }

    //添加预览商品
    function addProduct($preview, $config, id, name, price, thumb) {
        var tpl = '<li class="goods-item">' +
            '<a class="goods-link clearfix" href="javascript:">' +
            '<div class="goods-thumb"><img src="' + thumb + '"></div>' +
            '<div class="goods-info">' +
            '<p class="goods-name">' + name + '</p>' +
            '<p  class="goods-price">' + price + '</p>' +
            '</div><div style="display: block;" class="goods-buy"><i class="cart-icon"></i></div></a></li>';
        $preview.append(tpl);
        var $tpl = $config.find('.j-item').clone();
        $tpl.removeClass('j-item hide');
        $tpl.find('.j-product-id').attr('name', 'product_id[' + id + ']').val(id);
        $tpl.find('.j-product-name').attr('name', 'product_name[' + id + ']').val(name);
        $tpl.find('.j-product-thumb').attr('name', 'product_thumb[' + id + ']').val(thumb);
        $tpl.find('.j-product-price').attr('name', 'product_price[' + id + ']').val(price);
        $tpl.find('.j-thumb').attr('src', thumb);
        $config.find('.goods-list').find('li:last').before($tpl);
        var products = $config.data('products') || {};
        products[id] = id;
        $config.data('products', products);
    }

    //编辑
    function editProduct($config, data) {
        var $showBuy = $config.find('.j-show-buy'),
            $showName = $config.find('.j-show-name'),
            $showPrice = $config.find('.j-show-price');
        $config.find('.j-goods-size[value=' + data.goods_size + ']').prop('checked', true).change();
        $config.find('.j-goods-buy[value=' + data.goods_buy_style + ']').prop('checked', true).change();
        $config.find('.j-goods-num[value=' + data.goods_num + ']').prop('checked', true).change();
        if (data.is_show_buy) {
            $showBuy.prop('checked', true);
        } else {
            $showBuy.prop('checked', false);
        }
        $showBuy.change();
        if (data.is_show_name) {
            $showName.prop('checked', true);
        } else {
            $showName.prop('checked', false);
        }
        $showName.change();
        if (data.is_show_price) {
            $showPrice.prop('checked', true);
        } else {
            $showPrice.prop('checked', false);
        }
        $showPrice.change();
    }

    //商品
    widgets.goods = function () {
        var $tpl = $('#goodsTpl').clone(),
            $widget = addWidget('#previewGoods'),
            $preview = $widget.find('.goods');
        $tpl.find('form').append($('#goodsCommonTpl').html());
        function event() {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId);
            goodsShowEvent($preview, $config);
            $config.on('click', '.action.j-delete', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var $item = $(this).closest('li'),
                    index = $item.index() - 1;
                $item.remove();
                $preview.find('li:not(.j-pre)').eq(index).remove();

            });
            $config.find('.js-add-goods').click(function () {
                dropdownLink.pop('/shop/pop/goods?show=1', function (layeror, index) {
                    layer.iframeAuto(index);//子页面自适应
                    /** 子页面body对象 */
                    var body = top.layer.getChildFrame('body', index);
                    body.find('.panel-footer').removeClass('hide');
                    /** 获取子页面button对象*/
                    body.find(".j-btn").click(function () {
                        $(this).toggleClass('btn-white j-selected btn-success');
                        if ($(this).hasClass('.j-selected')) {
                            $(this).text('取消');
                        } else {
                            $(this).text('选取');
                        }
                    });
                    body.find('#btnOk').on('click', function () {
                        var products = $config.data('products') || {};
                        if (body.find('.j-btn.j-selected').length > 0) {
                            $preview.find('.j-pre').hide();
                        }
                        body.find('.j-btn.j-selected').each(function () {
                            var id = $(this).attr('data-real-id');
                            if (!(id in products)) {
                                var thumb = $(this).attr('data-thumb'),
                                    price = $(this).attr('data-price'),
                                    title = $(this).attr('data-title');
                                addProduct($preview, $config, id, title, price, thumb);
                            }
                        });
                        $config.find('.j-goods-size:checked').change();
                        $config.find('.j-show-buy').change();
                        $config.find('.j-show-name').change();
                        $config.find('.j-show-price').change();
                        $config.find('.j-goods-buy:checked').change();
                        top.layer.close(index);
                    });
                });
            });
        }

        bind($widget, $tpl, event);
        return this;
    };
    widgets.goodsEdit = function (data) {
        var $config = $('#config_widget_' + microPage.count),
            $widget = $('#widget_' + microPage.count),
            $preview = $widget.find('.goods');
        editProduct($config, data);
        if (data.product_id) {
            $preview.find('.j-pre').hide();
            for (var p in data.product_id) {
                var id = data.product_id[p];
                addProduct($preview, $config, id, data.product_name[p] || '', data.product_price[p] || 0.00, data.product_thumb[p]);
            }
        }
        if (data.content) {
            var editor = UE.getEditor('cat-desc-editor');
            editor.ready(function () {
                editor.setContent(data.content);
                editor.contentchange();
            });
        }
    };
    //商品列表
    widgets.goods_list = function () {
        var $configTpl = $('#goodsListTpl').clone(),
            $widget = addWidget('#previewGoods'),
            $preview = $widget.find('.goods');
        $configTpl.find('form').append($('#goodsCommonTpl').html());
        function event() {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId);
            goodsShowEvent($preview, $config);
            $config.find('.j-choose').click(function () {
                var $self = $(this);
                dropdownLink.pop('/shop/pop/goodsCat?show=1', function (layeror, index) {
                    layer.iframeAuto(index);//子页面自适应
                    /** 子页面body对象 */
                    var body = top.layer.getChildFrame('body', index);
                    /** 获取子页面button对象*/
                    body.find(".j-btn").click(function () {
                        $config.find('.j-group').val($(this).attr('data-real-id'));
                        $config.find('.j-group-name').val($(this).attr('data-title'));
                        $config.find('.j-tag').removeClass('hide');
                        $config.find('.j-tag .link-to-tag').text($(this).attr('data-title'));
                        $self.text('修改');
                        top.layer.close(index);
                    });
                });
            });
        }

        bind($widget, $configTpl, event);
        return this;
    };
    widgets.goods_listEdit = function (data) {
        var $config = $('#config_widget_' + microPage.count);
        editProduct($config, data);
        $config.find('.j-group').val(data.product_group_id);
        $config.find('.j-group-name').val(data.product_group_name);
        $config.find('.j-tag').removeClass('hide');
        $config.find('.j-tag .link-to-tag').text(data.product_group_name);
        $config.find('.j-choose').text('修改');
    };
    //添加商品分组
    function addGoodsGroup($preview, $config, group_id, group_name, num) {
        var $tpl = $config.find('.j-item').clone();
        num = num || 12;
        $tpl.removeClass('j-item hide');
        $config.find('.j-list').append($tpl);
        $tpl.removeClass('j-item hide');
        $tpl.find('.j-group-id').attr('name', 'group_id[' + group_id + ']').val(group_id);
        $tpl.find('.j-group-name').attr('name', 'group_name[' + group_id + ']').val(group_name);
        $tpl.find('.j-show-num').attr('name', 'show_num[' + group_id + ']').find('option[value=' + num + ']').prop('selected', true);
        $tpl.find('.j-group-from').text(group_name);
        var groups = $config.data('groups') || {};
        groups[group_id] = group_id;
        $config.data('groups', groups);
    }

    //商品分组
    widgets.goods_group = function () {
        var $tpl = $('#goodsGroupTpl').clone(),
            $widget = addWidget('#previewGoodsGroup'),
            $preview = $widget.find('.goods-group-wrap');
        $groupWrap = $widget.find('.goods-wrap');
        $tpl.find('form').append($('#goodsCommonTpl').html());
        $groupWrap.append($('#previewGoods').html());
        function event() {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId);
            goodsShowEvent($preview, $config);
            $config.on('click', '.action.j-delete', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var $item = $(this).closest('li');
                $item.remove();
            });
            $config.find('.j-group-style').change(function () {
                var v = $(this).val();
                if (v == 'top') {
                    $preview.addClass('goods-group-menu-top');
                } else {
                    $preview.removeClass('goods-group-menu-top');
                }
            });
            $config.find('.j-add-item').click(function () {
                dropdownLink.pop('/shop/pop/goodsCat?show=1', function (layeror, index) {
                    layer.iframeAuto(index);//子页面自适应
                    /** 子页面body对象 */
                    var body = top.layer.getChildFrame('body', index);
                    body.find('.panel-footer').removeClass('hide');
                    /** 获取子页面button对象*/
                    body.find(".j-btn").click(function () {
                        $(this).toggleClass('btn-white j-selected btn-success');
                        if ($(this).hasClass('.j-selected')) {
                            $(this).text('取消');
                        } else {
                            $(this).text('选取');
                        }
                    });
                    body.find('#btnOk').on('click', function () {
                        var products = $config.data('groups') || {};
                        body.find('.j-btn.j-selected').each(function () {
                            var id = $(this).attr('data-real-id');
                            if (!(id in products)) {
                                var thumb = $(this).attr('data-thumb'),
                                    title = $(this).attr('data-title');
                                addGoodsGroup($preview, $config, id, title);
                            }
                        });
                        top.layer.close(index);
                    });
                });
            });
        }

        bind($widget, $tpl, event);
        return this;
    };
    widgets.goods_groupEdit = function (data) {
        var $config = $('#config_widget_' + microPage.count);
        editProduct($config, data);
        $config.find('.j-group-style[value=' + data.group_style + ']').prop('checked', true).change();
        if (data.group_id) {
            for (var p in data.group_id) {
                var id = data.group_id[p];
                addGoodsGroup(null, $config, id, data.group_name[p], data.show_num[p]);
            }
        }
    };
    //商品搜索
    widgets.search = function () {
        var $tpl = $('<p>商品搜索</p>');
        var $widget = addWidget('#previewSearch');
        bind($widget, $tpl, null);
        return this;
    };

    // 魔方
    widgets.cube2 = function () {
        var $tpl = $('#cube2Tpl').clone(),
            $widget = addWidget('#previewCobe2');

        // 魔方初始化（第一次编辑）
        // 两部分，1：按照给定的初始点、行数、列数，生成原始魔方模型
        //        2：根据现有已被选定的坐标点，重算第一步中需要删除的模块)
        //---------------------------------初始化原型start------------------------
        function initArgv(param) {
            var x_y = 4;
            param = parseInt(param, 10);
            switch (param) {
                case 1:
                    x_y = 3;
                    break;
                case 2:
                    x_y = 2;
                    break
                case 3:
                    x_y = 1;
                    break;
            }
            return x_y;
        }
        function cubeInit (x, y) {
            var cube_x = 4, cube_y = 4, cube_str = '';
            cube_x = initArgv(x);
            cube_y = initArgv(y);

            for(var i_x= 1; i_x <= cube_x; i_x++ ) {
                var cobe_flag_x = parseInt(x, 10) + parseInt(i_x, 10) - 1;
                cube_str += '<ul class="layout-cols layout-cols-'+ i_x +'">';
                for(var i_y = 1; i_y <= cube_y; i_y++ ) {
                    var cobe_flag_y = parseInt(y, 10) + parseInt(i_y, 10) - 1,
                        cobe_flag = cobe_flag_x + '_' + cobe_flag_y;
                    cube_str += '<li data-cols='+ i_x + ' data-rows='+ i_y +' cobe_flag='+cobe_flag+'></li>';
                }
                cube_str += '</ul>';
            }
            return cube_str;
        }
        //---------------------------------初始化原型end------------------------
        // 根据第一次编辑获取的用户选择重新编辑底板魔方用于显示选中区域
        //---------------------------------重算删除区域start------------------------
        function refactorCube(x, y) {
            var chunk_region=$widget.data('chunk_region') || [];
            var length = chunk_region.length, remove_region = [];
            if(length > 0) {
                var end_y = 0,//Y轴上终点
                    chunk_min_area = {};//已选区域每列上最小坐标点
                for (var i = 0; i < length; i++) {
                    var region_one = chunk_region[i];
                    if (x == region_one[0] && y<region_one[1]){
                        if (end_y == 0) {
                            end_y = region_one[1];
                        }
                        if (region_one[1] < end_y) {
                            end_y = region_one[1];
                        }
                    }
                    if(x<=region_one[0] && y<=region_one[1]){
                        if(region_one[0] in chunk_min_area){
                            if(region_one[1]<chunk_min_area[region_one[0]][1]){
                                chunk_min_area[region_one[0]]=region_one;
                            }
                        }else{
                            chunk_min_area[region_one[0]]=region_one;
                        }
                    }
                }
                // 计算需要删除的区域
                if(end_y > 0) {
                    for(var i_y=end_y; i_y<= 3; i_y++) {
                        for(var i_x=x; i_x<=3; i_x++) {
                            var prepare_add = i_x+'_'+i_y;
                            if($.inArray(prepare_add, remove_region) == -1) {
                                remove_region.push(prepare_add);
                            }
                        }
                    }
                }
                for(var p in chunk_min_area){
                    if(chunk_min_area.hasOwnProperty(p)){
                        var start_x=chunk_min_area[p][0],
                            start_y=chunk_min_area[p][1];
                        for(var i_y=start_y; i_y<= 3; i_y++) {
                            for (var i_x = start_x; i_x <= 3; i_x++) {
                                var prepare_add = i_x + '_' + i_y;
                                if ($.inArray(prepare_add, remove_region) == -1) {
                                    remove_region.push(prepare_add);
                                }
                            }
                        }
                    }
                }
            }
            return remove_region;
        }
        //---------------------------------重算删除区域end------------------------
        // 根据弹出框选中部分重新标记魔方底板
        // -------------------------------重绘底板start----------------------------
        function markRegion(config, x, y, col_num, row_num) {
            if(!config || x<0 || x>3 || y<0 || y>3 || col_num<1 || col_num>4 || row_num<1 || row_num>4)
                return false;
            var chunk_region=$widget.data('chunk_region') || [];
            //终点坐标
            var x2=parseInt(x,10)+parseInt(col_num,10),
                y2=parseInt(y,10)+parseInt(row_num,10);

            config.find('.empty').each(function(){
                var data_x = $(this).attr('data-x'), data_y = $(this).attr('data-y');
                if(data_x == x && data_y == y) {
                    $(this).removeClass('empty');
                    $(this).addClass('not_empty');
                    $(this).addClass('cols_'+col_num);
                    $(this).addClass('rows_'+row_num);
                    $(this).css({'height': 60*row_num, 'width': 60*col_num})
                    $(this).addClass('cube_chunk_num_'+ x +'_'+ y);
                    this.colSpan = col_num;
                    this.rowSpan = row_num;
                    var color = '#'+(Math.random()*0xffffff<<0).toString(16);
                    $(this).css('background', color);
                    $(this).text(160*col_num+'*'+160*row_num);

                    // 添加隐藏项
                    var style = $(this).attr('style');
                    var hidden_str = '<input type="hidden" name="startcoord[]" value="'+x+'_'+y+'" />'+
                        '<input type="hidden" name="colrow[]" value="'+col_num+'_'+row_num+'" />'+
                        '<input type="hidden" name="style[]" value="'+style+'" />'+
                        '<input type="hidden" name="image[]" value="" />'+
                        '<input type="hidden" name="link[]" value="" />';
                    $(this).prepend(hidden_str);

                    chunk_region.push([x,y]);
                } else if(x <= data_x && data_x < x2 && y <= data_y && data_y < y2) {
                    $(this).remove();
                    chunk_region.push([data_x, data_y]);
                }
            });
            $widget.data('chunk_region',chunk_region);
        }
        // -------------------------------重绘底板end----------------------------

        // 根据现有的选中区域添加图片选择区域
        //---------------------------------添加图片选择区域start------------------------
        function initImageOption(configDom, x, y, row, col) {
            var style = configDom.find('.cube_chunk_num_'+ x +'_'+ y).attr('style');
            var imageOption_str = '<li class="item clearfix">'+
                                    '<div class="item-image" title="建议图片尺寸'+ 160*col +'*'+160*row+'">'+
                                        '<a class="add-image j-choose-image" href="javascript: void(0);">'+
                                            '<i class="fa fa-plus add-icon"></i> 添加图片'+
                                        '</a>'+
                                         '<img class="preview_img"/>'+
                                    '</div>'+
                                    '<div class="item-content">'+
                                        '<div class="control-group">'+
                                            '<label class="control-label">链接：</label>'+
                                            '<div class="controls clearfix j-dropdownBox">'+
                                                '<input type="hidden" class="j-link"/>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="actions">'+
                                        '<span class="action j-cube-delete" title="删除"><i class="fa fa-close"></i></span>'+
                                        '<input class="cube_del_start" value="'+x+'_'+y+'" type="hidden">'+
                                        '<input class="cube_del_row" value="'+row+'" type="hidden">'+
                                        '<input class="cube_del_col" value="'+col+'" type="hidden">'+
                                        '<input class="cube_del_style" value="'+style+'" type="hidden">'+
                                    '</div>'+
                                '</li>';
            return imageOption_str;
        }
        //---------------------------------添加图片选择区域end------------------------
        // ________________________________预览区图片处理start------------------------
        function previewImageHandle(widgetDom, x, y, col_num, row_num, image_url) {
            if(!widgetDom || x<0 || x>3 || y<0 || y>3 || col_num<1 || col_num>4 || row_num<1 || row_num>4)
                return false;

            //终点坐标
            var x2=parseInt(x,10)+parseInt(col_num,10),
                y2=parseInt(y,10)+parseInt(row_num,10);

            var pre_image_url = widgetDom.find('.cube_preview_chunk_num_'+ x +'_'+ y).find('img').attr('src');
            if(typeof(pre_image_url) != "undefined") {
                widgetDom.find('.cube_preview_chunk_num_'+ x +'_'+ y).html('<img src="' + image_url + '">');
            } else {
                widgetDom.find('.preview_cube').each(function(){
                    var data_x = $(this).attr('data-x'), data_y = $(this).attr('data-y');
                    if(data_x == x && data_y == y) {
                        $(this).removeClass('preview_cube');
                        $(this).addClass('not_preview_cube');
                        $(this).addClass('preview_cols_'+col_num);
                        $(this).addClass('preview_rows_'+row_num);
                        $(this).css({'height': 77*row_num, 'width': 77*col_num})
                        $(this).addClass('cube_preview_chunk_num_'+ x +'_'+ y);
                        this.colSpan = col_num;
                        this.rowSpan = row_num;
                        $(this).html('<img src="' + image_url + '">');
                    } else if(x <= data_x && data_x < x2 && y <= data_y && data_y < y2) {
                        $(this).remove();
                    }
                });
            }
        }
        // --------------------------------预览区图片处理end--------------------------
        // --------------------------------选中区域重新编辑处理start------------------------
            function reeditCheckedArea(Dom, x, y, col, row, type) {
                if(!Dom || x<0 || x>3 || y<0 || y>3 || col<1 || col>4 || row<1 || row>4
                    || (type != 'config' && type != 'widget'))
                    return false;

                // 判断是否需要删除预览区域
                if(type == 'widget') {
                    var preview_chunk_num = Dom.find('.cube_preview_chunk_num_'+x+'_'+y).find('img').attr('src');
                    if(typeof(preview_chunk_num) == "undefined" || preview_chunk_num == '') {
                        return false;
                    }
                }

                // 重新处理选中区域
                var end_row = parseInt(y, 10) + parseInt(row, 10);
                var end_col = parseInt(x, 10) + parseInt(col, 10);
                var del_chunk_region = [];
                Dom.find('tr').each(function () {
                    var tr_num = $(this).index();
                    // 生成插入项，备用
                    if(tr_num >= y && tr_num < end_row) {
                        var td_str = ''
                        for (var col_num = x; col_num < end_col; col_num++) {
                            if(type == 'config') {
                                td_str += '<td class="empty" data-x="'+ col_num +'" data-y="'+ tr_num +'"></td>';
                            } else {
                                td_str += '<td class="preview_cube" data-x="'+ col_num +'" data-y="'+ tr_num +'"><img src=""></td>';
                            }

                            del_chunk_region.push([col_num, tr_num]);
                        }
                        // 重算插入位置
                        var insert_start_flag = -1, insert_end_flag = -1;
                        $(this).children().each(function () {
                            var data_x_flag = $(this).attr('data-x');
                            if(data_x_flag < x) {
                                if(insert_start_flag == -1) {
                                    insert_start_flag = data_x_flag;
                                } else if (data_x_flag > insert_start_flag) {
                                    insert_start_flag = data_x_flag;
                                }
                            }
                            if(data_x_flag >= end_col) {
                                if(insert_end_flag == -1) {
                                    insert_end_flag = data_x_flag;
                                } else if (data_x_flag < insert_end_flag) {
                                    insert_end_flag = data_x_flag;
                                }
                            }
                        });
                        // 插入处理
                        if(insert_start_flag == -1 && insert_end_flag == -1) {
                            $(this).prepend(td_str);
                        } else {
                            $(this).children().each(function () {
                                var insert_flag = $(this).attr('data-x');
                                if(insert_start_flag != -1) {
                                    if(insert_flag == insert_start_flag) {
                                        $(this).after(td_str);
                                    }
                                } else {
                                    if(insert_end_flag != -1) {
                                        if(insert_flag == insert_end_flag) {
                                            $(this).before(td_str);
                                        }
                                    }
                                }
                            });
                        }
                    }
                });
                if(type == 'config') {
                    Dom.find('.cube_chunk_num_'+x+'_'+y).remove();
                } else {
                    Dom.find('.cube_preview_chunk_num_'+x+'_'+y).remove();
                }
                return del_chunk_region;
            }
        // --------------------------------选中区域重新编辑处理end--------------------------

        function event() {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId),
                $preList = $widget.find('.j-custom-cube_preview');

            // 选中处理(添加选中背景)
            $config.on('mouseenter','.empty',function(){
                $(".help-desc").css({"font-size":"15px", "opacity": "1"});
            }).on('mouseleave','.empty',function(){
                $(".help-desc").css({"font-size":"12px", "opacity": "0.6"});
            }).on('mouseup','.empty',function(e){
                e.stopPropagation();
                e.preventDefault();
                var chunk_region=$widget.data('chunk_region') || [];
                var self = $(this),
                    x = $(this).attr("data-x"),
                    y = $(this).attr("data-y");
                if(!$.isNumeric(x) || x > 3 || x < 0 || !$.isNumeric(y) || y < 0 || y > 3) return false;

                // 判断是否为选中项
                for(var i=0; i< chunk_region.length; i++) {
                    if(chunk_region[i][0] == x && chunk_region[i][1] == y) return false;
                }
                // 弹出选定区域及其选择后的处理事件
                layer.open({
                    title: '布局选择',
                    type: 1,
                    area: ['550px', '400px'],
                    content: '<div class="modal-body j-cube-layout" data_index = 1></div>',
                    success: function(layero, index){
                        // 初始化魔方原型
                        var cube_html = cubeInit(x, y);
                        $('.j-cube-layout').append(cube_html);
                        // 重算魔方区域
                        if(chunk_region.length > 0) {
                            var remove_region = refactorCube(x, y);
                            if(remove_region.length > 0) {
                                $('.j-cube-layout').find("li").each(function () {
                                    var remove_flag = $(this).attr('cobe_flag');
                                    for(var i=0; i<remove_region.length; i++){
                                        if(remove_flag == remove_region[i]) {
                                            $(this).remove();
                                        }
                                    }
                                });
                            }
                        }
                        $widget.data('chunk_region', chunk_region);
                        // 处理弹出框选择事件
                        $('.j-cube-layout').find("li").mousemove(function(){
                            var col_flag = $(this).attr('data-cols'), row_flag = $(this).attr('data-rows');
                            $("li").each(function(){
                                var col = $(this).attr('data-cols'), row = $(this).attr('data-rows');
                                if(col <= col_flag && row <= row_flag) {
                                    $(this).addClass('selected');
                                } else {
                                    $(this).removeClass('selected');
                                }
                            });
                        }).mouseup(function(){
                            layer.close(index);
                            var col = $(this).attr('data-cols'), row = $(this).attr('data-rows');
                            markRegion($config, x, y, col, row);

                            $config.find('.j-cube-delete').parent().parent().remove();
                            var image_option_area = initImageOption($config, x, y, row, col);
                            $config.find('.cube_choices').append(image_option_area);
                            dropdownLink.createLink($tpl.find('.j-dropdownBox:last'));
                        });
                    }
                });
            });

            // 选中区域处理(添加图片)
            $config.on('click', '.j-choose-image', function (e) {
                e.stopPropagation();
                e.preventDefault();

                var self = $(this),
                    chunk_image_coord = $config.find('.cube_del_start').val(),
                    col_num = $config.find('.cube_del_col').val(),
                    row_num = $config.find('.cube_del_row').val(),
                    style = $config.find('.cube_del_style').val();
                var x_y = chunk_image_coord.split('_'),
                    x = x_y[0],
                    y = x_y[1];

                dropdownLink.pop('/shop/pop/image', function (layero, index) {
                    layer.iframeAuto(index);//子页面自适应
                    var body = top.layer.getChildFrame('body', index);
                    body.find(".j-choose").on('click', function () {
                        var src = $(this).find('img').attr('src'),
                            image_data_id = $(this).attr('data-id');
                        $config.find('.j-image').remove();
                        var image_hidden = '<input class="j-image" cube_image_data_id="'+image_data_id+'"  value="'+ src +'" type="hidden">';
                        self.after(image_hidden);
                        self.siblings('img').remove();
                        self.after('<img src="' + src + '">');
                        self.text('重新上传').addClass('modify-image');
                        $config.find('.cube_chunk_num_'+chunk_image_coord).text('');
                        $config.find('.cube_chunk_num_'+chunk_image_coord).append('<img src="' + src + '" data_id="'+image_data_id+'">');

                        // 预览区添加图片
                        previewImageHandle($preList, x, y, col_num, row_num, src);

                        // 添加隐藏项
                        var hidden_str = '<input type="hidden" name="startcoord[]" value="'+chunk_image_coord+'" />'+
                            '<input type="hidden" name="colrow[]" value="'+col_num+'_'+row_num+'" />'+
                            '<input type="hidden" name="style[]" value="'+style+'" />'+
                            '<input type="hidden" name="image[]" value="'+image_data_id+'" />'+
                            '<input type="hidden" name="link[]" value="" />';
                        $config.find('.cube_chunk_num_'+chunk_image_coord).prepend(hidden_str);

                        top.layer.close(index);
                    });
                    body.find('#btnUploadOk').on('click', function () {
                        var $form = body.find($(this).attr('data-form')),
                            src = $form.find('img').attr('src'),
                            image_data_id = $form.find('.j-local').attr('data-id');
                        $config.find('.j-image').remove();
                        var image_hidden = '<input  class="j-image" cube_image_data_id="'+image_data_id+'" value="'+ src +'" type="hidden">';
                        self.after(image_hidden);
                        self.siblings('img').remove();
                        self.after('<img src="' + src + '">');
                        self.text('重新上传').addClass('modify-image');
                        $config.find('.cube_chunk_num_'+chunk_image_coord).text('');
                        $config.find('.cube_chunk_num_'+chunk_image_coord).append('<img src="' + src + '" data_id="'+image_data_id+'">');

                        // 预览区域图片处理
                        previewImageHandle($preList, x, y, col_num, row_num, src);

                        // 添加隐藏项
                        var hidden_str = '<input type="hidden" name="startcoord[]" value="'+chunk_image_coord+'" />'+
                            '<input type="hidden" name="colrow[]" value="'+col_num+'_'+row_num+'" />'+
                            '<input type="hidden" name="style[]" value="'+style+'" />'+
                            '<input type="hidden" name="image[]" value="'+image_data_id+'" />'+
                            '<input type="hidden" name="link[]" value="" />';
                        $config.find('.cube_chunk_num_'+chunk_image_coord).prepend(hidden_str);

                        top.layer.close(index);
                    });
                });
            });

            // 选中区域删除事件
            $config.on('click', '.j-cube-delete', function (e) {
                e.stopPropagation();
                e.preventDefault();
                var chunk_region=$widget.data('chunk_region') || [];
                var self = $(this),
                    chunk_image_coord = $config.find('.cube_del_start').val(),
                    row = $config.find('.cube_del_row').val(),
                    col = $config.find('.cube_del_col').val(),
                    del_chunk_region = [];
                self.parent().parent().remove();

                // 重新处理已选中区域
                var x_y = chunk_image_coord.split('_');
                var x = x_y[0], y = x_y[1];
                del_chunk_region = reeditCheckedArea($config, x, y, col, row, 'config');
                reeditCheckedArea($preList, x, y, col, row, 'widget');

                var length = del_chunk_region.length;
                if(length > 0) {
                    for (var i=0; i<length; i++) {
                        var del_chunk = del_chunk_region[i];
                        for (var i_chunk=0; i_chunk < chunk_region.length; i_chunk++) {
                            if(chunk_region[i_chunk][0] == del_chunk[0] && chunk_region[i_chunk][1] == del_chunk[1]) {
                                chunk_region.splice(i_chunk, 1);
                            }
                        }
                    }
                }
                $widget.data('chunk_region', chunk_region);
            });

            // 选择区域切换事件
            $config.on('click', '.not_empty', function (e) {
                e.stopPropagation();
                e.preventDefault();
                var x = $(this).attr('data-x'),
                    y = $(this).attr('data-y'),
                    row = $(this).attr('rowspan'),
                    col = $(this).attr('colspan'),
                    pre_image_flag = $config.find('.cube_del_start').val();

                // 判断是否为当前
                if(pre_image_flag == x+'_'+y) {
                    return false;
                }
                // 去除当前的显示区
                $config.find('.cube_choices li').remove();

                var x = $(this).attr('data-x'),
                    y = $(this).attr('data-y'),
                    row = $(this).attr('rowspan'),
                    col = $(this).attr('colspan');

                var image_option_area = initImageOption($config, x, y, row, col);
                $config.find('.cube_choices').append(image_option_area);
                dropdownLink.createLink($tpl.find('.j-dropdownBox:last'));

                var src = $(this).find('img').attr('src'),
                    image_data_id = $(this).find('img').attr('data_id');
                if(typeof(src) != "undefined" && src != '') {
                    $config.find('.j-image').remove();
                    var image_hidden = '<input class="j-image" cube_image_data_id="'+image_data_id+'" value="'+ src +'" type="hidden">';
                    $config.find('.j-choose-image').after(image_hidden);
                    $config.find('.j-choose-image').siblings('img').remove();
                    $config.find('.j-choose-image').after('<img src="' + src + '">');
                    $config.find('.j-choose-image').text('重新上传').addClass('modify-image');
                }

                // 清除链接
                // $config.find('.cube_link_'+x+'_'+y).prev().val('');
                // $config.find('.cube_link_'+x+'_'+y).remove();
                var link_array = $config.find('.cube_link_'+x+'_'+y).val().split('|');
                if(link_array.length>1){
                    var $linkTag = $('<div class="pull-left j-tag link-to"><span class="label label-success"></span></div>');
                    var $tagLabel = $linkTag.find('span');
                    $tagLabel.html(getLinks()[link_array[0]].title);
                    $config.find(".dropdown").before($linkTag);
                    $config.find('.dropdown-toggle span:last').html("修改");
                }
            });
            // 链接处理事件
            $config.on('change', '.j-link', function (e) {
                e.stopPropagation();
                e.preventDefault();

                var chunk_coord = $config.find('.cube_del_start').val(),
                    col_num = $config.find('.cube_del_col').val(),
                    row_num = $config.find('.cube_del_row').val(),
                    style = $config.find('.cube_del_style').val(),
                    image_data_id = $config.find('.j-image').attr('cube_image_data_id'),
                    src = $config.find('.j-image').val(),
                    link = $config.find('.j-link').val();

                if(typeof(src) == "undefined" || typeof(image_data_id) == "undefined") {
                    image_data_id = '';
                    src = '';
                    $config.find('.cube_chunk_num_'+chunk_coord).text(160*col_num+'*'+160*row_num);
                } else {
                    $config.find('.cube_chunk_num_'+chunk_coord).text('');
                }

                $config.find('.cube_chunk_num_'+chunk_coord).append('<img src="' + src + '" data_id="'+image_data_id+'">');
                // 添加隐藏项
                var hidden_str = '<input type="hidden" name="startcoord[]" value="'+chunk_coord+'" />'+
                    '<input type="hidden" name="colrow[]" value="'+col_num+'_'+row_num+'" />'+
                    '<input type="hidden" name="style[]" value="'+style+'" />'+
                    '<input type="hidden" name="image[]" value="'+image_data_id+'" />'+
                    '<input type="hidden" name="link[]" value="'+link+'" />'+
                    '<input type="hidden" class="cube_link_'+chunk_coord+'" value="'+link+'" />';

                $config.find('.cube_chunk_num_'+chunk_coord).prepend(hidden_str);
            });

        }
        
        bind($widget, $tpl, event);
        return this;
    };
    widgets.cube2Edit = function (data) {
        var $config = $('#config_widget_' + microPage.count),
            $widget = $('#widget_' + microPage.count);
        if(typeof(data.startcoord) == 'undefined') {
            $widget.data('chunk_region',[]);
            return false;
        }

        var startcoord = data.startcoord,
            colrow = data.colrow,
            images = data.image,
            link = data.link,
            style = data.style,
            len = startcoord.length,
            chunk_region = [];

        // 处理显示页面
        for(var i=0; i<len; i++) {
            var x_y = startcoord[i].split('_'),
                col_row = colrow[i].split('_'),
                image_one = images[i],
                link_one = link[i],
                style_one = style[i];

            var x = x_y[0],
                y = x_y[1],
                col_num = col_row[0],
                row_num = col_row[1];
            //终点坐标
            var x2 = parseInt(x,10)+parseInt(col_num,10),
                y2 = parseInt(y,10)+parseInt(row_num,10);

            // 预览区域处理
            $widget.find('.preview_cube').each(function(){
                var data_x = $(this).attr('data-x'), data_y = $(this).attr('data-y');
                if(data_x == x && data_y == y) {
                    $(this).removeClass('preview_cube');
                    $(this).addClass('not_preview_cube');
                    $(this).addClass('preview_cols_'+col_num);
                    $(this).addClass('preview_rows_'+row_num);
                    $(this).css({'height': 77*row_num, 'width': 77*col_num})
                    $(this).addClass('cube_preview_chunk_num_'+ x +'_'+ y);
                    this.colSpan = col_num;
                    this.rowSpan = row_num;
                    var img =  $(this).find('img');
                    imageUrl(img, images[i]);
                } else if(x <= data_x && data_x < x2 && y <= data_y && data_y < y2) {
                    $(this).remove();
                }
            });
            // 设计区域处理
            var pre_style = style_one.split(';');
            var background_style_tmp = pre_style[2];
            var background_style = background_style_tmp.split(':');

            $config.find('.empty').each(function(){
                var data_x = $(this).attr('data-x'), data_y = $(this).attr('data-y');
                if(data_x == x && data_y == y) {
                    $(this).removeClass('empty');
                    $(this).addClass('not_empty');
                    $(this).addClass('cols_'+col_num);
                    $(this).addClass('rows_'+row_num);
                    $(this).addClass('cube_chunk_num_'+ x +'_'+ y);
                    this.colSpan = col_num;
                    this.rowSpan = row_num;
                    $(this).css({'height': 60*row_num, 'width': 60*col_num, 'background': background_style[1]});
                    $(this).append('<img src="" data_id="'+image_one+'">');
                    var img =  $(this).find('img');
                    imageUrl(img, image_one);
                    if(typeof(image_one) == "undefined" || image_one == '') {
                        $(this).text(160*col_num+'*'+160*row_num);
                    }

                    // 添加隐藏项
                    var hidden_str = '<input type="hidden" name="startcoord[]" value="'+x+'_'+y+'" />'+
                        '<input type="hidden" name="colrow[]" value="'+col_num+'_'+row_num+'" />'+
                        '<input type="hidden" name="style[]" value="'+style_one+'" />'+
                        '<input type="hidden" name="image[]" value="'+image_one+'" />'+
                        '<input type="hidden" name="link[]" value="'+link_one+'" />'+
                        '<input type="hidden" class="cube_link_'+x+'_'+y+'" value="'+link_one+'" />';
                    $(this).prepend(hidden_str);

                    chunk_region.push([x,y]);
                } else if(x <= data_x && data_x < x2 && y <= data_y && data_y < y2) {
                    $(this).remove();
                    chunk_region.push([data_x, data_y]);
                }
            });
        }
        $widget.data('chunk_region',chunk_region);
    };

    //标题
    widgets.title = function () {
        var $tpl = $('#titleTpl').clone(),
            $widget = addWidget('#previewTitle'),
            $preview = $widget.find('.j-custom-title');
        dropdownLink.createLink($tpl.find('.j-dropdownBox:last'));
        var event = function () {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId),
                $style1 = $config.find('.j-style1'),
                $style2 = $config.find('.j-style2');
            $config.find('.j-resetBg').on('click', function () {
                var $color = $(this).siblings('.j-bgColor'),
                    defaultBg = $color.attr('data-default');
                $color.val(defaultBg).change();
                $preview.css('background-color', defaultBg);
            });
            changeRadioCheckboxID($config);
            //标题
            $config.find('.j-title').on('keyup', function () {
                $preview.find('h2.title').text($(this).val());
            });
            //副标题
            $config.find('.j-sub-title').on('keyup', function () {
                $preview.find('.j-style1').text($(this).val());
            });
            //显示样式
            $config.find('.j-title-show-method').change(function () {
                var v = $(this).val();
                if (v == 1) {
                    $style1.addClass('hide');
                    $style2.removeClass('hide');
                    $preview.find('.j-style2').removeClass('hide');
                    $preview.find('.j-style1').addClass('hide');
                    $preview.css('background-color', 'transparent');
                } else {
                    $style2.addClass('hide');
                    $style1.removeClass('hide');
                    $preview.find('.j-style2').addClass('hide');
                    $preview.find('.j-style1').removeClass('hide');
                    $preview.css('background-color', $preview.data('bg'));
                }
            });
            //对齐方式
            $config.find('.j-title-align').change(function () {
                var v = $(this).val();
                if (v == 1) {
                    $preview.removeClass('text-right').addClass('text-center');
                } else if (v == 2) {
                    $preview.removeClass('text-center').addClass('text-right');
                } else {
                    $preview.removeClass('text-center text-right');
                }
            });
            //背景色
            $config.find('.j-bgColor').on('change', function () {
                $preview.css('background-color', $(this).val());
                $preview.data('bg', $(this).val());
            });
            //日期
            $config.find('.j-date').on('keyup', function () {
                $preview.find('.sub_title_date.j-style2').text($(this).val());
            });
            //作者
            $config.find('.j-author').on('keyup', function () {
                $preview.find('.sub_title_author').text($(this).val());
            });
            //链接标题
            $config.find('.j-link-title').on('keyup', function () {
                $preview.find('.sub_title_link').text($(this).val());
            });
        };

        bind($widget, $tpl, event);
        return this;
    };
    widgets.titleEdit = function (data) {
        var $config = $('#config_widget_' + microPage.count);
        $config.find('.j-title').val(data.title).keyup();
        $config.find('.j-sub-title').val(data.sub_title).keyup();
        $config.find('.j-date').val(data.date).keyup();
        $config.find('.j-author').val(data.author).keyup();
        $config.find('.j-link').val(data.link);
        $config.find('.j-link-title').val(data.link_title).keyup();
        $config.find('.j-title-show-method[value=' + data.show_method + ']').prop('checked', true).change();
        $config.find('.j-title-align[value=' + data.text_align + ']').prop('checked', true).change();
        $config.find('.j-bgColor').val(data.bg_color).change();
    };
    //图片广告
    widgets.image_ad = function () {
        var $tpl = $('#imageAdTpl').clone();
        dropdownLink.createLink($tpl.find('.j-dropdownBox:last'));
        var $widget = addWidget('#previewImageAd');

        function add($item, index) {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId),
                num = $config.data('num') || 1,
                $preList = $widget.find('.j-custom-image-ad'),
                $itemTpl = $item.siblings('.j-item').clone(),
                imgUrl = $preList.attr('data-url'),
                $preNavList = $widget.find('.j-custom-image-ad-nav'),
                preview = '<li><img src="' + imgUrl + '"></li>';
            $itemTpl.removeClass('j-item hide');
            if (index > 0) {
                $item.after($itemTpl);
                $preList.find('li').eq(index).after(preview);
            } else {
                $item.before($itemTpl);
                $preList.append(preview);
            }
            $preNavList.append(' <li>');
            dropdownLink.createLink($itemTpl.find('.j-dropdownBox:last'));
            $itemTpl.find('.j-link').attr('name', 'link[' + num + ']');
            $itemTpl.find('.j-title').attr('name', 'title[' + num + ']');
            $itemTpl.find('.j-image').attr('name', 'image_url[' + num + ']');
            num++;
            $config.data('num', num);
        }

        function event() {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId),
                $preList = $widget.find('.j-custom-image-ad'),
                $preNavList = $widget.find('.j-custom-image-ad-nav');
            changeRadioCheckboxID($config);
            //添加
            $config.find('.j-add-item').click(function () {
                add($(this).parent(), 0);
            });
            $config.find('form').on('click', '.action.j-add', function () {
                var $item = $(this).closest('.item'),
                    index = $item.index() - 1;
                add($item, index);
            }).on('click', '.action.j-delete', function () {
                var $item = $(this).closest('.item'),
                    index = $item.index() - 1;
                $item.remove();
                $preList.find('li').eq(index).remove();
                $preNavList.find('li').eq(index).remove();
            });
            //显示方式
            $config.find('.j-show-method').change(function () {
                var v = $(this).val(),
                    $sizeBox = $config.find('.j-size-box');
                if (v == 1) {
                    $sizeBox.show();
                    $preList.removeClass('carousel');
                    $preNavList.hide();
                } else {
                    $config.find('#size_1').click().change();
                    $sizeBox.hide();
                    $preList.addClass('carousel');
                    $preNavList.show();
                }
            });
            //显示大小
            $config.find('.j-show-size').change(function () {
                var v = $(this).val(),
                    $sizeBox = $config.find('.j-size-box');
                if (v == 0) {
                    $preList.addClass('custom-image-small');
                } else {
                    $preList.removeClass('custom-image-small');
                }
            });
            //选择图片
            $config.on('click', '.j-choose-image', function (e) {
                e.stopPropagation();
                e.preventDefault();
                var self = $(this),
                    i = $(this).closest('.item').index() - 1,
                    $li = $preList.find('li').eq(i);
                dropdownLink.pop('/shop/pop/image', function (layero, index) {
                    layer.iframeAuto(index);//子页面自适应
                    var body = top.layer.getChildFrame('body', index);
                    body.find(".j-choose").on('click', function () {
                        var src = $(this).find('img').attr('src');
                        self.siblings('.j-image').val($(this).attr('data-id'));
                        self.siblings('img').remove();
                        self.after('<img src="' + src + '">');
                        self.text('重新上传').addClass('modify-image');
                        $li.find('img').attr('src', src);
                        top.layer.close(index);
                    });
                    body.find('#btnUploadOk').on('click', function () {
                        var $form = body.find($(this).attr('data-form')),
                            src = $form.find('img').attr('src');
                        self.siblings('.j-image').val($form.find('.j-local').attr('data-id'));
                        self.siblings('img').remove();
                        self.after('<img src="' + src + '">');
                        self.text('重新上传').addClass('modify-image');
                        $li.find('img').attr('src', src);
                        top.layer.close(index);
                    });
                });
            }).on('keyup', '.j-title', function (e) {
                e.stopPropagation();
                e.preventDefault();
                var index = $(this).closest('.item').index() - 1,
                    val = $(this).val(),
                    li = $preList.find('li').eq(index),
                    $title = li.find('.title');
                if (val) {
                    if (!$title.length) {
                        li.append('<p class="title">' + val + '</p>');
                    } else {
                        $title.text(val);
                    }
                } else {
                    $title.remove();
                }
            });
        }

        bind($widget, $tpl, event);
        return this;
    };
    widgets.image_adEdit = function (data) {
        var $config = $('#config_widget_' + microPage.count),
            $widget = $('#widget_' + microPage.count),
            titles = data.title,
            links = data.link,
            images = data.image_url,
            i, len = titles.length,
            $addItem = $config.find('.j-add-item');
        $config.find('.j-show-method[value=' + data.show_method + ']').click().change();
        $config.find('.j-show-size[value=' + data.size + ']').click().change();
        for (i = 0; i < len; i++) {
            if (i != 0) {
                $addItem.click();
            }
            $config.find('.j-title:last').val(titles[i]).change();
            $config.find('.j-link:last').val(links[i]).change();
            $config.find('.j-image:last').val(images[i]).change();
            var $img = $widget.find('.custom-image li:last img');
            imageUrl($img, images[i]);
            //小预览图
            var $small_img = $config.find('.item-image:last img');
            $config.find('.item-image:last a i').remove();
            $config.find('.item-image:last a').addClass('modify-image').html('重新上传');
            $small_img.css('display','block');
            imageUrl($small_img, images[i]);
            //链接
            var link_array = links[i].split('|');
            if(link_array.length>1){
                var $linkTag = $('<div class="pull-left j-tag link-to"><span class="label label-success"></span></div>');
                var $tagLabel = $linkTag.find('span');
                $tagLabel.html(getLinks()[link_array[0]].title);
                $config.find("input[name='link["+i+"]']").after($linkTag);
                $config.find('.dropdown-toggle span:last').html("修改");
            }
        }
    };
    //富文本
    widgets.rich_text = function () {
        var $tpl = $('#richTextTpl').clone(),
            $widget = addWidget('#previewRichText'),
            editor;

        function event() {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId),
                $rich = $widget.find('.j-richtext');
            $configArea.find('.j-resetBg').on('click', function () {
                var $color = $(this).siblings('.j-bgColor'),
                    defaultBg = $color.attr('data-default');
                $color.val(defaultBg).change();
                $rich.css('background-color', defaultBg);
            });
            $config.find('.j-bgColor').on('change', function () {
                $rich.css('background-color', $(this).val());
            });
            var editorID = 'editor_' + (new Date()).getTime();
            $config.find('.editor').attr('id', editorID);
            editor = UE.getEditor(editorID, editorConfig);
            editor.addListener('contentChange', function () {
                $rich.html(editor.getContent());
            });
            $config.data('editorID', editorID);
        }

        bind($widget, $tpl, event);
        return this;
    };
    widgets.rich_textEdit = function (data) {
        var $config = $('#config_widget_' + microPage.count),
            editorID = $config.data('editorID'),
            editor = UE.getEditor(editorID);
        if (data.content) {
            editor.ready(function () {
                editor.setContent(data.content);
                editor.contentchange();
            });
        }
        $config.find('.j-bgColor').val(data.color).change();
    };
    //辅助线
    widgets.line = function () {
        var $tpl = $('<p>辅助线</p>'),
            $widget = addWidget('#previewLine');
        bind($widget, $tpl, null);
        return this;
    };
    //辅助空白
    widgets.white = function () {
        var $tpl = $('#whiteTpl').clone(),
            $widget = addWidget('#previewWhite'),
            $preview = $widget.find('.j-previewWhite'),
            slider = null;

        function event() {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId),
                $white = $config.find('.j-slideWhite'),
                $height = $config.find('.j-height'),
                slider = $config.find('.j-slider').slider({
                    min: 30,
                    max: 100,
                    slide: function (event, ui) {
                        $white.val(ui.value);
                        $height.text(ui.value);
                        $preview.css('height', ui.value);
                    }
                });
            $white.change(function () {
                slider.slider('value', $(this).val());
                $height.text($(this).val());
                $preview.css('height', $(this).val());
            });
        }

        bind($widget, $tpl, event);
        return this;
    };
    widgets.whiteEdit = function (data) {
        var $config = $('#config_widget_' + microPage.count);
        $config.find('.j-slideWhite').val(data.white).change();
    };
    //自定义模块
    widgets.component = function () {
        var $tpl = $('#customTpl').clone(),
            $widget = addWidget('#previewCustom'),
            $preview = $widget.find('.custom-component h3');

        function event() {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId);
            $config.find('.j-add-component').click(function () {
                var $self = $(this);
                dropdownLink.pop('/shop/pop/page?page_type=4', function (layeror, index) {
                    layer.iframeAuto(index);//子页面自适应
                    /** 子页面body对象 */
                    var body = top.layer.getChildFrame('body', index);
                    /** 获取子页面button对象*/
                    body.find(".j-btn").click(function () {
                        var title = $(this).attr('data-page-title');
                        $config.find('.j-custom-id').val($(this).attr('data-real-id'));
                        $config.find('.j-custom-name').val(title);
                        $config.find('.j-tag').removeClass('hide');
                        $config.find('.j-tag .link-to-tag').text(title);
                        $self.text('修改');
                        $preview.text('自定义模块：' + title);
                        top.layer.close(index);
                    });
                });
            });
        }

        bind($widget, $tpl, event);
        return this;
    };
    widgets.componentEdit = function (data) {
        var $config = $('#config_widget_' + microPage.count),
            $widget = $('#widget_' + microPage.count),
            $preview = $widget.find('.custom-component h3');
        $config.find('.j-custom-id').val(data.page_custom_id);
        $config.find('.j-custom-name').val(data.page_custom_name);
        $config.find('.j-tag').removeClass('hide');
        $config.find('.j-tag .link-to-tag').text(data.page_custom_name);
        $config.find('.j-add-component').text('修改');
        $preview.text('自定义模块：' + data.page_custom_name);
    };
    //公告
    widgets.notice = function () {
        var $tpl = $('#noticeTpl').clone(),
            $widget = addWidget('#previewNotice'),
            $preview = $widget.find('.j-previewNotice');

        function event() {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId);
            $config.find('.j-content').change(function () {
                $preview.text($(this).val());
            });
        }

        bind($widget, $tpl, event);
        return this;
    };
    widgets.noticeEdit = function (data) {
        var $config = $('#config_widget_' + microPage.count);
        $config.find('[name=content]').val(data.content).change();
    };
    //优惠券
    widgets.coupon = function () {
        var $tpl = $('#couponTpl').clone(),
            $widget = addWidget('#previewCoupon'),
            $preview = $widget.find('.j-previewNotice');

        function event() {
            var configId = 'config_' + $widget.attr('id'),
                $config = $configArea.find('#' + configId);
            $config.find('.j-content').change(function () {
                $preview.text($(this).val());
            });
            $config.on('click', '.js-add-coupon', function (e) {
                e.stopPropagation();
                e.preventDefault();
                var selectedLen = $config.find('.coupon-list li').length;
                dropdownLink.pop('/shop/pop/coupon', function (layero, index) {
                    layer.iframeAuto(index);//子页面自适应
                    var body = top.layer.getChildFrame('body', index);
                    //获取已经选择优惠券，已经选择的优惠券不能再选择
                    var couponIds = $config.find("input[name='coupon[]']");
                    if (couponIds.length > 0) {
                        $.each(couponIds, function (i, v) {
                            var thisDOM = body.find("#id-" + $(v).val());
                            if (thisDOM && $(thisDOM).hasClass('j-select')) {
                                $(thisDOM).addClass('btn-white').removeClass('j-select btn-primary');
                            }
                        });
                    }
                    body.find(".j-select").on('click', function () {
                        if ($(this).hasClass('selected')) {
                            $(this).addClass('btn-primary').removeClass('selected btn-white').text('选择');
                        } else {
                            var selectingLen = body.find(".selected").length;
                            if (selectingLen + selectedLen >= 3) {
                                top.layer.msg('最多只能选择3张优惠券');
                                return false;
                            }
                            $(this).addClass('btn-white selected').removeClass('btn-primary').text('取消');
                        }
                    });
                    body.find('.j-use').on('click', function () {
                        body.find(".selected").each(function () {
                            var $infos = $(this).parent().siblings();
                            var couponsId = $(this).attr('data-id'),
                                couponsName = $infos.eq(0).text(),
                                faceValue = $infos.eq(1).text(),
                                limitAmount = $infos.eq(2).text();
                            showCoupon($config, $widget, couponsId, couponsName, faceValue, limitAmount);
                        });
                        top.layer.close(index);
                    });
                });
            });
            $config.on('click', '.js-remove-coupon', function (e) {
                e.stopPropagation();
                e.preventDefault();
                var couponsId = $(this).attr('data-id'),
                    $widgetUI = $widget.find('.custom-coupon');
                $config.find('.coupon-list').children('#config-coupon-id-' + couponsId).remove();
                $widgetUI.children('#widget-coupon-id-' + couponsId).remove();
                if ($config.find('.js-add-coupon').css('display') == 'none') {
                    $config.find('.js-add-coupon').show();
                }
                if ($.trim($config.find('.coupon-list').html()) == '') {
                    $widgetUI.children('.empty-li').show();
                    $widgetUI.addClass('empty');
                }
            });
        }

        bind($widget, $tpl, event);
        return this;
    };
    widgets.couponEdit = function (data) {
        var $config = $('#config_widget_' + microPage.count),
            $widget = $('#widget_' + microPage.count),
            coupon = data.coupon;
        if (coupon && coupon.length > 0) {
            var ids = coupon.join();
            $.get('/marketing/coupon/index/getCoupons', {ids: ids}, function (res) {
                if (res.code == 0) {
                    $.each(res.data, function (i, v) {
                        var limitAmount = v.limit_order_amount ? '满' + v.limit_min_amount + '元可用' : '无限制';
                        showCoupon($config, $widget, v.coupons_id, v.name, v.face_value, limitAmount);
                    });
                }
            });
        }
    };

    widgets.trigger = function (type, append) {
        if (type in widgets && $.isFunction(widgets[type])) {
            microPage.count++;
            isAppend = append;
            widgets[type]();
            $activeWidget.attr('data-type', type);
        }
        return this;
    };
    if (typeof define === "function" && define.cmd) {
        define(function (require, exports, module) {
            module.exports = microPage;
        });
    }
    else if (typeof define === "function" && define.amd) {
        define("microPage", [], function () {
            return microPage;
        });
    }
})(this);