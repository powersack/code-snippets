
    $.scrollTo = function($el, margin){
        var target = 0;
        if(typeof $el === "object" && $el.length) {
            target = $el.offset().top;
        } else if(typeof $el === "number"){
            target = $el;
        }
        if(!margin) margin = 0;
        $("html, body").animate({
            scrollTop: target - margin
        }, 350);

        return false;
    };
