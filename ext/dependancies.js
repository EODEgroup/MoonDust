/* if */
_o_.add("width > height", function()
	{
		return this.element.clientWidth > this.element.clientHeight;
	}
);

_o_.add("width < height", function()
	{
		return this.element.clientWidth < this.element.clientHeight;
	}
);

_o_.add("width > parent", function()
	{
		return this.element.clientHeight > this.element.parentNode.clientHeight;
	}
);

_o_.add("height > parent", function()
	{
		return this.element.clientHeight > this.element.parentNode.clientHeight;
	}
);

_o_.add("parent.h > parent.w", function()
	{
		return this.element.parentNode.clientHeight > this.element.parentNode.clientWidth;
	}
);

_o_.add("parent.h < parent.w", function()
	{
		return this.element.parentNode.clientHeight < this.element.parentNode.clientWidth;
	}
);

_o_.add("% visible", function(compare)
	{
		var rect = this.element.getClientRects()[0];
		var totalArea = rect.width*rect.height;

		var actualHeight = 0;
		if( rect.top < 0 ) actualHeight += rect.top;
		if( _o_.screenRect.height-rect.bottom < 0 ) actualHeight += (_o_.screenRect.height-rect.bottom);
		actualHeight += rect.height;

		var actualWidth = 0;
		if( rect.left < 0 ) actualWidth += rect.left;
		if( _o_.screenRect.right-rect.right < 0 ) actualWidth += (_o_.screenRect.right-rect.right);
		actualWidth += rect.width;

		var actualArea = actualWidth*actualHeight;

		return compare(actualArea*100/totalArea);
	}
);

/* actions */
_o_.add("height-ratio", function(valid, ref, style, ratio)
	{
		if( !valid ) return;

		this.element.style[style] = (_o_.getReference(this.element, ref).clientHeight*ratio)+"px";
	}
);

_o_.add("width-ratio", function(valid, ref, style, ratio)
	{
		if( !valid ) return;

		this.element.style[style] = (_o_.getReference(this.element, ref).clientWidth*ratio)+"px";
	}
);

_o_.add("middle", function(valid)
	{
		if( !valid ) return;

		this.element.style.marginTop = "0";
		this.element.style.marginBottom = "0";
		this.element.style.height = "auto";


		var parentContentHeight = this.element.parentNode.offsetHeight - parseFloat(getComputedStyle(this.element.parentNode).paddingTop) - parseFloat(getComputedStyle(this.element.parentNode).paddingBottom);
		var margin = (parentContentHeight - this.element.offsetHeight) / 2;
		if( margin > 0 )
		{
			this.element.style.marginTop = margin+"px";
			this.element.style.marginBottom = margin+"px";
			this.element.style.height = parentContentHeight+"px";
		}
		else
		{
			this.element.style.height = "100%";
		}
	}
);

_o_.add("width = content", function(valid)
	{
		var w = 0;

		for( var i = 0; i < this.element.children.length; ++i )
		{
			var comp = getComputedStyle(this.element.children[i]);
			w += this.element.children[i].offsetWidth
				+ Math.ceil(parseFloat(comp.marginLeft))
				+ Math.ceil(parseFloat(comp.marginRight))
				+ Math.ceil(parseFloat(comp.borderLeftWidth))
				+ Math.ceil(parseFloat(comp.borderRightWidth));
		}

		this.element.style.width = w+"px";

		if( w > this.element.parentNode.offsetWidth )
		{
			this.element.style.marginLeft = ((this.element.parentNode.offsetWidth/2)-(w/2))+"px";
		}
		else
		{
			this.element.style.marginLeft = 0;
		}
	}
);

_o_.add("swap-position", function(valid, other)
	{
		if( !other ) return;

		// create position element
		if( !this.element.dataset.spirit )
		{
			var spirit = document.createElement("div");
			spirit.id = "swap-position"+document.querySelectorAll(".swap-position-spirit").length;
			spirit.classList.add("swap-position-spirit");
			this.element.dataset.spirit = spirit.id;

			this.element.parentNode.insertBefore(spirit, this.element.nextElementSibling);
		}

		var sp = document.getElementById(this.element.dataset.spirit);

		if( valid )
		{
			if( sp.previousElementSibling == this.element )
			{
				other.parentNode.insertBefore(this.element, other);
				sp.parentNode.insertBefore(other, sp);
			}
		}
		else
		{
			
			if( sp.previousElementSibling == other )
			{
				other.parentNode.insertBefore(other, this.element);
				sp.parentNode.insertBefore(this.element, sp);
			}
		}
	}
);

/* Profiles */
_o_.Profile("rect-width")
	.add(new _o_.Constraint(function()
		{
			this.do("height-ratio", this.element.dataset.ref || this.element, "width", this.element.dataset.ratio || 1);
		})
	)
;

_o_.Profile("rect-height")
	.add(new _o_.Constraint(function()
		{
			this.do("width-ratio", this.element, "height", this.element.dataset.ratio || 1);
		})
	)
;

_o_.Profile("container-responsive")
	.add(new _o_.Constraint(function()
		{
			this.if("height > screen").do("height = screen", null);
		})
	)
;

_o_.Profile("container-ratio")
	.add(new _o_.Constraint(function()
		{
			if( _o_.if("! small-width") )
			{
				this.element.style.width = "100%";

				this
					.do("width-ratio", this.element, "height", parseFloat(this.element.dataset.ratio) || 1)
					.do("height-ratio", this.element, "width", 1/(parseFloat(this.element.dataset.ratio) || 1))
				;
			}
			else
			{
				this.element.style.width = null;
				this.element.style.height = null;
			}
		})
	)
	.add(new _o_.Constraint(function()
		{
			if( _o_.if("! small-width") )
			{
				this
					.if("width > parent")
					.do("width-ratio", this.element, "height", parseFloat(this.element.dataset.ratio) || 1)
				;
			}
		})
	)
;

_o_.Profile("container-middle")
	.add(new _o_.Constraint(function()
		{
			this.do("middle");
		})
	)
;

_o_.Profile("container-slider")
	.add(new _o_.Constraint(function()
		{
			this.do("width = content");
		})
	)
;

_o_.Profile("visibility-class")
	.add(new _o_.Constraint(function()
		{
			var compare = parseInt(this.element.dataset.percent) || 50;

			this
				.if("% visible", function(percent){ return percent > compare; })
				.do("class", "visible");
			;
		})
	)
	.alive()
;

_o_.Profile("small-width-swap")
	.add(new _o_.Constraint(function()
		{
			this.if("small-width").do("swap-position", document.querySelector(this.element.dataset.swap));
		})
	)
	.alive()
;