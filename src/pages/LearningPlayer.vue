<template>
	<div
		class="learning-player"
		:class="{
			'sidebar-collapsed': isSidebarCollapsed,
			'sidebar-open-mobile': !isSidebarCollapsed,
			'focus-mode': isFocusMode,
		}"
	>
		<div
			v-if="!isSidebarCollapsed"
			class="sidebar-backdrop"
			@click="isSidebarCollapsed = true"
		/>
		<div v-if="loading" class="player-loading">
			<div class="loading-spinner" />
			<p>Đang tải bài học...</p>
		</div>

		<div v-else-if="error" class="player-error card glass">
			<AlertCircle
				:size="48"
				style="
					color: var(--danger-400, #f87171);
					opacity: 0.6;
					margin-bottom: 1rem;
				"
			/>
			<h3>{{ error }}</h3>
			<button class="btn btn-primary" @click="$router.back()">
				← Quay lại
			</button>
		</div>

		<template v-else-if="lesson">
			<!-- Player Specific Sub-Header (Matches Screenshot) -->
			<header class="player-header-card glass mb-4">
				<div class="header-left">
					<button
						class="btn-icon btn-ghost exit-btn"
						aria-label="Thoát bài học"
						@click="$router.push('/my-courses')"
					>
						<X :size="20" />
					</button>
					<div class="course-info">
						<h3 class="course-name">
							{{ course?.title }}
						</h3>
						<div class="lesson-breadcrumb">
							<span class="module-text">{{ activeModuleName }}</span>
							<ChevronRight :size="10" />
							<span class="active-lesson">{{ lesson?.title }}</span>
						</div>
					</div>
				</div>

				<div class="header-right">
					<div class="progress-stats">
						<div class="stats-text">
							Tiến độ:
							<span class="percent-tag"
								>{{ Math.round(courseProgress?.progressPercent || 0) }}%</span
							>
							<span class="lesson-count-pill ms-2">
								({{ lessonProgresses.filter((lp) => lp.isCompleted).length }} /
								{{ course?.modules?.flatMap((m) => m.lessons).length || 0 }}
								bài)
							</span>
						</div>
						<div class="progress-mini-bar">
							<div
								class="progress-mini-fill"
								:style="{
									width: Math.round(courseProgress?.progressPercent || 0) + '%',
								}"
							/>
						</div>
					</div>

					<button
						class="btn btn-sm btn-sidebar-toggle"
						aria-label="Mở/thu gọn danh sách bài học"
						@click="toggleSidebar"
					>
						<LayoutList :size="16" />
						<span class="ms-2 hide-mobile">{{
							isSidebarCollapsed ? "Thu gọn" : "Mở rộng"
						}}</span>
					</button>
				</div>
			</header>

			<div class="player-container">
				<transition name="fade">
					<div
						v-if="!isSidebarCollapsed"
						class="sidebar-backdrop"
						aria-hidden="true"
						@click="isSidebarCollapsed = true"
					/>
				</transition>

				<aside
					class="player-sidebar glass"
					:class="{ collapsed: isSidebarCollapsed }"
					aria-label="Danh sách bài học"
				>
					<div class="sidebar-header">
						<h3>Nội dung khóa học</h3>
						<button
							class="btn-icon btn-ghost sm hide-desktop"
							aria-label="Đóng danh sách bài học"
							@click="isSidebarCollapsed = true"
						>
							<X :size="16" />
						</button>
					</div>
					<div class="sidebar-content custom-scrollbar">
						<div
							v-for="(mod, mi) in course?.modules"
							:key="mod.id"
							class="module-group"
							:class="{ open: expandedModules.has(mod.id) }"
						>
							<div
								class="module-item"
								role="button"
								tabindex="0"
								:aria-expanded="expandedModules.has(mod.id)"
								@click="toggleModule(mod.id)"
								@keydown.enter.space.prevent="toggleModule(mod.id)"
							>
								<div class="module-meta">
									<span class="module-index">Chương {{ mi + 1 }}</span>
									<component
										:is="
											expandedModules.has(mod.id) ? ChevronDown : ChevronRight
										"
										:size="16"
									/>
								</div>
								<h4 class="module-title">
									{{ mod.title }}
								</h4>
								<div class="module-stats">{{ mod.lessons.length }} bài học</div>
							</div>

							<div v-show="expandedModules.has(mod.id)" class="lesson-list">
								<template v-for="l in mod.lessons" :key="l.id">
									<div
										class="lesson-item"
										:class="{
											active: l.id === lesson?.id && activeTab !== 'quiz',
											completed: isLessonDone(l.id),
											locked: !canAccess(l),
										}"
										role="button"
										:tabindex="canAccess(l) ? 0 : -1"
										:aria-current="
											l.id === lesson?.id && activeTab !== 'quiz'
												? 'page'
												: undefined
										"
										:aria-disabled="!canAccess(l)"
										:aria-label="`${l.title}${isLessonDone(l.id) ? ' - Đã hoàn thành' : !canAccess(l) ? ' - Đang khóa' : ''}`"
										@click="navigateLesson(l, 'overview')"
										@keydown.enter.space.prevent="navigateLesson(l, 'overview')"
									>
										<div class="lesson-status">
											<div
												v-if="!canAccess(l)"
												class="status-icon locked"
												title="Bài học đang đóng"
											>
												<Lock :size="14" />
											</div>
											<div
												v-else-if="isLessonDone(l.id)"
												class="status-icon completed"
												title="Đã hoàn thành"
											>
												<Check :size="16" />
											</div>
											<div
												v-else-if="l.id === lesson?.id"
												class="status-icon active"
												title="Đang học"
											>
												<Play :size="14" fill="currentColor" />
											</div>
											<div v-else class="status-icon todo" title="Chưa học">
												<Circle :size="14" />
											</div>
										</div>
										<div class="lesson-info">
											<span class="l-title">{{ l.title }}</span>
											<div class="l-meta">
												<div class="l-type-tag">
													<Video v-if="l.type === 'Video'" :size="12" />
													<FileText v-else :size="12" />
													<span>{{
														l.type === "Video" ? "Video" : "Bài đọc"
													}}</span>
												</div>
												<span
													v-if="l.type === 'Video' && l.videoDurationSeconds"
													class="l-duration"
												>
													<Clock :size="12" />
													{{ formatTime(l.videoDurationSeconds) }}
												</span>
												<span
													v-if="
														l.type === 'Video' &&
														getLessonProgressPercent(l.id) > 0 &&
														!isLessonDone(l.id)
													"
													class="l-progress-tag"
												>
													Đã xem {{ getLessonProgressPercent(l.id) }}%
												</span>
												<span v-else-if="l.type === 'Text'" class="l-duration">
													<Clock :size="12" />
													{{ formatTime(l.readingDurationSeconds || 180) }}
												</span>
											</div>
										</div>
									</div>

									<div
										v-if="l.quizId && l.quizQuestionCount > 0"
										class="lesson-item quiz-sub-item"
										:class="{
											active: l.id === lesson?.id && activeTab === 'quiz',
											locked: !canAccess(l),
										}"
										role="button"
										:tabindex="canAccess(l) ? 0 : -1"
										:aria-label="`Bài tập: ${l.title}${!canAccess(l) ? ' - Khóa' : ''}`"
										@click="navigateLesson(l, 'quiz')"
										@keydown.enter.space.prevent="navigateLesson(l, 'quiz')"
									>
										<div class="lesson-status">
											<CheckCircle
												v-if="isLessonQuizPassed(l.id)"
												:size="14"
												class="done-icon"
											/>
											<HelpCircle v-else :size="14" class="todo-icon" />
										</div>
										<div class="lesson-info">
											<span class="l-title text-primary fw-medium">
												Bài tập: {{ l.title }}
											</span>
											<div class="l-meta text-primary opacity-75">
												<HelpCircle :size="12" />
												<span>{{ l.quizQuestionCount }} câu hỏi</span>
											</div>
										</div>
									</div>
								</template>
							</div>
						</div>

						<template
							v-if="course?.extraQuizzes?.some((q) => q.questionCount > 0)"
						>
							<div
								v-for="q in course.extraQuizzes.filter(
									(q) => q.questionCount > 0,
								)"
								:key="q.id"
								class="module-group"
								:class="{
									active: $route.params.quizId == q.id,
									locked: !isAllLessonsCompleted,
								}"
							>
								<div
									class="lesson-item quiz-item final-quiz-item"
									:class="{
										completed: courseProgress?.passedQuizIds?.includes(q.id),
										locked: !isAllLessonsCompleted,
									}"
									role="button"
									:tabindex="isAllLessonsCompleted ? 0 : -1"
									:aria-label="`Kiểm tra chung: ${q.title}${!isAllLessonsCompleted ? ' - Khóa' : ''}`"
									@click="
										isAllLessonsCompleted
											? router.push(`/quiz/${q.id}?courseId=${course.id}`)
											: toast.warning(
													'🔒 Bạn cần hoàn thành tất cả bài học trước khi thi cuối khóa!',
												)
									"
									@keydown.enter.space.prevent="
										isAllLessonsCompleted
											? router.push(`/quiz/${q.id}?courseId=${course.id}`)
											: null
									"
								>
									<div class="lesson-status">
										<div
											v-if="!isAllLessonsCompleted"
											class="status-icon locked"
										>
											<Lock :size="16" />
										</div>
										<CheckCircle
											v-else-if="courseProgress?.passedQuizIds?.includes(q.id)"
											:size="18"
											class="done-icon"
										/>
										<ClipboardList v-else :size="18" class="text-warning" />
									</div>
									<div class="lesson-info">
										<span class="l-title fw-bold text-dark">{{ q.title }}</span>
										<span class="l-meta text-warning fw-bold"
											>Kiểm tra chung</span
										>
									</div>
								</div>
							</div>
						</template>
					</div>
				</aside>

				<main class="player-content">
					<div class="content-primary">
						<div v-if="lesson?.type === 'Video'" class="video-theater">
							<div class="video-container">
								<div class="content-type-badge video">
									<Video :size="14" /> VIDEO BÀI GIẢNG
								</div>

								<div
									v-if="!isCompleted && videoDurationRef > 0"
									class="video-watch-indicator"
									:title="`Đã xem ${videoWatchPercent}%`"
								>
									<svg width="40" height="40" viewBox="0 0 40 40">
										<circle
											cx="20"
											cy="20"
											r="16"
											fill="none"
											stroke="rgba(255,255,255,0.15)"
											stroke-width="3"
										/>
										<circle
											cx="20"
											cy="20"
											r="16"
											fill="none"
											stroke="#6366f1"
											stroke-width="3"
											stroke-linecap="round"
											:stroke-dasharray="`${(videoWatchPercent / 100) * 100.53} 100.53`"
											transform="rotate(-90 20 20)"
										/>
										<text
											x="20"
											y="20"
											text-anchor="middle"
											dominant-baseline="central"
											fill="white"
											font-size="9"
											font-weight="600"
										>
											{{ videoWatchPercent }}%
										</text>
									</svg>
								</div>

								<template v-if="isYouTubeUrl(lesson?.videoUrl)">
									<iframe
										:src="getEmbedUrl(lesson?.videoUrl)"
										frameborder="0"
										allow="
											accelerometer;
											autoplay;
											clipboard-write;
											encrypted-media;
											gyroscope;
											picture-in-picture;
										"
										allowfullscreen
										class="video-iframe"
										title="Video bài giảng"
									/>
								</template>
								<template v-else>
									<div
										v-if="lesson?.videoStatus === 'Processing'"
										class="video-processing-state glass flex-center flex-column"
									>
										<div class="processing-glow mb-3" />
										<h3 class="processing-title">
											Bài giảng đang được xử lý...
										</h3>
										<p class="processing-sub">
											Vui lòng chờ giây lát, hệ thống đang tối ưu video cho bạn.
										</p>
									</div>
									<video
										v-else-if="lesson?.videoUrl"
										ref="videoRef"
										:src="
											lesson.videoStatus === 'Ready' &&
											lesson.videoUrl.endsWith('.m3u8')
												? null
												: getFullMediaUrl(lesson.videoUrl)
										"
										controls
										controlsList="nodownload"
										class="video-item"
										@timeupdate="onTimeUpdate"
										@loadedmetadata="onVideoLoaded"
										@seeking="onSeeking"
										@seeked="onSeeked"
									>
										<track
											v-if="
												lesson?.subtitlesPath &&
												!lesson.videoUrl?.endsWith('.m3u8')
											"
											kind="subtitles"
											:src="getFullMediaUrl(lesson.subtitlesPath)"
											srclang="vi"
											label="Tiếng Việt"
											default
										/>
									</video>
									<div
										v-else
										class="no-video flex-center flex-column gap-3 p-5"
									>
										<VideoOff :size="48" class="opacity-25" />
										<p>Chưa có dữ liệu bài giảng video</p>
									</div>
								</template>
							</div>
						</div>

						<div v-else-if="lesson?.type === 'Text'" class="text-theater">
							<div class="content-type-badge text">
								<FileText :size="14" /> TÀI LIỆU BÀI ĐỌC
							</div>
							<div class="text-content-card glass shadow-sm">
								<div
									class="text-content-wrap custom-scrollbar markdown-body"
									v-html="renderMarkdown(lesson?.content)"
								/>
							</div>
						</div>

						<div
							v-if="
								lesson?.type === 'Text' &&
								!isCompleted &&
								!isReadingTimeFinished
							"
							class="reading-timer-bar glass"
							role="timer"
							:aria-label="`Còn ${readingTimeLeft} giây để hoàn tất bài đọc`"
						>
							<div class="reading-timer-inner">
								<div class="reading-timer-icon">
									<Clock :size="16" />
								</div>
								<div class="reading-timer-info">
									<span class="reading-timer-label"
										>Thời gian đọc tối thiểu</span
									>
									<span class="reading-timer-remain"
										>Còn {{ readingTimeLeft }}s</span
									>
								</div>
								<div class="reading-timer-track">
									<div
										class="reading-timer-fill"
										:style="{ width: readingProgressPercent + '%' }"
									/>
								</div>
							</div>
						</div>

						<div ref="tabsContainer" class="content-tabs-container shadow-sm">
							<div class="tabs-header" role="tablist">
								<button
									v-for="tab in availableTabs"
									:id="`tab-${tab.id}`"
									:key="tab.id"
									class="tab-btn"
									:class="{ active: activeTab === tab.id }"
									role="tab"
									:aria-selected="activeTab === tab.id"
									:aria-controls="`tabpanel-${tab.id}`"
									@click="activeTab = tab.id"
								>
									<component :is="tab.icon" :size="16" />
									{{ tab.label }}
									<span
										v-if="tab.id === 'resources' && lesson?.attachments?.length"
										class="tab-badge"
										>{{ lesson.attachments.length }}</span
									>
								</button>
							</div>

							<div class="tab-content-area custom-scrollbar">
								<div
									v-if="activeTab === 'overview'"
									id="tabpanel-overview"
									class="tab-pane animate-fade-in"
									role="tabpanel"
									aria-labelledby="tab-overview"
								>
									<div class="lesson-intro">
										<div class="intro-header-modern">
											<div class="title-area">
												<h2 class="m-0 fw-800">
													{{ lesson?.title }}
												</h2>
												<p
													v-if="lesson?.type === 'Video'"
													class="text-secondary mt-1 mb-0"
												>
													<Clock :size="14" class="me-1" />
													Thời lượng:
													{{ formatTime(lesson?.videoDurationSeconds) }}
												</p>
												<p
													v-else-if="lesson?.type === 'Text'"
													class="text-secondary mt-1 mb-0"
												>
													<Clock :size="14" class="me-1" />
													Thời gian đọc kiến nghị:
													{{
														formatTime(lesson?.readingDurationSeconds || 180)
													}}
												</p>
											</div>

											<div class="action-area">
												<button
													v-if="!isCompleted"
													class="btn btn-primary btn-complete-premium"
													:disabled="savingProgress || !canCompleteManual"
													:aria-label="completeBtnMessage"
													@click="completeLesson(false)"
												>
													<CheckCircle :size="18" />
													{{ completeBtnMessage }}
												</button>

												<div v-else class="completed-area-modern">
													<div class="completed-badge-premium animate-fade-in">
														<CheckCircle :size="18" /> Đã hoàn thành bài học
													</div>
													<button
														v-if="nextLesson"
														class="btn btn-primary btn-next-direct ms-3"
														@click="goToNextLesson"
													>
														Tiếp tục bài tiếp theo <ArrowRight :size="18" />
													</button>
												</div>
											</div>
										</div>

										<div class="lesson-description-structure mt-4">
											<div class="desc-section">
												<h4 class="section-title-dot">Mục tiêu bài học</h4>
												<div class="section-body">
													<p
														v-if="!lesson?.description"
														class="text-muted opacity-75"
													>
														Mục tiêu bài học này là giúp bạn nắm vững các kiến
														thức nền tảng và ứng dụng thực tế của chủ đề hiện
														tại.
													</p>
													<div v-else v-html="lesson.description" />
												</div>
											</div>

											<div
												v-if="lesson?.content && lesson?.type === 'Video'"
												class="desc-section mt-4"
											>
												<h4 class="section-title-dot">Nội dung chính</h4>
												<div class="section-body" v-html="lesson.content" />
											</div>

											<div
												v-if="lesson?.aiSummary"
												class="desc-section mt-4 ai-summary-section animate-fade-in"
											>
												<h4 class="section-title-dot ai-glow-text">
													<Sparkles :size="16" class="me-1" /> Tóm tắt bài giảng
													(AI)
												</h4>
												<div
													class="section-body ai-summary-content glass p-3 rounded"
												>
													<div
														class="markdown-body"
														v-html="renderMarkdown(lesson.aiSummary)"
													/>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div
									v-else-if="activeTab === 'quiz'"
									id="tabpanel-quiz"
									class="tab-pane animate-fade-in"
									role="tabpanel"
									aria-labelledby="tab-quiz"
								>
									<div
										v-if="!quizStarted && !quizResult"
										class="text-center py-5"
									>
										<HelpCircle :size="64" class="text-warning mb-3" />
										<h3 class="fw-bold mb-2 text-dark">
											{{ lesson?.quiz?.title || "Bài Tập Củng Cố" }}
										</h3>
										<p class="text-muted mb-4">
											Bạn có
											<strong
												>{{ lesson?.quiz?.questions?.length || 0 }} câu
												hỏi</strong
											>
											cần hoàn thành.<br />
											Điểm tối thiểu cần đạt:
											<strong>{{ lesson?.quiz?.passScore || 0 }} điểm</strong>.
										</p>
										<button
											class="btn btn-primary btn-lg"
											@click="startMiniQuiz"
										>
											<PlayCircle :size="20" class="me-2" /> Bắt Đầu Làm Bài
										</button>
									</div>

									<div
										v-else-if="quizStarted && !quizResult"
										class="quiz-active-area"
									>
										<div
											class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3"
										>
											<h5 class="fw-bold text-primary m-0">Đang làm bài...</h5>
											<span class="text-muted fs-14">
												Đã chọn: {{ Object.keys(selectedAnswers).length }} /
												{{ lesson?.quiz?.questions?.length }}
											</span>
										</div>

										<div
											v-for="(q, index) in lesson?.quiz?.questions"
											:key="q.id"
											class="card glass mb-4 p-4 border-0 shadow-sm"
										>
											<h6 class="fw-bold text-dark lh-base mb-4">
												<span class="text-primary me-2"
													>Câu {{ index + 1 }}:</span
												>
												{{ q.questionText }}
												<span class="badge bg-light text-muted ms-2 fw-normal"
													>{{ q.points }} điểm</span
												>
											</h6>

											<div class="options-list d-flex flex-column gap-2">
												<label
													v-for="(optText, optKey) in q.options"
													:key="optKey"
													class="opt-label d-flex align-items-center p-3 rounded border cursor-pointer transition-all"
													:class="{
														'bg-primary-light border-primary':
															selectedAnswers[q.id] === optKey,
													}"
												>
													<input
														v-model="selectedAnswers[q.id]"
														type="radio"
														:name="'q_' + q.id"
														:value="optKey"
														class="me-3 form-check-input"
														style="transform: scale(1.2)"
													/>
													<span class="fw-bold me-2">{{ optKey }}.</span>
													<span class="fs-15">{{ optText }}</span>
												</label>
											</div>
										</div>

										<div class="text-end mt-4">
											<button
												class="btn btn-success btn-lg px-5 shadow-sm"
												:disabled="
													Object.keys(selectedAnswers).length <
													lesson?.quiz?.questions?.length
												"
												@click="submitMiniQuiz"
											>
												<CheckCircle :size="20" class="me-2" /> Nộp Bài
											</button>
										</div>
									</div>

									<div v-else-if="quizResult" class="text-center py-5">
										<div
											v-if="quizResult.passed"
											class="congratulations-box p-4 rounded bg-success-light border border-success mb-4 d-inline-block w-100"
											style="max-width: 600px"
										>
											<h2 class="text-success fw-bold mb-3">
												Làm bài xuất sắc!
											</h2>
											<div class="fs-5 text-dark mb-2">
												Điểm của bạn:
												<strong class="fs-3">{{ quizResult.score }}</strong> /
												{{ quizResult.totalScore }}
											</div>
											<div
												class="d-flex justify-content-center gap-3 flex-wrap mt-3"
											>
												<button
													v-if="nextLesson"
													class="btn btn-outline-success px-4 fw-bold"
													@click="goToNextLesson"
												>
													Bài tiếp theo <ChevronRight :size="18" />
												</button>
											</div>
										</div>

										<div v-else>
											<Trophy :size="72" class="text-danger mb-3" />
											<h2 class="fw-black mb-2 text-danger">
												RẤT TIẾC, BẠN CHƯA ĐẠT!
											</h2>
											<div class="fs-5 text-muted mb-3">
												Điểm của bạn:
												<strong class="text-dark fs-3">{{
													quizResult.score
												}}</strong>
												/ {{ quizResult.totalScore }}
											</div>

											<div
												v-if="quizRetryCountdown > 0"
												class="retry-countdown-box mb-4"
											>
												<div class="countdown-inner">
													<Clock :size="20" />
													<span>Bạn có thể làm lại sau</span>
													<strong class="countdown-num">{{
														formatRetryCountdown(quizRetryCountdown)
													}}</strong>
												</div>
												<div class="countdown-track">
													<div
														class="countdown-fill"
														:style="{
															width: (1 - quizRetryCountdown / 300) * 100 + '%',
														}"
													/>
												</div>
											</div>

											<div class="d-flex justify-content-center gap-3">
												<button
													class="btn btn-outline-danger px-4 fw-bold"
													:disabled="quizRetryCountdown > 0"
													@click="retryMiniQuiz"
												>
													<RotateCcw :size="18" class="me-2" />
													{{
														quizRetryCountdown > 0
															? `Chờ ${formatRetryCountdown(quizRetryCountdown)}`
															: "Làm lại bài"
													}}
												</button>
											</div>
										</div>

										<div
											v-if="quizResult.details && quizResult.details.length"
											class="mt-5 text-start"
										>
											<h4 class="fw-bold mb-4 border-bottom pb-2 text-dark">
												Chi tiết bài làm
											</h4>
											<div
												v-for="(d, i) in quizResult.details"
												:key="i"
												class="card mb-3 border-0 shadow-sm"
												:class="
													d.isCorrect
														? 'border-start border-success'
														: 'border-start border-danger'
												"
												style="border-left-width: 5px !important"
											>
												<div class="card-body">
													<p class="fw-bold fs-15 text-dark mb-2">
														Câu {{ i + 1 }}: {{ d.questionText }}
													</p>
													<div class="d-flex flex-wrap gap-4 fs-14">
														<span
															:class="
																d.isCorrect
																	? 'text-success fw-bold'
																	: 'text-danger fw-bold'
															"
														>
															Bạn chọn:
															{{
																d.selectedAnswer
																	? getOptionText(
																			d.questionId,
																			d.selectedAnswer,
																		)
																	: "Bỏ trống"
															}}
														</span>
														<span
															v-if="!d.isCorrect"
															class="text-success fw-bold"
														>
															Đáp án đúng:
															{{ getOptionText(d.questionId, d.correctAnswer) }}
														</span>
													</div>
													<div
														v-if="d.explanation && d.explanation.trim() !== ''"
														class="mt-3 p-3 bg-light rounded fs-14 text-dark border"
													>
														<strong class="text-primary"
															><HelpCircle
																:size="16"
																class="me-1"
																style="margin-top: -3px"
															/>
															Giải thích:</strong
														>
														{{ d.explanation }}
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div
									v-else-if="activeTab === 'resources'"
									id="tabpanel-resources"
									class="tab-pane animate-fade-in"
									role="tabpanel"
									aria-labelledby="tab-resources"
								>
									<div v-if="lesson?.attachments?.length" class="resource-list">
										<a
											v-for="att in lesson.attachments"
											:key="att.id"
											href="#"
											class="resource-item card"
											:aria-label="`Tải xuống ${att.fileName}`"
											:style="
												isDownloading[att.id]
													? 'opacity: 0.6; pointer-events: none;'
													: ''
											"
											@click.prevent="downloadFile(att)"
										>
											<div class="res-icon">
												<div v-if="isDownloading[att.id]" class="dl-spinner" />
												<Paperclip v-else :size="20" />
											</div>
											<div class="res-info">
												<div class="res-name">{{ att.fileName }}</div>
												<div class="res-meta">
													<span
														v-if="isDownloading[att.id]"
														class="text-primary fw-bold"
														>Đang tải xuống...</span
													>
													<span v-else
														>{{ (att.fileSize / 1024).toFixed(1) }} KB</span
													>
												</div>
											</div>
											<Download
												v-if="!isDownloading[att.id]"
												:size="18"
												class="res-dl"
											/>
										</a>
									</div>
									<div v-else class="empty-state">
										<Paperclip :size="40" />
										<p>Không có tài nguyên đính kèm</p>
									</div>
								</div>

								<div
									v-else-if="activeTab === 'qa'"
									id="tabpanel-qa"
									class="tab-pane animate-fade-in"
									role="tabpanel"
									aria-labelledby="tab-qa"
								>
									<div class="qa-container">
										<div class="qa-input-box card glass">
											<textarea
												v-model="newQuestion"
												placeholder="Đặt câu hỏi về bài học này..."
												aria-label="Nội dung câu hỏi"
											/>
											<div class="qa-actions">
												<button
													class="btn btn-primary btn-sm"
													:disabled="!newQuestion.trim()"
													@click="postQuestion"
												>
													Gửi câu hỏi
												</button>
											</div>
										</div>

										<div v-if="qaList.length" class="qa-list">
											<div
												v-for="qa in qaList"
												:key="qa.id"
												class="qa-card card glass"
											>
												<div class="qa-main">
													<div
														class="user-avatar"
														:style="
															qa.userAvatar
																? {
																		backgroundImage: `url('${getAvatarUrl(qa.userAvatar)}')`,
																	}
																: {}
														"
														:aria-label="qa.userName"
													>
														{{ !qa.userAvatar ? qa.userName?.charAt(0) : "" }}
													</div>
													<div class="qa-body">
														<div class="qa-meta">
															<strong>{{ qa?.userName }}</strong>
															<span
																v-if="
																	qa?.userRole === 'Admin' ||
																	qa?.userRole === 'Instructor'
																"
																class="badge bg-primary ms-1"
																style="font-size: 9px; padding: 2px 6px"
																>GIẢNG VIÊN</span
															>
															• <span>{{ formatDate(qa?.createdAt) }}</span>
														</div>
														<p class="qa-text">
															{{ qa.content }}
														</p>
														<button
															class="reply-btn"
															:aria-expanded="replyTo === qa.id"
															@click="
																replyTo = replyTo === qa.id ? null : qa.id
															"
														>
															Trả lời
														</button>
													</div>
												</div>

												<div
													v-if="qa.replies?.length || replyTo === qa.id"
													class="replies-section"
												>
													<div
														v-if="replyTo === qa.id"
														class="reply-input-wrap"
													>
														<textarea
															v-model="replyContent"
															placeholder="Viết phản hồi..."
															aria-label="Nội dung phản hồi"
														/>
														<button
															class="btn btn-primary btn-sm"
															@click="postReply(qa.id)"
														>
															Gửi
														</button>
													</div>
													<div
														v-for="reply in qa.replies"
														:key="reply.id"
														class="reply-item"
													>
														<div
															class="user-avatar sm"
															:style="
																reply.userAvatar
																	? {
																			backgroundImage: `url('${getAvatarUrl(reply.userAvatar)}')`,
																		}
																	: {}
															"
															:aria-label="reply.userName"
														>
															{{
																!reply.userAvatar
																	? reply.userName?.charAt(0)
																	: ""
															}}
														</div>
														<div class="qa-body">
															<div class="qa-meta">
																<strong>{{ reply?.userName }}</strong>
																<span
																	v-if="
																		reply?.userRole === 'Admin' ||
																		reply?.userRole === 'Instructor'
																	"
																	class="badge bg-primary ms-1"
																	style="font-size: 9px; padding: 2px 6px"
																	>GIẢNG VIÊN</span
																>
																•
																<span>{{ formatDate(reply?.createdAt) }}</span>
															</div>
															<p class="qa-text">
																{{ reply.content }}
															</p>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div
									v-else-if="activeTab === 'ai-chat'"
									id="tabpanel-ai-chat"
									class="tab-pane animate-fade-in"
									role="tabpanel"
									aria-labelledby="tab-ai-chat"
									style="height: 600px"
								>
									<LessonChat
										:lesson-id="lesson?.id"
										:current-timestamp="videoCurrentTime"
										@seek="seekVideo"
									/>
								</div>

								<div
									v-else-if="activeTab === 'notes'"
									id="tabpanel-notes"
									class="tab-pane animate-fade-in"
									role="tabpanel"
									aria-labelledby="tab-notes"
								>
									<div class="notes-container">
										<div class="note-input card glass">
											<textarea
												v-model="newNote"
												placeholder="Ghi chú cá nhân (chỉ mình bạn thấy)..."
												aria-label="Nội dung ghi chú"
											/>
											<button
												class="btn btn-secondary btn-sm"
												:disabled="!newNote.trim()"
												@click="saveNote"
											>
												Lưu ghi chú
											</button>
										</div>
										<div v-if="notes.length" class="notes-list">
											<div
												v-for="note in notes"
												:key="note.id"
												class="note-item card glass"
											>
												<div
													v-if="note.videoTimestampSeconds"
													class="note-time"
													role="button"
													tabindex="0"
													:aria-label="`Nhảy đến ${formatTime(note.videoTimestampSeconds)}`"
													@click="seekVideo(note.videoTimestampSeconds)"
													@keydown.enter.space.prevent="
														seekVideo(note.videoTimestampSeconds)
													"
												>
													<Video :size="12" />
													{{ formatTime(note.videoTimestampSeconds) }}
												</div>
												<p>{{ note.content }}</p>
												<button
													class="delete-note"
													:aria-label="`Xóa ghi chú: ${note.content.slice(0, 30)}`"
													@click="deleteNote(note.id)"
												>
													<Trash2 :size="14" />
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="content-footer-nav glass">
						<button
							class="btn btn-ghost"
							:disabled="!prevLesson"
							aria-label="Bài học trước"
							@click="navigatePrev"
						>
							<ChevronLeft :size="18" /> Bài trước
						</button>
						<div class="footer-lesson-info hide-mobile">
							Đang xem: <span>{{ lesson?.title }}</span>
						</div>
						<button
							v-if="nextLesson"
							class="btn btn-primary"
							aria-label="Bài học tiếp theo"
							@click="goToNextLesson"
						>
							Bài tiếp theo <ChevronRight :size="18" />
						</button>
						<button
							v-else-if="course?.finalQuizId"
							class="btn btn-success"
							:disabled="!isAllLessonsCompleted"
							@click="
								router.push(`/quiz/${course.finalQuizId}?courseId=${course.id}`)
							"
						>
							<Lock v-if="!isAllLessonsCompleted" :size="16" class="me-2" />
							{{
								isAllLessonsCompleted
									? "Làm bài thi cuối khóa"
									: "Hãy hoàn thành các bài học"
							}}
							<ClipboardList v-if="isAllLessonsCompleted" :size="18" />
						</button>
					</div>
				</main>
			</div>
		</template>

		<teleport to="body">
			<div
				v-if="showCourseCompletedModal"
				class="glass-modal-overlay"
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
			>
				<div
					class="congratulations-box p-5 rounded bg-white text-center shadow-lg animate-slide-up"
					style="max-width: 500px; z-index: 9999"
				>
					<Award :size="80" class="text-success mb-3 animate-bounce mx-auto" />
					<h2 id="modal-title" class="text-success fw-bold mb-3">
						🎉 HOÀN THÀNH KHÓA HỌC! 🎉
					</h2>
					<p class="text-secondary mb-4 fs-15">
						Bạn đã hoàn thành xuất sắc toàn bộ nội dung của khóa học này. Hệ
						thống đang tiến hành đánh giá và lưu trữ thành tích.
					</p>
					<div v-if="isIssuingCert" class="text-primary mb-4 fw-bold">
						<div class="spinner-border spinner-border-sm me-2" />
						Đang khởi tạo chứng chỉ...
					</div>
					<div class="d-flex justify-content-center gap-3 mt-4">
						<button
							class="btn btn-outline-secondary px-4 fw-bold"
							@click="showCourseCompletedModal = false"
						>
							Đóng & Xem kết quả
						</button>
						<button
							class="btn btn-success px-4 fw-bold shadow-sm"
							:disabled="isIssuingCert"
							@click="downloadCertificate"
						>
							<Award :size="18" class="me-2" /> Tải Chứng Chỉ
						</button>
					</div>
				</div>
			</div>
		</teleport>
	</div>
</template>

<script setup>
import {
	ref,
	onMounted,
	computed,
	watch,
	nextTick,
	onBeforeUnmount,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import api, {
	courseAPI,
	progressAPI,
	qaAPI,
	noteAPI,
	certificateAPI,
	quizAPI,
} from "@/services/api";
import {
	AlertCircle,
	CheckCircle,
	ChevronRight,
	ChevronLeft,
	ChevronDown,
	ClipboardList,
	Paperclip,
	MessageCircle,
	StickyNote,
	Trash2,
	Download,
	Bot,
	X,
	LayoutList,
	Video,
	FileText,
	Circle,
	Info,
	HelpCircle,
	Trophy,
	RotateCcw,
	Award,
	PlayCircle,
	Check,
	VideoOff,
	Play,
	Lock,
	Clock,
	ArrowRight,
	Sparkles,
} from "lucide-vue-next";
import LessonChat from "@/components/LessonChat.vue";
import { toast } from "vue3-toastify";
import { useAuthStore } from "@/stores/auth";
import Hls from "hls.js";
import * as signalR from "@microsoft/signalr";
import { marked } from "marked";
import DOMPurify from "dompurify";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const course = ref(null);
const lesson = ref(null);
const lessonProgresses = ref([]);
const courseProgress = ref(null);
const qaList = ref([]);
const notes = ref([]);
const loading = ref(true);
const error = ref(null);

const savingProgress = ref(false);
const videoRef = ref(null);
const tabsContainer = ref(null);

const maxWatchedTime = ref(0);
const lastSavedTime = ref(0);
const preSeekTime = ref(0);
const lastCurrentTime = ref(0);
const isSeeking = ref(false);
const isVideoWatchedEnough = ref(false);
const videoDurationRef = ref(0);
const videoCurrentTime = ref(0);
let saveProgressInterval = null;

let lastSeekWarnTime = 0;

const readingTimeLeft = ref(0);
const readingTotalSeconds = ref(180);
const isReadingTimeFinished = ref(false);
let readingTimer = null;

const currentModuleId = ref(null);
const isDownloading = ref({});
const isIssuingCert = ref(false);
const showCourseCompletedModal = ref(false);

const downloadCertificate = async () => {
	if (isIssuingCert.value) return;
	isIssuingCert.value = true;
	try {
		const { data } = await certificateAPI.issue(route.params.courseId);
		if (data && data.pdfUrl) {
			const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5100";
			const fullUrl = data.pdfUrl.startsWith("http")
				? data.pdfUrl
				: `${baseUrl}${data.pdfUrl}`;
			window.open(fullUrl, "_blank");
		} else {
			toast.info("Chứng chỉ đang được khởi tạo, vui lòng đợi trong giây lát.");
		}
	} catch {
		toast.error("Không tìm thấy chứng chỉ hoặc bạn chưa hoàn thành khóa học.");
	} finally {
		isIssuingCert.value = false;
	}
};

const isSidebarCollapsed = ref(false);
const isFocusMode = ref(false);
const expandedModules = ref(new Set());
const activeTab = ref("overview");

const quizStarted = ref(false);
const quizResult = ref(null);
const selectedAnswers = ref({});
const isLoadingQuizDetails = ref(false);
const quizRetryCountdown = ref(0);
let quizRetryInterval = null;

const newQuestion = ref("");
const newNote = ref("");
const replyTo = ref(null);
const replyContent = ref("");

let signalrConnection = null;
let signalRCurrentLessonId = null;
let hlsInstance = null;

const renderMarkdown = (text) => {
	if (!text) return "";
	return DOMPurify.sanitize(marked.parse(text));
};

const availableTabs = computed(() => {
	const baseTabs = [
		{ id: "overview", label: "Tổng quan", icon: Info },
		{ id: "ai-chat", label: "Hỏi đáp AI", icon: Bot },
		{ id: "resources", label: "Tài nguyên", icon: Paperclip },
		{ id: "qa", label: "Hỏi đáp", icon: MessageCircle },
		{ id: "notes", label: "Ghi chú", icon: StickyNote },
	];
	if (lesson.value?.hasQuiz) {
		baseTabs.splice(1, 0, { id: "quiz", label: "Bài tập", icon: HelpCircle });
	}
	return baseTabs;
});

const isCompleted = computed(() =>
	lessonProgresses.value.some(
		(lp) => lp.lessonId === lesson.value?.id && lp.isCompleted,
	),
);

const isCurrentLessonQuizPassed = computed(() => {
	const currentLP = lessonProgresses.value.find(
		(lp) => lp.lessonId === lesson.value?.id,
	);
	return currentLP?.isQuizPassed || false;
});

const canCompleteManual = computed(() => {
	if (lesson.value?.type === "Video") {
		if (!isVideoWatchedEnough.value && !isCompleted.value) return false;
	} else if (lesson.value?.type === "Text") {
		if (!isReadingTimeFinished.value && !isCompleted.value) return false;
	}

	if (lesson.value?.hasQuiz && !isCurrentLessonQuizPassed.value) return false;
	return true;
});

const isAdmin = computed(
	() =>
		authStore.user?.role === "Admin" || authStore.user?.role === "Instructor",
);

const completeBtnMessage = computed(() => {
	if (savingProgress.value) return "Đang lưu tiến độ...";

	if (
		lesson.value?.type === "Video" &&
		!isVideoWatchedEnough.value &&
		!isCompleted.value
	) {
		return `🔒 Hãy xem hết video để hoàn thành (${videoWatchPercent.value}%)`;
	}

	if (
		lesson.value?.type === "Text" &&
		!isReadingTimeFinished.value &&
		!isCompleted.value
	) {
		return `🔒 Hãy đọc kỹ tài liệu (${readingTimeLeft.value}s)`;
	}

	if (lesson.value?.hasQuiz && !isCurrentLessonQuizPassed.value) {
		const passScore = lesson.value?.quiz?.passScore || 5;
		return `🔒 Yêu cầu: Đạt ≥ ${passScore} điểm bài tập để hoàn thành`;
	}
	return "Xác nhận hoàn thành bài học";
});

const activeModuleName = computed(() => {
	const mod = course.value?.modules.find((m) =>
		m.lessons.some((l) => l.id === lesson.value?.id),
	);
	return mod?.title || "";
});

const allLessons = computed(() => {
	if (!course.value) return [];
	return course.value.modules.flatMap((m) => m.lessons);
});

const isAllLessonsCompleted = computed(() => {
	if (!allLessons.value.length) return false;
	return allLessons.value.every((l) => isLessonDone(l.id));
});

const nextLesson = computed(() => {
	if (!lesson.value) return null;
	const lessons = allLessons.value;
	const idx = lessons.findIndex((l) => l.id === lesson.value.id);
	return idx < lessons.length - 1 ? lessons[idx + 1] : null;
});

const prevLesson = computed(() => {
	if (!lesson.value) return null;
	const lessons = allLessons.value;
	const idx = lessons.findIndex((l) => l.id === lesson.value.id);
	return idx > 0 ? lessons[idx - 1] : null;
});

const videoWatchPercent = computed(() => {
	if (!videoDurationRef.value || videoDurationRef.value <= 0) return 0;
	return Math.min(
		100,
		Math.round((maxWatchedTime.value / videoDurationRef.value) * 100),
	);
});

const readingProgressPercent = computed(() => {
	if (!readingTotalSeconds.value) return 0;
	const elapsed = readingTotalSeconds.value - readingTimeLeft.value;
	return Math.min(100, Math.round((elapsed / readingTotalSeconds.value) * 100));
});

function getLessonProgressPercent(lessonId) {
	const lp = lessonProgresses.value.find((p) => p.lessonId === lessonId);
	return lp ? Math.round(lp.progressPercent || 0) : 0;
}

function toggleSidebar() {
	isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

function toggleModule(id) {
	if (expandedModules.value.has(id)) expandedModules.value.delete(id);
	else expandedModules.value.add(id);
}

function formatRetryCountdown(seconds) {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

watch(
	() => lesson.value?.id,
	() => {
		if (readingTimer) {
			clearInterval(readingTimer);
			readingTimer = null;
		}
		isReadingTimeFinished.value = false;
		readingTimeLeft.value = 0;
		readingTotalSeconds.value = 180;

		if (lesson.value?.type === "Text" && !isCompleted.value) {
			const total = lesson.value.readingDurationSeconds || 180;
			readingTotalSeconds.value = total;
			readingTimeLeft.value = total;
			readingTimer = setInterval(() => {
				if (readingTimeLeft.value > 0) {
					readingTimeLeft.value--;
				} else {
					isReadingTimeFinished.value = true;
					clearInterval(readingTimer);
					readingTimer = null;
					if (!isCompleted.value) {
						if (lesson.value?.hasQuiz) {
							progressAPI.complete(lesson.value.id, false);
							activeTab.value = "quiz";
							toast.info("Đã xem xong tài liệu, hãy làm bài tập củng cố!");
						} else {
							completeLesson();
						}
					}
				}
			}, 1000);
		} else {
			isReadingTimeFinished.value = true;
		}
	},
	{ immediate: true },
);

watch(
	() => activeTab.value,
	async (newTab) => {
		if (newTab === "quiz" && lesson.value?.hasQuiz && !lesson.value?.quiz) {
			await loadQuizDetails();
		}
	},
);

watch(
	() => route.query.tab,
	(newTab) => {
		if (newTab && newTab !== activeTab.value) {
			activeTab.value = newTab;
			nextTick(() => {
				if (tabsContainer.value)
					tabsContainer.value.scrollIntoView({
						behavior: "smooth",
						block: "start",
					});
			});
		}
	},
);

async function loadData() {
	const { courseId, lessonId } = route.params;
	if (!course.value || String(course.value.id) !== String(courseId)) {
		loading.value = true;
	}
	error.value = null;

	try {
		const courseRes = await courseAPI.getById(courseId);
		let progressRes;
		try {
			progressRes = await progressAPI.getLessonProgresses(courseId);
		} catch {
			progressRes = { data: [] };
		}

		if (courseRes.data.modules) {
			courseRes.data.modules = courseRes.data.modules.map((m) => ({
				...m,
				lessons: m.lessons.map((l) => ({
					...l,
					hasQuiz: !!l.quizId,
					quizId: l.quizId,
					quiz: null,
				})),
			}));
		}

		course.value = courseRes.data;
		lessonProgresses.value = progressRes.data;

		const allLessons = course.value.modules?.flatMap((m) => m.lessons) ?? [];
		const targetLesson = allLessons.find(
			(l) => String(l.id) === String(lessonId),
		);

		if (!targetLesson) {
			error.value = "Không tìm thấy bài học.";
			return;
		}

		if (!canAccess(targetLesson)) {
			toast.warning(
				"🔒 Bài học này đang bị khóa. Bạn cần hoàn thành các bài học trước đó để mở khóa nội dung này.",
			);
			const lastAccessibleLesson = [...allLessons]
				.reverse()
				.find((l) => canAccess(l));
			if (lastAccessibleLesson) {
				router.replace(`/learn/${courseId}/${lastAccessibleLesson.id}`);
				return;
			}
		}

		lesson.value = targetLesson;

		const activeMod = course.value.modules.find((m) =>
			m.lessons.some((l) => l.id === lesson.value.id),
		);
		if (activeMod) {
			expandedModules.value.add(activeMod.id);
			currentModuleId.value = activeMod.id;
		}

		maxWatchedTime.value = 0;
		lastSavedTime.value = 0;
		videoDurationRef.value = 0;
		isVideoWatchedEnough.value =
			isCompleted.value || lesson.value.type !== "Video";
		if (saveProgressInterval) {
			clearInterval(saveProgressInterval);
			saveProgressInterval = null;
		}

		activeTab.value = route.query.tab || "overview";
		quizStarted.value = false;
		quizResult.value = null;
		selectedAnswers.value = {};
		if (quizRetryInterval) {
			clearInterval(quizRetryInterval);
			quizRetryInterval = null;
		}
		quizRetryCountdown.value = 0;

		await refreshProgress(false);
		loadQA();
		loadNotes();

		if (activeTab.value === "quiz" && lesson.value.hasQuiz) {
			await loadQuizDetails();
		}
	} catch {
		error.value = "Lỗi tải dữ liệu.";
	} finally {
		loading.value = false;
		nextTick(() => {
			setupHls();
			updateSignalRLessonGroup();
		});
	}
}

function setupHls() {
	if (
		!videoRef.value ||
		!lesson.value?.videoUrl ||
		!lesson.value.videoUrl.endsWith(".m3u8")
	)
		return;
	const video = videoRef.value;
	const url = getFullMediaUrl(lesson.value.videoUrl);

	if (Hls.isSupported()) {
		if (hlsInstance) {
			hlsInstance.destroy();
			hlsInstance = null;
		}
		const hls = new Hls();

		hls.on(Hls.Events.ERROR, (event, data) => {
			if (data.fatal) {
				switch (data.type) {
					case Hls.ErrorTypes.NETWORK_ERROR:
						hls.startLoad();
						break;
					case Hls.ErrorTypes.MEDIA_ERROR:
						hls.recoverMediaError();
						break;
					default:
						hls.destroy();
						hlsInstance = null;
						break;
				}
			}
		});

		hls.on(Hls.Events.MANIFEST_PARSED, () => {});

		hls.loadSource(url);
		hls.attachMedia(video);
		hlsInstance = hls;
	} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
		video.src = url;
	}
}

async function ensureSignalRConnection() {
	if (
		signalrConnection &&
		signalrConnection.state === signalR.HubConnectionState.Connected
	)
		return;

	const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5100";
	signalrConnection = new signalR.HubConnectionBuilder()
		.withUrl(`${apiBaseUrl}/hubs/video`)
		.withAutomaticReconnect()
		.build();

	signalrConnection.on("VideoStatusUpdated", (lessonId, status, videoUrl) => {
		if (lesson.value && lesson.value.id === lessonId) {
			lesson.value.videoStatus = status;
			lesson.value.videoUrl = videoUrl;
			if (status === "Ready") {
				toast.success("Video đã xử lý xong! Bạn có thể xem ngay.");
				nextTick(() => setupHls());
			}
		}
	});

	signalrConnection.on("AiProcessingCompleted", () => {});

	try {
		await signalrConnection.start();
	} catch {}
}

async function updateSignalRLessonGroup() {
	await ensureSignalRConnection();
	if (
		!signalrConnection ||
		signalrConnection.state !== signalR.HubConnectionState.Connected
	)
		return;

	if (signalRCurrentLessonId && signalRCurrentLessonId !== lesson.value?.id) {
		try {
			await signalrConnection.invoke(
				"LeaveLessonGroup",
				signalRCurrentLessonId,
			);
		} catch {}
	}
	if (lesson.value) {
		try {
			await signalrConnection.invoke("JoinLessonGroup", lesson.value.id);
			signalRCurrentLessonId = lesson.value.id;
		} catch {}
	}
}

function canAccess(l) {
	if (authStore.user?.role === "Admin" || authStore.user?.role === "Instructor")
		return true;

	const lessons = allLessons.value;
	const idx = lessons.findIndex((x) => x.id === l.id);
	if (idx === 0 || l.isFreePreview) return true;
	return isLessonDone(lessons[idx - 1].id);
}

function isLessonDone(id) {
	return lessonProgresses.value.some(
		(lp) => lp.lessonId === id && lp.isCompleted,
	);
}

function isLessonQuizPassed(id) {
	return lessonProgresses.value.some(
		(lp) => lp.lessonId === id && lp.isQuizPassed,
	);
}

function onVideoLoaded(e) {
	const video = e.target;
	videoDurationRef.value = video.duration || 0;

	const currentProgress = lessonProgresses.value.find(
		(lp) => lp.lessonId === lesson.value?.id,
	);

	if (currentProgress?.isCompleted) {
		video.currentTime = 0;
		maxWatchedTime.value = 0;
		lastCurrentTime.value = 0;
	} else if (currentProgress) {
		const resumeTime = currentProgress.videoPositionSeconds || 0;
		if (resumeTime > 0) {
			maxWatchedTime.value = resumeTime;
			lastCurrentTime.value = resumeTime;
			video.currentTime = resumeTime;
		}
	} else {
		maxWatchedTime.value = 0;
		lastCurrentTime.value = 0;
	}

	if (saveProgressInterval) clearInterval(saveProgressInterval);
	saveProgressInterval = setInterval(() => {
		if (
			video.currentTime > 0 &&
			Math.abs(video.currentTime - lastSavedTime.value) > 5
		) {
			syncVideoProgress(video.currentTime, video.duration);
		}
	}, 10000);
}

function onSeeking() {
	if (!isSeeking.value) {
		preSeekTime.value = lastCurrentTime.value;
	}
	isSeeking.value = true;
}

function onSeeked(e) {
	const video = e.target;
	isSeeking.value = false;

	if (isAdmin.value || isCompleted.value) {
		lastCurrentTime.value = video.currentTime;
		if (video.currentTime > maxWatchedTime.value) {
			maxWatchedTime.value = video.currentTime;
		}
		return;
	}

	if (video.currentTime > maxWatchedTime.value + 1) {
		const now = Date.now();
		if (now - lastSeekWarnTime > 3000) {
			toast.warning(
				"Bạn không thể tua qua phần nội dung chưa học. Hãy tập trung hoàn thành bài học nhé!",
			);
			lastSeekWarnTime = now;
		}
		video.currentTime = maxWatchedTime.value;
		lastCurrentTime.value = maxWatchedTime.value;
	} else {
		lastCurrentTime.value = video.currentTime;
	}
}

function onTimeUpdate(e) {
	const video = e.target;
	const current = video.currentTime;
	videoCurrentTime.value = current;

	if (!videoDurationRef.value && video.duration)
		videoDurationRef.value = video.duration;

	if (!isSeeking.value) {
		if (current > maxWatchedTime.value) {
			if (current - maxWatchedTime.value < 2) {
				maxWatchedTime.value = current;
			} else if (!isAdmin.value && !isCompleted.value) {
				video.currentTime = maxWatchedTime.value;
			}
		}
		lastCurrentTime.value = current;
	}

	if (
		!isCompleted.value &&
		videoDurationRef.value > 0 &&
		maxWatchedTime.value >= videoDurationRef.value * 0.95
	) {
		if (!isVideoWatchedEnough.value) {
			isVideoWatchedEnough.value = true;
			if (!savingProgress.value && !lesson.value?.hasQuiz) {
				completeLesson();
			}
		}
	}
}

function syncVideoProgress(currentSeconds, duration) {
	if (isCompleted.value || currentSeconds <= 0 || !duration) return;
	const percent = Math.floor((currentSeconds / duration) * 100);
	progressAPI.updateVideoPosition(
		lesson.value.id,
		Math.floor(currentSeconds),
		percent,
	);
	lastSavedTime.value = currentSeconds;
}

function seekVideo(seconds) {
	if (videoRef.value && seconds !== null) {
		if (seconds > maxWatchedTime.value) maxWatchedTime.value = seconds;
		videoRef.value.currentTime = seconds;
		videoRef.value.play();
		window.scrollTo({ top: 0, behavior: "smooth" });
	}
}

onBeforeUnmount(async () => {
	if (saveProgressInterval) clearInterval(saveProgressInterval);
	if (readingTimer) clearInterval(readingTimer);
	if (quizRetryInterval) clearInterval(quizRetryInterval);
	if (signalrConnection) {
		if (signalRCurrentLessonId) {
			try {
				await signalrConnection.invoke(
					"LeaveLessonGroup",
					signalRCurrentLessonId,
				);
			} catch {}
		}
		await signalrConnection.stop();
	}
});

async function loadQuizDetails() {
	if (!lesson.value || !lesson.value.quizId || lesson.value.quiz) return;
	isLoadingQuizDetails.value = true;
	try {
		const res = await quizAPI.getById(lesson.value.quizId);
		lesson.value.quiz = {
			title: res.data.title || "Bài kiểm tra nhanh",
			passScore: 5,
			questions: (res.data.questions || []).map((q) => ({
				id: q.id,
				questionText: q.questionText,
				options: { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD },
				correctAnswer: q.correctAnswer,
				points: 1,
			})),
		};
	} catch {
	} finally {
		isLoadingQuizDetails.value = false;
	}
}

async function startMiniQuiz() {
	if (!lesson.value?.quizId) return;
	try {
		const { data } = await quizAPI.start(lesson.value.quizId);
		lesson.value.attemptId = data.attemptId;
		quizStarted.value = true;
		quizResult.value = null;
		selectedAnswers.value = {};
		if (data.remainingAttemptsToday !== undefined) {
			toast.info(
				`Bắt đầu bài tập. Bạn còn ${data.remainingAttemptsToday} lượt làm bài trong hôm nay.`,
			);
		}
	} catch (e) {
		toast.error(e.response?.data?.message || "Không thể bắt đầu bài tập.");
	}
}

async function submitMiniQuiz() {
	if (!lesson.value.attemptId) return;
	const answerList = Object.entries(selectedAnswers.value).map(
		([questionId, selectedAnswer]) => ({
			questionId: parseInt(questionId),
			selectedAnswer,
		}),
	);
	try {
		const { data } = await quizAPI.submit(lesson.value.attemptId, answerList);
		quizResult.value = {
			score: data.score,
			totalScore: 10,
			passed: data.isPassed,
			details: data.details,
		};
		if (data.isPassed) {
			toast.success("Chúc mừng! Bạn đã đạt bài tập củng cố.");
			if (!isCompleted.value) completeLesson(true);
		} else {
			const remainingText =
				data.remainingAttemptsToday > 0
					? ` Bạn còn ${data.remainingAttemptsToday} lần làm lại trong hôm nay.`
					: " Bạn đã hết lượt thi trong hôm nay.";
			toast.warning(
				`Rất tiếc, bạn chưa đạt điểm. Theo quy định, bạn cần ôn tập và chờ 5 phút để làm lại.${remainingText}`,
			);

			startRetryCountdown(300);
		}
	} catch (e) {
		toast.error(e.response?.data?.message || "Lỗi nộp bài.");
	}
}

function startRetryCountdown(seconds) {
	if (quizRetryInterval) clearInterval(quizRetryInterval);
	quizRetryCountdown.value = seconds;
	quizRetryInterval = setInterval(() => {
		if (quizRetryCountdown.value > 0) {
			quizRetryCountdown.value--;
		} else {
			clearInterval(quizRetryInterval);
			quizRetryInterval = null;
		}
	}, 1000);
}

function retryMiniQuiz() {
	if (quizRetryCountdown.value > 0) return;
	quizStarted.value = false;
	quizResult.value = null;
	selectedAnswers.value = {};
}

async function completeLesson(isQuizPassedArg = false) {
	const isQuizPassed =
		typeof isQuizPassedArg === "boolean" ? isQuizPassedArg : false;
	if (!lesson.value?.id) return;
	savingProgress.value = true;
	try {
		await progressAPI.complete(lesson.value.id, isQuizPassed);
		await refreshProgress(true);

		if (lesson.value?.hasQuiz && !isQuizPassed) {
			activeTab.value = "quiz";
			toast.success("Nội dung đã hoàn thành! Hãy làm bài tập bên dưới.");
			return;
		}

		toast.success("Đã hoàn thành bài học!");
		if (nextLesson.value) setTimeout(goToNextLesson, 1500);
	} catch (err) {
		if (err.response?.status === 400 && err.response.data?.errors) {
			const errMsgs = Object.values(err.response.data.errors).flat().join(", ");
			toast.error(`Dữ liệu không hợp lệ: ${errMsgs}`);
		} else {
			toast.error(
				err.response?.data?.message || "Lỗi khi ghi nhận hoàn thành bài học.",
			);
		}
	} finally {
		savingProgress.value = false;
	}
}

async function refreshProgress(fetchLessonProgress = true) {
	try {
		const { data: cp } = await progressAPI.getCourseProgress(
			route.params.courseId,
		);
		courseProgress.value = cp;
		if (cp.isCompleted) {
			const storageKey = `modal_shown_${route.params.courseId}`;
			if (!sessionStorage.getItem(storageKey)) {
				triggerCourseCompletion();
				sessionStorage.setItem(storageKey, "true");
			}
		}
		if (fetchLessonProgress) {
			const { data: lp } = await progressAPI.getLessonProgresses(
				route.params.courseId,
			);
			lessonProgresses.value = lp;
		}
	} catch {}
}

async function triggerCourseCompletion() {
	showCourseCompletedModal.value = true;
	isIssuingCert.value = true;
	try {
		await certificateAPI.issue(route.params.courseId);
		toast.success(
			"Chúc mừng! Khóa học đã hoàn thành và chứng chỉ đã được cấp.",
		);
	} catch {
	} finally {
		isIssuingCert.value = false;
	}
}

async function downloadFile(att) {
	if (isDownloading.value[att.id]) return;
	isDownloading.value[att.id] = true;
	try {
		const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5100";
		const absoluteUrl = `${baseUrl.replace(/\/$/, "")}/api/modules/${currentModuleId.value}/lessons/attachments/${att.id}/download`;
		const response = await api.get(absoluteUrl, { responseType: "blob" });
		const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
		const link = document.createElement("a");
		link.href = blobUrl;
		link.setAttribute("download", att.fileName);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(blobUrl);
	} catch {
		toast.error("Không thể tải tài liệu.");
	} finally {
		isDownloading.value[att.id] = false;
	}
}

function navigateLesson(l, targetTab = "overview") {
	if (!canAccess(l)) return;
	if (
		String(l.id) === String(lesson.value?.id) &&
		targetTab === activeTab.value
	)
		return;

	router.push({
		path: `/learn/${route.params.courseId}/${l.id}`,
		query: { tab: targetTab },
	});
}

function goToNextLesson() {
	if (nextLesson.value) navigateLesson(nextLesson.value, "overview");
}

function navigatePrev() {
	if (prevLesson.value) navigateLesson(prevLesson.value, "overview");
}

async function postQuestion() {
	if (!newQuestion.value.trim()) return;
	await qaAPI.create(lesson.value.id, { content: newQuestion.value });
	newQuestion.value = "";
	loadQA();
}

async function postReply(parentId) {
	if (!replyContent.value.trim()) return;
	await qaAPI.create(lesson.value.id, {
		content: replyContent.value,
		parentId,
	});
	replyContent.value = "";
	replyTo.value = null;
	loadQA();
}

async function saveNote() {
	if (!newNote.value.trim()) return;
	let timestamp = null;
	if (lesson.value?.type === "Video" && videoRef.value) {
		timestamp = Math.floor(videoRef.value.currentTime);
	}
	await noteAPI.create(lesson.value.id, {
		content: newNote.value,
		videoTimestampSeconds: timestamp,
	});
	newNote.value = "";
	loadNotes();
}

async function deleteNote(id) {
	await noteAPI.delete(lesson.value.id, id);
	loadNotes();
}

async function loadQA() {
	const { data } = await qaAPI.getAll(route.params.lessonId);
	qaList.value = data;
}

async function loadNotes() {
	const { data } = await noteAPI.getAll(route.params.lessonId);
	notes.value = data;
}

function isYouTubeUrl(url) {
	return url?.includes("youtube.com") || url?.includes("youtu.be");
}

function getFullMediaUrl(url) {
	const baseUrl = import.meta.env.VITE_API_URL || "";
	return url?.startsWith("http")
		? url
		: `${baseUrl}${url?.startsWith("/") ? "" : "/"}${url}`;
}

function getEmbedUrl(url) {
	if (!url) return "";
	const ytMatch = url.match(
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
	);
	return ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : url;
}

function formatTime(s) {
	if (!s) return "0:00";
	return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function formatDate(d) {
	return new Date(d).toLocaleDateString("vi-VN");
}

function getOptionText(questionId, optionKey) {
	if (
		!lesson.value ||
		!lesson.value.quiz ||
		!lesson.value.quiz.questions ||
		!optionKey
	)
		return optionKey;
	const q = lesson.value.quiz.questions.find((x) => x.id === questionId);
	if (!q || !q.options || !q.options[optionKey]) return optionKey;
	return `${optionKey}. ${q.options[optionKey]}`;
}

function getAvatarUrl(url) {
	return url?.startsWith("http")
		? url
		: `${import.meta.env.VITE_API_URL}${url}`;
}

onMounted(loadData);
watch(() => route.params.lessonId, loadData);
</script>

<style scoped>
/* Styling Refinements for "Neat" Layout */
.learning-player {
	--primary-400: #6366f1;
	--primary-500: #4f46e5;
	--primary-600: #4338ca;
	--bg-primary: #f8fafc;
	--bg-secondary: #ffffff;
	--bg-tertiary: #f1f5f9;
	--bg-card: #ffffff;
	--text-primary: #0f172a;
	--text-secondary: #475569;
	--text-tertiary: #94a3b8;
	--border-color: rgba(226, 232, 240, 1);
	--shadow-premium: 0 10px 30px -5px rgba(0, 0, 0, 0.04);
}

:is([data-theme="dark"], [data-bs-theme="dark"]) .learning-player {
	--bg-primary: #0f111a;
	--bg-secondary: #1e213a;
	--bg-tertiary: #2d314d;
	--bg-card: #16182d;
	--text-primary: #f8fafc;
	--text-secondary: #cbd5e1;
	--text-tertiary: #94a3b8;
	--border-color: rgba(255, 255, 255, 0.1);
	--shadow-premium: 0 10px 40px -10px rgba(0, 0, 0, 0.4);
	--header-glass: rgba(30, 41, 59, 0.5);
}

.learning-player {
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 24px;
	background: var(--bg-primary);
	min-height: 100%;
}

.player-header-card {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 16px;
	padding: 16px 24px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-shadow: var(--shadow-premium);
	position: sticky;
	top: 64px;
	z-index: 100;
	margin-bottom: 0;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 20px;
}

.exit-btn {
	width: 44px;
	height: 44px;
	border-radius: 12px;
	color: var(--text-secondary);
	background: var(--bg-tertiary);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	border: 1px solid transparent;
}

.exit-btn:hover {
	background: #fee2e2;
	color: #ef4444;
	border-color: #fecaca;
	transform: scale(1.05);
}

.course-info {
	display: flex;
	flex-direction: column;
}

.course-name {
	font-size: 17px;
	font-weight: 600;
	margin: 0;
	color: var(--text-primary);
	letter-spacing: -0.01em;
}

.lesson-breadcrumb {
	font-size: 12px;
	color: var(--text-tertiary);
	display: flex;
	align-items: center;
	gap: 8px;
	margin-top: 4px;
	font-weight: 500;
}

.header-right {
	display: flex;
	align-items: center;
	gap: 32px;
}

.progress-stats {
	display: flex;
	flex-direction: column;
	gap: 8px;
	width: 220px;
}

.stats-text {
	font-size: 12px;
	font-weight: 600;
	color: var(--text-secondary);
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 4px;
}

.percent-tag {
	font-weight: 700;
	color: var(--primary-500);
	font-size: 14px;
}

@media (max-width: 991px) {
	.progress-stats {
		display: none;
	}
}

.lesson-count-pill {
	background: rgba(99, 102, 241, 0.08);
	color: var(--primary-500);
	padding: 3px 10px;
	border-radius: 20px;
	font-size: 11px;
}

.progress-mini-bar {
	height: 8px;
	background: var(--bg-tertiary);
	border-radius: 10px;
	overflow: hidden;
}

.progress-mini-fill {
	height: 100%;
	background: linear-gradient(to right, var(--primary-400), var(--primary-600));
	transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-sidebar-toggle {
	height: 40px;
	padding: 0 16px;
	border-radius: 10px;
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	font-weight: 600;
	color: var(--text-primary);
	display: flex;
	align-items: center;
	gap: 8px;
	transition: all 0.2s ease;
}

:is([data-theme="dark"], [data-bs-theme="dark"]) .btn-sidebar-toggle {
	background: #2d314d !important;
	color: #ffffff !important;
	border-color: rgba(255, 255, 255, 0.1) !important;
}

.btn-sidebar-toggle:hover {
	background: var(--bg-secondary);
	color: var(--primary-500);
	border-color: var(--primary-400);
}

.player-container {
	display: flex;
	gap: 24px;
	align-items: flex-start;
}

.player-sidebar {
	width: 340px;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 16px;
	height: calc(100vh - 180px);
	position: sticky;
	top: 160px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	box-shadow: var(--shadow-premium);
	transition: all 0.3s ease;
}

.player-sidebar.collapsed {
	width: 0;
	opacity: 0;
	pointer-events: none;
	margin-left: -24px;
	border: none;
}

.sidebar-header {
	padding: 24px;
	background: var(--header-glass, rgba(248, 250, 252, 0.5));
	border-bottom: 1px solid var(--border-color);
}

.sidebar-header h3 {
	font-size: 15px;
	font-weight: 600;
	margin: 0;
	color: var(--text-primary);
}

.sidebar-content {
	flex: 1;
	overflow-y: auto;
	padding: 12px 0;
}

.player-content {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 24px;
}

.video-theater,
.text-theater {
	background: #000;
	border: 1px solid var(--border-color);
	border-radius: 20px;
	overflow: hidden;
}

.content-type-badge {
	position: absolute;
	top: 24px;
	left: 24px;
	background: rgba(15, 23, 42, 0.7);
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	padding: 6px 14px;
	border-radius: 8px;
	color: rgba(255, 255, 255, 0.95);
	font-size: 11px;
	font-weight: 600;
	letter-spacing: 0.04em;
	display: flex;
	align-items: center;
	gap: 8px;
	z-index: 10;
	border: 1px solid rgba(255, 255, 255, 0.12);
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.content-type-badge.video {
	border-left: 3px solid #6366f1;
}

.content-type-badge.text {
	background: rgba(99, 102, 241, 0.85);
	border-left: 3px solid white;
}

.video-container {
	position: relative;
	aspect-ratio: 16/9;
	background: #000;
	width: 100%;
}

.video-item,
.video-iframe {
	width: 100%;
	height: 100%;
	display: block;
	object-fit: contain;
}

.text-theater {
	background: var(--bg-card);
}

.text-content-card {
	padding: 40px;
}

.content-tabs-container {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 16px;
	overflow: hidden;
	box-shadow: var(--shadow-premium);
}

.tabs-header {
	display: flex;
	border-bottom: 1px solid var(--border-color);
	padding: 0 12px;
	background: var(--header-glass, rgba(248, 250, 252, 0.4));
}

.tab-btn {
	padding: 18px 24px;
	font-size: 14px;
	font-weight: 700;
	color: var(--text-tertiary);
	border: none;
	background: none;
	position: relative;
	display: flex;
	align-items: center;
	gap: 10px;
	transition: all 0.2s ease;
}

.tab-btn:hover {
	color: var(--text-secondary);
}

.tab-btn.active {
	color: var(--primary-500);
}

.tab-btn.active::after {
	content: "";
	position: absolute;
	bottom: 0;
	left: 20px;
	right: 20px;
	height: 4px;
	background: var(--primary-500);
	border-radius: 10px 10px 0 0;
}

.tab-content-area {
	padding: 32px;
	min-height: 400px;
}

.content-footer-nav {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 16px;
	padding: 20px 32px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-shadow: var(--shadow-premium);
}

.module-item {
	padding: 18px 24px;
	border-bottom: 1px solid var(--border-color);
	transition: all 0.2s ease;
	cursor: pointer;
}

.module-meta {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 6px;
}

.module-index {
	font-size: 10.5px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	color: var(--text-tertiary);
}

.module-title {
	font-size: 15px;
	font-weight: 500;
	margin: 0 0 6px 0;
	color: var(--text-primary);
	line-height: 1.4;
}

.module-stats {
	font-size: 12px;
	color: var(--text-tertiary);
	font-weight: 500;
}

.module-item:hover {
	background: rgba(15, 23, 42, 0.04);
}

.lesson-item {
	padding: 12px 24px;
	display: flex;
	align-items: center;
	gap: 16px;
	border-left: 4px solid transparent;
	transition: all 0.2s ease;
	cursor: pointer;
}

.lesson-item.active {
	background: rgba(99, 102, 241, 0.06);
	border-left-color: var(--primary-500);
}

.lesson-item.completed {
	background: rgba(16, 185, 129, 0.03);
}

.section-title-dot {
	font-size: 17px;
	font-weight: 700;
	color: var(--text-primary);
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 24px;
	letter-spacing: -0.01em;
}

@media (max-width: 768px) {
	.header-right {
		gap: 12px;
	}
	.player-header-card {
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
	}
	.header-right {
		width: 100%;
		justify-content: space-between;
	}
	.btn-sidebar-toggle {
		flex: 1;
		justify-content: center;
	}
	.course-name {
		font-size: 15px;
	}
}

@media (max-width: 480px) {
	.tab-btn {
		padding: 14px 12px;
		font-size: 13px;
	}
	.tab-content-area {
		padding: 20px 16px;
	}
	.content-footer-nav {
		padding: 12px 16px;
		flex-direction: column;
		height: auto;
		gap: 12px;
	}
	.footer-lesson-info {
		text-align: center;
	}
}
.qa-avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	object-fit: cover;
}
.qa-body {
	flex: 1;
}
.qa-meta {
	font-size: 11px;
	color: var(--text-tertiary, #94a3b8);
	margin-bottom: 4px;
	display: flex;
	align-items: center;
	gap: 4px;
	flex-wrap: wrap;
}
.qa-meta strong {
	color: var(--text-primary, #0f172a);
}
.qa-text {
	font-size: var(--font-size-sm, 13px);
	line-height: 1.6;
	color: var(--text-secondary, #475569);
	margin-bottom: 8px;
}
.reply-btn {
	background: none;
	border: none;
	color: var(--primary-400, #6366f1);
	font-size: 12px;
	font-weight: 600;
	cursor: pointer;
	padding: 0;
}

.replies-section {
	margin-top: var(--space-md, 12px);
	padding-left: var(--space-xl, 24px);
	border-left: 2px solid var(--border-color);
	display: flex;
	flex-direction: column;
	gap: var(--space-lg, 16px);
}
.reply-item {
	display: flex;
	gap: var(--space-md, 12px);
}

.qa-input-box textarea {
	width: 100%;
	height: 100px;
	border-radius: 14px;
	padding: 14px 18px;
	border: 1.5px solid var(--border-color);
	background: var(--bg-tertiary);
	font-size: 14px;
	transition: all 0.2s;
	resize: vertical;
	margin-bottom: 12px;
}

.qa-input-box textarea:focus {
	border-color: var(--primary-400);
	background: var(--bg-card);
	outline: none;
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.qa-actions {
	display: flex;
	justify-content: flex-end;
}

.reply-input-wrap {
	display: flex;
	flex-direction: column;
	gap: var(--space-xs, 4px);
	margin-bottom: var(--space-md, 12px);
}
.reply-input-wrap textarea {
	height: 80px;
	border-radius: 14px;
	padding: 12px 16px;
	border: 1.5px solid var(--border-color);
	resize: vertical;
	font-size: 14px;
	transition: all 0.2s;
	background: var(--bg-tertiary);
}

.reply-input-wrap textarea:focus {
	border-color: var(--primary-400);
	background: var(--bg-card);
	outline: none;
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.notes-container {
	display: flex;
	flex-direction: column;
	gap: var(--space-xl, 24px);
}

.note-input {
	padding: var(--space-lg, 16px);
	border-radius: var(--radius-lg, 12px);
	display: flex;
	flex-direction: column;
	gap: var(--space-sm, 8px);
}

.note-input textarea {
	height: 120px;
	border-radius: 14px;
	padding: 14px 18px;
	border: 1.5px solid var(--border-color);
	background: var(--bg-tertiary);
	font-size: 14px;
	transition: all 0.2s;
	resize: vertical;
}

.note-input textarea:focus {
	border-color: var(--primary-400);
	background: var(--bg-card);
	outline: none;
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
.notes-list {
	display: flex;
	flex-direction: column;
	gap: var(--space-md, 12px);
}

.note-item {
	padding: var(--space-lg, 16px);
	border-radius: var(--radius-lg, 12px);
	position: relative;
	transition: transform 0.2s;
}

.note-item:hover {
	transform: translateX(5px);
}

.note-time {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: var(--primary-600, #4338ca);
	color: white;
	padding: 4px 10px;
	border-radius: 6px;
	font-size: 11px;
	font-weight: 700;
	cursor: pointer;
	margin-bottom: 8px;
	transition: all 0.2s;
}

.note-time:hover,
.note-time:focus-visible {
	background: var(--primary-500, #6366f1);
	box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
	outline: none;
}

.note-item p {
	font-size: var(--font-size-sm, 13px);
	color: var(--text-secondary, #475569);
	line-height: 1.6;
	margin: 0;
}

.delete-note {
	position: absolute;
	top: var(--space-md, 12px);
	right: var(--space-md, 12px);
	background: none;
	border: none;
	color: var(--text-tertiary, #94a3b8);
	cursor: pointer;
	opacity: 0;
	transition: opacity 0.2s;
	padding: 4px;
	border-radius: 4px;
}

.note-item:hover .delete-note {
	opacity: 1;
}
.delete-note:hover {
	color: var(--danger-400, #f87171);
}

.content-footer-nav {
	height: 64px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 var(--space-xl, 24px);
	border-top: 1px solid var(--border-color);
	background: var(--bg-card);
	box-shadow: 0 -1px 0 var(--border-color);
	flex-shrink: 0;
}

.footer-lesson-info {
	font-size: var(--font-size-sm, 13px);
	color: var(--text-tertiary, #94a3b8);
}
.footer-lesson-info span {
	color: var(--text-primary, #0f172a);
	font-weight: 600;
	margin-left: var(--space-sm, 8px);
}

.lesson-switch-overlay {
	position: fixed;
	inset: 0;
	z-index: 5000;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	padding-bottom: 80px;
	pointer-events: none;
}

.lesson-switch-card {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 20px;
	border-radius: 40px;
	background: var(--bg-secondary, #ffffff);
	border: 1px solid var(--border-color);
	font-size: 14px;
	color: var(--text-secondary, #475569);
	box-shadow: var(--shadow-md);
	box-shadow: var(--shadow-md);
}

.glass-modal-overlay {
	position: fixed;
	inset: 0;
	background: rgba(15, 23, 42, 0.3);
	backdrop-filter: blur(8px);
	z-index: 2000;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
	animation: fadeIn 0.3s ease;
}

.animate-slide-up {
	animation: slide-up 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes slide-up {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.animate-bounce {
	animation: bounce 2s infinite;
}
@keyframes bounce {
	0%,
	20%,
	50%,
	80%,
	100% {
		transform: translateY(0);
	}
	40% {
		transform: translateY(-20px);
	}
	60% {
		transform: translateY(-10px);
	}
}

.animate-fade-in {
	animation: fadeIn 0.25s ease;
}
@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(6px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.player-loading,
.player-error {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 16px;
	min-height: 100vh;
	color: var(--text-secondary, #475569);
}

.loading-spinner {
	width: 40px;
	height: 40px;
	border: 3px solid rgba(99, 102, 241, 0.15);
	border-top-color: var(--primary-500, #6366f1);
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

.loading-spinner.sm {
	width: 18px;
	height: 18px;
	border-width: 2px;
}
@keyframes spin {
	100% {
		transform: rotate(360deg);
	}
}

.custom-scrollbar::-webkit-scrollbar {
	width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
	background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	background: var(--border-color);
	border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
	background: var(--text-tertiary, #94a3b8);
}

.glass {
	background: var(--bg-card);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	border: 1px solid var(--border-color);
}

.card {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-lg, 12px);
}

.sidebar-backdrop {
	display: none;
}

.focus-mode-btn {
	color: var(--text-tertiary, #94a3b8) !important;
}
.focus-mode-btn:hover {
	background: rgba(255, 255, 255, 0.1) !important;
	color: white !important;
}

.hide-desktop {
	display: none;
}
@media (max-width: 1024px) {
	.hide-desktop {
		display: flex;
	}
	.hide-mobile {
		display: none;
	}
}
@media (max-width: 1200px) {
	.content-primary {
		max-width: calc(100% - 32px);
	}
}

/* ==========================================================================
   Comprehensive Responsive System
   ========================================================================== */

/* Large Tablets & Small Desktops (max-width: 1200px) */
@media (max-width: 1200px) {
	.player-sidebar {
		width: 300px;
	}
}

/* Tablets (max-width: 1024px) */
@media (max-width: 1024px) {
	.learning-player {
		padding: 12px;
		gap: 12px;
	}

	.player-container {
		flex-direction: column;
		gap: 16px;
	}

	.player-sidebar {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		height: 100vh !important;
		width: 280px !important;
		z-index: 10000;
		transform: translateX(0);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border-radius: 0 16px 16px 0;
		box-shadow: 20px 0 50px rgba(0, 0, 0, 0.2);
	}

	.player-sidebar.collapsed {
		transform: translateX(-100%);
		width: 280px !important;
		margin-left: 0;
		opacity: 1;
		pointer-events: none;
	}

	.sidebar-backdrop {
		display: block;
		position: fixed;
		inset: 0;
		background: rgba(15, 23, 42, 0.6) !important;
		backdrop-filter: blur(4px);
		z-index: 9999;
		animation: fadeIn 0.3s ease;
	}

	.player-header-card {
		z-index: 900;
		padding: 12px 16px;
		position: sticky;
		top: 0; /* Align with system header height if needed, otherwise 0 suffices if inside layout scroll */
	}

	.player-content {
		width: 100%;
	}

	.hide-mobile {
		display: none !important;
	}
	.hide-desktop {
		display: flex !important;
	}
}

/* Mobile Devices (max-width: 768px) */
@media (max-width: 768px) {
	.player-header-card {
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
	}

	.header-right {
		width: 100%;
		justify-content: space-between;
		gap: 8px;
	}

	.progress-stats {
		flex: 1;
		max-width: 200px;
	}

	.course-name {
		font-size: 15px;
		max-width: 100%;
	}

	.video-theater,
	.text-theater {
		border-radius: 0;
		margin: 0 -12px;
		width: calc(100% + 24px);
		border-left: none;
		border-right: none;
	}

	.tab-content-area {
		padding: 20px 16px;
	}

	.btn-sidebar-toggle {
		flex: 0 0 auto;
		padding: 0 12px;
	}
}

/* Small Phones (max-width: 480px) */
@media (max-width: 480px) {
	.learning-player {
		padding: 8px;
	}

	.player-header-card {
		padding: 12px;
	}

	.tab-btn {
		padding: 14px 10px;
		font-size: 12px;
		gap: 6px;
	}

	.tab-btn span {
		display: none;
	}

	.content-footer-nav {
		flex-direction: column;
		height: auto;
		padding: 16px;
		gap: 12px;
	}

	.footer-lesson-info {
		text-align: center;
		width: 100%;
	}

	.btn-complete-premium,
	.btn-next-direct {
		width: 100%;
		justify-content: center;
	}
}

.system-header-bar,
.player-user-menu,
.user-avatar,
.user-dropdown {
	display: none;
}

/* Custom Sub-header Styles */
.player-header-card .course-name {
	font-size: 17px;
	font-weight: 700;
	margin: 0;
	color: var(--text-primary);
}

.player-header-card .lesson-breadcrumb {
	font-size: 12px;
	color: #94a3b8;
	margin-top: 4px;
}

.percent-tag {
	font-weight: 700;
	color: var(--text-primary);
}

.lesson-count-pill {
	background: rgba(99, 102, 241, 0.1);
	padding: 2px 8px;
	border-radius: 20px;
	color: var(--primary-400);
}

.btn-sidebar-toggle {
	background: #f1f3f9;
	border: none;
	padding: 8px 16px;
	border-radius: 8px;
	color: var(--text-secondary);
}

.btn-sidebar-toggle:hover {
	background: #e2e8f0;
}

@media (max-width: 1024px) {
	.player-container {
		flex-direction: column;
	}
	.player-sidebar {
		width: 100%;
		height: auto;
		position: fixed;
		top: 60px;
		left: 0;
		bottom: 0;
		z-index: 999;
	}
}
</style>
