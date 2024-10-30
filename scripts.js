import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let page = 1;
let matches = books;

// Book class to encapsulate book properties and rendering logic
class Book {
  constructor(id, title, authorId, image) {
    this.id = id;
    this.title = title;
    this.authorId = authorId;
    this.image = image;
  }

  render() {
    const element = document.createElement("button");
    element.classList.add("preview");
    element.setAttribute("data-preview", this.id);
    element.innerHTML = `
            <img class="preview__image" src="${this.image}" />
            <div class="preview__info">
                <h3 class="preview__title">${this.title}</h3>
                <div class="preview__author">${authors[this.authorId]}</div>
            </div>
        `;
    return element;
  }
}

// Function to render books
function renderBooks(matches) {
  const fragment = document.createDocumentFragment();

  matches.slice(0, BOOKS_PER_PAGE).forEach(({ id, title, author, image }) => {
    const book = new Book(id, title, author, image);
    fragment.appendChild(book.render());
  });

  document.querySelector("[data-list-items]").appendChild(fragment);
}

// Function to populate dropdowns for genres and authors
function populateDropdowns() {
  const genreDropdown = document.querySelector("[data-search-genres]");
  const authorDropdown = document.querySelector("[data-search-authors]");

  const createOption = (value, text) => {
    const option = document.createElement("option");
    option.value = value;
    option.innerText = text;
    return option;
  };

  const genreFragment = document.createDocumentFragment();
  genreFragment.appendChild(createOption("any", "All Genres"));
  Object.entries(genres).forEach(([id, name]) =>
    genreFragment.appendChild(createOption(id, name))
  );
  genreDropdown.appendChild(genreFragment);

  const authorFragment = document.createDocumentFragment();
  authorFragment.appendChild(createOption("any", "All Authors"));
  Object.entries(authors).forEach(([id, name]) =>
    authorFragment.appendChild(createOption(id, name))
  );
  authorDropdown.appendChild(authorFragment);
}

// Function to load theme based on user preference
function loadTheme() {
  const prefersDarkScheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const theme = prefersDarkScheme ? "night" : "day";
  document.querySelector("[data-settings-theme]").value = theme;

  const darkColor = prefersDarkScheme ? "255, 255, 255" : "10, 10, 20";
  const lightColor = prefersDarkScheme ? "10, 10, 20" : "255, 255, 255";

  document.documentElement.style.setProperty("--color-dark", darkColor);
  document.documentElement.style.setProperty("--color-light", lightColor);
}

// Function to update the "Show More" button state
function updateShowMoreButton() {
  const button = document.querySelector("[data-list-button]");
  const remainingBooks = matches.length - page * BOOKS_PER_PAGE;

  button.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${Math.max(remainingBooks, 0)})</span>
    `;
  button.disabled = remainingBooks <= 0;
}

// Event listeners and handling
const eventListeners = {
  init() {
    this.attachEventListeners();
    populateDropdowns(); // Populate genres and authors on init
    renderBooks(matches);
    loadTheme();
    updateShowMoreButton();
  },

  attachEventListeners() {
    document
      .querySelector("[data-search-cancel]")
      .addEventListener("click", this.closeSearchOverlay);
    document
      .querySelector("[data-settings-cancel]")
      .addEventListener("click", this.closeSettingsOverlay);
    document
      .querySelector("[data-header-search]")
      .addEventListener("click", this.openSearchOverlay);
    document
      .querySelector("[data-header-settings]")
      .addEventListener("click", this.openSettingsOverlay);
    document
      .querySelector("[data-list-close]")
      .addEventListener("click", this.closeListActive);
    document
      .querySelector("[data-list-button]")
      .addEventListener("click", this.showMoreBooks);
    document
      .querySelector("[data-list-items]")
      .addEventListener("click", this.showBookDetails);
    document
      .querySelector("[data-settings-form]")
      .addEventListener("submit", this.handleSettingsSubmit);
    document
      .querySelector("[data-search-form]")
      .addEventListener("submit", this.handleSearchSubmit);
  },

  closeSearchOverlay() {
    document.querySelector("[data-search-overlay]").open = false;
  },

  closeSettingsOverlay() {
    document.querySelector("[data-settings-overlay]").open = false;
  },

  openSearchOverlay() {
    document.querySelector("[data-search-overlay]").open = true;
    document.querySelector("[data-search-title]").focus();
  },

  openSettingsOverlay() {
    document.querySelector("[data-settings-overlay]").open = true;
  },

  closeListActive() {
    document.querySelector("[data-list-active]").open = false;
  },

  showMoreBooks() {
    const fragment = document.createDocumentFragment();
    const nextBooks = matches.slice(
      page * BOOKS_PER_PAGE,
      (page + 1) * BOOKS_PER_PAGE
    );

    nextBooks.forEach(({ id, title, author, image }) => {
      const book = new Book(id, title, author, image);
      fragment.appendChild(book.render());
    });

    document.querySelector("[data-list-items]").appendChild(fragment);
    page += 1;
    updateShowMoreButton();
  },

  showBookDetails(event) {
    const pathArray = Array.from(event.path || event.composedPath());
    const activeBookId = pathArray.find((node) => node?.dataset?.preview)
      ?.dataset.preview;

    const activeBook = books.find((book) => book.id === activeBookId);
    if (activeBook) {
      document.querySelector("[data-list-active]").open = true;
      document.querySelector("[data-list-blur]").src = activeBook.image;
      document.querySelector("[data-list-image]").src = activeBook.image;
      document.querySelector("[data-list-title]").innerText = activeBook.title;
      document.querySelector("[data-list-subtitle]").innerText = `${
        authors[activeBook.author]
      } (${new Date(activeBook.published).getFullYear()})`;
      document.querySelector("[data-list-description]").innerText =
        activeBook.description;
    }
  },

  handleSettingsSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);

    const darkColor = theme === "night" ? "255, 255, 255" : "10, 10, 20";
    const lightColor = theme === "night" ? "10, 10, 20" : "255, 255, 255";

    document.documentElement.style.setProperty("--color-dark", darkColor);
    document.documentElement.style.setProperty("--color-light", lightColor);
    document.querySelector("[data-settings-overlay]").open = false;
  },

  handleSearchSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);

    matches = books.filter((book) => {
      const titleMatch =
        filters.title.trim() === "" ||
        book.title.toLowerCase().includes(filters.title.toLowerCase());
      const authorMatch =
        filters.author === "any" || book.author === filters.author;
      const genreMatch =
        filters.genre === "any" || book.genres.includes(filters.genre);
      return titleMatch && authorMatch && genreMatch;
    });

    page = 1;
    document
      .querySelector("[data-list-message]")
      .classList.toggle("list__message_show", matches.length < 1);
    document.querySelector("[data-list-items]").innerHTML = "";
    renderBooks(matches);
    updateShowMoreButton();
  },
};

// Initialize the application
document.addEventListener("DOMContentLoaded", () => eventListeners.init());
