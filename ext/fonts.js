/* actions */
moondust.add("font-mobile", function(valid)
	{
		if( valid )
		{
			document.body.style.fontSize = "12px";
		}
	}
);

moondust.add("font-screen", function(valid)
	{
		if( valid )
		{
			if( moondust.prop > 1.2 )
			{
				if( moondust.prop > 1.45 && moondust.precSizes[0] > 1700 )
				{
					document.body.style.fontSize =
						Math.min(18,
							((moondust.precSizes[1]*12)/700)
						)+"px";
				}
				else
				{
					document.body.style.fontSize = Math.min(Math.max(((moondust.precSizes[1]/moondust.precSizes[0])*20), 12), 25)+"px";
				}
			}
			else
			{
				document.body.style.fontSize = "12px";
			}
		}
	}
);

moondust.add("text-resize", function(valid, fontMaxPercent, middle)
	{
		var node = document.createElement("div");
		node.style.pointerEvents = "none";
		node.style.position = "absolute";
		node.style.boxSizing = getComputedStyle(this.element).boxSizing;
		node.style.lineHeight = this.element.style.lineHeight || "1em";
		node.style.paddingLeft = getComputedStyle(this.element).paddingLeft;
		node.style.paddingRight = getComputedStyle(this.element).paddingRight;
		node.style.top = "0";
		node.style.left = "0";
		node.style.height = "auto";
		node.style.display = "inline-block";
		node.style.visibility = "hidden";
		node.style.width = (this.element.offsetWidth-1)+"px";
		node.innerHTML = this.element.innerHTML;
		node.style.fontSize = fontMaxPercent+"%";
		document.body.appendChild(node);

		var fsize = fontMaxPercent;
		while( node.offsetHeight > this.element.offsetHeight && fsize > 0 )
		{
			node.style.fontSize = (--fsize)+"%";
		}

		var padding = 0;
		if( middle && node.offsetHeight < this.element.offsetHeight )
		{
			padding = (this.element.offsetHeight-node.offsetHeight)/2;
		}

		document.body.removeChild(node);

		this.element.style.fontSize = fsize+"%";
		this.element.style.paddingTop = padding+"px";
	}
);

/* Profiles */
moondust.Profile("font-master")
	.add(new moondust.Constraint(function()
		{
			this.if("mobile").do("font-mobile").do("class", "mobile");

			if( moondust.if("mobile") )
			{
				document.querySelector("#meta-viewport").attributes.content.value = "user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1";
			}
			else
			{
				document.querySelector("#meta-viewport").attributes.content.value = "width=device-width, initial-scale=1";
			}
		})
	)
	.add(new moondust.Constraint(function()
		{
			this.if("screen").do("font-screen");
		})
	)
;

moondust.Profile("text-middle")
	.add(new moondust.Constraint(function()
		{
			this.do("text-resize", this.element.dataset.fontMaxSize || 100, true);
		})
	)
;

moondust.Profile("text-inside")
	.add(new moondust.Constraint(function()
		{
			this.do("text-resize", this.element.dataset.fontMaxSize || 100);
		})
	)
;