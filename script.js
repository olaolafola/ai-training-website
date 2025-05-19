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
            
            // グローバル変数として保存
            window.allCasesData = data.cases;
            
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
    function setupFeaturedCase(caseData, scrollToView = false) {
        const featuredCaseContainer = document.getElementById('featured-case-container');
        if (!featuredCaseContainer) {
            console.error('featured-case-containerが見つかりません');
            return;
        }
        
        // HTML生成（動画対応版）
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
                        
                        <!-- サムネイル画像または動画 -->
                        <div class="thumbnail-area mb-4">
                            <video controls class="w-full">
                                <source src="${caseData.video}" type="video/mp4">
                                <img src="${caseData.thumbnail}" alt="${caseData.title}" class="w-full">
                            </video>
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
                        
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <p class="text-sm text-blue-800">
                                <i class="fas fa-info-circle mr-1"></i>
                                背景: ${caseData.background.substring(0, 200)}...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // HTMLをコンテナに挿入
        featuredCaseContainer.innerHTML = featuredHTML;
        
        // スクロールが必要な場合は注目事例までスクロール
        if (scrollToView) {
            featuredCaseContainer.scrollIntoView({ behavior: 'smooth' });
        }
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
                <div class="case-card" data-id="${caseData.id}" data-category="${caseData.category}" data-tags="${caseData.tags.join(',')}">
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
                    </div>
                </div>
            `;
            
            caseContainer.innerHTML += caseCardHTML;
        });
        
        // カードのクリックイベントを設定
        document.querySelectorAll('.case-card').forEach(card => {
            card.addEventListener('click', function() {
                const caseId = this.getAttribute('data-id');
                const selectedCase = window.allCasesData.find(c => c.id === caseId);
                
                if (selectedCase) {
                    // 選択された事例で注目事例エリアを更新し、そこにスクロール
                    setupFeaturedCase(selectedCase, true);
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
                
                // 選択されたカテゴリーとタグでフィルター適用
                applyFilters();
            });
        });
        
        // タグフィルターのクリックイベント
        tagFilters.forEach(filter => {
            filter.addEventListener('click', function() {
                // アクティブなフィルターのスタイルを変更
                tagFilters.forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                
                // 選択されたカテゴリーとタグでフィルター適用
                applyFilters();
            });
        });
    }
    
    // フィルターを適用する関数
    function applyFilters() {
        // 現在選択されているカテゴリーとタグを取得
        const selectedCategory = document.querySelector('.category-tab.active').getAttribute('data-category');
        const selectedTag = document.querySelector('.tag-filter.active').getAttribute('data-tag');
        
        console.log('フィルター適用:', selectedCategory, selectedTag);
        
        // オリジナルデータから該当するデータだけをフィルタリング
        const filteredData = window.allCasesData.filter(caseData => {
            const matchCategory = selectedCategory === 'all' || caseData.category === selectedCategory;
            const matchTag = selectedTag === 'all' || caseData.tags.includes(selectedTag);
            return matchCategory && matchTag;
        });
        
        console.log('フィルター後のデータ数:', filteredData.length);
        
        // フィルター結果を表示
        if (filteredData.length > 0) {
            setupCaseCards(filteredData);
        } else {
            // 結果がない場合はメッセージを表示
            const caseContainer = document.getElementById('case-container');
            if (caseContainer) {
                caseContainer.innerHTML = `
                    <div class="col-span-full text-center py-8 text-gray-500">
                        <p>選択された条件に一致する事例はありません。</p>
                        <p>別のフィルター条件をお試しください。</p>
                    </div>
                `;
            }
        }
    }
});