/**
 ** 拖拽改变大小
 **
 */
$.fn.extend({
    dragging: function(data) {
	var $this = $(this),
		father = $this.parent(),
		doc = $(document);	
	//---初始化
	father.css({"position": "relative", "overflow": "hidden"});
	$this.css({"position": "absolute", "cursor": "move"});

	var faWidth = father.width();
	var faHeight = father.height();
//	var thisWidth = $this.width() + parseInt($this.css('padding-left')) + parseInt($this.css('padding-right'));
//	var thisHeight = $this.height() + parseInt($this.css('padding-top')) + parseInt($this.css('padding-bottom'));
	var thisWidth = $this.width();
	var thisHeight = $this.height();

	var mDown = false;
	var positionX;
	var positionY;
	var moveX;
	var moveY;
	var X;
	var Y;
	function setData(pos)
	{
	    $this.data(pos);
	    return false;
	}

	

	//thisRandom();

	$this.mouseup(function(e) {
	    mDown = false;
	    var pos = {
		posTop: $this.position().top,
		posLeft: $this.position().left,
		posWidth: $this.width(),
		posHeight: $this.height()
	    };
	    setData(pos);
	});

	$this.mousedown(function(e) {
	    mDown = true;
	    X = e.pageX;
	    Y = e.pageY;
	    positionX = $this.position().left;
	    positionY = $this.position().top;
	    return false;
	});

	$this.mousemove(function(e) {

	    xPage = e.pageX;
	    moveX = positionX + xPage - X;

	    yPage = e.pageY;
	    moveY = positionY + yPage - Y;

	    function thisAllMove() { //任意移动
		if (mDown == true) {
		    $this.css({"left": moveX, "top": moveY});
		} else {
		    return;
		}
		if (moveX < 0) {
		    $this.css({"left": "0"});
		}
		if (moveX > (faWidth - thisWidth)) {
		    $this.css({"left": faWidth - thisWidth});
		    
		}
		if (moveY < 0) {
		    $this.css({"top": "0"});
		}
		if (moveY > (faHeight - thisHeight)) {
		    
		    $this.css({"top": faHeight - thisHeight});
		}
	    }
	    thisAllMove();
	});
    },
    resize:function(data){
	var $this = $(this),
	$father = $this.parent(),
	$grandpa = $father.parent();

	//---初始化
	$grandpa.css({"position": "relative", "overflow": "hidden"});
	$this.css({"position": "absolute", "cursor": "nw-resize", 'right':0, 'bottom':0});
	var maxWidth;
	var maxHeight;
	var positionX;
	var positionY;
	var mDown = false;
	
	function setData(pos)
	{
	    $father.data(pos);
	    return false;
	}
	
	$this.mouseup(function(e){
	    mDown = false;
	    positionX = e.pageX;
	    positionY = e.pageY;
	});
	
	$this.mousedown(function(e){
	    e.stopPropagation();
	    if(typeof($father.position()) == "undefined" )
	    {
		return;
	    }
	    positionX = e.pageX;
	    positionY = e.pageY;
	    maxWidth = $grandpa.width() - $father.position().left;
	    maxHeight = $grandpa.height() - $father.position().top;
	    mDown = true;
	});
	
	$this.mousemove(function(e){
	    if(mDown == true)
	    {
		var newPos = {
			width: $father.width() + e.pageX - positionX,
			height: $father.height() + e.pageY - positionY
		};
		if (newPos.width < 100) newPos.width = 100;
		if (newPos.height < 100) newPos.height = 100;
		if (newPos.width > maxWidth) newPos.width = maxWidth;
		if (newPos.height > maxHeight) newPos.height = maxHeight;
		
		console.log(newPos);
		
		$father.css(newPos);
		positionX = e.pageX;
		positionY = e.pageY;
	    }
	    else
	    {
		return;
	    }
	});
    }
}); 