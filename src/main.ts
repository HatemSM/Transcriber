import "./style.css";
async function startTranscribition(image: string) {
	showElement("loadingSpinner");
	showElement("imageCard");
	hideElement("arabicText");
	const arabicText = await getArabicText(image);
	updateText(arabicText);
	hideElement("loadingSpinner");
	showElement("arabicText");
}

function updateText(text: string) {
	const arabicText = document.querySelector("#arabicText");
	if (!arabicText) throw new Error("No element found with id 'arabicText'");
	arabicText.textContent = text;
}

function showElement(id: string) {
	const element = document.querySelector(`#${id}`);
	if (!element) throw new Error(`No element found with id '${id}'`);
	element.classList.remove("hidden");
}

function hideElement(id: string) {
	const element = document.querySelector(`#${id}`);
	if (!element) throw new Error(`No element found with id '${id}'`);
	element.classList.add("hidden");
}

function getImageType(image: string) {
	return image.split(";")[0].split(":")[1];
}

async function getArabicText(image: string) {
	const apiKey =
		"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";
	const url = "https://api.anthropic.com/v1/messages";
	const prompt = `Extract all Arabic text from the image, reading strictly from right to left. If the image contains multiple columns, interpret them in a right-to-left order as well, starting with the rightmost column and proceeding to the left. Provide only the extracted Arabic text in your response, without any additional comments or explanations. Ensure that the text flow and order accurately reflect the right-to-left reading direction of Arabic, both within each line and across columns.
After extracting the text, rearrange it into a coherent and valid news story format. Organize the information logically, placing the main headline at the beginning, followed by key details, and then supporting information. Ensure that the rearranged text reads as a proper news article while maintaining all the original content and meaning.`;
	const imageType = getImageType(image);
	const imageData = image.split(",")[1];
	console.log(imageType);
	const body = {
		model: "claude-3-5-sonnet-20240620",
		max_tokens: 8192,
		messages: [
			{
				role: "user",
				content: [
					{
						type: "image",
						source: {
							type: "base64",
							media_type: imageType,
							data: imageData,
						},
					},
					{ type: "text", text: prompt },
				],
			},
		],
	};
	const headers = {
		"Content-Type": "application/json",
		"anthropic-version": "2023-06-01",
		"anthropic-dangerous-direct-browser-access": "true",
		"x-api-key": apiKey,
	};
	const response = await fetch(url, {
		method: "POST",
		headers,
		body: JSON.stringify(body),
	});
	const data = await response.json();
	return data.content[0].text;
}

function handleFileChange(this: HTMLInputElement) {
	const file = this.files?.[0];
	if (!file) return;
	const reader = new FileReader();
	reader.onload = function (e) {
		const image = e.target?.result as string;
		startTranscribition(image);
		const previewImage = document.querySelector(
			"#previewImage"
		) as HTMLImageElement;
		if (previewImage) {
			previewImage.src = image;
		}
	};
	reader.readAsDataURL(file);
}

// Function to download the content of a <p> tag as a .txt file
function downloadText() {
	const textTag = document.getElementById("arabicText");
	if (!textTag) throw new Error("No element found with id 'arabicText'");
	if (!textTag.textContent) return;
	const blob = new Blob([textTag.innerText], { type: "text/plain" });
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = "ArabicText.txt";
	link.click();
	URL.revokeObjectURL(link.href);
}

const arabicText = document.querySelector("#arabicText");
if (!arabicText) throw new Error("No element found with id 'arabicText'");
arabicText.addEventListener("click", downloadText);

const imageInput = document.querySelector("#imageInput") as HTMLInputElement;
if (!imageInput) throw new Error("No input element found with id 'imageInput'");
imageInput.addEventListener("change", handleFileChange);
