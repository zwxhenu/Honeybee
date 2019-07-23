function resize(){
	if(document.documentElement.clientWidth>=520){
		document.documentElement.style.fontSize=414/16+'px';
	}else if(document.documentElement.clientWidth<520){
		document.documentElement.style.fontSize=document.documentElement.clientWidth/16+'px';
	}
}
window.addEventListener("load",resize,false);
window.addEventListener('resize',resize,false);
