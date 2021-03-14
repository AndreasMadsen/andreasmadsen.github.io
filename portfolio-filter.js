;(function () {
    if (document.readyState == "complete" || document.readyState == "loaded" || document.readyState == "interactive") {
        setTimeout(ready, 0);
    } else {
        window.addEventListener('DOMContentLoaded', ready);
    }

    class PortfolioItem {
        constructor(element) {
            this.element = element;
            this.hidden = false;
            this.categories = new Set(element.dataset.categories.split(' '));
        }

        hasCategoryEnabled(categories) {
            let enabled = false;
            for (const category of this.categories.values()) {
                enabled = enabled || categories.get(category).enabled;
            }
            return enabled;
        }

        setHidden(hidden) {
            this.hidden = hidden;
        }

        draw() {
            this.element.classList.toggle('hidden', !this.hidden);
        }
    }

    class PortfolioCategory {
        constructor(name, onclick) {
            this.name = name;
            this.enabled = false;

            this.element = document.createElement('li');
            this.element.append(name.replace('_', ' '));
            this.element.addEventListener('click', () => onclick(this));
        }

        setEnabled(enabled) {
            this.enabled = enabled;
        }

        toggle() {
            this.enabled = !this.enabled;
        }

        draw() {
            this.element.classList.toggle('filter-enabled', this.enabled);
        }
    }

    class ProtofolioFilter {
        constructor() {
            this.categories = new Map();
            this.items = [];
        }

        loadItems(elements) {
            for (const element of elements) {
                this.items.push(new PortfolioItem(element));
            }

            for (const item of this.items) {
                for (const category of item.categories) {
                    if (!this.categories.has(category)) {
                        this.categories.set(category, new PortfolioCategory(category, this.onCategorySelected.bind(this)));
                    }
                }
            }
        }

        initButtons() {
            // Create dynamic content
            const ul = document.createElement('ul');

            const categories = Array.from(this.categories.values())
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((a) => a.element);

            ul.append.apply(ul, categories);
            document.getElementById('filter').append(ul);
        }

        onCategorySelected(category) {
            category.toggle();
            this.updateLocationHash();
            this.updateItemState();
            this.draw();
        }

        updateLocationHash() {
            const enabledCategories = Array.from(this.categories.values())
            .sort((a, b) => a.name.localeCompare(b.name))
            .filter((a) => a.enabled)
            .map((a) => a.name);

            window.history.replaceState(null,null,'#!/' + enabledCategories.join('/'));
        }

        updateItemState() {
            // If no category is enabled, show all
            let anyEnabled = false;
            for (const category of this.categories.values()) {
                anyEnabled = anyEnabled || category.enabled;
            }
            for (const item of this.items) {
                item.setHidden(!anyEnabled || item.hasCategoryEnabled(this.categories));
            }
        }

        stateFromHash(hash) {
            const enabledCategories = new Set();
            if (hash.slice(0, 2) == '#!') {
                for(const category of hash.split('/').slice(1).filter((category) => this.categories.has(category))) {
                    enabledCategories.add(category);
                }
            }

            for (const category of this.categories.values()) {
                category.setEnabled(enabledCategories.has(category.name));
            }

            this.updateItemState();
        }

        draw() {
            for (const category of this.categories.values()) {
                category.draw();
            }
            for (const item of this.items) {
                item.draw();
            }
        }
    }

    function ready() {
        const filter = new ProtofolioFilter();
        filter.loadItems(document.querySelectorAll('#portfolio article'));
        filter.initButtons();
        filter.stateFromHash(window.location.hash);
        filter.draw();

        window.addEventListener('hashchange', function () {
            filter.stateFromHash(window.location.hash);
            filter.draw();

            // Hack to not include the profile description and contact in print
            document.documentElement.classList.toggle('no-profile', window.location.hash.includes('/no-profile/'));
        });

        // Hack to not include the profile description and contact in print
        document.documentElement.classList.toggle('no-profile', window.location.hash.includes('/no-profile/'));
    }
})();
