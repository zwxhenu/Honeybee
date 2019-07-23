(function($) {
    $.fn.shopNav=function(option){
        var defaultOption={
            baseUrl:'',
            base_url:option.base_url,
            navStyle:2,//导航模版
            navType:1,//导航类型
            pageLink:null,
            nav:[
                {
                    title: "店铺",
                    link_title: "店铺",
                    link_type: "home",
                    link_url: "home|home",
                    image_url:"",
                    image_active_url:"",
                    subnav: []
                },
                {
                    title: "全部商品",
                    link_title: "全部商品",
                    link_type: "all_goods",
                    link_url: "all_goods|all_goods",
                    image_url:"",
                    image_active_url:"",
                    subnav: []
                },
                {
                    title: "会员主页",
                    link_title: "会员主页",
                    link_type: "personal",
                    link_url: "personal|personal",
                    image_url:"",
                    image_active_url:"",
                    subnav: []
                }
            ]
        },
        self=this,
        navNum=4,//导航个数
        subNavNum=5,//二级导航个数
        $appNav=self.find('.j-app-nav'),//预览导航
        $configList=self.find('.j-nav-config'),//配置项列表
        navTip='<span class="fl j-nav-tip">使用二级导航后主链接已失效。</span>',
        $linkList=$('<ul class="dropdown-menu j-dropdown-menu">');

        option=$.extend({},defaultOption,option);
      //  console.log(option);
        self.pageLink=option.pageLink;
        /*
        for(var i=0,len=option.linkList.length;i<len;i++){
            var link=option.linkList[i];
            $linkList.append('<li class="j-choose-link-type" data-type="'+link.type+'">'+link.title+'</li>');
        }
        */
        self.bindChangeLink = function(){
            // 修改链接菜单
            $(document).on('click','.j-dropdown-menu li',function(){
                var parent_ele = $(this).closest('.app-nav-item');
                var sub_link = parent_ele.find('.j-link-title');
                var link_title = $(this).find('a').html();
                var link_type = $(this).find('a').attr('data-type');
                parent_ele.find('.app-nav-item-title').html(link_title);
                sub_link.attr('data-link-title',link_title);
                sub_link.attr('data-link-type',link_type);
                sub_link.attr('data-link-url','');
            });
        };
        //设置预览菜单
        self.appPreviewMenu=function(){
           // console.log($appNav);

            if($appNav.length<=0){
                return false;
            }
            $appNav.html('');
            var menus=option.nav,
                i=0,
                len=menus.length,
                width=parseFloat(100/len);

            for(i;i<len;i++){
                var item=menus[i];
                self.appAddPreviewMenu(item);
            }

            return self;
        };
        self.appPreviewMenuResize=function(){
            var width=100/$appNav.find('>li').length;
            $appNav.find('>li').css('width',width+'%').css('overflow','hidden');
            return self;
        };
        //添加预览导航
        self.appAddPreviewMenu=function(item){
            item=item || {
                    title: "导航标题",
                    link_title: "",
                    link_type: "link",
                    link_url: "",
                    image_url:"",
                    image_active_url:"",
                    subnav: []
                };
            var title=item.title,
                linkTitle=item.link_title,
                linkType=item.link_type,
                linkUrl=item.link_url,
                subnav=item.subnav,
                image_url=item.image_url,
                image_active_url=item.image_active_url,
                $nav=$('<li class="app-nav-item"></li>');
            title=title || linkTitle;
            if(option.navStyle==2){
                var $link=$('<span class="blk"></span>');
                $link.text(title);

                $nav.append($link);
            }else{
                var $link=$('<span class="blk"></span>');
                $link.text(title);
                
                $nav.append($link);
            }
            var fontcolor=$("input[name='fontcolor']").val();

            $nav.find("a").css('color',fontcolor);
            $appNav.append($nav);
            self.appPreviewMenuResize();
            return self;
        };
        //导航设置
        self.appMenuConfig=function(){
            if($configList.length<0){
                return false;
            }
            $configList.html('');

            var menus=option.nav,
                i=0,
                len=menus.length;
            for(i;i<len;i++){
                var item=menus[i];
                if(option.navType==1){
                    self.appAddNav(item);
                }else{
                 //   self.appAddAssistNav(item);
                }
            }
            return self;
        };
        //添加导航按钮
        self.appAddNavButton=function(){
            if(option.navType==1)
            {
                if($configList.find('li.j-nav-choice').length>=navNum){
                    return false;
                }
            }
            else
            {
                if($configList.find('li.j-nav-choice').length>=navNum){
                    return false;
                }
            }

            var text='+ 添加导航';
            if(option.navStyle==2){
                text='+ 添加一级导航';
            }
            if(option.navType==2){
                text='+ 添加导航';
            }

            if($configList.siblings('.j-add-nav').length<=0){
                var $btn=$('<p class="add-app-nav j-add-nav" style="display: block;">'+text+'</p>');
                $configList.after($btn);
                $btn.click(function(){
                    if($configList.find('li.j-nav-choice').length>=navNum){
                        layer.msg('最多支持'+ navNum +'个');return false;
                    }
                    self.appAddNav(null);
                });
            }
            return self;
        };
        //添加导航设置项
        self.appAddNav=function(menuItem){
            menuItem=menuItem || {
                    title: "导航标题",
                    link_title: "选择链接",
                    link_type: "link",
                    link_url: "",
                    image_url:"",
                    image_active_url:"",
                    subnav: []
                };
            var $li=null,
                title=menuItem.title,
                linkTitle=menuItem.link_title,
                linkType=menuItem.link_type,
                linkUrl=menuItem.link_url,
                subnav=menuItem.subnav,
                image_url=menuItem.image_url,
                image_active_url=menuItem.image_active_url,
                subNav=menuItem.subnav,
                linkName='',
                linkAttr='';
                linkUrlem='';
            linkAttr+=' data-title="'+title+'"';
            linkAttr+=' data-link-title="'+linkTitle+'"';
            linkAttr+=' data-link-type="'+linkType+'"';
            linkAttr+=' data-link-url="'+linkUrl+'"';
            switch(linkType){
                case 'tag':
                    linkName='【'+title+'】'+linkTitle;
                    break;
                case 'link':
                    linkName='【'+linkTitle+'】';
                    break;
                case 'custom':
                    var url = linkUrl.split("|");
                    linkUrlem='<em class="link-to-tag">'+url[1]+'</em>';
                    break;
                default:

            }
            if(option.navStyle==2){
                var tpl='<li class="j-nav-choice j-nav"><div class="action j-action"><span class="j-delete" title="删除">×</span></div>'+
                        '<div class="first-nav"><h3>一级导航</h3>'+
                        '<div class="app-nav-item"><label class="control-label">标题：</label>'+
                        '<div class="app-nav-item-title" contenteditable="true">'+title+'</div>'+
                        '<div class="j-app-nav-op app-nav-op-box">'+
                        '<span class="app-nav-item-split">|</span>'+
                        '</div>'+
                        '</div>'+
                        '</div>'+
                        '</li>',
                    linkTpl='<div class="control-group-link">'+
                        '<label class="control-label">链接：</label><span class="j-link-title"'+linkAttr+'></span>'+
                        '<div class="controls fr">'+
                        '<div class="dropdown-box j-dropdown-box"><input class="j-link" name="link" type="hidden" value="'+linkUrl+'">'+
                        '<div class="pull-left j-tag link-to"><span class="label label-success">'+linkTitle+linkUrlem+'</span></div>'+
                        '</div>'+
                        '</div>'+
                        '</div>',
                    i=0,len=subNav.length;
                $li=$(tpl);

                //添加二级导航
                $parent=$('<ul class="j-sub-nav-list sub-nav-list"></ul>');
                $li.append('<h4>二级导航</h4>').append($parent);
                if(len>0){
                    $li.find('.app-nav-item').append(navTip);
                    for(i=0;i<len;i++){
                        self.appAddSubNav($parent,subNav[i]);
                    }
                }else{
                    $li.find('.app-nav-item').append(linkTpl);
                    //$li.find('.j-dropdown-box').append($linkList.clone());
                    self.pageLink.createLink($li.find('.j-dropdown-box'),'修改');
                    self.bindChangeLink();
                }
                self.appAddSubNavButton($parent);
                $configList.append($li);
            }else{
                var tpl='<li class="j-nav-choice j-nav"><div class="action j-action"><span class="j-delete" title="删除">×</span></div>'+
                    '<div class="app-nav-image-wrap clearfix">'+
                    '<div class="app-nav-image">'+
                    '<p>普通</p>'+
                    '<img class="j-normal-image" src="">'+
                    '<div class="j-edit-image edit-image">修改</div>'+
                    '</div>'+
                    '<div class="app-nav-active-image ">'+
                    '<p>高亮</p>'+
                    '<img class="j-highlight-image" src="">'+
                    '<div class="j-edit-image edit-image">修改</div>'+
                    '</div>'+
                    '</div>'+
                    '<p class="info">图片尺寸要求：不大于128*100像素，支持PNG格式</p>'+
                    '<div class="control-group-link clearfix">'+
                    '<div class="app-nav-item-title" contenteditable="true">'+title+'</div>'+
                    '<div class="j-app-nav-op app-nav-op-box">'+
                    '<span class="app-nav-item-split">|</span>'+
                    '</div>'+
                    '<label class="control-label">链接：</label>'+
                    '<div class="controls fr">'+
                    '<div class="dropdown-box j-dropdown-box">'+
                    '</div>'+
                    '</div>'+
                    '</div>'+
                    '</li>';
                $li=$(tpl);
                $li.find('.j-normal-image').attr('src',image_url);
                $li.find('.j-highlight-image').attr('src',image_active_url);
                $li.find('.j-dropdown-box').append($linkList.clone());
                $configList.append($li);
            }

            if($li){
                var index=$li.index();
                $li.find('.j-delete').click(function(){
                    if(self.find('.j-nav-choice').length<=1){
                        layer.msg('最少设置一个菜单');
                        return false;
                    }
                    $(this).closest('.j-nav-choice').remove();
                    $appNav.find('>li').eq(index).remove();
                    self.appAddNavButton();
                    self.appPreviewMenuResize();
                });
                $li.find('.app-nav-item-title').keyup(function(){
                    $appNav.find('>li').eq(index).find('.blk').html($(this).html());
                });

                self.appAddPreviewMenu(menuItem);
            }
            return self;
        };
        //添加二级导航设置项
        self.appAddSubNav=function($parent,menuItem){
            menuItem=menuItem || {
                    title: "导航标题",
                    link_title: "选择链接",
                    link_type: "link",
                    link_url: "",
                    image_url:"",
                    image_active_url:"",
                    subnav: []
                };
            var $li=null,
                title=menuItem.title,
                linkTitle=menuItem.link_title,
                linkType=menuItem.link_type,
                linkUrl=menuItem.link_url,
                linkAttr='',
                linkName='';
                linkUrlem='';
            linkAttr+=' data-title="'+title+'"';
            linkAttr+=' data-link-title="'+linkTitle+'"';
            linkAttr+=' data-link-type="'+linkType+'"';
            linkAttr+=' data-link-url="'+linkUrl+'"';

            switch(linkType){
                case 'tag':
                    linkName='【'+title+'】'+linkTitle;
                    break;
                case 'link':
                    linkName='【'+linkTitle+'】';
                    break;
                case 'custom':
                    var url = linkUrl.split("|");
                    linkUrlem='<em class="link-to-tag">'+url[1]+'</em>';
                    break;
                default:

            }
            var tpl='<li class="j-sub-nav-item j-nav"><div class="action j-action"><span class="j-sub-delete" title="删除">×</span></div>'+
                '<div class="second-nav">'+
                '<div class="app-nav-item"><label class="control-label">标题：</label>'+
                '<div class="app-nav-item-title" contenteditable="true">'+title+'</div>'+
                '<div class="j-app-nav-op app-nav-op-box">'+
                '<span class="app-nav-item-split">|</span>'+
                '</div>'+
                '<div class="control-group-link">'+
                '<label class="control-label">链接：</label><span class="j-link-title"'+linkAttr+'></span>'+
                '<div class="controls fr">'+
                '<div class="dropdown-box j-dropdown-box"><input class="j-link" name="link" type="hidden" value="'+linkUrl+'">'+
                '<div class="pull-left j-tag link-to"><span class="label label-success">'+linkTitle+linkUrlem+'</span></div>'+
                '</div>'+
                '</div>'+
                '</div>'
            '</div>'+
            '</div>'+
            '</li>',
                $firstNavItem=$parent.closest('li.j-nav-choice').find('div.app-nav-item:eq(0)'),
                $li=$(tpl);
            //$li.find('.j-dropdown-box').append($linkList.clone());
            self.pageLink.createLink($li.find('.j-dropdown-box'),'修改');
            self.bindChangeLink();
            $parent.append($li);
            if($firstNavItem.find('.j-nav-tip').length<=0){
                $firstNavItem.append(navTip);
            }
            $firstNavItem.find('.control-group-link').remove();
            if($li)
            {
                $li.find('.j-sub-delete').click(function(){
                    $(this).closest('.j-sub-nav-item').remove();
                    self.appAddSubNavButton($parent);
                    var $firstNavItem=$parent.closest('li.j-nav-choice').find('div.app-nav-item:eq(0)');
                    if($parent.find('li.j-sub-nav-item').length<=0 && $firstNavItem.find('.control-group-link').length<=0){
                        var $linkTpl=$('<div class="control-group-link">'+
                            '<label class="control-label">链接：</label><span class="j-link-title"'+linkAttr+'></span>'+
                            '<div class="controls fr">'+
                            '<div class="dropdown-box j-dropdown-box"><input class="j-link" name="link" type="hidden" value="'+linkUrl+'">'+
                            '<div class="pull-left j-tag link-to"><span class="label label-success">'+linkTitle+'</span></div>'+
                            '</div>'+
                            '</div>'+
                            '</div>');
                        //$linkTpl.find('.j-dropdown-box').append($linkList.clone());
                        self.pageLink.createLink($linkTpl.find('.j-dropdown-box'),'');
                        self.bindChangeLink()
                        $firstNavItem.find('.j-nav-tip').remove();
                        $firstNavItem.append($linkTpl);
                    }
                });
            }
            return self;
        };
        //添加二级导航按钮
        self.appAddSubNavButton=function($parent){
            if(option.navStyle!=2){
                return self;
            }
            if($parent.find('li.j-sub-nav-item').length>=subNavNum){
                return self;
            }
            if($parent.siblings('.j-add-sub-nav').length<=0){
                var $btn=$('<p class="add-app-nav j-add-sub-nav sub" style="display: block;">+ 添加二级导航</p>');
                $parent.after($btn);
                $btn.click(function(){
                    if($parent.find('li.j-sub-nav-item').length>=subNavNum){
                        layer.msg('最多支持'+ subNavNum +'个');return false;
                    }
                    self.appAddSubNav($parent,null);
                });
            }
            return self;
        };
        //设置导航位置
        self.appSetNavPosition=function(){
            if(option.navType==1){
                self.find('.j-app-default-nav').hide();
            }else{
                self.find('.j-app-default-nav').show();
            }
        };
        //保存设置的数据
        self.appSaveData=function(){
            var setNavs=[];
            self.find('.j-nav-config li.j-nav-choice').each(function(){

                var $link=$(this).find('.j-link-title:eq(0)'),subNav=[],
                    nav_link_title = $link.attr('data-link-title'),
                    nav_link_type = $link.attr('data-link-type'),
                    //nav_link_url = $link.attr('data-link-url');
                    nav_link_url = $(this).find('.j-link:eq(0)').val();
                    if(nav_link_type == 'custom'){
                        nav_link_title = '外链';
                        //nav_link_url = $(this).find('.link-to-tag:eq(0)').html();
                    }

                var nav={
                        title:$(this).find('.app-nav-item-title:eq(0)').text(),
                        link_title: nav_link_title,
                        link_type: nav_link_type,
                        link_url: nav_link_url,
                        image_url:'',
                        image_active_url:'',
                        subnav: []
                    };
                //辅助导航 类型和图片
                if(option.navType == 2)
                {
                    var img="";
                    var top_type=$('input[name="top_nav_type"]:checked').val();
                    if(top_type == '1')
                    {
                        img=$(this).find('.app-nav-img img').attr('data-src');
                    }
                    nav={
                        img:img,
                        title:$(this).find('.app-nav-item-title:eq(0)').text(),
                        link_title: $link.attr('data-link-title'),
                        link_type: $link.attr('data-link-type'),
                        link_url: $link.attr('data-link-url'),
                        image_url:'',
                        image_active_url:'',
                        subnav: []
                    };
                }
                //二级导航,只有主导航有二级导航
                if(option.navType==1){

                    $(this).find('.j-sub-nav-item').each(function(){
                        var $subLink=$(this).find('.j-link-title:eq(0)');
                        var $jLink = $(this).find('.j-link:eq(0)');
                        subNav.push({
                            title:$(this).find('.app-nav-item-title:eq(0)').text(),
                            link_title: $subLink.attr('data-link-type')=='custom'?'外链':$subLink.attr('data-link-title'),
                            link_type: $subLink.attr('data-link-type'),
                            link_url: $jLink.val(),
                            image_url:'',
                            image_active_url:''
                        });
                    });
                    nav.subnav=subNav;
                }
                setNavs.push(nav);
            });
            option.nav=setNavs;
            return self;
        };
        //获取设置的数据
        self.appGetData=function(){
            self.appSaveData();

            var saveData={
                navStyle:option.navStyle,
                navType:option.navType,
                nav:option.nav,
                bgcolor:$('input[name="bgcolor"]').val(),
                fontcolor:$('input[name="fontcolor"]').val(),
                bgopacity:parseInt($('input[name="opacity"]').val())/100||1
            };
            if(option.navType == 2)
            {
                var top_type=$('input[name="top_nav_type"]:checked').val();
                saveData={
                    navStyle:option.navStyle,
                    navType:option.navType,
                    nav_top_type:top_type,
                    nav:option.nav,
                    bgcolor:$('input[name="bgcolor"]').val(),
                    fontcolor:$('input[name="fontcolor"]').val(),
                    bgopacity:$('input[name="opacity"]:checked').val()
                };
            }
            return JSON.stringify(saveData);
        };

        self.appSetInit=function(){
            $appNav.html('');
            self.appMenuConfig();
            self.appAddNavButton();
            self.appSetNavPosition();
            //self.appPreviewMenu();
        };
        self.appSetInit();
        return self;

    }
})(jQuery);
