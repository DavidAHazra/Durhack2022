import torch.utils.data
from torchvision.io import read_image
import os
from torchvision.transforms import Resize, Normalize, ConvertImageDtype, Grayscale

import joblib


def transform_image(image_path):
    image_data = read_image(image_path)
    image_data = ConvertImageDtype(torch.float)(image_data)
    image_data = Grayscale()(image_data)
    image_data = Normalize(mean=[0.5], std=[0.5])(image_data)
    # Scale everything to 460x460
    image_data = Resize((115, 115))(image_data)
    # Flatten
    # image_data = image_data.squeeze()
    image_data = image_data.flatten()

    return image_data


class ImageDataset(torch.utils.data.Dataset):
    def __init__(self, image_dir):
        self.image_paths = []
        for name in os.listdir(image_dir):
            self.image_paths.append(os.path.join(image_dir, name))

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, index):
        return transform_image(self.image_paths[index])

class Autoencoder(torch.nn.Module):
    def __init__(self):
        super(Autoencoder, self).__init__()

        self.encoder = torch.nn.Sequential(
            torch.nn.Linear(13225, 512),
            torch.nn.Linear(512, 256),
        )

        self.decoder = torch.nn.Sequential(
            torch.nn.Linear(256, 512),
            torch.nn.Linear(512, 13225)
        )

    def latent_encode(self, x):
        return self.encoder(x)

    def forward(self, x):
        return self.decoder(self.latent_encode(x))


if __name__ == '__main__':
    dataset = ImageDataset(os.path.join(os.getcwd(), "data", "original_images"))
    loader = torch.utils.data.DataLoader(dataset, batch_size=16, shuffle=True)

    model = Autoencoder().float()

    optimiser = torch.optim.AdamW(model.parameters(), lr=0.0001)
    loss_func = torch.nn.MSELoss()

    best_loss = float('inf')
    for epoch in range(500):
        batch_losses = []
        for batch in loader:
            optimiser.zero_grad()

            reconstructed = model(batch)
            loss = loss_func(reconstructed, batch)
            batch_losses.append(loss.item())
            loss.backward()
            optimiser.step()

        mean_loss = sum(batch_losses) / len(batch_losses)
        print(f"Epoch {epoch} got loss of {mean_loss:.6f}")

        if mean_loss < best_loss:
            best_loss = mean_loss
            joblib.dump(model, "autoencoder.pt")