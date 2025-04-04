export const setFiltersObjectForFrontend = (categoryRequested, filterState) => ({
    category: categoryRequested === "All Items" ? "*" : categoryRequested,
    filterStr: filterState?.query || null,
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
    },
    sorting: {
        by: {
            ascending: {
                flagged: false,
                fields: []
            },
            descending: {
                flagged: false,
                fields: []
            },
            newest: {
                flagged: false,
                fields: []
            },
            oldest: {
                flagged: false,
                fields: []
            }
        }
    }
})