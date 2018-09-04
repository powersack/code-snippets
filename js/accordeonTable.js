
        if($('.has-accordeon-table table').length){
            var $table = $('.has-accordeon-table table');
            var headlines = [];
            $table.find('thead tr:first-child th').each(function () {
                headlines.push($(this).html());
            });
            $table.find('tbody tr').each(function () {
                var $tr = $(this);
                var $accordeonTableContent = $('<div class="accordeon-table-content">');
                var $headTd;
                $tr.find('td').each(function (i, td) {
                    var $td = $(td);
                    switch (i){
                        case 0:
                            $td.addClass('accordeon-table-head');
                            var $tdHeadline = $('<div class="accordeon-table-head-headline">' + $td.html() + '</div>');
                            var $tdHeadlineIcon = $('<i class="fa fa-chevron-down accordeon-table-head-headline-icon">');
                            $tdHeadline.append($tdHeadlineIcon);

                            $td.html($tdHeadline);

                            $td.on('click', function () {
                                $tdHeadline.toggleClass('active');
                                $tdHeadlineIcon.toggleClass('fa-chevron-down').toggleClass('fa-chevron-up');
                                $tr.find('.accordeon-table-content').slideToggle();
                            });
                            $headTd = $td;
                            break;
                        default:
                            $td.addClass('accordeon-table-content-added');
                            if(headlines[i]){
                                $accordeonTableContent.append(
                                    $('<span class="accordeon-table-label">' + headlines[i] + ': </span>')
                                );
                            }
                            $accordeonTableContent.append($td.html() + '<br>');
                    }
                });
                $headTd.append($accordeonTableContent);

            });
        };