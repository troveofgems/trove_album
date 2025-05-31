import ffmpeg from 'fluent-ffmpeg';
import fs from "node:fs";
import {exec, spawn} from "node:child_process";

export function getMetadataValue(metadataArray, key) {
    const result = metadataArray.find(item => item.key === key);
    return result ? result.value : null;
}

export const convertToMp4 = async (req, fileName, storagePath) => {
    const intendedOutputFilename = `${changeExtensionToMp4(fileName)}`;

    try {
        // Get input video properties
        const videoProperties = await getVideoProperties(`${storagePath}/${fileName}`);

        // Extract resolution and framerate
        const width = parseInt(videoProperties.streams[0].width);
        const height = parseInt(videoProperties.streams[0].height);

        // Calculate target bitrate
        const bitrate = calculateBitrate(width, height);

        // Create ffmpeg command with all required parameters
        await new Promise((resolve, reject) => {
            ffmpeg(`${storagePath}/${fileName}`)
                .videoCodec('libx264')
                .output(`${storagePath}/${intendedOutputFilename}`)
                .on('error', (err) => reject(err))
                .on('progress', (progress) => {
                    console.log(`Processing Video: ${Math.round(progress.percent)}% - ${intendedOutputFilename}`);
                })
                .on('end', async () => {
                    /*console.log('Finished processing...Now Cleaning Up Old Movie File');
                    cleanup(storagePath, fileName);*/
                    req.locals.convertedFilePath = `${storagePath}/${intendedOutputFilename}`;

                    const ffprobeProcess = spawn('ffprobe', [
                        '-v',
                        'error',
                        '-show_streams',
                        '-show_format',
                        '-print_format',
                        'json',
                        '-i',
                        `${req.locals.convertedFilePath}`
                    ]);

                    let metadata = '';

                    ffprobeProcess.stdout.on('data', (data) => {
                        metadata += data.toString();
                    });

                    await new Promise((resolve, reject) => {
                        ffprobeProcess.on('close', resolve);
                        ffprobeProcess.on('error', reject);
                    });

                    const videoMetadata = JSON.parse(metadata);

                    // Store relevant metadata
                    req.locals.metadataToSave = {
                        fileName: intendedOutputFilename,
                        originalName: req.file.originalname,
                        size: req.file.size,
                        information: {
                            container: videoMetadata.format,
                            streams: videoMetadata.streams,
                            duration: videoMetadata.format.duration,
                            bitrate: videoMetadata.format.bit_rate,
                            height: height,
                            width: width
                        }
                    };
                    resolve(true);
                })
                .run();
        });

        return req;
    } catch (error) {
        console.error('Error during conversion:', error);
        throw error;
    }
};

function changeExtensionToMp4(filename) {
    return filename.replace(/\.[^/.]+$/, '.mp4');
}

const cleanup = (storagePath, fileName) => {
    fs.unlink(`${storagePath}/${fileName}`, (err, res) => {
        if(!err) {
            console.log(`File Cleanup Completed Post Conversion - ${fileName} DELETED`);
            return true;
        }
        return false;
    });
}

const getVideoProperties = async (filePath) => {
    return new Promise((resolve, reject) => {
        exec(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of json ${filePath}`,
            (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(JSON.parse(stdout));
            }
        );
    });
};

const calculateBitrate = (width, height) => {
    const is4k = width >= 3840 && height >= 2160;
    const is1080p = width >= 1920 && height >= 1080;

    if (is4k) return '50000k';
    if (is1080p) return '16000k';
    return '8000k'; // Default bitrate for lower resolutions
};