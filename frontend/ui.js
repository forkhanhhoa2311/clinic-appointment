(() => {
  "use strict";

  const doc = document;
  const byId = id => doc.getElementById(id);

  const service = byId("service");
  const doctor = byId("doctor");
  const date = byId("appointment-date");
  const slots = byId("slots");

  const panels = [1, 2, 3].map(
    number => byId(`step-${number}`)
  );

  const money = value =>
    `${Number(value).toLocaleString("vi-VN")}đ`;

  const selectedOption = select =>
    select.selectedOptions[0];

  function createIcon(name) {
    const svg = doc.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );

    svg.setAttribute("aria-hidden", "true");

    const use = doc.createElementNS(
      svg.namespaceURI,
      "use"
    );

    use.setAttribute("href", `#i-${name}`);
    svg.appendChild(use);

    return svg;
  }

  function createElement(tag, className, text) {
    const element = doc.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text !== undefined) {
      element.textContent = text;
    }

    return element;
  }

  // Đọc dữ liệu đã được app.js tải về.
  // Không gọi thêm API.
  function getSelectedService() {
    if (typeof services === "undefined") {
      return undefined;
    }

    return services.find(
      item => String(item.id) === service.value
    );
  }

  function getSelectedDoctor() {
    if (typeof doctors === "undefined") {
      return undefined;
    }

    return doctors.find(
      item => String(item.id) === doctor.value
    );
  }

  function showSummary(id, value, placeholder) {
    const element = byId(id);

    element.textContent = value || placeholder;
    element.classList.toggle("placeholder", !value);
  }

  function updateSummary() {
    const selectedService = getSelectedService();
    const selectedDoctor = getSelectedDoctor();

    const serviceLabel = service.value
      ? selectedOption(service)?.textContent.split(" - ")[0]
      : "";

    const doctorLabel = doctor.value
      ? selectedOption(doctor)?.textContent.split(" - ")[0]
      : "";

    showSummary(
      "summary-service",
      selectedService?.name || serviceLabel,
      "Chưa chọn dịch vụ"
    );

    showSummary(
      "summary-doctor",
      selectedDoctor?.full_name || doctorLabel,
      "Chưa chọn bác sĩ"
    );

    const formattedDate = date.value
      ? date.value.split("-").reverse().join("/")
      : "";

    showSummary(
      "summary-date",
      formattedDate,
      "Chưa chọn ngày"
    );

    showSummary(
      "summary-time",
      slots.querySelector(".slot.selected")?.textContent,
      "Chưa chọn khung giờ"
    );

    byId("summary-price").textContent = selectedService
      ? money(selectedService.price)
      : "—";

    // Hiển thị thông tin bác sĩ đang chọn.
    byId("doctor-preview").hidden = !doctor.value;

    if (doctor.value) {
      const name =
        selectedDoctor?.full_name ||
        doctorLabel ||
        "";

      byId("doctor-name").textContent = name;

      byId("doctor-specialty").textContent =
        selectedDoctor?.specialty_name || "";

      byId("doctor-initials").textContent = name
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map(word => word[0])
        .join("")
        .toUpperCase();
    }

    // Đánh dấu thẻ dịch vụ đã chọn.
    doc.querySelectorAll(".service-card").forEach(card => {
      const selected =
        card.dataset.service === service.value;

      card.classList.toggle("selected", selected);

      card.setAttribute(
        "aria-pressed",
        String(selected)
      );
    });

    slots.querySelectorAll(".slot").forEach(button => {
      button.setAttribute(
        "aria-pressed",
        String(button.classList.contains("selected"))
      );
    });
  }

  function renderServices() {
    const container = byId("service-cards");
    container.replaceChildren();

    const records =
      typeof services !== "undefined" ? services : [];

    const options = [...service.options].filter(
      option => option.value
    );

    options.forEach(option => {
      const record = records.find(
        item => String(item.id) === option.value
      );

      const card = createElement(
        "button",
        "service-card"
      );

      card.type = "button";
      card.dataset.service = option.value;

      const symbol = createElement(
        "span",
        "service-symbol"
      );

      const serviceName =
        record?.name ||
        option.textContent.split(" - ")[0];

      symbol.appendChild(
        createIcon(
          /tim/i.test(serviceName) ? "heart" : "medical"
        )
      );

      const indicator = createElement(
        "span",
        "selection-dot"
      );

      indicator.appendChild(createIcon("check"));

      const title = createElement(
        "strong",
        "",
        serviceName
      );

      card.append(symbol, indicator, title);

      if (record?.description) {
        card.appendChild(
          createElement(
            "span",
            "service-description",
            record.description
          )
        );
      }

      const meta = createElement(
        "span",
        "service-meta"
      );

      if (record) {
        meta.append(
          createElement("b", "", money(record.price)),
          createElement(
            "small",
            "",
            `${record.duration_minutes} phút`
          )
        );
      }

      card.appendChild(meta);

      // Chọn thẻ tương đương chọn dropdown cũ.
      card.addEventListener("click", () => {
        service.value = option.value;

        service.dispatchEvent(
          new Event("change", { bubbles: true })
        );
      });

      container.appendChild(card);
    });

    updateSummary();
  }

  function canOpenStep(step) {
    byId("step-1-error").textContent = "";
    byId("step-2-error").textContent = "";

    if (step >= 2 && !service.value) {
      byId("step-1-error").textContent =
        "Vui lòng chọn một dịch vụ để tiếp tục.";

      return 1;
    }

    if (
      step >= 3 &&
      (
        !doctor.value ||
        !date.value ||
        !slots.querySelector(".slot.selected")
      )
    ) {
      byId("step-2-error").textContent =
        "Vui lòng chọn bác sĩ, ngày khám và một khung giờ còn trống.";

      return 2;
    }

    return step;
  }

  function openStep(target, scroll = true) {
    const step = canOpenStep(target);

    panels.forEach((panel, index) => {
      panel.hidden = index + 1 !== step;
    });

    doc.querySelectorAll(
      ".nav-link, .step-link"
    ).forEach(link => {
      const number = Number(link.dataset.step);

      link.classList.toggle("active", number === step);
      link.classList.toggle("done", number < step);

      if (number === step) {
        link.setAttribute("aria-current", "step");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    updateSummary();

    if (scroll) {
      panels[step - 1].scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      panels[step - 1]
        .querySelector("select, input")
        ?.focus({ preventScroll: true });
    }
  }

  doc.querySelectorAll("[data-step]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      openStep(Number(link.dataset.step));
    });
  });

  doc.querySelectorAll(
    "[data-next], [data-back]"
  ).forEach(button => {
    button.addEventListener("click", () => {
      openStep(
        Number(
          button.dataset.next || button.dataset.back
        )
      );
    });
  });

  service.addEventListener("change", () => {
    byId("step-1-error").textContent = "";
    updateSummary();
  });

  doctor.addEventListener("change", updateSummary);
  date.addEventListener("change", updateSummary);
  slots.addEventListener("click", updateSummary);

  // Khi app.js tải xong dữ liệu, cập nhật giao diện.
  new MutationObserver(renderServices).observe(
    service,
    { childList: true }
  );

  new MutationObserver(updateSummary).observe(
    doctor,
    { childList: true }
  );

  new MutationObserver(updateSummary).observe(
    slots,
    { childList: true }
  );

  new MutationObserver(() => {
    const confirmation = byId("confirmation");

    if (!confirmation.classList.contains("hidden")) {
      confirmation.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }).observe(
    byId("confirmation"),
    {
      attributes: true,
      attributeFilter: ["class"]
    }
  );

  renderServices();
  openStep(1, false);
})();
