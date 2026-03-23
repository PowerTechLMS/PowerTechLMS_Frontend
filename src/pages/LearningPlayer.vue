<template>
	<div
		class="learning-player"
		:class="{
			'sidebar-collapsed': isSidebarCollapsed,
			'focus-mode': isFocusMode,
		}"
	>
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
			<header class="player-header-bar glass">
				<div class="header-left">
					<button
						class="btn-icon btn-ghost"
						aria-label="Thoát bài học"
						@click="$router.push('/admin/courses')"
					>
						<X :size="20" />
					</button>
					<div class="course-info">
						<h1 class="course-name">
							{{ course?.title }}
						</h1>
						<div class="lesson-breadcrumb">
							<span>{{ activeModuleName }}</span>
							<ChevronRight :size="12" />
							<span class="active-lesson">{{ lesson?.title }}</span>
						</div>
					</div>
				</div>

				<div class="header-right">
					<div class="progress-stats">
						<div class="stats-text">
							Tiến độ:
							<span
								>{{ Math.round(courseProgress?.progressPercent || 0) }}%</span
							>
							<span class="lesson-count-text ms-2">
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
						class="btn btn-secondary btn-sm"
						aria-label="Mở/thu gọn danh sách bài học"
						@click="toggleSidebar"
					>
						<LayoutList :size="16" />
						<span class="hide-mobile">{{
							isSidebarCollapsed ? "Mở danh sách" : "Thu gọn"
						}}</span>
					</button>
					<button
						class="btn btn-icon btn-ghost sm ms-2 focus-mode-btn"
						:aria-label="
							isFocusMode ? 'Thoát chế độ tập trung' : 'Bật chế độ tập trung'
						"
						:title="isFocusMode ? 'Thoát Focus Mode' : 'Chế độ tập trung'"
						@click="toggleFocusMode"
					>
						<Maximize v-if="!isFocusMode" :size="20" />
						<Minimize v-else :size="20" />
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
										v-if="l.hasQuiz"
										class="lesson-item quiz-sub-item"
										:class="{
											active: l.id === lesson?.id && activeTab === 'quiz',
											locked: !canAccess(l),
										}"
										role="button"
										:tabindex="canAccess(l) ? 0 : -1"
										:aria-label="`Bài tập: ${l.quiz?.title || 'Củng cố kiến thức'}`"
										@click="navigateLesson(l, 'quiz')"
										@keydown.enter.space.prevent="navigateLesson(l, 'quiz')"
									>
										<div class="lesson-status">
											<CheckCircle
												v-if="isLessonDone(l.id)"
												:size="14"
												class="done-icon"
											/>
											<HelpCircle v-else :size="14" class="todo-icon" />
										</div>
										<div class="lesson-info">
											<span class="l-title text-primary fw-medium">
												Bài tập: {{ l.quiz?.title || "Củng cố kiến thức" }}
											</span>
											<div class="l-meta text-primary opacity-75">
												<HelpCircle :size="12" />
												<span
													>{{ l.quiz?.questions?.length || 0 }} câu hỏi</span
												>
											</div>
										</div>
									</div>
								</template>
							</div>
						</div>

						<template v-if="course?.extraQuizzes?.length">
							<div
								v-for="q in course.extraQuizzes"
								:key="q.id"
								class="module-group"
								:class="{ active: $route.params.quizId == q.id }"
							>
								<div
									class="lesson-item quiz-item final-quiz-item"
									:class="{
										completed: courseProgress?.passedQuizIds?.includes(q.id),
									}"
									role="button"
									tabindex="0"
									:aria-label="`Kiểm tra chung: ${q.title}`"
									@click="router.push(`/quiz/${q.id}?courseId=${course.id}`)"
									@keydown.enter.space.prevent="
										router.push(`/quiz/${q.id}?courseId=${course.id}`)
									"
								>
									<div class="lesson-status">
										<CheckCircle
											v-if="courseProgress?.passedQuizIds?.includes(q.id)"
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
						<div v-if="lesson?.type === 'Video'" class="video-theater glass">
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

						<div v-else-if="lesson?.type === 'Text'" class="text-theater glass">
							<div class="content-type-badge text">
								<FileText :size="14" /> TÀI LIỆU BÀI ĐỌC
							</div>
							<div class="text-content-card glass shadow-sm">
								<div
									class="text-content-wrap custom-scrollbar"
									v-html="lesson?.content"
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

						<div ref="tabsContainer" class="content-tabs-container glass">
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
							@click="
								router.push(`/quiz/${course.finalQuizId}?courseId=${course.id}`)
							"
						>
							Làm bài thi cuối khóa <ClipboardList :size="18" />
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
							@click="$router.push('/certificates')"
						>
							<Award :size="18" class="me-2" /> Xem Chứng Chỉ
						</button>
					</div>
				</div>
			</div>
		</teleport>

		<transition name="fade">
			<div
				v-if="lessonLoading"
				class="lesson-switch-overlay"
				aria-live="polite"
				aria-label="Đang chuyển bài học"
			>
				<div class="lesson-switch-card glass">
					<div class="loading-spinner sm" />
					<span>Đang chuyển bài học...</span>
				</div>
			</div>
		</transition>
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
	Maximize,
	Minimize,
	Check,
	VideoOff,
	Play,
	Lock,
	Clock,
	ArrowRight,
} from "lucide-vue-next";
import { toast } from "vue3-toastify";
import { useAuthStore } from "@/stores/auth";
import Hls from "hls.js";
import * as signalR from "@microsoft/signalr";

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
const lessonLoading = ref(false);
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
let saveProgressInterval = null;

let lastSeekWarnTime = 0;
const SEEK_WARN_DEBOUNCE_MS = 2500;

const readingTimeLeft = ref(0);
const readingTotalSeconds = ref(180);
const isReadingTimeFinished = ref(false);
let readingTimer = null;

const currentModuleId = ref(null);
const isDownloading = ref({});
const showCourseCompletedModal = ref(false);
const isIssuingCert = ref(false);
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

const availableTabs = computed(() => {
	const baseTabs = [
		{ id: "overview", label: "Tổng quan", icon: Info },
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
	if (lesson.value?.type === "Video" && !isVideoWatchedEnough.value)
		return false;
	if (lesson.value?.hasQuiz && !isCurrentLessonQuizPassed.value) return false;
	if (lesson.value?.type === "Text" && !isReadingTimeFinished.value)
		return false;
	return true;
});

const completeBtnMessage = computed(() => {
	if (savingProgress.value) return "Đang lưu tiến độ...";
	if (lesson.value?.type === "Video" && !isVideoWatchedEnough.value)
		return `Bạn cần xem ≥ 90% video để hoàn thành`;
	if (lesson.value?.hasQuiz && !isCurrentLessonQuizPassed.value) {
		const passScore = lesson.value?.quiz?.passScore || 80;
		return `🔒 Yêu cầu: Đạt ≥ ${passScore}% bài tập để hoàn thành`;
	}
	if (lesson.value?.type === "Text" && !isReadingTimeFinished.value)
		return `Cần đọc thêm ${readingTimeLeft.value}s để hoàn thành`;
	return "Xác nhận hoàn thành bài học";
});

const activeModuleName = computed(() => {
	const mod = course.value?.modules.find((m) =>
		m.lessons.some((l) => l.id === lesson.value?.id),
	);
	return mod?.title || "";
});

const nextLesson = computed(() => {
	if (!course.value || !lesson.value) return null;
	const allLessons = course.value.modules.flatMap((m) => m.lessons);
	const idx = allLessons.findIndex((l) => l.id === lesson.value.id);
	return idx < allLessons.length - 1 ? allLessons[idx + 1] : null;
});

const prevLesson = computed(() => {
	if (!course.value || !lesson.value) return null;
	const allLessons = course.value.modules.flatMap((m) => m.lessons);
	const idx = allLessons.findIndex((l) => l.id === lesson.value.id);
	return idx > 0 ? allLessons[idx - 1] : null;
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

function toggleFocusMode() {
	isFocusMode.value = !isFocusMode.value;
	if (isFocusMode.value) isSidebarCollapsed.value = true;
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
					if (!lesson.value.hasQuiz && !isCompleted.value) completeLesson();
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
	loading.value = true;
	error.value = null;

	try {
		const [courseRes, progressRes] = await Promise.all([
			courseAPI.getById(courseId),
			progressAPI.getLessonProgresses(courseId),
		]);

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
		lessonLoading.value = false;
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

	signalrConnection.on("AiProcessingCompleted", (lessonId) => {});

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
	if (authStore.user?.role === "Admin") return true;
	const allLessons = course.value.modules.flatMap((m) => m.lessons);
	const idx = allLessons.findIndex((x) => x.id === l.id);
	if (idx === 0 || l.isFreePreview) return true;
	return isLessonDone(allLessons[idx - 1].id);
}

function isLessonDone(id) {
	return lessonProgresses.value.some(
		(lp) => lp.lessonId === id && lp.isCompleted,
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
	if (!isSeeking.value) preSeekTime.value = lastCurrentTime.value;
	isSeeking.value = true;
}

function onSeeked(e) {
	const video = e.target;
	isSeeking.value = false;

	if (isCompleted.value) return;
	if (video.currentTime < preSeekTime.value) {
		lastCurrentTime.value = video.currentTime;
		return;
	}
	if (video.currentTime <= maxWatchedTime.value + 2) {
		lastCurrentTime.value = video.currentTime;
		return;
	}

	const now = Date.now();
	if (now - lastSeekWarnTime > SEEK_WARN_DEBOUNCE_MS) {
		toast.warning("Bạn không được phép tua qua nội dung chưa xem!");
		lastSeekWarnTime = now;
	}
	video.currentTime = preSeekTime.value;
}

function onTimeUpdate(e) {
	const video = e.target;
	const current = video.currentTime;

	if (!videoDurationRef.value && video.duration)
		videoDurationRef.value = video.duration;

	if (!isSeeking.value && Math.abs(current - lastCurrentTime.value) < 3) {
		lastCurrentTime.value = current;
	}
	if (isSeeking.value) return;
	if (current > maxWatchedTime.value && current - maxWatchedTime.value < 3) {
		maxWatchedTime.value = current;
	}

	if (
		!isCompleted.value &&
		video.duration > 0 &&
		current >= video.duration * 0.9
	) {
		isVideoWatchedEnough.value = true;
		if (!lesson.value.hasQuiz && !savingProgress.value) completeLesson();
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

	lessonLoading.value = true;
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
	return url?.startsWith("http")
		? url
		: `http://localhost:5100${url?.startsWith("/") ? "" : "/"}${url}`;
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
:root,
.learning-player {
	--primary-400: #6366f1;
	--primary-500: #4f46e5;
	--primary-600: #4338ca;
	--bg-primary: #f8fafc;
	--bg-secondary: #ffffff;
	--bg-tertiary: #f1f5f9;
	--bg-card: rgba(255, 255, 255, 0.98);
	--text-primary: #0f172a;
	--text-secondary: #475569;
	--text-tertiary: #94a3b8;
	--border-color: rgba(15, 23, 42, 0.08);
	--border-color-strong: rgba(15, 23, 42, 0.14);
	--danger-400: #ef4444;
	--success-400: #10b981;
	--warning-500: #f59e0b;
	--gradient-primary: linear-gradient(135deg, #4f46e5, #6366f1);
	--shadow-sm:
		0 1px 3px rgba(15, 23, 42, 0.07), 0 1px 2px rgba(15, 23, 42, 0.05);
	--shadow-md:
		0 4px 16px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.05);
	--shadow-lg:
		0 12px 40px rgba(15, 23, 42, 0.1), 0 4px 12px rgba(15, 23, 42, 0.06);
	--space-xs: 4px;
	--space-sm: 8px;
	--space-md: 12px;
	--space-lg: 16px;
	--space-xl: 24px;
	--font-size-sm: 13px;
	--font-size-base: 15px;
	--radius-md: 8px;
	--radius-lg: 12px;
	--transition-fast: 0.2s ease;
}

.learning-player {
	background: var(--bg-primary, #f8fafc);
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	position: relative;
	overflow: hidden;
	font-family: "Plus Jakarta Sans", system-ui, sans-serif;
}

.course-info,
.progress-stats,
.player-sidebar {
	transition:
		opacity 0.3s ease,
		transform 0.3s ease;
}

.learning-player.focus-mode .player-header-bar {
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border-bottom: 1px solid rgba(15, 23, 42, 0.07);
}

.learning-player.focus-mode .course-info,
.learning-player.focus-mode .progress-stats {
	opacity: 0;
	pointer-events: none;
}

.learning-player.focus-mode .player-sidebar {
	display: none !important;
}

.learning-player.focus-mode .content-primary {
	max-width: 1400px;
}

.player-header-bar {
	height: 60px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 var(--space-lg, 16px);
	z-index: 1000;
	border-bottom: 1px solid var(--border-color);
	background: rgba(255, 255, 255, 0.92);
	backdrop-filter: blur(16px);
	box-shadow: 0 1px 0 rgba(15, 23, 42, 0.07);
	flex-shrink: 0;
}

.header-left {
	display: flex;
	align-items: center;
	gap: var(--space-md, 12px);
	min-width: 0;
}

.course-info {
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.course-name {
	font-size: var(--font-size-base, 15px);
	font-weight: 700;
	margin: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 400px;
	color: var(--text-primary, #0f172a);
}

.lesson-breadcrumb {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 11px;
	color: var(--text-tertiary, #94a3b8);
	white-space: nowrap;
	overflow: hidden;
}

.active-lesson {
	color: var(--primary-400, #6366f1);
	font-weight: 500;
	overflow: hidden;
	text-overflow: ellipsis;
}

.header-right {
	display: flex;
	align-items: center;
	gap: var(--space-xl, 24px);
	flex-shrink: 0;
}

.progress-stats {
	display: flex;
	flex-direction: column;
	gap: 4px;
	width: 140px;
}

.stats-text {
	font-size: 11px;
	color: var(--text-secondary, #475569);
	text-align: right;
	display: flex;
	align-items: center;
	gap: 8px;
}

.lesson-count-text {
	color: var(--primary-400, #6366f1);
	font-weight: 600;
	background: rgba(99, 102, 241, 0.1);
	padding: 2px 8px;
	border-radius: 20px;
}

.stats-text span:first-child {
	color: var(--text-primary, #0f172a);
	font-weight: 800;
}

.progress-mini-bar {
	width: 100%;
	height: 4px;
	background: var(--bg-tertiary, #f1f5f9);
	border-radius: 2px;
	overflow: hidden;
}

.progress-mini-fill {
	height: 100%;
	background: var(
		--gradient-primary,
		linear-gradient(135deg, #4f46e5, #6366f1)
	);
	transition: width 0.5s ease;
}

.player-container {
	flex: 1;
	display: flex;
	height: calc(100vh - 60px);
	position: relative;
}

.sidebar-backdrop {
	display: none;
}

.player-sidebar {
	width: clamp(280px, 28vw, 360px);
	border-right: 1px solid var(--border-color);
	display: flex;
	flex-direction: column;
	transition:
		transform 0.3s ease,
		width 0.3s ease,
		opacity 0.3s ease;
	background: var(--bg-secondary, #ffffff);
	order: 1;
	flex-shrink: 0;
}

.player-sidebar.collapsed {
	width: 0;
	transform: translateX(-100%);
	overflow: hidden;
	opacity: 0;
}

.sidebar-header {
	padding: var(--space-lg, 16px);
	border-bottom: 1px solid var(--border-color);
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.sidebar-header h3 {
	font-size: var(--font-size-base, 15px);
	font-weight: 700;
	margin: 0;
	color: var(--text-primary, #0f172a);
}

.sidebar-content {
	flex: 1;
	overflow-y: auto;
	padding: var(--space-sm, 8px) 0;
}

.module-group {
	border-bottom: 1px solid var(--border-color);
}

.module-item {
	padding: var(--space-md, 12px) var(--space-lg, 16px);
	cursor: pointer;
	background: var(--bg-secondary, #ffffff);
	transition: background 0.2s;
}

.module-item:hover,
.module-item:focus-visible {
	background: rgba(15, 23, 42, 0.04);
	outline: none;
}

.module-meta {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 11px;
	color: var(--text-tertiary, #94a3b8);
	margin-bottom: 4px;
}

.module-index {
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.04em;
}
.module-title {
	font-size: var(--font-size-sm, 13px);
	font-weight: 600;
	margin: 0 0 4px;
	color: var(--text-primary, #0f172a);
}
.module-stats {
	font-size: 10px;
	color: var(--text-tertiary, #94a3b8);
}
.lesson-list {
	background: rgba(15, 23, 42, 0.02);
}

.lesson-item {
	padding: 14px 20px;
	display: flex;
	gap: 14px;
	cursor: pointer;
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	border-left: 4px solid transparent;
	position: relative;
}

.lesson-item:hover:not(.locked),
.lesson-item:focus-visible:not(.locked) {
	background: rgba(99, 102, 241, 0.06);
	outline: none;
}

.lesson-item.active {
	background: rgba(99, 102, 241, 0.08);
	border-left-color: var(--primary-400, #6366f1);
}
.lesson-item.completed {
	background: rgba(16, 185, 129, 0.04);
}
.lesson-item.locked {
	opacity: 0.6;
	cursor: default;
}

.status-icon {
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	flex-shrink: 0;
	margin-top: 2px;
}

.status-icon.completed {
	background: rgba(16, 185, 129, 0.15);
	color: #10b981;
}
.status-icon.active {
	background: var(--primary-400, #818cf8);
	color: white;
	box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
}
.status-icon.todo {
	background: rgba(15, 23, 42, 0.04);
	color: var(--text-tertiary, #94a3b8);
	border: 1.5px solid var(--border-color);
}
.status-icon.locked {
	background: rgba(15, 23, 42, 0.04);
	color: var(--text-tertiary, #94a3b8);
	opacity: 0.5;
}

.lesson-info {
	flex: 1;
	min-width: 0;
}
.l-title {
	font-weight: 600;
	font-size: 13.5px;
	color: var(--text-primary, #0f172a);
	line-height: 1.4;
	display: block;
	margin-bottom: 4px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.l-meta {
	display: flex;
	align-items: center;
	gap: 10px;
	flex-wrap: wrap;
}
.l-type-tag {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 10px;
	font-weight: 700;
	color: var(--text-tertiary, #94a3b8);
	text-transform: uppercase;
}
.l-duration {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 10.5px;
	color: var(--text-tertiary, #94a3b8);
	font-variant-numeric: tabular-nums;
}
.l-progress-tag {
	font-size: 10px;
	color: var(--primary-400, #6366f1);
	font-weight: 700;
	background: rgba(99, 102, 241, 0.1);
	padding: 1px 6px;
	border-radius: 4px;
}
.done-icon {
	color: var(--success-400, #4ade80);
}
.todo-icon {
	color: var(--border-color);
}
.quiz-sub-item {
	background: rgba(99, 102, 241, 0.03);
}
.final-quiz-item {
	background: rgba(245, 158, 11, 0.05);
	border-left: 3px solid transparent;
}
.final-quiz-item.active {
	background: rgba(245, 158, 11, 0.15);
	border-left-color: var(--warning-500, #f59e0b);
}

.player-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	background: var(--bg-primary, #f8fafc);
	scroll-behavior: smooth;
	order: 2;
}

.content-primary {
	flex: 1;
	max-width: min(1000px, calc(100vw - clamp(280px, 28vw, 360px) - 48px));
	margin: 0 auto;
	width: 100%;
	padding: var(--space-lg, 16px) var(--space-xl, 24px);
	display: flex;
	flex-direction: column;
	gap: var(--space-lg, 16px);
}

.video-theater {
	width: 100%;
	aspect-ratio: 16 / 9;
	background: #000;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: var(--shadow-lg, 0 12px 40px rgba(15, 23, 42, 0.12));
	border: 1px solid rgba(255, 255, 255, 0.08);
	position: relative;
}

.video-container,
.video-item,
.video-iframe {
	width: 100%;
	height: 100%;
	border: none;
}

.text-theater {
	width: 100%;
	background: transparent;
	border-radius: 16px;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.08);
	position: relative;
}

.content-type-badge {
	position: absolute;
	top: 16px;
	left: 16px;
	z-index: 10;
	background: rgba(15, 23, 42, 0.55);
	backdrop-filter: blur(8px);
	padding: 6px 12px;
	border-radius: 8px;
	font-size: 10px;
	font-weight: 800;
	letter-spacing: 1px;
	display: flex;
	align-items: center;
	gap: 6px;
	color: white;
	border: 1px solid rgba(255, 255, 255, 0.1);
}

.content-type-badge.video {
	border-color: rgba(99, 102, 241, 0.3);
}
.content-type-badge.text {
	border-color: rgba(16, 185, 129, 0.3);
	position: relative;
	top: auto;
	left: auto;
	margin: 16px;
	display: inline-flex;
}

.text-content-card {
	background: #ffffff;
	border-radius: 0 0 16px 16px;
	padding: 40px;
	border: 1px solid rgba(0, 0, 0, 0.05);
	box-shadow: var(--shadow-md, 0 4px 16px rgba(15, 23, 42, 0.08));
}

.text-content-wrap {
	overflow-y: auto;
	font-size: 17px;
	line-height: 1.8;
	color: #0f172a;
	max-height: 60vh;
}

.video-watch-indicator {
	position: absolute;
	top: 16px;
	right: 16px;
	z-index: 10;
	background: rgba(15, 23, 42, 0.55);
	backdrop-filter: blur(8px);
	border-radius: 50%;
	padding: 4px;
	border: 1px solid rgba(255, 255, 255, 0.1);
}

.reading-timer-bar {
	background: var(--bg-card, #ffffff);
	border-radius: 12px;
	padding: 12px 16px;
	border: 1px solid rgba(99, 102, 241, 0.18);
}

.reading-timer-inner {
	display: flex;
	align-items: center;
	gap: 12px;
}

.reading-timer-icon {
	color: var(--primary-400, #6366f1);
	flex-shrink: 0;
}

.reading-timer-info {
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
}

.reading-timer-label {
	font-size: 11px;
	color: var(--text-tertiary, #94a3b8);
}
.reading-timer-remain {
	font-size: 13px;
	font-weight: 700;
	color: var(--primary-400, #6366f1);
}

.reading-timer-track {
	flex: 1;
	height: 6px;
	background: rgba(99, 102, 241, 0.15);
	border-radius: 3px;
	overflow: hidden;
}

.reading-timer-fill {
	height: 100%;
	background: var(
		--gradient-primary,
		linear-gradient(135deg, #4f46e5, #6366f1)
	);
	border-radius: 3px;
	transition: width 1s linear;
}

.video-processing-state {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: #0a0a0a;
	color: #fff;
	text-align: center;
	padding: var(--space-xl, 24px);
}

.processing-glow {
	width: 80px;
	height: 80px;
	border-radius: 50%;
	background: var(--gradient-primary);
	filter: blur(20px);
	animation: pulse-glow 2s infinite alternate;
}
@keyframes pulse-glow {
	from {
		transform: scale(0.8);
		opacity: 0.5;
	}
	to {
		transform: scale(1.2);
		opacity: 0.8;
	}
}
.processing-title {
	font-weight: 900;
	margin-bottom: 8px;
	font-size: 24px;
}
.processing-sub {
	color: rgba(255, 255, 255, 0.6);
	font-size: 14px;
}
.flex-center {
	display: flex;
	align-items: center;
	justify-content: center;
}
.flex-column {
	flex-direction: column;
}

.content-tabs-container {
	background: var(--bg-card, #ffffff);
	border-radius: 16px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	min-height: 450px;
	border: 1px solid var(--border-color);
}

.tabs-header {
	display: flex;
	padding: 0 var(--space-md, 12px);
	background: var(--bg-secondary, #ffffff);
	border-bottom: 1px solid var(--border-color);
	overflow-x: auto;
	scrollbar-width: none;
	position: relative;
}

.tabs-header::after {
	content: "";
	position: sticky;
	right: 0;
	width: 32px;
	flex-shrink: 0;
	background: linear-gradient(to right, transparent, rgba(248, 250, 252, 0.95));
	pointer-events: none;
}

.tabs-header::-webkit-scrollbar {
	display: none;
}

.tab-btn {
	padding: var(--space-md, 12px) var(--space-lg, 16px);
	background: none;
	border: none;
	font-size: var(--font-size-sm, 13px);
	color: var(--text-tertiary, #94a3b8);
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;
	position: relative;
	transition: all var(--transition-fast, 0.2s ease);
	font-weight: 500;
	white-space: nowrap;
	flex-shrink: 0;
}

.tab-btn:hover {
	color: var(--text-primary, #0f172a);
}
.tab-btn.active {
	color: var(--primary-400, #6366f1);
	font-weight: 600;
}
.tab-btn.active::after {
	content: "";
	position: absolute;
	bottom: -1px;
	left: var(--space-lg, 16px);
	right: var(--space-lg, 16px);
	height: 3px;
	background: var(--primary-500, #6366f1);
	border-radius: 3px 3px 0 0;
}

.tab-badge {
	font-size: 10px;
	background: var(--bg-tertiary, #f1f5f9);
	padding: 1px 6px;
	border-radius: 10px;
}

.tab-content-area {
	padding: var(--space-xl, 24px);
	flex: 1;
	overflow-y: auto;
}

.intro-header-modern {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding-bottom: 24px;
	border-bottom: 1px solid var(--border-color);
	gap: 16px;
	flex-wrap: wrap;
}

.title-area {
	flex: 1;
	min-width: 0;
}
.action-area {
	flex-shrink: 0;
}

.section-title-dot {
	font-size: 18px;
	font-weight: 800;
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 12px;
	color: var(--text-primary, #0f172a);
}

.section-title-dot::before {
	content: "";
	width: 6px;
	height: 6px;
	background: var(--primary-400, #818cf8);
	border-radius: 50%;
}

.section-body {
	color: var(--text-secondary, #475569);
	line-height: 1.7;
	font-size: 14.5px;
}
.section-body :deep(ul),
.section-body :deep(ol) {
	padding-left: 20px;
	margin: 12px 0;
}
.section-body :deep(li) {
	margin-bottom: 8px;
}

.btn-complete-premium {
	padding: 10px 20px;
	border-radius: 12px;
	font-weight: 700;
	display: flex;
	align-items: center;
	gap: 8px;
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.completed-area-modern {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 12px;
}

.completed-badge-premium {
	display: flex;
	align-items: center;
	gap: 8px;
	background: rgba(16, 185, 129, 0.1);
	color: #10b981;
	padding: 8px 16px;
	border-radius: 10px;
	font-weight: 700;
	font-size: 14px;
}

.quiz-active-area {
	padding: 0;
}

.retry-countdown-box {
	background: rgba(163, 45, 45, 0.08);
	border: 1px solid rgba(163, 45, 45, 0.2);
	border-radius: 12px;
	padding: 16px 20px;
	display: inline-block;
	width: 100%;
	max-width: 400px;
}

.countdown-inner {
	display: flex;
	align-items: center;
	gap: 10px;
	font-size: 14px;
	color: var(--text-secondary, #475569);
	margin-bottom: 10px;
}

.countdown-num {
	font-size: 22px;
	color: var(--danger-400, #f87171);
	font-variant-numeric: tabular-nums;
	margin-left: auto;
}

.countdown-track {
	height: 4px;
	background: rgba(163, 45, 45, 0.15);
	border-radius: 2px;
	overflow: hidden;
}

.countdown-fill {
	height: 100%;
	background: #a32d2d;
	border-radius: 2px;
	transition: width 1s linear;
}

.opt-label {
	background: rgba(0, 0, 0, 0.02);
}
.opt-label:hover {
	background: rgba(99, 102, 241, 0.05);
	border-color: rgba(99, 102, 241, 0.3) !important;
}
.bg-primary-light {
	background-color: rgba(99, 102, 241, 0.1) !important;
	border-color: rgba(99, 102, 241, 0.5) !important;
}
.cursor-pointer {
	cursor: pointer;
}
.transition-all {
	transition: all 0.2s ease-in-out;
}

.resource-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.resource-item {
	display: flex;
	align-items: center;
	gap: var(--space-md, 12px);
	padding: var(--space-md, 12px);
	cursor: pointer;
	transition: transform 0.2s;
	text-decoration: none;
	color: inherit;
}

.resource-item:hover {
	transform: translateX(5px);
}
.res-icon {
	color: var(--primary-400, #6366f1);
}
.res-info {
	flex: 1;
}
.res-name {
	font-size: var(--font-size-sm, 13px);
	font-weight: 600;
	color: var(--text-primary, #0f172a);
}
.res-meta {
	font-size: 10px;
	color: var(--text-tertiary, #94a3b8);
}
.res-dl {
	color: var(--text-tertiary, #94a3b8);
}

.dl-spinner {
	width: 18px;
	height: 18px;
	border: 2px solid rgba(99, 102, 241, 0.3);
	border-top-color: var(--primary-500, #6366f1);
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
	padding: 48px 24px;
	color: var(--text-tertiary, #94a3b8);
}

.qa-container {
	display: flex;
	flex-direction: column;
	gap: var(--space-xl, 24px);
}
.qa-input-box {
	padding: var(--space-lg, 16px);
	border-radius: var(--radius-lg, 12px);
}

.qa-input-box textarea,
.note-input textarea,
.reply-input-wrap textarea {
	width: 100%;
	padding: var(--space-md, 12px);
	background: rgba(15, 23, 42, 0.02);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-md, 8px);
	color: var(--text-primary, #0f172a);
	resize: none;
	font-family: inherit;
	transition: border-color 0.2s;
}

.qa-input-box textarea:focus,
.note-input textarea:focus,
.reply-input-wrap textarea:focus {
	outline: none;
	border-color: var(--primary-500, #6366f1);
}

.qa-input-box textarea {
	height: 100px;
	margin-bottom: var(--space-sm, 8px);
}
.qa-actions {
	display: flex;
	justify-content: flex-end;
}
.qa-list {
	display: flex;
	flex-direction: column;
	gap: var(--space-lg, 16px);
}
.qa-card {
	padding: var(--space-lg, 16px);
	border-radius: var(--radius-lg, 12px);
}
.qa-main {
	display: flex;
	gap: var(--space-md, 12px);
}

.user-avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: var(--bg-tertiary, #f1f5f9);
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	color: #fff;
	background-size: cover;
	background-position: center;
	border: 2px solid var(--border-color);
	flex-shrink: 0;
	font-size: 15px;
}

.user-avatar.sm {
	width: 32px;
	height: 32px;
	font-size: 12px;
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
.reply-input-wrap {
	display: flex;
	flex-direction: column;
	gap: var(--space-xs, 4px);
	margin-bottom: var(--space-md, 12px);
}
.reply-input-wrap textarea {
	height: 60px;
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
	height: 100px;
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
	background: rgba(255, 255, 255, 0.96);
	backdrop-filter: blur(10px);
	box-shadow: 0 -1px 0 rgba(15, 23, 42, 0.06);
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
	background: rgba(255, 255, 255, 0.85);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
}

.card {
	background: var(--bg-card, #ffffff);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-lg, 12px);
}

.focus-mode-btn {
	color: var(--text-tertiary, #94a3b8) !important;
}
.focus-mode-btn:hover {
	background: rgba(255, 255, 255, 0.1) !important;
	color: white !important;
}

@media (max-width: 1200px) {
	.content-primary {
		max-width: calc(100% - 32px);
	}
}

@media (max-width: 1024px) {
	.player-sidebar {
		position: fixed;
		top: 60px;
		left: 0;
		bottom: 0;
		z-index: 950;
		transform: translateX(0);
		width: 320px !important;
	}

	.player-sidebar.collapsed {
		transform: translateX(-100%);
	}

	.sidebar-backdrop {
		display: block;
		position: fixed;
		inset: 60px 0 0 0;
		background: rgba(15, 23, 42, 0.45);
		z-index: 900;
	}

	.hide-mobile {
		display: none;
	}
	.content-primary {
		max-width: 100%;
		padding: var(--space-md, 12px);
	}
}

@media (max-width: 768px) {
	.player-header-bar {
		padding: 0 var(--space-sm, 8px);
	}
	.course-name {
		max-width: 150px;
		font-size: var(--font-size-sm, 13px);
	}
	.course-info {
		display: none;
	}

	.video-theater {
		border-radius: 0;
		margin: 0 calc(-1 * var(--space-md, 12px));
		width: calc(100% + 2 * var(--space-md, 12px));
		border-left: none;
		border-right: none;
	}

	.tab-btn {
		padding: var(--space-md, 12px) var(--space-sm, 8px);
		font-size: 12px;
	}
	.intro-header-modern {
		flex-direction: column;
	}
	.action-area {
		width: 100%;
	}
	.btn-complete-premium,
	.btn-next-direct {
		width: 100%;
		justify-content: center;
	}
}

@media (max-width: 480px) {
	.tab-btn span {
		display: none;
	}
	.tab-btn {
		padding: var(--space-md, 12px);
	}
}
</style>
