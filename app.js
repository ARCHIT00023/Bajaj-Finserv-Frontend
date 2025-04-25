const apiUrl = 'https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json';
let doctorData = [];
let filters = { consultation: '', specialties: [], sortBy: '' };
let currentPage = 1;
const doctorsPerPage = 6;

// Fetch data from the API
async function fetchData() {
    const loadingSpinner = document.getElementById('loading');
    loadingSpinner.style.display = 'block'; // Show spinner

    try {
        const response = await fetch(apiUrl);
        doctorData = await response.json();
        renderDoctorList();
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        loadingSpinner.style.display = 'none'; // Hide spinner
    }
}

// Render the filtered/sorted doctor list
function renderDoctorList() {
    const filteredDoctors = doctorData
        .filter(doc => filters.consultation ? doc.consultation === filters.consultation : true)
        .filter(doc => filters.specialties.length ? filters.specialties.every(spec => doc.specialties.includes(spec)) : true)
        .sort((a, b) => {
            if (filters.sortBy === 'fees') return a.fee - b.fee;
            if (filters.sortBy === 'experience') return b.experience - a.experience;
            return 0;
        });

    const start = (currentPage - 1) * doctorsPerPage;
    const end = currentPage * doctorsPerPage;
    const paginatedDoctors = filteredDoctors.slice(start, end);

    const listContainer = document.getElementById('doctor-list');
    listContainer.innerHTML = paginatedDoctors.map(doc => `
        <div class="doctor-card" data-testid="doctor-card">
            <img src="images/doctor${doc.id}.jpg" alt="${doc.name} Image" class="doctor-img" />
            <h3 class="doctor-name" data-testid="doctor-name">${doc.name}</h3>
            <p class="doctor-specialty" data-testid="doctor-specialty">${doc.specialties.join(', ')}</p>
            <p class="doctor-experience" data-testid="doctor-experience">Experience: ${doc.experience} years</p>
            <p class="doctor-fee" data-testid="doctor-fee">Fee: ₹${doc.fee}</p>
        </div>
    `).join('');

    renderPagination(filteredDoctors);
}

// Render pagination buttons
function renderPagination(filteredDoctors) {
    const paginationContainer = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

    paginationContainer.innerHTML = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage('prev')">Previous</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage('next')">Next</button>
    `;
}

function changePage(direction) {
    if (direction === 'next') {
        currentPage++;
    } else if (direction === 'prev') {
        currentPage--;
    }
    renderDoctorList();
}

// Display active filters in the UI
function displayActiveFilters() {
    const filterSummary = document.getElementById('active-filters');
    filterSummary.innerHTML = `
        Consultation: ${filters.consultation || 'Any'} | 
        Specialties: ${filters.specialties.join(', ') || 'Any'} | 
        Sort By: ${filters.sortBy || 'None'}`;
}

// Handle autocomplete search
document.getElementById('autocomplete-input').addEventListener('input', event => {
    const query = event.target.value.toLowerCase();
    const suggestions = doctorData.filter(doc => doc.name.toLowerCase().includes(query)).slice(0, 3);
    const suggestionsDropdown = document.createElement('div');
    suggestionsDropdown.classList.add('autocomplete-dropdown');
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.textContent = suggestion.name;
        item.classList.add('suggestion-item');
        item.setAttribute('data-testid', 'suggestion-item');
        item.addEventListener('click', () => {
            document.getElementById('autocomplete-input').value = suggestion.name;
            filters.consultation = suggestion.consultation;
            filters.specialties = suggestion.specialties;
            filters.sortBy = 'fees';
            renderDoctorList();
        });

        // Highlight matching part of the name
        const highlightedName = suggestion.name.replace(new RegExp(query, 'ig'), match => `<span style="background-color: yellow;">${match}</span>`);
        item.innerHTML = highlightedName;

        suggestionsDropdown.appendChild(item);
    });
    document.body.appendChild(suggestionsDropdown);
});

// Handle clear search button
document.getElementById('clear-search-btn').addEventListener('click', () => {
    document.getElementById('autocomplete-input').value = '';
    renderDoctorList();
});

// Handle filters
document.querySelectorAll('input[name="consultation"]').forEach(input => {
    input.addEventListener('change', (event) => {
        filters.consultation = event.target.value;
        displayActiveFilters();
        renderDoctorList();
    });
});

document.querySelectorAll('.specialty').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        filters.specialties = [...document.querySelectorAll('.specialty:checked')].map(checkbox => checkbox.value);
        displayActiveFilters();
        renderDoctorList();
    });
});

document.getElementById('sort-options').addEventListener('change', (event) => {
    filters.sortBy = event.target.value;
    displayActiveFilters();
    renderDoctorList();
});

// Initial Fetch
fetchData();
