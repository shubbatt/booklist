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
            console.log('🔄 Loading data from database...');

            // Load each endpoint individually with error handling
            const loadEndpoint = async (url: string, name: string) => {
                try {
                    const res = await fetch(url);
                    if (!res.ok) {
                        console.error(`❌ ${name}: ${res.status} ${res.statusText}`);
                        return [];
                    }
                    const data = await res.json();
                    console.log(`✅ ${name}: ${data.length} items`);
                    return data;
                } catch (error) {
                    console.error(`❌ ${name} failed:`, error);
                    return [];
                }
            };

            const [schools, outlets, booklists, redemptions, stock, optionItems, users] = await Promise.all([
                loadEndpoint('/api/schools', 'Schools'),
                loadEndpoint('/api/outlets', 'Outlets'),
                loadEndpoint('/api/booklists', 'Booklists'),
                loadEndpoint('/api/redemptions', 'Redemptions'),
                loadEndpoint('/api/stock', 'Stock'),
                loadEndpoint('/api/option-items', 'Option Items'),
                loadEndpoint('/api/users', 'Users'),
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
        };

        loadData();
    }, [isAuthenticated, _hasHydrated]);
}
