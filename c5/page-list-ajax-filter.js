;(function ($) {
    var AjaxPagination = function ($wrapper, containerSelector, onLoaded) {
        if(!containerSelector) return;
        this.$wrapper = $wrapper;
        this.containerSelector = containerSelector;
        this.$button = null;
        this.$pagination = null;
        this.$next = null;
        this.total = null;
        this.link = null;
        this.current = 2;
        this.onLoaded = onLoaded;

        this.init();
    };

    AjaxPagination.prototype.init = function () {
        var self = this;
        self.initPagination();
        self.$button.on('click', self.loadNext.bind(self));
    };

    AjaxPagination.prototype.initPagination = function () {
        var self = this;
        self.current = 2;
        self.$button = this.$wrapper.find('.loadResultsButton');
        self.$pagination = this.$wrapper.find('ul.pagination');

        // if(typeof $button === "undefined"){
        //     self.$button = $('<div>', {'class': 'loadResultsButton'});
        //     self.$wrapper.append(self.$button);
        // }

        if(!self.$pagination.length){
            self.$button.hide();
            return;
        }

        self.$next = self.$pagination.find('li.active').next();
        self.total = self.$pagination.find('li').length - 2;

        if(self.$next.length && !self.$next.hasClass('next') && self.$next.find('a').length){
            self.link = self.$next.find('a').attr('href');
            console.log(self.link)
        }

        if(self.total <= 0 || !self.link){
            self.$button.hide();
            return;
        }

        self.$button.show();
    };

    AjaxPagination.prototype.loadNext = function () {
        var self = this;
        if(self.$button.hasClass('loading')){
            return false;
        }

        var html = "";
        self.link = self.link.replace(/p=\d/, 'p='+self.current);

        self.current++;
        self.$button.addClass('loading');
        $.get(self.link, function (resp) {
            if(!resp) {
                self.$button.fadeOut();
                return;
            }
            html = resp;
            var $html = $(html);
            var $results = $html.find(self.containerSelector);

            var $newEntriesContainer = $('<div class="appended">').append($results.html());
            $(self.containerSelector).append($newEntriesContainer);

            self.$button.removeClass('loading');

            if(self.current > self.total){
                self.$button.fadeOut();
            }

            if(typeof self.onLoaded === 'function'){
                self.onLoaded($newEntriesContainer);
            }
        });
    };



    var BlogListAjaxFilter = function ($wrapper) {
        this.$wrapper = $wrapper;
        this.bID = $wrapper.data('bID');
        this.$blogList = $wrapper.find('.blog-list');
        this.$blogListEntries = $wrapper.find('.blog-list-entry');
        this.$filterSelects = $wrapper.find('.pagelist-filter select');
        this.$reset = $wrapper.find('.pagelist-filter-reset');
        this.$ajaxLoader = $wrapper.find('.filter-ajax-loader');
        this.$pagination = $wrapper.find('.ccm-pagination-wrapper');
        this.filterValues = {};
        this.ajaxPagination = null;

        this.init();
    };

    BlogListAjaxFilter.prototype.init = function () {
        var self = this;

        self.ajaxPagination = new AjaxPagination(self.$wrapper, '.blog-list-entries', function ($newEntriesContainer) {
            // $newEntriesContainer.find('.blog-list-entry:eq(1)').removeClass('active');
            self.initBlogListEntries($newEntriesContainer);
            self.$blogListEntries = self.$wrapper.find('.blog-list-entry');
        });

        self.$reset.on('click', function () {
            self.$filterSelects.each(function () {
                var $select = $(this);
                var val = 'reset';
                var filter = $select.data('filter');
                $select.val(val).selectric('refresh');
                self.filterValues[filter] = val;
            });
            self.update();

            return false;
        });
        self.$filterSelects.on('change', function () {
            self.$filterSelects.each(function () {
                var $select = $(this);
                var val = $select.val();
                var filter = $select.data('filter');

                self.filterValues[filter] = val;
            });
            self.update();
        });

        self.initBlogListEntries();

        //load & append search results via ajax
        self.ajaxPagination.initPagination();

    };

    BlogListAjaxFilter.prototype.initBlogListEntries = function ($container) {
        var self = this;
        var $entries = self.$blogListEntries;


        if($container && $container.length){
            $entries = $container.find('.blog-list-entry');
        }

        //ausklapp-funktion
        $entries.each(function (i,el) {
            var $entry = $(el);
            var $trigger = $entry.find('.blog-entry-trigger');
            var $image = $entry.find('.blog-list-banner-image');
            var imageSrc = $image.data('image');
            var $description = $entry.find('.blog-entry-description');


            if(i === 0){
                $entry.addClass('active');
                $description.show();
                $image.css('background-image', 'url(' + imageSrc + ')');
            }

            $trigger.on('click', function () {
                if(imageSrc){
                    var $imgload = $('<img>', {src: imageSrc});
                    $image.css('background-image', 'url(' + imageSrc + ')');
                    $imgload.on('load', function () {
                        $entry.toggleClass('active');
                        $description.slideToggle(300);
                    });
                } else {
                    $entry.toggleClass('active');
                    $description.slideToggle(300);
                }
            });
        });
    };



    BlogListAjaxFilter.prototype.update = function () {
        var self = this;
        console.info(self.filterValues);
        var requestData = self.filterValues;
        requestData.filter_blog = 1;
        requestData.bID = self.bID;
        self.$ajaxLoader.fadeIn();

        $.get(window.location.href, requestData, function (data) {
            if(!data) return;
            var $data = $(data);

            var $html = $data.find('.blog-list');
            var $paginationHtml = $data.find('.ccm-pagination-wrapper');

            if($html.length){
                self.$blogList.html($html.html());
            }

            self.$pagination.html('');
            if($paginationHtml.length){
                self.$pagination.html($paginationHtml.html());
            }

            self.ajaxPagination.initPagination();
            self.$wrapper.removeClass('loading');
            self.$ajaxLoader.fadeOut();
            self.$blogListEntries = self.$wrapper.find('.blog-list-entry');
            self.initBlogListEntries();
        });
    };

    $.fn.ajaxPagination = function (options) {
        if(!options) options = {
            containerSelector: '',
            onLoaded: null
        };

        return this.each(function() {
            new AjaxPagination($(this), options.containerSelector, options.onLoaded);
        });
    };

    $.fn.blogListAjaxFilter = function () {
        return this.each(function() {
            new BlogListAjaxFilter($(this));
        });
    };

}(jQuery));