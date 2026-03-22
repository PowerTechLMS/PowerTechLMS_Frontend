<template>
	<div class="container-fluid">
		<div class="row page-titles mx-0">
			<div class="col-sm-6 p-md-0">
				<div class="welcome-text">
					<h4 class="text-dark fw-bold">Thiết Kế Khóa Học Mới</h4>
					<p class="text-muted fs-13 mb-0">
						Tạo nội dung giáo trình và cấu hình bài thi.
					</p>
				</div>
			</div>
			<div class="col-sm-6 p-md-0 justify-content-sm-end mt-2 mt-sm-0 d-flex">
				<button
					class="btn btn-dark btn-sm fw-bold shadow-sm"
					@click="router.push('/admin/courses')"
				>
					<i class="fas fa-arrow-left me-2"></i>Quay lại
				</button>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-12">
				<div class="card shadow-sm border-0">
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
								<div class="row bg-light p-3 rounded mb-4">
									<div class="col-lg-8">
										<div class="form-group mb-3">
											<label class="form-label fw-bold"
												>Tên khóa học <span class="text-danger">*</span></label
											>
											<input
												v-model="course.Title"
												type="text"
												class="form-control border-dark"
												placeholder="Ví dụ: Làm chủ trí tuệ nhân tạo..."
												required
											/>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="form-group mb-3">
											<label class="form-label fw-bold text-success"
												>Điểm đạt (%) <span class="text-danger">*</span></label
											>
											<input
												v-model="course.PassScore"
												type="number"
												min="0"
												class="form-control border-dark"
												required
											/>
										</div>
									</div>

									<div class="col-lg-12">
										<div class="form-group mb-3">
											<label class="form-label fw-bold"
												>Danh mục phân loại
												<span class="text-danger">*</span></label
											>
											<select
												v-model="course.CategoryId"
												class="form-select border-dark"
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

									<div class="col-lg-12">
										<div class="form-group mb-3">
											<label class="form-label fw-bold"
												>Phân cấp khóa học
												<span class="text-danger">*</span></label
											>
											<div
												class="d-flex gap-4 bg-white p-2 rounded border border-dark"
											>
												<div class="form-check">
													<input
														class="form-check-input"
														type="radio"
														v-model="course.Level"
														:value="1"
														id="lv1"
													/>
													<label class="form-check-label fw-bold" for="lv1"
														>Cấp 1: Người mới</label
													>
												</div>
												<div class="form-check">
													<input
														class="form-check-input"
														type="radio"
														v-model="course.Level"
														:value="2"
														id="lv2"
													/>
													<label class="form-check-label fw-bold" for="lv2"
														>Cấp 2: Phòng ban</label
													>
												</div>
												<div class="form-check">
													<input
														class="form-check-input"
														type="radio"
														v-model="course.Level"
														:value="3"
														id="lv3"
													/>
													<label class="form-check-label fw-bold" for="lv3"
														>Cấp 3: Tự chọn</label
													>
												</div>
											</div>
											<small class="text-muted fs-11 mt-1 d-block">
												* Lưu ý: Học viên phải hoàn thành tất cả khoá Cấp 1 để
												mở khoá Cấp 2. Khoá Cấp 3 xuất hiện trong mục Khám phá.
											</small>
										</div>
									</div>

									<div class="col-lg-12">
										<div class="form-group mb-3">
											<label class="form-label fw-bold">Mô tả</label>
											<textarea
												v-model="course.Description"
												class="form-control border-dark"
												rows="4"
												placeholder="Nhập tóm tắt và mục tiêu khóa học..."
											></textarea>
										</div>
									</div>
									<div class="col-lg-12">
										<div class="form-group mb-0">
											<label class="form-label fw-bold">Ảnh bìa</label>
											<input
												type="file"
												class="form-control"
												accept="image/*"
												@change="handleImageUpload"
											/>
											<div v-if="course.CoverImage" class="mt-2">
												<img
													:src="getObjectURL(course.CoverImage)"
													style="max-height: 150px; border-radius: 8px"
												/>
											</div>
										</div>
									</div>
								</div>

								<div class="row border p-3 rounded mb-4">
									<div class="col-md-6 border-end">
										<label
											class="form-label fw-bold d-block text-dark border-bottom pb-2"
											>Thời gian đăng ký</label
										>
										<div class="form-group mb-3 mt-3">
											<label class="form-label text-muted fs-12">Từ ngày</label
											><VueDatePicker
												v-model="course.EnrollStartDate"
												auto-apply
											/>
										</div>
										<div class="form-group mb-0">
											<label class="form-label text-muted fs-12">Đến ngày</label
											><VueDatePicker
												v-model="course.EnrollEndDate"
												auto-apply
											/>
										</div>
									</div>
									<div class="col-md-6 ps-4">
										<label
											class="form-label fw-bold d-block text-dark border-bottom pb-2"
											>Hạn hoàn thành</label
										>
										<div class="form-group mb-3 mt-3">
											<label class="form-label text-muted fs-12"
												>Số ngày học sau khi đăng ký</label
											><input
												v-model="course.CompletionDeadlineDays"
												type="number"
												class="form-control"
											/>
										</div>
										<div class="form-group mb-0">
											<label class="form-label text-muted fs-12"
												>Ngày kết thúc tuyệt đối</label
											><VueDatePicker
												v-model="course.CompletionEndDate"
												auto-apply
											/>
										</div>
									</div>
								</div>

								<div
									class="form-check form-switch mb-4 bg-light p-3 rounded border border-primary"
								>
									<input
										v-model="course.IsPublished"
										class="form-check-input ms-0"
										type="checkbox"
										id="pubSwitch"
									/>
									<label class="form-check-label fw-bold ms-2" for="pubSwitch"
										>Xuất bản ngay (Học viên có thể nhìn thấy)</label
									>
								</div>

								<div class="text-end border-top pt-3">
									<button
										type="button"
										class="btn btn-primary px-4"
										@click="activeTab = 'curriculum'"
									>
										Tiếp theo: Giáo trình
										<i class="fas fa-arrow-right ms-2"></i>
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
														<div
															v-if="lesson.videoFile"
															class="mt-1 small text-primary fw-bold"
														>
															<i class="fas fa-video me-1"></i>
															{{ lesson.videoFile.name }}
														</div>
													</div>
												</div>
												<div v-else class="bg-light p-3 rounded">
													<textarea
														v-model="lesson.content"
														class="form-control mb-2"
														rows="4"
														placeholder="Nhập nội dung bài đọc..."
													></textarea>
													<div
														class="row gx-2 align-items-center bg-white p-2 border rounded mx-0"
													>
														<div class="col-auto">
															<label
																class="form-label mb-0 fw-bold fs-12 text-primary"
																>Thời gian bài đọc:</label
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
														<div class="col ps-2">
															<small class="text-muted fs-11"
																>* Học viên phải đợi đúng thời gian cài
																đặt.</small
															>
														</div>
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
														<div
															v-if="att.file"
															class="small text-success mt-1"
														>
															<i class="fas fa-file me-1"></i>
															{{ att.file.name }}
														</div>
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
																				:name="`mq_${lesson.id}_${q.id}`"
																				:value="letter"
																				v-model="q.CorrectAnswer"
																			/>
																			<span class="ms-1 fw-bold fs-11">{{
																				letter
																			}}</span>
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
															<i class="fas fa-file-import me-1"></i> Import từ
															Word/Excel
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
										class="btn btn-light me-2"
										@click="activeTab = 'basic'"
									>
										Quay lại
									</button>
									<button
										type="button"
										class="btn btn-success px-4"
										@click="activeTab = 'quiz'"
									>
										Tiếp theo: Cấu hình Thi
										<i class="fas fa-arrow-right ms-2"></i>
									</button>
								</div>
							</div>

							
							<div v-if="activeTab === 'quiz'">
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
													placeholder="Ví dụ: Đề thi đánh giá năng lực..."
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
									v-for="(q, qIdx) in courseQuiz.questions"
									:key="q.id"
									class="card border border-success mb-3 shadow-none"
								>
									<div
										class="card-header bg-success-light py-1 px-3 d-flex justify-content-between align-items-center"
									>
										<span class="fw-bold text-success">Câu {{ qIdx + 1 }}</span>
										<button
											type="button"
											class="btn btn-danger btn-xs"
											@click="removeQuestionFinal(qIdx)"
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
											><i class="fas fa-spinner fa-spin me-2"></i>ĐANG TẠO KHÓA
											HỌC...</span
										>
										<span v-else
											><i class="fas fa-save me-2"></i>HOÀN TẤT TẠO KHÓA
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

import { courseAPI, moduleAPI, lessonAPI, quizAPI } from "@/services/api";
import ImportQuizModal from "@/components/ImportQuizModal.vue";
import { toast } from "vue3-toastify";

const router = useRouter();

const activeTab = ref("basic");
const isSaving = ref(false);

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
	IsPublished: false,
	PassScore: 8,
	EnrollStartDate: null as Date | null,
	EnrollEndDate: null as Date | null,
	CompletionDeadlineDays: null as number | null,
	CompletionEndDate: null as Date | null,
	QuizRetakeWaitTimeMinutes: 5,
	QuizMaxRetakesPerDay: 3,
});

interface QuizQuestion {
	id: number;
	QuestionText: string;
	Options: Record<OptionKey, string>;
	CorrectAnswer: string;
	Points: number;
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

interface Lesson {
	id: number;
	title: string;
	type: "Video" | "Text";
	content: string;
	videoType: "url" | "upload";
	videoUrl: string;
	videoFile: File | null;
	durationSeconds: number;
	isFreePreview: boolean;
	attachments: any[];
	hasQuiz: boolean;
	quiz: QuizModel;
}
interface Module {
	id: number;
	title: string;
	lessons: Lesson[];
}

const curriculum = ref<Module[]>([]);
const courseQuiz = ref<QuizModel>(createEmptyQuiz("Bài thi cuối khóa"));

const addModule = () =>
	curriculum.value.push({ id: generateId(), title: "Chương mới", lessons: [] });
const removeModule = (index: number) => {
	if (confirm("Xóa toàn bộ chương này?")) {
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
	});
};
const removeLesson = (mIdx: number, lIdx: number) => {
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
	curriculum.value[mIdx].lessons[lIdx].attachments.splice(aIdx, 1);
};

const addQuestionToLessonQuiz = (mIdx: number, lIdx: number) => {
	curriculum.value[mIdx].lessons[lIdx].quiz.questions.push({
		id: generateId(),
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
		id: generateId(),
		QuestionText: "",
		Options: { A: "", B: "", C: "", D: "" },
		CorrectAnswer: "A",
		Points: 1.0,
	});
};
const removeQuestionFinal = (index: number) =>
	courseQuiz.value.questions.splice(index, 1);

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
			});
		});
		toast.success(`Đã import ${questions.length} câu hỏi vào đề thi.`);
	}
}

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

const getObjectURL = (file: File) => URL.createObjectURL(file);

const submitCourse = async () => {
	if (!course.value.Title?.trim()) {
		toast.warning("Vui lòng nhập Tên khóa học ở Tab 1!");
		activeTab.value = "basic";
		return;
	}
	if (
		course.value.PassScore === null ||
		course.value.PassScore === undefined ||
		course.value.PassScore < 0
	) {
		toast.warning("Vui lòng nhập Điểm đạt hợp lệ ở Tab 1!");
		activeTab.value = "basic";
		return;
	}
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
				title: mod.title,
				sortOrder: 0,
			});
			const currentModuleId = resMod.data.id;

			for (const les of mod.lessons) {
				const lessonPayload = {
					title: les.title,
					type: les.type,
					content: les.content,
					videoUrl: les.videoType === "url" ? les.videoUrl : null,
					isFreePreview: les.isFreePreview,
					sortOrder: 0,
					videoDurationSeconds:
						les.type === "Video" ? Number(les.durationSeconds) || 0 : 0,
					readingDurationSeconds:
						les.type === "Text" ? Number(les.durationSeconds) || 0 : 0,
					videoStatus: "Ready",
				};
				const resLes = await lessonAPI.create(currentModuleId, lessonPayload);
				const currentLessonId = resLes.data.id;

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
					if (att.file) {
						const aForm = new FormData();
						aForm.append("file", att.file);
						await lessonAPI.uploadAttachment(
							currentModuleId,
							currentLessonId,
							aForm,
						);
					}
				}

				if (les.hasQuiz && les.quiz.questions.length > 0) {
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
					const resQuiz = await quizAPI.createForLesson(
						currentModuleId,
						currentLessonId,
						qPayload,
					);
					const targetQuizId = resQuiz.data.id;

					for (const q of les.quiz.questions) {
						await quizAPI.addQuestion(targetQuizId, {
							content: q.QuestionText,
							optionA: q.Options.A || "",
							optionB: q.Options.B || "",
							optionC: q.Options.C || "",
							optionD: q.Options.D || "",
							correctAnswer: q.CorrectAnswer,
							points: Number(q.Points) || 1,
						});
					}
				}
			}
		}

		if (courseQuiz.value.questions.length > 0) {
			const finalPayload = {
				title: courseQuiz.value.Title || "Đề thi cuối khóa",
				passScore: Number(courseQuiz.value.PassScore) || 8,
				questionCount:
					Number(courseQuiz.value.QuestionCount) ||
					courseQuiz.value.questions.length,
				timeLimitMinutes: Number(courseQuiz.value.TimeLimitMinutes) || null,
				shuffleQuestions: true,
				shuffleAnswers: true,
				retakeWaitTimeMinutes: courseQuiz.value.RetakeWaitTimeMinutes
					? Number(courseQuiz.value.RetakeWaitTimeMinutes)
					: null,
				maxRetakesPerDay: courseQuiz.value.MaxRetakesPerDay
					? Number(courseQuiz.value.MaxRetakesPerDay)
					: null,
			};
			const resFQuiz = await quizAPI.create(newCourseId, finalPayload);
			const finalId = resFQuiz.data.id;

			for (const q of courseQuiz.value.questions) {
				await quizAPI.addQuestion(finalId, {
					content: q.QuestionText,
					optionA: q.Options.A,
					optionB: q.Options.B,
					optionC: q.Options.C,
					optionD: q.Options.D,
					correctAnswer: q.CorrectAnswer,
					points: 1,
				});
			}
		}

		toast.success("Tạo khóa học thành công!");
		router.push("/admin/courses");
	} catch (error: any) {
		toast.error(
			"Lỗi: " + (error.response?.data?.message || "Không thể tạo khóa học."),
		);
	} finally {
		isSaving.value = false;
	}
};
</script>

<style scoped>
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
.nav-link {
	cursor: pointer;
	color: #555;
	font-weight: 500;
}
.nav-link.active {
	color: #0d6efd !important;
	font-weight: 700;
	border-bottom: 2px solid #0d6efd !important;
}
</style>
