DataLoaderClass.prototype.get_nodes_from_complete_graph = function (nodes_id) {
    let that = this;
    let complete_graph = that.state.complete_graph;
    let graph = {};
    for(let node_id of nodes_id){
        graph[node_id] = complete_graph[node_id];
    }
    return graph;
};

function get_next_level(hierarchy, level, area, complete_graph){
    let selection = [];
    let last_next = hierarchy[level-1]['next'];
    let last_index = hierarchy[level-1]['index'];
    for(let i=0; i<last_index.length; i++){
        let ind = last_index[i];
        let node = complete_graph[ind];
        let pos = {x:node.x, y:node.y};
        if((area.x <= pos.x) && (area.x +area.width>= pos.x) && (area.y <= pos.y) &&( area.y + area.height >= pos.y)){
            // let temp_selection = hierarchy[level]["index"].filter(d => last_next[i].indexOf(d) > -1);
            let temp_selection = last_next[i];
            selection = selection.concat(temp_selection);
            // selection = selection.concat(hierarchy[level]["index"]);
        }
        
    }
    return selection;
}

DataLoaderClass.prototype.get_data_selection = function (area, level, must_show_nodes) {
    let that = this;
    let hierarchy = that.state.hierarchy;
    let selection = [];
    if(level >= hierarchy.length){
        level = hierarchy.length - 1
    }
    if(level === 0) {
        selection = hierarchy[0]['index'];
    }
    else if(level !== that.state.last_level){
            selection = get_next_level(hierarchy, level, area, that.state.complete_graph);
    }
    else {
        selection = hierarchy[level]['index'];
    }
    that.state.last_level = level;
    let _selection = [];
    for(let i=0; i<selection.length; i++){
            let ind = selection[i];
            let node = that.state.complete_graph[ind];
            let pos = {x:node.x, y:node.y};
            if((area.x <= pos.x) && (area.x +area.width>= pos.x) && (area.y <= pos.y) &&( area.y + area.height >= pos.y)){
                _selection.push(ind)
            }
    }
    selection = _selection;
    selection = selection.concat(must_show_nodes);
    return selection;
};

DataLoaderClass.prototype.update_nodes = function(area, level, must_show_nodes = []){
    let that = this;
    // self.remove_ids = self.model.data.get_removed_idxs()
    let selection= that.get_data_selection(area, level, must_show_nodes);

    let graph = {};
    graph["nodes"] = that.get_nodes_from_complete_graph(selection);
    graph["area"] = that.get_data_area(null, train_x_tsne=graph["nodes"]);
    return graph
};

DataLoaderClass.prototype.get_data_area = function(ids = null, train_x_tsne = null){
    let that = this;
    let data = null;
    if(ids !== null){
        data = that.get_nodes_from_complete_graph(ids);
    }
    else {
        data = train_x_tsne
    }
    data = Object.values(data);
    let min_x = data.reduce(function (acc, cur) {
        return acc < cur.x?acc:cur.x;
        }, 10000);
    let max_x = data.reduce(function (acc, cur) {
        return acc > cur.x?acc:cur.x;
        }, -10000);
    let min_y = data.reduce(function (acc, cur) {
        return acc < cur.y?acc:cur.y;
        }, 10000);
    let max_y = data.reduce(function (acc, cur) {
        return acc > cur.y?acc:cur.y;
        }, -10000);
    let area = {
            "x": min_x,
            "y": min_y,
            "width": max_x-min_x,
            "height": max_y-min_y
        };
    return area
};

DataLoaderClass.prototype.zoom_graph = function (area, level) {
    let that = this;
    let graph = that.update_nodes(area, level);
    that.state.nodes = graph.nodes;
};

DataLoaderClass.prototype.fetch_nodes = function (area, level, must_show_nodes) {
    let that = this;
    let graph = that.update_nodes(area, level, must_show_nodes);
    that.state.nodes = graph.nodes;
    if(that.state.is_zoom)
        that.state.area = graph.area;
};

DataLoaderClass.prototype.get_home = function () {
    let that = this;
    let hierarchy = that.state.hierarchy;
    let graph = that.get_nodes_from_complete_graph(hierarchy[0].index);
    that.state.nodes = graph;
    that.state.area = that.get_data_area(null, graph);
};