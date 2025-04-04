// Shift this all to the backend

export const AdvancedFiltering = (filters, galleryFromServer) => {
    let secondaryFilter = [];

    const
        lowercasedFilters = filters.toLowerCase(),
        filterByExact = (
            typeof lowercasedFilters === 'string' &&
            lowercasedFilters.length > 0 &&
            (lowercasedFilters.includes(`"`) || lowercasedFilters.includes(`'`))
        ),
        filterByExclusion = lowercasedFilters.includes("-"),
        filterByFuzzy = lowercasedFilters.includes("~"),
        filterByWebsiteOnly = lowercasedFilters.includes("site:"),
        filterByAllSites = lowercasedFilters.includes("|"),
        filterByNumberRange = lowercasedFilters.includes(".."),
        filterByFileType = lowercasedFilters.includes("filetype:");

    if(filterByExact) { // Priority 0
        let exactFilterValues = extractExactQuotationMaterialFromFilterQuery(lowercasedFilters);

        let searchValue = exactFilterValues[0].replace(/"/g, "");
        searchValue = searchValue.replace(/'/g, "");
        let subsetList = galleryFromServer.filter((photo) => (photo.title.toLowerCase().includes(searchValue.toLowerCase().trim())));
        secondaryFilter.push(...subsetList);
    }

    if(filterByExclusion) { // Priority 1
        let exclusionFilterValues = extractMaterialFromFilterQuery(lowercasedFilters, '-',  1);

        exclusionFilterValues.forEach((searchParam) => {
            if(secondaryFilter.length > 0) {
                secondaryFilter = secondaryFilter.filter((photo) => !photo.title.toLowerCase().includes(searchParam));
            } else {
                secondaryFilter = galleryFromServer.filter((photo) => !photo.title.toLowerCase().includes(searchParam));
            }
        });
    }

    // Fuzzy Search
    if(filterByFuzzy) {
        let fuzzyFilterValues = extractMaterialFromFilterQuery(lowercasedFilters, "~", 1);

        fuzzyFilterValues.forEach((searchParam) => {
            let
                subsetList_PTitle = galleryFromServer.filter((photo) => photo.title.toLowerCase().includes(searchParam)),
                subsetList_PDesc = galleryFromServer.filter((photo) => photo.description.toLowerCase().includes(searchParam));

            secondaryFilter = dedupArrays([...secondaryFilter, ...subsetList_PTitle, ...subsetList_PDesc]);
        });
    }

    // Website Only
    if(filterByWebsiteOnly) {
        let siteFilterValues = extractMaterialFromFilterQuery(lowercasedFilters, "site:", 5);

        siteFilterValues.forEach((searchParam) => {
            let subsetList = galleryFromServer.filter((photo) => photo.title.toLowerCase().includes(searchParam));
            secondaryFilter = dedupArrays([...secondaryFilter, ...subsetList]);
        });
    }

    // All Sites - NOT IMPLEMENTED YET
    if(filterByAllSites) {
        console.warn("Not Implemented: Filter By All Sites");
    }

    // Year Date Range
    if(filterByNumberRange) {
        let dateRangeFilter = extractDateRangesFromFilterQuery(lowercasedFilters);
        dateRangeFilter.beforeDates.forEach((beforeDate, i) => {
            if(secondaryFilter.length > 0) {
                secondaryFilter = secondaryFilter.filter((photo) => {
                    let photoYear = photo.photoTakenOn.split(",")[0].split("/")[2];
                    return !!photoYear && (photoYear >= beforeDate && photoYear <= dateRangeFilter.afterDates[i]);
                });
            } else {
                secondaryFilter = galleryFromServer.filter((photo) => {
                    let photoYear = photo.photoTakenOn.split(",")[0].split("/")[2];
                    return !!photoYear && (photoYear >= beforeDate && photoYear <= dateRangeFilter.afterDates[i]);
                });
            }
        });

    }

    // File Type
    if(filterByFileType) {
        let fileTypeFilterValues = extractMaterialFromFilterQuery(lowercasedFilters, "filetype:", 9);
        fileTypeFilterValues.forEach((searchParam) => {
            if(secondaryFilter.length > 0) {
                secondaryFilter = secondaryFilter.filter((photo) => photo.src.includes(searchParam));
            } else {
                secondaryFilter = galleryFromServer.filter((photo) => photo.src.includes(searchParam));
            }
        });
    }

    return secondaryFilter;
};

const dedupArrays = (arrList) => [...new Set(arrList.map(JSON.stringify))].map(JSON.parse);
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

export const setFrontendFilters = (categoryRequested, fs) => {
    return ({
        category: categoryRequested === "All Items" ? "*" : categoryRequested,
        filterStr: fs,
        by: {
            exact: {
                flagged: false,
                terms: null
            },
            exclusion: {
                flagged: false,
                terms: null
            },
            fuzzy: {
                flagged: false,
                terms: null
            },
            websiteOnly: {
                flagged: false,
                terms: null
            },
            allSites: {
                flagged: false,
                terms: null
            },
            numberRange: {
                flagged: false,
                ranges: null
            },
            filetype: {
                flagged: false,
                terms: null
            }
        }
    });
}