<template>
	<div class="container-fluid build-course-page">
		<div class="page-header">
			<div class="header-content">
				<div class="header-icon-box pulse-glow">
					<BookOpen
						:size="32"
						style="width: 32px; height: 32px; min-width: 32px"
					/>
				</div>
				<div>
					<h1 class="page-title-gradient">Chỉnh Sửa Khóa Học</h1>
					<p class="page-desc">ID Khóa học: #{{ courseId }}</p>
				</div>
			</div>
			<div class="header-actions">
				<button @click="router.push('/admin/courses')" class="btn btn-outline">
					<i class="fas fa-arrow-left me-2"></i>Quay lại
				</button>
			</div>
		</div>

		<div v-if="isLoadingData" class="text-center py-5">
			<i class="fas fa-spinner fa-spin fs-1 text-primary"></i>
			<p class="mt-2 text-muted fw-bold">Đang tải dữ liệu khóa học...</p>
		</div>

		<div v-else class="glass-card form-container">
			<div class="col-lg-12">
				<div class="card border-0 mb-0 shadow-none bg-transparent">
					<div
						class="card-header d-flex flex-column align-items-start pb-0 border-0"
					>
						<ul class="nav nav-tabs border-bottom-0 w-100" role="tablist">
							<li class="nav-item">
								<a
									class="nav-link"
									:class="{ active: activeTab === 'basic' }"
									@click.prevent="activeTab = 'basic'"
									href="#"
									>1. Thông tin chung</a
								>
							</li>
							<li class="nav-item">
								<a
									class="nav-link"
									:class="{ active: activeTab === 'curriculum' }"
									@click.prevent="activeTab = 'curriculum'"
									href="#"
									>2. Giáo trình (Modules)</a
								>
							</li>
							<li class="nav-item">
								<a
									class="nav-link text-success fw-bold"
									:class="{ active: activeTab === 'quiz' }"
									@click.prevent="activeTab = 'quiz'"
									href="#"
									>3. Thi cuối khóa (Final)</a
								>
							</li>
						</ul>
					</div>

					<div class="card-body mt-3">
						<form @submit.prevent="submitCourse" novalidate>
							<div v-if="activeTab === 'basic'">
								<div class="glass-card-body">
									<div class="form-grid">
										<div class="row g-4 mb-2">
											<div class="col-lg-8 input-wrapper">
												<label class="premium-label"
													>Tên khóa học
													<span class="required-star">*</span></label
												>
												<div class="glass-input-group">
													<span class="input-icon"><Type :size="18" /></span>
													<input
														v-model="course.Title"
														type="text"
														class="glass-input"
														required
													/>
												</div>
											</div>
											<div class="col-lg-4">
												<!-- Cấp 2, 3: Hiện Phòng Ban -->
												<div
													v-if="course.Level === 2 || course.Level === 3"
													class="pass-score-card selection-card"
												>
													<div class="psc-header">
														<Users :size="14" class="me-1" />
														<span
															>Phòng ban áp dụng
															<span class="required-star">*</span></span
														>
													</div>
													<div class="psc-body d-block">
														<div class="glass-input-group mt-1">
															<span class="input-icon"
																><Users :size="18"
															/></span>
															<select
																v-model="course.UserGroupId"
																class="glass-input text-dark"
																required
															>
																<option :value="null">
																	-- Khoá chung toàn hệ thống --
																</option>
																<option
																	v-for="dept in departments"
																	:key="dept.id"
																	:value="dept.id"
																>
																	{{ dept.name }}
																</option>
															</select>
														</div>
														<div
															class="mt-2 text-muted"
															style="font-size: 11px"
														>
															<Info :size="12" class="me-1" />Khóa học sẽ chỉ
															dành cho nhân viên từ phòng ban này.
														</div>
													</div>
												</div>
											</div>
										</div>

										<div class="col-lg-12 input-wrapper mb-2">
											<label class="premium-label"
												>Danh mục phân loại
												<span class="required-star">*</span></label
											>
											<div class="glass-input-group">
												<span class="input-icon"
													><FolderCheck :size="18"
												/></span>
												<select
													v-model="course.CategoryId"
													class="glass-input text-dark"
													required
												>
													<option :value="null">-- Chọn danh mục --</option>
													<option
														v-for="cat in categories"
														:key="cat.id"
														:value="cat.id"
													>
														{{ cat.name }}
													</option>
												</select>
											</div>
										</div>

										<div
											class="col-lg-12 input-wrapper mt-3 border-top-glass pt-4"
										>
											<label
												class="premium-label d-flex align-items-center gap-2 mb-3"
												><BookOpen :size="16" class="text-primary" /> Phân cấp
												khóa học <span class="required-star">*</span></label
											>
											<div class="course-groups-grid">
												<div
													class="cg-select-card glass-hover"
													:class="{ selected: course.Level === 1 }"
													@click="course.Level = 1"
												>
													<div class="cg-check-indicator">
														<i
															class="fas fa-check"
															v-if="course.Level === 1"
															style="font-size: 10px"
														></i>
													</div>
													<div class="cg-info">
														<h6 class="cg-name">Cấp 1: Người mới</h6>
														<p class="cg-desc text-truncate">
															Dành cho Onboarding nhân viên
														</p>
													</div>
												</div>
												<div
													class="cg-select-card glass-hover"
													:class="{ selected: course.Level === 2 }"
													@click="course.Level = 2"
												>
													<div class="cg-check-indicator">
														<i
															class="fas fa-check"
															v-if="course.Level === 2"
															style="font-size: 10px"
														></i>
													</div>
													<div class="cg-info">
														<h6 class="cg-name">Cấp 2: Phòng ban</h6>
														<p class="cg-desc text-truncate">
															Chuyên môn theo phòng ban
														</p>
													</div>
												</div>
												<div
													class="cg-select-card glass-hover"
													:class="{ selected: course.Level === 3 }"
													@click="course.Level = 3"
												>
													<div class="cg-check-indicator">
														<i
															class="fas fa-check"
															v-if="course.Level === 3"
															style="font-size: 10px"
														></i>
													</div>
													<div class="cg-info">
														<h6 class="cg-name">Cấp 3: Tự chọn</h6>
														<p class="cg-desc text-truncate">
															Khóa học mở tự do khám phá
														</p>
													</div>
												</div>
											</div>
											<div class="glass-alert-info mt-3">
												<div class="alert-icon"><Info :size="16" /></div>
												<div class="alert-content" style="font-size: 13px">
													<strong>Lưu ý:</strong> Học viên phải hoàn thành tất
													cả khoá Cấp 1 để mở khoá Cấp 2. Khoá Cấp 3 xuất hiện
													trong mục Khám phá.
												</div>
											</div>
										</div>

										<div class="col-lg-12 input-wrapper mt-4">
											<label class="premium-label"
												>Mô tả (Mục đích khóa học)</label
											>
											<div class="glass-input-group textarea-group">
												<span class="input-icon"><AlignLeft :size="18" /></span>
												<textarea
													v-model="course.Description"
													class="glass-input"
													rows="4"
												></textarea>
											</div>
										</div>

										<div
											class="col-lg-12 input-wrapper mt-4 border-top-glass pt-4"
										>
											<label class="premium-label mb-2">Ảnh bìa khóa học</label>
											<div class="glass-input-group">
												<span class="input-icon"><Image :size="18" /></span>
												<input
													type="file"
													class="glass-input"
													accept="image/*"
													@change="handleImageUpload"
												/>
											</div>
											<div
												v-if="course.ExistingCoverUrl && !course.CoverImage"
												class="mt-3 p-2 bg-light rounded d-inline-block border"
											>
												<img
													:src="course.ExistingCoverUrl"
													style="
														max-height: 120px;
														border-radius: 8px;
														object-fit: cover;
													"
												/>
											</div>
											<div
												v-if="course.CoverImage"
												class="mt-3 p-2 bg-light rounded d-inline-block border"
											>
												<img
													:src="getObjectURL(course.CoverImage)"
													style="
														max-height: 120px;
														border-radius: 8px;
														object-fit: cover;
													"
												/>
											</div>
											<small
												v-if="course.ExistingCoverUrl && !course.CoverImage"
												class="text-success mt-1 d-block"
											>
												<i class="fas fa-check-circle me-1"></i> Khóa học đã có
												ảnh bìa. Chọn tệp mới để ghi đè.
											</small>
										</div>
									</div>
								</div>

								<div
									class="glass-card-banner px-4 py-3 mt-4 mb-3 rounded"
									style="
										background: rgba(99, 102, 241, 0.05);
										border: 1px dashed rgba(99, 102, 241, 0.2);
									"
								>
									<div class="row g-4 w-100 m-0">
										<div class="col-md-6 border-end-glass">
											<label
												class="premium-label d-flex align-items-center gap-2 mb-3"
											>
												<Calendar :size="16" class="text-primary" /> Thời gian
												đăng ký
											</label>
											<div class="input-wrapper mb-3">
												<label
													class="premium-label text-muted"
													style="font-size: 11px"
													>Từ ngày</label
												>
												<VueDatePicker
													v-model="course.EnrollStartDate"
													auto-apply
													class="glass-datepicker"
												/>
											</div>
											<div class="input-wrapper mb-0">
												<label
													class="premium-label text-muted"
													style="font-size: 11px"
													>Đến ngày</label
												>
												<VueDatePicker
													v-model="course.EnrollEndDate"
													auto-apply
													class="glass-datepicker"
												/>
											</div>
										</div>
										<div class="col-md-6 ps-md-4">
											<label
												class="premium-label d-flex align-items-center gap-2 mb-3"
											>
												<Clock :size="16" class="text-warning" /> Hạn hoàn thành
											</label>
											<div class="input-wrapper mb-3">
												<label
													class="premium-label text-muted"
													style="font-size: 11px"
													>Số ngày học sau khi đăng ký</label
												>
												<div class="glass-input-group">
													<span class="input-icon"><Clock :size="18" /></span>
													<input
														v-model="course.CompletionDeadlineDays"
														type="number"
														class="glass-input"
														placeholder="Nhập số ngày..."
													/>
												</div>
											</div>
											<div class="input-wrapper mb-0">
												<label
													class="premium-label text-muted"
													style="font-size: 11px"
													>Ngày kết thúc tuyệt đối</label
												>
												<VueDatePicker
													v-model="course.CompletionEndDate"
													auto-apply
													class="glass-datepicker"
												/>
											</div>
										</div>
									</div>
								</div>

								<div
									class="glass-card-banner d-flex align-items-center justify-content-between p-4 mb-4 rounded"
									style="
										background: rgba(16, 185, 129, 0.05);
										border: 1px solid rgba(16, 185, 129, 0.2);
									"
								>
									<div class="d-flex align-items-center gap-3">
										<div
											class="banner-icon-bg"
											style="
												color: #10b981;
												background: rgba(16, 185, 129, 0.1);
											"
										>
											<Globe :size="20" />
										</div>
										<div>
											<h6 class="banner-title text-success">
												Xuất bản khóa học
											</h6>
											<p class="banner-desc" style="font-size: 13px">
												Học viên có thể nhìn thấy và đăng ký ngay lập tức.
											</p>
										</div>
									</div>
									<div
										class="form-check form-switch"
										style="transform: scale(1.5); margin-right: 10px"
									>
										<input
											v-model="course.IsPublished"
											class="form-check-input ms-0 cursor-pointer"
											type="checkbox"
											id="pubSwitch"
										/>
									</div>
								</div>

								<div class="form-actions-container">
									<button
										type="button"
										class="btn-submit"
										@click="activeTab = 'curriculum'"
									>
										Tiếp theo: Giáo trình
										<i class="fas fa-arrow-right ms-2 fs-14"></i>
									</button>
								</div>
							</div>

							<div v-if="activeTab === 'curriculum'">
								<div
									v-for="(module, mIdx) in curriculum"
									:key="module.id"
									class="card border border-primary mb-5 shadow-sm"
								>
									<div
										class="card-header bg-light py-2 d-flex justify-content-between align-items-center border-bottom border-primary"
									>
										<div class="d-flex align-items-center flex-grow-1">
											<span class="badge bg-primary me-3"
												>Chương {{ mIdx + 1 }}</span
											>
											<input
												v-model="module.title"
												type="text"
												class="form-control fw-bold border-0 bg-transparent px-0 text-primary"
												placeholder="Tên chương..."
											/>
										</div>
										<button
											type="button"
											class="btn btn-danger btn-xs ms-3"
											@click="removeModule(mIdx)"
										>
											<i class="fas fa-trash"></i>
										</button>
									</div>

									<div class="card-body bg-white py-4">
										<div
											v-for="(lesson, lIdx) in module.lessons"
											:key="lesson.id"
											class="border rounded p-4 mb-4 bg-white position-relative shadow-sm border-dark"
										>
											<button
												type="button"
												class="btn btn-outline-danger btn-xs position-absolute"
												style="top: 15px; right: 15px"
												@click="removeLesson(mIdx, lIdx)"
											>
												<i class="fas fa-times"></i>
											</button>

											<div class="row mb-4 border-bottom pb-3">
												<div class="col-md-9">
													<label
														class="form-label fs-14 fw-bold text-dark text-uppercase"
														>Tên Bài Học
														<span class="text-danger">*</span></label
													>
													<input
														v-model="lesson.title"
														type="text"
														class="form-control"
														placeholder="Nhập tên bài học (Nhập xong để hiện nút Gợi ý bằng AI)..."
														required
													/>
												</div>
												<div class="col-md-3 d-flex align-items-center mt-4">
													<div class="form-check form-switch">
														<input
															v-model="lesson.isFreePreview"
															class="form-check-input"
															type="checkbox"
															:id="'free_' + lesson.id"
														/>
														<label
															class="form-check-label fw-bold text-success fs-13"
															:for="'free_' + lesson.id"
															>Học thử</label
														>
													</div>
												</div>
											</div>

											<div class="mb-4">
												<div class="d-flex align-items-center mb-3">
													<h6 class="text-primary fw-bold mb-0 me-4">
														Định dạng bài học:
													</h6>
													<div class="form-check form-check-inline">
														<input
															class="form-check-input"
															type="radio"
															value="Video"
															v-model="lesson.type"
															:id="'v_' + lesson.id"
														/>
														<label
															class="form-check-label"
															:for="'v_' + lesson.id"
															>Video</label
														>
													</div>
													<div class="form-check form-check-inline">
														<input
															class="form-check-input"
															type="radio"
															value="Text"
															v-model="lesson.type"
															:id="'t_' + lesson.id"
														/>
														<label
															class="form-check-label"
															:for="'t_' + lesson.id"
															>Bài đọc</label
														>
													</div>
													<div class="form-check form-check-inline">
														<input
															class="form-check-input"
															type="radio"
															value="RolePlay"
															v-model="lesson.type"
															:id="'rp_' + lesson.id"
														/>
														<label
															class="form-check-label text-info fw-bold"
															:for="'rp_' + lesson.id"
															><i class="fas fa-robot me-1"></i>Role Play</label
														>
													</div>
												</div>

												<div
													v-if="lesson.type === 'Video'"
													class="bg-light p-3 rounded"
												>
													<div class="d-flex mb-2 gap-3">
														<div class="form-check">
															<input
																class="form-check-input"
																type="radio"
																value="url"
																v-model="lesson.videoType"
																:id="'vu_' + lesson.id"
															/><label
																class="form-check-label fs-12"
																:for="'vu_' + lesson.id"
																>Link Youtube/Vimeo</label
															>
														</div>
														<div class="form-check">
															<input
																class="form-check-input"
																type="radio"
																value="upload"
																v-model="lesson.videoType"
																:id="'vp_' + lesson.id"
															/><label
																class="form-check-label fs-12"
																:for="'vp_' + lesson.id"
																>Tải tệp lên</label
															>
														</div>
													</div>
													<input
														v-if="lesson.videoType === 'url'"
														v-model="lesson.videoUrl"
														type="url"
														class="form-control form-control-sm"
														placeholder="https://youtube.com/watch?v=..."
													/>
													<div v-else>
														<input
															type="file"
															accept="video/*"
															class="form-control form-control-sm"
															@change="onVideoUpload($event, mIdx, lIdx)"
														/>
														<small
															v-if="lesson.videoUrl && !lesson.videoFile"
															class="text-success mt-1 d-block"
															><i class="fas fa-check"></i> Đã có video trên hệ
															thống.</small
														>
													</div>

													<div
														class="row gx-2 align-items-center bg-white p-2 border rounded mx-0 mt-2"
													>
														<div class="col-auto">
															<label
																class="form-label mb-0 fw-bold fs-12 text-primary"
																>Thời lượng video:</label
															>
														</div>
														<div class="col-auto d-flex align-items-center">
															<input
																type="number"
																class="form-control form-control-sm border-primary text-center"
																style="width: 60px"
																placeholder="Phút"
																:value="Math.floor(lesson.durationSeconds / 60)"
																@input="
																	(e: Event) => {
																		const target = e.target as HTMLInputElement;
																		const m = parseInt(target.value) || 0;
																		const s = lesson.durationSeconds % 60;
																		lesson.durationSeconds = m * 60 + s;
																	}
																"
															/>
															<span class="mx-1 fs-12 fw-bold text-muted"
																>phút</span
															>
														</div>
														<div class="col-auto d-flex align-items-center">
															<input
																type="number"
																class="form-control form-control-sm border-primary text-center"
																style="width: 60px"
																placeholder="Giây"
																max="59"
																:value="lesson.durationSeconds % 60"
																@input="
																	(e: Event) => {
																		const target = e.target as HTMLInputElement;
																		let s = parseInt(target.value) || 0;
																		if (s > 59) s = 59;
																		const m = Math.floor(
																			lesson.durationSeconds / 60,
																		);
																		lesson.durationSeconds = m * 60 + s;
																	}
																"
															/>
															<span class="mx-1 fs-12 fw-bold text-muted"
																>giây</span
															>
														</div>
														<div class="col-auto">
															<button
																type="button"
																class="btn btn-warning btn-xs fw-bold ms-2"
																@click="syncAllDurations"
																title="Quét lại toàn bộ video để sửa lỗi số phút"
															>
																<i class="fas fa-sync-alt me-1"></i>Sửa lỗi số
																phút
															</button>
														</div>
														<div class="col ps-2">
															<small
																class="text-muted fs-11"
																v-if="lesson.videoType === 'upload'"
																>* Sẽ tự động cập nhật sau khi xử lý xong video.
																Bạn có thể nhập thủ công nếu muốn.</small
															>
															<small class="text-muted fs-11" v-else
																>* Vui lòng nhập thời lượng cho video từ
																Link.</small
															>
														</div>
													</div>
												</div>

												<div
													v-else-if="lesson.type === 'RolePlay'"
													class="bg-info-light p-3 rounded border border-info"
												>
													<div class="role-play-config">
														<div class="mb-3 d-none">
															<label
																class="form-label fw-bold small text-info text-uppercase"
															>
																<i class="fas fa-brain me-1"></i>Tình huống
																(Scenario) dựa trên bài học
															</label>
														</div>

														<div class="row g-2 mb-3">
															<div class="col-md-9">
																<div
																	class="d-flex justify-content-between align-items-center mb-2"
																>
																	<label
																		class="form-label fw-bold small text-info text-uppercase mb-0"
																		>Tình huống chi tiết</label
																	>
																	<button
																		v-if="
																			getEligibleSupportLessons(mIdx, lIdx)
																				.length > 0
																		"
																		type="button"
																		class="btn btn-xs btn-info fw-bold text-white px-3"
																		:disabled="isGeneratingScenario[lesson.id]"
																		@click="generateAiScenario(mIdx, lIdx)"
																	>
																		<i
																			class="fas"
																			:class="
																				isGeneratingScenario[lesson.id]
																					? 'fa-spinner fa-spin'
																					: 'fa-magic'
																			"
																		></i>
																		{{
																			isGeneratingScenario[lesson.id]
																				? "Đang tạo..."
																				: "Gợi ý tình huống bằng AI"
																		}}
																	</button>
																</div>
																<textarea
																	v-model="lesson.rolePlayConfig.Scenario"
																	class="form-control form-control-sm"
																	rows="4"
																	placeholder="Mô tả tình huống cụ thể tại đây hoặc nhấn nút để AI gợi ý..."
																></textarea>
															</div>
															<div class="col-md-3">
																<label
																	class="form-label fw-bold small text-info text-uppercase"
																	>Điểm đạt (≥)</label
																>
																<input
																	v-model.number="
																		lesson.rolePlayConfig.PassScore
																	"
																	type="number"
																	class="form-control form-control-sm"
																	min="0"
																	max="100"
																/>
															</div>
														</div>

														<div class="row g-2">
															<div class="col-md-6 text-wrapper">
																<label
																	class="form-label fw-bold small text-info text-uppercase"
																	>Tiêu chí chấm điểm</label
																>
																<textarea
																	v-model="
																		lesson.rolePlayConfig.ScoringCriteria
																	"
																	class="form-control form-control-sm"
																	rows="4"
																	placeholder="Ví dụ: &#10;- Kỹ năng chào hỏi (2đ) &#10;- Khả năng xử lý từ chối (4đ) &#10;- Thuyết phục khách hàng (4đ)"
																></textarea>
															</div>
															<div class="col-md-6">
																<label
																	class="form-label fw-bold small text-info text-uppercase"
																	>Yêu cầu bổ sung</label
																>
																<textarea
																	v-model="
																		lesson.rolePlayConfig.AdditionalRequirements
																	"
																	class="form-control form-control-sm"
																	rows="4"
																	placeholder="Ví dụ: AI hãy tỏ ra khó tính và hay bắt bẻ người học..."
																></textarea>
															</div>
														</div>
													</div>
												</div>

												<div v-else class="bg-light p-3 rounded">
													<div
														class="d-flex justify-content-between align-items-center mb-2"
													>
														<label
															class="form-label mb-0 fw-bold fs-13 text-dark"
															>Nội dung bài học</label
														>
														<button
															v-if="lesson.title"
															type="button"
															class="btn btn-xs btn-outline-primary fw-bold"
															:disabled="isSuggestingContent[lesson.id]"
															@click="suggestAIContent(mIdx, lIdx)"
														>
															<i
																v-if="isSuggestingContent[lesson.id]"
																class="fas fa-spinner fa-spin me-1"
															></i>
															<i v-else class="fas fa-magic me-1"></i>
															Gợi ý bằng AI
														</button>
													</div>
													<textarea
														v-model="lesson.content"
														class="form-control mb-2"
														rows="6"
														placeholder="Nhập nội dung bài đọc bằng định dạng Markdown..."
													></textarea>
													<div v-if="lesson.content" class="mt-3">
														<label class="fs-12 fw-bold text-muted mb-2"
															><i class="fas fa-eye me-1"></i> Xem trước nội
															dung</label
														>
														<div
															class="markdown-preview p-3 border rounded bg-white markdown-body"
															v-html="renderMarkdown(lesson.content)"
														></div>
													</div>
												</div>
											</div>

											<div class="mb-4 border-top pt-3">
												<div
													class="d-flex justify-content-between align-items-center mb-2"
												>
													<h6 class="text-info fw-bold mb-0">
														<i class="fas fa-paperclip me-2"></i>Tài nguyên đính
														kèm
													</h6>
													<button
														type="button"
														class="btn btn-xs btn-info"
														@click="addAttachment(mIdx, lIdx)"
													>
														+ Thêm file
													</button>
												</div>
												<div
													v-for="(att, aIdx) in lesson.attachments"
													:key="att.id"
													class="d-flex align-items-center mb-2"
												>
													<input
														v-model="att.fileName"
														type="text"
														class="form-control form-control-sm me-2 w-50"
														placeholder="Tên hiển thị"
													/>
													<div class="flex-grow-1">
														<input
															type="file"
															class="form-control form-control-sm"
															@change="
																onAttachmentUpload($event, mIdx, lIdx, aIdx)
															"
														/>
														<small
															v-if="att.id > 0 && !att.file"
															class="text-success fs-11"
															>File đã lưu.</small
														>
													</div>
													<button
														type="button"
														class="btn btn-danger btn-xs ms-2"
														@click="removeAttachment(mIdx, lIdx, aIdx)"
													>
														<i class="fas fa-trash"></i>
													</button>
												</div>
											</div>

											<div class="mt-4 pt-3 border-top border-warning">
												<div
													class="d-flex justify-content-between align-items-center mb-3"
												>
													<h6 class="text-warning-dark fw-bold mb-0">
														<i class="fas fa-tasks me-2"></i>Bài tập củng cố
														(Mini-Quiz)
													</h6>
													<div class="form-check form-switch">
														<input
															v-model="lesson.hasQuiz"
															class="form-check-input"
															type="checkbox"
															:id="'has_q_' + lesson.id"
														/>
														<label
															class="form-check-label fs-13"
															:for="'has_q_' + lesson.id"
															>Kích hoạt Quiz</label
														>
													</div>
												</div>

												<div
													v-if="lesson.hasQuiz"
													class="bg-warning-light p-3 rounded border border-warning"
												>
													<div class="row g-2 mb-3">
														<div class="col-9">
															<input
																v-model="lesson.quiz.Title"
																type="text"
																class="form-control form-control-sm border-warning"
																placeholder="Tên bài kiểm tra ngắn"
															/>
														</div>
														<div class="col-3">
															<input
																v-model="lesson.quiz.PassScore"
																type="number"
																class="form-control form-control-sm border-warning text-center"
																placeholder="Điểm đậu"
															/>
														</div>
													</div>

													<div class="row g-2 mb-3">
														<div class="col-6">
															<input
																v-model="lesson.quiz.RetakeWaitTimeMinutes"
																type="number"
																class="form-control form-control-sm border-warning"
																placeholder="Chờ làm lại (Phút)"
															/>
														</div>
														<div class="col-6">
															<input
																v-model="lesson.quiz.MaxRetakesPerDay"
																type="number"
																class="form-control form-control-sm border-warning"
																placeholder="Số lần / ngày"
															/>
														</div>
													</div>

													<div
														v-for="(q, qIdx) in lesson.quiz.questions"
														:key="q.id"
														class="card shadow-none border-warning mb-2"
													>
														<div
															class="card-header bg-white py-1 px-2 d-flex justify-content-between border-bottom border-warning"
														>
															<span class="fs-12 fw-bold"
																>Câu hỏi {{ qIdx + 1 }}</span
															>
															<button
																type="button"
																class="btn btn-link text-danger p-0"
																@click="
																	removeQuestionFromLessonQuiz(mIdx, lIdx, qIdx)
																"
															>
																<i class="fas fa-times"></i>
															</button>
														</div>
														<div class="card-body p-2">
															<textarea
																v-model="q.QuestionText"
																class="form-control form-control-sm mb-2"
																rows="2"
																placeholder="Nội dung câu hỏi..."
															></textarea>
															<div class="row g-2">
																<div
																	v-for="letter in letters"
																	:key="letter"
																	class="col-6"
																>
																	<div class="input-group input-group-sm">
																		<span
																			class="input-group-text bg-white"
																			:class="{
																				'border-success':
																					q.CorrectAnswer === letter,
																			}"
																		>
																			<input
																				type="radio"
																				:name="'mq_' + lesson.id + '_' + q.id"
																				:value="letter"
																				v-model="q.CorrectAnswer"
																			/>
																		</span>
																		<input
																			v-model="q.Options[letter]"
																			type="text"
																			class="form-control"
																			:placeholder="'Đáp án ' + letter"
																		/>
																	</div>
																</div>
															</div>
															<textarea
																v-model="q.Explanation"
																class="form-control form-control-sm mt-2 border-info"
																rows="1"
																placeholder="Giải thích đáp án (nếu có)..."
															></textarea>
														</div>
													</div>
													<div class="d-flex gap-2 mt-2">
														<button
															type="button"
															class="btn btn-xs btn-outline-warning w-50 fw-bold"
															@click="addQuestionToLessonQuiz(mIdx, lIdx)"
														>
															+ Thêm thủ công
														</button>
														<button
															type="button"
															class="btn btn-xs btn-warning w-50 fw-bold shadow-sm"
															@click="openImportModal('lesson', mIdx, lIdx)"
														>
															<i class="fas fa-file-import me-1"></i> Import
														</button>
													</div>
													<div class="mt-2">
														<button
															type="button"
															class="btn btn-xs btn-info w-100 fw-bold shadow-sm"
															@click="generateLessonQuizAI(mIdx, lIdx)"
															:disabled="
																isGeneratingQuiz[`lesson_${lesson.id}`]
															"
														>
															<span
																v-if="isGeneratingQuiz[`lesson_${lesson.id}`]"
															>
																<i class="fas fa-spinner fa-spin me-1"></i> Đang
																tạo...
															</span>
															<span v-else>
																<i class="fas fa-robot me-1"></i> Tạo câu hỏi
																bằng AI
															</span>
														</button>
													</div>
												</div>
											</div>
										</div>
										<button
											type="button"
											class="btn btn-primary btn-sm w-100 fw-bold"
											@click="addLesson(mIdx)"
										>
											+ THÊM BÀI HỌC MỚI
										</button>
									</div>
								</div>

								<div class="text-center mt-4">
									<button type="button" class="btn btn-dark" @click="addModule">
										<i class="fas fa-folder-plus me-2"></i>Thêm Chương Mới
									</button>
								</div>
								<div class="text-end mt-5 border-top pt-3">
									<button
										type="button"
										class="btn btn-light me-2 fw-bold"
										@click="activeTab = 'basic'"
									>
										Quay lại: Thông tin chung
									</button>
									<button
										type="button"
										class="btn btn-success px-4 fw-bold shadow-sm text-white"
										@click="activeTab = 'quiz'"
									>
										Tiếp theo: Cấu hình Thi
										<i class="fas fa-arrow-right ms-2"></i>
									</button>
								</div>
							</div>

							<div v-show="activeTab === 'quiz'">
								<div
									class="alert alert-success mb-4 d-flex align-items-center border-0 shadow-sm"
								>
									<i class="fas fa-trophy fs-1 me-3 text-success"></i>
									<div>
										<h6 class="fw-bold mb-1 text-success">
											Cấu hình Đề thi Cuối Khóa (Final)
										</h6>
										<p class="fs-12 mb-0 text-dark">
											Dùng để đánh giá tổng quát và cấp chứng chỉ cho học viên.
										</p>
									</div>
								</div>

								<div class="card border-success shadow-sm mb-4">
									<div
										class="card-header bg-success-light py-2 border-bottom border-success"
									>
										<h6 class="text-success fw-bold mb-0">
											1. Thông số bài thi
										</h6>
									</div>
									<div class="card-body p-3">
										<div class="row g-3">
											<div class="col-md-6">
												<label class="fs-12 fw-bold text-dark mb-1"
													>Tên đề thi</label
												><input
													v-model="courseQuiz.Title"
													type="text"
													class="form-control form-control-sm"
												/>
											</div>
											<div class="col-md-2">
												<label class="fs-12 fw-bold text-success mb-1"
													>Điểm đạt</label
												><input
													v-model="courseQuiz.PassScore"
													type="number"
													class="form-control form-control-sm"
												/>
											</div>
											<div class="col-md-2">
												<label class="fs-12 fw-bold text-info mb-1"
													>Số câu bốc thi</label
												><input
													v-model="courseQuiz.QuestionCount"
													type="number"
													class="form-control form-control-sm"
												/>
											</div>
											<div class="col-md-2">
												<label class="fs-12 fw-bold text-danger mb-1"
													>T.Gian (Phút)</label
												><input
													v-model="courseQuiz.TimeLimitMinutes"
													type="number"
													class="form-control form-control-sm"
												/>
											</div>
										</div>

										<div class="row g-3 mt-3 border-top pt-3">
											<div class="col-md-6">
												<label class="fs-12 fw-bold text-dark mb-1"
													><i class="fas fa-clock me-1 text-warning"></i> Thời
													gian chờ làm lại (Phút)</label
												>
												<input
													v-model="course.QuizRetakeWaitTimeMinutes"
													type="number"
													class="form-control form-control-sm border-warning"
													placeholder="Ví dụ: 5"
												/>
												<small class="text-muted fs-11"
													>Người học phải chờ N phút nếu làm sai bài
													tập/thi.</small
												>
											</div>
											<div class="col-md-6">
												<label class="fs-12 fw-bold text-dark mb-1"
													><i class="fas fa-redo me-1 text-danger"></i> Số lần
													làm lại tối đa / ngày</label
												>
												<input
													v-model="course.QuizMaxRetakesPerDay"
													type="number"
													class="form-control form-control-sm border-danger"
													placeholder="Ví dụ: 3"
												/>
												<small class="text-muted fs-11"
													>Học viên chỉ được thực hiện tối đa N lần thi mỗi
													ngày.</small
												>
											</div>
										</div>
									</div>
								</div>

								<div
									class="d-flex justify-content-between align-items-center mb-3"
								>
									<h5 class="text-success fw-bold m-0">
										<i class="fas fa-database me-2"></i>Ngân hàng câu hỏi
									</h5>
									<span class="badge bg-success"
										>Tổng cộng: {{ courseQuiz.questions.length }} câu</span
									>
								</div>

								<div
									v-for="(q, qIndex) in courseQuiz.questions"
									:key="q.id"
									class="card border border-success mb-3 shadow-none"
								>
									<div
										class="card-header bg-success-light py-1 px-3 d-flex justify-content-between align-items-center"
									>
										<span class="fw-bold text-success"
											>Câu {{ qIndex + 1 }}</span
										>
										<button
											type="button"
											class="btn btn-danger btn-xs"
											@click="removeQuestionFinal(qIndex)"
										>
											<i class="fas fa-trash"></i>
										</button>
									</div>
									<div class="card-body p-3">
										<textarea
											v-model="q.QuestionText"
											class="form-control mb-3"
											rows="2"
											placeholder="Nội dung câu hỏi thi..."
										></textarea>
										<div class="row g-3">
											<div
												v-for="letter in letters"
												:key="letter"
												class="col-md-6"
											>
												<div class="input-group input-group-sm">
													<span
														class="input-group-text bg-white"
														:class="{
															'border-success': q.CorrectAnswer === letter,
														}"
													>
														<input
															type="radio"
															:name="`fq_${q.id}`"
															:value="letter"
															v-model="q.CorrectAnswer"
														/>
														<span
															class="ms-2 fw-bold"
															:class="{
																'text-success': q.CorrectAnswer === letter,
															}"
															>{{ letter }}</span
														>
													</span>
													<input
														v-model="q.Options[letter]"
														type="text"
														class="form-control"
														:class="{
															'border-success bg-success-light fw-bold':
																q.CorrectAnswer === letter,
														}"
													/>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="row g-3 mt-4">
									<div class="col-md-6">
										<div
											class="text-center border-dashed p-3 rounded bg-light"
											style="cursor: pointer"
											@click="addQuestionFinal"
										>
											<span class="text-success fw-bold"
												><i class="fas fa-plus-circle me-2 fs-5"></i>THÊM THỦ
												CÔNG</span
											>
										</div>
									</div>
									<div class="col-md-6">
										<div
											class="text-center border-dashed p-3 rounded bg-success-light border-success"
											style="cursor: pointer"
											@click="openImportModal('final')"
										>
											<span class="text-success fw-bold"
												><i class="fas fa-file-import me-2 fs-5"></i>IMPORT
												EXCEL / WORD</span
											>
										</div>
									</div>
									<div class="col-md-12 mt-3 text-center">
										<button
											type="button"
											class="btn btn-outline-info w-100 py-3 fw-bold border-dashed"
											style="border-width: 2px"
											@click="generateCourseQuizAI"
											:disabled="isGeneratingQuiz['course_final']"
										>
											<span v-if="isGeneratingQuiz['course_final']">
												<i class="fas fa-spinner fa-spin me-2 fs-5"></i> AI ĐANG
												PHÂN TÍCH VÀ TẠO CÂU HỎI...
											</span>
											<span v-else>
												<i class="fas fa-robot me-2 fs-5"></i> TẠO ĐỀ THI TỔNG
												HỢP BẰNG AI
											</span>
										</button>
									</div>
								</div>

								<div class="text-end mt-5 border-top pt-4">
									<button
										type="button"
										class="btn btn-light me-2 px-4"
										@click="activeTab = 'curriculum'"
									>
										Quay lại
									</button>
									<button
										type="submit"
										class="btn btn-success btn-lg px-5 shadow"
										:disabled="isSaving"
									>
										<span v-if="isSaving"
											><i class="fas fa-spinner fa-spin me-2"></i>ĐANG LƯU HỆ
											THỐNG...</span
										>
										<span v-else
											><i class="fas fa-save me-2"></i>CẬP NHẬT TOÀN BỘ KHÓA
											HỌC</span
										>
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
		<ImportQuizModal
			:show="showImportModal"
			@close="showImportModal = false"
			@imported="handleImportQuestions"
		/>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import {
	BookOpen,
	Type,
	FolderCheck,
	AlignLeft,
	Image,
	Info,
	Calendar,
	Clock,
	Globe,
	Users,
} from "lucide-vue-next";

import {
	courseAPI,
	moduleAPI,
	lessonAPI,
	quizAPI,
	userGroupAPI,
	aiAPI,
} from "@/services/api";
import ImportQuizModal from "@/components/ImportQuizModal.vue";
import { toast } from "vue3-toastify";
import { marked } from "marked";
import DOMPurify from "dompurify";
import Swal from "sweetalert2";

const router = useRouter();
const route = useRoute();
const courseId = route.params.id;

const activeTab = ref("basic");
const isSaving = ref(false);
const isLoadingData = ref(true);
const isSuggestingContent = ref<Record<number, boolean>>({});
const isGeneratingScenario = ref<Record<number, boolean>>({});
const isGeneratingQuiz = ref<Record<string, boolean>>({});

const renderMarkdown = (text: string) => {
	if (!text) return "";
	return DOMPurify.sanitize(marked.parse(text) as string);
};

const getObjectURL = (file: File | null) => {
	return file ? URL.createObjectURL(file) : "";
};

const generateLessonQuizAI = async (mIdx: number, lIdx: number) => {
	const lesson = curriculum.value[mIdx].lessons[lIdx];

	if (!lesson.id || lesson.id <= 0) {
		toast.warning(
			"Vui lòng lưu khóa học trước khi sử dụng tính năng tạo câu hỏi bằng AI cho bài học này.",
		);
		return;
	}

	const { value: formValues } = await Swal.fire({
		title: "AI Quiz Generator",
		html: `
      <div class="text-start">
        <p class="small text-muted mb-2">Hệ thống sẽ tự động phân tích Bản gỡ băng hoặc nội dung bài học để tạo câu hỏi.</p>
        <label class="form-label fw-bold small mb-1">Số lượng câu hỏi muốn tạo</label>
        <input id="swal-count" type="number" class="form-control mb-3" value="5" min="1" max="20">
        <label class="form-label fw-bold small mb-1">Yêu cầu cụ thể (Prompt)</label>
        <textarea id="swal-prompt" class="form-control" rows="3" placeholder="Ví dụ: Tập trung vào các khái niệm chính, độ khó nâng cao..."></textarea>
      </div>
    `,
		focusConfirm: false,
		showCancelButton: true,
		confirmButtonText: "Bắt đầu tạo câu hỏi",
		cancelButtonText: "Hủy",
		confirmButtonColor: "#3085d6",
		preConfirm: () => {
			return {
				count: (document.getElementById("swal-count") as HTMLInputElement)
					.value,
				prompt: (document.getElementById("swal-prompt") as HTMLInputElement)
					.value,
			};
		},
	});

	if (formValues) {
		const loadingId = `lesson_${lesson.id}`;
		isGeneratingQuiz.value[loadingId] = true;
		try {
			const res = await aiAPI.generateLessonQuiz({
				lessonId: lesson.id,
				count: parseInt(formValues.count),
				context: formValues.prompt,
			});

			const questions = JSON.parse(res.data.questionsJson);
			if (!Array.isArray(questions))
				throw new Error("Dữ liệu AI trả về không hợp lệ.");

			questions.forEach((q: any) => {
				lesson.quiz.questions.push({
					id: generateId(),
					QuestionText: q.questionText,
					Options: {
						A: q.optionA,
						B: q.optionB,
						C: q.optionC,
						D: q.optionD,
					},
					CorrectAnswer: q.correctAnswer,
					Points: 1.0,
					Explanation: q.explanation || "",
				});
			});

			lesson.hasQuiz = true;
			toast.success(`Đã tạo thành công ${questions.length} câu hỏi AI!`);
		} catch (error: any) {
			toast.error(
				"Không thể tạo câu hỏi: " +
					(error.response?.data?.message || "Lỗi định dạng AI"),
			);
		} finally {
			isGeneratingQuiz.value[loadingId] = false;
		}
	}
};

const generateCourseQuizAI = async () => {
	const allLessons = [];
	for (const m of curriculum.value) {
		for (const l of m.lessons) {
			if (l.id > 0) {
				allLessons.push({
					id: l.id,
					title: l.title,
					count: 2,
				});
			}
		}
	}

	if (allLessons.length === 0) {
		toast.warning("Khóa học chưa có đủ bài giảng đã lưu để tổng hợp đề thi.");
		return;
	}

	const htmlList = allLessons
		.map(
			(l, index) => `
      <div class="d-flex align-items-center mb-2 border-bottom pb-2">
        <div class="flex-grow-1 small text-truncate pe-2" title="${l.title}">${l.title}</div>
        <div style="width: 80px">
          <input type="number" id="lesson-count-${index}" class="form-control form-control-sm" value="2" min="0" max="10">
        </div>
      </div>
    `,
		)
		.join("");

	const { value: result } = await Swal.fire({
		title: "Tạo đề thi tổng hợp",
		width: "600px",
		html: `
      <div class="text-start">
        <label class="form-label fw-bold small mb-2">Số lượng câu hỏi cho từng bài:</label>
        <div style="max-height: 300px; overflow-y: auto;" class="mb-3 px-1">
          ${htmlList}
        </div>
        <label class="form-label fw-bold small mb-1">Lưu ý chung cho đề thi (Prompt)</label>
        <textarea id="swal-global-prompt" class="form-control" rows="2" placeholder="Ví dụ: Đề thi bao quát toàn bộ kiến thức, phong cách chuyên nghiệp..."></textarea>
      </div>
    `,
		showCancelButton: true,
		confirmButtonText: "Tạo đề thi ngay",
		cancelButtonText: "Hủy",
		confirmButtonColor: "#3085d6",
		preConfirm: () => {
			const lessons = allLessons.map((l, index) => ({
				lessonId: l.id,
				count: parseInt(
					(document.getElementById(`lesson-count-${index}`) as HTMLInputElement)
						.value,
				),
			}));
			return {
				lessons: lessons.filter((l) => l.count > 0),
				globalPrompt: (
					document.getElementById("swal-global-prompt") as HTMLTextAreaElement
				).value,
			};
		},
	});

	if (result && result.lessons.length > 0) {
		isGeneratingQuiz.value["course_final"] = true;
		try {
			const res = await aiAPI.generateCourseQuiz({
				lessons: result.lessons,
				globalContext: result.globalPrompt,
			});

			const questions = JSON.parse(res.data.questionsJson);
			if (!Array.isArray(questions))
				throw new Error("Dữ liệu AI trả về không hợp lệ.");

			questions.forEach((q: any) => {
				courseQuiz.value.questions.push({
					id: generateId(),
					QuestionText: q.questionText,
					Options: {
						A: q.optionA,
						B: q.optionB,
						C: q.optionC,
						D: q.optionD,
					},
					CorrectAnswer: q.correctAnswer,
					Points: 1.0,
					Explanation: q.explanation || "",
				});
			});

			toast.success(`Đã tổng hợp thành công ${questions.length} câu hỏi mới!`);
		} catch (error: any) {
			toast.error(
				"Lỗi khi tổng hợp đề thi: " +
					(error.response?.data?.message || "Lỗi định dạng AI"),
			);
		} finally {
			isGeneratingQuiz.value["course_final"] = false;
		}
	}
};

type OptionKey = "A" | "B" | "C" | "D";
const letters: OptionKey[] = ["A", "B", "C", "D"];
const generateId = () => Math.floor(Math.random() * -1000000);

const categories = [
	{ id: 1, name: "Kỹ năng mềm" },
	{ id: 2, name: "Kỹ thuật" },
	{ id: 3, name: "Quy trình" },
	{ id: 4, name: "Lãnh đạo" },
	{ id: 5, name: "Số hóa" },
];

const course = ref({
	Title: "",
	Description: "",
	CategoryId: null as number | null,
	Level: 3,
	CoverImage: null as File | null,
	ExistingCoverUrl: "",
	IsPublished: false,
	PassScore: 8,
	EnrollStartDate: null as Date | null,
	EnrollEndDate: null as Date | null,
	CompletionDeadlineDays: null as number | null,
	CompletionEndDate: null as Date | null,
	QuizRetakeWaitTimeMinutes: 5,
	QuizMaxRetakesPerDay: 3,
	UserGroupId: null as number | null,
});

interface QuizQuestion {
	id: number;
	QuestionText: string;
	Options: Record<OptionKey, string>;
	CorrectAnswer: string;
	Points: number;
	Explanation: string;
}
interface QuizModel {
	Id?: number;
	Title: string;
	TimeLimitMinutes: number | null;
	PassScore: number;
	QuestionCount: number;
	ShuffleQuestions: boolean;
	ShuffleAnswers: boolean;
	RetakeWaitTimeMinutes: number | null;
	MaxRetakesPerDay: number | null;
	questions: QuizQuestion[];
}

const createEmptyQuiz = (title: string): QuizModel => ({
	Title: title,
	TimeLimitMinutes: null,
	PassScore: 5,
	QuestionCount: 10,
	ShuffleQuestions: true,
	ShuffleAnswers: true,
	RetakeWaitTimeMinutes: null,
	MaxRetakesPerDay: null,
	questions: [],
});

interface RolePlayConfig {
	SupportLessonIds: number[];
	ScoringCriteria: string;
	AdditionalRequirements: string;
	Scenario: string;
	PassScore: number;
}
interface Lesson {
	id: number;
	title: string;
	type: "Video" | "Text" | "RolePlay";
	content: string;
	videoType: "url" | "upload";
	videoUrl: string;
	videoFile: File | null;
	durationSeconds: number;
	isFreePreview: boolean;
	attachments: any[];
	hasQuiz: boolean;
	quiz: QuizModel;
	rolePlayConfig: RolePlayConfig;
	videoStatus?: string;
}
interface Module {
	id: number;
	title: string;
	lessons: Lesson[];
}

const curriculum = ref<Module[]>([]);
const courseQuiz = ref<QuizModel>(createEmptyQuiz("Bài thi cuối khóa"));
const deletedModuleIds = ref<number[]>([]);
const deletedLessonIds = ref<{ moduleId: number; id: number }[]>([]);
const deletedAttachmentIds = ref<number[]>([]);
const deletedQuestionIds = ref<number[]>([]);

onMounted(async () => {
	if (!courseId) return router.push("/admin/courses");

	isLoadingData.value = true;
	try {
		const res = await courseAPI.getById(courseId as string);
		const data = res.data;

		course.value.Title = data.title || "";
		course.value.Description = data.description || "";
		course.value.CategoryId = data.categoryId || null;
		course.value.IsPublished = data.isPublished || false;
		course.value.PassScore = data.passScore || 8;
		course.value.ExistingCoverUrl = data.coverImageUrl || "";
		course.value.EnrollStartDate = data.enrollStartDate
			? new Date(data.enrollStartDate)
			: null;
		course.value.EnrollEndDate = data.enrollEndDate
			? new Date(data.enrollEndDate)
			: null;
		course.value.CompletionDeadlineDays = data.completionDeadlineDays || null;
		course.value.Level = data.level || 3;
		course.value.CompletionEndDate = data.completionEndDate
			? new Date(data.completionEndDate)
			: null;
		course.value.QuizRetakeWaitTimeMinutes =
			data.quizRetakeWaitTimeMinutes || 5;
		course.value.QuizMaxRetakesPerDay = data.quizMaxRetakesPerDay || 3;
		course.value.UserGroupId = data.departmentId || null;

		if (data.modules) {
			const loadedModules = [];
			for (const m of data.modules) {
				const loadedLessons = [];
				for (const l of m.lessons || []) {
					const lessonQuiz = createEmptyQuiz("Bài tập củng cố");
					const hasQuiz = !!l.quizId;

					if (hasQuiz) {
						try {
							const qRes = await quizAPI.getById(l.quizId);
							const qData = qRes.data;
							lessonQuiz.Id = qData.id;
							lessonQuiz.Title = qData.title || "Bài tập củng cố";
							lessonQuiz.PassScore = qData.passScore || 5;
							lessonQuiz.TimeLimitMinutes = qData.timeLimitMinutes || null;
							lessonQuiz.questions = (qData.questions || []).map((q: any) => ({
								id: q.id,
								QuestionText: q.questionText,
								Options: {
									A: q.optionA,
									B: q.optionB,
									C: q.optionC,
									D: q.optionD,
								},
								CorrectAnswer: q.correctAnswer || "A",
								Points: q.points || 1.0,
								Explanation: q.explanation || "",
							}));
							lessonQuiz.RetakeWaitTimeMinutes =
								qData.retakeWaitTimeMinutes || null;
							lessonQuiz.MaxRetakesPerDay = qData.maxRetakesPerDay || null;
						} catch {}
					}

					loadedLessons.push({
						id: l.id,
						title: l.title,
						type: l.type || "Video",
						content: l.content || "",
						videoType: (l.videoUrl && l.videoUrl.startsWith("http")
							? "url"
							: "upload") as "url" | "upload",
						videoUrl: l.videoUrl || "",
						videoFile: null,
						durationSeconds:
							l.type === "Video"
								? l.videoDurationSeconds || 0
								: l.readingDurationSeconds || 0,
						isFreePreview: l.isFreePreview || false,
						aiSummary: l.aiSummary || "",
						attachments: (l.attachments || []).map((a: any) => ({
							id: a.id,
							fileName: a.fileName,
							file: null,
						})),
						hasQuiz: hasQuiz,
						quiz: lessonQuiz,
						rolePlayConfig: {
							SupportLessonIds: l.rolePlayConfig?.supportLessonIds || [],
							ScoringCriteria: l.rolePlayConfig?.scoringCriteria || "",
							AdditionalRequirements:
								l.rolePlayConfig?.additionalRequirements || "",
							Scenario: l.rolePlayConfig?.scenario || "",
							PassScore: l.rolePlayConfig?.passScore || 50,
						},
					});
				}
				loadedModules.push({
					id: m.id,
					title: m.title,
					lessons: loadedLessons,
				});
			}
			curriculum.value = loadedModules;
		}

		if (data.finalQuizId) {
			try {
				const resQuiz = await quizAPI.getById(data.finalQuizId);
				const qData = resQuiz.data;
				courseQuiz.value.Id = qData.id || qData.Id;
				courseQuiz.value.Title =
					qData.title || qData.Title || "Đề thi cuối khóa";
				courseQuiz.value.PassScore = qData.passScore ?? qData.PassScore ?? 8;
				courseQuiz.value.QuestionCount =
					qData.questionCount ?? qData.QuestionCount ?? 10;
				courseQuiz.value.TimeLimitMinutes =
					qData.timeLimitMinutes ?? qData.TimeLimitMinutes ?? null;
				courseQuiz.value.questions = (
					qData.questions ||
					qData.Questions ||
					[]
				).map((q: any) => ({
					id: q.id || q.Id,
					QuestionText: q.questionText || q.QuestionText,
					Options: {
						A: q.optionA || q.OptionA,
						B: q.optionB || q.OptionB,
						C: q.optionC || q.OptionC,
						D: q.optionD || q.OptionD,
					},
					CorrectAnswer: q.correctAnswer || q.CorrectAnswer || "A",
					Points: q.points ?? q.Points ?? 1.0,
					Explanation: q.explanation || q.Explanation || "",
				}));
				courseQuiz.value.RetakeWaitTimeMinutes =
					qData.retakeWaitTimeMinutes ?? qData.RetakeWaitTimeMinutes ?? null;
				courseQuiz.value.MaxRetakesPerDay =
					qData.maxRetakesPerDay ?? qData.MaxRetakesPerDay ?? null;
			} catch {}
		}
	} catch {
		toast.error("Không thể tải dữ liệu khóa học.");
	} finally {
		isLoadingData.value = false;
	}
});

const addModule = () =>
	curriculum.value.push({ id: generateId(), title: "Chương mới", lessons: [] });
const removeModule = (index: number) => {
	if (confirm("Xóa toàn bộ chương này?")) {
		const mod = curriculum.value[index];
		if (mod.id > 0) deletedModuleIds.value.push(mod.id);
		curriculum.value.splice(index, 1);
	}
};
const addLesson = (mIdx: number) => {
	curriculum.value[mIdx].lessons.push({
		id: generateId(),
		title: "",
		type: "Video",
		content: "",
		videoType: "url",
		videoUrl: "",
		videoFile: null,
		durationSeconds: 0,
		isFreePreview: false,
		attachments: [],
		hasQuiz: false,
		quiz: createEmptyQuiz("Bài tập"),
		rolePlayConfig: {
			SupportLessonIds: [],
			ScoringCriteria: "",
			AdditionalRequirements: "",
			Scenario: "",
			PassScore: 50,
		},
	});
};
const removeLesson = (mIdx: number, lIdx: number) => {
	const les = curriculum.value[mIdx].lessons[lIdx];
	if (les.id > 0) {
		deletedLessonIds.value.push({
			moduleId: curriculum.value[mIdx].id,
			id: les.id,
		});
	}
	curriculum.value[mIdx].lessons.splice(lIdx, 1);
};
const addAttachment = (mIdx: number, lIdx: number) => {
	curriculum.value[mIdx].lessons[lIdx].attachments.push({
		id: generateId(),
		fileName: "",
		file: null,
	});
};
const removeAttachment = (mIdx: number, lIdx: number, aIdx: number) => {
	const att = curriculum.value[mIdx].lessons[lIdx].attachments[aIdx];
	if (att.id > 0) deletedAttachmentIds.value.push(att.id);
	curriculum.value[mIdx].lessons[lIdx].attachments.splice(aIdx, 1);
};

const addQuestionToLessonQuiz = (mIdx: number, lIdx: number) => {
	curriculum.value[mIdx].lessons[lIdx].quiz.questions.push({
		id: generateId(),
		QuestionText: "",
		Options: { A: "", B: "", C: "", D: "" },
		CorrectAnswer: "A",
		Points: 1.0,
		Explanation: "",
	});
};
const removeQuestionFromLessonQuiz = (
	mIdx: number,
	lIdx: number,
	qIdx: number,
) => {
	if (confirm("Xóa câu hỏi này?")) {
		const q = curriculum.value[mIdx].lessons[lIdx].quiz.questions[qIdx];
		if (q.id > 0) deletedQuestionIds.value.push(q.id);
		curriculum.value[mIdx].lessons[lIdx].quiz.questions.splice(qIdx, 1);
	}
};

const addQuestionFinal = () => {
	courseQuiz.value.questions.push({
		id: generateId(),
		QuestionText: "",
		Options: { A: "", B: "", C: "", D: "" },
		CorrectAnswer: "A",
		Points: 1.0,
		Explanation: "",
	});
};
const removeQuestionFinal = (index: number) => {
	if (confirm("Xóa câu hỏi này?")) {
		const q = courseQuiz.value.questions[index];
		if (q.id > 0) deletedQuestionIds.value.push(q.id);
		courseQuiz.value.questions.splice(index, 1);
	}
};

const showImportModal = ref(false);
const importTargetType = ref<"lesson" | "final" | null>(null);
const importTargetIndexes = ref({ mIdx: -1, lIdx: -1 });

function openImportModal(type: "lesson" | "final", mIdx = -1, lIdx = -1) {
	importTargetType.value = type;
	importTargetIndexes.value = { mIdx, lIdx };
	showImportModal.value = true;
}

function handleImportQuestions(questions: any[]) {
	if (importTargetType.value === "lesson") {
		const { mIdx, lIdx } = importTargetIndexes.value;
		const lesson = curriculum.value[mIdx].lessons[lIdx];
		if (!lesson.quiz) {
			lesson.quiz = createEmptyQuiz("Bài Tập Củng Cố");
		}
		questions.forEach((q) => {
			lesson.quiz.questions.push({
				id: generateId(),
				QuestionText: q.QuestionText,
				Options: { ...q.Options },
				CorrectAnswer: q.CorrectAnswer,
				Points: q.Points || 1,
				Explanation: q.Explanation || "",
			});
		});
		toast.success(`Đã import ${questions.length} câu hỏi vào bài học.`);
	} else if (importTargetType.value === "final") {
		questions.forEach((q) => {
			courseQuiz.value.questions.push({
				id: generateId(),
				QuestionText: q.QuestionText,
				Options: { ...q.Options },
				CorrectAnswer: q.CorrectAnswer,
				Points: q.Points || 1,
				Explanation: q.Explanation || "",
			});
		});
		toast.success(`Đã import ${questions.length} câu hỏi vào đề thi.`);
	}
}

const syncAllDurations = async () => {
	try {
		const res = await lessonAPI.syncAllDurations();
		toast.success(res.data.message || "Đã bắt đầu xử lý đồng bộ thời lượng.");
	} catch (error: any) {
		toast.error(
			"Không thể yêu cầu đồng bộ: " +
				(error.response?.data?.message || "Lỗi hệ thống"),
		);
	}
};

const suggestAIContent = async (mIdx: number, lIdx: number) => {
	const lesson = curriculum.value[mIdx].lessons[lIdx];
	if (!lesson.title) {
		toast.warning("Vui lòng nhập tiêu đề bài học trước khi sử dụng AI!");
		return;
	}

	isSuggestingContent.value[lesson.id] = true;
	try {
		const res = await aiAPI.suggestContent({
			title: lesson.title,
			context: lesson.content
				? `Dựa trên nội dung đã có: ${lesson.content.substring(0, 200)}...`
				: "",
		});

		if (lesson.content) {
			if (
				confirm(
					"Nội dung hiện tại sẽ bị ghi đè bởi gợi ý từ AI. Bạn có chắc chắn?",
				)
			) {
				lesson.content = res.data.content;
			}
		} else {
			lesson.content = res.data.content;
		}
		toast.success("Đã tạo nội dung gợi ý!");
	} catch (error: any) {
		toast.error(
			"Lỗi khi gợi ý nội dung: " +
				(error.response?.data?.message || "Lỗi không xác định"),
		);
	} finally {
		isSuggestingContent.value[lesson.id] = false;
	}
};

const getEligibleSupportLessons = (mIdx: number, lIdx: number) => {
	const eligible: { id: number; title: string; moduleTitle: string }[] = [];
	curriculum.value.forEach((m, mi) => {
		if (mi > mIdx) return;
		m.lessons.forEach((l, li) => {
			if (mi === mIdx && li >= lIdx) return;
			// For editor, we must ensure the lesson has a real ID (> 0) to be used by AI RAG
			if (l.type !== "RolePlay" && l.title && l.id > 0) {
				eligible.push({
					id: l.id,
					title: l.title,
					moduleTitle: m.title,
				});
			}
		});
	});
	return eligible;
};

const generateAiScenario = async (mIdx: number, lIdx: number) => {
	const lesson = curriculum.value[mIdx].lessons[lIdx];
	const eligibleLessons = getEligibleSupportLessons(mIdx, lIdx);

	if (eligibleLessons.length === 0) {
		toast.warning("Không có bài giảng nào phù hợp để làm dữ liệu hỗ trợ.");
		return;
	}

	// Show selection modal
	const { value: selectedIds } = await Swal.fire({
		title: "Chọn bài giảng bổ trợ",
		html: `
      <div class="text-start" style="max-height: 300px; overflow-y: auto;">
        ${eligibleLessons
					.map(
						(l) => `
          <div class="form-check mb-2">
            <input class="form-check-input swal-lesson-checkbox" type="checkbox" value="${
							l.id
						}" id="swal_l_${l.id}" ${
							lesson.rolePlayConfig.SupportLessonIds?.includes(l.id)
								? "checked"
								: ""
						}>
            <label class="form-check-label small" for="swal_l_${l.id}">
              <strong>[${l.moduleTitle}]</strong> ${l.title}
            </label>
          </div>
        `,
					)
					.join("")}
      </div>
    `,
		showCancelButton: true,
		confirmButtonText: "Tiếp tục tạo bằng AI",
		cancelButtonText: "Hủy",
		confirmButtonColor: "#3085d6",
		preConfirm: () => {
			const checkboxes = document.querySelectorAll(
				".swal-lesson-checkbox:checked",
			) as NodeListOf<HTMLInputElement>;
			return Array.from(checkboxes).map((cb) => parseInt(cb.value));
		},
	});

	if (!selectedIds || selectedIds.length === 0) {
		if (selectedIds) toast.warning("Vui lòng chọn ít nhất một bài giảng.");
		return;
	}

	// Update the support IDs
	lesson.rolePlayConfig.SupportLessonIds = selectedIds;

	isGeneratingScenario.value[lesson.id] = true;
	try {
		const res = await aiAPI.generateScenario(
			lesson.rolePlayConfig.SupportLessonIds,
		);
		const data = res.data.scenario; // res.data.scenario ở đây là object RolePlaySuggestionResponse từ backend
		lesson.rolePlayConfig.Scenario = data.scenario;
		lesson.rolePlayConfig.ScoringCriteria = data.scoringCriteria;
		lesson.rolePlayConfig.AdditionalRequirements = data.additionalRequirements;

		toast.success("Đã tạo cấu hình thành công!");
	} catch (error) {
		toast.error("Không thể tạo tình huống tự động.");
	} finally {
		isGeneratingScenario.value[lesson.id] = false;
	}
};

const handleImageUpload = (e: Event) => {
	const files = (e.target as HTMLInputElement).files;
	if (files && files.length > 0) course.value.CoverImage = files[0];
};
const onVideoUpload = (e: Event, mIdx: number, lIdx: number) => {
	const files = (e.target as HTMLInputElement).files;
	if (files && files.length > 0)
		curriculum.value[mIdx].lessons[lIdx].videoFile = files[0];
};
const onAttachmentUpload = (
	e: Event,
	mIdx: number,
	lIdx: number,
	aIdx: number,
) => {
	const files = (e.target as HTMLInputElement).files;
	if (files && files.length > 0)
		curriculum.value[mIdx].lessons[lIdx].attachments[aIdx].file = files[0];
};

const submitCourse = async () => {
	if (!course.value.Title?.trim()) {
		toast.warning("Vui lòng nhập Tên khóa học ở Tab 1!");
		activeTab.value = "basic";
		return;
	}
	if (!course.value.CategoryId) {
		toast.warning("Vui lòng chọn Danh mục phân loại ở Tab 1!");
		activeTab.value = "basic";
		return;
	}

	if (courseQuiz.value.questions.length === 0) {
		toast.warning(
			"Khóa học bắt buộc phải có ít nhất một câu hỏi trong Bài thi cuối khóa!",
		);
		activeTab.value = "quiz";
		return;
	}

	isSaving.value = true;
	try {
		const coursePayload = {
			title: course.value.Title,
			description: course.value.Description,
			categoryId: course.value.CategoryId,
			level: course.value.Level,
			isPublished: course.value.IsPublished,
			passScore: Number(course.value.PassScore) || 8,
			enrollStartDate: course.value.EnrollStartDate?.toISOString() || null,
			enrollEndDate: course.value.EnrollEndDate?.toISOString() || null,
			completionDeadlineDays: course.value.CompletionDeadlineDays
				? Number(course.value.CompletionDeadlineDays)
				: null,
			completionEndDate: course.value.CompletionEndDate?.toISOString() || null,
			quizRetakeWaitTimeMinutes:
				Number(course.value.QuizRetakeWaitTimeMinutes) || 5,
			quizMaxRetakesPerDay: Number(course.value.QuizMaxRetakesPerDay) || 3,
			userGroupId: course.value.UserGroupId || null,
		};
		await courseAPI.update(courseId as string, coursePayload);

		for (const attId of deletedAttachmentIds.value) {
			await lessonAPI.deleteAttachment(0, attId);
		}
		for (const item of deletedLessonIds.value) {
			await lessonAPI.delete(item.moduleId, item.id);
		}
		for (const mId of deletedModuleIds.value) {
			await moduleAPI.delete(courseId as string, mId);
		}
		for (const qId of deletedQuestionIds.value) {
			await quizAPI.deleteQuestion(qId);
		}
		deletedAttachmentIds.value = [];
		deletedLessonIds.value = [];
		deletedModuleIds.value = [];
		deletedQuestionIds.value = [];

		if (course.value.CoverImage) {
			const formData = new FormData();
			formData.append("file", course.value.CoverImage);
			await courseAPI.uploadCover(courseId as string, formData);
		}

		const lessonIdMap = new Map();
		curriculum.value.forEach((m) =>
			m.lessons.forEach((l) => {
				if (l.id > 0) lessonIdMap.set(l.id, l.id);
			}),
		);

		for (let mIdx = 0; mIdx < curriculum.value.length; mIdx++) {
			const mod = curriculum.value[mIdx];
			let currentModuleId = mod.id;
			if (currentModuleId < 0) {
				const resMod = await moduleAPI.create(courseId as string, {
					title: mod.title,
					sortOrder: mIdx,
				});
				currentModuleId = resMod.data.id;
			} else {
				await moduleAPI.update(courseId as string, currentModuleId, {
					title: mod.title,
					sortOrder: mIdx,
				});
			}

			for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
				const les = mod.lessons[lIdx];
				const lessonPayload = {
					title: les.title,
					type: les.type,
					content: les.content,
					videoUrl: les.videoType === "url" ? les.videoUrl : null,
					isFreePreview: les.isFreePreview,
					sortOrder: lIdx,
					videoDurationSeconds:
						les.type === "Video" ? Number(les.durationSeconds) || 0 : 0,
					readingDurationSeconds:
						les.type === "Text" ? Number(les.durationSeconds) || 0 : 0,
					videoStatus: les.videoStatus || "Ready",
					rolePlayConfig:
						les.type === "RolePlay"
							? {
									scoringCriteria: les.rolePlayConfig.ScoringCriteria,
									additionalRequirements:
										les.rolePlayConfig.AdditionalRequirements,
									scenario: les.rolePlayConfig.Scenario,
									passScore: les.rolePlayConfig.PassScore,
									supportLessonIds: les.rolePlayConfig.SupportLessonIds.map(
										(id) => lessonIdMap.get(id),
									).filter((id) => id !== undefined && id > 0),
								}
							: null,
				};
				let currentLessonId = les.id;
				if (currentLessonId < 0) {
					const resLes = await lessonAPI.create(currentModuleId, lessonPayload);
					currentLessonId = resLes.data.id;
					lessonIdMap.set(les.id, currentLessonId);
				} else {
					await lessonAPI.update(
						currentModuleId,
						currentLessonId,
						lessonPayload,
					);
				}

				if (
					les.type === "Video" &&
					les.videoType === "upload" &&
					les.videoFile
				) {
					const vForm = new FormData();
					vForm.append("file", les.videoFile);
					await lessonAPI.uploadVideo(currentModuleId, currentLessonId, vForm);
				}
				for (const att of les.attachments) {
					if (att.id < 0 && att.file) {
						const aForm = new FormData();
						aForm.append("file", att.file);
						await lessonAPI.uploadAttachment(
							currentModuleId,
							currentLessonId,
							aForm,
						);
					}
				}

				if (les.hasQuiz) {
					let targetQuizId = les.quiz.Id;
					const qPayload = {
						title: les.quiz.Title || `Quiz: ${les.title}`,
						timeLimitMinutes: les.quiz.TimeLimitMinutes
							? Number(les.quiz.TimeLimitMinutes)
							: null,
						passScore: Number(les.quiz.PassScore) || 5,
						questionCount: Number(les.quiz.questions.length),
						shuffleQuestions: true,
						shuffleAnswers: true,
						retakeWaitTimeMinutes: les.quiz.RetakeWaitTimeMinutes
							? Number(les.quiz.RetakeWaitTimeMinutes)
							: null,
						maxRetakesPerDay: les.quiz.MaxRetakesPerDay
							? Number(les.quiz.MaxRetakesPerDay)
							: null,
					};

					if (!targetQuizId || targetQuizId < 0) {
						if (les.quiz.questions.length > 0) {
							const resQuiz = await quizAPI.createForLesson(
								currentModuleId,
								currentLessonId,
								qPayload,
							);
							targetQuizId = resQuiz.data.id;
							les.quiz.Id = targetQuizId;
						}
					} else {
						await quizAPI.update(targetQuizId, qPayload);
					}

					if (targetQuizId && targetQuizId > 0) {
						for (const q of les.quiz.questions) {
							const questionPayload = {
								content: q.QuestionText,
								optionA: q.Options.A || "",
								optionB: q.Options.B || "",
								optionC: q.Options.C || "",
								optionD: q.Options.D || "",
								CorrectAnswer: q.CorrectAnswer,
								points: Number(q.Points) || 1,
								explanation: q.Explanation || "",
							};

							if (q.id < 0) {
								await quizAPI.addQuestion(targetQuizId, questionPayload);
								q.id = generateId() * -1;
							} else {
								await quizAPI.updateQuestion(q.id, questionPayload);
							}
						}
					}
				}
			}
		}

		if (
			courseQuiz.value.Id ||
			courseQuiz.value.Title ||
			courseQuiz.value.questions.length > 0
		) {
			let finalId = courseQuiz.value.Id;
			const finalPayload = {
				title: courseQuiz.value.Title || "Đề thi cuối khóa",
				passScore:
					courseQuiz.value.PassScore != null &&
					(courseQuiz.value.PassScore as any) !== ""
						? Number(courseQuiz.value.PassScore)
						: 8,
				questionCount:
					courseQuiz.value.QuestionCount != null &&
					(courseQuiz.value.QuestionCount as any) !== ""
						? Number(courseQuiz.value.QuestionCount)
						: courseQuiz.value.questions.length,
				timeLimitMinutes:
					courseQuiz.value.TimeLimitMinutes != null &&
					(courseQuiz.value.TimeLimitMinutes as any) !== ""
						? Number(courseQuiz.value.TimeLimitMinutes)
						: null,
				shuffleQuestions: true,
				shuffleAnswers: true,
				retakeWaitTimeMinutes:
					courseQuiz.value.RetakeWaitTimeMinutes != null &&
					(courseQuiz.value.RetakeWaitTimeMinutes as any) !== ""
						? Number(courseQuiz.value.RetakeWaitTimeMinutes)
						: null,
				maxRetakesPerDay:
					courseQuiz.value.MaxRetakesPerDay != null &&
					(courseQuiz.value.MaxRetakesPerDay as any) !== ""
						? Number(courseQuiz.value.MaxRetakesPerDay)
						: null,
			};

			if (!finalId || finalId < 0) {
				const resFQuiz = await quizAPI.create(courseId as string, finalPayload);
				finalId = resFQuiz.data.id;
				courseQuiz.value.Id = finalId;
			} else {
				await quizAPI.update(finalId, finalPayload);
			}

			if (finalId && finalId > 0) {
				for (const q of courseQuiz.value.questions) {
					const fQuestionPayload = {
						content: q.QuestionText,
						optionA: q.Options.A,
						optionB: q.Options.B,
						optionC: q.Options.C,
						optionD: q.Options.D,
						CorrectAnswer: q.CorrectAnswer,
						Points: Number(q.Points) || 1,
						explanation: q.Explanation || "",
					};

					if (q.id < 0) {
						await quizAPI.addQuestion(finalId, fQuestionPayload);
						q.id = generateId() * -1;
					} else {
						await quizAPI.updateQuestion(q.id, fQuestionPayload);
					}
				}
			}
		}

		toast.success("Cập nhật khóa học thành công!");
		router.push("/admin/courses");
	} catch (error: any) {
		toast.error(
			"Lỗi: " + (error.response?.data?.message || "Không thể cập nhật."),
		);
	} finally {
		isSaving.value = false;
	}
};

const departments = ref<any[]>([]);
onMounted(async () => {
	try {
		const res = await userGroupAPI.getAll({ pageSize: 100 });
		departments.value = res.data.items || [];
	} catch {
		toast.error("Không thể tải danh sách phòng ban.");
	}
});
</script>

<style scoped>
.build-course-page {
	padding-bottom: var(--space-2xl);
	animation: fadeIn 0.4s ease-out;
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	margin-bottom: var(--space-xl);
	flex-wrap: wrap;
	gap: var(--space-lg);
}
.header-content {
	display: flex;
	align-items: center;
	gap: var(--space-xl);
}
.header-icon-box {
	width: 64px;
	height: 64px;
	border-radius: 20px;
	background: linear-gradient(
		135deg,
		rgba(99, 102, 241, 0.15),
		rgba(99, 102, 241, 0.05)
	);
	color: var(--primary-500);
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgba(99, 102, 241, 0.2);
	box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15);
	flex-shrink: 0;
}
.pulse-glow {
	animation: pulse-border 3s ease-in-out infinite;
}
@keyframes pulse-border {
	0% {
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.2);
	}
	50% {
		box-shadow: 0 0 0 15px rgba(99, 102, 241, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
	}
}

.page-title-gradient {
	font-size: 32px;
	font-weight: 800;
	letter-spacing: -0.02em;
	background: linear-gradient(90deg, var(--primary-600), var(--primary-400));
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	margin-bottom: 8px;
	margin-top: 0;
}
.page-desc {
	font-size: var(--font-size-base);
	color: var(--text-secondary);
	max-width: 600px;
	line-height: 1.5;
	margin: 0;
}

.glass-card {
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(0, 0, 0, 0.05);
	border-radius: var(--radius-2xl);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.03);
	overflow: hidden;
}

.glass-card-body {
	padding: 40px 32px;
}

.premium-label {
	font-weight: 700;
	font-size: 13px;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	color: var(--text-secondary);
	margin-bottom: 8px;
}
.required-star {
	color: var(--danger-500);
	margin-left: 2px;
}

.glass-input-group {
	position: relative;
	display: flex;
	align-items: center;
	background: #ffffff;
	border-radius: 12px;
	border: 1px solid rgba(0, 0, 0, 0.06);
	transition: all 0.3s;
}
.glass-input-group:focus-within {
	background: #ffffff;
	border-color: var(--primary-400);
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
.glass-input-group.border-success-focus:focus-within {
	border-color: #10b981;
	box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}
.glass-input-group.textarea-group {
	align-items: flex-start;
}

.input-icon {
	position: absolute;
	left: 16px;
	color: var(--text-tertiary);
	z-index: 2;
	transition: color 0.3s;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
}
.glass-input-group.textarea-group .input-icon {
	height: auto;
	top: 16px;
}
.glass-input-group:focus-within .input-icon {
	color: var(--primary-500);
}
.glass-input-group.border-success-focus:focus-within .input-icon {
	color: #10b981;
}

.glass-input {
	width: 100%;
	padding: 14px 16px 14px 46px;
	background: transparent;
	border: none;
	border-radius: 12px;
	color: var(--text-primary);
	font-size: 15px;
	font-family: inherit;
	line-height: 1.5;
	outline: none;
	z-index: 1;
	resize: none;
}
.glass-input::placeholder {
	color: var(--text-tertiary);
}

.course-groups-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 16px;
}
.cg-select-card {
	display: flex;
	align-items: flex-start;
	gap: 12px;
	padding: 16px;
	background: rgba(249, 250, 251, 0.6);
	border: 1px solid rgba(0, 0, 0, 0.06);
	border-radius: 14px;
	cursor: pointer;
	transition: all 0.2s;
}
.cg-select-card:hover {
	background: #ffffff;
	border-color: rgba(99, 102, 241, 0.3);
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}
.cg-select-card.selected {
	background: rgba(99, 102, 241, 0.05);
	border-color: var(--primary-500);
	box-shadow: 0 0 0 1px var(--primary-500);
}

.cg-check-indicator {
	width: 20px;
	height: 20px;
	border-radius: 6px;
	border: 1px solid rgba(0, 0, 0, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	transition: all 0.2s;
	color: white;
}
.cg-select-card.selected .cg-check-indicator {
	background: var(--primary-500);
	border-color: var(--primary-500);
}
.cg-info {
	flex: 1;
	overflow: hidden;
}
.cg-name {
	margin: 0 0 4px 0;
	font-size: 14px;
	font-weight: 700;
	color: var(--text-primary);
}
.cg-desc {
	margin: 0;
	font-size: 12px;
	color: var(--text-tertiary);
}

.glass-alert-info {
	display: flex;
	gap: 16px;
	align-items: flex-start;
	padding: 16px 20px;
	background: rgba(99, 102, 241, 0.05);
	border-radius: 12px;
	border: 1px solid rgba(99, 102, 241, 0.1);
	color: var(--primary-700);
}

.form-actions-container {
	padding-top: 32px;
	margin-top: 8px;
	border-top: 1px solid rgba(0, 0, 0, 0.05);
	display: flex;
	justify-content: flex-end;
}
.btn-submit {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 48px;
	padding: 0 28px;
	border-radius: var(--radius-full);
	font-weight: 700;
	font-size: 15px;
	cursor: pointer;
	background: linear-gradient(
		135deg,
		var(--primary-600) 0%,
		var(--primary-500) 100%
	);
	color: white;
	border: none;
	box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
	transition: all 0.3s;
}
.btn-submit:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.bg-warning-light {
	background-color: #fffdf5;
}
.text-warning-dark {
	color: #856404;
}
.bg-success-light {
	background-color: #f0fff4;
}
.border-dashed {
	border: 2px dashed #ccc !important;
}
.fs-11 {
	font-size: 11px;
}
.fs-12 {
	font-size: 12px;
}
.fs-13 {
	font-size: 13px;
}
.fs-14 {
	font-size: 14px;
}
.fw-600 {
	font-weight: 600;
}

.nav-link {
	cursor: pointer;
	color: #555;
	font-weight: 500;
	transition: all 0.3s;
}
.nav-link.active {
	color: #0d6efd !important;
	font-weight: 700;
	border-bottom: 2px solid #0d6efd !important;
}

/* Responsive Structural Fixes */
@media (max-width: 768px) {
	.page-titles {
		flex-direction: column;
		align-items: flex-start;
		gap: 15px;
	}
	.page-titles .col-sm-6 {
		width: 100%;
	}
	.page-titles .justify-content-sm-end {
		justify-content: flex-start !important;
	}
	.page-titles button {
		width: 100%;
	}
	.nav-tabs {
		flex-direction: column;
		gap: 8px;
		border-bottom: none !important;
	}
	.nav-item {
		width: 100%;
	}
	.nav-link {
		text-align: left;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 10px 15px;
	}
	.nav-link.active {
		background: rgba(13, 110, 253, 0.05);
		border: 1px solid #0d6efd !important;
	}
	.row.bg-light,
	.row.border {
		padding: 1rem !important;
	}
}

/* Premium Card Styling */
.card {
	border-radius: 20px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03) !important;
	overflow: hidden;
	transition: 0.3s;
}

/* Dark Mode Overrides - Updated for System Sync */
:is([data-bs-theme="dark"], [data-theme="dark"]) .bg-light {
	background-color: var(--bg-tertiary) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .bg-white {
	background-color: var(--bg-secondary) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .text-dark {
	color: var(--text-primary) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .border-dark {
	border-color: var(--border-color) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .card {
	background-color: var(--bg-secondary) !important;
	border-color: var(--border-color) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .nav-tabs {
	border-bottom-color: var(--border-color) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .nav-link {
	color: var(--text-secondary) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .nav-link.active {
	color: var(--primary-400) !important;
	border-color: var(--primary-400) !important;
	background: rgba(99, 102, 241, 0.05) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .bg-warning-light {
	background-color: rgba(245, 158, 11, 0.1) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .bg-success-light {
	background-color: rgba(16, 185, 129, 0.1) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .text-warning-dark {
	color: #fbbf24 !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .border,
:is([data-bs-theme="dark"], [data-theme="dark"]) .border-top,
:is([data-bs-theme="dark"], [data-theme="dark"]) .border-bottom,
:is([data-bs-theme="dark"], [data-theme="dark"]) .border-start,
:is([data-bs-theme="dark"], [data-theme="dark"]) .border-end {
	border-color: var(--border-color) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .border-dashed {
	border-color: var(--border-color) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .form-control,
:is([data-bs-theme="dark"], [data-theme="dark"]) .form-select {
	background-color: var(--bg-tertiary) !important;
	border-color: var(--border-color) !important;
	color: var(--text-primary) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .form-control:focus,
:is([data-bs-theme="dark"], [data-theme="dark"]) .form-select:focus {
	background-color: var(--bg-secondary) !important;
	border-color: var(--primary-500) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .text-muted {
	color: var(--text-tertiary) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .text-success {
	color: #34d399 !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .badge.bg-light.text-dark {
	background-color: var(--bg-tertiary) !important;
	color: var(--text-primary) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .bg-danger.text-white {
	background-color: rgba(239, 68, 68, 0.15) !important;
	color: #ef4444 !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .text-danger {
	color: #f87171 !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .list-group-item {
	background-color: var(--bg-tertiary) !important;
	border-color: var(--border-color) !important;
	color: var(--text-primary) !important;
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .glass-card {
	background: var(--bg-secondary) !important;
	border-color: var(--border-color) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .glass-input-group {
	background: var(--bg-tertiary) !important;
	border-color: var(--border-color) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"])
	.glass-input-group:focus-within {
	background: var(--bg-secondary) !important;
	border-color: var(--primary-500) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .glass-input {
	color: var(--text-primary) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .cg-select-card {
	background: var(--bg-secondary) !important;
	border-color: var(--border-color) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .cg-select-card:hover {
	background: var(--bg-tertiary) !important;
	border-color: var(--primary-400) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .cg-name {
	color: var(--text-primary) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .cg-desc {
	color: var(--text-tertiary) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .border-top-glass {
	border-top-color: var(--border-color) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .glass-card-banner {
	background: var(--bg-tertiary) !important;
	border-color: var(--border-color) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .border-end-glass {
	border-right: 1px solid var(--border-color) !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .premium-label {
	color: var(--text-secondary) !important;
}

/* ── Pass Score Widget ── */
.pass-score-card {
	border: 1.5px solid var(--border-color, rgba(0, 0, 0, 0.08));
	border-radius: 16px;
	overflow: hidden;
	background: var(--bg-secondary, #f9fafb);
	transition:
		border-color 0.2s,
		box-shadow 0.2s;
	height: 100%;
}
.pass-score-card:hover {
	border-color: var(--primary-400, #818cf8);
	box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
}
.psc-header {
	padding: 8px 14px;
	font-size: 11px;
	font-weight: 700;
	color: var(--text-secondary);
	border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
	display: flex;
	align-items: center;
	text-transform: uppercase;
	letter-spacing: 0.06em;
}
.psc-body {
	padding: 12px 14px;
	display: flex;
	align-items: center;
	gap: 14px;
}
.psc-display {
	width: 64px;
	height: 64px;
	border-radius: 50%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	font-weight: 800;
	transition: all 0.3s ease;
}
.psc-display.easy {
	background: rgba(16, 185, 129, 0.1);
	color: #059669;
	border: 2px solid rgba(16, 185, 129, 0.35);
}
.psc-display.medium {
	background: rgba(245, 158, 11, 0.1);
	color: #d97706;
	border: 2px solid rgba(245, 158, 11, 0.35);
}
.psc-display.hard {
	background: rgba(99, 102, 241, 0.1);
	color: #6366f1;
	border: 2px solid rgba(99, 102, 241, 0.35);
}
.psc-num {
	font-size: 20px;
	line-height: 1.1;
}
.psc-unit {
	font-size: 10px;
	line-height: 1;
	opacity: 0.75;
}
.psc-controls {
	flex: 1;
	min-width: 0;
}
.psc-range {
	width: 100%;
	height: 4px;
	cursor: pointer;
	accent-color: var(--primary-500);
	appearance: none;
	-webkit-appearance: none;
	background: var(--border-color, #e5e7eb);
	border-radius: 99px;
	outline: none;
}
.psc-range::-webkit-slider-thumb {
	-webkit-appearance: none;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: var(--primary-500, #6366f1);
	border: 2px solid white;
	box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4);
	cursor: pointer;
	transition: transform 0.15s;
}
.psc-range::-webkit-slider-thumb:hover {
	transform: scale(1.2);
}
.psc-presets {
	display: flex;
	gap: 4px;
	margin-top: 8px;
	flex-wrap: wrap;
}
.psc-preset {
	padding: 2px 7px;
	border-radius: 6px;
	border: 1px solid var(--border-color, #e5e7eb);
	background: var(--bg-primary, white);
	font-size: 10px;
	font-weight: 700;
	cursor: pointer;
	transition: all 0.15s;
	color: var(--text-secondary);
	line-height: 1.6;
}
.psc-preset.active,
.psc-preset:hover {
	background: var(--primary-500, #6366f1);
	color: white;
	border-color: var(--primary-500, #6366f1);
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .pass-score-card {
	background: var(--bg-tertiary);
	border-color: var(--border-color);
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .psc-display.easy {
	background: rgba(16, 185, 129, 0.15);
	color: #34d399;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .psc-display.medium {
	background: rgba(245, 158, 11, 0.15);
	color: #fbbf24;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .psc-display.hard {
	background: rgba(99, 102, 241, 0.15);
	color: #a5b4fc;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .psc-preset {
	background: var(--bg-secondary);
	color: var(--text-secondary);
	border-color: var(--border-color);
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .psc-range {
	background: var(--border-color);
}
</style>
