export const advancedFiltering = (filters, gallery) => {
    const filterStrLowercased = filters.toLowerCase();

    // Exact Filtering
    gallery.filters.by.exact.flagged = (
        typeof filterStrLowercased === 'string' &&
        filterStrLowercased.length > 0 &&
        (filterStrLowercased.includes(`"`) || filterStrLowercased.includes(`'`))
    );
    if(gallery.filters.by.exact.flagged) {
        let filterByExactValues = extractExactQuotationMaterialFromFilterQuery(filterStrLowercased);

        filterByExactValues = filterByExactValues.map((value) => {
            let cleaned = value.replace(/"/g, "");
            return cleaned.replace(/'/g, "");
        });

        gallery.filters.by.exact.terms = dedupArray(filterByExactValues);
    }

    // Exclusion Filtering
    gallery.filters.by.exclusion.flagged = filterStrLowercased.includes("-");
    if(gallery.filters.by.exclusion.flagged) {
        let exclusionFilterValues = extractMaterialFromFilterQuery(filterStrLowercased, '-',  1);
        gallery.filters.by.exclusion.terms = dedupArray(exclusionFilterValues);
    }

    // Fuzzy Filtering
    gallery.filters.by.fuzzy.flagged = filterStrLowercased.includes("~");
    if(gallery.filters.by.fuzzy.flagged) {
        let fuzzyFilterValues = extractMaterialFromFilterQuery(filterStrLowercased, '~',  1);
        gallery.filters.by.fuzzy.terms = dedupArray(fuzzyFilterValues);
    }

    // Site Filtering
    gallery.filters.by.websiteOnly.flagged = filterStrLowercased.includes("site:");
    if(gallery.filters.by.websiteOnly.flagged) {
        let siteFilterValues = extractMaterialFromFilterQuery(filterStrLowercased, 'site:',  5);
        gallery.filters.by.websiteOnly.terms = dedupArray(siteFilterValues);
    }

    // All Sites Filtering
    gallery.filters.by.allSites.flagged = filterStrLowercased.includes("|");
    if(gallery.filters.by.allSites.flagged) {
        let allSiteFilterValues = extractMaterialFromFilterQuery(filterStrLowercased, '|',  1);
        gallery.filters.by.allSites.terms = dedupArray(allSiteFilterValues);
    }

    // Number Range <4-Digit Year Format> Filtering
    gallery.filters.by.numberRange.flagged = filterStrLowercased.includes("..");
    if(gallery.filters.by.numberRange.flagged) {
        gallery.filters.by.numberRange.ranges = extractDateRangesFromFilterQuery(filterStrLowercased);
    }

    // Filetype Filtering
    gallery.filters.by.filetype.flagged = filterStrLowercased.includes("filetype:");
    if(gallery.filters.by.filetype.flagged) {
        let fileTypeValues = extractMaterialFromFilterQuery(filterStrLowercased, "filetype:", 9);
        gallery.filters.by.filetype.terms = dedupArray(fileTypeValues);
    }

    return gallery;
};

export const buildQuery = (gallery) => {
    let filterQuery = {};

    if(gallery.filters.by.exact.flagged) {
        filterQuery = {
            $text: {
                $search: gallery.filters.by.exact.terms.join(" | "),
            }
        }
    }

    if(gallery.filters.by.exclusion.flagged) {
        filterQuery = {
            ...filterQuery,
            'captions.title': { $not: new RegExp("(" + gallery.filters.by.exclusion.terms.join("|") + ")", "i") }
        }
    }

    if(gallery.filters.by.fuzzy.flagged) {
        filterQuery["$text"]["$search"] = `${filterQuery["$text"]["$search"]}` + " | " + gallery.filters.by.fuzzy.terms.join(" | ");
    }

    if(gallery.filters.by.websiteOnly.flagged) {
        filterQuery["$text"]["$search"] = `${filterQuery["$text"]["$search"]}` + " | " + gallery.filters.by.websiteOnly.terms.join(" | ");
    }

    //if(gallery.filters.by.allSites.flagged) {}

    if(gallery.filters.by.numberRange.flagged) {
        filterQuery = {
            ...filterQuery,
            year: { $gte: gallery.filters.by.numberRange.ranges.beforeDates[0], $lte: gallery.filters.by.numberRange.ranges.afterDates[0] }
        }
    }

    if(gallery.filters.by.filetype.flagged) {
        let filetypePattern = gallery.filters.by.filetype.terms.map(ext => `.*\.${ext}$`).join("|");
        filterQuery = {
            ...filterQuery,
            'src': { $regex: filetypePattern, $options: 'i' }
        }
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