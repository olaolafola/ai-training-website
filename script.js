document.addEventListener('DOMContentLoaded', function() {
    // 事例データを読み込む
    fetch('./cases.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('読み込まれたデータ:', data); // データが正しく読み込まれるか確認
            // 注目事例をセットアップ（featuredプロパティがtrueのもの、または最初の事例）
            const featuredCase = data.cases.find(c => c.featured) || data.cases[0];
            setupFeaturedCase(featuredCase);
            
            // 全ての事例カードを生成
            setupCaseCards(data.cases);
            
            // フィルター機能を初期化
            initializeFilters();
        })
        .catch(error => {
            console.error('事例データの読み込みに失敗しました:', error);
        });
    
    // 注目事例をセットアップする関数
    function setupFeaturedCase(caseData) {
        const featuredCaseContainer = document.getElementById('featured-case-container');
        if (!featuredCaseContainer) {
            console.error('featured-case-containerが見つかりません');
            return;
        }
        
        // HTML生成
        const featuredHTML = `
            <div class="featured-case">
                <div class="flex flex-col md:flex-row">
                    <!-- 左側：事例概要 -->
                    <div class="p-6 md:w-1/3 featured-case-left">
                        <div class="text-sm text-blue-700 mb-2">${caseData.category}</div>
                        <h2 class="text-2xl font-bold mb-4">${caseData.title}</h2>
                        
                        <div class="flex flex-wrap mb-4">
                            ${caseData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        
                        <!-- サムネイル画像 -->
                        <div class="thumbnail-area mb-4">
                            <img src="${caseData.thumbnail}" alt="${caseData.title}" class="w-full">
                        </div>
                        
                        <div class="mt-4 flex flex-wrap">
                            <div class="badge mr-2 mb-2">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                時間削減 ${caseData.reduction}
                            </div>
                            ${caseData.yearlyReduction ? `
                            <div class="badge mb-2">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                ${caseData.yearlyReduction}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- 右側：詳細内容 -->
                    <div class="p-6 md:w-2/3">
                        <h3 class="font-bold mb-4">実施内容</h3>
                        <p class="text-gray-700 mb-6">
                            ${caseData.implementation}
                        </p>
                        
                        <h3 class="font-bold mb-2">導入効果</h3>
                        <ul class="list-disc pl-5 mb-4">
                            ${caseData.effects.map(effect => `<li class="mb-1">${effect}</li>`).join('')}
                        </ul>
                        
                        <div class="text-right">
                            <a href="detail-${caseData.id}.html" class="detail-link">
                                詳細を見る
                                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // HTMLをコンテナに挿入
        featuredCaseContainer.innerHTML = featuredHTML;
    }
    
    // 事例カードをセットアップする関数
    function setupCaseCards(casesData) {
        const caseContainer = document.getElementById('case-container');
        if (!caseContainer) {
            console.error('case-containerが見つかりません');
            return;
        }
        console.log('事例データ数:', casesData.length); // データ数のチェック
        
        // コンテナをクリア
        caseContainer.innerHTML = '';
        
        // 各事例のHTMLを生成して追加
        casesData.forEach(caseData => {
            const caseCardHTML = `
                <div class="case-card" data-category="${caseData.category}" data-tags="${caseData.tags.join(',')}">
                    <div class="p-4">
                        <div class="text-sm text-blue-700 mb-2">${caseData.category}</div>
                        <h3 class="text-lg font-bold mb-2">${caseData.title}</h3>
                        
                        <div class="flex flex-wrap mb-3">
                            ${caseData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        
                        <!-- サムネイル画像 -->
                        <div class="thumbnail-area mb-3">
                            <img src="${caseData.thumbnail}" alt="${caseData.title}" class="w-full">
                        </div>
                        
                        <div class="mb-3">
                            <div class="badge">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                時間削減 ${caseData.reduction}
                            </div>
                        </div>
                        
                        <a href="detail-${caseData.id}.html" class="detail-link">
                            詳細を見る
                            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </a>
                    </div>
                </div>
            `;
            
            caseContainer.innerHTML += caseCardHTML;
        });
        
        // カードのクリックイベントを設定
        document.querySelectorAll('.case-card').forEach(card => {
            card.addEventListener('click', function(e) {
                const detailLink = this.querySelector('.detail-link');
                if (e.target !== detailLink && !detailLink.contains(e.target)) {
                    detailLink.click();
                }
            });
        });
    }
    
    // フィルタリング機能を初期化する関数
    function initializeFilters() {
        const categoryTabs = document.querySelectorAll('.category-tab');
        const tagFilters = document.querySelectorAll('.tag-filter');
        
        // カテゴリータブのクリックイベント
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // アクティブなタブのスタイルを変更
                categoryTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // 選択されたカテゴリーを取得
                const selectedCategory = this.getAttribute('data-category');
                
                // 現在アクティブなタグを取得
                const activeTag = document.querySelector('.tag-filter.active').getAttribute('data-tag');
                
                // カードをフィルタリング
                filterCards(selectedCategory, activeTag);
            });
        });
        
        // タグフィルターのクリックイベント
        tagFilters.forEach(filter => {
            filter.addEventListener('click', function() {
                // アクティブなフィルターのスタイルを変更
                tagFilters.forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                
                // 選択されたタグを取得
                const selectedTag = this.getAttribute('data-tag');
                
                // 現在アクティブなカテゴリーを取得
                const activeCategory = document.querySelector('.category-tab.active').getAttribute('data-category');
                
                // カードをフィルタリング
                filterCards(activeCategory, selectedTag);
            });
        });
    }
    
    // カードのフィルタリング関数
    function filterCards(category, tag) {
        console.log('フィルター実行:', category, tag);
        const caseCards = document.querySelectorAll('.case-card');
        console.log('事例カード数:', caseCards.length);
        
        caseCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const cardTags = card.getAttribute('data-tags');
            
            // カテゴリーとタグの条件を確認
            const matchCategory = category === 'all' || cardCategory === category;
            const matchTag = tag === 'all' || cardTags.includes(tag);
            
            // カードの表示/非表示を切り替え
            if (matchCategory && matchTag) {
                card.classList.remove('hidden-case');
            } else {
                card.classList.add('hidden-case');
            }
        });
    }
});