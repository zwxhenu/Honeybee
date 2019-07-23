/*菜单数据保存格式
 title: '菜单一',
 link:'',
 sub: [
 title: '菜单一',
 link:'',
 ]
 */
;(function (global) {
    var wechatMenu = {},
        menuNumLimited = 3,//主菜单数量限制
        subNumLimited = 5,//子菜单数量限制
        menuType = ['topmenu', 'link', 'event'],//菜单类型
        navTip = '<span class="fl j-nav-tip">使用二级导航后主链接已失效。</span>',
        $preview = null,
        $config = null,
        dropdownLink = null,
        defaultOption = {
            previewSelector: '.j-wx-menu',
            configSelector: '.j-menu-config',
            menu: []
        };

    /**
     * 添加一级菜单
     * @param $item 菜单项
     * @param index 索引
     * @returns {boolean}
     */
    function addMenu($item, index) {
        var num = $config.data('num') || 0,
            $itemTpl = $item.siblings('.j-item').clone(),
            len = $preview.find('>li').length,
            preview = '<li><span>菜单</span><ul></ul></li>';
        if (len >= menuNumLimited) {
            top.layer.msg('最多可添加' + menuNumLimited + '个菜单');
            $config.find('.j-add-nav').hide();
            return false;
        }
        $itemTpl.removeClass('j-item hide');
        if (index >= 0) {
            $item.after($itemTpl);
            $preview.find('>li').eq(index).after(preview);
        } else {
            $item.before($itemTpl);
            $preview.append(preview);
        }
        len++;
        var $li = $preview.find('>li');
        $li.css('width', 100 / $li.length + '%');
        $itemTpl.find('.j-link').attr('name', 'link[' + num + ']');
        $itemTpl.find('.j-title').attr('name', 'title[' + num + ']');
        num++;
        if (len >= menuNumLimited) {
            $config.find('.j-add-nav').hide();
        }
        $config.data('num', num);
        //注册编辑事件
        $itemTpl.find('.app-nav-item-title').on('keyup', function () {
            var val = $(this).val();
            $preview.find('>li').eq($(this).closest('.j-top-menu').index() - 1).find('span').text(val);
        });
    }

    /**
     * 添加二级菜单
     * @param $item 菜单项
     * @param index 索引
     * @returns {boolean}
     */
    function addSubMenu($item, index) {
        var $preList = $preview.find('>li').eq($item.closest('.j-top-menu').index() - 1).find('ul'),
            $itemTpl = $item.siblings('.j-sub-item').clone(),
            preview = '<li>子菜单</li>',
            len = $preList.find('li').length;
        $item.closest('.j-top-menu').find('.j-setLinkBox:eq(0)').addClass('hide');
        if (len >= subNumLimited) {
            top.layer.msg('最多可添加' + subNumLimited + '个子菜单');
            $item.closest('.j-sub-nav-list').find('.j-add-subnav').hide();
            return false;
        }
        $itemTpl.removeClass('j-sub-item hide');
        if (index >= 0) {
            $item.after($itemTpl);
            $preList.find('li').eq(index).after(preview);
        } else {
            $item.before($itemTpl);
            $preList.append(preview);
        }
        len++;
        if (len >= subNumLimited) {
            $item.closest('.j-sub-nav-list').find('.j-add-subnav').hide();
        }
        //注册编辑事件
        $itemTpl.find('.app-nav-item-title').on('keyup', function () {
            var val = $(this).val();
            $preview.find('>li').eq($(this).closest('.j-top-menu').index() - 1).find('ul li').eq($(this).closest('.item').index() - 1).text(val);
        });
    }

    /**
     * 获取数据
     */
    function getData() {
        var menus = [];
        $config.find('.j-top-menu').not(':first').each(function () {
            var menu = {
                title: $(this).find('.j-title').val(),
                link: $(this).find('.j-link').val(),
                tip:$(this).find('.tip:first').text()
            },
                sub=[];
            $(this).find('.j-sub-nav-list li').not(':first').not(':last').each(function () {
                sub.push({
                    title:$(this).find('.j-title').val(),
                    link:$(this).find('.j-link').val(),
                    tip:$(this).find('.tip').text()
                });

            });
            menu['sub']=sub;
            menus.push(menu);
        });
        return menus;
    }
    wechatMenu.init = function (option) {
        option = $.extend(defaultOption, option);
        $preview = $(option.previewSelector);
        $config = $(option.configSelector);
        dropdownLink = option.dropdownLink;
        //注册添加一级导航事件
        $config.find('.j-add-nav').click(function () {
            addMenu($(this), -1);
        });
        //注册追加导航、删除导航事件
        $config.on('click', '.action.j-add', function () {
            var $item = $(this).closest('.item'),
                index = $item.index() - 1;
            addMenu($item, index);
        }).on('click', '.action.j-delete', function () {
            var $item = $(this).closest('.item'),
                index = $item.index() - 1;
            $item.siblings('.j-add-nav').show();
            $item.remove();
            //删除预览
            $preview.find('>li').eq(index).remove();
            var $li = $preview.find('>li');
            $li.css('width', 100 / $li.length + '%');
        }).on('click', 'li.j-add-subnav', function () {//添加二级菜单
            addSubMenu($(this), -1);
        }).on('click', '.action.j-sub-add', function () {//追加二级菜单
            var $item = $(this).closest('.item'),
                index = $item.index() - 1;
            addSubMenu($item, index);
        }).on('click', '.action.j-sub-delete', function () {//删除二级菜单
            var $item = $(this).closest('.item'),
                index = $item.index() - 1;
            $item.siblings('.j-add-subnav').show();
            //删除预览
            $preview.find('>li').eq($item.closest('.j-top-menu').index() - 1).find('ul').find('li').eq(index).remove();
            if ($item.closest('.j-sub-nav-list').find('li').length <= 3) {
                $item.closest('.j-top-menu').find('.j-setLinkBox').removeClass('hide');
            }
            $item.remove();
        }).on('click', '.j-setLink', function () {
            var $link = $(this).parent().siblings('.j-link'), $self = $(this), $tip = $(this).siblings('.tip');
            top.layer.open({
                type: 2,
                title: '预设链接',
                shadeClose: true,
                shade: 0.8,
                area: ['80%', '80%'],
                content: '/wechat/preset/ulist', //iframe的url
                success: function (layero, index) {
                    /** 子页面body对象 */
                    var body = top.layer.getChildFrame('body', index);
                    /** 获取子页面button对象*/
                    var childButton = body.find("button[name=jss]");
                    childButton.on('click', function () {
                        /** 获取子页面点击事件操作的预设链接ID */
                        var urlId = $(this).attr('js-data');
                        var urlName = $(this).attr('js-name');
                        $link.val(urlId);
                        $tip.text(urlName);
                        /** 关闭子页面 */
                        top.layer.close(index);
                    });
                }
            });
        });
        //编辑
        if (option.menu) {
            for(var p in option.menu){
                if(option.menu.hasOwnProperty(p)){
                    $('.j-add-nav').click();
                    var $item=$config.find('.j-top-menu:last'),
                        $subAdd=$item.find('.j-add-subnav'),
                        $subMenus=$item.find('.j-sub-nav-list'),
                        d=option.menu[p];
                    $item.find('.j-title:first').val(d.title).keyup();
                    $item.find('.j-link:first').val(d.link);
                    $item.find('.tip:first').text(d.tip);
                    if(d.sub!=undefined && d.sub.length>0){
                        for(var i=0,len=d.sub.length;i<len;i++){
                            $subAdd.click();
                            var subData=d.sub[i],$submenu=$subMenus.find('li:last').prev();
                            console.log($submenu);
                            $submenu.find('.j-title:first').val(subData.title).keyup();
                            $submenu.find('.j-link:first').val(subData.link);
                            $submenu.find('.tip:first').text(subData.tip);
                        }
                    }
                }
            }
            console.log(option.menu);
        } else {
            for (var i = 0; i < 3; i++) {
                $('.j-add-nav').click();
            }
        }
        $(option.saveBtn).click(function () {
            var menuData = getData(),
                data = option.data || {},
                $self = $(this);
            console.log(menuData);
            if (!menuData) {
                return false;
            }
            data.data = JSON.stringify(menuData);
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
                        top.layer.msg('保存成功');
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
    };
    if (typeof define === "function" && define.cmd) {
        define(function (require, exports, module) {
            module.exports = wechatMenu;
        });
    }
    else if (typeof define === "function" && define.amd) {
        define("wechatMenu", [], function () {
            return wechatMenu;
        });
    }
    else {
        return global.wechatMenu = wechatMenu;
    }
})(this);