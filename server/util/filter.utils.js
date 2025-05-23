import PhotoModel from "../db/models/photo.model.js";

export const getGalleryTemplate = async (uiFetchSettings, managementFetch = false) => {
    let galleryTemplate = {
        photos: {
            imageList: [],
            groupMap: new Map(),
            pullCount: 0,
            totalPhotoCount: 0,
            pagination: {
                page: 0,
                offset: 0,
                maxPages: 0,
                limit: 0
            },
            fetchQuotaReached: false
        },
        UIFetchSettings: null,
    };

    if(managementFetch) return galleryTemplate;

    // Applies Page Settings Based off Query Params
    return await applySettingsForGallery(galleryTemplate, uiFetchSettings);
};

export const applySettingsForGallery = async (gallery, uiFetchSettings) => {
    const convertedPageSettingsToJson = typeof uiFetchSettings === "string" &&
        uiFetchSettings.length > 0
        && JSON.parse(uiFetchSettings);

    // Track UI Settings
    gallery.UIFetchSettings = convertedPageSettingsToJson;

    return await applyPaginationSettingsForGallery(gallery, convertedPageSettingsToJson);
};

export const applyPaginationSettingsForGallery = async (gallery, uiFetchSettings) => {
    // Set Server Pagination Fields
    gallery.photos.pagination.page = uiFetchSettings.page || 1;
    gallery.photos.pagination.offset = uiFetchSettings.offset || 0;
    gallery.photos.pagination.limit = uiFetchSettings.limit || 10;

    let // Build Query To Calculate Max Pages
        filterQuery = {},
        parsedQueryParams = advancedFiltering(gallery, uiFetchSettings);

    if(!!parsedQueryParams) {
        filterQuery = buildQuery(parsedQueryParams);
    }

    // Track Resources Available From Server
    gallery.photos.totalPhotoCount = await fetchTotalResourcesForGivenQuery(filterQuery);
    gallery.photos.pagination.maxPages = Math.ceil(gallery.photos.totalPhotoCount / gallery.photos.pagination.limit);
    gallery.UIFetchSettings.maxPages = gallery.photos.pagination.maxPages;

    // Track Fetch Quota
    gallery.photos.fetchQuotaReached = (gallery.photos.pagination.page > gallery.photos.pagination.maxPages) ||
        (gallery.photos.pagination.page === gallery.photos.pagination.maxPages);

    return {
        gallery,
        filterQuery
    };
};

export const fetchTotalResourcesForGivenQuery = async (filterQuery) => await PhotoModel.countDocuments(filterQuery);

export const advancedFiltering = (gallery, uiFetchSettings) => {
    const
        fetchAllItems = !gallery.UIFetchSettings.settings.filters.enabled &&
            !gallery.UIFetchSettings.settings.filters.enabledWithStrFilter,
        deepFilter = gallery.UIFetchSettings.settings.filters.enabled ||
            gallery.UIFetchSettings.settings.filters.enabledWithStrFilter;

    if(fetchAllItems) return null;
    if(deepFilter) {
        parseAllFilters(gallery, uiFetchSettings);
        return gallery;
    }
};

export const buildQuery = (gallery) => {
    const
        simpleCategoryChange = gallery.UIFetchSettings.settings.filters.enabled &&
            !gallery.UIFetchSettings.settings.filters.enabledWithStrFilter,
        complexFilterChange = gallery.UIFetchSettings.settings.filters.enabledWithStrFilter;

    let filterQuery = {};

    if (simpleCategoryChange) {
        filterQuery = { tags: { $in: [`${gallery.UIFetchSettings.settings.filters.category}`] }}
    } else if (complexFilterChange) {
        gallery.UIFetchSettings.settings.filters.enabled = gallery.UIFetchSettings.settings.filters.enabledWithStrFilter;
        Object
            .entries(gallery.UIFetchSettings.settings.filters.by)
            .forEach((key, index) => {
                if(key[1].flagged) {
                    switch(key[0]) {
                        case "exact":
                            filterQuery = {
                                $text: {
                                    $search: gallery.UIFetchSettings.settings.filters.by.exact.terms.join(" | "),
                                }
                            }
                            break;
                        case "exclusion":
                            filterQuery = {
                                ...filterQuery,
                                'captions.title': {
                                    $not: new RegExp(
                                        "(" + gallery.UIFetchSettings.settings.filters.by.exclusion.terms.join("|") + ")",
                                        "i"
                                    )
                                }
                            }
                            break;
                        case "fuzzy":
                        case "websiteOnly":
                            filterQuery["$text"]["$search"] =
                                `${filterQuery["$text"]["$search"]}` +
                                " | " +
                                gallery.UIFetchSettings.settings.filters.by[key[0]].terms
                                    .join(" | ");
                            break;
                        case "numberRange":
                            filterQuery = {
                                ...filterQuery,
                                year: {
                                    $gte: gallery.UIFetchSettings.settings.filters.by.numberRange.ranges.beforeDates[0],
                                    $lte: gallery.UIFetchSettings.settings.filters.by.numberRange.ranges.afterDates[0]
                                }
                            }
                            break;
                        case "filetype":
                            let filetypePattern = gallery.filters.by
                                .filetype.terms
                                .map(ext => `.*\.${ext}$`).join("|");

                            filterQuery = {
                                ...filterQuery,
                                'src': {
                                    $regex: filetypePattern,
                                    $options: 'i'
                                }
                            }
                            break;
                        case "allSites":
                        default:
                            break;
                    }
                }
            });
    }

    return filterQuery;
}

const dedupArray = (arr) => [...new Set(arr)];
const extractExactQuotationMaterialFromFilterQuery = (text) => text.match(/(["'])(.*?)\1/g);
const extractMaterialFromFilterQuery = (filterStr, pattern, slicePosition) => filterStr.split(' ').filter(p => p.startsWith(pattern)).map(p => p.slice(slicePosition));
const extractDateRangesFromFilterQuery = (filterStr) => {
    // Find all patterns matching XXXX..XXXX where X is a digit, expects year range like 2007..2024
    const dateRanges = filterStr.match(/\d+..\d+/g);

    // Return empty object if no date ranges found
    if (!dateRanges) {
        return {
            beforeDates: [],
            afterDates: []
        };
    }

    // Process each date range
    const result = {
        beforeDates: [],
        afterDates: []
    };

    dateRanges.forEach(range => {
        // Split each range into start and end dates
        const [before, after] = range.split('..');

        // Convert strings to integers and store
        result.beforeDates.push(parseInt(before));
        result.afterDates.push(parseInt(after));
    });

    return result;
};

const parseAllFilters = (gallery) => {
    if(gallery.UIFetchSettings.settings.filters.enabledWithStrFilter) {
        const filterStrLowercased = gallery.UIFetchSettings.settings.filters.userInputStr.toLowerCase();

        // Exact Filtering
        gallery.UIFetchSettings.settings.filters.by.exact.flagged = (
            typeof filterStrLowercased === 'string' &&
            filterStrLowercased.length > 0 &&
            (filterStrLowercased.includes(`"`) || filterStrLowercased.includes(`'`))
        );

        // Exclusion Filtering
        gallery.UIFetchSettings.settings.filters.by.exclusion.flagged = filterStrLowercased.includes("-");

        // Fuzzy Filtering
        gallery.UIFetchSettings.settings.filters.by.fuzzy.flagged = filterStrLowercased.includes("~");

        // Site Filtering
        gallery.UIFetchSettings.settings.filters.by.websiteOnly.flagged = filterStrLowercased.includes("site:");

        // All Sites Filtering
        gallery.UIFetchSettings.settings.filters.by.allSites.flagged = filterStrLowercased.includes("|");

        // Number Range <4-Digit Year Format> Filtering
        gallery.UIFetchSettings.settings.filters.by.numberRange.flagged = filterStrLowercased.includes("..");

        // Filetype Filtering
        gallery.UIFetchSettings.settings.filters.by.filetype.flagged = filterStrLowercased.includes("filetype:");

        // Set Terms From Value Patterns
        Object
            .entries(gallery.UIFetchSettings.settings.filters.by)
            .forEach((key) => {
                if(key[1].flagged) {
                    extractValuesAndSetTermsForProvidedQueryStr(
                        gallery,
                        {
                            filterStrLowercased: gallery.UIFetchSettings.settings.filters.userInputStr.toLowerCase(),
                            pattern:
                                key[0] === "exclusion"      ?   "-"     :
                                key[0] === "fuzzy"          ?   "~"     :
                                key[0] === "websiteOnly"    ?   "site:" :
                                key[0] === "allSites"       ?   "|"     :
                                key[0] === "filetype"       ?   "filetype:" : null,
                            slicePosition:
                                key[0] === "exclusion"      ?   1 :
                                key[0] === "fuzzy"          ?   1 :
                                key[0] === "websiteOnly"    ?   5 :
                                key[0] === "allSites"       ?   1 :
                                key[0] === "filetype"       ?   9 : null,
                        },
                        key[0]
                    );
                }
            });
    }
    return gallery;
}
const extractValuesAndSetTermsForProvidedQueryStr = (gallery, { filterStrLowercased, pattern, slicePosition }, fieldName) => {
    if (fieldName === "exact") {
        let filterByExactValues = extractExactQuotationMaterialFromFilterQuery(filterStrLowercased);

        filterByExactValues = filterByExactValues.map((value) => {
            let cleaned = value.replace(/"/g, "");
            return cleaned.replace(/'/g, "");
        });

        gallery.UIFetchSettings.settings.filters.by[fieldName].terms = dedupArray(filterByExactValues);
    } else if (fieldName === "numberRange") {
        gallery.UIFetchSettings.settings.filters.by[fieldName].ranges = extractDateRangesFromFilterQuery(filterStrLowercased);
    } else {
        let fileTypeValues = extractMaterialFromFilterQuery(filterStrLowercased, pattern, slicePosition);
        gallery.UIFetchSettings.settings.filters.by[fieldName].terms = dedupArray(fileTypeValues);
    }
    return gallery;
}