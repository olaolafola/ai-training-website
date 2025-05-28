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
            
            // その他フィルターのトグル機能を初期化
            initializeOthersToggle();
        })
        .catch(error => {
            console.error('事例データの読み込みに失敗しました:', error);
        });
    
    // 注目事例をセットアップする関数
    function setupFeaturedCase(caseData, scrollToView = false, isUserSelected = false) {
        const featuredCaseContainer = document.getElementById('featured-case-container');
        const featuredCaseTitle = document.getElementById('featured-case-title');
        
        if (!featuredCaseContainer) {
            console.error('featured-case-containerが見つかりません');
            return;
        }
        
        // ユーザーが選択した場合は見出しを非表示
        if (isUserSelected && featuredCaseTitle) {
            featuredCaseTitle.style.display = 'none';
        } else if (!isUserSelected && featuredCaseTitle) {
            featuredCaseTitle.style.display = 'block';
        }
        
        // HTML生成（動画対応版）- 左右比率を2:3（40%:60%）に修正
        const featuredHTML = `
            <div class="featured-case">
                <div class="flex flex-col md:flex-row">
                    <!-- 左側：事例概要 -->
                    <div class="p-4 md:p-6 md:w-2/5 w-full featured-case-left">
                        <div class="category-level-container">
                            <div class="text-sm text-blue-700">${caseData.category}</div>
                            <div class="level-badge level-${caseData.level}">${caseData.level}</div>
                        </div>
                        <h2 class="text-2xl font-bold mb-4">${caseData.title}</h2>
                        
                        <div class="flex flex-wrap mb-4">
                            ${caseData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        
                        <!-- 動画と再生状況バー -->
                        <div class="thumbnail-area featured-thumbnail mb-4">
                            <video id="featured-video" controls class="w-full">
                                <source src="${caseData.video}" type="video/mp4">
                                <img src="${caseData.thumbnail}" alt="${caseData.title}" class="w-full">
                            </video>
                            <!-- 動画再生状況バー -->
                            <div class="video-progress mt-2 bg-gray-200 rounded-full h-1.5">
                                <div class="video-progress-bar bg-blue-500 h-1.5 rounded-full w-0"></div>
                            </div>
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
                    
                    <!-- 右側：詳細内容 - 比率変更で60%に -->
                    <div class="p-4 md:p-6 md:w-3/5 w-full">
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
        
        // 動画の再生状況を追跡
        const video = document.getElementById('featured-video');
        const progressBar = document.querySelector('.video-progress-bar');
        
        if (video && progressBar) {
            video.addEventListener('timeupdate', function() {
                const percentage = (video.currentTime / video.duration) * 100;
                progressBar.style.width = percentage + '%';
            });
        }
        
        // 関連事例を表示
        showRelatedCases(caseData);
        
        // 現在の注目事例を記録（フィルター時に参照するため）
        window.currentFeaturedCase = caseData;
        
        // スクロールが必要な場合は注目事例までスクロール
        if (scrollToView) {
            featuredCaseContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // 関連事例を表示する関数
    function showRelatedCases(currentCase) {
        const relatedSection = document.getElementById('related-cases-section');
        const relatedContainer = document.getElementById('related-cases-container');
        
        if (!relatedSection || !relatedContainer) return;
        
        // 現在のフィルター設定を取得
        const selectedCategory = document.querySelector('.category-tab.active').getAttribute('data-category');
        const activeTagFilter = document.querySelector('.tag-filter.active:not(.toggle-others)');
        const selectedTag = activeTagFilter ? activeTagFilter.getAttribute('data-tag') : 'all';
        const activeLevel = document.querySelector('.level-filter.active');
        const selectedLevel = activeLevel ? activeLevel.getAttribute('data-level') : null;
        
        // 関連事例を算出（複合的な関連度算出）
        let relatedCases = window.allCasesData
            .filter(caseData => caseData.id !== currentCase.id) // 現在の事例を除外
            .map(caseData => {
                let score = 0;
                
                // 同じカテゴリー +3点
                if (currentCase.category === caseData.category) score += 3;
                
                // 共通タグ 1つにつき+1点
                const commonTags = currentCase.tags.filter(tag => 
                    caseData.tags.includes(tag)
                );
                score += commonTags.length;
                
                // 同じ難易度 +1点
                if (currentCase.level === caseData.level) score += 1;
                
                return { ...caseData, relatedScore: score };
            })
            .filter(caseData => caseData.relatedScore > 0) // 関連度0は除外
            .sort((a, b) => b.relatedScore - a.relatedScore); // 関連度順でソート
        
        // フィルターを適用
        relatedCases = relatedCases.filter(caseData => {
            const matchCategory = selectedCategory === 'all' || caseData.category === selectedCategory;
            const matchTag = selectedTag === 'all' || caseData.tags.includes(selectedTag);
            const matchLevel = !selectedLevel || caseData.level === selectedLevel;
            return matchCategory && matchTag && matchLevel;
        });
        
        // 上位3件まで
        relatedCases = relatedCases.slice(0, 3);
        
        if (relatedCases.length > 0) {
            // 関連事例のHTMLを生成
            relatedContainer.innerHTML = relatedCases.map(caseData => `
                <div class="case-card related-case-card" data-id="${caseData.id}" data-category="${caseData.category}" data-tags="${caseData.tags.join(',')}" data-level="${caseData.level}">
                    <div class="p-4">
                        <div class="category-level-container">
                            <div class="text-sm text-blue-700">${caseData.category}</div>
                            <div class="level-badge level-${caseData.level}">${caseData.level}</div>
                        </div>
                        <h3 class="text-lg font-bold mb-2">${caseData.title}</h3>
                        
                        <div class="flex flex-wrap mb-3">
                            ${caseData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        
                        <!-- サムネイル画像の代わりに時間削減情報を表示 - 上下に並べる -->
                        <div class="time-info mb-3">
                            <div class="text-sm text-gray-600 mb-1">${caseData.beforeText}: <span class="font-bold">${caseData.beforeTime}</span></div>
                            <div class="text-center mb-1">↓</div>
                            <div class="text-sm text-blue-600">${caseData.afterText}: <span class="font-bold">${caseData.afterTime}</span></div>
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
            `).join('');
            
            // 関連事例カードのクリックイベントを設定
            relatedContainer.querySelectorAll('.related-case-card').forEach(card => {
                card.addEventListener('click', function() {
                    const caseId = this.getAttribute('data-id');
                    const selectedCase = window.allCasesData.find(c => c.id === caseId);
                    
                    if (selectedCase) {
                        // 選択された事例で注目事例エリアを更新し、そこにスクロール
                        setupFeaturedCase(selectedCase, true, true);
                    }
                });
            });
            
            // 関連事例セクションを表示
            relatedSection.classList.remove('hidden');
        } else {
            // 関連事例がない場合は非表示
            relatedSection.classList.add('hidden');
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
                <div class="case-card" data-id="${caseData.id}" data-category="${caseData.category}" data-tags="${caseData.tags.join(',')}" data-level="${caseData.level}">
                    <div class="p-4">
                        <div class="category-level-container">
                            <div class="text-sm text-blue-700">${caseData.category}</div>
                            <div class="level-badge level-${caseData.level}">${caseData.level}</div>
                        </div>
                        <h3 class="text-lg font-bold mb-2">${caseData.title}</h3>
                        
                        <div class="flex flex-wrap mb-3">
                            ${caseData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        
                        <!-- サムネイル画像の代わりに時間削減情報を表示 - 上下に並べる -->
                        <div class="time-info mb-3">
                            <div class="text-sm text-gray-600 mb-1">${caseData.beforeText}: <span class="font-bold">${caseData.beforeTime}</span></div>
                            <div class="text-center mb-1">↓</div>
                            <div class="text-sm text-blue-600">${caseData.afterText}: <span class="font-bold">${caseData.afterTime}</span></div>
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
    
    // その他フィルターのトグル機能を初期化
    function initializeOthersToggle() {
        const toggleButton = document.getElementById('toggle-others');
        const otherFilters = document.getElementById('other-filters');
        
        if (!toggleButton || !otherFilters) return;
        
        toggleButton.addEventListener('click', function() {
            if (otherFilters.classList.contains('hidden')) {
                // 展開
                otherFilters.classList.remove('hidden');
                toggleButton.textContent = '×';
            } else {
                // 折りたたみ
                otherFilters.classList.add('hidden');
                toggleButton.textContent = '…';
                
                // その他フィルターが選択されている場合は「すべて」に戻す
                const activeOtherFilter = otherFilters.querySelector('.tag-filter.active');
                if (activeOtherFilter) {
                    // 全てのタグフィルターを非アクティブに
                    document.querySelectorAll('.tag-filter').forEach(f => f.classList.remove('active'));
                    // 「すべて」をアクティブに
                    document.querySelector('.tag-filter[data-tag="all"]').classList.add('active');
                    // フィルター適用
                    applyFilters();
                }
            }
        });
    }
    
    // フィルタリング機能を初期化する関数
    function initializeFilters() {
        const categoryTabs = document.querySelectorAll('.category-tab');
        const tagFilters = document.querySelectorAll('.tag-filter');
        const levelFilters = document.querySelectorAll('.level-filter');
        
        // カテゴリータブのクリックイベント
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // アクティブなタブのスタイルを変更
                categoryTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // フィルター適用
                applyFilters();
            });
        });
        
        // タグフィルターのクリックイベント
        tagFilters.forEach(filter => {
            filter.addEventListener('click', function() {
                // トグルボタンは除外
                if (this.classList.contains('toggle-others')) return;
                
                // アクティブなフィルターのスタイルを変更
                tagFilters.forEach(f => {
                    if (!f.classList.contains('toggle-others')) {
                        f.classList.remove('active');
                    }
                });
                this.classList.add('active');
                
                // フィルター適用
                applyFilters();
            });
        });
        
        // レベルフィルターのクリックイベント
        levelFilters.forEach(filter => {
            filter.addEventListener('click', function() {
                // すでにアクティブなら非アクティブにする（トグル動作）
                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                } else {
                    // それ以外なら他のレベルフィルターを非アクティブにして、これをアクティブに
                    levelFilters.forEach(f => f.classList.remove('active'));
                    this.classList.add('active');
                }
                
                // フィルター適用
                applyFilters();
            });
        });
    }
    
    // フィルターを適用する関数
    function applyFilters() {
        // 現在選択されているカテゴリー、タグ、レベルを取得
        const selectedCategory = document.querySelector('.category-tab.active').getAttribute('data-category');
        const activeTagFilter = document.querySelector('.tag-filter.active:not(.toggle-others)');
        const selectedTag = activeTagFilter ? activeTagFilter.getAttribute('data-tag') : 'all';
        const activeLevel = document.querySelector('.level-filter.active');
        const selectedLevel = activeLevel ? activeLevel.getAttribute('data-level') : null;
        
        console.log('フィルター適用:', selectedCategory, selectedTag, selectedLevel);
        
        // フィルターが「すべて」以外の場合は注目事例セクションを非表示
        const featuredCaseContainer = document.getElementById('featured-case-container');
        const featuredCaseTitle = document.getElementById('featured-case-title');
        
        const isFiltered = selectedCategory !== 'all' || selectedTag !== 'all' || selectedLevel !== null;
        
        if (isFiltered) {
            // フィルター選択時は注目事例セクションを非表示
            if (featuredCaseContainer) featuredCaseContainer.style.display = 'none';
            if (featuredCaseTitle) featuredCaseTitle.style.display = 'none';
        } else {
            // 「すべて」の場合は注目事例セクションを表示
            if (featuredCaseContainer) featuredCaseContainer.style.display = 'block';
            if (featuredCaseTitle) featuredCaseTitle.style.display = 'block';
        }
        
        // オリジナルデータから該当するデータだけをフィルタリング
        const filteredData = window.allCasesData.filter(caseData => {
            const matchCategory = selectedCategory === 'all' || caseData.category === selectedCategory;
            const matchTag = selectedTag === 'all' || caseData.tags.includes(selectedTag);
            const matchLevel = !selectedLevel || caseData.level === selectedLevel;
            return matchCategory && matchTag && matchLevel;
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
        
        // 関連事例も現在のフィルターに従って更新（フィルター選択時は非表示）
        const relatedSection = document.getElementById('related-cases-section');
        if (isFiltered) {
            if (relatedSection) relatedSection.classList.add('hidden');
        } else if (relatedSection && window.currentFeaturedCase) {
            showRelatedCases(window.currentFeaturedCase);
        }
    }
});