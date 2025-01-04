import mongoose from "mongoose";

const photoSchema = new mongoose.Schema({
    src: {
      type: Buffer,
      required: true,
    },
    alt: {
        type: String,
        required: true,
    },
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
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
    captions: {
        type: {
            title: { type: String, required: true },
            description: { type: String, required: true },
        },
        required: true
    },
    download: {
        type: {
            url: { type: String, required: false },
            filename: { type: String, required: true },
        },
        required: true
    },
    tags: {
        type: [
            { type: String, required: true },
        ]
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    }
}, { timestamps: true });

const Photo = mongoose.model("Photo", photoSchema);

export default Photo;