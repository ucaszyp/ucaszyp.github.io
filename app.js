(() => {
  "use strict";

  const profile = window.PROFILE;
  if (!profile) {
    return;
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text) {
      node.textContent = text;
    }
    return node;
  }

  function safeUrl(value) {
    if (!value) {
      return "";
    }
    try {
      const url = new URL(value, document.baseURI);
      return ["http:", "https:", "mailto:", "file:"].includes(url.protocol)
        ? url.href
        : "";
    } catch {
      return "";
    }
  }

  function addLink(container, label, url) {
    const href = safeUrl(url);
    if (!href) {
      return;
    }
    const link = element("a", "", label);
    link.href = href;
    const arrow = element("span", "", "↗");
    arrow.setAttribute("aria-hidden", "true");
    link.append(arrow);
    container.append(link);
  }

  function fill(id, text) {
    const node = document.getElementById(id);
    node.textContent = text || "";
    node.hidden = !text;
  }

  document.title = `${profile.name} · Personal Homepage`;
  document.querySelector('meta[name="description"]').content =
    `${profile.name} · ${profile.introduction}`;
  document.querySelectorAll("[data-name]").forEach((node) => {
    node.textContent = profile.name;
  });
  const heading = document.getElementById("hero-name");
  heading.replaceChildren(document.createTextNode(profile.name), element("span", "accent", "."));
  fill("name-chinese", profile.nameChinese);
  fill("tagline", profile.tagline);
  fill("affiliation", profile.affiliation);
  fill("introduction", profile.introduction);
  fill("contact-text", profile.contactText);
  fill("year", String(new Date().getFullYear()));
  fill("monogram", `${Array.from(profile.name)[0]?.toUpperCase() || "U"}.`);

  if (profile.photo && safeUrl(profile.photo)) {
    const image = element("img");
    image.alt = `${profile.name} 的照片`;
    image.src = safeUrl(profile.photo);
    image.addEventListener("error", () => image.remove());
    document.getElementById("portrait").append(image);
  }

  for (const id of ["profile-links", "contact-links"]) {
    const container = document.getElementById(id);
    if (profile.email) {
      addLink(container, "Email", `mailto:${profile.email}`);
    }
    addLink(container, "GitHub", profile.github);
    addLink(container, "Google Scholar", profile.scholar);
    if (id === "profile-links") {
      addLink(container, "Curriculum Vitae", profile.cv);
    }
  }

  for (const paragraph of profile.about || []) {
    document.getElementById("about-text").append(element("p", "", paragraph));
  }
  for (const interest of profile.interests || []) {
    document.getElementById("interests").append(element("span", "tag", interest));
  }

  for (const [index, project] of (profile.projects || []).entries()) {
    const href = safeUrl(project.url);
    const card = element(href ? "a" : "article", "project");
    if (href) {
      card.href = href;
    }
    card.append(element("span", "project-number", String(index + 1).padStart(2, "0")));
    const body = element("div");
    body.append(
      element("span", "category", project.category),
      element("h3", "", project.name),
      element("p", "", project.description),
    );
    card.append(body);
    if (href) {
      const arrow = element("span", "project-arrow", "↗");
      arrow.setAttribute("aria-hidden", "true");
      card.append(arrow);
    }
    document.getElementById("project-list").append(card);
  }

  if (profile.publications?.length) {
    const papers = document.getElementById("papers");
    papers.replaceChildren();
    for (const paper of profile.publications) {
      const item = element("article", "publication");
      item.append(
        element("p", "venue", paper.venue),
        element("h3", "", paper.title),
        element("p", "", paper.authors),
        element("p", "", paper.description),
      );
      const links = element("div", "profile-links");
      for (const link of paper.links || []) {
        addLink(links, link.label, link.url);
      }
      item.append(links);
      papers.append(item);
    }
  }

  if (profile.news?.length) {
    document.getElementById("news-section").hidden = false;
    for (const news of profile.news) {
      const item = element("div", "news-item");
      item.append(element("time", "", news.date), element("p", "", news.text));
      document.getElementById("news").append(item);
    }
  }

  if (profile.experience?.length) {
    document.getElementById("experience-section").hidden = false;
    for (const entry of profile.experience) {
      const item = element("article", "experience-item");
      item.append(
        element("span", "period", entry.period),
        element("h3", "", entry.role),
        element("p", "", entry.institution),
        element("p", "", entry.description),
      );
      document.getElementById("experience").append(item);
    }
  }
})();
