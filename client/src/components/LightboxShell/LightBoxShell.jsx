import React, {useRef} from "react";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Download from "yet-another-react-lightbox/plugins/download";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Lightbox from "yet-another-react-lightbox";
//import Share from "yet-another-react-lightbox/plugins/share"; // Broken

export const LightBoxShell = ({
                                  slides,
                                  lightboxSpotlightIndex,
                                  showLightbox,
                                  setShowLightbox
}) => {
    const photoCaptionsRefForLightbox = useRef(null);

    return (
        <Lightbox
            slides={slides}
            index={lightboxSpotlightIndex}
            open={showLightbox}
            close={() => setShowLightbox(false)}
            plugins={[Captions, Download, Zoom]}
            captions={{ref: photoCaptionsRefForLightbox}}
            on={{
                click: () => {
                    (photoCaptionsRefForLightbox.current?.visible
                        ? photoCaptionsRefForLightbox.current?.hide
                        : photoCaptionsRefForLightbox.current?.show)?.();
                },
            }}
            zoom={{ref: photoCaptionsRefForLightbox}}
            sizes={{
                size: "3200px",
                sizes: [
                    {
                        viewport: "(max-width: 3200px)",
                        size: "calc(100vw - 32px)",
                    },
                ],
            }}
            controller={{ closeOnBackdropClick: true, closeOnPullUp: true, closeOnPullDown: true }}
        />
    )
}