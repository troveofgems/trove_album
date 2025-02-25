import mongoose, {Schema} from "mongoose";

const photoSchema = new mongoose.Schema({
    src: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    alt: {
        type: String,
        required: true,
    },
    srcSet: {
        type: [
            {
                type: {
                    src: { type: String, required: true },
                    width: { type: Number, required: true },
                    height: { type: Number, required: true },
                }
            }
        ],
        required: false,
    },
    captions: {
        type: {
            title: { type: String, required: true },
            description: { type: String, required: true },
        },
        required: true
    },
    cloudinary: {
        type: {
            url: { type: String, required: true },
            publicId: { type: String, required: true }
        },
        required: true
    },
    device: {
        type: {
            make: { type: String, required: false },
            model: { type: String, required: false },
        },
        required: false
    },
    dimensions: {
        type: {
            width: { type: Number, required: true },
            height: { type: Number, required: true },
        },
        required: false
    },
    download: {
        type: {
            url: { type: String, required: false },
            filename: { type: String, required: true },
        },
        required: true
    },
    gps: {
        type: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
            altitude: { type: Schema.Types.Mixed, required: true },
        },
        required: false
    },
    photoTakenOn: {
        type: Schema.Types.Mixed,
        required: false
    },
    tags: {
        type: [
            { type: String, required: true },
        ],
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    }
}, { timestamps: true });

/** Virtual Fields */
photoSchema
    .virtual('gps.canMapCoords')
    .get(function() {
        return (
            typeof this.gps.latitude === 'number' &&
                typeof this.gps.longitude === 'number'
        );
    })

const Photo = mongoose.model("Photo", photoSchema);

export default Photo;