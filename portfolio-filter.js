;(function () {
    if (document.readyState == "complete" || document.readyState == "loaded" || document.readyState == "interactive") {
        ready();
    } else {
        window.addEventListener('DOMContentLoaded', ready);
    }

    function ready() {
        // make a index of portfolio-items by the category
        const categoryState = new Map();
        const portfolioItems = Array.from(document.querySelectorAll('#portfolio article'));
        for (const item of portfolioItems) {
            for (const category of item.dataset.categories.split(' ')) {
                if (!categoryState.has(category)) {
                    categoryState.set(category, {
                        enabled: false,
                        button: null
                    });
                }
            }
        }

        // Create dynamic content
        const content = document.createDocumentFragment();

        const ul = document.createElement('ul');
        for (const category of Array.from(categoryState.keys()).sort()) {
            const li = document.createElement('li');
            li.appendChild(document.createTextNode(category.replace('_', ' ')));
            li.addEventListener('click', function () {
                categoryState.get(category).enabled = !categoryState.get(category).enabled;
                update();
            });
            categoryState.get(category).button = li;
            ul.appendChild(li);
        }
        content.appendChild(ul);

        document.getElementById('filter').appendChild(content);

        // Handle clicking on filter
        function update() {
            // Toggle filter buttons
            let enabledCategories = new Set();
            for (const [name, { enabled, button }] of categoryState.entries()) {
                if (enabled) enabledCategories.add(name);
                button.classList.toggle('filter-enabled', enabled);
            }

            // Hide items that are filtered out
            for (const item of portfolioItems) {
                let showItem = enabledCategories.size === 0;
                for (const category of item.dataset.categories.split(' ')) {
                    if (enabledCategories.has(category)) showItem = true;
                }

                item.classList.toggle('hidden', !showItem);
            }
        }
    }
})();