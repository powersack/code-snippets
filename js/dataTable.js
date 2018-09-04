var dataTable = (function(dataTable){
    var DataTable = function(tableId, jsonData, fieldMap, options, trFunction){
        Object.defineProperties(this,{
            _tableId:{
                value: tableId
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
            _options:{
                value: options || {}
            },
            pages:{
                value: 1,
                writable: true
            },
            objectsPerPage:{
                value: 25,
                writable: true
            },
            currentPage:{
                value:1,
                writable: true
            }
        });
        var dt = this;
        if(dt._options.GUI){
            if(dt._options.GUI.controls){
                var controls = options.GUI.controls;
                for(var type in controls){
                    switch(type){
                        case 'objectsPerPage':
                            var $oppControls = $('#'+controls[type]).find('a');
                            $oppControls.each(function(){
                                $(this).off('click');
                                $(this).on('click', function(){
                                    var opp = $(this).attr('data-dt-objectsperpage');
                                    if(!opp) return false;
                                    dt.setObjectsPerPage(opp);
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
                                    var navAttr = $(this).attr('data-dt-pagenav');
                                    if(!navAttr) return false;
                                    switch(navAttr){
                                        case 'first': 
                                            dt.firstPage();
                                            break;
                                        case 'prev': 
                                            dt.prevPage();
                                            break;
                                        case 'next': 
                                            dt.nextPage();
                                            break;
                                        case 'last': 
                                            dt.lastPage();
                                            break;
                                    }
                                });
                                
                            });
                            break;
                        default:;
                    }
                }
            }
        }
        
        
        this._buildHead();
        
    };
    
    Object.defineProperties(DataTable.prototype, {
    _updateGUI:{  
        value:function(){
            if(!this._options.GUI) return;
            var displays = this._options.GUI.displays;

            if(!displays) return;

            for(var type in displays){
                switch(type){
                    case 'objectsSum':
                        $('#'+displays[type]).html(
                            '<strong>'+this._filteredData.length + ' Objekte</strong> gefunden'
                        );
                        break;
                    case 'pageXofY':
                        $('#'+displays[type]).html(
                            'Seite <strong>'+this.currentPage+'</strong> von '+this.pages
                        );
                }
            }
        }
    },
    _addIDs:{
        value:function(objarr){
        for(var i = 0; i < objarr.length; i++){
            objarr[i].dtId = i;
        }
        
        return objarr;
    }
    },
    _buildHead:{
        value:function(){
        var tableId = this._tableId,
            fieldMap = this._fieldMap;
        
        var $table = $('#'+tableId);
        var $thead = $table.find('thead');
        var $tr = $('<tr></tr>');
        var dt = this;
        
        $thead.html('');
        
        for(var f in fieldMap ){
            (function(f){
                var key = fieldMap[f].split('~')[0],
                    name = fieldMap[f].split('~')[1];
                    
                var $th = $('<th>'+name+'</th>');
                if(!dt._options.nosort){
                    $th.on('click', function(){
                        $('#'+tableId+' thead th').removeClass('dt-field-active');
                        $(this).addClass('dt-field-active');

                        var dataSorted = $(this).attr('data-dt-sorted');
                        if(dataSorted){
                            if(dataSorted === 'asc'){
                                $(this).attr('data-dt-sorted', 'desc');
                                dt.sort(key, 'desc');
                            } else {
                                $(this).attr('data-dt-sorted', 'asc');
                                dt.sort(key);
                            }
                        } else {
                            $(this).attr('data-dt-sorted', 'asc');
                            dt.sort(key);
                        }
                    });
                }
                $tr.append($th);
            }(f));
        }
        
        $thead.append($tr);
    }
    },
    build:{
        value:function(){
        var dt = this;
        var tableId = dt._tableId, 
            data = dt._filteredData, 
            fieldMap = dt._fieldMap;

        var $table = $('#'+tableId);
        var $tbody = $table.find('tbody');

        this.pages = Math.ceil(data.length / dt.objectsPerPage);

        var from = dt.objectsPerPage * (dt.currentPage-1),
            to =   dt.objectsPerPage * dt.currentPage;

        if(to > data.length) to = data.length;

        $tbody.html("");

        for(var i = from; i < to; i++){
            (function(i){
                var d = data[i];

                var $tr = $('<tr></tr>');


                for(var f = 0; f < fieldMap.length; f++ ){
                    var key = fieldMap[f].split('~')[0];
                    var $td = $('<td></td>');

                    if(key !== ""){
                        var type = fieldMap[f].split('~')[2];
                        switch(type){
                            case 'date':
                                if(d[key].length === 8 && d[key] !== "00000000"){
                                    $td.html( d[key].substring(6,8)+'.'
                                        + d[key].substring(4,6)+'.'
                                        + d[key].substring(0,4));
                                }
                                break;
                            //array in der Form: [{line: "Zeile 1"}, {line: "Zeile 2"}, ...]
                            //oder ["Zeile 1", "Zeile 2", ...]
                            case 'perLineText':
                                var texthtml = "";
                                for(var i = 0; i < d[key].length; i++){
                                    if(d[key][i]['line']){
                                        texthtml += d[key][i]['line'] + '<br>';
                                    } else {
                                        texthtml += d[key][i] + '<br>';
                                    }
                                }
                                $td.html(texthtml);
                                break;
                            default:
                                $td.html(d[key]);
                        }
                    }
                    $tr.append($td);
                }

                if(dt._options.trOnClick){
                    var trOnClick = dt._options.trOnClick;
                    var args =[];
                    if(trOnClick.args){
                        for(var a = 0; a < trOnClick.args.length; a++){
                            args.push(d[trOnClick.args[a]]);
                        }
                    }
                    
                    $tr.on('click', function(){
                        trOnClick.func(args);
                    }.bind(dt) );
                }
                
                $tbody.append($tr);
            }(i));
        }
        
        dt._updateGUI();
        
        if(dt._options.onBuild){
            var onBuild = dt._options.onBuild;
            
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
        if(!field || !str) return false;
        if(!this._jsonData[0][field]) return false;
        
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
        value:function(){
        var dt = this;
        var filters = dt._filters;
        
        
        if($.isEmptyObject(filters)){
            dt._filteredData = dt._jsonData;
        } else {
            
            var data = dt._jsonData;
            dt._filteredData = [];
            
            
            for(var i = 0; i < data.length; i++){
                var check = true;
                for(var field in filters){
                    var str = filters[field];
                    var regexp = new RegExp(str);

                    var matches = data[i][field].match(regexp);
                    if(!matches){
                        check=false;
                    }
                }
                
                if(check) dt._filteredData.push(data[i]);
            }
            
        }
        
        if(dt._options.onFilter){
            var onFilter = dt._options.onFilter;
            
            var args =[];
            if(onFilter.args){
                for(var a = 0; a < onFilter.args.length; a++){
                    args.push(onFilter.args[a]);
                }
            }
            
            onFilter.func(args);
        }
            
        dt.currentPage = 1;
        dt.build();
        return this;
    }
    },
    sort:{
        value:function(field, descasc){
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
    setObjectsPerPage:{ 
        value:function(n){
        this.objectsPerPage = n;
        this.currentPage = 1;
        this.build();
        return this;
    }
    },
    nextPage:{ 
        value:function(){
        var page = this.currentPage;
        page++;
        if(page <= this.pages) this.currentPage = page;
        this.build();
        return this;
    }
    },
    prevPage:{ 
        value:function(){
        var page = this.currentPage;
        page--;
        if(page > 0) this.currentPage = page;
        this.build();
        return this;
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
    
    dataTable.create = function(tableId, jsonData, fieldMap, options, trFunction){
        return new DataTable(tableId, jsonData, fieldMap, options, trFunction);
    };
    
    return dataTable;
}(dataTable||{}));