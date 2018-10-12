// conditions
moondust.add("is mobile", function(){
    return moondust.prop < 1.07 || this.if("is mobile landscape");
});

moondust.add("is mobile landscape", function(){
    return moondust.prop > 1.75 && moondust.isMobile;
});

// actions
moondust.add("toggle-class", function(valid, className){
    this.element.classList[valid ? "add" : "remove"](className);
});

// profiles
moondust.Profile("main-container").add(
    new moondust.Constraint(function() {
        this.if("is mobile").do("toggle-class", "mobile");
        this.if("is mobile landscape").do("toggle-class", "mobile-landscape");
    })
);

moondust.Profile("moondust-ready").add(
    new moondust.Constraint(function() {
        this.element.classList.add("moondust-ready");
        this.element.moondust.remove("moondust-ready");
    })
);

moondust.Profile("moondust-ready").add(
    new moondust.Constraint(function() {
        this.element.classList.add("moondust-ready");
        this.element.moondust.remove("moondust-ready");
    })
);