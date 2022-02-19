print('computer enhance')

# Example posting a local image file:

import requests
import json
from os import listdir
from os.path import isfile, join

path_to_og = '../data/original_images'
path_to_color = '../data/color_images/'
path_to_upsacaled = '../data/upscaled_images/'


images = [f for f in listdir(path_to_color) if isfile(join(path_to_color, f))]

print(images)


for x in images:

	r = requests.post(
	    "https://api.deepai.org/api/torch-srgan",
	    files={
	        'image': open('../data/color_images/' + x, 'rb'),
	    },
	    headers={'api-key': '186fafe6-526c-4ef1-82d5-1bdda2e7c16a'}
	)
	print(r.json()['output_url'])
	url = r.json()['output_url']
	response = requests.get(url)



	file = open(path_to_upsacaled + x, "wb")
	file.write(response.content)
	file.close()

