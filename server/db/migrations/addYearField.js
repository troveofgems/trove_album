import PhotoModel from "../models/photo.model.js";

async function migrateExistingPhotos() {
    console.log('Starting photo migration...');

    // Step 1: Update all documents to null first
/*    await PhotoModel.updateMany(
        {},
        { $set: { year: null } },
        { bypassDocumentValidation: false }
    );*/

    console.log(await PhotoModel.countDocuments({ photoTakenOn: { $ne: "Unknown" } }));
    console.log("To be updated...");

    await PhotoModel.updateMany(
        { photoTakenOn: { $ne: "Unknown" } },
        [
            {
                $set: {
                    year: {
                        $year: {
                            date: {
                                $dateFromString: {
                                    dateString: '$photoTakenOn',
                                    onError: '$photoTakenOn',
                                }
                            }
                        }
                    }
                }
            }
        ],
        { bypassDocumentValidation: false },
    );
}

// Run the migration
export const migrateRecords = async () => {
    try {
        await migrateExistingPhotos();
    } catch (error) {
        console.error('Error during migration:', error);
        throw error;
    }
}