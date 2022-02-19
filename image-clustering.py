import os
import xmltodict
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
import shutil


def get_image_data(file_path):
    with open(file_path, 'r') as file_handle:
        dict_data = xmltodict.parse(file_handle.read())["root"]

    return dict_data["pppmediaitem"]


if __name__ == '__main__':
    image_data = get_image_data(os.path.join(os.getcwd(), "data", "data_description.xml"))

    all_descriptions = []
    for image in image_data:
        if image["description"] is not None:
            all_descriptions.append(image["description"])

    vectoriser = TfidfVectorizer()
    transformed = vectoriser.fit_transform(all_descriptions)

    NUM_CLUSTERS = 6
    clustering_model = KMeans(n_clusters=NUM_CLUSTERS, algorithm="auto", max_iter=1000, n_init=500)
    clustering_model.fit(transformed)

    # Reset clusters
    cluster_dir = os.path.join(os.getcwd(), "data", "clusters")
    if os.path.exists(cluster_dir):
        shutil.rmtree(cluster_dir)

    os.mkdir(cluster_dir)

    num_in = [0 for _ in range(NUM_CLUSTERS)]
    for image in image_data:
        if image["description"] is not None:

            image_name = image["mediaurl"].replace("/images/", "")
            original_path = os.path.join(os.getcwd(), "data", "original_images", image_name)
            if not os.path.exists(original_path):
                continue

            cluster = clustering_model.predict(vectoriser.transform([image["description"]]))[0]
            num_in[cluster] += 1

            if num_in[cluster] == 1:
                os.mkdir(os.path.join(cluster_dir, str(cluster)))

            shutil.copyfile(
                original_path,
                os.path.join(cluster_dir, str(cluster), image_name)
            )




