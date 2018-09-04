/**
 * Created by dv-CRVZ25J on 17.07.2015.
 */
(function($){
    sassParser = {
        tabSpaces: 2,
        spacer : ' ',
        newline: '\n',
        excludedTags: ['br', 'script'],
        addClassesToIds: true,

        parse: function($el, level){
            var sassParser = this;
            var $subEls = $el.children('*');
            var out = new String();
            var addedSelectors = [];
            var excludedTags = sassParser.excludedTags;

            if($subEls.length){
                $subEls.each(function(){
                    var $subEl = $(this);
                    var tagName = $subEl.prop("tagName").toLowerCase();
                    var id = $subEl.prop("id");
                    var className = $subEl.prop("className");

                    for(var i = 0; i < excludedTags.length; i++){
                        var tag = excludedTags[i];
                        if(tagName === tag) return false;
                    }

                    if(id){
                        id = '#' + id;
                    }

                    if(className){
                        //delete whitespaces
                        className = '.'+className.replace(/ +/gi, '.');
                    }

                    var selector = tagName + id + className;

                    //prevent duplicates
                    for(var i = 0; i < addedSelectors.length; i++){
                        var addedSelector = addedSelectors[i];
                        if(addedSelector === selector){
                            return false;
                        }
                    }

                    addedSelectors.push(selector);

                    //write out
                    for(var i =0; i < level*sassParser.tabSpaces; i++){
                        out += sassParser.spacer;
                    }

                    out +=  selector + '{' + sassParser.newline;

                    var subout = sassParser.parse($subEl, level+1);

                    if(subout){
                        out += subout + '}/*'+selector+'*/' + sassParser.newline;
                    };
                });
            };

            for(var i =0; i < (level-1)*sassParser.tabSpaces; i++){
                out += sassParser.spacer;
            }

            return out;
        },

        createOutput: function($el){
            var sassParser = this;
            var output = sassParser.parse($el, 0);
            return output;
        }
    };

    $.fn.sassParse = function(){
        sassParser.spacer = ' ';
        sassParser.newline = '\n';
        var consoleOut = sassParser.createOutput(this);
        console.log(consoleOut);

        sassParser.spacer = '&nbsp;';
        sassParser.newline = '<br>';
        var htmlOut  = sassParser.createOutput(this);
        var wnd = window.open("about:blank", "", "_blank");
        wnd.document.write(htmlOut);

        return this;
    };

}(jQuery));