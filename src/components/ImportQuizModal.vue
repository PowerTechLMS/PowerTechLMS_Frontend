<template>
	<teleport to="body">
		<div v-if="show" class="modal-overlay" @click.self="close">
			<div class="modal-content glass-modal animate-slide-up">
				<div class="modal-header">
					<h3 class="fw-bold m-0 text-dark d-flex align-items-center">
						<FileText :size="20" class="me-2 text-primary" />
						Import Câu Hỏi (Quiz)
					</h3>
					<button class="btn btn-icon btn-ghost p-1" @click="close">
						<X :size="24" />
					</button>
				</div>

				<div class="modal-body custom-scrollbar">
					<div
						class="alert alert-info d-flex align-items-start border-0 bg-primary-light"
					>
						<Info :size="20" class="text-primary me-2 mt-1 flex-shrink-0" />
						<div>
							<h6 class="fw-bold text-primary mb-1">
								Hướng dẫn Cấu trúc File Import
							</h6>
							<p class="mb-2 fs-14 text-dark opacity-75">
								Vui lòng tải lên file <strong>Word (.docx)</strong>,
								<strong>Excel (.xlsx)</strong> hoặc
								<strong>Text (.txt)</strong> với cấu trúc sau:
							</p>
							<div class="row w-100">
								<div class="col-md-6">
									<div
										class="example-box bg-white p-2 rounded border border-primary-subtle fs-12 font-monospace text-muted mt-2"
									>
										<strong>File Word / Text:</strong><br />
										Câu 1: AI là gì?<br />
										A. Trí tuệ nhân tạo<br />
										B. Máy tính<br />
										C. Đám mây<br />
										D. Mạng lưới<br />
										Đáp án: A<br />
										Giải thích: Vì AI là Artificial Intelligence
									</div>
								</div>
								<div class="col-md-6">
									<div
										class="example-box bg-white p-2 rounded border border-primary-subtle fs-12 font-monospace text-muted mt-2"
									>
										<strong>File Excel: (Các cột)</strong><br />
										A: Câu hỏi<br />
										B: Đáp án A<br />
										C: Đáp án B<br />
										D: Đáp án C<br />
										E: Đáp án D<br />
										F: Đáp án đúng (A, B, C, D)<br />
										G: Giải thích (Tùy chọn)
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="row mt-4">
						<div class="col-lg-6 mb-4 mb-lg-0">
							<h6
								class="fw-bold mb-3 d-flex justify-content-between align-items-center"
							>
								<span>Tải file lên đây</span>
								<button
									v-if="selectedFile"
									class="btn btn-sm btn-outline-secondary py-1 px-2 fs-12"
									@click="resetFile"
								>
									<Trash2 :size="14" class="me-1" /> Gỡ file
								</button>
							</h6>
							<div
								class="upload-area d-flex flex-column align-items-center justify-content-center border border-2 border-dashed rounded-3 p-5 text-center transition-all bg-light"
								:class="{ 'border-primary bg-primary-light': isDragging }"
								style="height: 480px; cursor: pointer"
								@dragover.prevent="isDragging = true"
								@dragleave.prevent="isDragging = false"
								@drop.prevent="onDrop"
								@click="triggerFileInput"
							>
								<input
									ref="fileInput"
									type="file"
									class="d-none"
									accept=".txt,.docx,.xlsx,.xls,.csv"
									@change="onFileChange"
								/>

								<template v-if="selectedFile">
									<FileCheck :size="64" class="text-success mb-3" />
									<h5 class="text-dark fw-bold mb-2">
										{{ selectedFile.name }}
									</h5>
									<p class="text-muted fs-14">
										Đã tải lên thành công. Kích thước:
										{{ formatBytes(selectedFile.size) }}
									</p>
									<div class="mt-3">
										<button
											class="btn btn-sm btn-outline-primary"
											@click.stop="triggerFileInput"
										>
											Chọn file khác
										</button>
									</div>
								</template>
								<template v-else>
									<UploadCloud
										:size="64"
										class="text-primary mb-3 opacity-75"
									/>
									<h5 class="text-dark fw-bold mb-2">Kéo thả file vào đây</h5>
									<p class="text-muted fs-14 mb-4">
										Hoặc click để chọn file từ máy tính của bạn
									</p>
									<span
										class="badge bg-secondary text-white px-3 py-2 fw-normal"
									>
										Hỗ trợ: .docx, .xlsx, .txt
									</span>
								</template>
							</div>
						</div>

						<div class="col-lg-6">
							<h6 class="fw-bold mb-3 text-dark">
								Preview Dữ Liệu
								<span
									v-if="parsedQuestions.length > 0 && errors.length === 0"
									class="badge bg-success ms-2"
								>
									{{ parsedQuestions.length }} câu hợp lệ
								</span>
								<span v-if="errors.length > 0" class="badge bg-danger ms-2">
									{{ errors.length }} lỗi
								</span>
							</h6>
							<div
								class="preview-container custom-scrollbar card glass shadow-sm p-3"
							>
								<div v-if="!rawText" class="text-center text-muted py-5 mt-5">
									<Files :size="48" class="opacity-25 mb-3" />
									<p>Nội dung preview sẽ hiển thị ở đây sau khi tải file</p>
								</div>

								<template v-else>
									<div
										v-if="errors.length > 0"
										class="alert alert-danger bg-danger-light border-danger text-danger fs-14 mb-3"
									>
										<p class="fw-bold mb-1 d-flex align-items-center">
											<AlertCircle :size="16" class="me-1" /> Vui lòng sửa các
											lỗi sau trong file:
										</p>
										<ul class="mb-0 ps-3 mt-2">
											<li v-for="(err, idx) in errors" :key="idx">
												{{ err }}
											</li>
										</ul>
									</div>

									<div class="q-preview-list">
										<div
											v-for="(q, index) in parsedQuestions"
											:key="index"
											class="q-preview-item mb-3 p-3 rounded border"
											:class="{
												'border-danger bg-danger-light': !isValidQuestion(q),
											}"
										>
											<h6 class="fw-bold mb-2">
												<span class="text-primary me-1"
													>Câu {{ index + 1 }}:</span
												>
												{{ q.QuestionText }}
											</h6>
											<div class="options-preview ps-2">
												<div
													v-for="(optText, optKey) in q.Options"
													:key="optKey"
													class="fs-13 mb-1"
													:class="{
														'text-success fw-bold':
															q.CorrectAnswer?.split(',').includes(optKey),
													}"
												>
													<span
														class="d-inline-block fw-bold"
														style="width: 25px"
														>{{ optKey }}.</span
													>
													{{ optText }}
													<CheckCircle
														v-if="q.CorrectAnswer?.split(',').includes(optKey)"
														:size="14"
														class="ms-1 d-inline"
													/>
												</div>
											</div>
											<div
												v-if="q.Explanation && q.Explanation.trim() !== ''"
												class="mt-2 text-muted fs-13"
											>
												<strong>Giải thích:</strong> {{ q.Explanation }}
											</div>
											<div
												v-if="!isValidQuestion(q)"
												class="mt-2 fs-12 text-danger fw-bold d-flex align-items-center"
											>
												<AlertCircle :size="12" class="me-1" /> Thiếu trắc
												nghiệm (A, B, C, D) hoặc đáp án.
											</div>
										</div>
									</div>
								</template>
							</div>
						</div>
					</div>
				</div>

				<div
					class="modal-footer bg-light border-top-0 d-flex justify-content-between p-4"
				>
					<button class="btn btn-light px-4 fw-bold" @click="close">Hủy</button>
					<button
						class="btn btn-primary px-5 fw-bold shadow-sm d-flex align-items-center text-white"
						:disabled="!parsedQuestions.length || errors.length > 0"
						@click="confirmImport"
					>
						<DownloadCloud :size="20" class="me-2" />
						Import {{ parsedQuestions.length }} câu hỏi
					</button>
				</div>
			</div>
		</div>
	</teleport>
</template>

<script setup>
import { ref, watch } from "vue";
import {
	X,
	FileText,
	Info,
	Trash2,
	Files,
	CheckCircle,
	AlertCircle,
	DownloadCloud,
	UploadCloud,
	FileCheck,
} from "lucide-vue-next";
import * as XLSX from "xlsx";
import mammoth from "mammoth";

const props = defineProps({
	show: Boolean,
});

const emit = defineEmits(["close", "imported"]);

const isDragging = ref(false);
const fileInput = ref(null);
const selectedFile = ref(null);
const rawText = ref("");
const parsedQuestions = ref([]);
const errors = ref([]);

watch(
	() => props.show,
	(val) => {
		if (val) {
			resetFile();
		}
	},
);

function close() {
	emit("close");
}

function formatBytes(bytes, decimals = 2) {
	if (!+bytes) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function triggerFileInput() {
	fileInput.value?.click();
}

function onDrop(e) {
	isDragging.value = false;
	if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
		handleFile(e.dataTransfer.files[0]);
	}
}

function onFileChange(e) {
	if (e.target.files && e.target.files.length > 0) {
		handleFile(e.target.files[0]);
	}
}

function resetFile() {
	selectedFile.value = null;
	if (fileInput.value) fileInput.value.value = "";
	rawText.value = "";
	parsedQuestions.value = [];
	errors.value = [];
}

async function handleFile(file) {
	selectedFile.value = file;
	const ext = file.name.split(".").pop().toLowerCase();

	try {
		if (ext === "txt" || ext === "csv") {
			const reader = new FileReader();
			reader.onload = (e) => {
				rawText.value = e.target.result;
				parseContent();
			};
			reader.readAsText(file);
		} else if (ext === "xlsx" || ext === "xls") {
			const reader = new FileReader();
			reader.onload = (e) => {
				const data = new Uint8Array(e.target.result);
				const workbook = XLSX.read(data, { type: "array" });
				const firstSheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[firstSheetName];
				const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
				const lines = json.map((row) => row.join("\t"));
				rawText.value = lines.join("\n");
				parseContent();
			};
			reader.readAsArrayBuffer(file);
		} else if (ext === "docx") {
			const reader = new FileReader();
			reader.onload = async (e) => {
				const arrayBuffer = e.target.result;
				try {
					const result = await mammoth.extractRawText({ arrayBuffer });
					rawText.value = result.value;
					parseContent();
				} catch {
					errors.value = ["Lỗi định dạng file Word."];
					parsedQuestions.value = [];
				}
			};
			reader.readAsArrayBuffer(file);
		} else {
			errors.value = [
				"Định dạng file không được hỗ trợ. Vui lòng chọn .txt, .docx, hoặc .xlsx",
			];
			parsedQuestions.value = [];
		}
	} catch {
		errors.value = ["Có lỗi xảy ra khi đọc file."];
		parsedQuestions.value = [];
	}
}

function parseContent() {
	parsedQuestions.value = [];
	errors.value = [];
	const text = rawText.value.trim();
	if (!text) return;

	const lines = text.split("\n").filter((l) => l.trim().length > 0);
	let isExcel = false;
	if (lines.length > 0 && lines[0].split("\t").length >= 4) {
		isExcel = true;
	}

	if (isExcel) {
		parseExcelPaste(lines);
	} else {
		parseTextFormat(lines);
	}

	validateQuestions();
}

function parseExcelPaste(lines) {
	lines.forEach((line, index) => {
		const cols = line.split("\t").map((c) => c.trim());
		if (index === 0 && cols[0].toLowerCase().includes("question")) return;

		if (cols.length >= 6) {
			const q = {
				QuestionText: cols[0],
				Options: {
					A: cols[1] || "",
					B: cols[2] || "",
					C: cols[3] || "",
					D: cols[4] || "",
				},
				CorrectAnswer: cols[5]
					? cols[5].toUpperCase().replace(/[^A-D,]/g, "")
					: "",
				Points: 1,
				Explanation: cols[6] || "",
			};
			parsedQuestions.value.push(q);
		}
	});
}

function parseTextFormat(lines) {
	let currentQ = null;

	const questionRegex = /^(Câu\s*\d+|Bài\s*\d+|\d+)\s*[:.-]?\s*(.*)/i;
	const optionRegex = /^([A-D])\s*[.)]\s*(.*)/i;
	const answerRegex =
		/^(Đáp\s*án|Correct|Answer)\s*[:.-]?\s*([A-D](?:\s*,\s*[A-D])*)/i;
	const explanationRegex = /^(Giải\s*thích|Explanation)\s*[:.-]?\s*(.*)/i;

	for (let line of lines) {
		line = line.trim();

		const ansMatch = line.match(answerRegex);
		if (ansMatch && currentQ) {
			currentQ.CorrectAnswer = ansMatch[2].toUpperCase().replace(/\s/g, "");
			continue;
		}

		const qMatch = line.match(questionRegex);
		if (qMatch) {
			if (currentQ) parsedQuestions.value.push(currentQ);
			currentQ = {
				QuestionText: qMatch[2] || "Nội dung câu hỏi",
				Options: { A: "", B: "", C: "", D: "" },
				CorrectAnswer: "",
				Points: 1,
				Explanation: "",
			};
			continue;
		}

		const optMatch = line.match(optionRegex);
		if (optMatch && currentQ) {
			const letter = optMatch[1].toUpperCase();
			currentQ.Options[letter] = optMatch[2];
			continue;
		}

		const expMatch = line.match(explanationRegex);
		if (expMatch && currentQ) {
			currentQ.Explanation = expMatch[2];
			continue;
		}

		if (currentQ) {
			if (currentQ.Explanation !== "") {
				currentQ.Explanation += "\n" + line;
			} else if (!currentQ.Options.A && !currentQ.Options.B) {
				currentQ.QuestionText += "\n" + line;
			}
		}
	}

	if (currentQ) parsedQuestions.value.push(currentQ);
}

function validateQuestions() {
	parsedQuestions.value.forEach((q, idx) => {
		if (!q.QuestionText) {
			errors.value.push(`Câu ${idx + 1}: Thiếu nội dung câu hỏi.`);
		}

		const hasOptions = Object.values(q.Options).some(
			(o) => o.trim().length > 0,
		);
		if (!hasOptions) {
			errors.value.push(
				`Câu ${idx + 1} (${q.QuestionText ? q.QuestionText.substring(0, 15) : ""}...): Thiếu các lựa chọn (A, B, C, D).`,
			);
		}

		if (!q.CorrectAnswer) {
			errors.value.push(`Câu ${idx + 1}: Thiếu đáp án (Ví dụ: "Đáp án: A").`);
		}
	});

	if (parsedQuestions.value.length === 0 && rawText.value.length > 0) {
		errors.value.push(
			"Không tìm thấy câu hỏi hợp lệ nào. Vui lòng kiểm tra lại định dạng (Cần có chữ 'Câu X:', 'A.', 'B.', 'Đáp án:').",
		);
	}
}

function isValidQuestion(q) {
	return (
		q.QuestionText &&
		Object.values(q.Options).some((o) => o.trim().length > 0) &&
		q.CorrectAnswer
	);
}

function confirmImport() {
	if (errors.value.length === 0 && parsedQuestions.value.length > 0) {
		emit("imported", JSON.parse(JSON.stringify(parsedQuestions.value)));
		close();
	}
}
</script>

<style scoped>
.modal-overlay {
	position: fixed;
	inset: 0;
	background: rgba(15, 23, 42, 0.6);
	backdrop-filter: blur(8px);
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
}
.modal-content {
	background: #ffffff;
	border-radius: 20px;
	width: 100%;
	max-width: 1000px;
	max-height: 90vh;
	display: flex;
	flex-direction: column;
	box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
	overflow: hidden;
}
.animate-slide-up {
	animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(30px) scale(0.98);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}
.modal-header {
	padding: 24px 32px;
	border-bottom: 1px solid var(--border-color);
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: rgba(255, 255, 255, 0.9);
}
.modal-body {
	padding: 24px 32px;
	overflow-y: auto;
	flex: 1;
}
.bg-primary-light {
	background-color: rgba(99, 102, 241, 0.08) !important;
}
.bg-danger-light {
	background-color: rgba(239, 68, 68, 0.08) !important;
}
.import-textarea {
	width: 100%;
	height: 480px;
	resize: none;
	border-radius: 12px;
	border: 1px solid var(--border-color);
	padding: 16px;
	font-family: inherit;
	background: #f8fafc;
	font-size: 14px;
	line-height: 1.6;
}
.import-textarea:focus {
	outline: none;
	border-color: var(--primary-400);
	background: #fff;
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
.preview-container {
	height: 480px;
	overflow-y: auto;
	background: #f8fafc;
	border-radius: 12px;
}
.q-preview-item {
	background: white;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}
.q-preview-item h6 {
	font-size: 14.5px;
	line-height: 1.5;
}
.custom-scrollbar::-webkit-scrollbar {
	width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
	background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	background: #cbd5e1;
	border-radius: 10px;
}
</style>
