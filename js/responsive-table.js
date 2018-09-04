
;(function ($) {
    if($('.responsive-table').length){
        $('.responsive-table').each(function () {
            var $table = $(this);
            if($table.data('no-label')) return;
            var $tableHead = $table.find('.responsive-table-head');
            var $tableRows = $table.find("> .row:not('.responsive-table-head')");
            $tableRows.each(function () {
                var $row = $(this);
                if($row.data('no-label')) return;
                var $cells = $row.find('> div');
                $cells.each(function (i, el) {
                    var $cell = $(el);
                    if($cell.data('no-label')) return;
                    var $tableHeadCell = $table.find('.responsive-table-head > div:nth-child('+(i+1)+')');
                    if($tableHeadCell.length){
                        var labelText = $tableHeadCell.html();
                        var $label = $('<div class="responsive-table-label">'+labelText+'</div>');
                        $cell.prepend($label);
                    }
                });
            });
        });
    }

    var mediaqueries = {
        sm: 'screen and (min-width: 480px)',
        md: 'screen and (min-width: 768px)',
        lg: 'screen and (min-width: 992px)',
        xl: 'screen and (min-width: 1260px)'
    };

    var ResponsiveTableSlider = function ($table, opts) {
        this.$table = $table;
        this.$tableHead = this.$table.find('.responsive-table-head');
        this.cols = this.$tableHead.find('> div').length;
        this.colWidth = this.$table.data('col-width') || 200;
        this.currentCol = 0;
        var mq = mediaqueries.md;
        if($table.hasClass('break-sm')) {
            mq = mediaqueries.sm;
        } else if($table.hasClass('break-lg')){
            mq = mediaqueries.sm;
        } else if($table.hasClass('break-xl')){
            mq = mediaqueries.xl;
        }
        this.mqBreakpoint = mq;
        this._init();
    };

    ResponsiveTableSlider.prototype = {
        _init: function () {
            var self = this;

            //add slider-containers
            var $inner = $('<div class="responsive-table-slider-inner">');
            var $slider = $('<div class="responsive-table-slider-slider">');
            $slider.width(self.cols * self.colWidth);
            self.$table.find('> *').wrapAll($inner.append($slider));
            self._addControls();
        },
        _addControls: function () {
            var self = this;

            var $controls = $('<div class="responsive-table-slider-controls">');
            var $prev = $('<div class="responsive-table-slider-prev">');
            var $prevButton = $('<i class="fa fa-chevron-left responsive-table-slider-prev-button"></i>');
            var $next = $('<div class="responsive-table-slider-next">');
            var $nextButton = $('<i class="fa fa-chevron-right responsive-table-slider-next-button"></i>');
            $prev.append($prevButton);
            $next.append($nextButton);
            $controls.append($prev);
            $controls.append($next);

            $prev.click(self.prev.bind(self));
            $next.click(self.next.bind(self));
            self.$table.append($controls);
            self.$table.addClass('has-controls');

            $(window).scroll(function() {
                var scrollTop = $(window).scrollTop();
                var controlsTop = $controls.offset().top;
                var controlsRelativeTop = controlsTop  - scrollTop;

                var tableBottom = self.$table.offset().top + self.$table.height();

                if(controlsRelativeTop < 100 && tableBottom - 200 > scrollTop){
                    $prevButton.addClass('sticky');
                    $nextButton.addClass('sticky');
                } else {
                    $prevButton.removeClass('sticky');
                    $nextButton.removeClass('sticky');
                }
            });

            $(window).resize(function () {
                if(!Modernizr.mq(self.mqBreakpoint)){
                    $prevButton.removeClass('sticky');
                    $nextButton.removeClass('sticky');
                    self.currentCol = 0;
                    self._setCurrent();
                }
            });
        },
        _setCurrent: function () {
            var self = this;

            var actualCellWidth = self.$tableHead.find('> div').outerWidth();
            var $currentCol = self.$tableHead.find('> div:nth-child('+(self.currentCol+1)+')');
            var $slideElement = self.$table.find('.responsive-table-slider-slider');
            $currentCol.addClass('current').siblings().removeClass('current');
            var currentMargin = $slideElement.css('margin-left');
            var currentColWidth = $currentCol.outerWidth();
            var target = actualCellWidth * self.currentCol * -1;
            // target = currentMargin - currentColWidth
            $slideElement.css('margin-left', target + 'px');
        },
        next: function () {
            var self = this;

            if(self.currentCol < self.cols-1) {
                self.currentCol++;
            } else {
                return false;
            }
            self._setCurrent();
        },
        prev: function () {
            var self = this;
            if(self.currentCol > 0) {
                self.currentCol--;
            } else {
                return false;
            }
            self._setCurrent();
        }
    };

    $.fn.responsiveTableSlider = function (options) {
        return this.each(function() {
            var $elem = $( this );
            new ResponsiveTableSlider($elem);
        });
    };

}(jQuery));