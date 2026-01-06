// Element selectors
let logo = document.querySelectorAll(".logo") // logo images
let side_menu = document.querySelector("nav") // side nav
let side_menu_btn = document.querySelector(".burger") // burger button
let header = document.querySelector("header") // page header
let sections = document.querySelectorAll("section")
let footer = document.querySelector("footer")
let nav_ele = document.querySelectorAll("nav a") // nav links
let up_btn = document.querySelector(".to-up") // scroll to top button


// scroll to top
up_btn.addEventListener("click", () => {
    window.scrollTo(0, 0)
})

// Highlight active nav link on click
nav_ele.forEach(ele => {
    ele.addEventListener("click", () => {
        nav_ele.forEach(a => {
            a.classList.remove("active")
        })
        ele.classList.add("active")
        // Only toggle menu if it's open (mobile view)
        if (side_menu.classList.contains("max-lg:left-0")) {
            side_menu_toggle()
        }
    })
})

// open/close side menu (mobile)
side_menu_btn.addEventListener("click", side_menu_toggle)

function side_menu_toggle() {
    side_menu.classList.toggle("max-lg:-left-full")
    side_menu.classList.toggle("max-lg:left-0")
    footer.classList.toggle("blur-md")
    sections.forEach((section) => {
        section.classList.toggle("blur-md")
    })
}

// header style on scroll
function HeaderEffect() {
    if (window.pageYOffset > 10) {
        header.classList.add("backdrop-blur-sm", "shadow-md", "dark:bg-header-overlay")
    } else {
        header.classList.remove("backdrop-blur-sm", "shadow-md", "dark:bg-header-overlay")
    }
}

HeaderEffect()

window.addEventListener('scroll', HeaderEffect) // run on scroll