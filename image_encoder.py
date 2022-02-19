import torch.utils.data
from torchvision.io import read_image
import os
from torchvision.transforms import Resize
import joblib


class ImageDataset(torch.utils.data.Dataset):
    def __init__(self, image_dir):
        self.image_paths = []
        for name in os.listdir(image_dir):
            self.image_paths.append(os.path.join(image_dir, name))

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, index):
        # Load image
        image_data = read_image(self.image_paths[index])

        # Scale everything to 460x460
        image_data = Resize((460, 460))(image_data)

        # Flatten
        image_data = image_data.flatten()
        return image_data.float()


class Autoencoder(torch.nn.Module):
    def __init__(self):
        super(Autoencoder, self).__init__()

        self.encoder = torch.nn.Sequential(
            torch.nn.Linear(634800, 1024),
            torch.nn.Linear(1024, 512),
            torch.nn.Linear(512, 256)
        )

        self.decoder = torch.nn.Sequential(
            torch.nn.Linear(256, 512),
            torch.nn.Linear(512, 1024),
            torch.nn.Linear(1024, 634800)
        )

    def latent_encode(self, x):
        return self.encoder(x)

    def forward(self, x):
        return self.decoder(self.latent_encode(x))


if __name__ == '__main__':
    dataset = ImageDataset(os.path.join(os.getcwd(), "data", "original_images"))
    loader = torch.utils.data.DataLoader(dataset, batch_size=16, shuffle=True)

    model = Autoencoder().float()

    optimiser = torch.optim.SGD(model.parameters(), lr=0.01)
    loss_func = torch.nn.MSELoss()

    best_loss = float('inf')
    for epoch in range(500):
        batch_losses = []
        for batch in loader:
            optimiser.zero_grad()

            reconstructed = model(batch)
            loss = loss_func(batch, reconstructed)
            batch_losses.append(loss.item())

            loss.backward()
            optimiser.step()

        mean_loss = sum(batch_losses) / len(batch_losses)
        print(f"Epoch {epoch} got loss of {mean_loss:.6f}")

        if mean_loss < best_loss:
            best_loss = mean_loss
            joblib.dump(model, "autoencoder.pt")
