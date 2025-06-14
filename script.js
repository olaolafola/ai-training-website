document.addEventListener('DOMContentLoaded', function() {
    // カテゴリー短縮マッピング
    function shortenCategory(category) {
        const categoryMap = {
            '営業・提案': '営業',
            '経営・データ分析': '経営',
            '会議・コミュニケーション': '会議',
            '人事・研修': '人事'
        };
        return categoryMap[category] || category;
    }
    
    function formatCategories(categories) {
        const categoryArray = Array.isArray(categories) ? categories : [categories];
        return categoryArray.map(cat => shortenCategory(cat)).join(' / ');
    }
    
    // {リンクテキスト:URL}形式を青いリンクに変換する関数
    function convertLinksInText(text) {
        // {テキスト:URL}形式の場合はテキストをリンクにし、URLを小さく表示
        return text.replace(/\{([^:]+):([^}]+)\}/g, '<a href="$2" target="_blank" class="inline-link">$1</a> <span class="url-display">($2)</span>')
                   // {URL}形式の場合はURLをそのまま表示
                   .replace(/\{([^:}]+)\}/g, '<a href="$1" target="_blank" class="inline-link">$1</a>')
                   .replace(/\n/g, '<br>');
    }
    updateNavPosition();
    window.addEventListener('resize', updateNavPosition);
    
    fetch('./cases.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            window.allCasesData = data.cases;
            
            const featuredCase = data.cases.find(c => c.featured) || data.cases[0];
            console.log('Featured case found:', featuredCase.title); // デバッグログ
            setupFeaturedCase(featuredCase);
            
            setupCaseCards(data.cases);
            initializeFilters();
            initializeOthersToggle();
        })
        .catch(error => {
            console.error('事例データの読み込みに失敗しました:', error);
        });
    
    function setupFeaturedCase(caseData, scrollToView = false, isUserSelected = false) {
        const featuredCaseContainer = document.getElementById('featured-case-container');
        const featuredCaseTitle = document.getElementById('featured-case-title');
        
        console.log('Setting up featured case:', caseData.title); // デバッグログ
        
        if (!featuredCaseContainer) {
            console.error('featured-case-containerが見つかりません');
            return;
        }
        
        if (isUserSelected && featuredCaseTitle) {
            featuredCaseTitle.style.visibility = 'hidden';
        } else if (!isUserSelected && featuredCaseTitle) {
            featuredCaseTitle.style.visibility = 'visible';
        }
        
        const featuredHTML = `
            <div class="featured-case" style="display: flex; flex-direction: row; align-items: flex-start;">
                <div class="featured-case-left" style="flex: 0 0 45%; width: 45%; background-color: #f0f7ff;">
                    <div class="p-4 md:p-6" style="background-color: #f0f7ff;">
                        <div class="category-level-container">
                            <div class="text-sm text-blue-700">${formatCategories(caseData.category)}</div>
                            <div class="level-badge level-${caseData.level}">${caseData.level}</div>
                        </div>
                        <h2 class="text-2xl font-bold mb-4">${caseData.title}</h2>
                        
                        <div class="flex flex-wrap mb-4">
                            ${caseData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        
                        <div class="thumbnail-area featured-thumbnail mb-4">
                            <video id="featured-video" controls ${caseData.video.includes('dify') ? '' : 'muted'} class="w-full ${caseData.video.includes('dify') ? '' : 'no-audio'}" style="height: auto; max-height: none;">
                                <source src="${caseData.video}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                            <div class="video-progress mt-2 bg-gray-200 rounded-full h-1.5">
                                <div class="video-progress-bar bg-blue-500 h-1.5 rounded-full w-0"></div>
                            </div>
                        </div>
                        
                        <div class="mt-4 flex flex-wrap">
                            <div class="badge mr-2 mb-2">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                時間削減 ${caseData.reduction}
                            </div>
                            ${caseData.yearlyReduction ? `
                            <div class="badge mb-2">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                ${caseData.yearlyReduction}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="featured-case-right" style="flex: 1; width: 55%;">
                    <div class="p-4 md:p-6">
                        <h3 class="font-bold mb-4">実施内容</h3>
                        <div class="text-gray-700 mb-6" style="white-space: pre-line;">
                        </div>
                        
                        <h3 class="font-bold mb-2">導入効果</h3>
                        <ul class="list-disc pl-5 mb-4">
                            ${caseData.effects.map(effect => `<li class="mb-1">${effect}</li>`).join('')}
                        </ul>
                        
                        <div class="background-section" id="background-section">
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        featuredCaseContainer.innerHTML = featuredHTML;
        
        // 実施内容のLHTMLを動的に挿入
        const implementationDiv = featuredCaseContainer.querySelector('.text-gray-700');
        if (implementationDiv) {
            implementationDiv.innerHTML = convertLinksInText(caseData.implementation);
        }
        
        setupAdaptiveBackground(caseData.background);
        
        const video = document.getElementById('featured-video');
        const progressBar = document.querySelector('.video-progress-bar');
        
        if (video && progressBar) {
            if (caseData.video.includes('dify')) {
                video.muted = false;
            } else {
                video.muted = true;
                video.volume = 0;
                
                video.addEventListener('volumechange', function() {
                    if (!video.muted) {
                        video.muted = true;
                        video.volume = 0;
                    }
                });
            }
            
            video.addEventListener('timeupdate', function() {
                const percentage = (video.currentTime / video.duration) * 100;
                progressBar.style.width = percentage + '%';
            });
        }
        
        if (isUserSelected) {
            showRelatedCases(caseData);
        } else {
            const relatedSection = document.getElementById('related-cases-section');
            if (relatedSection) {
                relatedSection.classList.add('hidden');
            }
        }
        
        if (isUserSelected) {
            window.currentFeaturedCase = caseData;
        }
        
        if (scrollToView) {
            setTimeout(() => {
                const headerHeight = 80;
                const targetPosition = featuredCaseContainer.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }
    
    function showRelatedCases(currentCase) {
        const relatedSection = document.getElementById('related-cases-section');
        const relatedContainer = document.getElementById('related-cases-container');
        
        if (!relatedSection || !relatedContainer) return;
        
        const selectedCategory = document.querySelector('.category-tab.active').getAttribute('data-category');
        const activeTagFilter = document.querySelector('.tag-filter.active:not(.toggle-others)');
        const selectedTag = activeTagFilter ? activeTagFilter.getAttribute('data-tag') : 'all';
        const activeLevel = document.querySelector('.level-filter.active');
        const selectedLevel = activeLevel ? activeLevel.getAttribute('data-level') : null;
        
        let relatedCases = window.allCasesData
            .filter(caseData => caseData.id !== currentCase.id)
            .map(caseData => {
                let score = 0;
                
                // カテゴリーマッチング（配列対応）
                const currentCategories = Array.isArray(currentCase.category) ? currentCase.category : [currentCase.category];
                const caseCategories = Array.isArray(caseData.category) ? caseData.category : [caseData.category];
                const categoryMatches = currentCategories.some(cat => caseCategories.includes(cat));
                if (categoryMatches) score += 3;
                
                const commonTags = currentCase.tags.filter(tag => 
                    caseData.tags.includes(tag)
                );
                score += commonTags.length;
                
                if (currentCase.level === caseData.level) score += 1;
                
                return { ...caseData, relatedScore: score };
            })
            .filter(caseData => caseData.relatedScore > 0)
            .sort((a, b) => b.relatedScore - a.relatedScore);
        
        relatedCases = relatedCases.filter(caseData => {
            const caseCategories = Array.isArray(caseData.category) ? caseData.category : [caseData.category];
            const matchCategory = selectedCategory === 'all' || caseCategories.includes(selectedCategory);
            const matchTag = selectedTag === 'all' || caseData.tags.includes(selectedTag);
            const matchLevel = !selectedLevel || caseData.level === selectedLevel;
            return matchCategory && matchTag && matchLevel;
        });
        
        relatedCases = relatedCases.slice(0, 3);
        
        if (relatedCases.length > 0) {
            relatedContainer.innerHTML = relatedCases.map(caseData => `
                <div class="case-card related-case-card" data-id="${caseData.id}" data-category="${Array.isArray(caseData.category) ? caseData.category.join(',') : caseData.category}" data-tags="${caseData.tags.join(',')}" data-level="${caseData.level}">
                    <div class="p-4">
                        <div class="category-level-container">
                            <div class="text-sm text-blue-700">${formatCategories(caseData.category)}</div>
                            <div style="display: flex; align-items: center;">
                                <div class="level-badge level-${caseData.level}">${caseData.level}</div>
                                <div class="related-label">関連</div>
                            </div>
                        </div>
                        <h3 class="text-lg font-bold">${caseData.title}</h3>
                        
                        <div class="tag-container flex flex-wrap">
                            ${caseData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        
                        <div class="time-info">
                            <div class="before-time">${caseData.beforeText}: <span class="font-bold">${caseData.beforeTime}</span></div>
                            <div class="arrow">↓</div>
                            <div class="after-time">${caseData.afterText}: <span class="font-bold">${caseData.afterTime}</span></div>
                        </div>
                        
                        <div class="badge-container flex flex-wrap">
                            <div class="badge">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                時間削減 ${caseData.reduction}
                            </div>
                            ${caseData.yearlyReduction ? `
                                <div class="badge">
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                    ${caseData.yearlyReduction}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
            
            relatedContainer.querySelectorAll('.related-case-card').forEach(card => {
                card.addEventListener('click', function() {
                    const caseId = this.getAttribute('data-id');
                    const selectedCase = window.allCasesData.find(c => c.id === caseId);
                    
                    if (selectedCase) {
                        setupFeaturedCase(selectedCase, true, true);
                    }
                });
            });
            
            relatedSection.classList.remove('hidden');
        } else {
            relatedSection.classList.add('hidden');
        }
    }
    
    function setupCaseCards(casesData) {
        const caseContainer = document.getElementById('case-container');
        if (!caseContainer) {
            console.error('case-containerが見つかりません');
            return;
        }
        
        caseContainer.innerHTML = '';
        
        casesData.forEach(caseData => {
            const caseCardHTML = `
                <div class="case-card" data-id="${caseData.id}" data-category="${Array.isArray(caseData.category) ? caseData.category.join(',') : caseData.category}" data-tags="${caseData.tags.join(',')}" data-level="${caseData.level}">
                    <div class="p-4">
                        <div class="category-level-container">
                            <div class="text-sm text-blue-700">${formatCategories(caseData.category)}</div>
                            <div class="level-badge level-${caseData.level}">${caseData.level}</div>
                        </div>
                        <h3 class="text-lg font-bold">${caseData.title}</h3>
                        
                        <div class="tag-container flex flex-wrap">
                            ${caseData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        
                        <div class="time-info">
                            <div class="before-time">${caseData.beforeText}: <span class="font-bold">${caseData.beforeTime}</span></div>
                            <div class="arrow">↓</div>
                            <div class="after-time">${caseData.afterText}: <span class="font-bold">${caseData.afterTime}</span></div>
                        </div>
                        
                        <div class="badge-container flex flex-wrap">
                            <div class="badge">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                時間削減 ${caseData.reduction}
                            </div>
                            ${caseData.yearlyReduction ? `
                                <div class="badge">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                    ${caseData.yearlyReduction}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            caseContainer.innerHTML += caseCardHTML;
        });
        
        document.querySelectorAll('.case-card').forEach(card => {
            card.addEventListener('click', function() {
                const caseId = this.getAttribute('data-id');
                const selectedCase = window.allCasesData.find(c => c.id === caseId);
                
                if (selectedCase) {
                    setupFeaturedCase(selectedCase, true, true);
                }
            });
        });
    }
    
    function initializeOthersToggle() {
        const toggleButton = document.getElementById('toggle-others');
        const otherFilters = document.getElementById('other-filters');
        
        if (!toggleButton || !otherFilters) return;
        
        toggleButton.addEventListener('click', function() {
            if (otherFilters.classList.contains('hidden')) {
                otherFilters.classList.remove('hidden');
                toggleButton.textContent = '×';
            } else {
                otherFilters.classList.add('hidden');
                toggleButton.textContent = '…';
                
                const activeOtherFilter = otherFilters.querySelector('.tag-filter.active');
                if (activeOtherFilter) {
                    document.querySelectorAll('.tag-filter').forEach(f => f.classList.remove('active'));
                    document.querySelector('.tag-filter[data-tag="all"]').classList.add('active');
                    applyFilters();
                }
            }
        });
    }
    
    function initializeFilters() {
        const categoryTabs = document.querySelectorAll('.category-tab');
        const tagFilters = document.querySelectorAll('.tag-filter');
        const levelFilters = document.querySelectorAll('.level-filter');
        
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                categoryTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                applyFilters();
            });
        });
        
        tagFilters.forEach(filter => {
            filter.addEventListener('click', function() {
                if (this.classList.contains('toggle-others')) return;
                
                tagFilters.forEach(f => {
                    if (!f.classList.contains('toggle-others')) {
                        f.classList.remove('active');
                    }
                });
                this.classList.add('active');
                applyFilters();
            });
        });
        
        levelFilters.forEach(filter => {
            filter.addEventListener('click', function() {
                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                } else {
                    levelFilters.forEach(f => f.classList.remove('active'));
                    this.classList.add('active');
                }
                applyFilters();
            });
        });
    }
    
    function applyFilters() {
        const selectedCategory = document.querySelector('.category-tab.active').getAttribute('data-category');
        const activeTagFilter = document.querySelector('.tag-filter.active:not(.toggle-others)');
        const selectedTag = activeTagFilter ? activeTagFilter.getAttribute('data-tag') : 'all';
        const activeLevel = document.querySelector('.level-filter.active');
        const selectedLevel = activeLevel ? activeLevel.getAttribute('data-level') : null;
        
        const featuredCaseContainer = document.getElementById('featured-case-container');
        const featuredCaseTitle = document.getElementById('featured-case-title');
        
        const isFiltered = selectedCategory !== 'all' || selectedTag !== 'all' || selectedLevel !== null;
        
        const filteredData = window.allCasesData.filter(caseData => {
            const caseCategories = Array.isArray(caseData.category) ? caseData.category : [caseData.category];
            const matchCategory = selectedCategory === 'all' || caseCategories.includes(selectedCategory);
            const matchTag = selectedTag === 'all' || caseData.tags.includes(selectedTag);
            const matchLevel = !selectedLevel || caseData.level === selectedLevel;
            return matchCategory && matchTag && matchLevel;
        });
        
        // フィルタリング後の注目事例チェック
        let filteredFeaturedCase = filteredData.find(caseData => caseData.featured);
        
        // 本来の注目事例がフィルタ条件に合致しない場合、動的に選択
        if (!filteredFeaturedCase && filteredData.length > 0) {
            // 時間削減率が最も高い事例を注目事例として選択
            filteredFeaturedCase = [...filteredData].sort((a, b) => {
                const reductionA = parseInt(a.reduction.replace('%', ''));
                const reductionB = parseInt(b.reduction.replace('%', ''));
                return reductionB - reductionA;
            })[0];
        }
        
        if (isFiltered && filteredFeaturedCase) {
            // フィルタ条件に合致する注目事例がある場合は表示
            if (featuredCaseContainer) featuredCaseContainer.style.display = 'block';
            if (featuredCaseTitle) {
                featuredCaseTitle.style.display = 'block';
                featuredCaseTitle.textContent = 'フィルタ結果の注目事例';
            }
            setupFeaturedCase(filteredFeaturedCase, false, false);
        } else if (isFiltered) {
            // フィルタ条件に合致する注目事例がない場合は非表示
            if (featuredCaseContainer) featuredCaseContainer.style.display = 'none';
            if (featuredCaseTitle) featuredCaseTitle.style.display = 'none';
        } else {
            // フィルターなしの場合は通常表示
            if (featuredCaseContainer) featuredCaseContainer.style.display = 'block';
            if (featuredCaseTitle) {
                featuredCaseTitle.style.display = 'block';
                featuredCaseTitle.textContent = '注目事例';
            }
        }
        
        // フィルタリング後のソート処理（注目事例を上部に表示する場合は一覧から除外）
        let listData = [...filteredData];
        if (isFiltered && filteredFeaturedCase) {
            // 上部に表示する注目事例は一覧から除外
            listData = listData.filter(caseData => caseData.id !== filteredFeaturedCase.id);
        }
        
        const sortedFilteredData = [...listData].sort((a, b) => {
            // 1. 注目事例を最優先
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            
            // 2. 時間削減率でソート（高い順）
            const reductionA = parseInt(a.reduction.replace('%', ''));
            const reductionB = parseInt(b.reduction.replace('%', ''));
            if (reductionA !== reductionB) {
                return reductionB - reductionA;
            }
            
            // 3. レベルでソート（初級→中級→上級）
            const levelOrder = {'初級': 1, '中級': 2, '上級': 3};
            const levelA = levelOrder[a.level] || 0;
            const levelB = levelOrder[b.level] || 0;
            return levelA - levelB;
        });
        
        if (sortedFilteredData.length > 0) {
            setupCaseCards(sortedFilteredData);
        } else {
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

        
        if (isFiltered) {
            setTimeout(() => {
                scrollToResults();
            }, 100);
        }
        
        const relatedSection = document.getElementById('related-cases-section');
        if (isFiltered) {
            if (relatedSection) relatedSection.classList.add('hidden');
        } else if (relatedSection && window.currentFeaturedCase) {
            showRelatedCases(window.currentFeaturedCase);
        }
    }
    
    function updateNavPosition() {
        const header = document.querySelector('header');
        const nav = document.querySelector('nav');
        
        if (header && nav) {
            const headerHeight = header.offsetHeight;
            nav.style.top = headerHeight + 'px';
        }
    }
    
    function setupAdaptiveBackground(backgroundText) {
        const backgroundSection = document.getElementById('background-section');
        if (!backgroundSection || !backgroundText) return;
        
        const maxChars = 120;
        const isLong = backgroundText.length > maxChars;
        const shortText = isLong ? backgroundText.substring(0, maxChars) + '...' : backgroundText;
        
        if (isLong) {
            backgroundSection.innerHTML = `
                <p class="text-sm text-gray-700 leading-relaxed mb-2" id="background-short">
                    <strong>背景:</strong> ${shortText}
                </p>
                <p class="text-sm text-gray-700 leading-relaxed hidden" id="background-full">
                    <strong>背景:</strong> ${backgroundText}
                </p>
                <button 
                    class="text-xs text-gray-400 hover:text-gray-600 font-normal mt-2 flex items-center opacity-70 hover:opacity-100 transition-opacity" 
                    onclick="toggleBackground()"
                    id="background-toggle-btn"
                >
                    <span id="toggle-text" class="underline decoration-dotted">背景を見る</span>
                    <svg class="w-3 h-3 ml-1 transform transition-transform" id="toggle-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
            `;
        } else {
            backgroundSection.innerHTML = `
                <p class="text-sm text-gray-700 leading-relaxed">
                    <strong>背景:</strong> ${backgroundText}
                </p>
            `;
        }
    }
    
    window.toggleBackground = function() {
        const shortElement = document.getElementById('background-short');
        const fullElement = document.getElementById('background-full');
        const toggleText = document.getElementById('toggle-text');
        const toggleArrow = document.getElementById('toggle-arrow');
        
        if (shortElement && fullElement && toggleText && toggleArrow) {
            if (shortElement.classList.contains('hidden')) {
                shortElement.classList.remove('hidden');
                fullElement.classList.add('hidden');
                toggleText.textContent = '背景を見る';
                toggleArrow.classList.remove('rotate-180');
            } else {
                shortElement.classList.add('hidden');
                fullElement.classList.remove('hidden');
                toggleText.textContent = '閉じる';
                toggleArrow.classList.add('rotate-180');
            }
        }
    };
    
    function scrollToResults() {
        const caseListTitle = document.querySelector('main h2');
        if (!caseListTitle) return;
        
        const currentScrollY = window.scrollY;
        const titlePosition = caseListTitle.offsetTop;
        
        if (currentScrollY > titlePosition - 100) {
            const header = document.querySelector('header');
            const nav = document.querySelector('nav');
            
            const headerHeight = header ? header.offsetHeight : 0;
            const navHeight = nav ? nav.offsetHeight : 0;
            const totalOffset = headerHeight + navHeight + 20;
            
            const targetPosition = titlePosition - totalOffset;
            
            window.scrollTo({
                top: Math.max(0, targetPosition),
                behavior: 'smooth'
            });
        }
    }
});
