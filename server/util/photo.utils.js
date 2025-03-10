import {
    FolderInvoker,
    FamilyCommand, PetsCommand, FoodCommand, GardeningCommand, TravelCommand
} from "../classes/folder.class.js";

export const setCloudinaryFolderPath = (tags) => {
    const folderInvoker = new FolderInvoker();

    // Register all Commands
    folderInvoker.addCommand(new FamilyCommand(tags));
    folderInvoker.addCommand(new PetsCommand(tags));
    folderInvoker.addCommand(new FoodCommand(tags));
    folderInvoker.addCommand(new GardeningCommand(tags));
    folderInvoker.addCommand(new TravelCommand(tags));

    return folderInvoker.executeCommands(tags);
}