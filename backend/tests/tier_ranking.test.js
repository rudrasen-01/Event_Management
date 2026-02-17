const { UnifiedVendorSearch } = require('../services/unifiedSearchService');

describe('Tier merging and ranking order', () => {
  test('priority: exactArea > nearby > sameCity > adjacentCity', async () => {
    const params = { query: '', city: 'TestCity', area: 'TestArea', page: 1, limit: 20 };
    const search = new UnifiedVendorSearch(params);

    // Override methods to return deterministic arrays
    search.resolveLocationCoordinates = async () => ({ coordinates: [77, 12], area: { name: 'TestArea' }, source: 'test' });
    search.findExactAreaVendors = async () => [{ vendorId: 'A', name: 'Exact A', tierPriority: 1 }];
    search.findNearbyVendors = async () => [{ vendorId: 'B', name: 'Nearby B', tierPriority: 2 }];
    search.findSameCityVendors = async () => [{ vendorId: 'C', name: 'SameCity C', tierPriority: 3 }];
    search.findAdjacentCityVendors = async () => [{ vendorId: 'D', name: 'Adjacent D', tierPriority: 4 }];

    const res = await search.execute();
    expect(res.total).toBe(4);
    expect(res.results[0].vendorId).toBe('A');
    expect(res.results[1].vendorId).toBe('B');
    expect(res.results[2].vendorId).toBe('C');
    expect(res.results[3].vendorId).toBe('D');
  });
});
