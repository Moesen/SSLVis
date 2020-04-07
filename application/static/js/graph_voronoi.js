// Created by Changjian, 20200406

let GraphVoronoi = function(parent){
    let that = this;

    // parent
    let view = null;

    // group
    that.voronoi_group = null;
    that.voronoi_in_group = null;
    that.sub_bar_group = null;
    
    // data
    let color_unlabel = UnlabeledColor;
    let color_label = CategoryColor;
    that.voronoi_data = {"edges": [], "cells": []};
    let AnimationDuration = 300;
    let create_ani = AnimationDuration;
    let update_ani = AnimationDuration;
    let remove_ani = AnimationDuration * 0.1;
    let class_cnt = null;
    let small_inner_bounder = null;
    let large_inner_bounder = null;
    let outer_bounder = null;
    that.cell_data = [];

    // flag
    that.show_voronoi = false;
    that.simple_bar = true;
    that.drag_activated = false;
    that.drag_node = null;
    that.second_drag_node = null;
    that.comparison_flag = false;

    // function
    scale_function = function(x){
        if (x > 0.2 && x < 0.5) { x = x * 2;}
        return Math.pow(x, 0.8);
    }

    that._init = function(){
        that.set_view(parent);
    };

    that.set_view = function (new_parent) {
        view = new_parent;
        that.voronoi_group = view.voronoi_group;
    };

    that.show_voronoi = function(nodes, outliers){
        let voronoi_nodes = nodes.filter(d => outliers[d.id] === undefined);
        that.voronoi_data = view.cal_voronoi(voronoi_nodes);

        that.update_view();
    };

    that.max_search_num = 100;

    that.place_barchart = function(){
        let step = 0.1;
        let direct_map = {
            0: [1,0],
            1: [0,1],
            2: [-1,0],
            3: [0,-1]
        }
        for (let i = 0; i < that.voronoi_data.cells.length; i++){
            let cell = that.voronoi_data.cells[i];
            let cell_x = cell.site.data[0];
            let cell_y = cell.site.data[1];
            console.log("cell position", cell_x, cell_y, 
                cell.chart_width / view.scale, cell.chart_height/view.scale);
            let nodes = cell.nodes;
            let j = 0;
            for (; j < that.max_search_num; j++){
                let direct = direct_map[j % 4];
                cell_x = cell_x + direct[0] * j * step;
                cell_y = cell_y + direct[1] * j * step;
                let k = 0;
                for (; k < nodes.length; k++){
                    if (nodes[k].x > cell_x && nodes[k].x < (cell_x + cell.chart_width / view.scale)
                        && nodes[k].y > cell_y && nodes[k].y > (cell_y + cell.chart_height/view.scale)){
                            break;
                        }
                    else{
                    }
                }
                if (k === nodes.length){
                    break;
                }
                // console.log("j", j);
            }
            cell.x = cell_x;
            cell.y = cell_y;
            console.log("final cell position", cell_x, cell_y, j);
        }
    };

    that.disable_voronoi = function(){
        that.voronoi_data = {"edges": [], "cells": []};
    };

    that.change_bar_mode = function(){
        that.simple_bar = !that.simple_bar;
        that.update_view();
    };
    
    that.show_comparison = function(){
        that.comparison_flag = true; 
        let data = [];
        let class_cnt = that.drag_node.summary.length;
        bar_width = 4 * view.zoom_scale;
        small_inner_bounder = 1.5 * view.zoom_scale * 1;
        large_inner_bounder = 3 * view.zoom_scale * 1;
        outer_bounder = 3 * view.zoom_scale;
        chart_width = bar_width*(2*class_cnt)
            +large_inner_bounder*(class_cnt-1)
            +small_inner_bounder*class_cnt+outer_bounder*2;
        chart_height = 80 * 0.8 * view.zoom_scale;
        let max_num = -1;
        for (let i = 0; i < class_cnt; i++){
            max_num = Math.max(max_num, that.drag_node.summary[i].in);
            max_num = Math.max(max_num, that.second_drag_node.summary[i].in);
        }
        for (let i = 0; i < class_cnt; i++){
            let drag_summary = that.drag_node.summary[i];
            let second_drag_summary = that.second_drag_node.summary[i];
            let value = drag_summary.in / max_num;
            let second_value = second_drag_summary.in / max_num;
            data.push({
                id: i * 2 ,
                x: outer_bounder+(bar_width*2+small_inner_bounder+large_inner_bounder)*i,
                y: chart_height*0.8-chart_height*0.7*scale_function(value),
                w: bar_width,
                h:chart_height*0.7*scale_function(value),
                color: color_label[i]
            });
            data.push({
                id: i * 2 + 1,
                x: outer_bounder + bar_width + small_inner_bounder +(bar_width*2+small_inner_bounder+large_inner_bounder)*i,
                y: chart_height*0.8-chart_height*0.7*scale_function(second_value),
                w: bar_width,
                h: chart_height*0.7*scale_function(second_value),
                color: color_label[i]
            });
        }
        that.show_group = that.voronoi_group.append("g")
            .attr("class", "comparison-group")
            .attr("transform", "translate("+(100)
            +","+(100)+")");
        
        that.show_group
            .append("rect")
            .attr("class", "barchart-shadow")
            .attr("x", 1.5)
            .attr("y", 1.5)
            .attr("width", chart_width)
            .attr("height", chart_height)
            .style("fill", "#969696");
        that.show_group.append("rect")
            .attr("class", "barchart-background")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", chart_width)
            .attr("height", chart_height)
            .style("fill", "white")
            .style("stroke", "#d8d7d7")
            .style("stroke-width", 1);
        that.show_group.append("g")
            .attr("class", "bar-group")
            .selectAll("rect.edge-summary-rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "edge-summary-rect")
            .attr("id", (d, i) => "edge-bar-in-"+i)
            .attr("x", (d, i) => d.x)
            .attr("y", (d, i) => d.y)
            .attr("width", (d, i) => d.w)
            .attr("height", (d, i) => d.h)
            .attr("fill", (d, i) => d.color);

    };

    that.remove_comparison = function(){
        that.comparison_flag = false; 

    };

    that.update_view = function(){
        that.cell_data = [];
        for (let i = 0; i < that.voronoi_data.cells.length; i++){
            let cell = that.voronoi_data.cells[i];
            let summary = that.simple_bar ? cell.simple_summary : cell.summary;
            let class_cnt = summary.length;
            cell.bar_width = 4 * view.zoom_scale;
            small_inner_bounder = 1.5 * view.zoom_scale * 0;
            large_inner_bounder = 3 * view.zoom_scale * 0;
            outer_bounder = 3 * view.zoom_scale;
            cell.chart_width = cell.bar_width*(2*class_cnt)+large_inner_bounder*(class_cnt-1)+small_inner_bounder*class_cnt+outer_bounder*2;
            cell.chart_height = 50 * 0.8 * view.zoom_scale;
            cell.summary_data = summary;
            that.cell_data.push(cell);
        }
        that.place_barchart();
        console.log("that.cell_data", that.cell_data.map(d => d.summary_data), "simple_bar", that.simple_bar);
        that.voronoi_in_group = that.voronoi_group.selectAll("g.voronoi-cell")
        .data(that.cell_data, d => d.id);

        that._create();
        that._update();
        that._remove();
    };

    that._remove = function(){
        that.voronoi_in_group.exit()
            .transition()
            .duration(remove_ani)
            .attr("opacity", 0)
            .remove();
        that.sub_bar_group
            .exit()
            .transition()
            .duration(remove_ani)
            .attr("opacity", 0)
            .remove();
    };

    that._update = function(){
        that.voronoi_in_group
            // .selectAll(".voronoi-edge")
            .selectAll(".barchart-shadow")
            .attr("width", d => d.chart_width)
            .attr("height", d => d.chart_height);

        that.voronoi_in_group
            .selectAll(".barchart-background")
            .attr("width", d => d.chart_width)
            .attr("height", d => d.chart_height);

        that.voronoi_in_group
            .selectAll(".bar-group")
            .attr("transform", d => 
                "translate("+(view.center_scale_x(d.x))
                +","+(view.center_scale_y(d.y))+")")

        that.sub_bar_group
            .attr("id", (d, i) => "edge-bar-in-"+i)
            .attr("x", (d, i) => d.x)
            .attr("y", (d, i) => d.y)
            .attr("width", (d, i) => d.w)
            .attr("height", (d, i) => d.h)
            .attr("fill", (d, i) => d.color);
        
    };

    that._create = function(){
        let v_g = that.voronoi_in_group.enter()
        .append("g")
        .attr("class", "voronoi-cell");
        v_g.append("g")
        .attr("class", "voronoi-edges")
        .each(function (d) {
            let group = d3.select(this);
            for(let edge of d.skeleton){
                group.append("path")
                    .datum(edge)
                    .attr("class", "voronoi-edge")
                    .attr("d", d => view.get_skeleton_path(d, view.scale))
                    .style("fill", "none")
                    .style("stroke-width", 2)
                    .style("stroke", "#a9a9a9")
                    .on("mouseover", function (d) {
                        console.log(d)
                    });
            }
        });
        let sub_v_g = v_g.append("g")
        .attr("class", "bar-group")
            .attr("transform", d => 
                "translate("+(view.center_scale_x(d.x))
                +","+(view.center_scale_y(d.y))+")")
            .on("mouseover", function(d){
                // that.change_bar_mode();
                let _this = d3.select(this);
                if(that.drag_activated && d.id != that.drag_node.id){
                    _this.selectAll(".barchart-background")
                        .style("fill", "black");
                    that.second_drag_node = d;
                }
            })
            .on("mouseout", function(d){
                // that.change_bar_mode();
                let _this = d3.select(this);
                if(that.drag_activated && d.id != that.drag_node.id){
                    _this.selectAll(".barchart-background")
                        .style("fill", "white");
                    that.second_drag_node = null;
                }
            })
            .call(d3.drag().on("start", function(d){
                console.log("start dragstarted");
                that.drag_activated = true;
                that.drag_node = d;
                d3.event.sourceEvent.stopPropagation();
            })
            .on("drag", function(d){
                if (!that.drag_activated) return;
                d.x = d3.mouse(view.main_group.node())[0];
                d.y = d3.mouse(view.main_group.node())[1];
                d3.select(this).attr("transform", 
                    d => "translate("+(d.x)
                    +","+(d.y)+")");
            })
            .on("end", function(){
                that.drag_activated = false;
                if (that.second_drag_node){
                    that.show_comparison();
                }
            }));

        // let sub_v_g = that.voronoi_group.selectAll("g.voronoi-cell")
        // .data(that.cell_data, d => d.id)
        // .selectAll(".bar-group");
        sub_v_g.append("rect")
            .attr("class", "barchart-shadow")
            .attr("x", 1.5)
            .attr("y", 1.5)
            .attr("width", d => d.chart_width)
            .attr("height", d => d.chart_height)
            .style("fill", "#969696");
        sub_v_g.append("rect")
            .attr("class", "barchart-background")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", d => d.chart_width)
            .attr("height", d => d.chart_height)
            .style("fill", "white")
            .style("stroke", "#d8d7d7")
            .style("stroke-width", 1);
        that.sub_bar_group = that.voronoi_group.selectAll("g.voronoi-cell")
            .data(that.cell_data, d => d.id)
            .selectAll(".bar-group")
            .selectAll("rect.edge-summary-rect")
            .data(function(d){
                let data = [];
                let max_num = -1;
                for (let i = 0; i < d.summary_data.length; i++){
                    max_num = Math.max(max_num, d.summary_data[i].in);
                }
                max_num = 10;
                for (let i = 0; i < d.summary_data.length; i++){
                    let value = d.summary_data[i].in / max_num;
                    let idx = d.summary_data[i].idx;
                    d.summary_data[i].value = value;
                    data.push({
                        value: value,
                        idx: idx,
                        x: outer_bounder+(d.bar_width*2+small_inner_bounder+large_inner_bounder)*i,
                        y: d.chart_height*0.8-d.chart_height*0.7*scale_function(value),
                        w: d.bar_width,
                        h: d.chart_height*0.7*scale_function(value),
                        color: color_label[idx]
                    });
                }
                console.log("data, ", data);
                return data;
            });
        that.sub_bar_group.enter()
            .append("rect")
            .attr("class", "edge-summary-rect")
            .attr("id", (d, i) => "edge-bar-in-"+i)
            .attr("x", (d, i) => d.x)
            .attr("y", (d, i) => d.y)
            .attr("width", (d, i) => d.w)
            .attr("height", (d, i) => d.h)
            .attr("fill", (d, i) => "gray");
        };

    that.init = function () {
        that._init();
    }.call();
}