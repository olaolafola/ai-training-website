        // HTML生成（縦伸び問題を解決したバージョン）
        const featuredHTML = `
            <div class="featured-case">
                <!-- 左側：動画エリア - 自然な高さを維持 -->
                <div class="featured-case-left">
                    <div class="p-4 md:p-6">
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
                            <video id="featured-video" controls ${caseData.video.includes('dify') ? '' : 'muted'} class="w-full ${caseData.video.includes('dify') ? '' : 'no-audio'}">
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
                </div>
                
                <!-- 右側：詳細内容 - 独立してスクロール可能 -->
                <div class="featured-case-right">
                    <div class="p-4 md:p-6">
                        <h3 class="font-bold mb-4">実施内容</h3>
                        <p class="text-gray-700 mb-6">
                            ${caseData.implementation}
                        </p>
                        
                        <h3 class="font-bold mb-2">導入効果</h3>
                        <ul class="list-disc pl-5 mb-4">
                            ${caseData.effects.map(effect => `<li class="mb-1">${effect}</li>`).join('')}
                        </ul>
                        
                        <div class="bg-blue-50 p-4 rounded-lg background-section" id="background-section">
                            <!-- ここに動的に背景情報が生成されます -->
                        </div>
                    </div>
                </div>
            </div>
        `;
