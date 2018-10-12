/* options */
moondust.add("small-size", 666);

/* if */
moondust.add("mobile-portrait", function()
	{
		return moondust.isMobile && moondust.screenRect.width < moondust.option("small-size");
	}
);

moondust.add("mobile-landscape", function()
	{
		return moondust.isMobile && moondust.screenRect.height < moondust.option("small-size");
	}
);

moondust.add("small-width", function()
	{
		return moondust.screenRect.width < moondust.option("small-size");
	}
);

moondust.add("small-height", function()
	{
		return moondust.screenRect.height < moondust.option("small-size");
	}
);

moondust.add("mobile", function()
	{
		return moondust.isMobile && (moondust.screenRect.width < moondust.option("small-size") || moondust.screenRect.height < moondust.option("small-size"));
	}
);

moondust.add("screen", function()
	{
		return moondust.screenRect.width >= moondust.option("small-size") && moondust.screenRect.height >= moondust.option("small-size");
	}
);

moondust.add("height > screen", function()
	{
		return this.element.offsetHeight > moondust.screenRect.height;
	}
);

moondust.add("screen-anchor", function(name, value)
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
moondust.add("height = screen", function(valid, velse)
	{
		this.element.style.height = valid ? moondust.screenRect.height+"px" : velse;
	}
);

moondust.add("screen-anchor-class", function(valid, name)
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
moondust.Profile("screen-anchor-class")
	.add(new moondust.Constraint(function()
		{
			this.do("screen-anchor-class", this.element.dataset.anchorName);
		})
	)
	.alive()
;
