const GAME_NAME = 'FnF';
const LOCAL_STORAGE_KEY = 'FunkinCrew:Funkin1';
// Get data from localStorage
function getLocalStorageData() {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? data : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

// Save data to localStorage
function saveToLocalStorage(data) {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, data);
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

// Save game data to API
async function saveGameData(saveData) {
    
    try {
        const response = await fetch('/api/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                gameName: GAME_NAME,
                data: saveData
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Save failed');
        }

        console.log('Game saved successfully:', result);
        return { success: true, message: result.message };
    } catch (error) {
        console.error('Error saving game:', error);
        return { success: false, error: error.message };
    }
}

// Load game data from API
async function loadGameData() {
    // First check localStorage
    const localData = getLocalStorageData();
    
    // Try to load from API if authenticated
    try {
        const response = await fetch(`/api/load?gameName=${encodeURIComponent(GAME_NAME)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('Game loaded successfully from API:', result);
            // Save to localStorage for future use
            if (result.data) {
                saveToLocalStorage(result.data);
            }
            return { success: true, data: result.data, source: 'api' };
        }
        
        // If API load failed but we have local data, use that
        if (localData) {
            console.log('API load failed, using localStorage data');
            return { success: true, data: localData, source: 'localStorage' };
        }
        
        // No data available anywhere
        console.log('No save data found:', result.message);
        return { success: false, error: result.message || 'No save data found' };
        
    } catch (error) {
        console.error('Error loading game from API:', error);
        // If API fails but we have local data, use that
        if (localData) {
            console.log('API error, using localStorage data');
            return { success: true, data: localData, source: 'localStorage' };
        }
        return { success: false, error: error.message };
    }
}

// Check if user is authenticated
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/status', {
            credentials: 'include'
        });
        const result = await response.json();
        return result.authenticated;
    } catch (error) {
        console.error('Error checking auth:', error);
        return false;
    }
}
 
checkAuth().then(async (isAuth) => {
    if (isAuth) {
        await loadGameData();
    } else {
        console.log('User is not authenticated');
    }
}).catch(error => {
    console.error('Error during auth check or load:', error);
});

// Auto-save every 3 seconds
setInterval(async () => {
    const localData = getLocalStorageData();
    if (localData) {
        const isAuth = await checkAuth();
        if (isAuth) {
            await saveGameData(localData);
            console.log('Auto-save executed');
        }
    }
}, 20000);