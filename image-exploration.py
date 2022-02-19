import os
import xmltodict
from collections import defaultdict


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
    nones = 0
    nonee = 0
    noneb = 0
    nodesc = 0

    for image in image_data:
        
        if image["startdate"] is None:
            nones+= 1
        if image["enddate"] is None:
            nonee+= 1
        if image["enddate"] is None and image["startdate"] is None:
            noneb+= 1
        if image['description'] is None:
            nodesc +=1




    print('dates missing start:',nones,' end: ', nonee, ' both: ',noneb)
    print('no description: ', nodesc)

    for category in sorted(num_of_category.keys(), key=lambda x: -num_of_category[x]):
        print(category, num_of_category[category])