// ==UserScript==
// @name         Icon Tagger for A1111 UI
// @namespace    http://tampermonkey.net/
// @version      3.2 - Surgical Removal Method
// @description  Finds emojis/text, removes the emoji, and tags the parent for CSS to style as an icon.
// @author       You
// @match        http://127.0.0.1:7860/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const iconMap = {
        '↙️': 'book-open',
        '🎲': 'dice-6',
        '♻️': 'refresh-cw',
        '📂': 'folder',
        '⚙️': 'settings',
        '🔍': 'search',
        '💾': 'save',
        '🗑️': 'trash-2',
        '📋': 'clipboard',
        '🔄': 'refresh-cw',
        '🎯': 'target',
        '🗃️': 'folder-archive',
        '📎': 'cpu',
        '📦': 'diameter',
        '🖌️': 'brush',
        '🎨️': 'palette',
        '📐': 'bomb',
        '🛈': 'info',
        '🛠': 'wrench',
        '⎘': 'copy',
        'Generate': 'play',
        'INTERRUPT': 'paperclip',
        'SKIP': 'skip-forward',
        '🖼️': 'image',
        '✨': 'flame'
    };

    function tagElementsForIcons() {
        const elements = document.querySelectorAll('button, .button, a, .tab-nav button, .label-wrap, [role="button"]');
        const textToKeep = ['Generate', 'INTERRUPT', 'SKIP'];

        elements.forEach(el => {
            if (el.dataset.iconTagged) return;

            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
            const nodesToRemove = [];
            let modified = false;

            let node;
            while (node = walker.nextNode()) {
                const text = node.nodeValue;
                for (const key in iconMap) {
                    if (text.normalize().includes(key.normalize())) {
                        console.log(`✅ Match Found! Key: "${key}", Element:`, el);
                        
                        el.dataset.iconName = iconMap[key];
                        el.classList.add('has-icon');

                        if (textToKeep.includes(key)) {
                            el.classList.add('icon-with-text');
                        } else {
                            // THE FIX: Instead of adding a class, we'll remove the emoji node.
                            nodesToRemove.push(node);
                        }
                        
                        modified = true;
                        break; 
                    }
                }
                if(modified) break;
            }
            
            if (modified) {
                // Remove the collected emoji nodes
                nodesToRemove.forEach(n => n.parentNode.removeChild(n));
                el.dataset.iconTagged = 'true';
            }
        });
    }

    function initializeScript() {
        console.log("🚀 Initializing icon tagging script.");
        tagElementsForIcons();

        const onUiUpdate = () => tagElementsForIcons();

        if (typeof window.onUiUpdate === 'function') {
            const original = window.onUiUpdate;
            window.onUiUpdate = function() { original.apply(this, arguments); onUiUpdate(); };
        } else {
            window.onUiUpdate = onUiUpdate;
        }

        const observer = new MutationObserver(() => {
            clearTimeout(observer.debounce);
            observer.debounce = setTimeout(tagElementsForIcons, 200);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    document.addEventListener('DOMContentLoaded', initializeScript);
})();