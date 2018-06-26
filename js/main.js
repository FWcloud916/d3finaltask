var app = new Vue({
    el:'#app',

    data:{
        kinds:['stars','goods','views','forks'],
        dataset:[],
        width:800,
        height:800,
        domain:[],
        xch:'0',
        ych:'1',
        xkind:'stars',
        ykind:'goods',
        XMax:'',
        Xmin:'',
        YMax:'',
        Ymin:'',
    },

    mounted: function () {
        this.getCsv();    
    },
//dataset.sort(function(a,b){return d3.descending(a.stars,b.stars)})
    methods:{
        resetCh:function(pre){
            if (pre == "x") {
                pre = "y"
                app.kinds.forEach(function (d) { document.getElementById(pre + d).disabled = false})
            }
            else if (pre == "y") {
                pre = "x"
                app.kinds.forEach(function (d) { document.getElementById(pre + d).disabled = false })
            }

            
        },

        chCheck: function(event){
            var pre = event.currentTarget.id[0];
            var name = event.currentTarget.id.slice(1);
            var kind = event.currentTarget.value;

            this.resetCh(pre);
            if(pre == "x"){
                pre = "y"
                app.xkind = name;
                app.xch = app.kinds.indexOf(name);
                app.XMax = app.domain[kind].Max;
                app.Xmin = app.domain[kind].min;
            }
            else if(pre == "y"){
                pre = "x"
                app.ykind = name
                app.ych = app.kinds.indexOf(name)
                app.YMax = app.domain[kind].Max;
                app.Ymin = app.domain[kind].min;
            }
            
            var target = pre + name;
            document.getElementById(target).disabled = true;
            app.sliderChange();
            app.reDraw();
        },
        getMax: function(){

            var stars = dataset.sort(function (a, b) {
                return d3.descending(a.stars, b.stars) 
            });
            app.domain.push({ Max: stars[0].stars, min: stars[stars.length - 1].stars })
            app.Xmin = app.domain[0].min; //set default X
            app.XMax = app.domain[0].Max; //set default X

            var goods = dataset.sort(function (a, b) {
                return d3.descending(a.goods, b.goods)
            });
            app.domain.push({ Max: goods[0].goods, min: goods[goods.length - 1].goods })
            app.Ymin = app.domain[1].min; //set default Y
            app.YMax = app.domain[1].Max; //set default Y


            var views = dataset.sort(function (a, b) {
                return d3.descending(a.views, b.views)
            });
            app.domain.push({ Max: views[0].views, min: views[views.length - 1].views })

            var forks = dataset.sort(function (a, b) {
                return d3.descending(a.forks, b.forks)
            });
            app.domain.push({ Max: forks[0].forks, min: forks[forks.length - 1].forks })
        },
        getCsv: function(){
            d3.csv("datav2.txt").then(function (data) {
                data.forEach(function(d){
                    d.ID = d.ID;
                    d.stars = +d.stars;
                    d.goods = +d.goods;
                    d.views = +d.views;
                    d.forks = +d.forks;
                })
                dataset=data;
                app.getMax();
                app.setSlider();
                app.drawPlot();
                  
            });
        },
        drawPlot: function(){
            var svg = d3.select(".draw").append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .attr("class", 'chart')
                .attr("id",'canvas');

            var xlinear = d3.scaleLinear()
                .domain([app.Xmin, app.XMax])
                .range([0, this.width]);

            var ylinear = d3.scaleLinear()
                .domain([app.YMax, app.Ymin])
                .range([0, this.height]);  

            var xaxis = d3.axisBottom(xlinear);

            var yaxis = d3.axisLeft(ylinear)
                            .ticks(10);

            var color = d3.scaleOrdinal(d3.schemeSpectral[6]);

            var temp = [];
            
            dataset.forEach(function(d,i){
                if (d[app.xkind] > app.Xmin && d[app.xkind] < app.XMax && d[app.ykind] > app.Ymin && d[app.ykind] < app.YMax)
                    temp.push(d);
            })

            svg.selectAll("dot")
                .data(temp)
                .enter().append("circle")
                .attr("r", 5)
                .attr("cx", function (d) {  return xlinear(d[app.xkind]); } )
                .attr("cy", function (d) { return ylinear(d[app.ykind]); } )
                .attr('fill', function (d,i) { return color(i); });

            svg.append('g')
                .call(yaxis);
            svg.append('g')
                .attr("transform", "translate(0,800)")
                .call(xaxis);

        },
        reDraw: function(){
            d3.select(".chart").remove();
            app.drawPlot();
        },

        setSlider: function(){
            var Xslider = document.getElementById('Xslider');

            noUiSlider.create(Xslider, {
                start: [app.domain[app.xch].min, app.domain[app.xch].Max],
                step: 1,
                connect: true,
                range: {
                    'min': app.domain[app.xch].min,
                    'max': app.domain[app.xch].Max
                }
            });

            Xslider.noUiSlider.on('slide',function(value){
                app.Xmin = parseInt(value[0]);
                app.XMax = parseInt(value[1]); 
                app.reDraw();       
            })

            var Yslider = document.getElementById('Yslider');

            noUiSlider.create(Yslider, {
                start: [app.domain[app.ych].min, app.domain[app.ych].Max],
                step: 1,
                connect: true,
                range: {
                    'min': app.domain[app.ych].min,
                    'max': app.domain[app.ych].Max
                }
            });

            Yslider.noUiSlider.on('slide', function (value) {
                app.Ymin = parseInt(value[0]);
                app.YMax = parseInt(value[1]);
                app.reDraw();
            })
        },

        sliderChange:function(){
            Xslider.noUiSlider.updateOptions({
                start: [app.Xmin, app.XMax],
                range: {
                    'min': app.Xmin,
                    'max': app.XMax
                }
            });

            Yslider.noUiSlider.updateOptions({
                start: [app.Ymin, app.YMax],
                range: {
                    'min': app.Ymin,
                    'max': app.YMax
                }
            });
        }
    },

})
