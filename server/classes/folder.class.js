import {AvailableFolders, ImageProviders, PROVIDER_PATHS} from "../constants/photo.upload.path.constants.js";
import {ERR_405} from "../constants/app.error.message.constants.js";

class FolderCommand {
    constructor(
        tags,
        defaultProvider = ImageProviders.IMGBB
    ) {
        this.tags = tags;
        this.provider = defaultProvider;
    }

    execute() {
        throw new Error(ERR_405);
    }
}

export class FolderInvoker {
    constructor(defaultProvider = ImageProviders.IMGBB) {
        this.commands = [];
        this.provider = defaultProvider;
    }

    addCommand(command) {
        this.commands.push(command);
    }

    executeCommands(tagList) {
        for (const command of this.commands) {
            const result = command.execute(tagList);
            if(result) return result;
        }
        return PROVIDER_PATHS[this.provider].UNCATEGORIZED;
    }
}

export class FamilyCommand extends FolderCommand {
    execute(tagList) {
        return fetchPath(
            tagList,
            AvailableFolders.FAMILY.tagName,
            AvailableFolders.FAMILY.albumName,
            this.provider
        );
    }
}

export class PetsCommand extends FolderCommand {
    execute(tagList) {
        return fetchPath(
            tagList,
            AvailableFolders.PETS.tagName,
            AvailableFolders.PETS.albumName,
            this.provider
        );
    }
}

export class FoodCommand extends FolderCommand {
    execute(tagList) {
        return fetchPath(
            tagList,
            AvailableFolders.FOOD.tagName,
            AvailableFolders.FOOD.albumName,
            this.provider
        );
    }
}

export class GardeningCommand extends FolderCommand {
    execute(tagList) {
        return fetchPath(
            tagList,
            AvailableFolders.GARDENING.tagName,
            AvailableFolders.GARDENING.albumName,
            this.provider
        );
    }
}

export class TravelCommand extends FolderCommand {
    execute(tagList) {
        return fetchPath(
            tagList,
            AvailableFolders.TRAVEL.tagName,
            AvailableFolders.TRAVEL.albumName,
            this.provider
        );
    }
}

/** Fetches Path from PROVIDER_PATHS */
const fetchPath = (tagList, tagName, albumName, provider) => {
    if (tagList.includes(tagName)) return PROVIDER_PATHS[provider][albumName];
    return null;
};