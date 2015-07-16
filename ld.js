/** @namespace ld*/
var ld = {

    _chartRegister :[],
    _mapRegister:[],
    _chartFiltered:-1,
    _chartSubFiltered:-1,
    _relations:{},
    _titleDiv: '',
    _legendDiv:'',

    /**
    * @memberof ld
    * @method init
    * @description
    * Initialises the leaflet dashboard.
    * To be called after the map and all graphs have been declared
    */               
    
    init: function(){
        this.updateTitle();
        this._generateLegend();         
        this._chartRegister.forEach(function(e){
           e.init(); 
        });
        this._mapRegister.forEach(function(e){
           e.init(); 
        });       
    },

    /** @function updateAll
    * @memberof ld
    * @description
    * Updates the map and all graphs
    */   
    
    updateAll: function(){
        this._chartRegister.forEach(function(chart){
           chart.update(); 
        });
        this._mapRegister.forEach(function(map){
           map.update(); 
        });
        this.updateTitle();      
    },

    /** @function updateTitle
    * @memberof ld
    * @description
    * Update Title div to current filters
    */    

    updateTitle: function(){
        if(this._titleDiv!=''){
            if(this._chartFiltered==-1){
                var title = 'Map of general activity'
            } else {
                var filters = this._chartRegister[this._chartFiltered].printFilters();
                if(this._chartSubFiltered==-1){
                    var title = 'Map of ' + filters;
                } else {
                    var subfilters = this._chartRegister[this._chartSubFiltered].printFilters();
                    var operation = ld._getRelationOperation(ld._chartRegister[ld._chartSubFiltered]._name,ld._chartRegister[ld._chartFiltered]._name);
                    var title = 'Map of (' + filters + ') ' + operation + ' (' + subfilters + ')';                
                }
            }
            d3.select(this._titleDiv).html(title);
        }
    },

    /** @function _generateLegend
    * @memberof ld
    * @private
    * @description
    * Generates legend html content to go into declared DIV
    */       

    _generateLegend: function(){
        if(this._legendDiv!=''){
            var html = '';
            for(var i = 0;i<5;i++){
                html +='<p><i id="ldl'+i+'box" class="ldlegendbox"></i><span id="ldl'+i+'text" class="ldlegendtext"></span></p>';
            }
            d3.select(this._legendDiv).html(html);
        }
    },

    /** @function _updateLegend
    * @memberof ld
    * @private
    * @description
    * Updates legend for current map
    * Reverses logarithmic scale to find legend labels
    */      

    _updateLegend: function(color,max){
        if(this._legendDiv!=''){
            d3.select('#ldl0box').style('background-color',color[0]);
            d3.select('#ldl0text').html('0');
            var prev=0;
            for(i=1;i<5;i++){
                d3.select('#ldl' + i + 'box').style('background-color',color[i]);
                d3.select('#ldl' + i + 'text').html((prev+0.01).toFixed(2) + ' - ' + (Math.exp(((i) * Math.log((max+1)*1.01))/4)-1).toFixed(2));
                prev = Math.exp(((i) * Math.log((max+1)*1.01))/4)-1;      
            }
        }
    },

    /** @function _colorScale
    * @memberof ld
    * @private
    * @description
    * Update Title div to current filters
    */        

    _colorScale: function(color,scale){
        color = d3.rgb(color);
        color.r = color.r+Math.floor((255-color.r)*(4-scale)/5)
        color.b = color.b+Math.floor((255-color.b)*(4-scale)/5)
        color.g = color.g+Math.floor((255-color.g)*(4-scale)/5)
        return color.toString();
    },

    /** @function _getRelationOperation
    * @memberof ld
    * @private
    * @description
    * Get the operation between the filter and subfilter
    */     

    _getRelationOperation: function(thisgraph,parentgraph){
        var operation
        ld._relations[parentgraph].forEach(function(g){
            if(g.graph==thisgraph){
                operation = g.operation;
            }
        });
        return operation;    
    },

    /** @function relations
    * @memberof ld
    * @param {object} [relations] - Object describing relationships between graphs
    * @description
    * <p>Set the relationship of object for the graphs. If no parameter passed relations object returned</p>
    * <p><b>Default value</b>: {}</p>
    * <p><h4>Example object</h4></p>
    * <p>object = {ldgraph_0:{graph:'ldgraph_1',operation:'/'}}</p>
    * <p> This object declared that ldgraph_1 is available as a subfilter of ldgraph_0<p>
    * <p> The data interacts by ldgraph_0 data being divived by ldgraph_1</p>
    * <p> Current operations are divide: '/'  or minus: '-'</p>
    */    

    relations: function(val){
            if(typeof val === 'undefined'){
                return this._relations;
            } else {
                this._relations=val;
                return this;
            }        
        },

    /** @function titleDiv
    * @memberof ld
    * @param {string} [titleDiv] - ID of div for title to appear in
    * @description
    * <p>Set the ID of div for title to appear in. If no parameter passed titleDiv string returned</p>
    * <p><b>Default value</b>: ''</p>
    */            

    titleDiv: function(val){
            if(typeof val === 'undefined'){
                return this._titleDiv;
            } else {
                this._titleDiv=val;
                return this;
            }        
        },

    /** @function legendDiv
    * @memberof ld
    * @param {string} [legendDiv] - ID of div for legend to appear in
    * @description
    * <p>Set the ID of div for legend to appear in. If no parameter passed legendDiv string returned</p>
    * <p><b>Default value</b>: ''</p>
    */        

    legendDiv: function(val){
            if(typeof val === 'undefined'){
                return this._legendDiv;
            } else {
                this._legendDiv=val;
                return this;
            }        
        },

    /** @namespace rowGraph
    * @memberof ld
    * @param {string} [id] - ID of div for chart to appear in
    * @description
    * <p>var rowChart1 = new ld.rowGraph('#graph1')</p>
    */

    rowGraph: function(id){

        this._height=300;
        this._width=300;
        this._properties = {};
        this._id = id;
        this._data = [];
        this._place = "";
        this._type = "";
        this._values = "";
        this._barcolor = "#0091EA";
        this._mapcolors = [];
        this._fontcolor = "black";
        this._fontSize = "0.8em"
        this._textShift = 20;
        this._filterOn = false;
        this._filters = [];
        this._elasticY = false;
        this._ref = ld._chartRegister.length;
        this._name = 'ldgraph_'+ this._ref;
        this._subFilter = false;


        ld._chartRegister.push(this);

        /** @function height
        * @memberof ld.rowGraph
        * @param {integer} [height] - height in pixels
        * @description
        * <p>Set the height of chart in pixels. If no parameter passed height integer returned</p>
        * <p><b>Default value</b>: 300</p>
        */         

        this.height = function(val){
            if(typeof val === 'undefined'){
                return this._height;
            } else {
                this._height=val;
                return this;
            }        
        };

        /** @function width
        * @memberof ld.rowGraph
        * @param {integer} [width] - height in pixels
        * @description
        * <p>Set the width of chart in pixels. If no parameter passed width integer returned</p>
        * <p><b>Default value</b>: 300</p>
        */

        this.width = function(val){
            if(typeof val === 'undefined'){
                return this._width;
            } else {
                this._width=val;
                return this;
            }        
        };

        /** @function name
        * @memberof ld.rowGraph
        * @param {integer} [name] - name of graph
        * @description
        * <p>Set the name of chart. This can then be used a reference in the relations object.  If no parameter passed name string returned</p>
        * <p><b>Default value</b>: 'ld_graph'+# - where # is position in ld._chartRegister by order of declaration.  First chart declared is ldgraph_0.</p>
        */        

        this.name = function(val){
            if(typeof val === 'undefined'){
                return this._name;
            } else {
                this._name=val;
                return this;
            }        
        };

        /** @function data
        * @memberof ld.rowGraph
        * @param {object} [data] - json object - list of named arrays
        * @description
        * <p>Set the data for chart to represent. If no parameter passed data object returned</p>
        * <p>It must contain a column with the place ID, a column with type indicator (used as row values) and values columns</p>
        */

        this.data = function(val){
            if(typeof val === 'undefined'){
                return this._data;
            } else {
                this._data=val;
                return this;
            }        
        };

        /** @function place
        * @memberof ld.rowGraph
        * @param {string} [placeHeader] - name of place key in data
        * @description
        * <p>Set the column to use for place data. If no parameter passed place string returned</p>
        */        

        this.place = function(val){
            if(typeof val === 'undefined'){
                return this._place;
            } else {
                this._place=val;
                return this;
            }        
        };

        /** @function type
        * @memberof ld.rowGraph
        * @param {string} [typeHeader] - name of type key in data
        * @description
        * <p>Set the column to use for type data. If no parameter passed type string returned</p>
        */          

        this.type = function(val){
            if(typeof val === 'undefined'){
                return this._type;
            } else {
                this._type=val;
                return this;
            }        
        };

        /** @function values
        * @memberof ld.rowGraph
        * @param {string} [valuesHeader] - name of values key in data
        * @description
        * <p>Set the column to use for value data. If no parameter passed values string returned</p>
        */         

        this.values = function(val){
            if(typeof val === 'undefined'){
                return this._values;
            } else {
                this._values=val;
                return this;
            }        
        };

        /** @function barcolor
        * @memberof ld.rowGraph
        * @param {string} [barColor] - color for chart
        * @description
        * <p>Set the color of the chart. If no parameter passed barcolor string returned</p>
        * <p><b>Default value</b>: "#0091EA" </p>
        */               
        
        this.barcolor = function(val){
            if(typeof val === 'undefined'){
                return this._barcolor;
            } else {
                this._barcolor=val;
                return this;
            }        
        };


        /** @function mapcolors
        * @memberof ld.rowGraph
        * @param {array} [mapColors] - colors for map
        * @description
        * <p>Set the colors of the map when no filter selected.  If no mapColors declated then autogenerated from barcolor.  Expects an array of 5 hex values.  If no parameter passed mapcolors array returned</p>
        * <p><b>Default value</b>: "[]" </p>
        */           

        this.mapcolors = function(val){
            if(typeof val === 'undefined'){
                return this._mapcolors;
            } else {
                this._mapcolors=val;
                return this;
            }        
        };

        /** @function elasticX 
        * @memberof ld.rowGraph
        * @param {boolean} [elasticX] - whether x axis rescales on filter
        * @description
        * <p>Set whether the x axis rescales on filter.  If no parameter passed elasticX boolean returned</p>
        * <p><b>Default value</b>: "[]" </p>
        */

        this.elasticX = function(val){
            if(typeof val === 'undefined'){
                return this._elasticY;
            } else {
                this._elasticY=val;
                return this;
            }        
        };                            

        this.init= function(){
            this.cf = this._initCrossfilter(this._data,this._place,this._type,this._values);
            this._render(this._id,this.cf.typeGroup.all());
            if(this._mapcolors.length==0){
                this._mapcolors=this._genMapColors();
            }           
        };

        this._initCrossfilter = function(data,place,key,value){
            var cf = crossfilter(data);

            cf.placeDimension = cf.dimension(function(d){ return d[place]; });
            cf.typeDimension = cf.dimension(function(d){ return d[key]; });
            cf.placeGroup = cf.placeDimension.group().reduceSum(function(d) {return d[value];});
            cf.typeGroup = cf.typeDimension.group().reduceSum(function(d) {return d[value];});

            return cf;
        };

        this._render = function(id,data){       

            this._properties.margin = {top: 20, right: 50, bottom: 20, left: 75};
            this._properties.width = this._width - this._properties.margin.left - this._properties.margin.right;
            this._properties.height = this._height - this._properties.margin.top - this._properties.margin.bottom;      

            this._properties.x = d3.scale.linear()           
               .range([0, this._properties.width]).domain([0, d3.max(data,function(d){return d.value;})]);

            this._properties.y = d3.scale.ordinal()
               .rangeBands([0, this._properties.height]).domain(data.map(function(d) {return d.key; }));                

            var _chart = d3.select(id)
                .append('svg')
                .attr('class', 'dashchart')
                .attr('width', this._width)
                .attr('height', this._height)
                .append("g")
                .attr("transform", "translate(" + this._properties.margin.left + "," + this._properties.margin.top + ")");        

            var _parent = this;
            if(!this._elasticY){
                _chart.append("g").selectAll("rect")
                    .data(data)
                    .enter().append("rect")
                    .attr("x", 0)
                    .attr("y", function(d){;
                        return _parent._properties.y(d.key);
                    })
                    .attr("width", function(d){
                        return _parent._properties.x(d.value);
                    })
                    .attr("height", _parent._properties.y.rangeBand()-1)
                    .attr("fill","#dddddd")
                    .on("click",function(d){
                        _parent._filter(d.key);
                    });
            }

            _chart.append("g").selectAll("rect")
                .data(data)
                .enter().append("rect")
                .attr("x", 0)
                .attr("y", function(d){;
                    return _parent._properties.y(d.key);
                })
                .attr("width", function(d){
                    return _parent._properties.x(d.value);
                })
                .attr("height", _parent._properties.y.rangeBand()-1)
                .attr("class","dashgraph-bar clickable bar"+this._ref)
                .attr("id",function(d){
                    return "dgbar"+_parent._ref+d.key;
                })
                .attr("fill",this._barcolor)
                .on("click",function(d){
                    _parent._filter(d.key);
                });

           
            _chart.append("g").selectAll("text")
                .data(data)
                .enter().append("text")
                .text(function(d) {
                    if(d.key.length>12){
                        return d.key.substring(0,10)+'...';
                    } else {
                        return d.key;
                    }
                })        
                .attr("x", function(d) {
                    return 5-_parent._properties.margin.left;
                })
                .attr("y", function(d) {
                    return _parent._properties.y(d.key)+_parent._textShift;
                })
                .attr("fill",this._fontcolor)
                .style("font-size",this._fontSize)
                .attr("class","clickable textlabel")
                .on("click",function(d){
                    _parent._filter(d.key);
                });

            _chart.append("g").selectAll("text")
                .data(data)
                .enter().append("text")
                .text(function(d) {
                    return d.value;
                })        
                .attr("x", function(d) {
                    return _parent._properties.x(d.value)+5;
                })
                .attr("y", function(d) {
                    return _parent._properties.y(d.key)+_parent._textShift;
                })
                .attr("fill",this._fontcolor)
                .style("font-size",this._fontSize)
                .attr("class","clickable textlabel textvalue")
                .on("click",function(d){
                    _parent._filter(d.key);
                });                
        };

        this._filter = function(filter){
                if(ld._chartFiltered!=-1){
                    if(this._inRelations(this._name,ld._chartRegister[ld._chartFiltered]._name)){
                        ld._chartSubFiltered = this._ref;
                        this._filterOn = true;
                        this._subFilter = true;
                    } else {
                        ld._chartFiltered = this._ref;
                        ld._chartSubFiltered = -1;
                    }
                } else {
                    ld._chartFiltered = this._ref;
                    ld._chartSubFiltered = -1;
                }

                ld._chartRegister.forEach(function(chart){
                    if(chart._ref!=ld._chartFiltered && chart._ref!=ld._chartSubFiltered){
                        chart.cf.typeDimension.filterAll();
                        chart._filters=[];
                        chart._filterOn = false;
                    }
                });
                var index = this._filters.indexOf(filter);
                if(index===-1){
                    this._filters.push(filter);
                    this._filterOn = true;
                } else {
                    this._filters.splice(index,1);
                }
                if(this._filters.length===0){
                    this._filterOn = false;
                    if(this._subFilter){
                        ld._chartSubFiltered=-1;
                        this._subFilter = false;
                    } else {
                        ld._chartSubFiltered=-1;
                        ld._chartFiltered=-1;
                    }                    
                }

                var _parent = this;
                if(this._filterOn){
                    _parent.cf.typeDimension.filter(function(d){
                        return _parent._filters.indexOf(d) > -1;
                    });             
                } else {
                    _parent.cf.typeDimension.filterAll();
                }
                ld.updateAll();            
        }

        this.update = function(){
            var _parent = this;

            if(this._filterOn){
                d3.selectAll('.bar'+this._ref).attr('fill','#dddddd');
                this._filters.forEach(function(f){
                    d3.select('#dgbar'+_parent._ref+f).attr('fill',_parent._barcolor);
                });
            } else {
                if(ld._chartFiltered == -1){
                    d3.selectAll('.bar'+this._ref).attr('fill',this._barcolor);
                } else {
                    if(this._inRelations(this._name,ld._chartRegister[ld._chartFiltered]._name)){
                        d3.selectAll('.bar'+this._ref).attr('fill',this._mapcolors[1]);
                    } else {
                        d3.selectAll('.bar'+this._ref).attr('fill','#dddddd');
                    }
                }
            }
            if(this._elasticY){
                this._properties.x = d3.scale.linear()           
                    .range([0, this._properties.width]).domain([0, d3.max(this.cf.typeGroup.all(),function(d){return d.value;})]);                
            }
            var _parent = this;
            d3.select(this._id).selectAll('.dashgraph-bar').data(this.cf.typeGroup.all())
            .transition().attr('width', function(d,i){
                    return _parent._properties.x(d.value);
                });
            d3.select(this._id).selectAll('.textvalue').data(this.cf.typeGroup.all())
                .text(function(d) {
                     return d.value;
                })
                .attr("x", function(d) {
                    return _parent._properties.x(d.value)+5;
                });  
        };

        this._genMapColors = function(){
            return ['#cccccc',ld._colorScale(this._barcolor,1),ld._colorScale(this._barcolor,2),ld._colorScale(this._barcolor,3),ld._colorScale(this._barcolor,4)];
        };

        this._inRelations = function(thisgraph,parentgraph){
            if(ld._relations[parentgraph]==undefined){
                return false;
            } else {
                var found = false;
                ld._relations[parentgraph].forEach(function(g){
                    if(g.graph==thisgraph){
                        found = true;
                    }
                });
                return found;    
            }
        };

        this.printFilters = function(){
            var filters = [];
            var i=0;
            this._filters.forEach(function(f){
                if(i==0){
                    filters = f;
                } else {
                    filters += ' + ' + f;
                }
                i++
            });
            return filters;
        }   
    },

    /** @namespace map
    * @memberof ld
    * @param {string} [id] - ID of div for map to appear in
    * @description
    * <p>var map = new ld.map('#map')</p>
    */

    map:function (id){

        this._id = id;
        this._geojson = "";
        this._center = [0,0];
        this._zoom = 1;
        this._joinAttr = "";
        this._colors = ['#CCCCCC','#81D4FA','#29B6F6','#0288D1','#01579B'];
        this._mergeColors = ['#CCCCCC','#FFECB3','#FFC107','#FFA000','#FF6F00'];
        this._filterOn = false;
        this._filters = [];
        this._currentData = [];
        this._filterData = [];
        this._subData = [];
        this._infoAttr = "";

        this._haveValues = [];
        
        ld._mapRegister.push(this);

        /** @function geojson
        * @memberof ld.map
        * @param {object} [geojson] - geojson object to be used in leaflet map
        * @description
        * <p>Set the geojson to use for map. If no parameter passed geojson object returned.</p>
        */         

        this.geojson = function(val){
            if(typeof val === 'undefined'){
                return this._geojson;
            } else {
                this._geojson=val;
                return this;
            }        
        };

        /** @function center
        * @memberof ld.map
        * @param {array} [[lat,lng]] - array of lat lng to center on.
        * @description
        * <p>Set the center of the map. If no parameter passed lat lng array returned.</p>
        */        

        this.center = function(val){
            if(typeof val === 'undefined'){
                return this._center;
            } else {
                this._center=val;
                return this;
            }        
        };

        /** @function zoom
        * @memberof ld.map
        * @param {integer} [zoom] - zoom to be used in leaflet map
        * @description
        * <p>Set the zoom to use for map. If no parameter passed zoom integer returned.</p>
        */      

        this.zoom = function(val){
            if(typeof val === 'undefined'){
                return this._zoom;
            } else {
                this._zoom=val;
                return this;
            }        
        };

        /** @function joinAttr
        * @memberof ld.map
        * @param {string} [joinAttr] - which geojson feature property to use to join data
        * @description
        * <p>Declares which geojson feature property (place name or ID) should join to the place columns on the charts. If no parameter passed joinAttr string returned.</p>
        */        
        
        this.joinAttr = function(val){
            if(typeof val === 'undefined'){
                return this._joinAttr;
            } else {
                this._joinAttr=val;
                return this;
            }        
        };

        /** @function infoAttr
        * @memberof ld.map
        * @param {string} [infoAttr] - which geojson feature property to display in info popup
        * @description
        * <p>Declares which geojson feature property to display in info popup.  If none declared info pop up not created. If no parameter passed infoAttr string returned.</p>
        */        

        this.infoAttr = function(val){
            if(typeof val === 'undefined'){
                return this._infoAttr;
            } else {
                this._infoAttr=val;
                return this;
            }        
        };        

        /** @function mergeColors
        * @memberof ld.map
        * @param {array} [mergeColors] - mergeColors
        * @description
        * <p>Sets array of colors to use on map when charts are merged. If no parameter passed mergeColors array returned.</p>
        * <p><b>Default value</b>: "['#CCCCCC','#FFECB3','#FFC107','#FFA000','#FF6F00']" </p>
        */

        this.mergeColors = function(val){
            if(typeof val === 'undefined'){
                return this._mergeColors;
            } else {
                this._mergeColors=val;
                return this;
            }        
        };

       /** @function colors
        * @memberof ld.map
        * @param {array} [mergeColors] - colors
        * @description
        * <p>Sets array of colors to use on map when no chart filtered. If no parameter passed colors array returned.</p>
        * <p><b>Default value</b>: "['#CCCCCC','#FFECB3','#FFC107','#FFA000','#FF6F00']" </p>
        */        

        this.colors = function(val){
            if(typeof val === 'undefined'){
                return this._colors;
            } else {
                this._colors=val;
                return this;
            }        
        };                                

        this._initMap = function(id,geojson, center, zoom, joinAttr, infoAttr){
            
            var _parent = this;

            var base_hotosm = L.tileLayer(
                'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',{
                attribution: '&copy; OpenStreetMap contributors, <a href="http://hot.openstreetmap.org/">Humanitarian OpenStreetMap Team</a>'}
            );

            var base_osm = L.tileLayer(
                    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
                    attribution: '&copy; OpenStreetMap contributors'}
            );

            var map = L.map('map', {
                center: center,
                zoom: zoom,
                layers: [base_hotosm,base_osm]
            });

            var overlay = L.geoJson(geojson,{
                style: this._style(),
                onEachFeature: onEachFeature
            }).addTo(map);
            
            function onEachFeature(feature, layer) {
                layer.on('click', function (e){
                    _parent._filterOn = true;
                    _parent._filter(feature.properties[joinAttr]);
                });
            }
            if(this._infoAttr!=''){
                _info = L.control();

                _info.onAdd = function (map) {
                    this._div = L.DomUtil.create('div', 'ldinfo');
                    this.update();
                        return this._div;
                    };

                _info.update = function (name) {
                        this._div.innerHTML = (name ? name: 'Hover for name');
                    };

                _info.addTo(map);
            }                        
            
            overlay.eachLayer(function (layer) {
                if(typeof layer._path != 'undefined'){
                    layer._path.id = 'dgmap'+layer.feature.properties[joinAttr];
                } else {
                    layer.eachLayer(function (layer2){
                        layer2._path.id = 'dgmap'+layer.feature.properties[joinAttr];
                    });
                }
                if(_parent._infoAttr!=""){
                    layer.on("mouseover",function(){
                        if(_parent._chartFiltered == -1){
                            var info = layer.feature.properties[infoAttr];
                        } else {
                            var current = "N/A";
                            var filter = 0;
                            var sub = 0;
                            var found = false;
                            var i = 0;
                            while(found===false && i<_parent._currentData.length){
                                if(layer.feature.properties[joinAttr] === _parent._currentData[i].key){
                                    current = _parent._currentData[i].value;
                                    found =true;
                                }
                                i++;
                            }
                            var found = false;
                            var i = 0;
                            while(found===false && i<_parent._filterData.length){
                                if(layer.feature.properties[joinAttr] === _parent._filterData[i].key){
                                    filter = _parent._filterData[i].value;
                                    found =true;
                                }
                                i++;
                            }
                            var found = false;
                            var i = 0;
                            while(found===false && i<_parent._subData.length){
                                if(layer.feature.properties[joinAttr] === _parent._subData[i].key){
                                    sub = _parent._subData[i].value;
                                    found =true;
                                }
                                i++;
                            }
                            if(ld._chartSubFiltered ==-1){
                                var info = layer.feature.properties[infoAttr]+": "+current;
                            } else {
                                var info = layer.feature.properties[infoAttr]+"<br />"
                                +ld._chartRegister[ld._chartFiltered].printFilters()+": "+filter+"<br />"
                                +ld._chartRegister[ld._chartSubFiltered].printFilters()+": "+sub+"<br />"
                                +"Result : "+Number(current).toFixed(2);
                            }                                                                
                        }
                        _info.update(info);
                    });
                    layer.on("mouseout",function(){
                        _info.update();
                    });
                }                
            });

            var mapData = [];
            var parent = this;
            ld._chartRegister.forEach(function(chart){
                mapData = parent._addCF(mapData,chart.cf.placeGroup.all());
            });
            mapData.forEach(function(d){
                parent._haveValues.push(d.key);
                d3.selectAll('#dgmap'+d.key).classed('hasValue',true);
            });

            return map;
        };
                
        this._filter = function(placeID){
            if(this._haveValues.indexOf(placeID)>-1){
                var index = this._filters.indexOf(placeID);
                if(index===-1){
                    this._filters.push(placeID);
                } else {
                    this._filters.splice(index,1);
                }
                if(this._filters.length===0){
                    this._filterOn = false;
                }
                var parent = this;
                if(this._filterOn){
                    ld._chartRegister.forEach(function(chart){
                            chart.cf.placeDimension.filter(function(d){
                              return parent._filters.indexOf(d) > -1;
                            });             
                    });
                } else {
                    ld._chartRegister.forEach(function(chart){
                        chart.cf.placeDimension.filterAll();
                    });
                }
                ld.updateAll();
            }
        };
        
        this.update = function(){

            var mapData = [];
            var parent = this;
            if(ld._chartFiltered ==-1){
                ld._chartRegister.forEach(function(chart){
                    mapData = parent._addCF(mapData,chart.cf.placeGroup.all());
                    this._currentData = mapData;
                    this._filterData = mapData;
                    this._subData = [];
                });
            } else {
                if(ld._chartSubFiltered ==-1) {
                    mapData = ld._chartRegister[ld._chartFiltered].cf.placeGroup.all();
                    this._currentData = mapData;
                    this._filterData = mapData;
                    this._subData = [];
                } else {
                    if(ld._getRelationOperation(ld._chartRegister[ld._chartSubFiltered]._name,ld._chartRegister[ld._chartFiltered]._name)=='-'){
                        mapData = parent._minusCF(ld._chartRegister[ld._chartFiltered].cf.placeGroup.all(),ld._chartRegister[ld._chartSubFiltered].cf.placeGroup.all());
                    } else {
                        mapData = parent._divideCF(ld._chartRegister[ld._chartFiltered].cf.placeGroup.all(),ld._chartRegister[ld._chartSubFiltered].cf.placeGroup.all());
                    }
                        this._currentData = mapData;
                        this._filterData = ld._chartRegister[ld._chartFiltered].cf.placeGroup.all();
                        this._subData = ld._chartRegister[ld._chartSubFiltered].cf.placeGroup.all();                    
                }
            }            
            var i = 0;
            var max = d3.max(mapData,function(d){
                return d.value;
            });
            var mergeColors = [];
            if(ld._chartSubFiltered!=-1){
                mergeColors = parent._mergeColors;
                ld._updateLegend(mergeColors,max);
            } else {
                if(ld._chartFiltered == -1){
                    ld._updateLegend(parent._colors,max);
                } else {
                    ld._updateLegend(ld._chartRegister[ld._chartFiltered]._mapcolors,max);
                }
            }                     

            mapData.forEach(function(d){
                if(ld._chartFiltered==-1){
                    var color = parent._colors[parent._colorAccessor(d,max,i)];
                } else {
                    if(ld._chartSubFiltered==-1){
                        var color = ld._chartRegister[ld._chartFiltered]._mapcolors[parent._colorAccessor(d,max,i)];
                    } else {
                        var color = mergeColors[parent._colorAccessor(d,max,i)];
                    }
                }
   
                if(parent._filterOn===false){                    
                    d3.selectAll('#dgmap'+d.key).attr('fill',color).attr('stroke-opacity',0.8).attr('fill-opacity',0.8);
                } else {
                    if(parent._filters.indexOf(d.key) > -1){
                        d3.selectAll('#dgmap'+d.key).attr('fill',color).attr('stroke-opacity',0.8).attr('fill-opacity',0.8);
                    } else {
                        d3.selectAll('#dgmap'+d.key).attr('fill','grey').attr('stroke-opacity',0.8).attr('fill-opacity',0.8);
                    }
                }
                i++;
            });
        };
                        

        this._addCF = function (data,newdata){
            newdata.forEach(function(d){
                var found = false;
                var i = 0;
                while(found===false && i<data.length){
                    if(d.key === data[i].key){
                        data[i].value+=d.value;
                        found =true;
                    }
                    i++;
                }
                if(found===false){
                    data.push({key:d.key,value:d.value});
                }                                
            });
            return data;
        };

        this._divideCF = function(data1,data2){
            var newdata = [];
            data1.forEach(function(d){
                var found = false;
                var i = 0;
                while(found===false && i<data2.length){
                    if(d.key === data2[i].key){
                        if(data2[i].value!=0){
                            newdata.push({key:d.key,value:d.value/data2[i].value});
                            found =true;
                        }
                    }
                    i++;
                }
            });
            data2.forEach(function(d){
                var found = false;
                var i = 0;
                while(found===false && i<data1.length){
                    if(d.key === data1[i].key){
                        found =true;
                    }
                    i++;
                }
                if(!found){
                    newdata.push({key:d.key,value:0})
                }                
            });
            return newdata;
        }

        this._minusCF = function(data1,data2){
            var newdata = [];
            data1.forEach(function(d){
                var found = false;
                var i = 0;
                var value = 0;
                while(found===false && i<data2.length){
                    if(d.key === data2[i].key){
                        value = d.value - data2[i].value
                        found =true;

                    }
                    if(found == false){
                        value = d.value;
                    }
                    i++;
                }
                if(value<0){value=0}
                newdata.push({key:d.key,value:value});
            });
            data2.forEach(function(d){
                var found = false;
                var i = 0;
                while(found===false && i<data1.length){
                    if(d.key === data1[i].key){
                        found =true;
                    }
                    i++;
                }
                if(!found){
                    newdata.push({key:d.key,value:0})
                }                
            });
            return newdata;
        } 
        
        this._colorAccessor = function (d,max,i){
            if(d.value>0){
                value = Math.log(d.value+1);
                return Math.floor(value*4/Math.log((max+1)*1.01))+1;
            } else {
                return 0;
            }
        };
                
        this._style = function(){
            return {
                weight: 1,
                opacity: 0,
                fillOpacity: 0,
                className: 'dashgeom'
            };
        };

        this.init = function(){
            this._initMap(this._id,this._geojson,this._center,this._zoom,this._joinAttr,this._infoAttr);
            this.update();
        };
    }
};