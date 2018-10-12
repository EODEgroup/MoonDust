moondust.add("text-resize", function(valid, fontMaxPercent) {
    this.element.style.fontSize = fontMaxPercent+"%";

    if (!valid) return;

    let elem;
    let lastChild = null;
    if (this.element.data("textcontainer") && this.element.data("elembottom")) {
        elem = moondust.getReference(this.element, this.element.data("textcontainer"));
        lastChild = moondust.getReference(this.element, this.element.data("elembottom"));
    }
    else {
        elem =
            !this.element.lastChild.lastChild
            || this.element.lastChild.bottom >= this.element.lastChild.lastChild.bottom
            ? this.element
            : this.element.lastChild;

        if (elem.lastChild && !Text.prototype.isPrototypeOf(elem.lastChild) && getComputedStyle(elem.lastChild).position == "absolute") {
            lastChild = elem.lastChild;
            do {
                lastChild = lastChild.previousElementSibling;
            }
            while (lastChild && getComputedStyle(lastChild).position == "absolute");
        }
    }

    if (!elem || Text.prototype.isPrototypeOf(elem)) return;

    let padding = parseFloat(getComputedStyle(elem).paddingBottom);
    let fsize = parseInt(fontMaxPercent);
    while (fsize > 50 && parseInt((lastChild || elem.lastChild).bottom) > parseInt(elem.bottom-padding)) {
        this.element.style.fontSize = (fsize--)+"%";
    }
});

moondust.add("text-r1line", function(valid, fontMaxPercent) {
    this.element.style.fontSize = fontMaxPercent+"%";

    if (!valid || !this.element.isConnected) return;

    this.element.style.height = "1em";
    let maxHeight = this.element.height;
    this.element.style.height = null;

    let fsize = parseInt(fontMaxPercent);
    while (this.element.height > maxHeight) {
        this.element.style.fontSize = (fsize--)+"%";
    }
});

moondust.add("text-lineheight-resize", function(valid, fontMaxPercent, fontMinPercent) {
    this.element.style.fontSize = fontMaxPercent+"%";

    if (!valid || !this.element.isConnected) return;

    let fsize = parseInt(fontMaxPercent);
    var hei = this.element.getRect().height;
    var computedStyle = getComputedStyle(this.element);
    hei -= (parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom));

    let fun = cs => cs.inlineSize.length > 0 ? parseFloat(cs.inlineSize) : parseFloat(cs.lineHeight);

    while (fun(computedStyle) > hei) {
        if (fsize < fontMinPercent) {
            this.element.style.fontSize = (fontMinPercent--)+"%";
            break;
        }

        this.element.style.fontSize = (fsize--)+"%";
        computedStyle = getComputedStyle(this.element);
    }
});

moondust.Profile("text-inside").add(
    new moondust.Constraint(function() {
        // next frame
        setTimeout(() => {
            this.do("text-resize", this.element.dataset.fontMaxSize || 100);
        });
    })
);

moondust.Profile("text-1line").add(
    new moondust.Constraint(function() {
        // next frame
        setTimeout(() => {
            this.do("text-r1line", this.element.dataset.fontMaxSize || 100);
        });
    })
);

moondust.Profile("lineHeight-resize").add(
    new moondust.Constraint(function() {
        // next frame
        setTimeout(() => {
            this.do("text-lineheight-resize", this.element.dataset.fontMaxSize || 100, this.element.dataset.fontMinSize || 100);
        });
    })
);

moondust.Profile("text-inside-landscape-min").add(
    new moondust.Constraint(function() {
        // next frame
        setTimeout(() => {
            this
                .if(() => {
                    return document.body.hasClass("landscape-min") && moondust.getReference(this.element, this.element.data("textcontainer"));
                })
                .do("text-resize", this.element.dataset.fontMaxSize || 100);
        });
    })
);