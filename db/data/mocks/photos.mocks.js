import * as url from "node:url";
export const Photo_Mocks = [
    {
        src: URL("../imgs/gma_gpa.jpg"),
        alt: "Yukieda and Joseph Greco. Yukieda is seated on a chair, holding her hand up to her cheek and smiling. " +
            "Joseph is standing behind the chair and Yukieda, confidently smiling into the camera.",
        width: 985,
        height: 1006,
        captions: {
            title: "Yukie and Joseph Greco",
            description: "A picture of my grandparents from the paternal side of the family. Yukie is who cultivated " +
                "my love for cooking and gardening.",
        },
        download: {
            filename: "yukie_and_joseph"
        },
        tags: ["Family", "Grandma", "Yukie", "Grandpa", "Joe", "Joseph"],
        order: 0
    },
    {
        src: url.fileURLToPath("../imgs/IMG_2721.png"),
        alt: "The Blue-Heeler Lab Mix, Louie, resting his head on the couch and giving the camera side-eye for the treat behind it.",
        width: 828,
        height: 1792,
        captions: {
            title: "Louie - The Blue Heeler Lab Mix",
            description: "Waiting for a treat that's just behind the camera",
        },
        download: {
            filename: "side_eye_lou"
        },
        tags: ["Pets", "Louie"],
        order: 1
    },
    {
        src: url.fileURLToPath("../imgs/IMG_1879.png"),
        alt: "A colorful sheet pan dinner featuring a fillet of salmon in the center, and surrounding the salmon " +
            "is an array of chopped vegetables: Top Left - Asparagus, Top Right - Golden Beets, Bottom Right - Red Cabbage, " +
            "Bottom Left - Broccolini, and in the corner of each quadrant a thin single vertically sliced fennel bulb. Fennel " +
            "fronds also top the salmon fillet. All ready to be put into the oven to roast.",
        width: 3024,
        height: 4032,
        captions: {
            title: "Salmon & Veggie Sheet Pan Dinner",
            description: "Salmon, Top Left - Asparagus, Top Right - Golden Beets, Bottom Right - Red Cabbage, " +
                "Bottom Left - Broccolini, and in the corner of each quadrant a thin single vertically sliced fennel bulb.",
        },
        download: {
            filename: "salmon_veggie_sheetpan"
        },
        tags: ["Food & Baking"],
        order: 2
    }
]