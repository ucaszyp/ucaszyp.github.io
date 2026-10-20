const profile = window.PROFILE;
const list = document.querySelector("#publication-list");
const search = document.querySelector("#paper-search");
let activeFilter = "selected";

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
    const matchesFilter = activeFilter === "all"
      || (activeFilter === "selected" ? paper.selected : paper.topic === activeFilter);
    const searchable = [paper.title, paper.short, paper.venue, paper.year, paper.role, ...paper.authors].join(" ").toLowerCase();
    return matchesFilter && (!query || searchable.includes(query));
  });
  list.classList.toggle("role-columns", activeFilter === "selected");
  list.replaceChildren();
  if (activeFilter === "selected" && papers.length) {
    const groups = [
      { id: "first", title: "First author", chinese: "第一作者" },
      { id: "corresponding", title: "Corresponding author", chinese: "通讯作者" },
      { id: "lead", title: "Co-first / Project Leader", chinese: "共同一作 / 项目负责人" },
    ];
    for (const group of groups) {
      const members = papers.filter((paper) => paper.group === group.id);
      const column = element("section", "role-column");
      column.setAttribute("aria-label", group.title);
      const heading = element("div", "role-heading");
      heading.append(element("h3", "", group.title));
      heading.append(element("p", "", `${group.chinese} · ${members.length}`));
      column.append(heading, ...members.map(paperCard));
      if (!members.length) column.append(element("p", "empty-state", "No matching papers."));
      list.append(column);
    }
  } else {
    list.append(...papers.map(paperCard));
  }
  if (!papers.length) {
    list.append(element("p", "empty-state", "No matching papers. Try another keyword or select All papers."));
  }
  document.querySelector("#paper-count").textContent = `${papers.length} of ${profile.publications.length} featured publications`;
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
