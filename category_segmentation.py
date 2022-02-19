import os
import xmltodict
from collections import defaultdict
import shutil


def get_image_data(file_path):
    with open(file_path, 'r') as file_handle:
        dict_data = xmltodict.parse(file_handle.read())["root"]

    return dict_data["pppmediaitem"]


if __name__ == '__main__':
    image_data = get_image_data(os.path.join(os.getcwd(), "data", "data_description.xml"))
    num_of_category = defaultdict(int)

    for image in image_data:
        if image["categories"] is not None:
            if type(image["categories"]["category"]) is str:
                num_of_category[image["categories"]["category"]] += 1

            else:
                for category in image["categories"]["category"]:
                    num_of_category[category] += 1

    category_map = {
        "Informal Portraits": {"Portraits"},
        "Buildings": {"Buildings"},
        "Events": {"Events"},
        "Clubs and Societies": {"Events"},
        "Children": {"Children"},
        "Mining": {"Society"},
        "Monuments and Structures": {"Society", "Scenery"},
        "Streets": {"Society", "Scenery"},
        "Transport": {"Society"},
        "Sport": {"Society"},
        "Countryside": {"Scenery"},
        "Shops and Commercial Premises": {"Society"},
        "School": {"Children", "Society"},
        "Work and Industry": {"Society": "Industry"},
        "Coast": {"Scenery"},
        "Area": {"Scenery", "Society"}
    }

    new_categories = defaultdict(set)
    for image in image_data:
        if image["categories"] is not None:
            cats = []
            if type(image["categories"]["category"]) is str:
                cats.append(image["categories"]["category"])

            else:
                cats.extend(image["categories"]["category"])

            file_name = image["mediaurl"].replace("/images/", "")
            if not os.path.exists(os.path.join(os.getcwd(), "data", "original_images", file_name)):
                continue

            for cat in cats:
                for cat_map in category_map[cat]:
                    new_categories[cat_map].add(file_name)

    # Clear category folder
    category_folder = os.path.join(os.getcwd(), "data", "categories")
    if os.path.exists(category_folder):
        shutil.rmtree(category_folder)

    os.mkdir(category_folder)

    for cat in new_categories:
        current_folder = os.path.join(os.getcwd(), "data", "categories", cat)
        if not os.path.exists(current_folder):
            os.mkdir(current_folder)

        for image_name in new_categories[cat]:
            shutil.copyfile(
                os.path.join(os.getcwd(), "data", "color_images", image_name),
                os.path.join(current_folder, image_name)
            )