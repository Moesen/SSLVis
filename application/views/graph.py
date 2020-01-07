import os
from flask import abort, session
from flask import render_template, jsonify
from flask import Blueprint, request
from .graph_utils.layout import stress_majorization_solve
from .utils.config_utils import config
from .graph_utils.anchor import anchorGraph
import json

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

@graph.route("/graph/GetGraph", methods=["GET", "POST"])
def app_get_graph():
    return get_graph()

@graph.route('/graph/GetLoss', methods=['POST', 'GET'])
def app_get_loss():
    return get_loss()

@graph.route('/graph/GetLabels', methods=['POST'])
def app_get_label_num():
    return get_labels()

@graph.route('/graph/StressMajorization', methods=["POST"])
def app_stress_majorization():
    data = json.loads(request.form['data'])
    L = data['L']
    W = data['W']
    D = data['D']
    C = data['C']
    X = data['X']
    res = stress_majorization_solve(L, W, D, C, X)
    return jsonify(res)

@graph.route('/graph/SaveLayout', methods=["POST"])
def app_save_layout():
    graph = json.loads(request.form['graph'])
    with open(os.path.join(config.buffer_root, "graph.json"), "w+") as f:
        json.dump(graph, f, indent=4)
    return jsonify({"status":1})

@graph.route('/graph/ZoomIn', methods=["POST"])
def app_zoom_in():
    anchor_idxes = json.loads(request.form['area'])
    level = int(request.form['level'])
    data, status = anchorGraph.zoom_in(anchor_idxes)
    return jsonify({
        "data": data,
        "status":status
    })

@graph.route('/graph/ZoomOut', methods=['POST'])
def app_zoom_out():
    data, status = anchorGraph.zoom_out()
    return jsonify({
        "data": data,
        "status": status
    })

@graph.route('/graph/update', methods=["GET", "POST"])
def app_update():
    dataset = request.args['dataset']
    data = json.loads(request.data)
    area = data['area']
    level = data['level']
    return update_graph(area, level)