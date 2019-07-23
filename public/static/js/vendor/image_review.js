/**
 *  20150514  creat by  whq
 */
function view_file()
{
	var imgsrc = $(this).attr("src");
	window.open(imgsrc);
}
function msover()
{
	var imgsrc = $(this).attr("src");
	var img_div = '<div  class="view_img"><img width="400" height="270" src="'+imgsrc+'" /></div>';
	$(this).parent("td").append(img_div);
}

function click_file()
{
	$(this).siblings('.hidden_file').click();	
}

function msout()
{
	$(this).siblings(".view_img").remove();
}

function previewImage(file,imgid,not_imgid) 
{ 
	var MAXWIDTH = 200; 
	var MAXHEIGHT = 120; 

	if (file.files && file.files[0]) 
	{ 

		var img = document.getElementById(imgid); 
		img.onload = function(){ 
			var rect = clacImgZoomParam(MAXWIDTH, MAXHEIGHT, img.offsetWidth, img.offsetHeight); 
			img.width = rect.width; 
			img.height = rect.height; 
			//img.style.marginLeft = rect.left+'px'; 
			//img.style.marginTop = rect.top+'px'; 
		} 
		var reader = new FileReader(); 
		reader.onload = function(evt){
			img.src = evt.target.result;

		} 
			reader.readAsDataURL(file.files[0]); 
			img.style.display=" ";
	} 
	else 
	{ 

		var sFilter='filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src="'; 
		file.select(); 
		var src = document.selection.createRange().text; 
		div.innerHTML = '<img id=imghead>'; 
		var img = document.getElementById('imghead'); 
		img.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = src; 
		var rect = clacImgZoomParam(MAXWIDTH, MAXHEIGHT, img.offsetWidth, img.offsetHeight); 
		status =('rect:'+rect.top+','+rect.left+','+rect.width+','+rect.height); 
		div.innerHTML = "<div id=divhead style='width:"+rect.width+"px;height:"+rect.height+"px;margin-top:"+rect.top+"px;margin-left:"+rect.left+"px;"+sFilter+src+"\"'></div>"; 
	} 
	var not_img = document.getElementById(not_imgid);
	if(not_img)
	{
		not_img.value="";
	}
} 
function clacImgZoomParam( maxWidth, maxHeight, width, height ){ 
	var param = {top:0, left:0, width:width, height:height}; 
	if( width>maxWidth || height>maxHeight ) 
	{ 
		rateWidth = width / maxWidth; 
		rateHeight = height / maxHeight; 

		if( rateWidth > rateHeight ) 
		{ 
			param.width = maxWidth; 
			param.height = Math.round(height / rateWidth); 
		}else 
		{ 
			param.width = Math.round(width / rateHeight); 
			param.height = maxHeight; 
		} 
	} 

	param.left = Math.round((maxWidth - param.width) / 2); 
	param.top = Math.round((maxHeight - param.height) / 2); 

	return param; 
} 

// 多图预览 
function Preview_image( e ) { 
		var preview_img_sel = e.data.preview_img_sel;
		var main_sel = e.data.main_sel;
		var pic_hidden_sel = e.data.pic_hidden_sel;
		var default_img_sel = e.data.default_img_sel;
		var file = $(this).prop('files')[0];
		//var file_num = $(".pic_hidden_div .hidden_file").length;
		var timestamp = new Date().getTime();
		//console.log($(this).prop('files')[0]);
		if ( file ) {

			var reader = new FileReader();
			reader.onload = function ( event ) { 
			var txt = event.target.result;
			var img = document.createElement("img");
			img.src = txt;
			img.className = "com_img";
			$(default_img_sel).remove();
			//document.getElementById(mess_img).innerHTML = "";
			$(main_sel).find(preview_img_sel).append( img );
			};
			reader.readAsDataURL( file );
			$(pic_hidden_sel).append('<input  type="file" name="pic_path_'+timestamp+'" class="hidden_file" style="display: none;"/>');
			
		}
	}