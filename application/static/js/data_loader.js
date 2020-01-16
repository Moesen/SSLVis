/*
* added by Changjian Chen, 20191015
* */


DataLoaderClass = function (dataset) {
    let that = this;

    that.dataset = dataset;

    // URL information
    that.manifest_url = "/graph/GetManifest";
    that.graph_url = "/graph/GetGraph";
    that.loss_url = "/graph/GetLoss";
    that.ent_url = "/graph/GetEnt";
    that.flows_urls = "/graph/GetFlows";
    that.image_url = "/info/image";
    // that.set_knn_url = "/graph/setK";
    that.set_influence_filter_url = "/graph/SetInfluenceFilter";
    that.update_graph_url = "/graph/update";
    that.fisheye_graph_url = "/graph/fisheye";
    that.update_delete_and_change_label_url = "/graph/update_delete_and_change_label";

    // Request nodes
    that.manifest_node = null;
    that.graph_node = null;
    that.update_graph_node = null;
    that.update_delete_and_change_label_node = null;
    that.loss_node = null;
    that.ent_node = null;
    that.flows_node = null;
    that.influence_filter_node = null;

    // views
    that.graph_view = null;
    that.loss_view = null;

    // Data storage
    that.state = {
        // manifest_data: null,
        k: null,
        filter_threshold: null,
        label_names: null,
        graph_data: null,
        loss_data: null,
        img_url: null,
        ent_data: null,
        label_sums: null,
        flows: null
    };

    // Define topological structure of data retrieval
    that._init = function () {
        let params = "?dataset=" + that.dataset;
        that.manifest_node = new request_node(that.manifest_url + params,
            that.get_manifest_handler(), "json", "GET");

        that.graph_node = new request_node(that.graph_url + params,
            that.get_graph_handler(that.get_graph_view), "json", "GET");
        that.graph_node.depend_on(that.manifest_node);

        that.update_graph_node = new request_node(that.update_graph_url + params,
            that.update_graph_handler(that.update_graph_view), "json", "POST");

        that.update_delete_and_change_label_node = new request_node(that.update_delete_and_change_label_url + params,
            that.update_graph_handler(that.update_graph_view), "json", "POST");

        that.fisheye_graph_node = new request_node(that.fisheye_graph_url + params,
            that.update_fisheye_graph_handler(that.update_fisheye_view), "json", "POST");

        that.flows_node = new request_node(that.flows_urls + params,
            // TODO: update_loss_view -> update_dist_view
            that.get_flows_handler(that.update_loss_view), "json", "GET");
        that.flows_node.depend_on(that.graph_node);

        // that.loss_node = new request_node(that.loss_url + params,
        //     that.get_loss_handler(that.update_loss_view), "json", "GET");
        // that.loss_node.depend_on(that.graph_node);
        //
        // that.ent_node = new request_node(that.ent_url + params,
        //     that.get_ent_handler(that.update_ent_view), "json", "GET");
        // that.ent_node.depend_on(that.graph_node);
    };

    that.init_notify = function () {
        that.manifest_node.notify();
    };

    that.update_graph_notify = function (area, target_level) {

        that.update_graph_node.set_data({
            'area': area,
            'level': target_level
        });
        that.update_graph_node.notify();
    };

    that.update_delete_and_change_label_notify = function (delete_node_list, change_list, delete_edge) {
        that.update_delete_and_change_label_node.set_data({
            'delete_node_list': delete_node_list,
            'change_list': change_list,
            'delete_edge': delete_edge
        });
        that.update_delete_and_change_label_node.notify();
    };

    that.update_fisheye_graph_node = function(must_show_nodes, old_nodes, new_nodes, area, level, wh, fisheye_mode) {
        that.fisheye_graph_node.set_data({
            'must_show_nodes':must_show_nodes,
            'new_nodes':new_nodes,
            'old_nodes':old_nodes,
            'area':area,
            'level':level,
            'wh':wh
        });
        that.state.fisheyemode = fisheye_mode;
        that.fisheye_graph_node.notify();
    };

    that.update_k = function(k){
        // TODO: clean views
        that.state.k = k;
        let graph_params = "?dataset=" + that.dataset + "&k=" +
            that.state.k + "&filter_threshold=" + that.state.filter_threshold;
        that.graph_node.set_url(that.graph_url + graph_params);
        that.loss_node.set_pending();
        that.ent_node.set_pending();
        that.graph_node.notify();
    };

    that.update_filter_threshold = function(threshold){
        that.state.filter_threshold = threshold;
        let params = "?dataset=" + that.dataset +
            "&filter_threshold=" + that.state.filter_threshold;
        that.influence_filter_node = new request_node(that.set_influence_filter_url + params,
            that.set_influence_filter(), "json", "GET");
        that.influence_filter_node.notify();
    };

    that.set_graph_view = function (v) {
        that.graph_view = v;
        v.set_data_manager(that);
    };

    // TODO: set_loss_view -> set_dist_view
    that.set_loss_view = function(v){
        that.loss_view = v;
        v.set_data_manager(that);
    };

    that.set_image_view = function(v){
        that.image_view = v;
        v.set_data_manager();
    };

    // update img_url in states and update ImageView
    that.update_image_view = function(nodes){
        that.state.img_grid_urls = [];
        nodes.each(function (d) {
            let node = d3.select(this);
            that.state.img_grid_urls.push({
                url:that.image_url + "?filename=" + d.id + ".jpg",
                id:d.id,
                node:node
            })
        });
        that.image_view.component_update({
            "img_grid_urls": that.state.img_grid_urls
        })
    };

    that.get_graph_view = function(rescale) {
        console.log("get graph view");
        that.graph_view.component_update({
            "graph_data": that.state.graph_data,
            "top_k_uncertain": that.state.top_k_uncertain
        }, rescale);
    };

    that.update_graph_view = function(rescale){
        console.log("update graph view");
        that.graph_view.component_update({
            "graph_data": that.state.graph_data,
            "label_names": that.state.label_names
        }, rescale);
    };

    that.update_fisheye_view = function(rescale){
        console.log("update graph view");
        that.graph_view.component_update({
            "graph_data": that.state.graph_data,
            "area": that.state.area,
            "fisheye":that.state.fisheyemode
        }, rescale);
    };

    // TODO: update_loss_view -> update_dist_view
    that.update_loss_view = function(){
        console.log("update loss view");
        that.loss_view.component_update({
            "label_sums": that.state.label_sums,
            "flows": that.state.flows
        });
    };

    // that.update_ent_view = function(){
    //     console.log("update ent view");
    //     that.loss_view.component_update({
    //         "ent_data": that.state.ent_data
    //     })
    // };

    that.init = function () {
        that._init();
    }.call();
};
