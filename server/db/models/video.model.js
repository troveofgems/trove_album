import mongoose, {Schema} from "mongoose";

const videoSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
        type: String,
        required: true
    },
    provider: {
        type: {
            videoId: {
                type: String, required: true
            },
            name: {
                type: String, required: true
            },
            createdAt: {
                type:  Date, required: true
            },
            publishedAt: {
                type:  Date, required: true
            },
            updatedAt: {
                type:  Date, required: true
            },
            discardedAt: {
                type:  Date, required: false
            },
            deletesAt: {
                type:  Schema.Types.Mixed, required: false, default: null
            },
            discarded: {
                type:  Boolean, required: false, default: null
            },
            language: {
                type: String, required: true, default: "en"
            },
            languageOrigin: {
                type: String, required: true, default: "api"
            },
            tags: {
                type: [
                    { type: String, required: true },
                ],
                required: true
            },
            metadata: [{
                type: {
                    key: { type: String,  required: true },
                    value: { type: String, required: true }
                },
                required: true
            }],
            source: {
                uri: {
                    type: String,
                    required: true
                },
                type: {
                    type: String,
                    required: true
                },
                liveStream: {
                    type: Boolean,
                    required: false,
                    default: false
                }
            },
            assets: {
                hls: {
                    type: String,
                    required: true
                },
                iframe: {
                    type: String,
                    required: true
                },
                player: {
                    type: String,
                    required: true
                },
                thumbnail: {
                    type: String,
                    required: true
                },
                mp4: {
                    type: String,
                    required: true
                }
            },
            playerId: {
                type: String,
                required: true
            },
            _public: {
                type: Boolean,
                default: false,
                required: true
            },
            panoramic: {
                type: Boolean,
                default: false,
                required: false
            },
            mp4Support: {
                type: Boolean,
                default: false,
                required: true
            }
        },
        required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    }
}, { timestamps: true });

/** Indexes */
//videoSchema.index({ 'captions.title': 'text', 'captions.description': 'text' });

const Video = mongoose.model("Video", videoSchema);

export default Video;