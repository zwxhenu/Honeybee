function choicePic(choiceUrl,upUrl,type)
{
    var divwidth = '';
    if(type == 1){
        divwidth = '750px';
    }else if(type == 2) {
        divwidth = '560px';
    }else{
        divwidth = '380px';
    }
    parent.layer.open({
        type: 2,
        title: ['素材列表', 'font-size:18px;'],
        skin: 'layui-layer-pro', //样式类名
        closeBtn: true, //不显示关闭按钮
        shift: 2,
        tipsMore: false,
        area: [divwidth,'550px'], //宽高
        shadeClose: true, //开启遮罩关闭
        content: choiceUrl,
        success: function(layero, index){
            var body = parent.layer.getChildFrame('body', index);
            var childButton = body.find("button[name='checkok']");
            var uploadButton = body.find("button[name='uploadPic']");
            var status =  body.find("input[name='status']").val();
            childButton.on('click', function () {
                var piclist= body.find("input[name='piclist']").val();
                parent.layer.close(index);
                var pic_list = [];
                var list = piclist.split(',');
                for (x in list)
                {
                    var pic = list[x].split('|');
                    if(pic[0]) pic_list[pic[0]] = pic[1];
                }
                if(status == 1)
                {
                    addOnePic(pic_list);
                }
                else
                {
                    addPic(pic_list);
                }
            });
            uploadButton.on('click', function () {
                parent.layer.close(index);
                uploadPic(upUrl,type);
            });
        }
    });
}
function uploadPic(upUrl,type)
{
    var divwidth = '960px';
    var divheight = '570px';
    if(type == 1){
        divwidth = '960px';
        divheight = '570px';
    }else if(type == 2) {
        divwidth = '760px';
        divheight = '360px';
    }else{
        divwidth = '450px';
        divheight = '260px';
    }
    parent.layer.open({
        type: 2,
        title: ['上传图片', 'font-size:18px;'],
        skin: 'layui-layer-pro', //样式类名
        closeBtn: true, //不显示关闭按钮
        shift: 2,
        tipsMore: false,
        area: [divwidth,divheight], //宽高
        shadeClose: true, //开启遮罩关闭
        content: upUrl,
        success: function(layero, index){
            var body = parent.layer.getChildFrame('body', index);
            var childButton = body.find("button[name='checkok']");
            var status =  body.find("input[name='status']").val();
            childButton.on('click', function () {
                var piclist = body.find("input[name='piclist']").val();
                parent.layer.close(index);
                var pic_list = [];
                var list = piclist.split(',');
                for (x in list)
                {
                    var pic = list[x].split('|');
                    if(pic[0]) pic_list[pic[0]] = pic[1];
                }
                if(status == 1)
                {
                    addOnePic(pic_list);
                }
                else
                {
                    addPic(pic_list);
                }
            });
        }
    });
}
function choiceImageText(url, type)
{
    var divwidth = '';
    if(type == 1){
        divwidth = '750px';
    }else if(type == 2) {
        divwidth = '560px';
    }else{
        divwidth = '380px';
    }
    parent.layer.open({
        type: 2,
        title: ['图文消息|素材列表', 'font-size:18px;'],
        skin: 'layui-layer-pro', //样式类名
        closeBtn: true, //不显示关闭按钮
        shift: 2,
        tipsMore: false,
        area: [divwidth,'550px'], //宽高
        shadeClose: true, //开启遮罩关闭
        content: url,
        success: function(layero, index){
            var image_text = '';
            var image_text_id = '';
            var body = parent.layer.getChildFrame('body', index);
            var buttonClick = body.find('button[name="jss"]');
            buttonClick.on('click', function () {
                image_text_id = $(this).attr('js-data');
                image_text = $(this).attr('js-title');
                parent.layer.close(index);
                addImageText(image_text, image_text_id);
            });
        }
    });
}
