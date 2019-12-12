from .ExchangePort import ExchangePortClass

exchange_port = ExchangePortClass()

def set_dataname(dataname):
    exchange_port.reset_dataname(dataname)

def get_graph():
    return exchange_port.get_graph()

def get_manifest():
    return exchange_port.get_manifest()

def get_loss():
    return exchange_port.get_loss()

def get_labels():
    return exchange_port.get_labels()