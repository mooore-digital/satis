/**
 * Display or hide packages
 * @class
 */
class PackageFilter {
  /**
   *
   * @param {string} searchField - The field that the user is typing text into
   * @param {string} itemContainer - The element containing all packages
   * @param {string} item - A single package
   * @param {string} filterBy - Specific field to search within, for each package
   * @param {string} ownPackagesOnly - The element containing checkbox for own packages only
   */
  constructor(searchField, itemContainer, item, filterBy, ownPackagesOnly) {
    // Elements
    this.searchField = document.querySelector(searchField);
    this.itemContainer = document.querySelector(itemContainer);
    this.filterBy = document.querySelector(filterBy);
    this.ownPackagesOnly = document.querySelector(ownPackagesOnly);
    this.allPackages = Array.prototype.slice.call(
      this.itemContainer.querySelectorAll(item)
    );

    // Vars
    this.inputTimeout = null;
    this.filterByValue = null;

    // Init
    if (
      this.searchField &&
      this.itemContainer &&
      this.filterBy &&
      this.allPackages.length
    ) {
      this.init();
    }
  }

  /**
   * Get the current page's hash and make that the current search term
   */
  readHash() {
    const hash = window.decodeURIComponent(window.location.hash.substr(1));
    if (hash.length > 0) {
      this.searchField.value = hash;
      this.filterPackages();
    }
  }

  /**
   * Update the page hash based on search field
   */
  updateHash() {
    window.location.hash = window.encodeURIComponent(this.searchField.value);
  }

  filterPackages() {
    const needle = this.searchField.value.toLowerCase();
    const own_packages_only = this.ownPackagesOnly.checked;

    // No input to filter by
    if (!needle.length && !own_packages_only) {
      this.allPackages.forEach((elem) => elem.classList.remove("d-none"));
      return;
    }

    this.itemContainer.classList.add("d-none");
    this.allPackages.forEach((elem) => {
      elem.classList.add("d-none");

      // Get content either from specific fields, or the whole package
      const filterableContent = this.filterByValue
        ? elem.querySelector(".field-" + this.filterByValue + ".filter-by")
            .textContent
        : elem.textContent;

      // Get the "own_packages_only" field
      let is_own = true;

      if (own_packages_only) {
        is_own = false;

        window.config.own_packages.forEach((packageName) => {
          if (
            elem
              .querySelector(".field-name")
              .textContent.trim()
              .split("/")[0]
              .toLowerCase()
              .indexOf(packageName) !== -1
          ) {
            is_own = true;
          }
        });
      }

      // Does the search term exist within the given content?
      const displayPackage =
        filterableContent.toLowerCase().indexOf(needle) !== -1;
      if (displayPackage && is_own) {
        elem.classList.remove("d-none");
      }
    });

    this.itemContainer.classList.remove("d-none");
  }

  /**
   * Update the current field to filter packages by
   * @param {InputEvent} event - User has changed a form control value
   * @listens InputEvent
   */
  handleFilterByChange(event) {
    this.filterByValue =
      event.target.value.length && "all" !== event.target.value
        ? event.target.value
        : null;
    if (this.searchField.value.length) {
      this.filterPackages();
    }
  }

  init() {
    this.filterBy.addEventListener("change", (event) =>
      this.handleFilterByChange(event)
    );
    this.ownPackagesOnly.addEventListener("click", (event) => {
      this.filterPackages();
    });
    this.searchField.addEventListener("search", () => {
      if (!this.searchField.value) {
        this.updateHash();
        this.filterPackages();
      }
    });
    this.searchField.addEventListener("keyup", () => {
      this.updateHash();
      window.clearTimeout(this.inputTimeout);
      this.inputTimeout = window.setTimeout(
        this.filterPackages.bind(this),
        350
      );
    });
    document.addEventListener("keyup", (event) => {
      // Keep `keyCode` until IE11 support is dropped
      if ((event.code && event.code === "Escape") || event.keyCode === 27) {
        this.searchField.value = "";
        this.updateHash();
        this.filterPackages();
      }
    });

    this.handleFilterByChange({ target: this.filterBy });
    this.readHash();
  }
}

export default PackageFilter;
