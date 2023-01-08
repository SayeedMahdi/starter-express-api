import mongoose from "mongoose";
import { accessibleRecordsPlugin } from "@casl/mongoose";
import i18next from 'i18next'
import * as fs from "fs";

const MediaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        enum: ["jpg", "jpeg", "png"],
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    width: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    sizes: {
        thumbnail: String,
        medium: String,
        large: String,
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
    },
    updaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
    }
},
    {
        timestamps: true,
    }
);

MediaSchema.plugin(accessibleRecordsPlugin);

MediaSchema.pre('remove', async function (req, _, next) {
    const isImgUsed = await this.model("Blog").findOne({ image: this._id });

    if (isImgUsed) {
        throw new Error(i18next.t('not-allowed', { ns: 'messages', key: i18next.t('image') }));
    }

    next();
})

function RemoveUnusedImages() {
    // Remove Original Image
    if (fs.existsSync(this.path)) {
        fs.unlinkSync(this.path);
    }
    // Remove Sub-image types
    const deleteImgPath = Object.values(this?.sizes);
    deleteImgPath?.forEach(path => {
        if (fs.existsSync(path)) {
            fs.unlinkSync(path)
        }
    });
}

MediaSchema.post('remove', RemoveUnusedImages);
MediaSchema.pre('findOneAndUpdate', async function () {
    const docToUpdate = await this.model.findOne(this.getQuery());
    RemoveUnusedImages.bind(docToUpdate).call();
});

const Media = mongoose.model("Media", MediaSchema);

export default Media;


// import mongoose from "mongoose";
// import { accessibleRecordsPlugin } from "@casl/mongoose";
// import i18next from 'i18next'
// import * as fs from "fs";

// const MediaSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     mimeType: {
//         type: String,
//         enum: ["jpg", "jpeg", "png"],
//         required: true
//     },
//     size: {
//         type: Number,
//         required: true
//     },
//     width: {
//         type: Number,
//         required: true
//     },
//     height: {
//         type: Number,
//         required: true
//     },
//     path: {
//         type: String,
//         required: true
//     },
//     sizes: {
//         thumbnail: String,
//         medium: String,
//         large: String,
//     },
//     creatorId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Admin",
//     },
//     updaterId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Admin",
//     }
// },
//     {
//         timestamps: true,
//     }
// );

// MediaSchema.plugin(accessibleRecordsPlugin);

// MediaSchema.pre('remove', async function (req, _, next) {
//     const isImgUsed = await this.model("Blog").findOne({ image: this._id });

//     if (isImgUsed) {
//         throw new Error(i18next.t('not-allowed', { ns: 'messages', key: i18next.t('image') }));
//     }

//     next();
// })

// function RemoveUnusedImages() {
//     // Remove Original Image
//     if (fs.existsSync(this.path)) {
//         fs.unlinkSync(this.path);
//     }
//     // Remove Sub-image types
//     const deleteImgPath = Object.values(this?.sizes);
//     deleteImgPath?.forEach(path => {
//         if (fs.existsSync(path)) {
//             fs.unlinkSync(path)
//         }
//     });
// }

// MediaSchema.post('remove', RemoveUnusedImages);
// MediaSchema.pre('findOneAndUpdate', async function () {
//     const docToUpdate = await this.model.findOne(this.getQuery());
//     RemoveUnusedImages.bind(docToUpdate).call();
// });

// const Media = mongoose.model("Media", MediaSchema);

// export default Media;