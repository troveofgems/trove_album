import NODE_CLAM from "clamscan";
import {getAbsolutePath_VideoStorage} from "../multer/config.js";
import path from "node:path";

const __dirname = import.meta.dirname;

export const getAbsolutePath_LogStorage = () => path.join(__dirname, "../../assets/uploads/logs");
const ClamShell = new NODE_CLAM();

const setClamOptions = (settings) => ({
    removeInfected: false,
    quarantineInfected: false, //'~/infected/', // Move file here. removeInfected must be FALSE, though.
    scanLog: `${getAbsolutePath_LogStorage()}/vScanner.log`, //`${getAbsolutePath_LogStorage()}/vScan-${settings.fileName}-${(new Date()).toISOString()}.log`,
    debugMode: true, // This will put some debug info in your js console
    fileList: null,
    scanRecursively: false, // Choosing false here will save some CPU cycles
    clamscan: {
        path: '/usr/bin/clamscan',
        scanArchives: true,
        db: null, // Path to a custom virus definition database
        active: false // you don't want to use this at all because it's evil
    },
    clamdscan: {
        socket: false, //'/var/run/clamd.scan/clamd.sock', // This is pretty typical
        host: false, //'127.0.0.1', // If you want to connect locally but not through socket
        port: false, //3087, // Because, why not
        timeout: 300000, // 5 minutes
        localFallback: true,
        path: '/usr/bin/clamdscan', // Special path to the clamdscan binary on your server
        configFile: null, // A fairly typical config location
        multiscan: true,
        reloadDb: false, // You dont want your scans to run slow like with clamscan
        active: true,
        bypassTest: false, // Don't check to see if socket is available. You should probably never set this to true.
        tls: false // Connect to clamd over TLS
    },
    preference: 'clamdscan' // If clamscan is found and active, it will be used by default
});

export default {
    ClamShell,
    setClamOptions
};