/**
 *
    Author: Kahin Akram
    Date: Jan 24, 2020
    TNM048 Lab 1 - Visual Information-Seeking Mantra
    Focus+Context file
 *
*/
function focusPlusContext(data) {

    // Creating margins and figure sizes
    var margin = { top: 20, right: 20, bottom: 150, left: 40 },
        margin2 = { top: 100, right: 20, bottom: 50, left: 40 },
        width = $("#scatterplot").parent().width() - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        height2 = 200 - margin2.top - margin2.bottom;

    /**
     * Select Scatter plot div and append svg tag to it.
     * Set position to relative and width to 100% and an arbitrary height
     * Then add the clipping area with clipPath -
     * The clipping path restricts the region to which paint can be applied.
     * After that, append the two g tags we will be using for drawing the focus plus context graphs
     */
    var svg = d3.select("#scatterplot").append("svg")
        .attr("postion", "relative")
        .attr("width", "100%")
        .attr("height", height + margin.top + margin.bottom);

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //<---------------------------------------------------------------------------------------------------->

    /**
     * Task 1 - Parse date with timeParse to year-month-day
     */
    var parseDate = d3.timeParse("%Y-%m-%d");
    //console.log(parseDate("2021-01-25"));
    /**
     * Task 2 - Define scales and axes for scatterplot
     */
    var xScale = d3.scaleTime().range([0,width]);  //Scale that is made for time          
    var yScale = d3.scaleLinear().range([height, 0]); //Scale that is suited for linear relations (In this case magnitude) Reversed order for origo in top left
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale); //Sets the positions of the axises
    /**
     * Task 3 - Define scales and axes for context (Navigation through the data)
     */
    var navXScale = d3.scaleTime().range([0,width]);
    var navYScale = d3.scaleLinear().range([height2, 0])
    var navXAxis = d3.axisBottom(navXScale);
    /**
     * Task 4 - Define the brush for the context graph (Navigation)
     */
    var brush = d3.brushX().extent([[0,0],[width,height2]]).on("brush end", brushed);//Brush that performs in the X-axis, with specified intervall

    //Setting scale parameters
    var maxDate = d3.max(data.features, function (d) { return parseDate(d.properties.Date) });
    var minDate = d3.min(data.features, function (d) { return parseDate(d.properties.Date) });
    var maxMag = d3.max(data.features, function (d) { return d.properties.EQ_PRIMARY });
    var minMag = d3.min(data.features, function (d) { return d.properties.EQ_PRIMARY })

    //Calculate todays date.
    maxDate_plus = new Date(maxDate.getTime() + 300 * 144000000)

    /**
     * Task 5 - Set the axes scales, both for focus and context.
     */
    //Domain specifies the accepted input values. It then maps it to the range specified above.
    xScale.domain([minDate,maxDate]);
    yScale.domain([0,maxMag+1]);            
    navXScale.domain(xScale.domain());
    navYScale.domain(yScale.domain());
   // console.log(minDate +" Max: " + maxDate);
    


    //<---------------------------------------------------------------------------------------------------->

    /**
    * 1. Rendering the context chart
    */

    //Append g tag for plotting the dots and axes
    var dots = context.append("g");
    dots.attr("clip-path", "url(#clip)");

    /**
    * Task 6 - Call the navigation axis on context.
    */
    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(navXAxis);    //Draws the axis for the context window
        
    /**
     * Task 7 - Plot the small dots on the context graph.
     */
    small_points = dots.selectAll("dot")
        .data(data.features)
        .enter()
        .append("circle") //Append all the dot objects to circle. Circle objects are specified in color_info.
        .attr("class", "dotContext")
        .filter(function (d) { return d.properties.EQ_PRIMARY != null })
        .attr("cx", function (d) {
            return navXScale(parseDate(d.properties.Date));
        })
        .attr("cy", function (d) {
            return navYScale(d.properties.EQ_PRIMARY);
        });

     /**
      * Task 8 - Call plot function.
      * plot(points,nr,nr) try to use different numbers for the scaling.
      */
     var points = new Points();
     points.plot(small_points,4,2); //4 is for the no data variable size, 2 is for the 1+ deaths data size 
     // (We chose a smaller size for the no data circles to not obstruct the relevant data)
    

    //<---------------------------------------------------------------------------------------------------->

    /**
    * 2. Rendering the focus chart
    */

    //Append g tag for plotting the dots and axes
    var dots = focus.append("g");
    dots.attr("clip-path", "url(#clip)");

    /**
     * Task 10 - Call x and y axis
     */
    //Appending x-axis to focus window
    focus.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0, "+height+")") 
    .call(xAxis);
    
    //Appending the y axis as the focus window
    focus.append("g") 
    .attr("class", "axis axis--y")
    .call(yAxis);

    //Add y axis label to the scatter plot
    d3.select(".legend")
        .style('left', "170px")
        .style('top', '300px');
    svg.append("text")
        .attr('class', "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr('x', -margin2.top - 120)
        .attr('text-anchor', "end")
        .attr('dy', ".75em")
        .style("font-size", "20px")
        .text("Magnitude");

    /**
     * Task 11 - Plot the dots on the focus graph.
     */
    selected_dots = dots.selectAll("dot")
        .data(data.features)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("style", "opacity:1;")        //Sets all to full opacity
        .filter(function (d) { return d.properties.EQ_PRIMARY != null })
        .attr("cx", function (d) {
            return xScale(parseDate(d.properties.Date));
        })
        .attr("cy", function (d) {
            return yScale(d.properties.EQ_PRIMARY);
        });

    /**
     * Task 12 - Call plot function
     * plot(points,nr,nr) no need to send any integers!
     */
    points.plot(selected_dots,2,1);
        
    //<---------------------------------------------------------------------------------------------------->

    //Mouseover function
    mouseOver(selected_dots);
    //Mouseout function
    mouseOut(selected_dots);

    //Mouse over function
    function mouseOver(selected_dots){
        selected_dots
        .on("mouseover",function(d){

            /**
             * Task 13 - Update information in the "tooltip" by calling the tooltip function.
             */
            points.tooltip(d);

            //Rescale the dots onhover
            d3.select(this).attr('r', 15)

            //Rescale the dots on the map.
            curent_id = d3.select(this)._groups[0][0].__data__.id.toString()
            d3.selectAll(".mapcircle")
                .filter(function (d) { return d.id === curent_id; })
                .attr('r', 15)

            //Call map hover function if implemented!
            world_map.hovered(d.id);
        });
    }

    //Mouse out function
    function mouseOut(selected_dots){
        selected_dots
            .on("mouseout", function () {
                //Returning to original characteristics
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr("r", function (d) {
                        if (d.properties.DEATHS == null) {
                            return 3
                        }
                        else {
                            return scaleQuantRad(d.properties.DEATHS);
                        }
                    })

                //Reset all the dots on the map
                d3.selectAll(".mapcircle")
                    .filter(function (d) { return d.id === curent_id; })
                    .transition()
                    .duration(500)
                    .attr("r", function (d) {
                        if (d.properties.DEATHS == null) {
                            return 3
                        }
                        else {
                            return scaleQuantRad(d.properties.DEATHS);
                        }
                    })
                   // world_map.reset();
            });
    }
    //<---------------------------------------------------------------------------------------------------->

    /**
     * Task 9 - Append the brush.
     * Brush must come last because we changes places of the focus and context plots.
     * The brush function is trying to access things in scatter plot which are not yet
     * implmented if we put the brush before.
     */
    //console.log(xScale.range());
    context.append("g")
        .attr("class", "brush") 
        .call(brush) 
        .call(brush.move, xScale.range());//allows for burshing the in x-axis
    

    //<---------------------------------------------------------------------------------------------------->

    //Brush function for filtering through the data.
    function brushed(){
        //Function that updates scatter plot and map each time brush is used
        var s = d3.event.selection || navXScale.range();
        xScale.domain(s.map(navXScale.invert, navXScale));
        focus.selectAll(".dot")
            .filter(function (d) { return d.properties.EQ_PRIMARY != null })
            .attr("cx", function (d) {
                return xScale(parseDate(d.properties.Date));
            })
            .attr("cy", function (d) {
                return yScale(d.properties.EQ_PRIMARY);
            })

        focus.select(".axis--x").call(xAxis);

        if (d3.event.type == "end") {
            var curr_view_erth = []
            d3.selectAll(".dot").each( 
                function (d, i) {
                    if (parseDate(d.properties.Date) >= xScale.domain()[0] &&
                        parseDate(d.properties.Date) <= xScale.domain()[1]) {
                        curr_view_erth.push(d.id.toString());
                    }
                });
            /**
             * Remove comment for updating dots on the map.
             */
            curr_points_view = world_map.change_map_points(curr_view_erth)
           
        }
    }

    //<---------------------------------------------------------------------------------------------------->

    /**
     * Function for hovering the points, implement if time allows.
     */
    this.hovered = function(){
        console.log("If time allows you, implement something here!");
    }

}
