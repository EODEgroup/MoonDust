/* options */
_o_.add("small-size", 666);

/* if */
_o_.add("mobile-portrait", function()
	{
		return _o_.isMobile && _o_.screenRect.width < _o_.option("small-size");
	}
);

_o_.add("mobile-landscape", function()
	{
		return _o_.isMobile && _o_.screenRect.height < _o_.option("small-size");
	}
);

_o_.add("small-width", function()
	{
		return _o_.screenRect.width < _o_.option("small-size");
	}
);

_o_.add("small-height", function()
	{
		return _o_.screenRect.height < _o_.option("small-size");
	}
);

_o_.add("mobile", function()
	{
		return _o_.isMobile && (_o_.screenRect.width < _o_.option("small-size") || _o_.screenRect.height < _o_.option("small-size"));
	}
);

_o_.add("screen", function()
	{
		return _o_.screenRect.width >= _o_.option("small-size") && _o_.screenRect.height >= _o_.option("small-size");
	}
);

_o_.add("height > screen", function()
	{
		return this.element.offsetHeight > _o_.screenRect.height;
	}
);

_o_.add("screen-anchor", function(name, value)
	{
		var anchors = document.querySelectorAll("[data-screen-anchor="+name+"]");

		var actual = 0;

		for( var i = 0; i < anchors.length; ++i )
		{
			if( anchors[i].getClientRects()[0].top <= 0 )
			{
				actual = i;
			}
			else
			{
				return anchors[actual].dataset.screenAnchor == value;
			}
		}

		return false;
	}
);

/* action */
_o_.add("height = screen", function(valid, velse)
	{
		this.element.style.height = valid ? _o_.screenRect.height+"px" : velse;
	}
);

_o_.add("screen-anchor-class", function(valid, name)
	{
		if( !valid ) return;

		var anchors = document.querySelectorAll("[data-screen-anchor="+name+"]");

		var actual = 0;
		var selectClass = "";
		var classes = [];

		for( var i = 0; i < anchors.length; ++i )
		{
			if( classes.indexOf(anchors[i].dataset.anchorClass) < 0 )
			{
				classes.push(anchors[i].dataset.anchorClass);
			}

			if( anchors[i].getClientRects()[0].top <= 0 )
			{
				selectClass = anchors[i].dataset.anchorClass;
			}
		}
		
		for( var i = 0; i < classes.length; ++i )
		{
			this.element.classList[classes[i] == selectClass ? "add" : "remove"](classes[i]);
		}
	}
);

/* profile */
_o_.Profile("screen-anchor-class")
	.add(new _o_.Constraint(function()
		{
			this.do("screen-anchor-class", this.element.dataset.anchorName);
		})
	)
	.alive()
;
