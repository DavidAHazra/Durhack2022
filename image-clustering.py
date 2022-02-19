import os
import xmltodict
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
import shutil
from image_encoder import Autoencoder, transform_image
import joblib
import torch


def get_image_data(file_path):
    with open(file_path, 'r') as file_handle:
        dict_data = xmltodict.parse(file_handle.read())["root"]

    return dict_data["pppmediaitem"]


if __name__ == '__main__':
    image_data = get_image_data(os.path.join(os.getcwd(), "data", "data_description.xml"))

    transformed_images = []
    for image in image_data:
        if image["description"] is not None:
            image_name = image["mediaurl"].replace("/images/", "")
            original_path = os.path.join(os.getcwd(), "data", "original_images", image_name)

            if os.path.exists(original_path):
                transformed_images.append(transform_image(original_path))

    # (num_images, 13225)
    transformed_images = torch.stack(transformed_images)

    model = joblib.load(os.path.join(os.getcwd(), "autoencoder.pt"))
    model.eval()

    outputs = model(transformed_images).detach().numpy()

    NUM_CLUSTERS = 6
    clustering_model = KMeans(n_clusters=NUM_CLUSTERS, algorithm="auto", max_iter=500, n_init=50)
    predictions = clustering_model.fit_transform(outputs)

    # Reset clusters
    cluster_dir = os.path.join(os.getcwd(), "data", "clusters")
    if os.path.exists(cluster_dir):
        shutil.rmtree(cluster_dir)

    os.mkdir(cluster_dir)

    num_in = [0 for _ in range(NUM_CLUSTERS)]
    found = 0
    for image in image_data:
        if image["description"] is not None:

            image_name = image["mediaurl"].replace("/images/", "")
            original_path = os.path.join(os.getcwd(), "data", "original_images", image_name)
            if not os.path.exists(original_path):
                continue

            image_transformed = predictions[found].reshape(1, -1)
            found += 1

            cluster = clustering_model.predict(image_transformed)[0]
            num_in[cluster] += 1

            if num_in[cluster] == 1:
                os.mkdir(os.path.join(cluster_dir, str(cluster)))

            shutil.copyfile(
                original_path,
                os.path.join(cluster_dir, str(cluster), image_name)
            )




