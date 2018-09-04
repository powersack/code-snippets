;(function ($) {
    $.scrollTo = function($el, margin, speed){
        var target = 0;
        if(typeof $el === "object" && $el.length) {
            target = $el.offset().top;
        } else if(typeof $el === "number"){
            target = $el;
        }
        if(!margin) margin = 0;
        speed = typeof speed === 'number' ? speed : 350;
        $("html, body").animate({
            scrollTop: target - margin
        }, speed);

        return false;
    };

    $(document).ready(function () {
        var AccTabs = function ($el) {
            this.$el = $el;
            this.$wrapper = null;
            this.$tabs = null;
            this.$activeTab = null;
            this.$tabNav = null;
            this.$tabNavItems = null;
            this.headerSelector = '#page-header'; //for fixed headers
            this.breakpoint = '992px';
            this._init();
        };

        AccTabs.prototype.isBig = function () {
            var me = this;
            return window.matchMedia('screen and (min-width: ' + me.breakpoint + ')').matches;
        };

        AccTabs.prototype._init = function () {
            var me = this;
            me.$wrapper = $('<div class="acc-tabs-wrapper">');
            me.$el.wrap(me.$wrapper);

            me.$tabs = me.$el.find('.acc-tab');
            me.$activeTab = me.$tabs.first();

            me._buildTabNav();
            me._initTabs();
            me.$tabNavItems = me.$tabNav.find('.acc-tab-headline');
            me.$tabNavItems.eq(me.getActiveIndex()).addClass('is-active');
        };

        AccTabs.prototype._initTabs = function () {
            var me = this;
            me.$tabs.each(function () {
                var $tab = $(this);
                var $headline = $tab.find('.acc-tab-headline');
                var $nextButton = $tab.find('.acc-tab-next');

                $headline.click(function () {
                    me.setActive($tab);
                });

                $nextButton.click(function () {
                    me.next($nextButton);
                });

                me._addTabNavItem($headline);
            });

        };

        AccTabs.prototype._buildTabNav = function () {
            var me = this;
            me.$tabNav = $('<div class="acc-tab-nav">');
            me.$tabNav.insertBefore(me.$el);
        };

        AccTabs.prototype._addTabNavItem = function ($item) {
            if(!$item || !$item.length) return;
            var me = this;
            me.$tabNav.append($item.clone(true));
        };

        AccTabs.prototype.setActive = function ($tab) {
            if(!$tab.length) return;
            var me = this;

            var index = $tab.index();
            var margin = me.headerSelector ? $(me.headerSelector).height() : 0;

            me.$activeTab = $tab;

            me.$tabNavItems.eq(index).addClass('is-active').siblings().removeClass('is-active');
            $tab.addClass('is-active').siblings().removeClass('is-active');

            if(!me.isBig()) {
                window.setTimeout(function () {
                    $.scrollTo($tab, margin);
                }, 600);
            }

        };

        AccTabs.prototype.getActiveIndex = function () {
            var me = this;
            var activeIndex = 0;
            me.$tabs.each(function (i) {
                var $tab = $(this);
                if($tab.hasClass('is-active')){
                    activeIndex = i;
                    return false;
                }
            });
            return activeIndex;
        };

        AccTabs.prototype.next = function () {
            var me = this;
            me.setActive(me.$activeTab.next());
        };

        $.fn.accTabs = function () {
            return this.each(function() {
                var $el = $(this);
                new AccTabs($el);
            });
        };

        var AccTabsForm = function ($tabs, $form) {
            AccTabs.call(this, $tabs);
            this.$form = $form;
            this.$form.parsley();
            this.$form.parsley().on('form:error', this.goToErrorTab.bind(this));
        };

        AccTabsForm.prototype = Object.create(AccTabs.prototype);

        AccTabsForm.prototype.next = function ($nextButton) {
            var me = this;
            var group = $nextButton.data('step');
            var validated = me.$form.parsley().validate(group);
            if(validated){
                me.setActive(me.$activeTab.next());
            }
        };

        AccTabsForm.prototype.goToErrorTab = function () {
            var me = this;
            me.$tabs.each(function (i) {
                var $tab = $(this);
                if($tab.find('.parsley-error').length){
                    me.setActive($tab);
                    return false;
                }
            });
        };


        $.fn.accTabsForm = function () {
            return this.each(function() {
                var $form = $(this);
                var $tabs = $form.find('.acc-tabs');
                new AccTabsForm($tabs, $form);
            });
        };

        $('.acc-tabs-form').accTabsForm();

    });
}(jQuery));