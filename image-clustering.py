import os
import xmltodict
from collections import defaultdict


def get_image_data(file_path):
    with open(file_path, 'r') as file_handle:
        dict_data = xmltodict.parse(file_handle.read())["root"]

    return dict_data["pppmediaitem"]


if __name__ == '__main__':
    image_data = get_image_data(os.path.join(os.getcwd(), "data", "data_description.xml"))
    num_of_category = defaultdict(set)

    for image in image_data:
        if image["categories"] is not None:
            if type(image["categories"]["category"]) is str:
                num_of_category[image["categories"]["category"]] += 1

            else:
                for category in image["categories"]["category"]:
                    num_of_category[category] += 1

    for category in sorted(num_of_category.keys(), key=lambda x: -num_of_category[x]):
        print(category, num_of_category[category])