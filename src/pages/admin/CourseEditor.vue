<template>
	<div class="container-fluid">
		<div class="row page-titles mx-0">
			<div class="col-sm-6 p-md-0">
				<div class="welcome-text">
					<h4 class="text-dark fw-bold">Chỉnh Sửa Khóa Học</h4>
					<p class="text-muted fs-13 mb-0">ID Khóa học: #{{ courseId }}</p>
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

		<div v-if="isLoadingData" class="text-center py-5">
			<i class="fas fa-spinner fa-spin fs-1 text-primary"></i>
			<p class="mt-2 text-muted fw-bold">Đang tải dữ liệu khóa học...</p>
		</div>

		<div v-else class="row">
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
						<form @submit.prevent="submitCourse">
							<div v-show="activeTab === 'basic'">
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
											<small
												v-if="course.ExistingCoverUrl"
												class="text-success mt-1 d-block"
											>
												<i class="fas fa-check-circle me-1"></i> Khóa học đã có
												ảnh bìa. Chọn tệp mới để thay đổi.
											</small>
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
										>Xuất bản khóa học (Học viên có thể nhìn thấy)</label
									>
								</div>

								<div class="text-end border-top pt-3">
									<button
										type="button"
										class="btn btn-primary"
										@click="activeTab = 'curriculum'"
									>
										Tiếp theo: Giáo trình
										<i class="fas fa-arrow-right ms-2"></i>
									</button>
								</div>
							</div>

							<div v-show="activeTab === 'curriculum'">
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
														<small
															v-if="lesson.videoUrl && !lesson.videoFile"
															class="text-success mt-1 d-block"
															><i class="fas fa-check"></i> Đã có video trên hệ
															thống.</small
														>
													</div>
												</div>
												<div v-else class="bg-light p-3 rounded">
													<textarea
														v-model="lesson.content"
														class="form-control"
														rows="4"
														placeholder="Nhập nội dung bài đọc..."
													></textarea>
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
														</div>
													</div>
													<button
														type="button"
														class="btn btn-xs btn-outline-warning w-100 fw-bold mt-2"
														@click="addQuestionToLessonQuiz(mIdx, lIdx)"
													>
														+ Thêm câu hỏi trắc nghiệm
													</button>
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
										class="btn btn-success"
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

								<div
									class="text-center mt-4 border-dashed p-3 rounded bg-light"
									style="cursor: pointer"
									@click="addQuestionFinal"
								>
									<span class="text-success fw-bold"
										><i class="fas fa-plus-circle me-2 fs-5"></i>THÊM CÂU HỎI
										MỚI VÀO NGÂN HÀNG</span
									>
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
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

// @ts-ignore
import { courseAPI, moduleAPI, lessonAPI, quizAPI } from "@/services/api";
import { toast } from "vue3-toastify";

const router = useRouter();
const route = useRoute();
const courseId = route.params.id;

// UI State
const activeTab = ref("basic");
const isSaving = ref(false);
const isLoadingData = ref(true);

type OptionKey = "A" | "B" | "C" | "D";
const letters: OptionKey[] = ["A", "B", "C", "D"];
const generateId = () => Math.floor(Math.random() * -1000000);

// DANH MỤC KHÓA HỌC
const categories = [
	{ id: 1, name: "Kỹ năng mềm" },
	{ id: 2, name: "Kỹ thuật" },
	{ id: 3, name: "Quy trình" },
	{ id: 4, name: "Lãnh đạo" },
	{ id: 5, name: "Số hóa" },
];

// Data Models
const course = ref({
	Title: "",
	Description: "",
	CategoryId: null as number | null,
	Level: 3, // [MỚI]
	CoverImage: null as File | null,
	ExistingCoverUrl: "",
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
	Id?: number;
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

interface Lesson {
	id: number;
	title: string;
	type: "Video" | "Text";
	content: string;
	videoType: "url" | "upload";
	videoUrl: string;
	videoFile: File | null;
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
const deletedModuleIds = ref<number[]>([]);
const deletedLessonIds = ref<{ moduleId: number; id: number }[]>([]);
const deletedAttachmentIds = ref<number[]>([]);

// LOADING DATA
onMounted(async () => {
	if (!courseId) return router.push("/admin/courses");

	isLoadingData.value = true;
	try {
		const res = await courseAPI.getById(courseId as string);
		const data = res.data;

		// 1. Map Course Info
		course.value.Title = data.title || "";
		course.value.Description = data.description || "";
		course.value.CategoryId = data.categoryId || null; // <--- LẤY CATEGORY CŨ LÊN
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

		// 2. Map Modules & Lessons & LẤY CHI TIẾT MINI-QUIZZES
		if (data.modules) {
			const loadedModules = [];
			for (const m of data.modules) {
				const loadedLessons = [];
				for (const l of m.lessons || []) {
					let lessonQuiz = createEmptyQuiz("Bài tập củng cố");
					let hasQuiz = !!l.quizId;

					// NẾU CÓ QUIZ -> Gọi API lấy danh sách câu hỏi
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
							}));
						} catch (e) {
							console.error(`Không lấy được quiz của lesson ${l.id}`, e);
						}
					}

					loadedLessons.push({
						id: l.id,
						title: l.title,
						type: l.type || "Video",
						content: l.content || "",
						videoType:
							l.videoUrl && l.videoUrl.startsWith("http") ? "url" : "upload",
						videoUrl: l.videoUrl || "",
						videoFile: null,
						isFreePreview: l.isFreePreview || false,
						attachments: (l.attachments || []).map((a: any) => ({
							id: a.id,
							fileName: a.fileName,
							file: null,
						})),
						hasQuiz: hasQuiz,
						quiz: lessonQuiz,
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

		// 3. Map Final Quiz (Dùng getById thay vì getResults)
		if (data.finalQuizId) {
			try {
				const resQuiz = await quizAPI.getById(data.finalQuizId);
				const qData = resQuiz.data;
				courseQuiz.value.Id = qData.id;
				courseQuiz.value.Title = qData.title || "Đề thi cuối khóa";
				courseQuiz.value.PassScore = qData.passScore || 8;
				courseQuiz.value.QuestionCount = qData.questionCount || 10;
				courseQuiz.value.TimeLimitMinutes = qData.timeLimitMinutes || null;
				courseQuiz.value.questions = (qData.questions || []).map((q: any) => ({
					id: q.id,
					QuestionText: q.questionText,
					Options: { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD },
					CorrectAnswer: q.correctAnswer || "A",
					Points: q.points || 1.0,
				}));
			} catch (e) {
				console.error("Không tải được bài thi cuối khóa", e);
			}
		}
	} catch (error) {
		console.error("Lỗi tải khóa học:", error);
		toast.error("Không thể tải dữ liệu khóa học.");
	} finally {
		isLoadingData.value = false;
	}
});

// UI EVENT HANDLERS
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
		isFreePreview: false,
		attachments: [],
		hasQuiz: false,
		quiz: createEmptyQuiz("Bài tập"),
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

// SAVE LOGIC (XỬ LÝ CHUẨN CÂU HỎI CŨ VÀ MỚI)
const submitCourse = async () => {
	// Ràng buộc phải chọn danh mục
	if (!course.value.CategoryId) {
		toast.warning("Vui lòng chọn Danh mục phân loại ở Tab 1!");
		activeTab.value = "basic";
		return;
	}

	isSaving.value = true;
	try {
		// 1. Cập nhật thông tin Course
		const coursePayload = {
			title: course.value.Title,
			description: course.value.Description,
			categoryId: course.value.CategoryId,
			level: course.value.Level, // [MỚI]
			isPublished: course.value.IsPublished,
			passScore: Number(course.value.PassScore) || 8,
			enrollStartDate: course.value.EnrollStartDate?.toISOString() || null,
			enrollEndDate: course.value.EnrollEndDate?.toISOString() || null,
			completionDeadlineDays: course.value.CompletionDeadlineDays
				? Number(course.value.CompletionDeadlineDays)
				: null,
			completionEndDate: course.value.CompletionEndDate?.toISOString() || null,
		};
		await courseAPI.update(courseId as string, coursePayload);

		// 1.5. Xử lý xóa các mục cũ
		for (const attId of deletedAttachmentIds.value) {
			await lessonAPI.deleteAttachment(0, attId); // ModuleId không quan trọng trong API cụ thể này
		}
		for (const item of deletedLessonIds.value) {
			await lessonAPI.delete(item.moduleId, item.id);
		}
		for (const mId of deletedModuleIds.value) {
			await moduleAPI.delete(courseId as string, mId);
		}
		// Xóa xong thì reset mảng
		deletedAttachmentIds.value = [];
		deletedLessonIds.value = [];
		deletedModuleIds.value = [];

		if (course.value.CoverImage) {
			const formData = new FormData();
			formData.append("file", course.value.CoverImage);
			await courseAPI.uploadCover(courseId as string, formData);
		}

		// 2. Cập nhật Modules và Lessons
		for (const mod of curriculum.value) {
			let currentModuleId = mod.id;
			if (currentModuleId < 0) {
				const resMod = await moduleAPI.create(courseId as string, {
					title: mod.title,
					sortOrder: 0,
				});
				currentModuleId = resMod.data.id;
			} else {
				await moduleAPI.update(courseId as string, currentModuleId, {
					title: mod.title,
					sortOrder: 0,
				});
			}

			for (const les of mod.lessons) {
				const lessonPayload = {
					title: les.title,
					type: les.type,
					content: les.content,
					videoUrl: les.videoType === "url" ? les.videoUrl : null,
					isFreePreview: les.isFreePreview,
					sortOrder: 0,
					videoDurationSeconds: 0,
				};
				let currentLessonId = les.id;
				if (currentLessonId < 0) {
					const resLes = await lessonAPI.create(currentModuleId, lessonPayload);
					currentLessonId = resLes.data.id;
				} else {
					await lessonAPI.update(
						currentModuleId,
						currentLessonId,
						lessonPayload,
					);
				}

				// Video/Attachments
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

				// 3. LƯU MINI-QUIZ
				if (les.hasQuiz && les.quiz.questions.length > 0) {
					let targetQuizId = les.quiz.Id;

					// Nếu Quiz chưa có ID (mới tick Bật Quiz), tạo mới
					if (!targetQuizId || targetQuizId < 0) {
						const qPayload = {
							title: les.quiz.Title || `Quiz: ${les.title}`,
							timeLimitMinutes: les.quiz.TimeLimitMinutes
								? Number(les.quiz.TimeLimitMinutes)
								: null,
							passScore: Number(les.quiz.PassScore) || 5,
							questionCount: Number(les.quiz.questions.length),
							shuffleQuestions: true,
							shuffleAnswers: true,
						};
						const resQuiz = await quizAPI.createForLesson(
							currentModuleId,
							currentLessonId,
							qPayload,
						);
						targetQuizId = resQuiz.data.id;
						les.quiz.Id = targetQuizId;
					}

					// Đẩy câu hỏi MỚI (có id âm) vào Quiz
					for (const q of les.quiz.questions) {
						if (q.id < 0) {
							await quizAPI.addQuestion(targetQuizId, {
								questionText: q.QuestionText,
								optionA: q.Options.A || "",
								optionB: q.Options.B || "",
								optionC: q.Options.C || "",
								optionD: q.Options.D || "",
								correctAnswer: q.CorrectAnswer,
								points: Number(q.Points) || 1,
							});
							// Chuyển ID thành dương giả lập để nếu ấn LƯU tiếp không bị gọi lại 2 lần
							q.id = generateId() * -1;
						}
					}
				}
			}
		}

		// 4. LƯU FINAL QUIZ
		if (courseQuiz.value.questions.length > 0) {
			let finalId = courseQuiz.value.Id;

			// Nếu chưa có, tạo Final Quiz mới
			if (!finalId || finalId < 0) {
				const finalPayload = {
					title: courseQuiz.value.Title || "Đề thi cuối khóa",
					passScore: Number(courseQuiz.value.PassScore) || 8,
					questionCount:
						Number(courseQuiz.value.QuestionCount) ||
						courseQuiz.value.questions.length,
					timeLimitMinutes: Number(courseQuiz.value.TimeLimitMinutes) || null,
					shuffleQuestions: true,
					shuffleAnswers: true,
				};
				const resFQuiz = await quizAPI.create(courseId as string, finalPayload);
				finalId = resFQuiz.data.id;
				courseQuiz.value.Id = finalId;
			}

			// Đẩy câu hỏi MỚI vào
			for (const q of courseQuiz.value.questions) {
				if (q.id < 0) {
					await quizAPI.addQuestion(finalId, {
						questionText: q.QuestionText,
						optionA: q.Options.A,
						optionB: q.Options.B,
						optionC: q.Options.C,
						optionD: q.Options.D,
						correctAnswer: q.CorrectAnswer,
						points: 1,
					});
					q.id = generateId() * -1;
				}
			}
		}

		toast.success("Cập nhật khóa học thành công!");
		router.push("/admin/courses");
	} catch (error: any) {
		console.error("LỖI LƯU:", error.response?.data || error);
		toast.error(
			"Lỗi: " +
				(error.response?.data?.message ||
					"Không thể cập nhật. Kiểm tra Console."),
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
