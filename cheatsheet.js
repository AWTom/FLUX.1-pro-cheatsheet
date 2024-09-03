async function loadData(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Error: ${response.status}`);
		}

		return await response.json();
	} catch (e) {
		document.getElementById("loading").appendChild(document.createTextNode(` Error loading data file: ${e}`));
		console.error(e);
	}
}

const promptPrefix = "Style of ";
const fluxProArtUrlPrefix = "https://fluxpro.art/prompts/";
// rows of images per sprite sheet image
const ssd = 32;
// pixel height and width of sprite images
const sw = 128;

loadData("/artistData.json").then(artistNamesLinks => {
	let numArtists = artistNamesLinks.length;
	let fileNames = [];
	const table = document.createElement("div");
	table.className = "table";
	table.innerHTML = artistNamesLinks.map((item, i) => {
		const name = item[0];
		const link = item[1];
		fileNames[i] = name.replaceAll(" ", "").replaceAll(".", "");
		//const imgTags = ["0", "1", "2", "3"].map(i => `<img src="https://strea.ly/cdn-cgi/image/w=128,h=128/${fileName}${i}.webp">`).join("");
		const currentSpriteSheet = String(Math.floor(i / ssd)).padStart(2, "0")
		const imgTags = [0, 1, 2, 3].map(j => `<div class="img-container" style="background-image: url('https://strea.ly/Styleof-${currentSpriteSheet}.webp');background-position: ${j/3*100}% ${i%ssd/(ssd-1)*100}%;"><img></img></div>`).join("");
		return `<div id="${i}" class="row"><div class="row-info">Style of ${name}</div><div class="row-toolbar">Style of ${name}<span class="row-icons"><i class="copy" title="Copy to clipboard"><a href="https://fluxpro.art/prompts/${link}" target="_blank" rel="noopener noreferrer" title="See original generation on fluxpro.art"></i><i class="fluxproart"></i></a><a href="https://fluxpro.art/prompts?q=${name}" target="_blank" rel="noopener noreferrer" title="Search for images generated using ${name} on fluxpro.art"><i class="search"></i></a><i class="minimize"></i></span></div>${imgTags}</div>`
	}).join("");

	let checkedId = -1;
	// Click on unexpanded row: expand row
	// Click on expanded row image: expand image
	// Click on expanded row minimize icon: minimize row
	table.addEventListener("click", event => {
		if (event.target === table) {
			return;
		}
		const row = event.target.closest(".row");
		const tag = event.target.tagName;

		if (row) {
			if (!row.classList.contains("row-expanded") && (event.target.classList.contains("img-container") || tag === "IMG")) {
				// Maximize row
				row.classList.add("row-expanded");

				// Load larger images
				Array.from(row.children).splice(-4).forEach((e, i) => {
					const img = e.children[0];
					if (e.classList.contains("loading") || img.classList.contains("loaded")) {
						return;
					}
					e.classList.add("loading");
					img.setAttribute("src", `https://strea.ly/Styleof${fileNames[row.id]}${i}.webp`);
				});
			} else if (tag === "IMG") {
				// Expand this image
				console.log(event.target);
			} else if (tag === "I" && event.target.classList.contains("copy")) {
				document.getElementById(checkedId)?.querySelector(".check")?.classList.remove("check");
				navigator.clipboard.writeText(row.children[1].innerText);
				event.target.classList.add("check");
				checkedId = row.id;
			} else if (tag === "I" && event.target.classList.contains("minimize")) {
				row.classList.remove("row-expanded");
			}
		}
	});

	// TODO check if this has a performance penalty on page load
	// TODO remove loading if loading failed
	table.addEventListener("load", event => {
		const e = event.target;
		if (e.tagName === "IMG") {
			e.parentElement.classList.remove("loading");
			e.classList.add("loaded");
		}
	}, true);

	document.getElementById("numArtists").innerText = numArtists;
	document.body.appendChild(table);

	document.getElementById("loading").remove();
});

// TODO: save favorites, add views, links, settings, generation request
