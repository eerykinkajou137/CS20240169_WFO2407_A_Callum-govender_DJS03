import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";
let page = 1;
let matches = books;

function renderBooks(matches) {
  const starting = document.createDocumentFragment();

  for (const { author, id, image, title } of matches.slice(0, BOOKS_PER_PAGE)) {
    const element = document.createElement("button");
    element.classList = "preview";
    element.setAttribute("data-preview", id);

    element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;

    starting.appendChild(element);
  }

  document.querySelector("[data-list-items]").appendChild(starting);
} // Render the Books UI

function searchBtn(genres, authors) {
  const genreHtml = document.createDocumentFragment();
  const firstGenreElement = document.createElement("option");
  firstGenreElement.value = "any";
  firstGenreElement.innerText = "All Genres";
  genreHtml.appendChild(firstGenreElement);

  for (const [id, name] of Object.entries(genres)) {
    const element = document.createElement("option");
    element.value = id;
    element.innerText = name;
    genreHtml.appendChild(element);
  }

  document.querySelector("[data-search-genres]").appendChild(genreHtml);

  const authorsHtml = document.createDocumentFragment();
  const firstAuthorElement = document.createElement("option");
  firstAuthorElement.value = "any";
  firstAuthorElement.innerText = "All Authors";
  authorsHtml.appendChild(firstAuthorElement);

  for (const [id, name] of Object.entries(authors)) {
    const element = document.createElement("option");
    element.value = id;
    element.innerText = name;
    authorsHtml.appendChild(element);
  }

  document.querySelector("[data-search-authors]").appendChild(authorsHtml);
} // Search process

function loadTheme() {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.querySelector("[data-settings-theme]").value = "night";
    document.documentElement.style.setProperty("--color-dark", "255, 255, 255");
    document.documentElement.style.setProperty("--color-light", "10, 10, 20");
  } else {
    document.querySelector("[data-settings-theme]").value = "day";
    document.documentElement.style.setProperty("--color-dark", "10, 10, 20");
    document.documentElement.style.setProperty(
      "--color-light",
      "255, 255, 255"
    );
  }
} // Theme logic

function showMoreBtn() {
  const button = document.querySelector("[data-list-button]");
  const remainingBooks = matches.length - page * BOOKS_PER_PAGE;

  button.innerText = `Show more (${remainingBooks})`;
  button.disabled = remainingBooks <= 0;

  button.innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${
      remainingBooks > 0 ? remainingBooks : 0
    })</span>
  `;
} // Show more button logic

document.addEventListener("DOMContentLoaded", () => {
  renderBooks(matches); // Execute upon DOM load
  loadTheme(); // Execute upon DOM load
  showMoreBtn(); // Update the show more button
});

const eventListeners = {
  init() {
    this.attachEventListeners();
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
    searchBtn(genres, authors); // Needs to be implied once search icon is clicked
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
    for (const { author, id, image, title } of nextBooks) {
      const element = document.createElement("button");
      element.classList = "preview";
      element.setAttribute("data-preview", id);

      element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;

      fragment.appendChild(element);
    }

    document.querySelector("[data-list-items]").appendChild(fragment);
    page += 1;
    showMoreBtn(); // Update the button state after loading more books
  },

  showBookDetails(event) {
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    for (const node of pathArray) {
      if (active) break;

      if (node?.dataset?.preview) {
        let result = null;

        for (const singleBook of books) {
          if (result) break;
          if (singleBook.id === node?.dataset?.preview) result = singleBook;
        }

        active = result;
      }
    }

    if (active) {
      document.querySelector("[data-list-active]").open = true;
      document.querySelector("[data-list-blur]").src = active.image;
      document.querySelector("[data-list-image]").src = active.image;
      document.querySelector("[data-list-title]").innerText = active.title;
      document.querySelector("[data-list-subtitle]").innerText = `${
        authors[active.author]
      } (${new Date(active.published).getFullYear()})`;
      document.querySelector("[data-list-description]").innerText =
        active.description;
    }
  },

  handleSettingsSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);

    if (theme === "night") {
      document.documentElement.style.setProperty(
        "--color-dark",
        "255, 255, 255"
      );
      document.documentElement.style.setProperty("--color-light", "10, 10, 20");
    } else {
      document.documentElement.style.setProperty("--color-dark", "10, 10, 20");
      document.documentElement.style.setProperty(
        "--color-light",
        "255, 255, 255"
      );
    }

    document.querySelector("[data-settings-overlay]").open = false;
  },

  handleSearchSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = [];

    for (const book of books) {
      let genreMatch = filters.genre === "any";

      for (const singleGenre of book.genres) {
        if (genreMatch) break;
        if (singleGenre === filters.genre) {
          genreMatch = true;
        }
      }

      if (
        (filters.title.trim() === "" ||
          book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
        (filters.author === "any" || book.author === filters.author) &&
        genreMatch
      ) {
        result.push(book);
      }
    }

    page = 1;
    matches = result;

    if (result.length < 1) {
      document
        .querySelector("[data-list-message]")
        .classList.add("list__message_show");
    } else {
      document
        .querySelector("[data-list-message]")
        .classList.remove("list__message_show");
    }

    document.querySelector("[data-list-items]").innerHTML = "";
    const newItems = document.createDocumentFragment();

    for (const { author, id, image, title } of matches.slice(
      0,
      BOOKS_PER_PAGE
    )) {
      const element = document.createElement("button");
      element.classList = "preview";
      element.setAttribute("data-preview", id);

      element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
      `;
      newItems.appendChild(element);
    }

    document.querySelector("[data-list-items]").appendChild(newItems);
    showMoreBtn(); // Update the button state after search
  },
};

eventListeners.init();
