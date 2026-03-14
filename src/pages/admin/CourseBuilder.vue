<template>
	<div class="cb-root">
		<header class="cb-topbar">
			<div class="cb-topbar-left">
				<button @click="router.push('/admin/courses')" class="btn-back-flat">
					<ChevronLeft :size="16" />
					<span>Danh sách khóa học</span>
				</button>
				<div class="cb-topbar-divider"></div>
				<div class="cb-topbar-title">
					<BookOpen :size="18" class="cb-title-icon" />
					<span>Thiết Kế Khóa Học Mới</span>
				</div>
			</div>

			<div class="cb-topbar-steps">
				<button
					v-for="(step, i) in [
						{ key: 'basic', label: 'Thông tin chung', num: 1 },
						{ key: 'curriculum', label: 'Giáo trình', num: 2 },
						{ key: 'quiz', label: 'Thi cuối khóa', num: 3 },
					]"
					:key="step.key"
					class="cb-step-pill"
					:class="{
						'is-active': activeTab === step.key,
						'is-done':
							(step.num === 1 &&
								(activeTab === 'curriculum' || activeTab === 'quiz')) ||
							(step.num === 2 && activeTab === 'quiz'),
					}"
					@click="activeTab = step.key"
				>
					<span class="step-dot">{{ step.num }}</span>
					<span class="step-text">{{ step.label }}</span>
					<span v-if="i < 2" class="step-arrow">›</span>
				</button>
			</div>

			<div class="cb-topbar-right">
				<button class="btn-cancel-flat" @click="router.push('/admin/courses')">
					<X :size="15" /> Hủy
				</button>
				<button
					class="btn-save-flat"
					:disabled="isSaving"
					@click="submitCourse"
				>
					<Save v-if="!isSaving" :size="15" />
					<RotateCcw v-else :size="15" class="spin" />
					{{ isSaving ? "Đang tạo..." : "Tạo khóa học" }}
				</button>
			</div>
		</header>

		<div class="cb-body">
			<aside class="cb-step-rail">
				<div class="rail-track">
					<div
						class="rail-fill"
						:style="{
							height:
								activeTab === 'basic'
									? '0%'
									: activeTab === 'curriculum'
										? '50%'
										: '100%',
						}"
					></div>
				</div>
				<div class="rail-nodes">
					<button
						v-for="step in [
							{ key: 'basic', label: 'Thông tin', num: 1, color: 'primary' },
							{
								key: 'curriculum',
								label: 'Giáo trình',
								num: 2,
								color: 'indigo',
							},
							{ key: 'quiz', label: 'Bài thi', num: 3, color: 'emerald' },
						]"
						:key="step.key"
						class="rail-node"
						:class="{
							active: activeTab === step.key,
							done:
								(step.num < 2 &&
									(activeTab === 'curriculum' || activeTab === 'quiz')) ||
								(step.num < 3 && activeTab === 'quiz'),
						}"
						@click="activeTab = step.key"
					>
						<div class="rail-bubble" :data-color="step.color">
							{{ step.num }}
						</div>
						<span class="rail-label">{{ step.label }}</span>
					</button>
				</div>
			</aside>

			<main class="cb-content">
				<div class="cb-form">
					<Transition name="fade-slide">
						<div
							v-if="activeTab === 'basic'"
							class="tab-panel-v3 animate-fade-in"
						>
							<div class="tab1-balanced-grid">
								<div class="section-card-v3">
									<div class="section-eyebrow">
										<div class="eyebrow-icon primary"><Info :size="18" /></div>
										<span>Thông tin khóa học</span>
									</div>
									<div class="field-stack">
										<div class="glass-field-v2">
											<label
												>Tên khóa học <span class="text-danger">*</span></label
											>
											<input
												v-model="course.Title"
												type="text"
												placeholder="Ví dụ: Làm chủ trí tuệ nhân tạo..."
												class="premium-input-v2"
											/>
										</div>

										<div class="glass-field-v2">
											<label
												>Danh mục phân loại
												<span class="text-danger">*</span></label
											>
											<select
												v-model="course.CategoryId"
												class="premium-input-v2 custom-select-arrow"
											>
												<option :value="null">
													-- Chọn danh mục khóa học --
												</option>
												<option
													v-for="cat in categories"
													:key="cat.id"
													:value="cat.id"
												>
													{{ cat.name }}
												</option>
											</select>
										</div>

										<div class="glass-field-v2">
											<label>Mô tả chi tiết</label>
											<textarea
												v-model="course.Description"
												rows="4"
												placeholder="Nhập tóm tắt và mục tiêu khóa học..."
												class="premium-textarea-v2"
											></textarea>
										</div>

										<div class="glass-field-v2">
											<label
												>Phân cấp khóa học
												<span class="text-danger">*</span></label
											>
											<div class="d-flex gap-3 mt-1">
												<div
													class="level-radio-v2"
													:class="{ active: course.Level === 1 }"
													@click="course.Level = 1"
												>
													<input
														type="radio"
														v-model="course.Level"
														:value="1"
														class="d-none"
													/>
													<span class="level-dot dot-1"></span>
													<div class="level-info">
														<span class="lv-title">Cấp 1</span>
														<span class="lv-desc">Người mới</span>
													</div>
												</div>
												<div
													class="level-radio-v2"
													:class="{ active: course.Level === 2 }"
													@click="course.Level = 2"
												>
													<input
														type="radio"
														v-model="course.Level"
														:value="2"
														class="d-none"
													/>
													<span class="level-dot dot-2"></span>
													<div class="level-info">
														<span class="lv-title">Cấp 2</span>
														<span class="lv-desc">Phòng ban</span>
													</div>
												</div>
												<div
													class="level-radio-v2"
													:class="{ active: course.Level === 3 }"
													@click="course.Level = 3"
												>
													<input
														type="radio"
														v-model="course.Level"
														:value="3"
														class="d-none"
													/>
													<span class="level-dot dot-3"></span>
													<div class="level-info">
														<span class="lv-title">Cấp 3</span>
														<span class="lv-desc">Tự chọn</span>
													</div>
												</div>
											</div>
											<p class="text-secondary fs-11 mt-2 mb-0">
												* Cấp 1 & 2 là lộ trình bắt buộc. Cấp 3 dành cho học tập
												tự nguyện.
											</p>
										</div>
									</div>
								</div>

								<div class="section-card-v3 d-flex flex-col">
									<div class="section-eyebrow">
										<div class="eyebrow-icon indigo">
											<LayoutGrid :size="18" />
										</div>
										<span>Ảnh bìa khóa học</span>
									</div>
									<div
										class="banner-upload-box-v2 flex-1"
										:class="{ 'has-preview': course.CoverImage }"
									>
										<div v-if="!course.CoverImage" class="upload-empty-state">
											<div class="upload-icon-wrap"><Upload :size="28" /></div>
											<h6>Tải lên ảnh bìa (16:9)</h6>
											<p class="upload-hint">Kéo thả hoặc nhấp để chọn tệp</p>
											<input
												type="file"
												accept="image/*"
												@change="handleImageUpload"
												class="absolute-input"
											/>
										</div>
										<div v-else class="upload-full-preview">
											<img
												:src="getObjectURL(course.CoverImage)"
												alt="Course Cover Preview"
											/>
											<div class="preview-actions">
												<button
													type="button"
													@click="course.CoverImage = null"
													class="btn-circle-danger shadow"
												>
													<Trash2 :size="18" />
												</button>
												<label class="btn-glass-white"
													>Thay đổi ảnh
													<input
														type="file"
														accept="image/*"
														@change="handleImageUpload"
														class="absolute-input"
												/></label>
											</div>
										</div>
									</div>
								</div>

								<div class="section-card-v3">
									<div class="section-eyebrow">
										<div class="eyebrow-icon emerald">
											<Calendar :size="18" />
										</div>
										<span>Cài đặt thời gian</span>
									</div>
									<div class="glass-sub-panel-v2 border-indigo p-4 mb-3">
										<div class="panel-header-v2 mb-3">
											<h6 class="mb-0 text-indigo">Thời gian đăng ký</h6>
										</div>
										<div class="row g-3">
											<div class="col-6">
												<label class="tag-label">NGÀY MỞ</label
												><VueDatePicker
													v-model="course.EnrollStartDate"
													:enable-time-picker="true"
													auto-apply
													teleport="body"
													class="premium-dp-v2"
												/>
											</div>
											<div class="col-6">
												<label class="tag-label">NGÀY ĐÓNG</label
												><VueDatePicker
													v-model="course.EnrollEndDate"
													:enable-time-picker="true"
													auto-apply
													teleport="body"
													class="premium-dp-v2"
												/>
											</div>
										</div>
									</div>
									<div class="glass-sub-panel-v2 border-amber p-4">
										<div class="panel-header-v2 mb-3">
											<h6 class="mb-0 text-warning">Hạn hoàn thành</h6>
										</div>
										<div class="row g-3">
											<div class="col-6">
												<label class="tag-label">SỐ NGÀY QUY ĐỊNH</label
												><input
													v-model="course.CompletionDeadlineDays"
													type="number"
													class="premium-input-v2-sm"
													placeholder="Ví dụ: 30"
												/>
											</div>
											<div class="col-6">
												<label class="tag-label">NGÀY KẾT THÚC CỨNG</label
												><VueDatePicker
													v-model="course.CompletionEndDate"
													:enable-time-picker="true"
													auto-apply
													teleport="body"
													class="premium-dp-v2"
												/>
											</div>
										</div>
									</div>
								</div>

								<div class="section-card-v3 d-flex flex-col">
									<div class="section-eyebrow">
										<div class="eyebrow-icon primary"><Award :size="18" /></div>
										<span>Trạng thái & Điều kiện</span>
									</div>
									<div class="glass-field-v2 mb-4">
										<label
											>Điểm đạt (%) <span class="text-danger">*</span></label
										>
										<div class="input-icon-wrapper">
											<Award :size="16" class="input-icon text-primary" />
											<input
												v-model="course.PassScore"
												type="number"
												min="0"
												max="100"
												class="premium-input-v2 ps-5"
											/>
										</div>
									</div>
									<div class="publish-row mt-auto">
										<div class="premium-switch-v2">
											<input
												v-model="course.IsPublished"
												type="checkbox"
												id="publishCourse"
											/>
											<label for="publishCourse" class="pill-switch"></label>
											<span class="ms-3 fw-bold text-secondary small"
												>XUẤT BẢN NGAY KHI LƯU</span
											>
										</div>
									</div>
								</div>
							</div>

							<div class="tab-footer-v3">
								<div></div>
								<div class="footer-btn-group">
									<button
										type="button"
										class="btn-outline-secondary-action"
										@click="submitCourse"
										:disabled="isSaving"
									>
										<Save v-if="!isSaving" :size="15" />
										<RotateCcw v-else :size="15" class="spin" />
										{{ isSaving ? "Đang tạo..." : "Tạo mới ngay" }}
									</button>
									<button
										type="button"
										class="btn-neon primary lg"
										@click="activeTab = 'curriculum'"
									>
										BƯỚC TIẾP THEO <ArrowRight :size="18" />
									</button>
								</div>
							</div>
						</div>
					</Transition>

					<Transition name="fade-slide">
						<div
							v-if="activeTab === 'curriculum'"
							class="tab-panel-v3 animate-fade-in"
						>
							<div class="curriculum-two-col">
								<div class="curriculum-main-col">
									<div
										v-for="(module, mIdx) in curriculum"
										:key="module.id"
										class="module-glass-panel-v2 mb-5 shadow-glow"
									>
										<div class="module-header-v2">
											<div class="m-info">
												<div class="m-index-badge shadow">
													CHƯƠNG {{ mIdx + 1 }}
												</div>
												<input
													v-model="module.title"
													type="text"
													placeholder="Tên chương học..."
													class="m-title-input"
												/>
											</div>
											<div class="m-actions">
												<button
													type="button"
													class="btn-glass-danger-sm"
													@click="removeModule(mIdx)"
												>
													<Trash2 :size="18" />
												</button>
											</div>
										</div>

										<div class="module-body p-4">
											<div class="lessons-stack">
												<div
													v-for="(lesson, lIdx) in module.lessons"
													:key="lesson.id"
													class="lesson-nested-glass-v2 mb-3 animate-slide-up"
												>
													<div class="lesson-top-nav">
														<div class="l-left">
															<span class="l-num-tag">BÀI {{ lIdx + 1 }}</span>
															<input
																v-model="lesson.title"
																type="text"
																placeholder="Tên bài học của bạn..."
																class="l-title-input"
															/>
														</div>
														<div class="l-right">
															<div
																class="glass-check-pill"
																:class="{ active: lesson.isFreePreview }"
															>
																<input
																	v-model="lesson.isFreePreview"
																	type="checkbox"
																	:id="'free_' + lesson.id"
																/>
																<label :for="'free_' + lesson.id"
																	>HỌC THỬ</label
																>
															</div>
															<button
																type="button"
																class="btn-icon-trash"
																@click="removeLesson(mIdx, lIdx)"
															>
																<Trash2 :size="16" />
															</button>
														</div>
													</div>

													<div class="lesson-config-grid p-4">
														<div class="config-type-selector mb-4">
															<button
																type="button"
																class="type-pill"
																:class="{ active: lesson.type === 'Video' }"
																@click="lesson.type = 'Video'"
															>
																<Video :size="16" /> VIDEO BÀI GIẢNG
															</button>
															<button
																type="button"
																class="type-pill"
																:class="{ active: lesson.type === 'Text' }"
																@click="lesson.type = 'Text'"
															>
																<Type :size="16" /> VĂN BẢN
															</button>
														</div>

														<div
															v-if="lesson.type === 'Video'"
															class="video-setup-area"
														>
															<div class="mode-pills shadow-sm mb-3">
																<button
																	type="button"
																	class="mode-pill"
																	:class="{
																		active: lesson.videoType === 'url',
																	}"
																	@click="lesson.videoType = 'url'"
																>
																	DÁN LINK
																</button>
																<button
																	type="button"
																	class="mode-pill"
																	:class="{
																		active: lesson.videoType === 'upload',
																	}"
																	@click="lesson.videoType = 'upload'"
																>
																	TẢI LÊN FILE
																</button>
															</div>
															<div class="input-glow-container">
																<input
																	v-if="lesson.videoType === 'url'"
																	v-model="lesson.videoUrl"
																	type="url"
																	class="premium-input-v2-sm"
																	placeholder="https://youtube.com/..."
																/>
																<div
																	v-else
																	class="upload-lesson-video glass-effect"
																>
																	<input
																		type="file"
																		accept="video/*"
																		@change="onVideoUpload($event, mIdx, lIdx)"
																		class="absolute-input"
																		:id="'vid_' + lesson.id"
																	/>
																	<label :for="'vid_' + lesson.id"
																		><Upload
																			:size="18"
																			class="text-primary mb-2"
																		/><span class="small fw-bold">{{
																			lesson.videoFile
																				? lesson.videoFile.name
																				: "Chọn tệp video"
																		}}</span></label
																	>
																</div>
															</div>
														</div>

														<div v-else class="text-setup-area">
															<textarea
																v-model="lesson.content"
																rows="4"
																class="premium-textarea-v2-sm"
																placeholder="Soạn thảo nội dung..."
															></textarea>
														</div>

														<div
															class="nested-section-box-v2 mt-4 border-amber-soft"
														>
															<div class="box-header justify-content-between">
																<span class="box-title text-warning"
																	><HelpCircle :size="14" /> TRẮC NGHIỆM CON
																	(QUIZ)</span
																>
																<button
																	type="button"
																	class="btn-amber-switch"
																	:class="{ active: lesson.hasQuiz }"
																	@click="lesson.hasQuiz = !lesson.hasQuiz"
																>
																	{{
																		lesson.hasQuiz ? "ĐÃ KÍCH HOẠT" : "BẬT QUIZ"
																	}}
																</button>
															</div>
															<Transition name="expand">
																<div
																	v-if="lesson.hasQuiz"
																	class="box-content mt-3 p-3 bg-amber-glass rounded-4"
																>
																	<div class="row g-2 mb-3">
																		<div class="col-8">
																			<input
																				v-model="lesson.quiz.Title"
																				type="text"
																				class="premium-input-v2-xs"
																				placeholder="Tiêu đề Quiz..."
																			/>
																		</div>
																		<div class="col-2">
																			<input
																				v-model="lesson.quiz.PassScore"
																				type="number"
																				class="premium-input-v2-xs text-center"
																				placeholder="Điểm đậu"
																			/>
																		</div>
																		<div class="col-2">
																			<input
																				v-model="lesson.quiz.TimeLimitMinutes"
																				type="number"
																				class="premium-input-v2-xs text-center"
																				placeholder="Phút"
																			/>
																		</div>
																	</div>
																	<button
																		type="button"
																		class="btn-glass-add-sm w-100 mb-3 justify-content-center"
																		@click="addQuestionToLessonQuiz(mIdx, lIdx)"
																	>
																		<Plus :size="14" /> THÊM CÂU HỎI
																	</button>
																	<div
																		v-for="(q, qIdx) in lesson.quiz.questions"
																		:key="q.id"
																		class="q-nested-card-v2 p-3 glass-effect mb-2"
																	>
																		<div
																			class="d-flex justify-content-between mb-2 small fw-black text-secondary"
																		>
																			<span>#{{ qIdx + 1 }}</span
																			><button
																				type="button"
																				@click="
																					removeQuestionFromLessonQuiz(
																						mIdx,
																						lIdx,
																						qIdx,
																					)
																				"
																				class="text-danger pointer"
																			>
																				Xóa
																			</button>
																		</div>
																		<textarea
																			v-model="q.QuestionText"
																			rows="2"
																			class="premium-textarea-v2-xs mb-2"
																			placeholder="Nhập câu hỏi..."
																		></textarea>
																		<div class="row g-2">
																			<div
																				v-for="letter in letters"
																				:key="letter"
																				class="col-6"
																			>
																				<div
																					class="opt-glass-pill"
																					:class="{
																						correct: q.CorrectAnswer === letter,
																					}"
																				>
																					<input
																						type="radio"
																						:name="
																							'mq_' + lesson.id + '_' + q.id
																						"
																						:value="letter"
																						v-model="q.CorrectAnswer"
																					/><span>{{ letter }}: </span
																					><input
																						v-model="q.Options[letter]"
																						type="text"
																						class="opt-mini-input"
																					/>
																				</div>
																			</div>
																		</div>
																	</div>
																</div>
															</Transition>
														</div>
													</div>
												</div>
											</div>
											<button
												type="button"
												class="btn-dashed-add w-100 mt-3"
												@click="addLesson(mIdx)"
											>
												<Plus :size="18" /> THÊM BÀI HỌC VÀO CHƯƠNG NÀY
											</button>
										</div>
									</div>
									<div class="text-center mt-4">
										<button
											type="button"
											class="btn-neon indigo lg shadow-glow"
											@click="addModule"
										>
											<Plus :size="22" /> THÊM CHƯƠNG MỚI
										</button>
									</div>
								</div>

								<aside class="curriculum-side-col">
									<div class="sticky-summary-card">
										<div class="summary-header">
											<Layers :size="16" class="text-indigo" /><span
												>Tổng quan giáo trình</span
											>
										</div>
										<div class="summary-stats">
											<div class="stat-row">
												<span class="stat-label">Số chương</span
												><span class="stat-val primary">{{
													curriculum.length
												}}</span>
											</div>
											<div class="stat-row">
												<span class="stat-label">Tổng bài học</span
												><span class="stat-val indigo">{{
													curriculum.reduce((s, m) => s + m.lessons.length, 0)
												}}</span>
											</div>
										</div>
									</div>
								</aside>
							</div>

							<div class="tab-footer-v3">
								<button
									type="button"
									class="btn-glass-outline"
									@click="activeTab = 'basic'"
								>
									<ChevronLeft :size="18" /> QUAY LẠI
								</button>
								<div class="footer-btn-group">
									<button
										type="button"
										class="btn-outline-secondary-action"
										@click="submitCourse"
										:disabled="isSaving"
									>
										<Save v-if="!isSaving" :size="15" />
										<RotateCcw v-else :size="15" class="spin" />
										{{ isSaving ? "Đang tạo..." : "Tạo mới ngay" }}
									</button>
									<button
										type="button"
										class="btn-neon success lg"
										@click="activeTab = 'quiz'"
									>
										TIẾP TỤC: THIẾT KẾ ĐỀ THI <ArrowRight :size="18" />
									</button>
								</div>
							</div>
						</div>
					</Transition>

					<Transition name="fade-slide">
						<div
							v-if="activeTab === 'quiz'"
							class="tab-panel-v3 animate-fade-in"
						>
							<div class="quiz-config-bar mb-5">
								<div class="qcb-header">
									<div class="s-icon-box success"><Trophy :size="26" /></div>
									<div>
										<h5 class="mb-0">Đề thi đánh giá cuối khóa</h5>
										<p class="mb-0 text-secondary small">
											Xây dựng ngân hàng câu hỏi và luật chấm điểm.
										</p>
									</div>
								</div>
								<div class="qcb-fields-grid mt-4">
									<div class="glass-field-v2">
										<label>Tên bài thi</label
										><input
											v-model="courseQuiz.Title"
											type="text"
											class="premium-input-v2-sm"
										/>
									</div>
									<div class="glass-field-v2">
										<label>Điểm đạt</label
										><input
											v-model="courseQuiz.PassScore"
											type="number"
											class="premium-input-v2-sm text-center"
										/>
									</div>
									<div class="glass-field-v2">
										<label>Bốc thi (Câu)</label
										><input
											v-model="courseQuiz.QuestionCount"
											type="number"
											class="premium-input-v2-sm text-center"
										/>
									</div>
									<div class="glass-field-v2">
										<label>Thời gian (phút)</label
										><input
											v-model="courseQuiz.TimeLimitMinutes"
											type="number"
											class="premium-input-v2-sm text-center"
										/>
									</div>
								</div>
							</div>

							<div class="quiz-questions-area">
								<div class="quiz-bank-header mb-4">
									<h6 class="fw-black d-flex align-items-center gap-2 m-0">
										<Layers :size="18" class="text-primary" /> NGÂN HÀNG CÂU HỎI
										({{ courseQuiz.questions.length }})
									</h6>
									<button
										type="button"
										class="btn-neon primary sm shadow-sm"
										@click="addQuestionFinal"
									>
										<Plus :size="16" /> THÊM MỚI
									</button>
								</div>

								<div class="questions-two-col-grid">
									<div
										v-for="(q, qIdx) in courseQuiz.questions"
										:key="q.id"
										class="q-glass-card-v2 mb-4 shadow-sm animate-slide-up"
									>
										<div
											class="q-card-header-v2 p-3 px-4 d-flex justify-content-between align-items-center"
										>
											<div class="q-idx-label">CÂU HỎI SỐ {{ qIdx + 1 }}</div>
											<button
												type="button"
												@click="removeQuestionFinal(qIdx)"
												class="btn-circle-danger-sm"
											>
												<Trash2 :size="14" />
											</button>
										</div>
										<div class="q-card-body-v2 p-4 bg-white-glass">
											<textarea
												v-model="q.QuestionText"
												rows="3"
												class="premium-textarea-v2 mb-4"
												placeholder="Nhập câu hỏi..."
											></textarea>
											<div class="row g-3">
												<div
													v-for="letter in letters"
													:key="letter"
													class="col-md-6"
												>
													<div
														class="opt-card-premium-v2 shadow-sm"
														:class="{ is_correct: q.CorrectAnswer === letter }"
													>
														<div class="opt-selector">
															<input
																type="radio"
																:name="'fq_' + q.id"
																:value="letter"
																v-model="q.CorrectAnswer"
															/><span class="letter-marker">{{ letter }}</span>
														</div>
														<input
															v-model="q.Options[letter]"
															type="text"
															placeholder="Phương án..."
															class="opt-text-input"
														/>
														<CheckCircle2
															v-if="q.CorrectAnswer === letter"
															:size="18"
															class="text-success-neon ms-2"
														/>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<button
									type="button"
									class="btn-dashed-add-lg w-100 mt-2"
									@click="addQuestionFinal"
								>
									<Plus :size="24" /> THÊM CÂU HỎI MỚI VÀO NGÂN HÀNG
								</button>
							</div>

							<div class="tab-footer-v3 mt-5">
								<button
									type="button"
									class="btn-glass-outline"
									@click="activeTab = 'curriculum'"
								>
									<ChevronLeft :size="18" /> GIÁO TRÌNH
								</button>
								<button
									type="button"
									@click="submitCourse"
									class="btn-neon success lg shadow-glow-emerald"
									:disabled="isSaving"
								>
									<Save v-if="!isSaving" :size="18" />
									<RotateCcw v-else :size="18" class="spin" />
									{{ isSaving ? "ĐANG TẠO..." : "HOÀN TẤT TẠO KHÓA HỌC" }}
								</button>
							</div>
						</div>
					</Transition>
				</div>
			</main>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

import {
	BookOpen,
	ChevronLeft,
	Save,
	ArrowRight,
	Plus,
	Trash2,
	PlayCircle,
	FileText,
	Paperclip,
	HelpCircle,
	Trophy,
	CheckCircle2,
	Layers,
	Info,
	LayoutGrid,
	Award,
	X,
	RotateCcw,
	Video,
	Type,
	Upload,
	Calendar,
} from "lucide-vue-next";
import { toast } from "vue3-toastify";
import { courseAPI, moduleAPI, lessonAPI, quizAPI } from "@/services/api";

const router = useRouter();

// UI State
const activeTab = ref("basic");
const isSaving = ref(false);

type OptionKey = "A" | "B" | "C" | "D";
const letters: OptionKey[] = ["A", "B", "C", "D"];

// Hàm tạo ID tạm thời
const generateTempId = () => Math.floor(Math.random() * -1000000);

// DANH MỤC KHÓA HỌC
const categories = [
	{ id: 1, name: "Kỹ năng mềm" },
	{ id: 2, name: "Kỹ thuật" },
	{ id: 3, name: "Quy trình" },
	{ id: 4, name: "Lãnh đạo" },
	{ id: 5, name: "Số hóa" },
];

// DATA MODELS
const course = ref({
	Title: "",
	Description: "",
	CategoryId: null as number | null,
	Level: 3, // [MỚI] Mặc định cấp 3
	CoverImage: null as File | null,
	IsPublished: false,
	PassScore: 8,
	EnrollStartDate: null as Date | null,
	EnrollEndDate: null as Date | null,
	CompletionDeadlineDays: null as number | null,
	CompletionEndDate: null as Date | null,
});

interface QuizQuestion {
	id: number;
	QuestionText: string;
	Options: Record<OptionKey, string>;
	CorrectAnswer: string;
	Points: number;
}
interface QuizModel {
	Title: string;
	TimeLimitMinutes: number | null;
	PassScore: number;
	QuestionCount: number;
	ShuffleQuestions: boolean;
	ShuffleAnswers: boolean;
	questions: QuizQuestion[];
}

const createEmptyQuiz = (title: string): QuizModel => ({
	Title: title,
	TimeLimitMinutes: null,
	PassScore: 5,
	QuestionCount: 10,
	ShuffleQuestions: true,
	ShuffleAnswers: true,
	questions: [],
});

interface LessonAttachment {
	id: number;
	fileName: string;
	file: File | null;
}
interface Lesson {
	id: number;
	title: string;
	type: "Video" | "Text";
	content: string;
	videoType: "url" | "upload";
	videoUrl: string;
	videoFile: File | null;
	isFreePreview: boolean;
	attachments: LessonAttachment[];
	hasQuiz: boolean;
	quiz: QuizModel;
}
interface Module {
	id: number;
	title: string;
	lessons: Lesson[];
}

const curriculum = ref<Module[]>([
	{ id: generateTempId(), title: "Chương 1", lessons: [] },
]);
const courseQuiz = ref<QuizModel>(createEmptyQuiz("Bài thi cuối khóa"));

// UI EVENT HANDLERS
const addModule = () =>
	curriculum.value.push({
		id: generateTempId(),
		title: "Chương mới",
		lessons: [],
	});
const removeModule = (index: number) => {
	if (confirm("Xóa toàn bộ chương này?")) curriculum.value.splice(index, 1);
};

const addLesson = (mIdx: number) => {
	curriculum.value[mIdx].lessons.push({
		id: generateTempId(),
		title: "",
		type: "Video",
		content: "",
		videoType: "url",
		videoUrl: "",
		videoFile: null,
		isFreePreview: false,
		attachments: [],
		hasQuiz: false,
		quiz: createEmptyQuiz("Bài tập củng cố"),
	});
};
const removeLesson = (mIdx: number, lIdx: number) =>
	curriculum.value[mIdx].lessons.splice(lIdx, 1);

const addAttachment = (mIdx: number, lIdx: number) => {
	curriculum.value[mIdx].lessons[lIdx].attachments.push({
		id: generateTempId(),
		fileName: "",
		file: null,
	});
};
const removeAttachment = (mIdx: number, lIdx: number, aIdx: number) => {
	curriculum.value[mIdx].lessons[lIdx].attachments.splice(aIdx, 1);
};

const addQuestionToLessonQuiz = (mIdx: number, lIdx: number) => {
	curriculum.value[mIdx].lessons[lIdx].quiz.questions.push({
		id: generateTempId(),
		QuestionText: "",
		Options: { A: "", B: "", C: "", D: "" },
		CorrectAnswer: "A",
		Points: 1.0,
	});
};
const removeQuestionFromLessonQuiz = (
	mIdx: number,
	lIdx: number,
	qIdx: number,
) => {
	curriculum.value[mIdx].lessons[lIdx].quiz.questions.splice(qIdx, 1);
};

const addQuestionFinal = () => {
	courseQuiz.value.questions.push({
		id: generateTempId(),
		QuestionText: "",
		Options: { A: "", B: "", C: "", D: "" },
		CorrectAnswer: "A",
		Points: 1.0,
	});
};
const removeQuestionFinal = (index: number) =>
	courseQuiz.value.questions.splice(index, 1);

const handleImageUpload = (e: Event) => {
	const target = e.target as HTMLInputElement;
	if (target.files && target.files.length > 0)
		course.value.CoverImage = target.files[0];
};
const onVideoUpload = (e: Event, mIdx: number, lIdx: number) => {
	const target = e.target as HTMLInputElement;
	if (target.files && target.files.length > 0)
		curriculum.value[mIdx].lessons[lIdx].videoFile = target.files[0];
};
const onAttachmentUpload = (
	e: Event,
	mIdx: number,
	lIdx: number,
	aIdx: number,
) => {
	const target = e.target as HTMLInputElement;
	if (target.files && target.files.length > 0)
		curriculum.value[mIdx].lessons[lIdx].attachments[aIdx].file =
			target.files[0];
};

const getObjectURL = (file: File) => URL.createObjectURL(file);

// ==========================================
// SUBMIT KHÓA HỌC MỚI (LƯU TUẦN TỰ)
// ==========================================
const submitCourse = async () => {
	if (!course.value.Title.trim()) {
		toast.warning("Vui lòng nhập Tên khóa học ở Tab 1!");
		activeTab.value = "basic";
		return;
	}
	// KIỂM TRA ĐÃ CHỌN DANH MỤC CHƯA
	if (!course.value.CategoryId) {
		toast.warning("Vui lòng chọn Danh mục phân loại ở Tab 1!");
		activeTab.value = "basic";
		return;
	}

	isSaving.value = true;
	try {
		const coursePayload = {
			title: course.value.Title,
			description: course.value.Description,
			categoryId: course.value.CategoryId,
			level: course.value.Level, // [MỚI]
			isPublished: course.value.IsPublished,
			passScore: Number(course.value.PassScore) || 8,
			enrollStartDate: course.value.EnrollStartDate
				? new Date(course.value.EnrollStartDate).toISOString()
				: null,
			enrollEndDate: course.value.EnrollEndDate
				? new Date(course.value.EnrollEndDate).toISOString()
				: null,
			completionDeadlineDays: course.value.CompletionDeadlineDays
				? Number(course.value.CompletionDeadlineDays)
				: null,
			completionEndDate: course.value.CompletionEndDate
				? new Date(course.value.CompletionEndDate).toISOString()
				: null,
		};

		const resCourse = await courseAPI.create(coursePayload);
		const newCourseId = resCourse.data.id;

		if (course.value.CoverImage) {
			const formData = new FormData();
			formData.append("file", course.value.CoverImage);
			await courseAPI.uploadCover(newCourseId, formData);
		}

		for (const mod of curriculum.value) {
			const resMod = await moduleAPI.create(newCourseId, {
				title: mod.title || "Chương mới",
				sortOrder: 0,
			});
			const newModuleId = resMod.data.id;

			for (const les of mod.lessons) {
				const lessonPayload = {
					title: les.title || "Bài học mới",
					type: les.type,
					content: les.content,
					videoUrl: les.videoType === "url" ? les.videoUrl : null,
					isFreePreview: les.isFreePreview,
					sortOrder: 0,
					videoDurationSeconds: 0,
				};
				const resLes = await lessonAPI.create(newModuleId, lessonPayload);
				const newLessonId = resLes.data.id;

				if (
					les.type === "Video" &&
					les.videoType === "upload" &&
					les.videoFile
				) {
					const videoForm = new FormData();
					videoForm.append("file", les.videoFile);
					await lessonAPI.uploadVideo(newModuleId, newLessonId, videoForm);
				}

				for (const att of les.attachments) {
					if (att.file) {
						const attForm = new FormData();
						attForm.append("file", att.file);
						await lessonAPI.uploadAttachment(newModuleId, newLessonId, attForm);
					}
				}

				if (les.hasQuiz && les.quiz.questions.length > 0) {
					const qPayload = {
						title: les.quiz.Title || `Trắc nghiệm: ${les.title}`,
						timeLimitMinutes: les.quiz.TimeLimitMinutes
							? Number(les.quiz.TimeLimitMinutes)
							: null,
						passScore: Number(les.quiz.PassScore) || 5,
						questionCount: Number(les.quiz.questions.length),
						shuffleQuestions: true,
						shuffleAnswers: true,
					};
					const resQuiz = await quizAPI.createForLesson(
						newModuleId,
						newLessonId,
						qPayload,
					);
					const newQuizId = resQuiz.data.id;

					for (const q of les.quiz.questions) {
						await quizAPI.addQuestion(newQuizId, {
							questionText: q.QuestionText || "Nội dung câu hỏi",
							optionA: q.Options.A || "Đáp án A",
							optionB: q.Options.B || "Đáp án B",
							optionC: q.Options.C || "Đáp án C",
							optionD: q.Options.D || "Đáp án D",
							correctAnswer: q.CorrectAnswer || "A",
							points: Number(q.Points) || 1,
						});
					}
				}
			}
		}

		if (courseQuiz.value.questions.length > 0) {
			const finalPayload = {
				title: courseQuiz.value.Title || "Đề thi cuối khóa",
				timeLimitMinutes: courseQuiz.value.TimeLimitMinutes
					? Number(courseQuiz.value.TimeLimitMinutes)
					: null,
				passScore: Number(courseQuiz.value.PassScore) || 5,
				questionCount:
					Number(courseQuiz.value.QuestionCount) ||
					courseQuiz.value.questions.length,
				shuffleQuestions: true,
				shuffleAnswers: true,
			};
			const resFQuiz = await quizAPI.create(newCourseId, finalPayload);
			const fId = resFQuiz.data.id;
			for (const q of courseQuiz.value.questions) {
				await quizAPI.addQuestion(fId, {
					questionText: q.QuestionText || "Câu hỏi thi",
					optionA: q.Options.A || "Đáp án A",
					optionB: q.Options.B || "Đáp án B",
					optionC: q.Options.C || "Đáp án C",
					optionD: q.Options.D || "Đáp án D",
					correctAnswer: q.CorrectAnswer || "A",
					points: Number(q.Points) || 1,
				});
			}
		}

		toast.success("Khóa học đã được tạo thành công!");
		router.push("/admin/courses");
	} catch (error: any) {
		console.error("LỖI TẠO KHÓA HỌC:", error.response?.data || error);
		toast.error(
			error.response?.data?.message || "Đã xảy ra lỗi hệ thống khi tạo.",
		);
	} finally {
		isSaving.value = false;
	}
};
</script>

<style scoped>
.cb-root {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	background: #f3f5fa;
	background-image:
		radial-gradient(
			ellipse at 20% 20%,
			rgba(99, 102, 241, 0.05) 0%,
			transparent 60%
		),
		radial-gradient(
			ellipse at 80% 80%,
			rgba(168, 85, 247, 0.03) 0%,
			transparent 60%
		);
}
.cb-topbar {
	position: sticky;
	top: 0;
	z-index: 200;
	height: 60px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	padding: 0 2rem;
	background: rgba(255, 255, 255, 0.97);
	backdrop-filter: blur(20px);
	border-bottom: 1px solid rgba(99, 102, 241, 0.08);
	box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
}
.cb-topbar-left {
	display: flex;
	align-items: center;
	gap: 1rem;
	flex-shrink: 0;
}
.cb-topbar-divider {
	width: 1px;
	height: 28px;
	background: #e2e8f0;
}
.btn-back-flat {
	display: flex;
	align-items: center;
	gap: 5px;
	background: none;
	border: none;
	cursor: pointer;
	color: #64748b;
	font-size: 13px;
	font-weight: 700;
	padding: 6px 10px;
	border-radius: 9px;
	transition: 0.2s;
}
.btn-back-flat:hover {
	background: #f1f5f9;
	color: #6366f1;
}
.cb-topbar-title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 15px;
	font-weight: 900;
	color: #1e293b;
}
.cb-title-icon {
	color: #6366f1;
}
.cb-topbar-steps {
	display: flex;
	align-items: center;
	gap: 0;
	background: #eef1f8;
	border: 1px solid #e2e6f0;
	border-radius: 14px;
	padding: 4px 6px;
}
.cb-step-pill {
	display: flex;
	align-items: center;
	gap: 8px;
	background: none;
	border: none;
	cursor: pointer;
	padding: 8px 20px;
	border-radius: 11px;
	height: 40px;
	font-size: 12px;
	font-weight: 800;
	color: #7a8499;
	transition: all 0.2s;
	white-space: nowrap;
}
.cb-step-pill:hover {
	color: #6366f1;
}
.cb-step-pill.is-active {
	background: white;
	color: #1e293b;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.09);
}
.cb-step-pill.is-done {
	color: #10b981;
}
.step-dot {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #dde2ee;
	font-size: 11px;
	font-weight: 900;
	color: #7a8499;
	flex-shrink: 0;
	transition: 0.2s;
}
.cb-step-pill.is-active .step-dot {
	background: #4f46e5;
	color: white;
	box-shadow: 0 2px 8px rgba(79, 70, 229, 0.35);
}
.cb-step-pill.is-done .step-dot {
	background: #d1f5e9;
	color: #059669;
}
.step-text {
	font-size: 13px;
	font-weight: 800;
}
.step-arrow {
	font-size: 16px;
	color: #c0c8d8;
	margin: 0 2px;
}
.cb-topbar-right {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-shrink: 0;
}
.btn-cancel-flat {
	display: flex;
	align-items: center;
	gap: 5px;
	background: rgba(239, 68, 68, 0.05);
	border: 1.5px solid rgba(239, 68, 68, 0.15);
	color: #ef4444;
	padding: 7px 14px;
	border-radius: 10px;
	font-weight: 800;
	font-size: 12px;
	cursor: pointer;
	transition: 0.2s;
}
.btn-cancel-flat:hover {
	background: rgba(239, 68, 68, 0.1);
}
.btn-save-flat {
	display: flex;
	align-items: center;
	gap: 6px;
	background: linear-gradient(135deg, #6366f1, #4f46e5);
	border: none;
	color: white;
	padding: 7px 18px;
	border-radius: 10px;
	font-weight: 800;
	font-size: 12px;
	cursor: pointer;
	transition: 0.2s;
	box-shadow: 0 3px 10px rgba(79, 70, 229, 0.3);
}
.btn-save-flat:hover {
	transform: translateY(-1px);
	filter: brightness(1.05);
}
.btn-save-flat:disabled {
	opacity: 0.7;
	cursor: not-allowed;
	transform: none;
}
.cb-body {
	flex: 1;
	display: flex;
	flex-direction: row;
	overflow: hidden;
}
.cb-step-rail {
	width: 72px;
	flex-shrink: 0;
	background: #f2f4fa;
	border-right: 1px solid #e4e8f2;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 2rem 0;
	position: sticky;
	top: 60px;
	height: calc(100vh - 60px);
	overflow: hidden;
}
.rail-track {
	position: absolute;
	top: 2rem;
	bottom: 2rem;
	left: 50%;
	transform: translateX(-50%);
	width: 2px;
	background: #f1f5f9;
	border-radius: 2px;
}
.rail-fill {
	width: 100%;
	background: linear-gradient(180deg, #10b981, #6366f1);
	transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	border-radius: 2px;
}
.rail-nodes {
	display: flex;
	flex-direction: column;
	gap: 3rem;
	position: relative;
	z-index: 1;
	align-items: center;
}
.rail-node {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 5px;
	background: none;
	border: none;
	cursor: pointer;
}
.rail-bubble {
	width: 36px;
	height: 36px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 900;
	font-size: 13px;
	color: #94a3b8;
	background: #f1f5f9;
	transition: all 0.3s;
}
.rail-node.active[data-color] .rail-bubble,
.rail-node.active .rail-bubble {
	background: #4f46e5;
	color: white;
	box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
}
.rail-node.done .rail-bubble {
	background: #e8f5e9;
	color: #10b981;
}
.rail-label {
	font-size: 9px;
	font-weight: 800;
	color: #cbd5e1;
	letter-spacing: 0.3px;
	text-align: center;
	line-height: 1.2;
	writing-mode: horizontal-tb;
}
.rail-node.active .rail-label {
	color: #64748b;
}
.cb-content {
	flex: 1;
	overflow-y: auto;
	padding: 2rem 2.5rem;
}
.cb-form {
	max-width: 1060px;
	margin: 0 auto;
}
.tab1-balanced-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: auto auto;
	gap: 1.5rem;
}
.flex-col {
	display: flex;
	flex-direction: column;
}
.flex-1 {
	flex: 1;
}
.d-flex {
	display: flex;
}
.curriculum-two-col {
	display: grid;
	grid-template-columns: 1fr 240px;
	gap: 1.5rem;
	align-items: flex-start;
}
.curriculum-main-col {
	min-width: 0;
}
.sticky-summary-card {
	position: sticky;
	top: 1.5rem;
	background: white;
	border-radius: 20px;
	border: 1px solid rgba(99, 102, 241, 0.08);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
	padding: 1.25rem;
}
.summary-header {
	display: flex;
	align-items: center;
	gap: 7px;
	font-size: 11px;
	font-weight: 900;
	color: #64748b;
	text-transform: uppercase;
	letter-spacing: 1px;
	margin-bottom: 1rem;
}
.summary-stats {
	display: flex;
	flex-direction: column;
	gap: 8px;
}
.stat-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8px 12px;
	border-radius: 11px;
	background: #f8fafc;
}
.stat-label {
	font-size: 12px;
	color: #64748b;
	font-weight: 700;
}
.stat-val {
	font-size: 18px;
	font-weight: 900;
}
.stat-val.primary {
	color: #4f46e5;
}
.stat-val.indigo {
	color: #6366f1;
}
.stat-val.emerald {
	color: #10b981;
}
.summary-module-list {
	border-top: 1px solid #f1f5f9;
	padding-top: 0.75rem;
}
.summary-module-row {
	display: flex;
	align-items: center;
	gap: 7px;
	padding: 5px 0;
}
.sml-badge {
	width: 18px;
	height: 18px;
	border-radius: 6px;
	background: #1e293b;
	color: white;
	font-size: 9px;
	font-weight: 900;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.sml-title {
	font-size: 12px;
	font-weight: 700;
	color: #475569;
	flex: 1;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.sml-count {
	font-size: 10px;
	font-weight: 800;
	color: #94a3b8;
	white-space: nowrap;
}
.questions-two-col-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1.5rem;
	align-items: start;
}
.skeleton-fullwidth {
	background: white;
	border-radius: 24px;
	padding: 3rem;
	box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}
.skeleton-line {
	height: 1.2rem;
	background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
	background-size: 200% 100%;
	border-radius: 8px;
	animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
	0% {
		background-position: -200% 0;
	}
	100% {
		background-position: 200% 0;
	}
}
.glass-effect {
	background: rgba(255, 255, 255, 0.92);
	backdrop-filter: blur(20px);
}
.shadow-glow {
	box-shadow: 0 8px 40px rgba(99, 102, 241, 0.08);
}
.tab-panel-v3 {
	animation: fadeInUp 0.35s ease-out;
}
.section-card-v3 {
	background: white;
	border-radius: 20px;
	border: 1px solid #eef1f6;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	padding: 1.5rem;
}
.section-eyebrow {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 1.25rem;
	font-size: 11px;
	font-weight: 900;
	color: #8a94a6;
	text-transform: uppercase;
	letter-spacing: 1px;
}
.eyebrow-icon {
	width: 32px;
	height: 32px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.eyebrow-icon.primary {
	background: rgba(79, 70, 229, 0.08);
	color: #5b52e0;
}
.eyebrow-icon.indigo {
	background: rgba(99, 102, 241, 0.08);
	color: #5558e0;
}
.eyebrow-icon.emerald {
	background: rgba(16, 185, 129, 0.08);
	color: #0d9f6e;
}
.tab-footer-v3 {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: #f8fafc;
	border: 1px solid #eef1f6;
	border-radius: 16px;
	padding: 1rem 1.25rem;
	margin-top: 1.5rem;
}
.glass-field-v2 label {
	display: block;
	font-size: 11px;
	font-weight: 900;
	color: #94a3b8;
	margin-bottom: 10px;
	text-transform: uppercase;
	letter-spacing: 1px;
}
.premium-input-v2,
.premium-textarea-v2 {
	width: 100%;
	padding: 0.95rem 1.25rem;
	border-radius: 16px;
	border: 1.5px solid #e8edf5;
	outline: none;
	font-size: 15px;
	color: #1e293b;
	background: #fafbfd;
	transition: all 0.25s;
	font-family: inherit;
}

/* Custom css cho cái dropdown select */
.custom-select-arrow {
	appearance: auto;
	cursor: pointer;
	background-image: none; /* Dùng mũi tên mặc định của trình duyệt để an toàn nhất */
}

.premium-input-v2::placeholder,
.premium-textarea-v2::placeholder {
	color: #b0bec5;
}
.premium-input-v2:focus,
.premium-textarea-v2:focus {
	border-color: #6366f1;
	background: white;
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.08);
}
.premium-input-v2-sm {
	width: 100%;
	padding: 0.75rem 1rem;
	border-radius: 14px;
	border: 1.5px solid #e8edf5;
	outline: none;
	font-size: 14px;
	color: #1e293b;
	background: #fafbfd;
	transition: 0.2s;
	font-family: inherit;
}
.premium-input-v2-sm:focus {
	border-color: #6366f1;
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.06);
	background: white;
}
.premium-input-v2-xs {
	width: 100%;
	padding: 8px 12px;
	border-radius: 12px;
	border: 1.5px solid #e2e8f0;
	outline: none;
	font-size: 13px;
	font-family: inherit;
	background: white;
}
.premium-textarea-v2-sm {
	width: 100%;
	padding: 0.75rem 1rem;
	border-radius: 14px;
	border: 1.5px solid #e8edf5;
	outline: none;
	font-size: 14px;
	color: #1e293b;
	background: #fafbfd;
	resize: vertical;
	font-family: inherit;
	transition: 0.2s;
}
.premium-textarea-v2-sm:focus {
	border-color: #6366f1;
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.06);
	background: white;
}
.premium-textarea-v2-xs {
	width: 100%;
	padding: 8px 12px;
	border-radius: 12px;
	border: 1.5px solid #e2e8f0;
	outline: none;
	font-size: 13px;
	font-family: inherit;
	background: white;
	resize: vertical;
}
.input-icon-wrapper {
	position: relative;
	display: flex;
	align-items: center;
}
.input-icon {
	position: absolute;
	left: 16px;
	z-index: 2;
	pointer-events: none;
}
.ps-5 {
	padding-left: 48px !important;
}
.text-primary {
	color: #5b52e0;
}
.text-indigo {
	color: #5558e0;
}
.text-danger {
	color: #ef4444;
}
.text-warning {
	color: #f59e0b;
}
.text-secondary {
	color: #8a94a6;
}
.glass-sub-panel-v2 {
	border-radius: 20px;
	border: 1px solid #f1f5f9;
	background: #fff;
	position: relative;
	overflow: hidden;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}
.glass-sub-panel-v2::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 4px;
	height: 100%;
}
.border-indigo::before {
	background: #6366f1;
}
.border-amber::before {
	background: #f59e0b;
}
.panel-header-v2 {
	display: flex;
	align-items: center;
	gap: 10px;
}
.panel-header-v2 h6 {
	font-weight: 800;
	font-size: 15px;
}
.tag-label {
	display: block;
	font-size: 10px;
	font-weight: 800;
	color: #94a3b8;
	margin-bottom: 8px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}
.premium-dp-v2 {
	--dp-border-radius: 14px;
	--dp-input-padding: 10px 14px;
	width: 100%;
}
.s-icon-box {
	width: 48px;
	height: 48px;
	flex-shrink: 0;
	border-radius: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.s-icon-box.success {
	background: rgba(16, 185, 129, 0.08);
	color: #10b981;
}
.banner-upload-box-v2 {
	border: 2px dashed #e4e8f2;
	border-radius: 18px;
	min-height: 200px;
	transition: 0.25s;
	background: #fafbfd;
	position: relative;
	overflow: hidden;
}
.banner-upload-box-v2:hover {
	border-color: #6c63ff;
	background: #f8f7ff;
}
.upload-empty-state {
	width: 100%;
	height: 100%;
	min-height: 200px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 6px;
	padding: 1.5rem;
}
.upload-icon-wrap {
	color: #8a94a6;
	margin-bottom: 4px;
}
.upload-empty-state h6 {
	font-weight: 800;
	color: #3d4966;
	margin: 0;
	font-size: 14px;
}
.upload-hint {
	font-size: 12px;
	color: #8a94a6;
	margin: 0;
}
.absolute-input {
	position: absolute;
	inset: 0;
	opacity: 0;
	cursor: pointer;
}
.upload-full-preview {
	position: absolute;
	inset: 0;
}
.upload-full-preview img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.preview-actions {
	position: absolute;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	opacity: 0;
	transition: 0.3s;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 1rem;
}
.banner-upload-box-v2:hover .preview-actions {
	opacity: 1;
}
.btn-circle-danger {
	width: 44px;
	height: 44px;
	border-radius: 50%;
	border: none;
	background: rgba(239, 68, 68, 0.9);
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}
.btn-glass-white {
	background: rgba(255, 255, 255, 0.9);
	color: #1e293b;
	font-weight: 700;
	padding: 0.6rem 1.1rem;
	border-radius: 12px;
	cursor: pointer;
	position: relative;
	font-size: 13px;
}
.premium-switch-v2 {
	display: flex;
	align-items: center;
	gap: 0;
}
.premium-switch-v2 input {
	display: none;
}
.pill-switch {
	width: 48px;
	height: 26px;
	border-radius: 14px;
	background: #e2e8f0;
	position: relative;
	cursor: pointer;
	transition: 0.3s;
	display: block;
	flex-shrink: 0;
}
.pill-switch::after {
	content: "";
	width: 20px;
	height: 20px;
	background: white;
	border-radius: 50%;
	position: absolute;
	left: 3px;
	top: 3px;
	transition: 0.3s;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}
.premium-switch-v2 input:checked + .pill-switch {
	background: #10b981;
}
.premium-switch-v2 input:checked + .pill-switch::after {
	left: 25px;
}
.field-stack {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}
.publish-row {
	padding-top: 1rem;
	border-top: 1px solid #f1f5f9;
}
.footer-btn-group {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-right: 24px;
}
.btn-outline-secondary-action {
	display: inline-flex;
	align-items: center;
	gap: 7px;
	background: white;
	border: 1.5px solid #d0d6e8;
	color: #4f46e5;
	padding: 0.75rem 1.25rem;
	border-radius: 12px;
	font-weight: 800;
	font-size: 13px;
	cursor: pointer;
	transition: 0.2s;
	min-height: 44px;
}
.btn-outline-secondary-action:hover {
	border-color: #6366f1;
	background: #f8f7ff;
}
.btn-outline-secondary-action:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}
.module-glass-panel-v2 {
	background: white;
	border-radius: 20px;
	border: 1px solid #eef1f6;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	overflow: hidden;
}
.module-header-v2 {
	padding: 1.1rem 1.5rem;
	background: #f8fafc;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid #f1f5f9;
}
.m-info {
	display: flex;
	align-items: center;
	gap: 1rem;
	flex: 1;
}
.m-index-badge {
	background: #1e293b;
	color: white;
	padding: 4px 12px;
	border-radius: 9px;
	font-size: 10px;
	font-weight: 900;
	letter-spacing: 0.5px;
	white-space: nowrap;
}
.m-title-input {
	border: none;
	background: transparent;
	font-size: 16px;
	font-weight: 800;
	color: #1e293b;
	outline: none;
	width: 100%;
	font-family: inherit;
}
.m-actions {
	display: flex;
	align-items: center;
	gap: 8px;
}
.btn-glass-danger-sm {
	width: 38px;
	height: 38px;
	border-radius: 11px;
	background: rgba(239, 68, 68, 0.05);
	border: 1px solid rgba(239, 68, 68, 0.15);
	color: #ef4444;
	cursor: pointer;
	transition: 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
}
.btn-glass-danger-sm:hover {
	background: rgba(239, 68, 68, 0.12);
}
.module-body {
	padding: 1.5rem;
}
.lessons-stack {
	display: flex;
	flex-direction: column;
}
.lesson-nested-glass-v2 {
	background: #fafbfd;
	border: 1.5px solid #f1f5f9;
	border-radius: 20px;
	overflow: hidden;
	transition: 0.3s;
}
.lesson-nested-glass-v2:hover {
	border-color: rgba(99, 102, 241, 0.18);
}
.lesson-top-nav {
	padding: 0.75rem 1rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: rgba(0, 0, 0, 0.015);
	border-bottom: 1px solid #f1f5f9;
}
.l-left {
	display: flex;
	align-items: center;
	gap: 10px;
	flex: 1;
}
.l-num-tag {
	font-size: 9px;
	font-weight: 900;
	letter-spacing: 0.5px;
	color: #6366f1;
	background: rgba(99, 102, 241, 0.07);
	padding: 4px 9px;
	border-radius: 8px;
	white-space: nowrap;
}
.l-title-input {
	border: none;
	background: transparent;
	font-size: 14px;
	font-weight: 700;
	color: #334155;
	outline: none;
	width: 100%;
	font-family: inherit;
}
.l-right {
	display: flex;
	align-items: center;
	gap: 8px;
}
.glass-check-pill {
	display: flex;
	align-items: center;
	gap: 5px;
	border: 1.5px solid #e2e8f0;
	border-radius: 30px;
	padding: 4px 12px;
	cursor: pointer;
	transition: 0.2s;
	min-height: 34px;
}
.glass-check-pill input {
	display: none;
}
.glass-check-pill label {
	font-size: 10px;
	font-weight: 800;
	color: #94a3b8;
	cursor: pointer;
	margin: 0;
}
.glass-check-pill.active {
	border-color: #10b981;
	background: rgba(16, 185, 129, 0.05);
}
.glass-check-pill.active label {
	color: #10b981;
}
.btn-icon-trash {
	width: 34px;
	height: 34px;
	border-radius: 10px;
	background: transparent;
	border: 1px solid #f1f5f9;
	color: #94a3b8;
	cursor: pointer;
	transition: 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
}
.btn-icon-trash:hover {
	background: rgba(239, 68, 68, 0.08);
	border-color: rgba(239, 68, 68, 0.2);
	color: #ef4444;
}
.lesson-config-grid {
	padding: 1.1rem;
}
.config-type-selector {
	display: flex;
	gap: 8px;
}
.type-pill {
	border: 1.5px solid #e2e8f0;
	background: white;
	padding: 7px 14px;
	border-radius: 11px;
	font-size: 11px;
	font-weight: 800;
	color: #94a3b8;
	display: flex;
	align-items: center;
	gap: 6px;
	cursor: pointer;
	transition: 0.2s;
	min-height: 38px;
}
.type-pill.active {
	background: #1e293b;
	color: white;
	border-color: #1e293b;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.mode-pills {
	display: inline-flex;
	background: #f1f5f9;
	border-radius: 12px;
	padding: 3px;
}
.mode-pill {
	border: none;
	background: transparent;
	padding: 5px 14px;
	border-radius: 10px;
	font-size: 11px;
	font-weight: 800;
	color: #64748b;
	cursor: pointer;
	transition: 0.2s;
	min-height: 34px;
}
.mode-pill.active {
	background: white;
	color: #1e293b;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}
.input-glow-container {
	margin-top: 8px;
}
.upload-lesson-video {
	border: 2px dashed #e2e8f0;
	border-radius: 14px;
	text-align: center;
	cursor: pointer;
	position: relative;
	overflow: hidden;
}
.upload-lesson-video label {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 1.25rem;
	cursor: pointer;
	gap: 6px;
}
.nested-section-box-v2 {
	border: 1px solid #f1f5f9;
	border-radius: 16px;
	background: white;
	overflow: hidden;
}
.box-header {
	display: flex;
	align-items: center;
	padding: 0.65rem 0.9rem;
	background: #f8fafc;
	border-bottom: 1px solid #f1f5f9;
}
.box-title {
	font-size: 10px;
	font-weight: 900;
	letter-spacing: 0.5px;
	color: #64748b;
	display: flex;
	align-items: center;
	gap: 5px;
}
.box-content {
	padding: 0.7rem 0.9rem;
}
.btn-glass-add-sm {
	border: 1px solid rgba(99, 102, 241, 0.2);
	background: rgba(99, 102, 241, 0.04);
	color: #6366f1;
	padding: 4px 12px;
	border-radius: 10px;
	font-size: 11px;
	font-weight: 800;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 5px;
	transition: 0.2s;
	min-height: 34px;
}
.btn-glass-add-sm:hover {
	background: rgba(99, 102, 241, 0.1);
}
.att-item-row {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 7px 10px;
	border-radius: 11px;
	background: #fafbfd;
	border: 1px solid #f1f5f9;
}
.att-name-input {
	flex: 1;
	border: none;
	background: transparent;
	font-size: 13px;
	font-weight: 600;
	outline: none;
}
.btn-att-upload {
	font-size: 11px;
	font-weight: 800;
	color: #6366f1;
	background: rgba(99, 102, 241, 0.06);
	padding: 4px 9px;
	border-radius: 8px;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 4px;
	position: relative;
}
.btn-no-border {
	border: none;
	background: transparent;
	cursor: pointer;
}
.border-amber-soft {
	border-color: rgba(245, 158, 11, 0.12) !important;
}
.btn-amber-switch {
	border: 1px solid rgba(245, 158, 11, 0.2);
	background: rgba(245, 158, 11, 0.05);
	color: #d97706;
	padding: 4px 12px;
	border-radius: 10px;
	font-size: 11px;
	font-weight: 800;
	cursor: pointer;
	transition: 0.2s;
	min-height: 34px;
}
.btn-amber-switch.active {
	background: rgba(245, 158, 11, 0.1);
}
.bg-amber-glass {
	background: rgba(255, 251, 235, 0.8);
	border: 1px solid rgba(245, 158, 11, 0.1);
}
.opt-glass-pill {
	display: flex;
	align-items: center;
	gap: 7px;
	padding: 7px 11px;
	border-radius: 11px;
	border: 1.5px solid #f1f5f9;
	background: white;
	transition: 0.2s;
}
.opt-glass-pill.correct {
	border-color: #10b981;
	background: rgba(16, 185, 129, 0.05);
}
.opt-glass-pill input[type="radio"] {
	accent-color: #10b981;
}
.opt-mini-input {
	flex: 1;
	border: none;
	background: transparent;
	font-size: 12px;
	outline: none;
}
.q-nested-card-v2 {
	border-radius: 13px;
	border: 1px solid #f1f5f9;
	background: #fafbfd;
}
.pointer {
	cursor: pointer;
	background: none;
	border: none;
	font-size: 12px;
	font-weight: 700;
}
.btn-dashed-add {
	border: 2px dashed #e2e8f0;
	border-radius: 16px;
	padding: 1.1rem;
	background: transparent;
	color: #94a3b8;
	font-weight: 800;
	font-size: 13px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	transition: 0.25s;
	min-height: 52px;
}
.btn-dashed-add:hover {
	border-color: #6366f1;
	color: #6366f1;
}
.btn-dashed-add-lg {
	border: 2px dashed #e2e8f0;
	border-radius: 20px;
	padding: 1.5rem;
	background: transparent;
	color: #94a3b8;
	font-weight: 800;
	font-size: 14px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	transition: 0.25s;
	min-height: 60px;
}
.btn-dashed-add-lg:hover {
	border-color: #6366f1;
	color: #6366f1;
}
.quiz-config-bar {
	background: white;
	border-radius: 20px;
	border: 1px solid #eef1f6;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	padding: 1.5rem 1.75rem;
}
.qcb-header {
	display: flex;
	align-items: center;
	gap: 1rem;
}
.qcb-header h5 {
	font-size: 16px;
	font-weight: 800;
	color: #1e293b;
}
.qcb-fields-grid {
	display: grid;
	grid-template-columns: 2fr 1fr 1fr 1fr;
	gap: 1.25rem;
	align-items: flex-end;
}
.quiz-bank-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.q-glass-card-v2 {
	background: white;
	border-radius: 22px;
	border: 1px solid #f1f5f9;
	overflow: hidden;
}
.q-card-header-v2 {
	background: #f8fafc;
	border-bottom: 1px solid #f1f5f9;
}
.q-idx-label {
	font-size: 11px;
	font-weight: 900;
	color: #94a3b8;
	letter-spacing: 1px;
}
.q-card-body-v2 {
	background: white;
}
.bg-white-glass {
	background: white;
}
.btn-circle-danger-sm {
	width: 34px;
	height: 34px;
	border-radius: 50%;
	border: none;
	background: rgba(239, 68, 68, 0.08);
	color: #ef4444;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: 0.2s;
}
.btn-circle-danger-sm:hover {
	background: rgba(239, 68, 68, 0.18);
}
.opt-card-premium-v2 {
	display: flex;
	align-items: center;
	gap: 10px;
	background: #fafbfd;
	border: 1.5px solid #f1f5f9;
	padding: 0.8rem;
	border-radius: 14px;
	transition: 0.3s;
}
.opt-card-premium-v2.is_correct {
	border-color: #10b981;
	background: rgba(16, 185, 129, 0.04);
}
.opt-selector {
	display: flex;
	align-items: center;
}
.opt-selector input[type="radio"] {
	display: none;
}
.letter-marker {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: #f1f5f9;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 800;
	font-size: 13px;
	color: #94a3b8;
	flex-shrink: 0;
	transition: 0.3s;
}
.opt-card-premium-v2.is_correct .letter-marker {
	background: #10b981;
	color: white;
}
.opt-text-input {
	border: none;
	background: transparent;
	flex: 1;
	font-size: 13px;
	outline: none;
	font-weight: 600;
	font-family: inherit;
}
.text-success-neon {
	color: #10b981;
}
.btn-neon {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 0.8rem 1.6rem;
	border-radius: 14px;
	border: none;
	font-weight: 800;
	font-size: 14px;
	color: white;
	cursor: pointer;
	transition: all 0.25s;
	min-height: 46px;
}
.btn-neon.primary {
	background: linear-gradient(135deg, #6366f1, #4f46e5);
	box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25);
}
.btn-neon.indigo {
	background: linear-gradient(135deg, #a855f7, #6366f1);
	box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25);
}
.btn-neon.success {
	background: linear-gradient(135deg, #10b981, #059669);
	box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25);
}
.btn-neon:hover {
	transform: translateY(-2px);
	filter: brightness(1.05);
}
.btn-neon:disabled {
	opacity: 0.7;
	cursor: not-allowed;
	transform: none;
}
.btn-neon.sm {
	padding: 0.5rem 0.9rem;
	font-size: 12px;
	border-radius: 11px;
	min-height: 34px;
}
.btn-neon.lg {
	padding: 0.95rem 1.9rem;
	font-size: 15px;
}
.btn-glass-outline {
	display: inline-flex;
	align-items: center;
	gap: 7px;
	background: white;
	border: 1.5px solid #e2e8f0;
	padding: 0.8rem 1.4rem;
	border-radius: 14px;
	font-weight: 800;
	color: #64748b;
	font-size: 13px;
	cursor: pointer;
	transition: 0.2s;
	min-height: 46px;
}
.btn-glass-outline:hover {
	border-color: #6366f1;
	color: #6366f1;
}
.shadow-glow-emerald {
	box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25) !important;
}
.animate-fade-in {
	animation: fadeIn 0.4s ease-out;
}
.animate-slide-up {
	animation: slideInUp 0.45s ease-out;
}
@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}
@keyframes slideInUp {
	from {
		opacity: 0;
		transform: translateY(12px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
.fade-slide-enter-active,
.fade-slide-leave-active {
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from {
	opacity: 0;
	transform: translateX(16px);
}
.fade-slide-leave-to {
	opacity: 0;
	transform: translateX(-16px);
	position: absolute;
}
.expand-enter-active,
.expand-leave-active {
	transition: all 0.3s ease;
	overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
	max-height: 0;
	opacity: 0;
}
.expand-enter-to,
.expand-leave-from {
	max-height: 1000px;
	opacity: 1;
}
.spin {
	animation: spin 1s linear infinite;
}
@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
.w-100 {
	width: 100%;
}
.text-center {
	text-align: center;
}
.mb-0 {
	margin-bottom: 0;
}
.mb-2 {
	margin-bottom: 0.5rem;
}
.mb-3 {
	margin-bottom: 0.75rem;
}
.mb-4 {
	margin-bottom: 1rem;
}
.mb-5 {
	margin-bottom: 1.5rem;
}
.mt-2 {
	margin-top: 0.5rem;
}
.mt-3 {
	margin-top: 0.75rem;
}
.mt-4 {
	margin-top: 1rem;
}
.mt-5 {
	margin-top: 1.5rem;
}
.mt-auto {
	margin-top: auto;
}
.p-3 {
	padding: 0.75rem;
}
.p-4 {
	padding: 1rem;
}
.px-4 {
	padding-left: 1rem;
	padding-right: 1rem;
}
.ms-2 {
	margin-left: 0.5rem;
}
.ms-3 {
	margin-left: 0.75rem;
}
.fw-bold {
	font-weight: 700;
}
.fw-black {
	font-weight: 900;
}
.small {
	font-size: 12px;
}
.d-flex {
	display: flex;
}
.align-items-center {
	align-items: center;
}
.justify-content-center {
	justify-content: center;
}
.justify-content-between {
	justify-content: space-between;
}
.gap-2 {
	gap: 0.5rem;
}
.rounded-4 {
	border-radius: 16px;
}
.col-6 {
	flex: 0 0 50%;
	max-width: 50%;
	padding: 0 8px;
}
.col-2 {
	flex: 0 0 16.66%;
	max-width: 16.66%;
	padding: 0 8px;
}
.col-8 {
	flex: 0 0 66.66%;
	max-width: 66.66%;
	padding: 0 8px;
}
.col-md-6 {
	flex: 0 0 50%;
	max-width: 50%;
	padding: 0 8px;
}
.row {
	display: flex;
	flex-wrap: wrap;
	margin: 0 -8px;
}
.g-2 {
	gap: 0.5rem;
}
.g-3 {
	gap: 0.75rem;
}

@media (max-width: 1200px) {
	.tab1-core-grid {
		grid-template-columns: 1fr;
	}
	.questions-two-col-grid {
		grid-template-columns: 1fr;
	}
	.curriculum-two-col {
		grid-template-columns: 1fr;
	}
	.curriculum-side-col {
		display: none;
	}
	.cb-content {
		padding: 2rem;
	}
}
@media (max-width: 992px) {
	.content-grid-tab1 {
		grid-template-columns: 1fr;
	}
	.qcb-fields-grid {
		grid-template-columns: 1fr 1fr;
	}
	.cb-step-rail {
		display: none;
	}
	.cb-topbar {
		padding: 0 1rem;
	}
	.cb-topbar-title span {
		display: none;
	}
}
@media (max-width: 768px) {
	.qcb-fields-grid {
		grid-template-columns: 1fr;
	}
	.cb-topbar-steps {
		display: none;
	}
	.cb-content {
		padding: 1.25rem;
	}
}
.level-radio-v2 {
	flex: 1;
	border: 1.5px solid #eef1f6;
	background: #fafbfd;
	border-radius: 12px;
	padding: 10px;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 10px;
	transition: 0.2s;
}
.level-radio-v2:hover {
	border-color: #6366f1;
	background: #fff;
}
.level-radio-v2.active {
	border-color: #6366f1;
	background: #f8f7ff;
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.06);
}
.level-dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	display: block;
}
.dot-1 {
	background: #ef4444;
	box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
}
.dot-2 {
	background: #6366f1;
	box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
}
.dot-3 {
	background: #10b981;
	box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}
.level-info {
	display: flex;
	flex-direction: column;
	gap: 1px;
}
.lv-title {
	font-size: 13px;
	font-weight: 800;
	color: #1e293b;
}
.lv-desc {
	font-size: 10px;
	font-weight: 700;
	color: #94a3b8;
	text-transform: uppercase;
}
.active .lv-title {
	color: #4f46e5;
}
</style>
