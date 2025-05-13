/** Providers */
export const ImageProviders = {
    IMGBB: 'imgbb',
    CLOUDINARY: 'cloudinary',
}

/** Available Storage Folders Based On Photo Tags */
export const AvailableFolders = {
    FAMILY: {
        tagName: 'Family & Friends',
        albumName: 'FAMILY'
    },
    PETS: {
        tagName: 'Pets',
        albumName: 'PETS'
    },
    FOOD: {
        tagName: 'Food & Baking',
        albumName: 'FOOD'
    },
    GARDENING: {
        tagName: 'Gardening',
        albumName: 'GARDENING'
    },
    TRAVEL: {
        tagName: 'Travel',
        albumName: 'TRAVEL'
    },
    UNCATEGORIZED: {
        tagName: 'Uncategorized',
        albumName: 'UNCATEGORIZED'
    }
};

/** Paths Per Provider - IMGBB Default */
export const PROVIDER_PATHS = {
    [ImageProviders.IMGBB]: {
        [AvailableFolders.FAMILY.albumName]: 'G9BzCg',
        [AvailableFolders.PETS.albumName]: 'dBFMMP',
        [AvailableFolders.FOOD.albumName]: 'Jxd317',
        [AvailableFolders.GARDENING.albumName]: 'cKJ4Sh',
        [AvailableFolders.TRAVEL.albumName]: 'bbRVFy',
        [AvailableFolders.UNCATEGORIZED.albumName]: 'VWh62L'
    },
    [ImageProviders.CLOUDINARY]: {
        [AvailableFolders.FAMILY.albumName]: 'tog/family',
        [AvailableFolders.PETS.albumName]: 'tog/pets',
        [AvailableFolders.FOOD.albumName]: 'tog/food',
        [AvailableFolders.GARDENING.albumName]: 'tog/gardening',
        [AvailableFolders.TRAVEL.albumName]: 'tog/travel',
        [AvailableFolders.UNCATEGORIZED.albumName]: 'tog/uncategorized'
    }
};