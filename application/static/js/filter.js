
let FilterLayout = function (container) {
    let that = this;
    that.container = container;

    let bbox = that.container.node().getBoundingClientRect();
    let width = bbox.width;
    let height = bbox.height;
    let layout_width = width - 20;
    let layout_height = height - 20;
    let widget_width = null;
    let widget_height = null;
    let data_manager = null;
    let AnimationDuration = 1000;
    let color_unlabel = UnlabeledColor;
    let color_label = CategoryColor;

    // svg
    let uncertainty_svg = null;
    let label_svg = null;
    let indegree_svg = null;
    let outdegree_svg = null;
    let edgeInfluence_svg = null;
    let edgeType_svg = null;

    //data
    let label_widget_data = null;
    let label_widget_range = [-1, -1];
    let uncertainty_widget_data = null;
    let uncertainty_widget_range = [-1, -1];
    let indegree_widget_data = null;
    let indegree_widget_range = [-1, -1];
    let outdegree_widget_data = null;
    let outdegree_widget_range = [-1, -1];
    let influence_widget_data = null;
    let influence_widget_range = [-1,-1];
    let edgetype_data = null;
    let edgetype_range = [];

    //filter flag
    let control_items = {};
    let label_items = {};
    let uncertain_items = {};
    let indegree_items = {};
    let outdegree_items = {};

    //drag
    let uncertainty_start_drag = null;
    let uncertainty_end_drag = null;
    let indegree_start_drag = null;
    let indegree_end_drag = null;
    let outdegree_start_drag = null;
    let outdegree_end_drag = null;
    let influence_start_drag = null;
    let influence_end_drag = null;

    let edge_type_icons = {
        "in":null,
        "out":null,
        "within":null,
        "between":null
    };
    let edge_type_rects = {
        "in":null,
        "out":null,
        "within":null,
        "between":null
    };
    let edge_type_checkboxes = {
        "in": null,
        "out": null,
        "within": null,
        "between": null
    };

    //label
    let label_rect = {};

    that._init = function () {
        uncertainty_svg = container.select("#current-uncertainty-svg");
        label_svg = container.select("#current-label-svg");
        indegree_svg = container.select("#current-indegree-svg");
        outdegree_svg = container.select("#current-outdegree-svg");
        edgeInfluence_svg = container.select("#current-edgeinfluence-svg");
        edgeType_svg = container.select("#current-edgetype-svg");

        widget_width = parseInt($("#current-uncertainty-svg").width());
        widget_height = parseInt($("#current-uncertainty-svg").height());

        edge_type_icons["in"] = container.select("#in_icon");
        edge_type_icons["out"] = container.select("#out_icon");
        edge_type_icons["within"] = container.select("#within_icon");
        edge_type_icons["between"] = container.select("#between_icon");

        edge_type_checkboxes["in"] = container.select("#in-checkbox");
        edge_type_checkboxes["out"] = container.select("#out-checkbox");
        edge_type_checkboxes["within"] = container.select("#within-checkbox");
        edge_type_checkboxes["between"] = container.select("#between-checkbox");
    };

    that.set_data_manager = function(new_data_manager) {
        data_manager = new_data_manager;
    };

    that.component_update = function(state) {
        console.log("get filter state:", state);
        that._update_data(state);
        that._update_view();
    };

    that._update_data = function(state) {
        label_widget_data = state.label_widget_data;
        label_widget_range = state.label_widget_range;
        uncertainty_widget_data = state.uncertainty_widget_data;
        uncertainty_widget_range = state.uncertainty_widget_range;
        indegree_widget_data = state.indegree_widget_data;
        indegree_widget_range = state.indegree_widget_range;
        outdegree_widget_data = state.outdegree_widget_data;
        outdegree_widget_range = state.outdegree_widget_range;
        influence_widget_data = state.influence_widget_data;
        influence_widget_range = state.influence_widget_range;
        edgetype_data = state.edgetype_data;
        edgetype_range = state.edgetype_range;

        // init flags
        uncertain_items = {};
        label_items = {};
        indegree_items = {};
        outdegree_items = {};
        control_items = {};
        for(let i=0; i< uncertainty_widget_data.length; i++){
            if(i<uncertainty_widget_range[0] || i>uncertainty_widget_range[1]){
                for(let node_id of uncertainty_widget_data[i]){
                    uncertain_items[node_id] = false;
                }
            }
            else {
                for(let node_id of uncertainty_widget_data[i]){
                    uncertain_items[node_id] = true;
                }
            }
        }
        for(let i=0; i< indegree_widget_data.length; i++){
            if(i<indegree_widget_range[0] || i>indegree_widget_range[1]){
                for(let node_id of indegree_widget_data[i]){
                    indegree_items[node_id] = false;
                }
            }
            else {
                for(let node_id of indegree_widget_data[i]){
                    indegree_items[node_id] = true;
                }
            }
        }
        for(let i=0; i< outdegree_widget_data.length; i++){
            if(i<outdegree_widget_range[0] || i>outdegree_widget_range[1]){
                for(let node_id of outdegree_widget_data[i]){
                    outdegree_items[node_id] = false;
                }
            }
            else {
                for(let node_id of outdegree_widget_data[i]){
                    outdegree_items[node_id] = true;
                }
            }
        }
        for(let i=0; i< label_widget_data.length; i++){
            if(label_widget_range.indexOf(i)===-1){
                for(let node_id of label_widget_data[i]){
                    label_items[node_id] = false;
                }
            }
            else {
                for(let node_id of label_widget_data[i]){
                    label_items[node_id] = true;
                }
            }
        }
        for(let node_bins of uncertainty_widget_data){
            for(let node_id of node_bins){
                control_items[node_id] = label_items[node_id]&&
                    indegree_items[node_id]&&outdegree_items[node_id];
            }
        }
    };

    that._update_view = function() {
        that._draw_widget(uncertainty_widget_data, uncertainty_svg, "uncertainty", uncertainty_widget_range, uncertain_items);
        that.label_scented_widget();
        that._draw_widget(indegree_widget_data, indegree_svg, "indegree", indegree_widget_range, indegree_items);
        that._draw_widget(outdegree_widget_data, outdegree_svg, "outdegree", outdegree_widget_range, outdegree_items);
        that.draw_edge_influence_widget(influence_widget_data, edgeInfluence_svg, "influence", influence_widget_range);
        that.draw_edge_type_widget(edgetype_data, edgeType_svg, "edgetype", edgetype_range)
    };

    that.label_scented_widget = function() {
        // label interval
        let min_label_id = -1;
        let max_label_id = data_manager.state.label_names.length-1;
        let label_cnt = max_label_id-min_label_id+1;
        function interval_idx(label_id){
            return label_id;
        }


        // label distribution
        let label_distribution = label_widget_data;
        let max_len = 0;
        for(let label_ary of label_distribution){
            if(max_len < label_ary.length){
                max_len = label_ary.length;
            }
        }

        // draw
        label_rect = {};
        let container = label_svg;
        let container_width = widget_width;
        let container_height = widget_height;
        // container.selectAll("*").remove();
        let x = d3.scaleBand().rangeRound([container_width*0.1, container_width*0.9], .05).paddingInner(0.05).domain(d3.range(label_cnt));
        let y = d3.scaleLinear().range([container_height*0.85, container_height*0.05]).domain([0, 1]);
        // draw rect

        if(container.select("#current-label-rects").size() === 0){
            container.append("g")
                .attr("id", "current-label-rects");
        }
        let rects = container.select("#current-label-rects").selectAll("rect").data(label_distribution);
        rects
            .enter()
            .append("rect")
            .attr("class", "widget-bar-chart")
            .style("fill", (d, i) => i===0?color_unlabel:color_label[i-1])
            .attr("x", function(d, i) { return x(i); })
            .attr("width", x.bandwidth())
            .attr("y", function(d, i) { return y(d.length/max_len); })
            .attr("height", function(d) {
              return container_height*0.85 - y(d.length/max_len);
          })
            .attr("opacity", (d, i) => (label_widget_range.indexOf(i) > -1)?1:0.2)
            .on("mouseover", function (d, i) {
                let rect = label_rect[i].rect;
                let checkbox = label_rect[i].checkbox;
                if(rect.attr("opacity") == 1){
                    rect.attr("opacity", 0.5);
                }
            })
            .on("mouseout", function (d, i) {
                let rect = label_rect[i].rect;
                let checkbox = label_rect[i].checkbox;
                if(rect.attr("opacity") == 0.5){
                    rect.attr("opacity", 1);
                }
            })
            .on("click", function (d, i) {
                let rect = label_rect[i].rect;
                let checkbox = label_rect[i].checkbox;
                if(rect.attr("opacity") != 0.2){
                    // no select
                    rect.attr("opacity", 0.2);
                    checkbox.select("rect").attr("fill", (d,i) => "white");
                    for(let id of label_rect[i].data){
                        label_items[id] = false;
                    }
                    that.update_widget_showing_items(label_rect[i].data);
                    label_widget_range.splice(label_widget_range.indexOf(i), 1);
                }
                else {
                    rect.attr("opacity", 0.5);
                    checkbox.select("rect").attr("fill", (d,i) => d.label===0?color_unlabel:color_label[d.label-1]);
                    for(let id of label_rect[i].data){
                        label_items[id] = true;
                    }
                    that.update_widget_showing_items(label_rect[i].data);
                    label_widget_range.push(i);
                }
            })
            .each(function (d, i) {
                let rect = d3.select(this);
                label_rect[i] = {
                    label:i,
                    rect:rect,
                    data:d
                }
            });
        rects
            .each(function (d, i) {
                let rect = d3.select(this);
                label_rect[i] = {
                    label:i,
                    rect:rect,
                    data:d
                }
            });
        rects.each(function (d) {
           let rect = d3.select(this);
           if(rect.attr("opacity")==0.2){
               for(let id of d){
                   label_items[id] = false;
               }
           }
           else {
               for(let id of d){
                   label_items[id] = true;
               }
           }
        });
        rects.transition()
            .duration(AnimationDuration)
            .attr("y", function(d, i) { return y(d.length/max_len); })
            .attr("height", function(d) {
                  return container_height*0.85 - y(d.length/max_len);
              })
            .attr("opacity", (d, i) => (label_widget_range.indexOf(i) > -1)?1:0.2);
        rects.exit()
            .transition()
            .duration(AnimationDuration)
            .remove();
        // draw axis
        if(container.select("#current-label-axis").size() === 0){
            container.append("g")
            .attr("id", "current-label-axis")
            .append("line")
            .attr("x1", container_width*0.1)
            .attr("y1", container_height*0.85)
            .attr("x2", container_width*0.9)
            .attr("y2", container_height*0.85)
            .attr("stroke", "black")
            .attr("stroke-width", 1);
        }
        // draw checkbox
        if(container.select(".current-label-checkbox").size() === 0){
            let bandwidth = x.bandwidth()*0.7;
            let offset = x.bandwidth()*0.15;
            let groups = container
                .selectAll(".current-label-checkbox")
                .data(Object.values(label_rect))
			    .enter()
                .append("g")
                .attr("class", "current-label-checkbox")
                .each(function (d, i) {
                    label_rect[i].checkbox = d3.select(this);
                })
                .attr("transform", (d, i) => "translate("+(x(label_rect[i].label)+offset)+","+(container_height*0.85+offset)+")")
                .on("mouseover", function (d, i) {
                    let rect = label_rect[i].rect;
                    let checkbox = label_rect[i].checkbox;
                    if(rect.attr("opacity") == 1){
                        rect.attr("opacity", 0.5);
                    }
                })
                .on("mouseout", function (d, i) {
                    let rect = label_rect[i].rect;
                    if(rect.attr("opacity") == 0.5){
                        rect.attr("opacity", 1);
                    }
                })
                .on("click", function (d, i) {
                    let rect = label_rect[i].rect;
                    let checkbox = label_rect[i].checkbox;
                    if(rect.attr("opacity") != 0.2){
                        // no select
                        rect.attr("opacity", 0.2);
                        checkbox.select("rect").attr("fill", (d,i) =>  "white");
                        for(let id of label_rect[i].data){
                            label_items[id] = false;
                        }
                        that.update_widget_showing_items(label_rect[i].data);
                        label_widget_range.splice(label_widget_range.indexOf(i), 1);
                    }
                    else {
                        rect.attr("opacity", 0.5);
                        checkbox.select("rect").attr("fill", (d,i) => (d.label===0?color_unlabel:color_label[d.label-1]));
                        for(let id of label_rect[i].data){
                            label_items[id] = true;
                        }
                        that.update_widget_showing_items(label_rect[i].data);
                        label_widget_range.push(i);
                    }
                });
            groups.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", bandwidth)
                .attr("height", bandwidth)
                .attr("rx", bandwidth / 4)
                .attr("ry", bandwidth / 4)
                .attr("fill", (d,i) => label_rect[i].rect.attr("opacity")==1 ? (i===0?color_unlabel:color_label[i-1]) : "white")
                .attr("stroke", (d,i) => (i===0?color_unlabel:color_label[i-1]));
            groups.append("text")
                .style("stroke", "white")
                .style("fill", "white")
                .attr("text-anchor", "middle")
                .attr("x", bandwidth / 2)
                .attr("y", bandwidth / 2 + 6)
                .text("\u2714");


            // container.append("g")
            //     .attr("id", "current-label-checkbox-hover")
            //     .selectAll("rect")
            //     .data(Object.values(label_rect))
            //     .enter()
            //     .append("rect")
            //     .attr("x", (d, i) => x(label_rect[i].label)+offset)
            //     .attr("y", container_height*0.85+offset)
            //     .attr("width", bandwidth)
            //     .attr("height", bandwidth)
            //     .attr("opacity", 0)
            //     .on("mouseover", function (d, i) {
            //         let rect = label_rect[i].rect;
            //         let checkbox = label_rect[i].checkbox;
            //         if(rect.attr("opacity") == 1){
            //             rect.attr("opacity", 0.5);
            //         }
            //     })
            //     .on("mouseout", function (d, i) {
            //         let rect = label_rect[i].rect;
            //         let checkbox = label_rect[i].checkbox;
            //         if(rect.attr("opacity") == 0.5){
            //             rect.attr("opacity", 1);
            //         }
            //     })
            //     .on("click", function (d, i) {
            //         let rect = label_rect[i].rect;
            //         let checkbox = label_rect[i].checkbox;
            //         if(rect.attr("opacity") != 0.2){
            //             // no select
            //             rect.attr("opacity", 0.2);
            //             checkbox.attr("xlink:href", "#check-no-select");
            //             for(let id of label_rect[i].data){
            //                 label_items[id] = false;
            //             }
            //             that.update_widget_showing_items(label_rect[i].data);
            //             label_widget_range.splice(label_widget_range.indexOf(i), 1);
            //         }
            //         else {
            //             rect.attr("opacity", 0.5);
            //             checkbox.attr("xlink:href", "#check-select");
            //             for(let id of label_rect[i].data){
            //                 label_items[id] = true;
            //             }
            //             that.update_widget_showing_items(label_rect[i].data);
            //             label_widget_range.push(i);
            //         }
            //     });
            // container.append("g")
            //     .attr("id", "current-label-checkbox")
            //     .selectAll("use")
            //     .data(Object.values(label_rect))
            //     .enter()
            //     .append("use")
            //     .attr("xlink:href", (d, i) => label_widget_range.indexOf(i)>-1?"#check-select":"#check-no-select")
            //     .attr("x", (d, i) => x(label_rect[i].label)+offset)
            //     .attr("y", container_height*0.85+offset)
            //     .attr("width", bandwidth)
            //     .attr("height", bandwidth)
            //     .each(function (d, i) {
            //         let checkbox = d3.select(this);
            //         label_rect[i].checkbox = checkbox;
            //     })
        }
        else {
            container.selectAll(".current-label-checkbox")
                .data(Object.values(label_rect));
            container.selectAll(".current-label-checkbox")
                .each(function (d, i) {
                        label_rect[i].checkbox = d3.select(this);
                    });
            container.selectAll(".current-label-checkbox")
                .select("rect")
                .data(Object.values(label_rect));


            container.selectAll(".current-label-checkbox")
                .select("rect")
                .attr("fill", (d,i) => label_rect[d.label].rect.attr("opacity")==1 ? (d.label===0?color_unlabel:color_label[d.label-1]) : "white")
        }
    };

    that.update_widget_showing_items = function(ids) {
        let remove_nodes = [];
        let add_nodes = [];
        for(let node_id of ids){
            let new_flag = label_items[node_id]&&indegree_items[node_id]&&outdegree_items[node_id];
            if(new_flag === true && control_items[node_id] === false){
                add_nodes.push(node_id);
                control_items[node_id] = new_flag;
            }
            else if(new_flag === false && control_items[node_id] === true){
                remove_nodes.push(node_id);
                control_items[node_id] = new_flag;
            }

        }
        if(remove_nodes.length >0 || add_nodes.length>0){
            console.log(remove_nodes, add_nodes);
            // TODO
            data_manager.change_visible_items(control_items);
            // data_manager.change_glyphs(control_items);
        }

    };

    that.update_glyph_showing_items = function() {
        let show_glyphs = Object.keys(uncertain_items).map(d => parseInt(d)).filter(d => uncertain_items[d]===true);
        console.log("show glyphs:", show_glyphs);
        data_manager.change_glyphs(show_glyphs);
    };

    that._draw_widget = function(distribution, container, type, range, visible_items){
        // distribution
        let max_len = 0;
        let bar_cnt = distribution.length;
        for(let node_ary of distribution){
            if(max_len < node_ary.length){
                max_len = node_ary.length;
            }
        }
        // draw
        let container_width = widget_width;
        let container_height = widget_height;
        let x = d3.scaleBand().rangeRound([container_width*0.1, container_width*0.9], .05).paddingInner(0.05).domain(d3.range(bar_cnt));
        let y = d3.scaleLinear().range([container_height*0.85, container_height*0.05]).domain([0, 1]);

        //draw bar chart
        if(container.select("#current-"+type+"-rects").size() === 0){
            container.append("g")
                .attr("id", "current-"+type+"-rects");
        }
        let rects = container.select("#current-"+type+"-rects").selectAll("rect").data(distribution);
        //create
        rects
            .enter()
            .append("rect")
            .attr("class", "widget-bar-chart")
            .style("fill", "rgb(127, 127, 127)")
            .attr("x", function(d, i) { return x(i); })
            .attr("width", x.bandwidth())
            .attr("y", function(d, i) { return y(d.length/max_len); })
            .attr("height", function(d) {
                return container_height*0.85 - y(d.length/max_len);
            })
            .attr("opacity", (d, i) => (i>=range[0]&&i<=range[1])?1:0.5);
        //update
        rects.transition()
            .duration(AnimationDuration)
            .attr("x", function(d, i) { return x(i); })
            .attr("width", x.bandwidth())
            .attr("y", function(d, i) { return y(d.length/max_len); })
            .attr("height", function(d) {
                return container_height*0.85 - y(d.length/max_len);
            })
            .attr("opacity", (d, i) => (i>=range[0]&&i<=range[1])?1:0.5);
        //remove
        rects.exit()
            .transition()
            .duration(AnimationDuration)
            .attr("opacity", 0)
            .remove();

        // draw x-axis
        if(container.select("#current-"+type+"-axis").size() === 0){
            container.append("g")
                .attr("id","current-"+type+"-axis")
                .append("line")
                .attr("x1", container_width*0.1)
                .attr("y1", container_height*0.85)
                .attr("x2", container_width*0.9)
                .attr("y2", container_height*0.85)
                .attr("stroke", "black")
                .attr("stroke-width", 1);
        }

        //draw dragble
        let draggable_item_path = "M0 -6 L6 6 L-6 6 Z";
        let drag_interval = x.step();
        let start_drag = null;
        let end_drag = null;
        if(container.select(".start-drag").size() === 0){
            start_drag = container.append("path")
                .attr("class", "start-drag")
                .attr("d", draggable_item_path)
                .attr("fill", "rgb(127, 127, 127)")
                .attr("transform", "translate("+(container_width*0.1+range[0]*drag_interval-2)+","+(container_height*0.9)+")");
            end_drag = container.append("path")
                .attr("class", "end-drag")
                .attr("d", draggable_item_path)
                .attr("fill", "rgb(127, 127, 127)")
                .attr("transform", "translate("+(container_width*0.1+(range[1]+1)*drag_interval+2)+","+(container_height*0.9)+")");
        }
        else {
            start_drag = container.select(".start-drag");
            end_drag = container.select(".end-drag");
            start_drag.transition()
                .duration(AnimationDuration)
                .attr("transform", "translate("+(container_width*0.1+range[0]*drag_interval-2)+","+(container_height*0.9)+")");
            end_drag.transition()
                .duration(AnimationDuration)
                .attr("transform", "translate("+(container_width*0.1+(range[1]+1)*drag_interval+2)+","+(container_height*0.9)+")");
        }
        start_drag.call(d3.drag()
                    .on("drag", function () {
                        let x = d3.event.x;
                        let drag_btn = d3.select(this);
                        let min_x = container_width*0.09;
                        let max_x = -1;
                        let end_pos = end_drag.attr("transform").slice(end_drag.attr("transform").indexOf("(")+1, end_drag.attr("transform").indexOf(","));
                        max_x = parseFloat(end_pos);
                        if((x<=min_x)||(x>=max_x)) return;
                        drag_btn.attr("transform", "translate("+(x)+","+(container_height*0.9)+")");
                        container.selectAll("rect").attr("opacity", function (d, i) {
                            let change = false;
                            let rect = d3.select(this);
                            let rect_x = parseFloat(rect.attr("x"));
                            let rect_width = parseFloat(rect.attr("width"));
                            if((rect_x>=x)&&(rect_x+rect_width<=max_x)){
                                // in control
                                if(rect.attr("opacity")!=1)change = true;
                                for(let id of d){
                                    visible_items[id] = true;
                                }
                                if(change) {
                                    if(type === "uncertainty"){
                                        that.update_glyph_showing_items();
                                    }
                                    else {
                                        that.update_widget_showing_items(d);
                                    }
                                    range[0] = i;

                                }
                                return 1
                            }
                            if(rect.attr("opacity")!=0.5)change = true;
                            for(let id of d){
                                    visible_items[id] = false;
                            }
                            if(change) {
                                if(type === "uncertainty"){
                                    that.update_glyph_showing_items();
                                }
                                else {
                                    that.update_widget_showing_items(d);
                                }
                                range[0] = i+1;

                            }
                            return 0.5
                        })
                    }));
            end_drag.call(d3.drag()
                    .on("drag", function () {
                        let x = d3.event.x;
                        let drag_btn = d3.select(this);
                        let max_x = container_width*0.91;
                        let min_x = -1;
                        let end_pos = start_drag.attr("transform").slice(start_drag.attr("transform").indexOf("(")+1, start_drag.attr("transform").indexOf(","));
                        min_x = parseFloat(end_pos);
                        if((x<=min_x)||(x>=max_x)) return;
                        drag_btn.attr("transform", "translate("+(x)+","+(container_height*0.9)+")");

                        container.selectAll("rect").attr("opacity", function (d, i) {
                            let change = false;
                            let rect = d3.select(this);
                            let rect_x = parseFloat(rect.attr("x"));
                            let rect_width = parseFloat(rect.attr("width"));
                            if((rect_x>=min_x)&&(rect_x+rect_width<=x)){
                                // in control
                                if(rect.attr("opacity")!=1)change = true;
                                for(let id of d){
                                    visible_items[id] = true;
                                }
                                if(change) {
                                    if(type === "uncertainty"){
                                        that.update_glyph_showing_items();
                                    }
                                    else {
                                        that.update_widget_showing_items(d);
                                    }
                                    range[1] = i;

                                }
                                return 1
                            }
                            if(rect.attr("opacity")!=0.5)change = true;
                            for(let id of d){
                                    visible_items[id] = false;
                            }
                            if(change) {
                                if(type === "uncertainty"){
                                    that.update_glyph_showing_items();
                                }
                                else {
                                    that.update_widget_showing_items(d);
                                }
                                range[1] = i-1;

                            }
                            return 0.5
                        })
                    }))
    };

    that.get_visible_items = function() {
        return control_items;
    };

    that.get_glyph_items = function() {
        return Object.keys(uncertain_items).map(d => parseInt(d)).filter(d => uncertain_items[d]===true);;
    };

    that.get_ranges = function() {
        return [uncertainty_widget_range, label_widget_range, indegree_widget_range, outdegree_widget_range, influence_widget_range, edgetype_range]
    };

    that.draw_edge_influence_widget = function(distribution, container, type, range){
        // distribution
        let max_len = 0;
        let bar_cnt = distribution.length;
        for(let node_ary of distribution){
            if(max_len < node_ary){
                max_len = node_ary;
            }
        }
        // draw
        let container_width = widget_width;
        let container_height = widget_height;
        let x = d3.scaleBand().rangeRound([container_width*0.1, container_width*0.9], .05).paddingInner(0.05).domain(d3.range(bar_cnt));
        let y = d3.scaleLinear().range([container_height*0.85, container_height*0.05]).domain([0, 1]);

        //draw bar chart
        if(container.select("#current-"+type+"-rects").size() === 0){
            container.append("g")
                .attr("id", "current-"+type+"-rects");
        }
        let rects = container.select("#current-"+type+"-rects").selectAll("rect").data(distribution);
        //create
        rects
            .enter()
            .append("rect")
            .attr("class", "widget-bar-chart")
            .style("fill", "rgb(127, 127, 127)")
            .attr("x", function(d, i) { return x(i); })
            .attr("width", x.bandwidth())
            .attr("y", function(d, i) { return y(d/max_len); })
            .attr("height", function(d) {
                return container_height*0.85 - y(d/max_len);
            })
            .attr("opacity", (d, i) => (i>=range[0]&&i<=range[1])?1:0.5);
        //update
        rects.transition()
            .duration(AnimationDuration)
            .attr("x", function(d, i) { return x(i); })
            .attr("width", x.bandwidth())
            .attr("y", function(d, i) { return y(d/max_len); })
            .attr("height", function(d) {
                return container_height*0.85 - y(d/max_len);
            })
            .attr("opacity", (d, i) => (i>=range[0]&&i<=range[1])?1:0.5);
        //remove
        rects.exit()
            .transition()
            .duration(AnimationDuration)
            .attr("opacity", 0)
            .remove();

        // draw x-axis
        if(container.select("#current-"+type+"-axis").size() === 0){
            container.append("g")
                .attr("id","current-"+type+"-axis")
                .append("line")
                .attr("x1", container_width*0.1)
                .attr("y1", container_height*0.85)
                .attr("x2", container_width*0.9)
                .attr("y2", container_height*0.85)
                .attr("stroke", "black")
                .attr("stroke-width", 1);
        }

        //draw dragble
        let draggable_item_path = "M0 -6 L6 6 L-6 6 Z";
        let drag_interval = x.step();
        let start_drag = null;
        let end_drag = null;
        if(container.select(".start-drag").size() === 0){
            start_drag = container.append("path")
                .attr("class", "start-drag")
                .attr("d", draggable_item_path)
                .attr("fill", "rgb(127, 127, 127)")
                .attr("transform", "translate("+(container_width*0.1+range[0]*drag_interval-2)+","+(container_height*0.9)+")");
            end_drag = container.append("path")
                .attr("class", "end-drag")
                .attr("d", draggable_item_path)
                .attr("fill", "rgb(127, 127, 127)")
                .attr("transform", "translate("+(container_width*0.1+(range[1]+1)*drag_interval+2)+","+(container_height*0.9)+")");
        }
        else {
            start_drag = container.select(".start-drag");
            end_drag = container.select(".end-drag");
            start_drag.transition()
                .duration(AnimationDuration)
                .attr("transform", "translate("+(container_width*0.1+range[0]*drag_interval-2)+","+(container_height*0.9)+")");
            end_drag.transition()
                .duration(AnimationDuration)
                .attr("transform", "translate("+(container_width*0.1+(range[1]+1)*drag_interval+2)+","+(container_height*0.9)+")");
        }
        start_drag.call(d3.drag()
                    .on("drag", function () {
                        let x = d3.event.x;
                        let drag_btn = d3.select(this);
                        let min_x = container_width*0.09;
                        let max_x = -1;
                        let end_pos = end_drag.attr("transform").slice(end_drag.attr("transform").indexOf("(")+1, end_drag.attr("transform").indexOf(","));
                        max_x = parseFloat(end_pos);
                        if((x<=min_x)||(x>=max_x)) return;
                        drag_btn.attr("transform", "translate("+(x)+","+(container_height*0.9)+")");
                        container.selectAll("rect").attr("opacity", function (d, i) {
                            let change = false;
                            let rect = d3.select(this);
                            let rect_x = parseFloat(rect.attr("x"));
                            let rect_width = parseFloat(rect.attr("width"));
                            if((rect_x>=x)&&(rect_x+rect_width<=max_x)){
                                // in control
                                if(rect.attr("opacity")!=1)change = true;
                                if(change) {

                                    range[0] = i;
                                    data_manager.update_edge_filter(range[0], range[1]);
                                }
                                return 1
                            }
                            if(rect.attr("opacity")!=0.5)change = true;
                            if(change) {

                                range[0] = i+1;
                                data_manager.update_edge_filter(range[0], range[1]);
                            }
                            return 0.5
                        })
                    }));
            end_drag.call(d3.drag()
                    .on("drag", function () {
                        let x = d3.event.x;
                        let drag_btn = d3.select(this);
                        let max_x = container_width*0.91;
                        let min_x = -1;
                        let end_pos = start_drag.attr("transform").slice(start_drag.attr("transform").indexOf("(")+1, start_drag.attr("transform").indexOf(","));
                        min_x = parseFloat(end_pos);
                        if((x<=min_x)||(x>=max_x)) return;
                        drag_btn.attr("transform", "translate("+(x)+","+(container_height*0.9)+")");

                        container.selectAll("rect").attr("opacity", function (d, i) {
                            let change = false;
                            let rect = d3.select(this);
                            let rect_x = parseFloat(rect.attr("x"));
                            let rect_width = parseFloat(rect.attr("width"));
                            if((rect_x>=min_x)&&(rect_x+rect_width<=x)){
                                // in control
                                if(rect.attr("opacity")!=1)change = true;
                                if(change) {
                                    range[1] = i;
                                    data_manager.update_edge_filter(range[0], range[1]);
                                }
                                return 1
                            }
                            if(rect.attr("opacity")!=0.5)change = true;
                            if(change) {
                                range[1] = i-1;
                                data_manager.update_edge_filter(range[0], range[1]);
                            }
                            return 0.5
                        })
                    }))
    };

    that.draw_edge_type_widget = function(distribution, container, type, range){
        // distribution
        let types = ["in", "out", "within", "between"];
        let data = [];
        for(let edge_type of types){
            data.push({
                "type":edge_type,
                "cnt":distribution[edge_type],
                "show":range.indexOf(edge_type)>-1
            })
        }
        let max_len = 1;
        let bar_cnt = data.length;
        for(let node_ary of data){
            if(max_len < node_ary.cnt){
                max_len = node_ary.cnt;
            }
        }
        // draw
        let container_width = widget_width;
        let container_height = widget_height;
        let x = d3.scaleBand().rangeRound([container_width*0.1, container_width*0.9], .05).paddingInner(0.7).paddingOuter(0.4).domain(d3.range(bar_cnt));
        let y = d3.scaleLinear().range([container_height*0.85, container_height*0.05]).domain([0, 1]);

        //draw bar chart
        if(container.select("#current-"+type+"-rects").size() === 0){
            container.append("g")
                .attr("id", "current-"+type+"-rects");
        }
        let rects = container.select("#current-"+type+"-rects").selectAll("rect").data(data);
        //create
        rects
            .enter()
            .append("rect")
            .attr("class", "widget-bar-chart")
            .style("fill", "rgb(127, 127, 127)")
            .attr("x", function(d, i) { return x(i); })
            .attr("width", x.bandwidth())
            .attr("y", function(d, i) { return y(d.cnt/max_len); })
            .attr("height", function(d) {
                return container_height*0.85 - y(d.cnt/max_len);
            })
            .attr("opacity", (d, i) => d.show?1:0.2)
            .on("mouseover", function (d, i) {
                let rect = d3.select(this);
                if(rect.attr("opacity") == 1){
                    rect.attr("opacity", 0.5);
                }
            })
            .on("mouseout", function (d, i) {
                let rect = d3.select(this);
                if(rect.attr("opacity") == 0.5){
                    rect.attr("opacity", 1);
                }
            })
            .on("click", function (d, i) {
                let rect = d3.select(this);
                if(rect.attr("opacity") != 0.2){
                    // no select
                    rect.attr("opacity", 0.2);
                    that.set_edge_type_checkbox(edge_type_checkboxes[d.type], false);
                    let index = range.indexOf(d.type);
                    if (index !== -1) range.splice(index, 1);
                }
                else {
                    rect.attr("opacity", 0.5);
                    that.set_edge_type_checkbox(edge_type_checkboxes[d.type], true);
                    let index = range.indexOf(d.type);
                    if (index === -1) range.push(d.type);
                }
                data_manager.update_edge_type_filter(range);
            })
            .each(function (d) {
                let rect = d3.select(this);
                edge_type_rects[d.type] = rect;
            });
        //update
        rects.transition()
            .duration(AnimationDuration)
            .attr("x", function(d, i) { return x(i); })
            .attr("width", x.bandwidth())
            .attr("y", function(d, i) { return y(d.cnt/max_len); })
            .attr("height", function(d) {
                return container_height*0.85 - y(d.cnt/max_len);
            })
            .attr("opacity", (d, i) => d.show?1:0.2);
        rects.each(function (d) {
                let rect = d3.select(this);
                edge_type_rects[d.type] = rect;
                if(d.show){
                    that.set_edge_type_checkbox(edge_type_checkboxes[d.type], true);
                }
                else {
                    that.set_edge_type_checkbox(edge_type_checkboxes[d.type], false);
                }
            });
        //remove
        rects.exit()
            .transition()
            .duration(AnimationDuration)
            .attr("opacity", 0)
            .remove();

        // draw x-axis
        if(container.select("#current-"+type+"-axis").size() === 0){
            container.append("g")
                .attr("id","current-"+type+"-axis")
                .append("line")
                .attr("x1", container_width*0.1)
                .attr("y1", container_height*0.85)
                .attr("x2", container_width*0.9)
                .attr("y2", container_height*0.85)
                .attr("stroke", "black")
                .attr("stroke-width", 1);
        }

        // icons
        for(let type_id of Object.keys(edge_type_checkboxes)){
            let checkbox = edge_type_checkboxes[type_id];
            let rect = edge_type_rects[type_id];
            let d = rect.datum();
            checkbox
                .on("mouseover", function () {
                    if(rect.attr("opacity") == 1){
                        rect.attr("opacity", 0.5);
                    }
                })
                .on("mouseout", function () {
                    if(rect.attr("opacity") == 0.5){
                        rect.attr("opacity", 1);
                    }
                })
                .on("click", function () {
                if(rect.attr("opacity") != 0.2){
                    // no select
                    rect.attr("opacity", 0.2);
                    that.set_edge_type_checkbox(checkbox, false);
                    let index = range.indexOf(d.type);
                    if (index !== -1) range.splice(index, 1);
                }
                else {
                    rect.attr("opacity", 0.5);
                    that.set_edge_type_checkbox(checkbox, true);
                    let index = range.indexOf(d.type);
                    if (index === -1) range.push(d.type);
                }
                data_manager.update_edge_type_filter(range);
            })

        }
    };

    that.set_edge_type_icon_opacity = function(selection, opacity){
        let path = selection.selectAll("path");
        let polygon = selection.selectAll("polygon");
        path
            .transition()
            .duration(AnimationDuration)
            .attr("opacity", opacity);
        polygon
            .transition()
            .duration(AnimationDuration)
            .attr("opacity", opacity);
    };

    that.set_edge_type_checkbox = function(selection, is_check){
        selection.select("text")
            .style("stroke", is_check?"black":"white")
            .style("fill", is_check?"black":"white");
    };

    that.init = function () {
        that._init();
    }.call();
};