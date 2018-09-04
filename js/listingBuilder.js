
var listingBuilder = (function(listingBuilder){
var ListingBuilder = function(listingId, jsonData, fieldMap, options){
//    
//    //obj -> arr
//    var jsonDataArray =[];
//    for(var i in jsonData){
//        jsonDataArray.push(jsonData[i]);
//    }
    
    Object.defineProperties(this,{
        _listingId:{
            value: listingId
        },
        _jsonData:{
            value: jsonData
        },
        _filteredData:{
            value: jsonData,
            writable: true
        },
        _filters:{
            value: {}
        },
        _fieldMap:{
            value: fieldMap
        },
        _filterOptions:{
            value: null,
            writable: true
        },
        _filterOptionsItems:{
            value: null,
            writable: true
        },
        _options:{
            value: options || {}
        },
        sortField:{
            value: null,
            writable: true
        },
        sortDir:{
            value: null,
            writable: true
        },
        pages:{
            value: 1,
            writable: true
        },
        objectsPerPage:{
            value: 18,
            writable: true
        },
        currentPage:{
            value:1,
            writable: true
        },
        _loadingImages:{
            value: 0,
            writable: true
        },
        _images:{
            value: []
        }
    });

    this._init();

};

Object.defineProperties(ListingBuilder.prototype, {
_init:{
    value:function(){
        var lb = this,
            options = this._options;
        
        $('#'+lb._listingId).addClass('listingBuilder');
        lb._addFilterValuesStr();
        if(options.GUI){
            //add control-functions
            if(options.GUI.controls){
                var controls = options.GUI.controls;
                for(var type in controls){
                    switch(type){
                        case 'objectsPerPage':
                            var $oppControls = $('#'+controls[type]).find('a');
                            $oppControls.each(function(){
                                $(this).off('click');
                                $(this).on('click', function(){
                                    var opp = $(this).attr('data-lb-objectsperpage');
                                    if(!opp) return false;
                                    lb.setObjectsPerPage(opp);
                                    $oppControls.removeClass('active'); 
                                    $(this).addClass('active');
                                });
                            });
                            break;
                        case 'pageNav':
                            var $pnNav = $('#'+controls[type]).find('a');
                            $pnNav.each(function(){
                                $(this).off('click');
                                $(this).on('click', function(){
                                    var navAttr = $(this).attr('data-lb-pagenav');
                                    if(!navAttr) return false;
                                    switch(navAttr){
                                        case 'first': lb.firstPage(); break;
                                        case 'prev': lb.prevPage(); break;
                                        case 'next': lb.nextPage(); break;
                                        case 'last': lb.lastPage(); break;
                                    }
                                });
                            });
                            break;
                        default: console.log('undefined controls type');
                    }
                }
            }//add control-functions end
        }

        if(options.objectsPerPage){
            lb.objectsPerPage = options.objectsPerPage;
        }

        var $listing = $('#'+this._listingId);

        if(!options.nosort) $listing.addClass('sortable');
        if(options.trOnClick)$listing.addClass('trClickable');
        
        if(!lb._parseHash()){
            lb.build();
        }
        
        if(options.onCreate){
            options.onCreate(this);
        };
    }
},
buildFilterHash:{
    value: function(){
        var lb = this;
        var hash = '#';
        
        for(var field in lb._filters){
            hash += '&' + field + '=' + lb._filters[field];
        }
        
        window.location.hash = hash;
    }
},
_parseHash:{
    value: function(){
        var lb = this;
        var hash = window.location.hash;
        
        if(!hash) return false;
        
        var filterArr = hash.split('&');
        
        for(var i = 1; i < filterArr.length; i++){
            var filter = filterArr[i].split('=');
            lb.addFilter(filter[0], filter[1]);
            
//            var name = filter[0].replace('_str', '');
//            $('select[name="'+name+'"]').val(filter[1]).trigger('change');
//            console.info($('select[name="'+name+'"]'), filter[1])
        }
        
        lb.filter();
    }
},
_updateSelects:{
    value: function(){
        var lb = this,
            filterOptions = lb._filterOptions,
            filters = lb._filters,
            filterOptionsItems = lb._filterOptionsItems, 
            filteredData = lb._filteredData;
        
        for(var filterType in filterOptionsItems){
            var $select = $('select[name="' + filterType + '"]');
            
            for(var attr in filterOptionsItems[filterType]){
                var $option = $select.find('option[value="' + attr + '"]');
                
                var results = 0;
                
                for(var d = 0; d < filteredData.length; d++){
                    var item = filteredData[d],
                        itemFilterValues = item.filters[filterType].values;
                    
                    if($.inArray(attr, itemFilterValues)){
                        results++;
                    }
                }
            }
        }
    }
},
_addFilterValuesStr:{
    value: function(){
        //jeder Datensatz bekommt einen String aus dem Array nach dem später per RegExp gefiltert werden kann
        var lb = this,
            data = lb._jsonData,
            fData = lb._filteredData; 
    
        for(var i = 0; i < fData.length; i++){
            var itemFilters = fData[i].filters;
            
            for(var id in itemFilters){
                var itemFilterValues = itemFilters[id]['values'];

                if(itemFilterValues){
                    var str = '';
                    for(var s = 0; s < itemFilterValues.length; s++){
                        str += itemFilterValues[s] + ' ';
                    }
                    data[i][id + '_str'] = str;
                    //string ende
                }
            }
        }
    }
},
buildFilterGUI:{
    value: function(filterGUISelector){
        var lb = this;
        var $filterGUI = $(filterGUISelector);
        
        var filterOptions = lb._getFilterOptions();
        lb._gatherFilterItems();
        
        $filterGUI.html('');
        
        for(var s in filterOptions){
            (function(s){
                var values = filterOptions[s]['values'];
                var $select = $('<select name="' + s + '" class="filterSelect"></select>');
                var $reset = $('<option value="reset">' + filterOptions[s]['name'] + '...' + '</option>');
//                var filters = null;
//                
//                if(lb.filters && !$.isEmptyObject(lb.filters)){
//                    filters = lb.filters;
//                }
//                
                $select.append($reset);

                for(var f = 0; f < values.length; f++){
                    
                    var $option =  $('<option value="' + values[f] + '">' + values[f] + '</option>');
                    $select.append($option);
                }

                $select.on('change', function(){
                    var field = s + '_str';
                    var val = $select.val();
                    
                    if(val === 'reset'){
                        lb.removeFilter(field).filter();
                    } else {
                        lb.removeFilter(field).addFilter(field, val).filter();
                    }
                    
                    lb.buildFilterHash();
                    //lb.buildFilterGUI();
                });
                
                $filterGUI.append($select);
            }(s));
        }
        
        $filterGUI.find('select').fancySelect();
    }
},
_getFilterOptions:{
    value: function(){
        var lb = this,
            data = lb._jsonData; 
        
        var filterOptions = {};
        
        //gather & unify data
        for(var i = 0; i < data.length; i++){
            var itemFilters = data[i].filters;
            
            for(var id in itemFilters){
                var itemFilterValues = itemFilters[id]['values'];

                if(itemFilterValues){                    
                    if(filterOptions[id]){
                        var existingFilterValues = filterOptions[id]['values'];

                        $.grep(itemFilterValues, function(el) {
                                if (jQuery.inArray(el, existingFilterValues) == -1) {
                                    filterOptions[id]['values'].push(el);
                                };
                        });
                        
                    } else {
                        filterOptions[id] = itemFilters[id];
                    }
                }
            }
        }
        
        lb._filterOptions = filterOptions;
        return filterOptions;
    }
},
_gatherFilterItems:{
    value: function(){
        var lb = this,
            data = lb._jsonData,
            filterOptions = lb._filterOptions; 
    
        if(filterOptions === null){
            console.log('init filterOptions first')
            return false;
        }
        
        var filterOptionsItems = {};
        
        for(var filterType in filterOptions){
            
            var filterOptionsValues = filterOptions[filterType].values;
            
            var filterOptionsValueItems = {};

            for(var i = 0; i < data.length; i++){
                var item = data[i];

                if(item.filters[filterType]){
                    var itemFilterValues = item.filters[filterType].values;
                    
                    if(itemFilterValues){
                    
                        for(var v = 0; v < itemFilterValues.length; v++){
                            var itemFilterValuesName = itemFilterValues[v];
                            
                            if($.inArray(itemFilterValues[v], filterOptionsValues)){
                                if(!filterOptionsValueItems[itemFilterValuesName]){
                                    filterOptionsValueItems[itemFilterValuesName] = [];
                                }
                                filterOptionsValueItems[itemFilterValuesName].push(item.id); //ids werden gesammelt
                            };
                        }
                    }
                }
            }
            filterOptionsItems[filterType] = filterOptionsValueItems;
            console.log(filterOptionsValueItems)
        }
        lb._filterOptionsItems = filterOptionsItems;
        
        return filterOptionsItems;
    }   
},
_updateGUI:{  
    value:function(){
        if(!this._options.GUI) return;

        var displays = this._options.GUI.displays;
        if(!displays) return;

        for(var type in displays){
            switch(type){
                case 'objectsSum':
                    $(displays[type]).html(
                        this._filteredData.length
                    );
                    break;
                case 'pageXofY':
                    $(displays[type]).html(
                        'Seite <strong>'+this.currentPage+'</strong> von '+this.pages
                    );
                    break;
                default: console.log('undefined display type');
            }
        }
    }
},
onImagesLoaded:{
    value: function(){
        var dt = this;
        $('#' + dt._listingId + ' .articleBox').fadeIn(500);
        
    }
},
build:{
    value:function(append){
        var dt = this;
        var listingId = dt._listingId, 
            data = dt._filteredData, 
            options = dt._options;
        
        dt._images = [];

        var $listing = $('#'+listingId);
        
        var from = 0,
            to = dt.objectsPerPage ;
    
        this.pages = Math.ceil(data.length / dt.objectsPerPage);

        from = dt.objectsPerPage * (dt.currentPage-1);
        to =   dt.objectsPerPage * dt.currentPage;
        
        if(to > data.length) to = data.length;
        
        if(!append) $listing.html("");
        
        for(var i = from; i < to; i++){
            
            (function(i){
                var d = data[i];
                
                var image = data[i]['image'];
                var description_long = data[i]['description_long'];
                var articleName = data[i]['articleName'];
                var linkDetails = data[i]['linkDetails'];
                var price = data[i]['price'];
                
                var loadingImage = new Image();
                loadingImage.src = image;
                loadingImage.onload = function(){
                    dt._loadingImages++;
                    if(dt._loadingImages >= dt._images.length){
                        dt.onImagesLoaded();
                    }
                };
                dt._images.push(loadingImage);
                
                var $articleBox = $(
                    '<div class="articleBox"></div>'
                    );
                    
                var $inner = $('<div class="inner" style="background-image: url('+image+')"></div>');
                
                var $clickAnchor = $('<a class="clickAnchor" href="'+linkDetails+'" title="'+articleName+'"></a>');
                    
                var $articleDescription = $(
                    '<div class="articleDescription">'+
                        '<p class="name">'+
                            '<a href="'+linkDetails+'" title="'+articleName+'">'+articleName+'</a>'+
                        '</p>'+
                        '<p class="description">'+description_long+'</p>'+
                        '<p class="price">'+price+'</p>'+
                    '</div>'
                    );
                
                var $actions = $(
                        '<div class="actions">'+
                            '<a class="buynow" href="'+linkDetails+'" title="'+articleName+'">Kaufen</a>'+
                            '<a class="more" href="'+linkDetails+'" title="'+articleName+'">i</a>'+
                        '</div>'
                    );
                
                $inner.append($clickAnchor);
                $inner.append($articleDescription);
                $inner.append($actions);
                $articleBox.append($inner);
                $listing.append($articleBox);
            }(i));
        }

        dt._updateGUI();

        if(options.onBuild){
            var onBuild = options.onBuild;

            var args =[];
            if(onBuild.args){
                for(var a = 0; a < onBuild.args.length; a++){
                    args.push(onBuild.args[a]);
                }
            }

            onBuild.func(args);
        }
        
        return this;
    }
},
addFilter:{ 
    value:function(field, str, explicit){
        if(!field) return false;
        if(typeof str === 'undefined' || str === null) return false;
        if(typeof this._jsonData[0][field] === 'undefined' || this._jsonData[0][field] === null) return false;

        if(explicit) str = '^' + str + '$';

        this._filters[field] = str;

        return this;
    }
},
removeFilter:{
        value:function(field){
        delete this._filters[field];

        return this;
    }
},
resetFilters:{
    value:function(){
        this._filters={};

        return this;
    }
},
filter:{
    value:function(checkFilter, filter){
        var lb = this;
        var filters = (checkFilter) ? filter : lb._filters;
        var options = lb._options;
        
        //on filter callback
        if(options.onFilter){
            var onFilter = options.onFilter;

            var args =[];
            if(onFilter.args){
                for(var a = 0; a < onFilter.args.length; a++){
                    args.push(onFilter.args[a]);
                }
            }

            onFilter.func(args);
        }

        //no filter
        if($.isEmptyObject(filters)){
            lb._filteredData = lb._jsonData;
            lb.currentPage = 1;
            if(lb.sortDir!== null && lb.sortField!== null){
                lb.sort(lb.sortField, lb.sortDir);
            } else {
                lb.build();
            }
            
        //filter
        } else {
            var data = lb._jsonData;
            var filteredData = [];

            for(var i = 0; i < data.length; i++){
                var check = true;
                for(var field in filters){
                    if(data[i][field]){
                        var str = filters[field];
                        var regexp = new RegExp(str);

                        var matches = data[i][field].match(regexp);
                        if(!matches){
                            check=false;
                        }
                    } else {
                        check=false;
                    }
                }

                if(check) filteredData.push(data[i]);
            }
            
            console.log(filteredData.length)
            
            if(checkFilter) return filteredData.length;
            
            //build
            if(filteredData.length){
                lb._filteredData = filteredData;
                lb.currentPage = 1;;
                if(lb.sortDir!== null && lb.sortField!== null){
                    lb.sort(lb.sortField, lb.sortDir);
                    console.log('sort')
                } else {
                    lb.build();
                }
            } else {
                lb._onFilterNoMatches();
            }
            
        }

        return this;
    }
},
checkFilter:{
    value: function(field, value){
        var lb = this;
        var filters = lb._filters || {};
        
        filters[field] = value;
        
        var count = lb.filter(true, filters);
        
        console.log(count)
        
    }
},

_onFilterNoMatches:{
    value: function(){
        console.log('no matches');
    }
},
sort:{
    value:function(field, descasc){
        if(field === 'reset'){
            this.sortField = null;
            this.sortDir = null;
        } else {
            this.sortField = field;
            this.sortDir = (descasc) ? 'desc' : 'asc';
        }
        
        this.currentPage = 1;
        
        this._filteredData = this._filteredData.sort(function(a,b) {
            if (a[field] < b[field])
                return (descasc === 'desc') ? 1 : -1;
            if (a[field] > b[field])
                return  (descasc === 'desc') ? -1 : 1;
            return 0;
        });

        this.build();
        return this;
    }
},
findItem:{
    value:function(params, single){
        if(!params){
            console.log('no search params given');
            return false;
        }
        var data = this._jsonData;
        var results = [];

        for(var i = 0; i < data.length; i++){
            var check = true;

            for(var p in params){
                if(data[i][p] !== params[p]){
                    check = false;
                }
            }

            if(check){
                var result = {
                    result: data[i],
                    index: i
                };
                
                if(single) return result;
                results.push(result);
            }
        }
        return results;
    }
},
setItem:{
   value: function(index, obj){
       this._jsonData[index] = obj;
       this._filteredData = this._jsonData;
       this.filter();
   }
},
setObjectsPerPage:{ 
        value:function(n){
        this.objectsPerPage = n;
        this.currentPage = 1;
        this.build();
        return this;
    }
},
nextPage:{ 
    value:function(append){
        var page = this.currentPage;
        page++;
        if(page <= this.pages){
            this.currentPage = page;
            this.build(append);
            return this;
        }
        
        return false;
    }
},
prevPage:{ 
    value:function(){
        var page = this.currentPage;
        page--;
        if(page > 0){
            this.currentPage = page;
            this.build();
            return this;
        }
        return false;
    }
},
lastPage:{ 
    value:function(){
        this.currentPage = this.pages;
        this.build();
        return this;
    }
},
firstPage:{ 
    value: function(){
        this.currentPage = 1;
        this.build();
        return this;
    }
}
});

listingBuilder.create = function(listingId, jsonData, fieldMap, options){
    return new ListingBuilder(listingId, jsonData, fieldMap, options);
};

return listingBuilder;
}(listingBuilder||{}));
