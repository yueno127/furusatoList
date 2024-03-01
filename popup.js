document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.getElementById('add-page');
    const resetButton = document.getElementById('reset-list');
    const list = document.getElementById('shopping-list').getElementsByTagName('tbody')[0];
    const openAllButton = document.getElementById('open-all');

    // ストレージからリストを復元
    chrome.storage.sync.get(['shoppingList'], function(result) {
        const shoppingList = result.shoppingList || [];
        shoppingList.forEach(item => {
            addTableRow(item.title, item.url, item.price);
        });
        update();
    });

    // 「現在のページを追加」ボタンの処理
    addButton.addEventListener('click', function() {
        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabs) {
            const tab = tabs[0];
            // content.jsにメッセージを送信して価格情報を取得
            chrome.tabs.sendMessage(tab.id, {action: "getPrice"}, function(response) {
                var price = "0";
                if (!chrome.runtime.lastError) {
                    price = response ? response.price : "0";
                }
                addTableRow(tab.title, tab.url, price);
                update();
            });
        });
    });

    // 「リセット」ボタンの処理
    resetButton.addEventListener('click', function() {
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }
        update(); // ストレージと合計金額を更新
    });

    // 「新しいタブですべて開く」ボタンの処理
    openAllButton.addEventListener('click', function() {
        chrome.storage.sync.get(['shoppingList'], function(result) {
            const shoppingList = result.shoppingList || [];
            if (shoppingList.length > 0) {
                // URLでソート
                const sortedList = shoppingList.sort((a, b) => a.url.localeCompare(b.url));
                // 新しいタブで全て開く
                sortedList.forEach(item => {
                    chrome.tabs.create({ url: item.url });
                });
            }
        });
    });

    function addTableRow(title, url, price) {
        // 行の追加
        const row = list.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2);

        // 品名の設定
        cell1.innerHTML = `<a href="${url}" target="_blank"><span>${title}</span></a>`;
        cell2.contentEditable = "true";

        // 値段の設定
        cell2.textContent = price;

        // ×ボタン
        cell3.innerHTML = `<span class="remove-item">×</span>`;

        // 各種イベントリスナーを追加
        cell2.addEventListener('input', () => update());
        cell2.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // イベントのデフォルト動作をキャンセル
                cell2.blur(); // 編集を終了し、フォーカスを外す
                update();
            }
        });
        cell3.querySelector('.remove-item').addEventListener('click', function() {
            this.parentElement.parentElement.remove();
            update();
        });
    }

    // 合計とストレージを更新する関数
    function update() {
        updateTotalPrice();
        updateShoppingList();
    }

    function updateTotalPrice() {
        const prices = document.querySelectorAll('#shopping-list tbody tr td:nth-child(2)');
        let total = 0;
        prices.forEach(price => {
            total += parseFloat(price.textContent) || 0;
        });
        total = new Intl.NumberFormat('ja-JP').format(total);
        document.getElementById('total-price').textContent = `合計: ${total}円`;
    }

    function updateShoppingList() {
        const rows = document.querySelectorAll('#shopping-list tbody tr');
        const shoppingList = Array.from(rows).map(row => {
            const cells = row.cells;
            return {
                title: cells[0].textContent.trim(),
                url: cells[0].querySelector('a').href,
                price: cells[1].textContent.trim()
            };
        });
        chrome.storage.sync.set({'shoppingList': shoppingList});
    }
});