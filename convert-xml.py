import os
import xmltodict
from collections import defaultdict
import json


def get_image_data(file_path):
    with open(file_path, 'r') as file_handle:
        dict_data = xmltodict.parse(file_handle.read())["root"]

    return dict_data["pppmediaitem"]


if __name__ == '__main__':
    image_data = get_image_data(os.path.join(os.getcwd(), "data", "data_description.xml"))
    with open(os.path.join(os.getcwd(), "data", "categories", "data_desc.json"), 'w') as wr:
        wr.write(json.dumps(image_data))