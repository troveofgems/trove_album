class FolderCommand {
    constructor(tags) {
        this.tags = tags;
    }

    execute() {
        throw new Error("Method not implemented.");
    }
}

export class FamilyCommand extends FolderCommand {
    execute() {
        return this.tags.includes("Family & Friends") ? "tog/family" : null;
    }
}

export class PetsCommand extends FolderCommand {
    execute() {
        return this.tags.includes("Pets") ? "tog/pets" : null;
    }
}

export class FoodCommand extends FolderCommand {
    execute() {
        return this.tags.includes("Food & Baking") ? "tog/food" : null;
    }
}

export class GardeningCommand extends FolderCommand {
    execute() {
        return this.tags.includes("Gardening") ? "tog/gardening" : null;
    }
}

export class TravelCommand extends FolderCommand {
    execute() {
        return this.tags.includes("Travel") ? "tog/travel" : null;
    }
}

export class FolderInvoker {
    constructor() {
        this.commands = [];
    }

    addCommand(command) {
        this.commands.push(command);
    }

    executeCommands(tags) {
        for (const command of this.commands) {
            const result = command.execute();
            if(result) return result;
        }
        return "tog/uncategorized";
    }
}
