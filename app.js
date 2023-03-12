// target element
const toggleBtn = document.querySelector(".toggle-btn");
const navCenter = document.querySelector(".nav-center");
const modalBacking = document.querySelector(".backing");
const modalSuccess = document.querySelector(".success");

// target btn of project presentation container
const projectPresentationBtns = getElement(
  ".project-presentation"
).querySelectorAll("button");

//  target btn offer section
const offerSectionBtns = getElement("#offer-section").querySelectorAll(".btn");

//  target form
const form = document.querySelector(".form-modal");
const radioBtns = document.querySelectorAll("input[type=radio]");
const offers = form.querySelectorAll(".form-selection");

// target text inputs in the form
const textInputs = form.querySelectorAll("input[type=text]");

// initial data
const data = {
  backed: 43000,
  backers: 2595,
  left: 13,
};

const leftPart = {
  bamboo: 43,
  "black-edition": 9,
  "special-edition": 1,
};

// copy of data object with value set to 0
// to get previousData from 0 when the page load
const dataClone = { ...data };
for (let property in dataClone) {
  dataClone[property] = 0;
}

// get element functionnality
function getElement(selection) {
  const element = document.querySelector(selection);
  if (element) {
    return element;
  }
  throw new Error(
    `Please check "${selection}" selector, no such element exists`
  );
}

// when the page load
window.addEventListener("DOMContentLoaded", function () {
  displayData(
    getStorageItem("data") ? getStorageItem("data") : data,
    getStorageItem("leftPart") ? getStorageItem("leftPart") : leftPart,
    getStorageItem("previousData") ? getStorageItem("previousData") : dataClone
  );
});

// display navlinks
toggleBtn.addEventListener("click", () => {
  navCenter.classList.toggle("active");
});

// listening to buttons of project presentation
projectPresentationBtns.forEach((btn) => {
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    // back this project btn
    if (e.currentTarget.id === "backing-btn") {
      displayModal();
      return;
    }
    // bookmark btn
    if (
      e.currentTarget.id === "bookmark-btn" &&
      !e.currentTarget.classList.contains("bookmarked")
    ) {
      e.currentTarget.classList.add("bookmarked");
      e.currentTarget.children[1].textContent = "Bookmarked";
    } else {
      e.currentTarget.classList.remove("bookmarked");
      e.currentTarget.children[1].textContent = "Bookmark";
    }
  });
});

// listening to buttons of offer section
offerSectionBtns.forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const card = e.target.parentElement.parentElement;
    const cardId = card.dataset.id;
    displayModal(cardId);
  });
});

// display modal backing option
function displayModal(id) {
  modalBacking.classList.add("active");

  // close modal
  const closeBtn = getElement("#backing-section").querySelector(".close-modal");
  closeBtn.addEventListener("click", () => {
    closeModal();
  });

  // select card
  selectCard(id);

  // target first card displayed in the form to scroll to if id is not falsy value
  if (id) {
    const firstDisplayed = form.querySelector(`[data-id=${id}]`);

    window.scrollTo({ top: firstDisplayed.offsetTop, behavior: "smooth" });
  }
}

// listening to form submit when card is selected
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const cardSelected = form.querySelector(".selected");
  const inputTextSelected = cardSelected.querySelector("input[type=text]");
  // get min input value from placeholder
  const minValue = inputTextSelected.placeholder;
  // return value if ok, or false if value isn't ok
  if (checkBeforeSubmit(inputTextSelected, minValue, cardSelected.dataset.id)) {
    // remove offer modal
    closeModal();

    // display success modal
    displaySuccessModal();

    // setup the data if data form is valid
    setupData(
      inputTextSelected.value,
      getStorageItem("data") ? getStorageItem("data") : data,
      getStorageItem("leftPart") ? getStorageItem("leftPart") : leftPart,
      cardSelected.dataset.id
    );
  }
});

// card selected modal functionnality
function selectCard(pickedOfferId) {
  offers.forEach((offer) => {
    // remove all previous selected classes
    offer.classList.remove("selected");
    // uncheck the radio btn
    offer.children[0].children[0].checked = false;
    // add selected class on the picked offer from the main page
    if (offer.dataset.id === pickedOfferId) {
      offer.classList.add("selected");
      // check the radio btn
      offer.children[0].children[0].checked = true;
    }
  });

  // remove selected class on current card when an another card is clicked
  radioBtns.forEach((radioBtn) => {
    radioBtn.addEventListener("change", (e) => {
      const checkedCard = e.target.parentElement.parentElement;

      offers.forEach((offer) => {
        if (offer !== checkedCard) {
          offer.classList.remove("selected");
        }
      });
      // add selected card on the current clicked card
      checkedCard.classList.add("selected");
      // change picked offer to current selected card
      pickedOfferId = checkedCard.dataset.id;
    });
  });
}

// close modal backing functionnality
function closeModal() {
  modalBacking.classList.remove("active");
}

// get input value
function getInputValue() {
  textInputs.forEach((textInput) => {
    textInput.addEventListener("input", () => {
      textInput.value = checkInputFormat(textInput.value);
    });
  });
}

getInputValue();

// check input format
function checkInputFormat(value) {
  // max input value = 5 digits and first digit can't be 0
  const regFormat = /^[1-9][0-9]{0,4}$/;
  if (regFormat.test(value)) {
    return value;
  }
  return value.replaceAll(value, "");
}

// check input value before submit
function checkBeforeSubmit(inputSelected, minValue, cardId) {
  // target pledge sibling
  const pledgeText =
    inputSelected.parentElement.parentElement.previousElementSibling;

  // convert string to number
  const value = parseInt(inputSelected.value);
  minValue = parseInt(minValue);

  // check if empty
  const isEmpty = !value ? true : false;

  // check if input amount is more than pledge amount
  const isMoreThanPledge = value >= minValue ? true : false;

  // check if is no reward card
  // isNoRewardPledge can be not needed
  // const isNoRewardPledge = cardId === "no-reward" ? true : false;

  // return value if value isn't empty and more than placeholder value
  if (!isEmpty && isMoreThanPledge) {
    return value;
  }

  if (isEmpty) {
    displayError("can't be blank", "Enter your pledge", pledgeText, null);
  } else if (!isMoreThanPledge) {
    displayError(
      "must be more than",
      "Enter your pledge",
      pledgeText,
      minValue
    );
  }

  return false;
}

// display error with time out
function displayError(errorMessage, message, element, condition) {
  element.textContent = `${
    condition ? `${errorMessage} $${condition}` : errorMessage
  }`;
  element.classList.add("error");
  setTimeout(() => {
    element.classList.remove("error");
    element.textContent = `${message}`;
  }, 2000);
}

// display success modal
function displaySuccessModal() {
  const successModal = document.querySelector(".success");
  // display success
  successModal.classList.add("completed");

  // add event listener on modal to remove modal
  successModal.querySelector(".btn").addEventListener("click", () => {
    successModal.classList.remove("completed");
  });
}

// get data & update data
function setupData(pledge, currentData, currentLeftPart, ID) {
  // copy data to previous data object before modification
  setStorageItem("previousData", currentData);

  // convert string to number
  pledge = parseInt(pledge);

  currentData.backed += pledge;
  currentData.backers += 1;

  // decrement left part for the picked offer if amount > 0
  if (currentLeftPart[ID] > 0) {
    currentLeftPart[ID]--;
  }
  // updatde data in the local storage
  setStorageItem("data", currentData);
  setStorageItem("leftPart", currentLeftPart);

  displayData(currentData, currentLeftPart, getStorageItem("previousData"));
}

// display data
function displayData(currentData, currentLeftPart, prevData) {
  // targeting element
  const backedDOM = document.querySelector(".backed");
  const backersDOM = document.querySelector(".total-backers");
  const dayLeftDOM = document.querySelector(".day-left");
  const progressBarValueDOM = document.querySelector(".progress-bar-value");
  const leftPartDOM = document.querySelectorAll(".offer-remind");

  // calculate width progress bar
  const initialProgressValue = prevData.backed
    ? (prevData.backed * 100) / 100000
    : 0;
  const progressValue = (currentData.backed * 100) / 100000;

  // displaying element
  updateCount(
    currentData.backed,
    backedDOM,
    "<span>of $100,000 backed</span>",
    prevData.backed
  );
  updateCount(
    currentData.backers,
    backersDOM,
    "<span>total backers</span>",
    prevData.backers
  );
  updateCount(
    currentData.left,
    dayLeftDOM,
    "<span>days left</span>",
    prevData.left
  );
  updateBar(progressValue, progressBarValueDOM, initialProgressValue);

  // get parent dataset ID & display left part
  leftPartDOM.forEach((item) => {
    const parent = item.closest("article");
    const parentID = parent.getAttribute("data-id");
    item.innerHTML = `${currentLeftPart[parentID]}<span>left</span>`;

    // change "select reward" to "out of stock" btn if left part === 0
    if (
      item.nextElementSibling.classList.contains("btn") &&
      currentLeftPart[parentID] === 0
    ) {
      item.nextElementSibling.textContent = "Out of stock";
    }
    // set "out" class on the card if left part === 0
    if (currentLeftPart[parentID] === 0) {
      parent.classList.add("out");
    } else {
      parent.classList.remove("out");
    }
  });
}

// add comma every 3 digits
function formatDisplayedValue(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// increase count animation
function updateCount(value, el, text, initialValue) {
  const isBackedDOM = el.classList.contains("backed");
  const increment = Math.ceil((value - initialValue) / 1000);

  const increaseCount = setInterval(() => {
    initialValue += increment;
    if (initialValue > value) {
      el.innerHTML = `${isBackedDOM ? "$" : ""}${formatDisplayedValue(
        value
      )} ${text}`;
      clearInterval(increaseCount);
      return;
    }
    el.innerHTML = `${isBackedDOM ? "$" : ""}${formatDisplayedValue(
      initialValue
    )} ${text}`;
  }, 1);
}

// increase progress bar
function updateBar(value, el, initialValue) {
  const increment = (value - initialValue) / 1000;

  const increaseBar = setInterval(() => {
    initialValue += increment;
    if (initialValue > value) {
      el.style.width = `${value <= 100 ? value : 100}%`;
      clearInterval(increaseBar);
      return;
    }
    el.style.width = `${initialValue <= 100 ? initialValue : 100}%`;
  }, 1);
}

// set local storage
function setStorageItem(name, item) {
  localStorage.setItem(name, JSON.stringify(item));
}

// get local storage
function getStorageItem(item) {
  let storageItem = localStorage.getItem(item);
  if (storageItem) {
    storageItem = JSON.parse(localStorage.getItem(item));
  }
  return storageItem;
}
