import numpy as np
import os
import json

from .case_base import CaseBase

class CaseSTL(CaseBase):
    def __init__(self, dataname):
        super(CaseSTL, self).__init__(dataname)

    def run(self, k=6, evaluate=False, simplifying=False):
        step = self.base_config["step"]
        
        if step >= 1:
            self.data.label_instance(
                json.loads(open(os.path.join(self.selected_dir, "dog_idxs.txt"), "r").read().strip("\n")), [5, 5])
            self.model.data.label_instance([697], [5])
        
        self._init_model(k=k, evaluate=evaluate, simplifying=simplifying)

        categories = [1 for i in range(12)]
        categories[11] = False
        if step >= 2:
            c = json.loads(open(os.path.join(self.model.selected_dir, "local_1_idxs.txt"), "r").read().strip("\n"))
            self.model.local_search_k(c, [1, 2, 3, 4], categories, simplifying=True, evaluate=False)
        
        if step >= 3:
            e = json.loads(open(os.path.join(self.model.selected_dir, "local_2_idxs.txt"), "r").read().strip("\n"))
            self.model.local_search_k(e, [1, 2, 3, 4], categories, simplifying=True, evaluate=False)
        
        if step >= 4:
            None 

        if not evaluate:
            self.model.adaptive_evaluation_unasync()