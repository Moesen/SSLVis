import os
from flask import abort, session
from flask import render_template, jsonify
from flask import Blueprint, request
from .utils.config_utils import config
import json
import time

from .exchange_port import *

graph = Blueprint("graph", __name__)


@graph.route("/graph/GetManifest", methods=["GET", "POST"])
def app_get_manifest():
    # extract info from request
    dataname = request.args["dataset"]
    dataname = dataname.split("-")
    labeled_num = None
    total_num = None
    if len(dataname) > 1:
        dataname, labeled_num, total_num = dataname
        labeled_num = int(labeled_num)
        total_num = int(total_num)
        print(dataname, labeled_num, total_num)
    set_model(dataname, labeled_num, total_num)
    return get_manifest()


@graph.route("/graph/SetK", methods=["GET", "POST"])
def app_set_k():
    return 1


@graph.route("/graph/SetInfluenceFilter", methods=["GET", "POST"])
def app_set_influence_filter():
    # extract info from request
    filter_threshold = request.args.get("filter-threshold", None)
    # TODO: get fisheye-tSNE
    return get_graph(filter_threshold)


@graph.route("/graph/GetGraph", methods=["GET", "POST"])
def app_get_graph():
    # extract info from request
    k = request.args.get("k", None)
    if k is not None:
        k = int(k)
    filter_threshold = request.args.get("filter-threshold", None)
    init_model(k, filter_threshold)
    return get_graph()

@graph.route("/graph/LocalUpdateK", methods=["GET", "POST"])
def app_local_update_k():
    data = json.loads(request.data)
    selected_idxs = data["selected_idxs"]
    return local_update_k(selected_idxs)

@graph.route('/graph/GetLoss', methods=['POST', 'GET'])
def app_get_loss():
    return get_loss()


@graph.route('/graph/GetEnt', methods=['POST', 'GET'])
def app_get_ent():
    return get_ent()


@graph.route('/graph/GetLabels', methods=['POST'])
def app_get_label_num():
    return get_labels()

@graph.route('/graph/SaveLayout', methods=["POST"])
def app_save_layout():
    graph = json.loads(request.form['graph'])
    with open(os.path.join(config.buffer_root, "graph.json"), "w+") as f:
        json.dump(graph, f, indent=4)
    return jsonify({"status": 1})


@graph.route('/graph/update', methods=["GET", "POST"])
def app_update():
    start = time.time()
    dataset = request.args['dataset']
    data = json.loads(request.data)
    area = data['area']
    level = data['level']
    graph = update_graph(area, level)
    end = time.time()
    print("all process time:", end - start)
    return graph

@graph.route('/graph/getArea', methods=["POST"])
def app_get_area():
    must_show_nodes = json.loads(request.form["must_show_nodes"])
    width = float(request.form['width'])
    height = float(request.form['height'])
    return get_area(must_show_nodes, width, height)

@graph.route('/graph/update_delete_and_change_label', methods=["GET", "POST"])
def app_update_delete_and_change_label():
    start = time.time()
    dataset = request.args['dataset']
    data = json.loads(request.data)
    delete_node_list = data['delete_node_list']
    change_list = data['change_list']
    delete_edge = data['delete_edge']
    graph = update_delete_and_change_label(delete_node_list, change_list, delete_edge)
    end = time.time()
    print("all process time:", end-start)
    return graph

@graph.route('/graph/fisheye', methods=["GET", "POST"])
def app_fisheye():
    data = json.loads(request.data)
    must_show_nodes = data['must_show_nodes']
    new_nodes = data['new_nodes']
    old_nodes = data['old_nodes']
    area = data['area']
    level = data['level']
    wh = data['wh']
    return fisheye(must_show_nodes, new_nodes, old_nodes, area, level, wh)

# for debug
@graph.route('/graph/feature_distance', methods=["POST"])
def app_get_feature_distance():
    path = json.loads(request.form["path"])
    distance = float(get_feature_distance(int(path[0]), int(path[1])))
    return jsonify({
        "distance":distance
    })

# for debug
@graph.route('/graph/feature', methods=["POST"])
def app_get_feature():
    node_id = json.loads(request.form["id"])
    feature = get_feature(node_id)
    return jsonify({
        "feature":feature
    })