export async function getAttractions(page = 1, search = '') {
    const baseUrl = 'https://dae-mobile-assignment.hkit.cc/api/attractions';
    const params = new URLSearchParams({
        page: page.toString(),
        search
    });
    const url = `${baseUrl}?${params}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching attractions:', error);
        throw error;
    }
}
export async function getAttractionDetails(attractionId: number) {
    const baseUrl = `https://dae-mobile-assignment.hkit.cc/api/attractions/${attractionId}`;
    try {
        const response = await fetch(baseUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching attraction details:', error);
        throw error;
    }
}