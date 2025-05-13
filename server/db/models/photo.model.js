import mongoose, {Schema} from "mongoose";

const photoSchema = new mongoose.Schema({
    captions: {
        type: {
            alt: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            }
        },
        required: true
    },
    dates: {
        photoTakenOn: {
            type: String,
            required: false,
            default: "Unknown"
        },
        year: {
            type: Schema.Types.Mixed,
            default: "Unknown",
            validate: {
                validator: function(v) {
                    return v === "Unknown" || (Number.isInteger(v) && v >= 1900 && v <= new Date().getFullYear());
                },
                message: 'Year must be a valid integer between 1900 and current year, or Unknown'
            }
        }
    },
    device: {
        type: {
            make: { type: String, required: false },
            model: { type: String, required: false },
        },
        default: null,
        required: false
    },
    dimensions: {
        type: {
            width: { type: Number, required: true },
            height: { type: Number, required: true },
            sizeInKB: { type: Number, required: true },
        },
        required: true
    },
    download: {
        type: {
            url: { type: String, required: false },
            filename: { type: String, required: true },
        },
        default: null,
        required: true
    },
    gps: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true
        },
        coordinates: {
            type: [Number], // [long, lat]
            required: true
        },
        altitude: { type: Schema.Types.Mixed, required: true },
    },
    provider: {
        type: {
            url: {
                type: String, required: true
            },
            publicOrBucketId: {
                type: String, required: true
            },
            name: {
                type: String, required: true
            },
            deleteUrl: {
                type: String, required: false
            },
            status: {
                type: String, required: false
            }
        },
        default: null,
        required: true
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
    tags: {
        type: [
            { type: String, required: true },
        ],
        required: true
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
            this.gps !== null &&
            this.gps.coordinates[0] > 0 &&
            this.gps.coordinates[1] > 0
        );
    });

/** Indexes */
photoSchema.index({ 'captions.title': 'text', 'captions.description': 'text' });
photoSchema.index({ 'gps.coordinates': '2dsphere' });

const Photo = mongoose.model("Photo", photoSchema);

export default Photo;