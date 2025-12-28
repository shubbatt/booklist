import { useEffect } from 'react';
import { useStore } from '../store';

/**
 * Hook to load all data from the API on app startup
 * This ensures data is always fresh from the database
 */
export function useLoadData() {
    const { isAuthenticated, _hasHydrated } = useStore();

    useEffect(() => {
        if (!isAuthenticated || !_hasHydrated) return;

        const loadData = async () => {
            try {
                // Load all data from API in parallel
                const [
                    schoolsRes,
                    outletsRes,
                    booklistsRes,
                    redemptionsRes,
                    stockRes,
                    optionItemsRes,
                    usersRes,
                ] = await Promise.all([
                    fetch('/api/schools'),
                    fetch('/api/outlets'),
                    fetch('/api/booklists'),
                    fetch('/api/redemptions'),
                    fetch('/api/stock'),
                    fetch('/api/option-items'),
                    fetch('/api/users'),
                ]);

                // Check if all responses are OK
                const responses = [
                    { name: 'schools', res: schoolsRes },
                    { name: 'outlets', res: outletsRes },
                    { name: 'booklists', res: booklistsRes },
                    { name: 'redemptions', res: redemptionsRes },
                    { name: 'stock', res: stockRes },
                    { name: 'option-items', res: optionItemsRes },
                    { name: 'users', res: usersRes },
                ];

                for (const { name, res } of responses) {
                    if (!res.ok) {
                        console.error(`❌ Failed to load ${name}: ${res.status} ${res.statusText}`);
                        const text = await res.text();
                        console.error(`Response: ${text.substring(0, 200)}`);
                    }
                }

                const [schools, outlets, booklists, redemptions, stock, optionItems, users] =
                    await Promise.all([
                        schoolsRes.json(),
                        outletsRes.json(),
                        booklistsRes.json(),
                        redemptionsRes.json(),
                        stockRes.json(),
                        optionItemsRes.json(),
                        usersRes.json(),
                    ]);

                // Update store with data from database
                useStore.setState({
                    schools,
                    outlets,
                    locations: outlets, // Locations are outlets
                    booklists,
                    redemptions,
                    voucherStock: stock,
                    optionItems,
                    users,
                });

                console.log('✅ Data loaded from database');
            } catch (error) {
                console.error('❌ Failed to load data:', error);
            }
        };

        loadData();
    }, [isAuthenticated, _hasHydrated]);
}
