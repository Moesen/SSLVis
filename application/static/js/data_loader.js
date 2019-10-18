/*
* added by Changjian Chen, 20191015
* */


DataLoaderClass = function (dataset) {
    let that = this;

    that.dataset = dataset;

    // URL information
    that.manifest_url = "/graph/GetManifest";
    that.graph_url = "/graph/GetGraph";

    // Request nodes
    that.manifest_node = null;
    that.graph_node = null;

    // views
    that.graph_view = null;

    // Data storage
    that.state = {
        manifest_data: null,
        graph_data: null
    };

    // Define topological structure of data retrieval
    that._init = function () {
        let params = "?dataset=" + that.dataset;
        that.manifest_node = new request_node(that.manifest_url + params,
            that.get_manifest_handler(), "json", "GET");

        that.graph_node = new request_node(that.graph_url + params,
            that.get_graph_handler(that.update_graph_view), "json", "GET");
        that.graph_node.depend_on(that.manifest_node);
    };

    that.init_notify = function () {
        that.manifest_node.notify();
    };

    that.set_graph_view = function (v) {
        that.graph_view = v;
        v.set_data_manager(that);
    };

    that.update_graph_view = function(){
        console.log("update graph view");
        that.graph_view.component_update({
            "graph_data": that.state.graph_data
        })
    };

    that.init = function () {
        that._init();
    }.call();
};