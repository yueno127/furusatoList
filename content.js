function getPrice() {
    // 現在のページのURLを取得
    let url = window.location.href;
    let price = "0"; // 初期値を設定
    
    // URLに基づいて異なるサイトごとに価格情報の取得ロジックを分岐
    if (url.includes("https://www.satofull.jp/products/")) {
        //さとふる
        const priceElement = document.querySelector('.V1808-dMain__amount__num');
        if (priceElement) price = priceElement.textContent;
    } else if (url.includes("https://www.furusato-tax.jp/product/detail/")) {
        //ふるさとチョイス
        const priceElement = document.querySelector('.basicinfo_price');
        if (priceElement) price = priceElement.textContent;
    } else if (url.includes("https://furunavi.jp/product_detail")) {
        //ふるなび
        const priceElement = document.querySelector('.product-info-price');
        if (priceElement) price = priceElement.textContent;
    } else if (url.includes("https://item.rakuten.co.jp/f")){
        //楽天ふるさと納税
        const priceElement = document.querySelector('.value--3Z7Nj');
        if (priceElement) price = priceElement.textContent;
    }
    // 数値以外を削除
    price = price.replace(/[^0-9]/g, '');

    return price;
}


// リクエストをリッスンし、価格情報をpopup.jsに送信
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "getPrice") {
            let price = getPrice();
            sendResponse({price: price});
        }
    }
);