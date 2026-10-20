const profile = window.PROFILE;
const list = document.querySelector("#publication-list");
const search = document.querySelector("#paper-search");
let activeFilter = "selected";
let activeGroup = "first";
const roleTabs = document.querySelector("#role-tabs");

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function link(label, url, className) {
  const node = element("a", className, label);
  node.href = url;
  if (/^https:/.test(url)) {
    node.target = "_blank";
    node.rel = "noopener noreferrer";
  }
  return node;
}

document.querySelector("#profile-name").replaceChildren(
  document.createTextNode(`${profile.name} `),
  element("span", "", profile.nameChinese),
);
document.querySelector("#profile-name span").lang = "zh-CN";
document.querySelector("#affiliation").textContent = profile.affiliation;
document.querySelector("#introduction").textContent = profile.introduction;
document.querySelector("#research").textContent = profile.research;
document.querySelector("#updated").textContent = `Updated ${profile.updated}`;
document.querySelector("#copyright-year").textContent = new Date().getFullYear();
const profileLinks = document.querySelector("#profile-links");
profileLinks.append(link("Google Scholar", profile.scholar), link("GitHub", profile.github));
if (profile.email) profileLinks.append(link("Email", `mailto:${profile.email}`));
if (profile.cv) profileLinks.append(link("CV", profile.cv));
document.querySelector("#scholar-link").href = profile.scholar;
const portrait = document.querySelector("#portrait");
if (profile.photo) {
  const photo = element("img");
  photo.src = profile.photo;
  photo.alt = profile.name;
  photo.width = 158;
  photo.height = 158;
  portrait.append(photo, element("figcaption", "", profile.nameChinese));
} else {
  portrait.hidden = true;
}

for (const item of profile.news) {
  const row = element("li");
  const date = element("time", "", item.date);
  date.dateTime = item.date;
  row.append(date, element("span", "", item.text));
  document.querySelector("#news").append(row);
}
for (const award of profile.awards) {
  const row = element("li");
  const date = element("time", "", award.year);
  date.dateTime = award.year;
  const copy = element("div");
  copy.append(element("span", "award-title", award.title), element("span", "award-detail", award.detail));
  row.append(date, copy);
  document.querySelector("#awards-list").append(row);
}

function authorList(authors) {
  const fragment = document.createDocumentFragment();
  authors.forEach((author, index) => {
    if (index) fragment.append(document.createTextNode(", "));
    fragment.append(author === profile.name ? element("strong", "", author) : document.createTextNode(author));
  });
  return fragment;
}

function paperCard(paper) {
  const article = element("article", "publication");
  article.id = `paper-${paper.id}`;
  const visual = link("", paper.figureSource || paper.links.arXiv, "paper-visual");
  visual.setAttribute("aria-label", `${paper.short}: view figure in the paper`);
  if (paper.image) {
    const image = element("img");
    image.src = paper.image;
    image.alt = paper.imageAlt || `${paper.short} research overview`;
    image.loading = "lazy";
    image.width = 195;
    image.height = 138;
    visual.append(image);
  } else {
    const color = paper.topic === "Robotics" ? "robotics" : paper.topic === "3D Perception" ? "perception" : "";
    const cover = element("div", `paper-cover ${color}`);
    cover.append(element("strong", "", paper.short), element("span", "", `${paper.venue} · ${paper.year}`));
    visual.append(cover);
  }
  const body = element("div", "paper-body");
  const title = element("h3");
  title.append(link(paper.title, paper.links.Paper || paper.links.arXiv));
  const authors = element("div", "authors");
  authors.append(authorList(paper.authors.slice(0, 6)));
  if (paper.authors.length > 6) {
    authors.append(document.createTextNode(", et al. "));
    const details = element("details", "author-details");
    details.append(element("summary", "", `All ${paper.authors.length} authors`));
    const full = element("span", "full-authors");
    full.append(authorList(paper.authors));
    details.append(full);
    authors.append(details);
  }
  const venue = element("div", "venue-line");
  venue.append(element("span", "venue", `${paper.venue} ${paper.year}`));
  if (paper.status !== "Published") {
    const statusClass = paper.status === "Preprint" ? "preprint" : paper.status === "Conditional acceptance" ? "conditional" : "";
    venue.append(element("span", `status ${statusClass}`, paper.status));
  }
  venue.append(element("span", "role", paper.role));
  const links = element("div", "paper-links");
  for (const [label, url] of Object.entries(paper.links)) {
    links.append(link(label, url));
  }
  body.append(title, authors, venue, element("p", "description", paper.description), links);
  article.append(visual, body);
  return article;
}

function renderPublications() {
  const query = search.value.trim().toLowerCase();
  const papers = profile.publications.filter((paper) => {
    const matchesFilter = activeFilter === "selected"
        ? paper.selected && paper.group === activeGroup
        : paper.topic === activeFilter;
    const searchable = [paper.title, paper.short, paper.venue, paper.year, paper.role, ...paper.authors].join(" ").toLowerCase();
    return matchesFilter && (!query || searchable.includes(query));
  });
  roleTabs.hidden = activeFilter !== "selected";
  if (activeFilter === "selected") {
    list.setAttribute("role", "tabpanel");
    list.setAttribute("aria-labelledby", `tab-${activeGroup}`);
  } else {
    list.removeAttribute("role");
    list.removeAttribute("aria-labelledby");
  }
  list.replaceChildren(...papers.map(paperCard));
  if (!papers.length) {
    list.append(element("p", "empty-state", "No matching papers. Try another keyword or switch tabs."));
  }
  document.querySelector("#paper-count").textContent = `${papers.length} of ${profile.publications.length} featured publications`;
}
const contributionTabs = Array.from(roleTabs.querySelectorAll('[role="tab"]'));
function selectContribution(tab) {
  activeGroup = tab.dataset.group;
  for (const item of contributionTabs) {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
  }
  renderPublications();
}
for (const [index, tab] of contributionTabs.entries()) {
  const count = profile.publications.filter((paper) => paper.selected && paper.group === tab.dataset.group).length;
  tab.querySelector("span").textContent = count;
  tab.addEventListener("click", () => selectContribution(tab));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % contributionTabs.length;
    if (event.key === "ArrowLeft") next = (index + contributionTabs.length - 1) % contributionTabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = contributionTabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectContribution(contributionTabs[next]);
    contributionTabs[next].focus();
  });
}
for (const button of document.querySelectorAll(".filter")) {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    for (const item of document.querySelectorAll(".filter")) {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    }
    renderPublications();
  });
}
search.addEventListener("input", renderPublications);
renderPublications();
