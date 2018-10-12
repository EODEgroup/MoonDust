moondust.add("ratio by height", function(valid) {
    if (!valid) return;

    var ratio = parseFloat(this.element.data("ratio"));

    this.element.css("width", this.element.height*ratio);
    this.element.addClass("ratio-ready");
});

moondust.add("ratio by width", function(valid) {
    if (!valid) return;

    this.element.css("width", null);

    var ratio = parseFloat(this.element.data("ratio"));

    var height = this.element.width*ratio;

    if (height > this.element.parentNode.height) {
        this.element.css("width", this.element.width * (this.element.parentNode.height/height));
        height = this.element.parentNode.height;
    }
    this.do("box-center-margin");

    this.element.css("height", height);
    this.element.addClass("ratio-ready");
});

moondust.add("font-size by width", function(valid, min, max, fmin, fmax) {
    var width = this.element.width;
    var fsize = fmin+"px";
    // max size
    if (width > max) {
        fsize = fmax+"px";
    }
    else {
        fsize = (fmin+(((width-min)/(max-min))*(fmax-fmin)))+"px";
    }

    this.element.css("font-size", fsize);
});

moondust.add("box-middle-margin", function(valid) {
    if (!valid) {
        this.element.css("margin-top", null);
    }
    else {
        this.element.css("margin-top", (this.element.parentNode.height-this.element.height)/2);
    }
});

moondust.add("box-center-margin", function(valid) {
    if (!valid) {
        this.element.css("margin-left", null);
    }
    else {
        this.element.css("margin-left", (this.element.parentNode.width-this.element.width)/2);
    }
});

moondust.Profile("box-middle").add(
    new moondust.Constraint(function() {
        this.do("box-middle-margin");
    })
);

moondust.Profile("box-middle-mobile-landscape").add(
    new moondust.Constraint(function() {
        this.if("is mobile landscape").do("box-middle-margin");
    })
);

moondust.Profile("box-center").add(
    new moondust.Constraint(function() {
        this.do("box-center-margin");
    })
);

moondust.Profile("box-center-mobile").add(
    new moondust.Constraint(function() {
        this.if("is mobile").do("box-center-margin");
    })
);

moondust.Profile("box-ratio-height").add(
    new moondust.Constraint(function() {
        this.do("ratio by height");
    })
);

moondust.Profile("box-ratio-width").add(
    new moondust.Constraint(function() {
        this.do("ratio by width");
    })
);

moondust.Profile("box-font-size").add(
    new moondust.Constraint(function() {
        this.do("font-size by width", 200, 410, 6, 12);
    })
).wait();

moondust.Profile("ps").add(
    new moondust.Constraint(function() {
        Ps.initialize(this.element);
        this.element.moondust.remove("ps");
    })
);