export function filterKey(obj, keysToFilter) {
    return Object.fromEntries(
        Object.entries(obj)
            .map(([key, value]) => [
                key,
                Object.fromEntries(
                    Object.entries(value).filter(([subKey]) => keysToFilter.includes(subKey))
                )
            ])
            .filter(([key, filteredValue]) => 
                keysToFilter.every((filterKey) => filterKey in filteredValue)
            )
    );
}